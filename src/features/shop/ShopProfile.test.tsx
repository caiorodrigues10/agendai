import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShopProfile } from './ShopProfile';
import { socialApi } from '../../infra/socialApi';
import type { FeedPost, ShopSettings, StaffMember } from '../../types';

vi.mock('../../infra/socialApi', () => ({ socialApi: { stories: vi.fn(), gallery: vi.fn(), tagged: vi.fn(), getPost: vi.fn(), moderateTag: vi.fn(), canComment: () => false, comments: vi.fn() } }));
vi.mock('../../contexts/BarbershopContext', async () => {
  const { createContext } = await import('react');
  return {
    useBarbershop: () => ({ services: [], isShopOpen: () => true, getTodayScheduleDisplay: () => '09:00 – 18:00' }),
    // O useSegmentLabels lê o contexto cru; sem valor ele cai no default.
    BarbershopContext: createContext(undefined),
  };
});
vi.mock('../../contexts/BarbershopFiltersContext', () => ({ useBarbershopFilters: () => ({ barbershopId: 'salon' }) }));

const settings: ShopSettings = { shopName: 'Studio Teste', whatsapp: '11999999999', schedule: [], operationMode: 'HYBRID' };
const post: FeedPost = { id: 'post', barbershopId: 'salon', type: 'announcement', title: 'Arte nova', content: 'Novidades', imageUrl: '/photo.png', createdAt: Date.now(), publishedAt: Date.now(), status: 'published', likes: 0 };
const owner: StaffMember = { id: 'owner', name: 'Dono', email: 'dono@example.test', role: 'OWNER', barbershopId: 'salon' };
function mount(props: Partial<Parameters<typeof ShopProfile>[0]> = {}) {
  return render(<MemoryRouter><ShopProfile settings={settings} posts={[post]} currentUser={null} onDeletePost={vi.fn()} onLikePost={vi.fn()} {...props} /></MemoryRouter>);
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(socialApi.stories).mockResolvedValue([]);
  vi.mocked(socialApi.gallery).mockResolvedValue([]);
  vi.mocked(socialApi.tagged).mockResolvedValue([]);
});

it('mostra apenas publicações públicas na grade, sem rascunhos e sem stories', async () => {
  mount({ posts: [post, { ...post, id: 'draft', status: 'draft' }, { ...post, id: 'story', format: 'story' }] });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.getByTestId('profile-post-grid').querySelectorAll('button')).toHaveLength(1);
  expect(screen.queryByText('0.0')).not.toBeInTheDocument();
});
it('exibe apenas as abas Publicações, Fotos e Sobre', async () => {
  mount();
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  const tabs = screen.getAllByRole('tab').map(t => t.textContent);
  expect(tabs).toEqual(['Publicações', 'Fotos', 'Sobre']);
});
it('aba Fotos mostra estado vazio e o cabeçalho conta fotos (0 sem galeria ainda)', async () => {
  mount();
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('tab', { name: 'Fotos' }));
  expect(screen.getByText('Galeria de fotos em breve')).toBeInTheDocument();
  expect(screen.getByText('fotos')).toBeInTheDocument();
  expect(screen.getByText('fotos').previousElementSibling).toHaveTextContent('0');
});
it('aba Fotos renderiza a galeria pública e atualiza o contador do cabeçalho', async () => {
  vi.mocked(socialApi.gallery).mockResolvedValue([
    { id: 'ph1', url: 'https://cdn.example.com/1.png', mimeType: 'image/png', createdAt: '2026-10-20T10:00:00.000Z' },
    { id: 'ph2', url: 'https://cdn.example.com/2.png', mimeType: 'image/png', createdAt: '2026-10-21T10:00:00.000Z' },
  ]);
  mount();
  await waitFor(() => expect(socialApi.gallery).toHaveBeenCalledWith('salon'));
  fireEvent.click(screen.getByRole('tab', { name: 'Fotos' }));
  expect(await screen.findAllByAltText('Foto do salão')).toHaveLength(2);
  expect(screen.queryByText('Galeria de fotos em breve')).not.toBeInTheDocument();
  expect(screen.getByText('fotos').previousElementSibling).toHaveTextContent('2');
});
it('vídeos publicados continuam visíveis na grade de Publicações', async () => {
  mount({ posts: [post, { ...post, id: 'video', title: 'Bastidores', videoUrl: '/reel.mp4' }] });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.getByRole('button', { name: 'Abrir vídeo: Bastidores' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Abrir publicação: Arte nova' })).toBeInTheDocument();
});
it('não busca tagged nem pendentes e não expõe moderação no perfil público', async () => {
  mount({ currentUser: owner, audience: 'public' });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(socialApi.tagged).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Alterar logo' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Criar publicação' })).not.toBeInTheDocument();
  expect(screen.queryByText('Aguardando sua aprovação')).not.toBeInTheDocument();
});
it('oferece somente a fila quando o salão não trabalha com agendamentos', async () => {
  mount({ settings: { ...settings, operationMode: 'QUEUE_ONLY' } });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.getByRole('button', { name: 'Entrar na fila' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Agendar' })).not.toBeInTheDocument();
});
it('stories expirados não aparecem e stories ativos abrem o visualizador', async () => {
  vi.mocked(socialApi.stories).mockResolvedValue([{ ...post, id: 'expired', title: 'Expirado', format: 'story', publishedAt: Date.now() - 25 * 3600_000 }, { ...post, id: 'active', title: 'Hoje', format: 'story' }]);
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Ver story: Hoje' }));
  expect(screen.getByRole('dialog', { name: 'Story' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Ver story: Expirado' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Fechar story' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
