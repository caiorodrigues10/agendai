import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { postsApi, type PostMedia } from '../../infra/postsApi';
import type { FeedPost } from '../../types';
import { PostsManager } from './PostsManager';

vi.mock('../../infra/postsApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/postsApi')>();
  return {
    ...actual,
    postsApi: {
      ...actual.postsApi,
      list: vi.fn(),
      palettes: vi.fn(),
      listMedia: vi.fn(),
      uploadMedia: vi.fn(),
      deleteMedia: vi.fn(),
      remove: vi.fn(),
    },
  };
});

vi.mock('../../contexts/BarbershopFiltersContext', () => ({
  useBarbershopFilters: () => ({ barbershopId: 'shop-1' }),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', name: 'Dono', email: 'dono@example.com', role: 'OWNER' } }),
}));

const mockedPostsApi = vi.mocked(postsApi);

const PHOTO: PostMedia = {
  id: 'media-a',
  url: 'https://cdn.example.com/a.png',
  mimeType: 'image/png',
  size: 1000,
  createdAt: '2026-10-01T12:00:00.000Z',
  inGallery: true,
};

function fileInput(): HTMLInputElement {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

function pngFile(name = 'foto.png') {
  return new File([new Uint8Array(16)], name, { type: 'image/png' });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedPostsApi.list.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 12 } });
  mockedPostsApi.palettes.mockResolvedValue([]);
  mockedPostsApi.listMedia.mockResolvedValue([]);
  mockedPostsApi.remove.mockResolvedValue({ success: true });
});

const DRAFT_POST: FeedPost = {
  id: 'post-1',
  type: 'announcement',
  title: 'Rascunho de teste',
  content: '',
  createdAt: Date.parse('2026-10-01T12:00:00.000Z'),
  likes: 0,
  status: 'draft',
  format: 'square',
  templateKey: 'agenda-aberta',
};

/** list devolve o rascunho só quando a sub-aba pede status=draft. */
function listDraftOnly() {
  mockedPostsApi.list.mockImplementation(async (_shop: string, opts?: { status?: string }) =>
    opts?.status === 'draft'
      ? { data: [DRAFT_POST], meta: { total: 1, page: 1, limit: 12 } }
      : { data: [], meta: { total: 0, page: 1, limit: 12 } }
  );
}

describe('PostsManager — seções Publicações / Galeria do perfil', () => {
  it('mostra as abas Publicações e Galeria do perfil, começando em Publicações', async () => {
    render(<PostsManager />);
    expect(screen.getByRole('tab', { name: 'Publicações' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Galeria do perfil' })).toBeInTheDocument();
    // Aba inicial: publicações (com o botão "Criar post") e sem a galeria.
    expect(screen.getByRole('button', { name: /criar post/i })).toBeInTheDocument();
    expect(screen.queryByText('0 de 30 fotos')).not.toBeInTheDocument();
    await waitFor(() => expect(mockedPostsApi.list).toHaveBeenCalled());
  });

  it('na aba Publicações mostra só Publicados e Rascunhos (sem Agendados)', async () => {
    render(<PostsManager />);
    expect(screen.getByRole('tab', { name: 'Publicados' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Rascunhos' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Agendados' })).not.toBeInTheDocument();
    expect(screen.queryByText('Nenhum post agendado.')).not.toBeInTheDocument();
    await waitFor(() => expect(mockedPostsApi.list).toHaveBeenCalledWith(
      'shop-1', expect.objectContaining({ status: 'published' })
    ));
  });

  it('na aba Rascunhos lista o post DRAFT com selo Rascunho e ações Publicar/Excluir', async () => {
    listDraftOnly();
    render(<PostsManager />);
    fireEvent.click(screen.getByRole('tab', { name: 'Rascunhos' }));

    expect(await screen.findByText('Rascunho de teste')).toBeInTheDocument();
    expect(screen.getByText('Rascunho')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir rascunho' })).toBeInTheDocument();
    expect(screen.queryByText(/Agendado:/)).not.toBeInTheDocument();
    await waitFor(() =>
      expect(mockedPostsApi.list).toHaveBeenCalledWith('shop-1', expect.objectContaining({ status: 'draft' }))
    );
  });

  it('excluir rascunho pede confirmação, remove via postsApi.remove e avisa', async () => {
    listDraftOnly();
    render(<PostsManager />);
    fireEvent.click(screen.getByRole('tab', { name: 'Rascunhos' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Excluir rascunho' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('Excluir rascunho')).toBeInTheDocument();
    expect(within(dialog).getByText(/será removido permanentemente/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(mockedPostsApi.remove).toHaveBeenCalledWith('post-1'));
    expect(await screen.findByText('Rascunho removido.')).toBeInTheDocument();
  });

  it('troca para Galeria do perfil: mostra a galeria e esconde "Criar post"', async () => {
    mockedPostsApi.listMedia.mockResolvedValue([PHOTO]);
    render(<PostsManager />);
    fireEvent.click(screen.getByRole('tab', { name: 'Galeria do perfil' }));
    expect(await screen.findByText('1 de 30 fotos')).toBeInTheDocument();
    expect(screen.getByAltText('Foto da galeria do perfil')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /criar post/i })).not.toBeInTheDocument();
    // A galeria lista só as fotos do perfil (inGallery=true).
    await waitFor(() =>
      expect(mockedPostsApi.listMedia).toHaveBeenCalledWith('shop-1', { inGallery: true })
    );
  });

  it('na aba Galeria do perfil, envia a foto direto para o perfil (inGallery=true)', async () => {
    mockedPostsApi.uploadMedia.mockResolvedValueOnce(PHOTO);
    render(<PostsManager />);
    fireEvent.click(screen.getByRole('tab', { name: 'Galeria do perfil' }));
    await screen.findByText('0 de 30 fotos');
    fireEvent.change(fileInput(), { target: { files: [pngFile()] } });
    await waitFor(() =>
      expect(mockedPostsApi.uploadMedia).toHaveBeenCalledWith('shop-1', expect.any(File), { inGallery: true })
    );
    expect(await screen.findByText('Foto enviada para a galeria do perfil.')).toBeInTheDocument();
  });
});
