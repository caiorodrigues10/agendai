import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShopProfile } from './ShopProfile';
import { socialApi } from '../../infra/socialApi';
import { reputationApi } from '../../infra/reputationApi';
import type { FeedPost, ShopSettings, StaffMember } from '../../types';

vi.mock('../../infra/socialApi', () => ({ socialApi: { stories: vi.fn(), tagged: vi.fn(), getPost: vi.fn(), moderateTag: vi.fn(), canComment: () => false, comments: vi.fn() } }));
vi.mock('../../infra/reputationApi', () => ({ reputationApi: { getPublicSummary: vi.fn() } }));
vi.mock('../../contexts/BarbershopContext', () => ({ useBarbershop: () => ({ services: [], isShopOpen: () => true, getTodayScheduleDisplay: () => '09:00 – 18:00' }) }));
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
  vi.mocked(socialApi.tagged).mockResolvedValue([]);
  vi.mocked(reputationApi.getPublicSummary).mockResolvedValue({ average: null, count: 0, threshold: 3, showAverage: false, reviews: [] });
});

it('mostra apenas publicações públicas na grade, sem rascunhos e sem stories', async () => {
  mount({ posts: [post, { ...post, id: 'draft', status: 'draft' }, { ...post, id: 'story', format: 'story' }] });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.getByTestId('profile-post-grid').querySelectorAll('button')).toHaveLength(1);
  expect(screen.queryByText('0.0')).not.toBeInTheDocument();
});
it('filtra vídeos na aba específica', async () => {
  mount({ posts: [post, { ...post, id: 'video', title: 'Bastidores', videoUrl: '/reel.mp4' }] });
  fireEvent.click(screen.getByRole('tab', { name: 'Vídeos' }));
  expect(screen.getByRole('button', { name: 'Abrir vídeo: Bastidores' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Abrir publicação: Arte nova' })).not.toBeInTheDocument();
});
it('não exibe média abaixo do limiar, mas mantém os depoimentos reais', async () => {
  vi.mocked(reputationApi.getPublicSummary).mockResolvedValue({ average: 5, count: 1, threshold: 3, showAverage: false, reviews: [{ id: 'review', rating: 5, clientName: 'Ana', comment: 'Muito bom!', createdAt: new Date().toISOString() }] });
  mount();
  fireEvent.click(screen.getByRole('tab', { name: 'Avaliações' }));
  expect(await screen.findByText('Muito bom!')).toBeInTheDocument();
  expect(screen.queryByText('5.0')).not.toBeInTheDocument();
  expect(screen.getByLabelText('5 de 5 estrelas')).toBeInTheDocument();
});
it('oferece somente a fila quando o salão não trabalha com agendamentos', async () => {
  mount({ settings: { ...settings, operationMode: 'QUEUE_ONLY' } });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.getByRole('button', { name: 'Entrar na fila' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Agendar' })).not.toBeInTheDocument();
});
it('não expõe edição ou moderação da equipe no perfil público', async () => {
  mount({ currentUser: owner, audience: 'public' });
  await waitFor(() => expect(socialApi.tagged).toHaveBeenCalledWith('salon'));
  expect(socialApi.tagged).not.toHaveBeenCalledWith('salon', true);
  expect(screen.queryByRole('button', { name: 'Alterar logo' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Criar publicação' })).not.toBeInTheDocument();
});
it('o responsável aprova marcações pendentes com escopo do salão', async () => {
  vi.mocked(socialApi.tagged).mockImplementation(async (_id, pending) => pending ? [{ id: 'tag', postId: 'other-post', barbershopId: 'salon', status: 'PENDING', post: { ...post, id: 'other-post', barbershopId: 'other', shopName: 'Parceiro' } }] : []);
  vi.mocked(socialApi.moderateTag).mockResolvedValue();
  mount({ currentUser: owner, audience: 'staff' });
  fireEvent.click(screen.getByRole('tab', { name: 'Marcados' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Aprovar' }));
  await waitFor(() => expect(socialApi.moderateTag).toHaveBeenCalledWith('salon', 'tag', true));
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
it('separa marcados da grade própria e preserva a identidade de origem', async () => {
  vi.mocked(socialApi.tagged).mockResolvedValue([{ id: 'tag', postId: 'other-post', barbershopId: 'salon', status: 'APPROVED', post: { ...post, id: 'other-post', title: 'Colaboração', barbershopId: 'other', shopName: 'Parceiro' } }]);
  mount();
  fireEvent.click(screen.getByRole('tab', { name: 'Marcados' }));
  expect(await screen.findByRole('button', { name: 'Abrir publicação: Colaboração' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Abrir publicação: Arte nova' })).not.toBeInTheDocument();
});
