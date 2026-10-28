import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { postsApi, type PostMedia } from '../../infra/postsApi';
import { GalleryManager } from './GalleryManager';

vi.mock('../../infra/postsApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/postsApi')>();
  return {
    ...actual,
    postsApi: {
      ...actual.postsApi,
      listMedia: vi.fn(),
      uploadMedia: vi.fn(),
      deleteMedia: vi.fn(),
    },
  };
});

vi.mock('../../contexts/BarbershopFiltersContext', () => ({
  useBarbershopFilters: () => ({ barbershopId: 'shop-1' }),
}));

const mockedPostsApi = vi.mocked(postsApi);

const PHOTO_A: PostMedia = {
  id: 'media-a',
  url: 'https://cdn.example.com/a.png',
  mimeType: 'image/png',
  size: 1000,
  createdAt: '2026-10-01T12:00:00.000Z',
  inGallery: true,
};
const PHOTO_B: PostMedia = { ...PHOTO_A, id: 'media-b', url: 'https://cdn.example.com/b.png' };

function fileInput(): HTMLInputElement {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

function pngFile(name = 'foto.png') {
  return new File([new Uint8Array(16)], name, { type: 'image/png' });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedPostsApi.listMedia.mockResolvedValue([]);
});

describe('GalleryManager — galeria do perfil', () => {
  it('lista só as fotos da galeria (inGallery=true), mais recentes primeiro', async () => {
    mockedPostsApi.listMedia.mockResolvedValue([PHOTO_B, PHOTO_A]);
    render(<GalleryManager />);
    await waitFor(() =>
      expect(mockedPostsApi.listMedia).toHaveBeenCalledWith('shop-1', { inGallery: true })
    );
    const images = await screen.findAllByAltText('Foto da galeria do perfil');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', PHOTO_B.url);
    expect(images[1]).toHaveAttribute('src', PHOTO_A.url);
    expect(screen.getByText('2 de 30 fotos')).toBeInTheDocument();
  });

  it('mostra estado vazio quando ainda não há fotos', async () => {
    render(<GalleryManager />);
    expect(await screen.findByText('Envie a primeira foto do seu salão')).toBeInTheDocument();
    expect(screen.getByText('0 de 30 fotos')).toBeInTheDocument();
    // Um único botão de envio (sem checkbox e sem opções extras).
    expect(screen.getAllByRole('button', { name: /enviar fotos/i })).toHaveLength(1);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('mostra erro e permite tentar novamente quando a listagem falha', async () => {
    mockedPostsApi.listMedia.mockRejectedValueOnce(new Error('boom'));
    render(<GalleryManager />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível carregar a galeria/i);
    mockedPostsApi.listMedia.mockResolvedValueOnce([PHOTO_A]);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('1 de 30 fotos')).toBeInTheDocument();
  });

  it('envia a foto para a galeria (inGallery=true) e atualiza a grade', async () => {
    mockedPostsApi.uploadMedia.mockResolvedValueOnce(PHOTO_B);
    render(<GalleryManager />);
    await screen.findByText('Envie a primeira foto do seu salão');
    fireEvent.change(fileInput(), { target: { files: [pngFile()] } });
    await waitFor(() =>
      expect(mockedPostsApi.uploadMedia).toHaveBeenCalledWith('shop-1', expect.any(File), { inGallery: true })
    );
    expect(await screen.findByAltText('Foto da galeria do perfil')).toBeInTheDocument();
    expect(screen.getByText('Foto enviada para a galeria do perfil.')).toBeInTheDocument();
  });

  it('envia vários arquivos em sequência com progresso', async () => {
    mockedPostsApi.uploadMedia.mockResolvedValueOnce(PHOTO_A).mockResolvedValueOnce(PHOTO_B);
    render(<GalleryManager />);
    await screen.findByText('Envie a primeira foto do seu salão');
    fireEvent.change(fileInput(), { target: { files: [pngFile('1.png'), pngFile('2.png')] } });
    await waitFor(() => expect(mockedPostsApi.uploadMedia).toHaveBeenCalledTimes(2));
    expect(mockedPostsApi.uploadMedia.mock.calls.map(c => c[0])).toEqual(['shop-1', 'shop-1']);
    expect(await screen.findByText('2 fotos enviadas para a galeria do perfil.')).toBeInTheDocument();
  });

  it('mostra a mensagem do backend quando a galeria está cheia', async () => {
    mockedPostsApi.uploadMedia.mockRejectedValueOnce(
      new Error('Sua galeria já tem 30 fotos. Remova uma foto para enviar outra.')
    );
    render(<GalleryManager />);
    await screen.findByText('Envie a primeira foto do seu salão');
    fireEvent.change(fileInput(), { target: { files: [pngFile()] } });
    expect(await screen.findByText(/galeria já tem 30 fotos/i)).toBeInTheDocument();
  });

  it('exclui a foto com confirmação e some da grade', async () => {
    mockedPostsApi.listMedia.mockResolvedValue([PHOTO_A]);
    mockedPostsApi.deleteMedia.mockResolvedValueOnce({ success: true });
    render(<GalleryManager />);
    await waitFor(() => expect(screen.getByText('1 de 30 fotos')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Remover foto da galeria' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /remover/i }));
    await waitFor(() => expect(mockedPostsApi.deleteMedia).toHaveBeenCalledWith('media-a'));
    expect(await screen.findByText('Foto removida da galeria do perfil.')).toBeInTheDocument();
  });
});
