import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PostEditor } from './PostEditor';
import { PostPreviewBox } from './PostPreviewBox';
import { TemplateThumbnail } from './TemplateThumbnail';
import { postsApi } from '../../infra/postsApi';
import { barbershopApi } from '../../infra/barbershopApi';

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
      schedule: vi.fn(),
      cancelSchedule: vi.fn(),
    },
  };
});

vi.mock('../../infra/barbershopApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/barbershopApi')>();
  return {
    ...actual,
    barbershopApi: { ...actual.barbershopApi, uploadPostVideo: vi.fn(), generatePostContent: vi.fn() },
  };
});

const mockedPostsApi = vi.mocked(postsApi);
const mockedBarbershopApi = vi.mocked(barbershopApi);

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
    fireEvent.click(await screen.findByRole('button', { name: 'Selecionar modelo Agenda aberta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    expect(screen.getByText(/não usa foto/i)).toBeInTheDocument();
    expect(screen.queryByText('Foto principal')).not.toBeInTheDocument();
  });

  it('optional com stockImageKey avisa que imagem ilustrativa não representa o salão', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|serviço em destaque|agenda aberta/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Selecionar modelo Editorial foto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    expect(screen.getByText(/não representa resultados do seu salão/i)).toBeInTheDocument();
  });

  it('optional sem stockImageKey explica tipografia sem foto', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|serviço em destaque|agenda aberta/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Selecionar modelo Tipográfico' }));
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
        videoUrl: null,
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
  it('disponibiliza o agendamento no celular e permite voltar à publicação imediata', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Agendar publicação' }));
    expect(screen.getByLabelText('Data e horário da publicação')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Agendar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Publicar agora' }));
    expect(screen.queryByLabelText('Data e horário da publicação')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument();
  });

  it('não cria post com agendamento inválido', async () => {
    const props = await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Selecionar modelo Agenda aberta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Agendar publicação' }));
    fireEvent.change(screen.getByLabelText('Data e horário da publicação'), { target: { value: '2020-01-01T10:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agendar' }));
    expect(mockedPostsApi.create).not.toHaveBeenCalled();
    expect(props.showToast).toHaveBeenCalledWith(expect.stringMatching(/5 minutos/), 'error');
  });

  it('exige fotos reais do modelo de resultados antes de publicar', async () => {
    const props = await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo|agenda aberta/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Selecionar modelo Antes e depois' }));
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

describe('PostPreviewBox — falha da imagem', () => {
  it('permite carregar a mesma URL novamente após erro de imagem', () => {
    const retry = vi.fn();
    render(<PostPreviewBox format="square" previewUrl="https://cdn.example.com/p.png" onRetry={retry} />);
    fireEvent.error(screen.getByAltText('Prévia do post'));
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar a prévia.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar prévia novamente' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByAltText('Prévia do post')).toHaveAttribute('src', 'https://cdn.example.com/p.png');
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

describe('PostEditor — vídeo', () => {
  it('não permite salvar nem publicar enquanto o upload de vídeo está em andamento', async () => {
    let finishUpload!: (value: { videoUrl: string }) => void;
    mockedBarbershopApi.uploadPostVideo.mockImplementationOnce(() => new Promise(resolve => { finishUpload = resolve; }));
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    const input = document.querySelector('input[type="file"][accept*="video"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'], 'video.mp4', { type: 'video/mp4' })] } });
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rascunho' })).toBeDisabled();
    expect(mockedPostsApi.create).not.toHaveBeenCalled();
    finishUpload({ videoUrl: 'https://cdn.example.com/video-barber1-abc.mp4' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Rascunho' })).toBeEnabled());
  });
  it('faz upload via barbershopApi.uploadPostVideo e inclui videoUrl no payload', async () => {
    mockedBarbershopApi.uploadPostVideo.mockResolvedValue({ videoUrl: 'https://cdn.example.com/video-barber1-abc.mp4' });
    mockedPostsApi.create.mockResolvedValue({ id: 'post1' } as any);
    const props = await openEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    const file = new File(['x'], 'video.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"][accept*="video"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(mockedBarbershopApi.uploadPostVideo).toHaveBeenCalledWith('barber1', file));
    // preview real do vídeo, sem fake
    expect(await screen.findByText('Trocar vídeo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Rascunho' }));
    await waitFor(() => expect(mockedPostsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ videoUrl: 'https://cdn.example.com/video-barber1-abc.mp4' })
    ));
    expect(props.onSaved).toHaveBeenCalledWith('draft');
  });

  it('rejeita vídeo acima de 25 MB', async () => {
    const props = await openEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Imagem' }));
    const big = new File([new Uint8Array(26 * 1024 * 1024)], 'big.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"][accept*="video"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [big] } });
    expect(mockedBarbershopApi.uploadPostVideo).not.toHaveBeenCalled();
    expect(props.showToast).toHaveBeenCalledWith(expect.stringMatching(/25 MB/), 'error');
  });
});


describe('PostEditor — recuperação e consistência', () => {
  it('exibe falha da prévia no editor e permite tentar novamente', async () => {
    mockedPostsApi.preview.mockRejectedValueOnce(new Error('Render indisponível'));
    await openEditor();
    expect(await screen.findAllByText('Render indisponível')).not.toHaveLength(0);
    expect(screen.queryByText('Aguardando informações…')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Tentar prévia novamente' })[0]);
    await waitFor(() => expect(screen.getAllByAltText('Prévia do post')[0]).toHaveAttribute('src', 'https://cdn.example.com/preview.png'));
    expect(screen.queryByText('Render indisponível')).not.toBeInTheDocument();
  });

  it('cancela a prévia anterior e ignora sua resposta após alterar o título', async () => {
    let finishFirst!: (url: string) => void;
    mockedPostsApi.preview.mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve; }));
    await openEditor();
    await waitFor(() => expect(mockedPostsApi.preview).toHaveBeenCalledTimes(1));
    const signal = mockedPostsApi.preview.mock.calls[0][2]!.signal!;
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Título atualizado' } });
    expect(signal.aborted).toBe(true);
    await waitFor(() => expect(screen.getAllByAltText('Prévia do post')[0]).toHaveAttribute('src', 'https://cdn.example.com/preview.png'));
    await act(async () => { finishFirst('https://cdn.example.com/antiga.png'); });
    expect(screen.getAllByAltText('Prévia do post')[0]).toHaveAttribute('src', 'https://cdn.example.com/preview.png');
  });

  it('oferece categorias e modelos visuais também na aba Formato', async () => {
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Formato' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Editorial' }));
    expect(screen.getByRole('button', { name: 'Selecionar modelo Editorial foto' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Selecionar modelo Agenda aberta' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Selecionar modelo Editorial foto' }));
    expect(screen.getByRole('button', { name: 'Selecionar modelo Editorial foto' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('permite recuperar um catálogo que falhou sem reabrir o editor', async () => {
    mockedPostsApi.templates.mockRejectedValueOnce(new Error('Catálogo indisponível'));
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Formato' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Catálogo indisponível');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar modelos novamente' }));
    await screen.findByRole('button', { name: 'Selecionar modelo Agenda aberta' });
    expect(mockedPostsApi.templates).toHaveBeenCalledTimes(2);
  });

  it('mostra erro de IA no modal e aplica uma sugestão na nova tentativa', async () => {
    mockedBarbershopApi.generatePostContent.mockRejectedValueOnce(new Error('Sugestões indisponíveis'))
      .mockResolvedValueOnce({ suggestions: [{ title: 'Agenda da semana', ctaText: 'Agendar' }], source: 'template' });
    await openEditor();
    fireEvent.click(screen.getByText('Sugestões por IA'));
    fireEvent.click(screen.getByRole('button', { name: 'Gerar sugestões' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sugestões indisponíveis');
    fireEvent.click(screen.getByRole('button', { name: 'Gerar sugestões' }));
    fireEvent.click(await screen.findByRole('button', { name: /Agenda da semana/ }));
    expect(screen.getByLabelText('Título')).toHaveValue('Agenda da semana');
    expect(screen.getByLabelText('Texto do botão (CTA)')).toHaveValue('Agendar');
  });

  it('retenta publicar o mesmo rascunho após falha e não cria duplicatas', async () => {
    mockedPostsApi.create.mockResolvedValueOnce({ id: 'saved-draft' } as any);
    mockedPostsApi.update.mockResolvedValue({ id: 'saved-draft' } as any);
    mockedPostsApi.publish.mockRejectedValueOnce(new Error('Publicação indisponível')).mockResolvedValueOnce({ id: 'saved-draft' } as any);
    const props = await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /selecionar modelo:/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Selecionar modelo Agenda aberta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Publicação indisponível');
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith('published'));
    expect(mockedPostsApi.create).toHaveBeenCalledTimes(1);
    expect(mockedPostsApi.publish).toHaveBeenNthCalledWith(2, 'saved-draft');
    expect(mockedPostsApi.update).toHaveBeenCalledWith('saved-draft', expect.any(Object));
  });
});


const savedPost = (status: 'published' | 'scheduled' | 'draft'): NonNullable<Parameters<typeof PostEditor>[0]['post']> => ({
  id: 'saved-post', barbershopId: 'barber1', type: 'haircut', title: 'Título original',
  content: 'Legenda original', likes: 0, createdAt: Date.now(), authorName: 'Equipe',
  status, format: 'square', templateKey: 'agenda-aberta', paletteKey: 'brand',
  scheduledFor: status === 'scheduled' ? Date.now() + 86_400_000 : undefined,
});

describe('PostEditor — ciclo de vida de rascunhos e publicações', () => {
  it('editar um publicado salva as alterações sem publicar novamente nem criar rascunho', async () => {
    mockedPostsApi.update.mockResolvedValue(savedPost('published'));
    const props = renderEditor({ post: savedPost('published') });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled());
    expect(screen.queryByRole('button', { name: 'Rascunho' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agendar publicação' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Título atualizado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith('published'));
    expect(mockedPostsApi.update).toHaveBeenCalledWith('saved-post', expect.objectContaining({ title: 'Título atualizado' }));
    expect(mockedPostsApi.publish).not.toHaveBeenCalled();
    expect(mockedPostsApi.create).not.toHaveBeenCalled();
  });

  it('editar agendado mantém o horário e salvar como rascunho cancela o agendamento', async () => {
    const post = savedPost('scheduled');
    mockedPostsApi.update.mockResolvedValue(post);
    mockedPostsApi.cancelSchedule.mockResolvedValue(savedPost('draft'));
    const props = renderEditor({ post });
    const value = new Date(post.scheduledFor!);
    value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
    expect(screen.getByLabelText('Data e horário da publicação')).toHaveValue(value.toISOString().slice(0, 16));
    fireEvent.click(screen.getByRole('button', { name: 'Rascunho' }));
    await waitFor(() => expect(mockedPostsApi.cancelSchedule).toHaveBeenCalledWith('saved-post'));
    expect(props.onSaved).toHaveBeenCalledWith('draft');
    expect(mockedPostsApi.create).not.toHaveBeenCalled();
    expect(mockedPostsApi.publish).not.toHaveBeenCalled();
  });

  it('reutilizar cria um novo post e mantém separado o rascunho de criação em andamento', async () => {
    localStorage.setItem('agendai:post-draft:user1:barber1:new', JSON.stringify({ version: 2, savedAt: Date.now(), title: 'Outro rascunho' }));
    mockedPostsApi.create.mockResolvedValue({ ...savedPost('draft'), id: 'copy-post' });
    const props = renderEditor({ sourcePost: savedPost('published') });
    expect(screen.getByLabelText('Título')).toHaveValue('Título original');
    fireEvent.click(screen.getByRole('button', { name: 'Rascunho' }));
    await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith('draft'));
    expect(mockedPostsApi.create).toHaveBeenCalledTimes(1);
    expect(mockedPostsApi.update).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('agendai:post-draft:user1:barber1:new')!).title).toBe('Outro rascunho');
  });

  it('reabrir após falha de publicação reutiliza o rascunho já criado no servidor', async () => {
    mockedPostsApi.create.mockResolvedValueOnce({ ...savedPost('draft'), id: 'created-draft' });
    mockedPostsApi.publish.mockRejectedValueOnce(new Error('Publicação indisponível')).mockResolvedValueOnce(savedPost('published'));
    mockedPostsApi.update.mockResolvedValue(savedPost('draft'));
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: /Selecionar modelo:/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Selecionar modelo Agenda aberta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    await screen.findByRole('alert');
    expect(JSON.parse(localStorage.getItem('agendai:post-draft:user1:barber1:new')!).serverPostId).toBe('created-draft');
    cleanup();
    const props = renderEditor();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Publicar' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith('published'));
    expect(mockedPostsApi.create).toHaveBeenCalledTimes(1);
    expect(mockedPostsApi.publish).toHaveBeenLastCalledWith('created-draft');
  });

  it('restaura a remoção explícita de mídia em uma edição não salva', async () => {
    const post = { ...savedPost('draft'), videoUrl: 'https://cdn.example.com/video.mp4', primaryMediaId: 'old-photo' };
    localStorage.setItem('agendai:post-draft:user1:barber1:saved-post', JSON.stringify({
      version: 2, savedAt: Date.now(), objectiveId: 'announce', templateKey: 'agenda-aberta',
      paletteKey: 'brand', format: 'square', postMode: 'both', type: 'haircut', title: 'Edição não salva',
      ctaText: 'Agendar', content: '', videoUrl: null, primaryMediaId: null, secondaryMediaId: null,
    }));
    mockedPostsApi.update.mockResolvedValue(savedPost('draft'));
    renderEditor({ post });
    expect(screen.getByLabelText('Título')).toHaveValue('Edição não salva');
    fireEvent.click(screen.getByRole('button', { name: 'Rascunho' }));
    await waitFor(() => expect(mockedPostsApi.update).toHaveBeenCalledWith('saved-post', expect.objectContaining({ videoUrl: null, primaryMediaId: null })));
  });
});


it('exibe e recupera erro da biblioteca dentro do modal sem fechar o editor', async () => {
  const reload = vi.fn();
  await openEditor({ metadataErrors: ['Biblioteca indisponível'], onReloadMetadata: reload });
  expect(screen.getByRole('alert')).toHaveTextContent('Biblioteca indisponível');
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(reload).toHaveBeenCalledOnce();
});


it('preserva a escolha de agendamento de um post novo após fechar e reabrir', async () => {
  await openEditor();
  fireEvent.click(screen.getByRole('button', { name: 'Agendar publicação' }));
  const value = '2030-01-02T15:30';
  fireEvent.change(screen.getByLabelText('Data e horário da publicação'), { target: { value } });
  cleanup();
  renderEditor();
  expect(screen.getByLabelText('Data e horário da publicação')).toHaveValue(value);
  expect(screen.getByRole('button', { name: 'Agendar' })).toBeInTheDocument();
});
