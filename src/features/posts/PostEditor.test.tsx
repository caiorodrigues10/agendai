import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { PostEditor, type PostEditorProps } from './PostEditor';
import { PostPreviewBox } from './PostPreviewBox';
import { TemplateThumbnail } from './TemplateThumbnail';
import { postsApi, type PostMedia } from '../../infra/postsApi';
import { optimizeImageIfNeeded } from './optimizeImage';

vi.mock('../../infra/postsApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/postsApi')>();
  return {
    ...actual,
    postsApi: {
      ...actual.postsApi,
      templates: vi.fn(),
      preview: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      publish: vi.fn(),
      uploadMedia: vi.fn(),
      deleteMedia: vi.fn(),
      listMedia: vi.fn(),
    },
  };
});

vi.mock('./optimizeImage', async importOriginal => {
  const actual = await importOriginal<typeof import('./optimizeImage')>();
  // Por padrão é identidade (comportamento original); testes específicos
  // sobrescrevem para simular a otimização de fotos grandes.
  return { ...actual, optimizeImageIfNeeded: vi.fn(async (f: File) => f) };
});

const mockedPostsApi = vi.mocked(postsApi);
const mockedOptimize = vi.mocked(optimizeImageIfNeeded);

const TEMPLATES = [
  { key: 'agenda-aberta', name: 'Agenda aberta', description: 'Divulgue horários', requiredMedia: 0, formats: ['square'], previewUrl: '/api/posts/preview?x=1', group: 'agenda', photoMode: 'none' as const },
  { key: 'editorial-foto', name: 'Editorial foto', description: 'Editorial com imagem', requiredMedia: 0, formats: ['square', 'portrait'], previewUrl: '/api/posts/preview?x=2', group: 'editorial', photoMode: 'optional' as const, stockImageKey: 'salon' },
  { key: 'tipografico', name: 'Tipográfico', description: 'Só texto', requiredMedia: 0, formats: ['square'], previewUrl: '/api/posts/preview?x=3', group: 'tipografia', photoMode: 'optional' as const, stockImageKey: null },
  { key: 'antes-depois', name: 'Antes e depois', description: 'Resultado real', requiredMedia: 2, formats: ['square'], previewUrl: '/api/posts/preview?x=4', group: 'resultados', photoMode: 'required' as const },
];

function renderEditor(overrides: Partial<Parameters<typeof PostEditor>[0]> = {}) {
  const props: Parameters<typeof PostEditor>[0] = {
    post: null,
    barbershopId: 'barber1',
    userId: 'user1',
    palettes: [{ key: 'brand', label: 'Marca' }],
    mediaLibrary: [],
    onClose: vi.fn(),
    onSaved: vi.fn(),
    showToast: vi.fn(),
    onMediaUploaded: vi.fn(),
    ...overrides,
  };
  render(<PostEditor {...props} />);
  return props;
}

/** Abre o editor pulando a tela de objetivo. */
async function openEditor(overrides: Parameters<typeof renderEditor>[0] = {}) {
  const props = renderEditor(overrides);
  fireEvent.click(await screen.findByText('Divulgar serviço'));
  return props;
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mockedPostsApi.templates.mockResolvedValue(TEMPLATES as any);
  mockedPostsApi.preview.mockResolvedValue('https://cdn.example.com/preview.png');
});

describe('PostEditor — catálogo de modelos', () => {
  it('carrega modelos exclusivamente via postsApi.templates e mostra cards no picker', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
    expect(await screen.findByText('Editorial foto')).toBeInTheDocument();
    expect(screen.getByText('Tipográfico')).toBeInTheDocument();
    expect(mockedPostsApi.templates).toHaveBeenCalledTimes(1);
    // badges de photoMode
    expect(screen.getAllByText('Sem foto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Foto opcional').length).toBeGreaterThan(0);
    expect(screen.getByText('Requer 2 foto(s)')).toBeInTheDocument();
  });

  it('filtra Todos / Com foto / Sem foto', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
    await screen.findByText('Editorial foto');

    fireEvent.click(screen.getByRole('button', { name: 'Sem foto' }));
    expect(screen.getByText('Agenda aberta')).toBeInTheDocument();
    expect(screen.queryByText('Editorial foto')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Com foto' }));
    expect(screen.getByText('Editorial foto')).toBeInTheDocument();
    expect(screen.getByText('Antes e depois')).toBeInTheDocument();
    expect(screen.queryByText('Agenda aberta')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(screen.getByText('Agenda aberta')).toBeInTheDocument();
  });
});

