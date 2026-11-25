import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { postsApi, type DesignCatalog, type PostDesign } from '../../infra/postsApi';
import { ApiError } from '../../infra/apiClient';
import { PostEditor } from './PostEditor';
import type { FeedPost } from '../../types';

vi.mock('../../infra/postsApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/postsApi')>();
  return {
    ...actual,
    postsApi: {
      ...actual.postsApi,
      templates: vi.fn(),
      listDesigns: vi.fn(),
      preview: vi.fn(),
      previewDesign: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      publish: vi.fn(),
    },
  };
});

const design: PostDesign = {
  key: 'barbershop-ouro-escuro',
  version: 1,
  layoutId: 'ouro-escuro',
  variant: {
    paletteId: 'dourado',
    fontPair: 'anton-barlow',
    motif: 'lines',
    photoTreatment: 'full',
    density: 'full',
  },
  slots: {},
  editable: {
    businessName: { maxChars: 120, canHide: true, canMove: true },
    headline: { maxChars: 200, canHide: false, canMove: true },
    services: { maxChars: 500, canHide: true, canMove: true },
    promo: { maxChars: 80, canHide: true, canMove: true },
    validity: { maxChars: 40, canHide: true, canMove: true },
  },
  vocabulary: {},
  heroIcon: 'scissors',
  thumbnailUrl: null,
  commercialBlocks: ['services', 'price', 'promo', 'validity'],
};

function catalog(advertisingRestricted = false): DesignCatalog {
  return {
    segment: advertisingRestricted ? 'LAW_FIRM' : 'BARBERSHOP',
    designs: [{
      ...design,
      commercialBlocks: advertisingRestricted ? ['services'] : design.commercialBlocks,
    }],
    etag: '"etag-1"',
    advertisingRestricted,
    icons: ['scissors'],
  };
}

function draft() {
  localStorage.setItem(
    'agendai:post-draft:user1:barber1:new',
    JSON.stringify({
      version: 2,
      savedAt: Date.now(),
      objectiveId: 'fill-slots',
      templateKey: 'agenda-aberta',
      paletteKey: 'brand',
      format: 'portrait',
      postMode: 'both',
      type: 'announcement',
      title: '',
      ctaText: '',
      content: 'Legenda',
      primaryMediaId: null,
      secondaryMediaId: null,
      designKey: design.key,
      designVersion: design.version,
      designContent: {
        headline: 'Mensagem do rascunho',
        whatsapp: null,
        address: '   ',
      },
      designOverrides: {
        colors: { accent: '#ffaa00' },
        textScale: 1.1,
      },
    }),
  );
}

function renderEditor(post: FeedPost | null = null) {
  const props: Parameters<typeof PostEditor>[0] = {
    post,
    barbershopId: 'barber1',
    userId: 'user1',
    palettes: [{ key: 'brand', label: 'Marca' }],
    mediaLibrary: [],
    onClose: vi.fn(),
    onSaved: vi.fn(),
    showToast: vi.fn(),
    onMediaUploaded: vi.fn(),
  };
  render(<PostEditor {...props} />);
  return props;
}

/** Post já nascido no gerador — o 404 deve abrir o modo "design desligado". */
function designPost(): FeedPost {
  return {
    id: 'post-1',
    type: 'announcement',
    content: 'Legenda',
    createdAt: Date.now(),
    likes: 0,
    status: 'draft',
    designKey: design.key,
    designVersion: design.version,
  };
}

async function findDesignHeadline() {
  await screen.findByRole('heading', { name: 'Conteúdo' });
  return screen.findByLabelText(/Título principal/);
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(postsApi.templates).mockResolvedValue([]);
  vi.mocked(postsApi.listDesigns).mockResolvedValue(catalog());
  vi.mocked(postsApi.preview).mockResolvedValue('https://cdn.example.com/legacy.png');
  vi.mocked(postsApi.previewDesign).mockResolvedValue({
    imageUrl: 'data:image/jpeg;base64,preview',
    warnings: [],
    suggestions: {},
    width: 540,
  });
  vi.mocked(postsApi.create).mockResolvedValue({ id: 'post-1' } as never);
});

