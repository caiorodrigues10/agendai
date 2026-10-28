import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { postsApi, type PostMedia } from '../../infra/postsApi';
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
});

describe('PostsManager — seções Publicações / Fotos do perfil', () => {
  it('mostra as abas Publicações e Fotos do perfil, começando em Publicações', async () => {
    render(<PostsManager />);
    expect(screen.getByRole('tab', { name: 'Publicações' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Fotos do perfil' })).toBeInTheDocument();
    // Aba inicial: publicações (com o botão "Criar post") e sem a galeria.
    expect(screen.getByRole('button', { name: /criar post/i })).toBeInTheDocument();
    expect(screen.queryByText('0 de 30 fotos')).not.toBeInTheDocument();
    await waitFor(() => expect(mockedPostsApi.list).toHaveBeenCalled());
  });

  it('troca para Fotos do perfil: mostra a galeria e esconde "Criar post"', async () => {
    mockedPostsApi.listMedia.mockResolvedValue([PHOTO]);
    render(<PostsManager />);
    fireEvent.click(screen.getByRole('tab', { name: 'Fotos do perfil' }));
    expect(await screen.findByText('1 de 30 fotos')).toBeInTheDocument();
    expect(screen.getByAltText('Foto da galeria do perfil')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /criar post/i })).not.toBeInTheDocument();
    // A galeria lista só as fotos do perfil (inGallery=true).
    await waitFor(() =>
      expect(mockedPostsApi.listMedia).toHaveBeenCalledWith('shop-1', { inGallery: true })
    );
  });

  it('na aba Fotos do perfil, envia a foto direto para o perfil (inGallery=true)', async () => {
    mockedPostsApi.uploadMedia.mockResolvedValueOnce(PHOTO);
    render(<PostsManager />);
    fireEvent.click(screen.getByRole('tab', { name: 'Fotos do perfil' }));
    await screen.findByText('0 de 30 fotos');
    fireEvent.change(fileInput(), { target: { files: [pngFile()] } });
    await waitFor(() =>
      expect(mockedPostsApi.uploadMedia).toHaveBeenCalledWith('shop-1', expect.any(File), { inGallery: true })
    );
    expect(await screen.findByText('Foto enviada para a galeria do perfil.')).toBeInTheDocument();
  });
});