describe('PostEditor — photoMode', () => {
  it('modelo sem foto não exige upload e esconde slots', async () => {
    await openEditor(); // objetivo "Divulgar serviço" → servico-destaque? usa agenda-aberta default via draft limpo -> templateKey da objective
    // Seleciona template sem foto
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|serviço em destaque|agenda aberta/i }));
    fireEvent.click(await screen.findByText('Agenda aberta'));
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    expect(screen.getByText(/não usa foto/i)).toBeInTheDocument();
    expect(screen.queryByText('Foto principal')).not.toBeInTheDocument();
  });

  it('optional com stockImageKey avisa que imagem ilustrativa não representa o salão', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|serviço em destaque|agenda aberta/i }));
    fireEvent.click(await screen.findByText('Editorial foto'));
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    expect(screen.getByText(/não representa resultados do seu salão/i)).toBeInTheDocument();
  });

  it('optional sem stockImageKey explica tipografia sem foto', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|serviço em destaque|agenda aberta/i }));
    fireEvent.click(await screen.findByText('Tipográfico'));
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    expect(screen.getByText(/funciona com tipografia, sem foto/i)).toBeInTheDocument();
    expect(screen.queryByText(/imagem ilustrativa gerada automaticamente/i)).not.toBeInTheDocument();
  });
});

describe('PostEditor — draft', () => {
  it('restaura rascunho salvo antes do efeito de persistência', async () => {
    localStorage.setItem(
      'agendai:post-draft:user1:barber1:new',
      JSON.stringify({
        version: 2,
        savedAt: Date.now(),
        objectiveId: 'fill-slots',
        templateKey: 'tipografico',
        paletteKey: 'brand',
        format: 'story',
        postMode: 'queue',
        type: 'announcement',
        title: 'Rascunho salvo',
        ctaText: 'Agendar',
        content: 'Legenda do rascunho',
        // legado de versão anterior com vídeo: o campo é ignorado ao restaurar
        videoUrl: 'https://cdn.example.com/old.mp4',
        primaryMediaId: null,
        secondaryMediaId: null,
      })
    );
    renderEditor();
    // gate de objetivo deve ser pulado (draft tem objectiveId)
    const titleInput = await screen.findByLabelText('Título') as HTMLInputElement;
    expect(titleInput.value).toBe('Rascunho salvo');
    // efeito de persistência não deve ter sobrescrito o draft com defaults
    const persisted = JSON.parse(localStorage.getItem('agendai:post-draft:user1:barber1:new')!);
    expect(persisted.title).toBe('Rascunho salvo');
    expect(persisted.content).toBe('Legenda do rascunho');
    expect(persisted.format).toBe('story');
    // drafts novos não persistem mais vídeo
    expect(persisted.videoUrl).toBeUndefined();
  });
});

describe('PostEditor — CTA segmentado', () => {
  it('permite mudar o destino por teclado e mantém apenas um radio na ordem de Tab', async () => {
    await openEditor();
    const selected = screen.getByRole('radio', { name: 'Fila e Agenda' });
    fireEvent.keyDown(selected, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: 'Fila' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Fila' })).toHaveAttribute('tabindex', '0');
    expect(selected).toHaveAttribute('tabindex', '-1');
  });
  it('usa radiogroup acessível em vez de select nativo', async () => {
    await openEditor();
    const group = screen.getByRole('radiogroup', { name: 'Destino do CTA' });
    const fila = screen.getByRole('radio', { name: 'Fila' });
    expect(group).toContainElement(fila);
    fireEvent.click(fila);
    expect(fila).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByRole('combobox', { name: 'Destino do CTA' })).not.toBeInTheDocument();
  });
});