describe('PostEditor — integração do gerador de designs', () => {
  it('restaura e persiste o estado de design do rascunho local', async () => {
    draft();
    renderEditor();

    const headline = await findDesignHeadline();
    expect(headline).toHaveValue('Mensagem do rascunho');

    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem('agendai:post-draft:user1:barber1:new')!);
      expect(persisted.designKey).toBe(design.key);
      expect(persisted.designVersion).toBe(design.version);
      expect(persisted.designContent.headline).toBe('Mensagem do rascunho');
      expect(persisted.designContent.whatsapp).toBeNull();
      expect(persisted.designOverrides.colors.accent).toBe('#ffaa00');
    });
  });

  it('salva chave, versão, conteúdo compacto e overrides do design', async () => {
    draft();
    renderEditor();
    await findDesignHeadline();

    fireEvent.click(screen.getByRole('button', { name: 'Rascunho' }));

    await waitFor(() => expect(postsApi.create).toHaveBeenCalledTimes(1));
    expect(postsApi.create).toHaveBeenCalledWith(expect.objectContaining({
      barbershopId: 'barber1',
      designKey: design.key,
      designVersion: design.version,
      designContent: {
        headline: 'Mensagem do rascunho',
        whatsapp: null,
      },
      designOverrides: {
        colors: { accent: '#FFAA00' },
        textScale: 1.1,
      },
    }));
  });

  it('usa a restrição comercial do servidor e não oferece promoção', async () => {
    vi.mocked(postsApi.listDesigns).mockResolvedValue(catalog(true));
    draft();
    renderEditor();

    await findDesignHeadline();
    expect(screen.getByRole('button', { name: 'Serviços' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Promoção' })).not.toBeInTheDocument();
  });
});

describe('PostEditor — contrato de feature desligada (404) vs falha transitória', () => {
  it('404 do catálogo abre o editor legado (novo post) sem oferecer retry', async () => {
    draft();
    vi.mocked(postsApi.listDesigns).mockRejectedValue(
      new ApiError('Rota não encontrada', 404),
    );
    renderEditor();

    // Aba do editor legado = o gerador está desligado.
    await screen.findByRole('button', { name: 'Conteúdo' });
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    expect(postsApi.previewDesign).not.toHaveBeenCalled();
  });

  it('404 do catálogo em post de design abre o modo "design desligado"', async () => {
    vi.mocked(postsApi.listDesigns).mockRejectedValue(
      new ApiError('Rota não encontrada', 404),
    );
    renderEditor(designPost());

    expect(
      await screen.findByText(/gerador de designs está indisponível/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });

  it('5xx do catálogo mostra retry e preserva o rascunho de design', async () => {
    draft();
    vi.mocked(postsApi.listDesigns).mockRejectedValue(
      new ApiError('Servidor indisponível', 503),
    );
    renderEditor();

    const retry = await screen.findByRole('button', { name: 'Tentar novamente' });

    // O rascunho local continua intacto (nada se perde com a falha).
    const persisted = JSON.parse(localStorage.getItem('agendai:post-draft:user1:barber1:new')!);
    expect(persisted.designKey).toBe(design.key);
    expect(persisted.designContent.headline).toBe('Mensagem do rascunho');

    // Retry recarrega o catálogo e o editor de design volta.
    vi.mocked(postsApi.listDesigns).mockResolvedValue(catalog());
    fireEvent.click(retry);
    await findDesignHeadline();
    expect(postsApi.listDesigns).toHaveBeenCalledTimes(2);
  });

  it('falha de rede mostra retry e mantém o rascunho (não vira "desligado")', async () => {
    draft();
    vi.mocked(postsApi.listDesigns).mockRejectedValue(
      new TypeError('Failed to fetch'),
    );
    renderEditor();

    await screen.findByRole('button', { name: 'Tentar novamente' });
    // Não é "design desligado": o gerador continua tentável.
    expect(screen.queryByText(/gerador de designs está indisponível/i)).not.toBeInTheDocument();

    const persisted = JSON.parse(localStorage.getItem('agendai:post-draft:user1:barber1:new')!);
    expect(persisted.designContent.headline).toBe('Mensagem do rascunho');
  });

  it('save com 404 de feature desligada avisa e mantém o rascunho', async () => {
    draft();
    const props = renderEditor();
    await findDesignHeadline();

    vi.mocked(postsApi.create).mockRejectedValue(
      new ApiError('Rota não encontrada', 404, 'DESIGN_V3_DISABLED'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Rascunho' }));

    await waitFor(() => {
      expect(props.showToast).toHaveBeenCalledWith(
        expect.stringMatching(/gerador de designs foi desligado/i),
        'error',
      );
    });
    // O rascunho local NÃO foi apagado.
    const persisted = JSON.parse(localStorage.getItem('agendai:post-draft:user1:barber1:new')!);
    expect(persisted.designContent.headline).toBe('Mensagem do rascunho');
  });
});