describe('PostEditor — publicação e modal', () => {
  it('oferece acesso à prévia também no celular', async () => {
    await openEditor();
    const toggle = screen.getByText('Ver prévia do post');
    expect(toggle.closest('details')).toHaveClass('lg:hidden');
    expect(toggle.tagName).toBe('SUMMARY');
  });

  it('não oferece agendamento: apenas Rascunho e Publicar', async () => {
    await openEditor();
    expect(screen.queryByRole('button', { name: 'Agendar publicação' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Data e horário da publicação')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agendar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rascunho' })).toBeInTheDocument();
  });

  it('exige fotos reais do modelo de resultados antes de publicar', async () => {
    const props = await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
    fireEvent.click(await screen.findByText('Antes e depois'));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(mockedPostsApi.create).not.toHaveBeenCalled();
    expect(props.showToast).toHaveBeenCalledWith(expect.stringMatching(/fotos exigidas/), 'error');
  });

  it('bloqueia a rolagem da página e fecha primeiro o seletor ao pressionar Escape', async () => {
    const previous = document.body.style.overflow;
    const props = await openEditor();
    expect(screen.getByRole('dialog', { name: 'Editor de publicação' })).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
    await screen.findByText('Escolher modelo');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Escolher modelo')).not.toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(previous).not.toBeUndefined();
  });
});

describe('TemplateThumbnail', () => {
  it('carrega imageUrl via postsApi.preview apenas quando visível', async () => {
    class IO {
      cb: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) { this.cb = cb; }
      observe(el: Element) { this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as any); }
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    }
    vi.stubGlobal('IntersectionObserver', IO);

    render(
      <TemplateThumbnail barbershopId="barber1" templateKey="editorial-foto" format="square" paletteKey="brand" alt="Prévia" />
    );
    await waitFor(() => expect(mockedPostsApi.preview).toHaveBeenCalledWith(
      'barber1',
      expect.objectContaining({ templateKey: 'editorial-foto', format: 'square', paletteKey: 'brand' })
    ));
    const img = await screen.findByAltText('Prévia');
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/preview.png');
  });

  it('exibe retry quando a prévia falha', async () => {
    class IO {
      cb: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) { this.cb = cb; }
      observe(el: Element) { this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as any); }
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    }
    vi.stubGlobal('IntersectionObserver', IO);
    mockedPostsApi.preview.mockRejectedValueOnce(new Error('falha'));

    render(
      <TemplateThumbnail barbershopId="barber1" templateKey="x" format="square" paletteKey="brand" alt="Prévia" />
    );
    const retry = await screen.findByRole('button', { name: /tentar carregar prévia novamente/i });
    mockedPostsApi.preview.mockResolvedValueOnce('https://cdn.example.com/ok.png');
    fireEvent.click(retry);
    await waitFor(() => expect(screen.getByAltText('Prévia')).toHaveAttribute('src', 'https://cdn.example.com/ok.png'));
  });
});

describe('PostPreviewBox — formato', () => {
  it('preserva aspect ratio 9:16 via maxWidth proporcional', () => {
    const { container } = render(<PostPreviewBox format="story" previewUrl={null} />);
    const box = container.firstChild as HTMLElement;
    expect(box).toHaveClass('aspect-[9/16]');
    expect(box.style.maxWidth).toBe('303.75px');
    expect(box.style.maxHeight).toBe('540px');
  });

  it('usa object-contain na imagem de prévia', () => {
    render(<PostPreviewBox format="portrait" previewUrl="https://cdn.example.com/p.png" />);
    expect(screen.getByAltText('Prévia do post')).toHaveClass('object-contain');
  });
});

describe('PostEditor — sem upload de vídeo', () => {
  it('aba Imagem não oferece envio de vídeo', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    expect(screen.queryByText(/vídeo/i)).not.toBeInTheDocument();
    expect(document.querySelector('input[type="file"][accept*="video"]')).toBeNull();
  });

  it('editar post antigo com vídeo não envia videoUrl no update (preserva o dado)', async () => {
    mockedPostsApi.update.mockResolvedValue({ id: 'post1' } as any);
    const props = renderEditor({
      post: {
        id: 'post1',
        status: 'published',
        videoUrl: 'https://cdn.example.com/old.mp4',
        templateKey: 'agenda-aberta',
        paletteKey: 'brand',
        format: 'square',
        postMode: 'both',
        type: 'announcement',
        title: 'Com vídeo antigo',
        ctaText: '',
        content: '',
      } as any,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Rascunho' }));
    await waitFor(() =>
      expect(mockedPostsApi.update).toHaveBeenCalledWith(
        'post1',
        expect.not.objectContaining({ videoUrl: expect.anything() })
      )
    );
    expect(props.onSaved).toHaveBeenCalledWith('draft');
  });
});

// ─── Biblioteca de fotos (aba Imagem) ───────────────────────────

const MEDIA_A: PostMedia = { id: 'media-a', url: 'https://cdn.example.com/a.png', mimeType: 'image/png', size: 1000, createdAt: '2026-10-01T12:00:00.000Z' };
const MEDIA_B: PostMedia = { id: 'media-b', url: 'https://cdn.example.com/b.png', mimeType: 'image/png', size: 1000, createdAt: '2026-10-02T12:00:00.000Z' };

function pngFile(name = 'foto.png', bytes = 16) {
  return new File([new Uint8Array(bytes)], name, { type: 'image/png' });
}

/** Abre o editor já na aba Imagem com o template "Editorial foto" (photoMode optional). */
async function openImageTab(overrides: Partial<Parameters<typeof PostEditor>[0]> = {}) {
  const props = await openEditor(overrides);
  fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
  fireEvent.click(await screen.findByText('Editorial foto'));
  fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
  return props;
}

function imageInput() {
  return document.querySelector('input[type="file"][accept*="image/jpeg"]') as HTMLInputElement;
}

/**
 * Espelha o PostsManager: a biblioteca vive em estado e responde a
 * onMediaUploaded/onMediaRemoved (sem isso o efeito de reconciliação limpa o
 * id recém-enviado, já que a prop ficaria defasada).
 */
function MediaHarness({ initial, editorProps }: { initial: PostMedia[]; editorProps: Omit<PostEditorProps, 'mediaLibrary' | 'onMediaUploaded' | 'onMediaRemoved'> }) {
  const [lib, setLib] = useState<PostMedia[]>(initial);
  return (
    <PostEditor
      {...editorProps}
      mediaLibrary={lib}
      onMediaUploaded={m => setLib(prev => [m, ...prev])}
      onMediaRemoved={id => setLib(prev => prev.filter(x => x.id !== id))}
    />
  );
}

function renderHarness(initial: PostMedia[], overrides: Partial<PostEditorProps> = {}) {
  const props: Omit<PostEditorProps, 'mediaLibrary' | 'onMediaUploaded' | 'onMediaRemoved'> = {
    post: null,
    barbershopId: 'barber1',
    userId: 'user1',
    palettes: [{ key: 'brand', label: 'Marca' }],
    onClose: vi.fn(),
    onSaved: vi.fn(),
    showToast: vi.fn(),
    ...overrides,
  } as any;
  render(<MediaHarness initial={initial} editorProps={props} />);
  return props;
}

async function openHarnessImageTab(initial: PostMedia[], overrides: Partial<PostEditorProps> = {}) {
  const props = renderHarness(initial, overrides);
  fireEvent.click(await screen.findByText('Divulgar serviço'));
  fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
  fireEvent.click(await screen.findByText('Editorial foto'));
  fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
  return props;
}

describe('PostEditor — biblioteca de fotos', () => {
  it('limpa id órfão do rascunho e avisa quando a foto não está na biblioteca', async () => {
    localStorage.setItem(
      'agendai:post-draft:user1:barber1:new',
      JSON.stringify({
        version: 2,
        savedAt: Date.now(),
        objectiveId: 'fill-slots',
        templateKey: 'editorial-foto',
        paletteKey: 'brand',
        format: 'square',
        postMode: 'both',
        type: 'haircut',
        title: 'Com foto morta',
        ctaText: '',
        content: '',
        primaryMediaId: 'ghost-id',
        secondaryMediaId: null,
      })
    );
    // draft tem objectiveId → o gate de objetivo é pulado; não usar openImageTab.
    const props = renderEditor();
    fireEvent.click(await screen.findByRole('button', { name: 'Imagem' }));
    await waitFor(() =>
      expect(props.showToast).toHaveBeenCalledWith(
        expect.stringMatching(/não está mais disponível/),
        'error'
      )
    );
    expect(screen.getByRole('button', { name: 'Foto principal' })).toBeInTheDocument();
  });

  it('mostra estado vazio acionável no picker quando não há fotos', async () => {
    await openImageTab();
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    expect(await screen.findByText(/envie a primeira foto do seu salão/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^enviar foto$/i })).toBeInTheDocument();
    expect(screen.queryByText(/nenhuma foto na biblioteca/i)).not.toBeInTheDocument();
  });

  it('exibe diálogo acessível com role/aria-modal e fecha ao clicar no fundo', async () => {
    await openImageTab({ mediaLibrary: [MEDIA_A] });
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    const dialog = await screen.findByRole('dialog', { name: 'Escolher foto' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Fechar seletor de fotos' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar seletor de fotos' }));
    expect(screen.queryByRole('dialog', { name: 'Escolher foto' })).not.toBeInTheDocument();
  });

  it('seleciona foto do picker no slot com aria-pressed e check visual', async () => {
    await openImageTab({ mediaLibrary: [MEDIA_A, MEDIA_B] });
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    const thumb = await screen.findByRole('button', { name: 'Foto 1' });
    expect(thumb).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(thumb);
    expect(screen.queryByRole('dialog', { name: 'Escolher foto' })).not.toBeInTheDocument();
    // slot agora mostra a foto e "Trocar foto"
    expect(screen.getByText('Trocar foto')).toBeInTheDocument();
  });

  it('mostra skeleton no picker enquanto mediaLoading está ativo', async () => {
    await openImageTab({ mediaLibrary: [MEDIA_A], mediaLoading: true });
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    expect(screen.getByRole('dialog', { name: 'Escolher foto' })).toBeInTheDocument();
    expect(screen.getByLabelText('Carregando fotos')).toBeInTheDocument();
  });

  it('mostra erro de carregamento da biblioteca com botão de retry', async () => {
    const onRetryMedia = vi.fn();
    await openImageTab({ mediaLibrary: [], mediaError: true, onRetryMedia });
    expect(screen.getByRole('alert')).toHaveTextContent(/não foi possível carregar a biblioteca/i);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetryMedia).toHaveBeenCalled();
  });

  it('modal "Escolher foto" não tem checkbox, filtro de galeria nem estrela', async () => {
    await openImageTab({ mediaLibrary: [MEDIA_A, MEDIA_B] });
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    await screen.findByRole('dialog', { name: 'Escolher foto' });
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Galeria' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Todas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /galeria/i })).not.toBeInTheDocument();
    // as duas fotos da biblioteca aparecem no modal
    expect(screen.getByRole('button', { name: 'Foto 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Foto 2' })).toBeInTheDocument();
  });

  it('envia inGallery: true em todo upload (foto entra na galeria do perfil)', async () => {
    mockedPostsApi.uploadMedia.mockResolvedValueOnce(MEDIA_A);
    await openHarnessImageTab([]);
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    fireEvent.change(imageInput(), { target: { files: [pngFile()] } });
    await waitFor(() =>
      expect(mockedPostsApi.uploadMedia).toHaveBeenCalledWith('barber1', expect.any(File), { inGallery: true })
    );
  });

  it('mostra a mensagem do backend quando a galeria do perfil está cheia', async () => {
    mockedPostsApi.uploadMedia.mockRejectedValueOnce(
      new Error('Sua galeria já tem 30 fotos. Remova uma foto para enviar outra.')
    );
    const props = await openImageTab();
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    fireEvent.change(imageInput(), { target: { files: [pngFile()] } });
    await waitFor(() =>
      expect(props.showToast).toHaveBeenCalledWith(
        expect.stringMatching(/galeria já tem 30 fotos/i),
        'error'
      )
    );
  });

  it('impede usar a mesma foto nos dois slots (foto em uso fica desabilitada)', async () => {
    const props = await openEditor({ mediaLibrary: [MEDIA_A, MEDIA_B] });
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
    fireEvent.click(await screen.findByText('Antes e depois'));
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    // seleciona MEDIA_A no slot principal
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Foto 1' }));
    // no slot secundário, Foto 1 (mesma) deve estar desabilitada; Foto 2 liberada
    fireEvent.click(screen.getByRole('button', { name: 'Foto secundária' }));
    const foto1 = await screen.findByRole('button', { name: 'Foto 1' });
    expect(foto1).toBeDisabled();
    expect(foto1).toHaveAttribute('title', 'Já usada na foto principal');
    const foto2 = screen.getByRole('button', { name: 'Foto 2' });
    expect(foto2).toBeEnabled();
    fireEvent.click(foto2);
    expect(screen.queryByRole('dialog', { name: 'Escolher foto' })).not.toBeInTheDocument();
    expect(screen.getAllByText('Trocar foto')).toHaveLength(2);
    expect(props.showToast).not.toHaveBeenCalledWith(expect.stringMatching(/não está mais disponível/), 'error');
  });

  it('oferece "Remover foto" por slot e limpa a seleção sem excluir da biblioteca', async () => {
    await openImageTab({ mediaLibrary: [MEDIA_A] });
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Foto 1' }));
    expect(mockedPostsApi.deleteMedia).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Remover foto principal' }));
    expect(screen.getByRole('button', { name: 'Foto principal' })).toBeInTheDocument();
    expect(mockedPostsApi.deleteMedia).not.toHaveBeenCalled();
  });

  it('exclui foto da biblioteca via diálogo de confirmação e limpa o slot', async () => {
    mockedPostsApi.deleteMedia.mockResolvedValue(undefined);
    const props = await openImageTab({ mediaLibrary: [MEDIA_A] });
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Foto 1' }));
    // reabre o picker e pede exclusão da miniatura
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Remover foto 1 da biblioteca' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent(/no slot deste post/i);
    fireEvent.click(screen.getByRole('button', { name: 'Remover' }));
    await waitFor(() => expect(mockedPostsApi.deleteMedia).toHaveBeenCalledWith('media-a'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Foto principal' })).toBeInTheDocument());
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(props.showToast).toHaveBeenCalledWith('Foto removida da biblioteca.');
  });

  it('mostra mensagem amigável quando o upload falha (rejeição do postsApi)', async () => {
    const props = await openImageTab();
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    await screen.findByText(/envie a primeira foto/i);
    // o postsApi real já converte o corpo da resposta em Error amigável;
    // aqui garantimos que o editor repassa a mensagem sem mascarar.
    mockedPostsApi.uploadMedia.mockRejectedValueOnce(new Error('A imagem é muito grande. O limite é de 5 MB por arquivo.'));
    fireEvent.change(imageInput(), { target: { files: [pngFile()] } });
    await waitFor(() =>
      expect(props.showToast).toHaveBeenCalledWith(
        expect.stringMatching(/muito grande/i),
        'error'
      )
    );
    const [msg] = vi.mocked(props.showToast).mock.calls.at(-1)!;
    expect(msg).not.toMatch(/^{|^</);
  });

  it('rejeita arquivo não suportado (gif) antes de chamar a API', async () => {
    const props = await openImageTab();
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    await screen.findByText(/envie a primeira foto/i);
    const gif = new File([new Uint8Array(16)], 'anim.gif', { type: 'image/gif' });
    fireEvent.change(imageInput(), { target: { files: [gif] } });
    await waitFor(() =>
      expect(props.showToast).toHaveBeenCalledWith(expect.stringMatching(/formato inválido/i), 'error')
    );
    expect(mockedPostsApi.uploadMedia).not.toHaveBeenCalled();
  });

  it('rejeita arquivo acima de 5 MB antes de chamar a API (otimização indisponível)', async () => {
    const props = await openImageTab();
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    await screen.findByText(/envie a primeira foto/i);
    const big = new File([new Uint8Array(6 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    fireEvent.change(imageInput(), { target: { files: [big] } });
    await waitFor(() =>
      expect(props.showToast).toHaveBeenCalledWith(expect.stringMatching(/excede o limite de 5 MB/i), 'error')
    );
    expect(mockedPostsApi.uploadMedia).not.toHaveBeenCalled();
  });

  it('otimiza foto acima de 5 MB no navegador e envia o arquivo otimizado', async () => {
    const optimized = new File([new Uint8Array(32)], 'otimizada.jpg', { type: 'image/jpeg' });
    mockedOptimize.mockResolvedValueOnce(optimized);
    mockedPostsApi.uploadMedia.mockResolvedValueOnce(MEDIA_A);
    await openImageTab();
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    await screen.findByText(/envie a primeira foto/i);
    const big = new File([new Uint8Array(6 * 1024 * 1024)], 'celular.png', { type: 'image/png' });
    fireEvent.change(imageInput(), { target: { files: [big] } });
    await waitFor(() => expect(mockedOptimize).toHaveBeenCalledWith(big));
    await waitFor(() =>
      expect(mockedPostsApi.uploadMedia).toHaveBeenCalledWith('barber1', optimized, { inGallery: true })
    );
  });

  it('multi-upload: se uma falha, as outras sobem e o resumo lista o que falhou', async () => {
    mockedPostsApi.uploadMedia
      .mockResolvedValueOnce(MEDIA_A)
      .mockRejectedValueOnce(new Error('A imagem parece inválida ou corrompida.'))
      .mockResolvedValueOnce(MEDIA_B);
    const props = await openImageTab();
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    await screen.findByText(/envie a primeira foto/i);
    fireEvent.change(imageInput(), { target: { files: [pngFile('1.png'), pngFile('2.png'), pngFile('3.png')] } });
    await waitFor(() => expect(mockedPostsApi.uploadMedia).toHaveBeenCalledTimes(3));
    await waitFor(() =>
      expect(props.showToast).toHaveBeenCalledWith(
        expect.stringMatching(/1 de 3 fotos não foram enviadas.*2\.png.*corrompida/i),
        'error'
      )
    );
  });

  it('modelo sem foto oferece "Ver modelos com foto" e abre o picker filtrado em Com foto', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
    fireEvent.click(await screen.findByText('Agenda aberta'));
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    expect(screen.getByText(/não usa foto/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver modelos com foto' }));
    const pickerTitle = await screen.findByText('Escolher modelo');
    const picker = pickerTitle.closest('.rounded-2xl') as HTMLElement;
    expect(within(picker).getByText('Editorial foto')).toBeInTheDocument();
    expect(within(picker).queryByText('Agenda aberta')).not.toBeInTheDocument();
  });

  it('rejeita imagem com lado menor que 600px quando o navegador informa dimensões', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 500, height: 282, close: vi.fn() }));
    try {
      const props = await openImageTab();
      fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
      await screen.findByText(/envie a primeira foto/i);
      fireEvent.change(imageInput(), { target: { files: [pngFile('pequena.png')] } });
      await waitFor(() =>
        expect(props.showToast).toHaveBeenCalledWith(
          expect.stringMatching(/pelo menos 600px/),
          'error'
        )
      );
      expect(mockedPostsApi.uploadMedia).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('envia 1 arquivo: fecha o picker e seleciona no slot', async () => {
    mockedPostsApi.uploadMedia.mockResolvedValue(MEDIA_A);
    const props = await openHarnessImageTab([]);
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    await screen.findByText(/envie a primeira foto/i);
    fireEvent.change(imageInput(), { target: { files: [pngFile()] } });
    await waitFor(() => expect(mockedPostsApi.uploadMedia).toHaveBeenCalledWith('barber1', expect.any(File), { inGallery: true }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Escolher foto' })).not.toBeInTheDocument());
    expect(screen.getByText('Trocar foto')).toBeInTheDocument();
    expect(props.onSaved).not.toHaveBeenCalled();
  });

  it('envia vários arquivos: contador "Enviando X de Y", picker aberto e seleção manual', async () => {
    let finishSecond!: (m: PostMedia) => void;
    mockedPostsApi.uploadMedia
      .mockResolvedValueOnce(MEDIA_A)
      .mockImplementationOnce(() => new Promise(resolve => { finishSecond = resolve; }));
    await openHarnessImageTab([]);
    fireEvent.click(screen.getByRole('button', { name: 'Foto principal' }));
    await screen.findByText(/envie a primeira foto/i);
    fireEvent.change(imageInput(), { target: { files: [pngFile('1.png'), pngFile('2.png')] } });
    await waitFor(() => expect(screen.getAllByText('Enviando 2 de 2…').length).toBeGreaterThan(0));
    finishSecond(MEDIA_B);
    await waitFor(() =>
      expect(mockedPostsApi.uploadMedia).toHaveBeenCalledTimes(2)
    );
    // com vários arquivos o picker permanece aberto para escolha manual
    expect(screen.getByRole('dialog', { name: 'Escolher foto' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Foto 1' }));
    expect(screen.getByText('Trocar foto')).toBeInTheDocument();
  });
});

describe('PostEditor — aviso de caracteres sem glifo no render', () => {
  it('avisa no editor quando caracteres do título serão ignorados na imagem', async () => {
    await openEditor();
    const titleInput = await screen.findByLabelText('Título');
    fireEvent.change(titleInput, { target: { value: '💈 Corte ✂️' } });
    const warning = await screen.findByText(/não têm letra na fonte do post/);
    expect(warning).toHaveTextContent('💈 ✂️');
    expect(warning).toHaveAttribute('role', 'status');
    expect(warning).toHaveAttribute('id', 'post-title-render-warning');
  });

  it('remove o aviso quando o texto volta a ter só caracteres com glifo', async () => {
    await openEditor();
    const titleInput = await screen.findByLabelText('Título');
    fireEvent.change(titleInput, { target: { value: 'Corte ✂️' } });
    await screen.findByText(/não têm letra na fonte do post/);
    fireEvent.change(titleInput, { target: { value: 'Corte na tesoura' } });
    await waitFor(() =>
      expect(screen.queryByText(/não têm letra na fonte do post/)).not.toBeInTheDocument()
    );
  });

  it('avisa quando o título passa do limite de 40 caracteres do modelo', async () => {
    await openEditor();
    const titleInput = await screen.findByLabelText('Título');
    fireEvent.change(titleInput, { target: { value: 'TABELA DE VALORES COMPLETA DOS NOSSOS SERVIÇOS PREMIUM' } });
    expect(await screen.findByText(/passa de 40 caracteres/)).toBeInTheDocument();
  });

  it('avisa também no campo de CTA', async () => {
    await openEditor();
    const ctaInput = await screen.findByLabelText('Texto do botão (CTA)');
    fireEvent.change(ctaInput, { target: { value: 'Agendar 📅' } });
    expect(await screen.findByText(/não têm letra na fonte do post/)).toHaveTextContent('📅');
  });
});
