import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShopProfile } from './ShopProfile';
import { socialApi } from '../../infra/socialApi';
import type { FeedPost, ShopSettings, StaffMember } from '../../types';

vi.mock('../../infra/socialApi', () => ({
  socialApi: {
    stories: vi.fn(),
    gallery: vi.fn(),
    tagged: vi.fn(),
    getPost: vi.fn(),
    moderateTag: vi.fn(),
    canComment: () => false,
    comments: vi.fn(),
  },
}));
vi.mock('../../contexts/BarbershopContext', async () => {
  const { createContext } = await import('react');
  return {
    useBarbershop: () => ({
      services: [],
      isShopOpen: () => true,
      getTodayScheduleDisplay: () => '09:00 – 18:00',
    }),
    // O useSegmentLabels lê o contexto cru; sem valor ele cai no default.
    BarbershopContext: createContext(undefined),
  };
});
vi.mock('../../contexts/BarbershopFiltersContext', () => ({
  useBarbershopFilters: () => ({ barbershopId: 'salon' }),
}));

const settings: ShopSettings = {
  shopName: 'Studio Teste',
  whatsapp: '11999999999',
  schedule: [],
  operationMode: 'HYBRID',
};
const post: FeedPost = {
  id: 'post',
  barbershopId: 'salon',
  type: 'announcement',
  title: 'Arte nova',
  content: 'Novidades',
  imageUrl: '/photo.png',
  createdAt: Date.now(),
  publishedAt: Date.now(),
  status: 'published',
  likes: 0,
};
const owner: StaffMember = {
  id: 'owner',
  name: 'Dono',
  email: 'dono@example.test',
  role: 'OWNER',
  barbershopId: 'salon',
};
function mount(props: Partial<Parameters<typeof ShopProfile>[0]> = {}, initialEntry = '/profile') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ShopProfile
        settings={settings}
        posts={[post]}
        currentUser={null}
        onDeletePost={vi.fn()}
        onLikePost={vi.fn()}
        {...props}
      />
    </MemoryRouter>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(socialApi.stories).mockResolvedValue([]);
  vi.mocked(socialApi.gallery).mockResolvedValue([]);
  vi.mocked(socialApi.tagged).mockResolvedValue([]);
});
afterEach(() => {
  vi.unstubAllEnvs();
  delete (window.navigator as { share?: unknown }).share;
});

it('mostra apenas publicações públicas na grade, sem rascunhos e sem stories', async () => {
  mount({
    posts: [
      post,
      { ...post, id: 'draft', status: 'draft' },
      { ...post, id: 'story', format: 'story' },
    ],
  });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.getByTestId('profile-post-grid').querySelectorAll('button')).toHaveLength(1);
  expect(screen.queryByText('0.0')).not.toBeInTheDocument();
});
it('mantém o título de post sem imagem limitado e o rodapé em linha própria', async () => {
  mount({
    posts: [
      {
        ...post,
        imageUrl: undefined,
        title: 'Corte + barba Agenda de sexta abriu Barba terça em 20% off',
      },
    ],
  });
  const tile = await screen.findByTestId('profile-text-post');
  const title = tile.querySelector('span.line-clamp-3');
  expect(tile).toHaveClass('aspect-square');
  expect(title).toHaveClass('break-words', 'hyphens-auto', 'text-sm', 'font-semibold');
  expect(title?.className).not.toMatch(/absolute|sm:text-|text-lg/);
  const footer = screen.getByTestId('profile-post-footer');
  expect(footer.className).not.toMatch(/\babsolute\b/);
  expect(footer.parentElement).toBe(tile);
});

it('exibe apenas as abas Publicações e Sobre', async () => {
  mount();
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  const tabs = screen.getAllByRole('tab').map(t => t.textContent);
  expect(tabs).toEqual(['Publicações', 'Sobre']);
});
it('mantém um único estado de carregamento para a área unificada', () => {
  vi.mocked(socialApi.gallery).mockReturnValue(new Promise(() => undefined));
  mount();
  expect(screen.getByLabelText('Carregando publicações')).toBeInTheDocument();
});

it('mostra um único estado de erro com retry para a área unificada', async () => {
  vi.mocked(socialApi.gallery).mockRejectedValueOnce(new Error('boom'));
  mount();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Não foi possível carregar as publicações'
  );
  expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
});

it('mostra um estado vazio coerente para o visitante', async () => {
  mount({ posts: [] });
  expect(await screen.findByText('Ainda não há publicações')).toBeInTheDocument();
});

it('mostra um estado vazio acionável para o dono', async () => {
  mount({ posts: [], currentUser: owner, audience: 'staff' });
  expect(await screen.findByText('O próximo post começa aqui')).toBeInTheDocument();
});

it('trata o link legado ?tab=fotos como Publicações', async () => {
  mount({}, '/profile?tab=fotos');
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.getByRole('tab', { name: 'Publicações' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByRole('tab', { name: 'Fotos' })).not.toBeInTheDocument();
});
it('une posts e fotos avulsas sem duplicar e usa um único contador', async () => {
  vi.mocked(socialApi.gallery).mockResolvedValue([
    {
      id: 'ph-duplicate',
      url: '/photo.png',
      mimeType: 'image/png',
      createdAt: '2026-10-21T10:00:00.000Z',
    },
    {
      id: 'ph-orphan',
      url: 'https://cdn.example.com/2.png',
      mimeType: 'image/png',
      createdAt: '2026-10-20T10:00:00.000Z',
    },
  ]);
  mount();
  await waitFor(() => expect(socialApi.gallery).toHaveBeenCalledTimes(1));

  const grid = screen.getByTestId('profile-post-grid');
  await waitFor(() => expect(grid.querySelectorAll('button')).toHaveLength(2));
  expect(screen.getAllByAltText('Foto do salão')).toHaveLength(1);
  expect(screen.getByText('publicações').previousElementSibling).toHaveTextContent('2');
  expect(screen.queryByText('fotos')).not.toBeInTheDocument();
});
it('foto avulsa abre no mesmo lightbox usado pelo perfil', async () => {
  vi.mocked(socialApi.gallery).mockResolvedValue([
    {
      id: 'ph-orphan',
      url: 'https://cdn.example.com/2.png',
      mimeType: 'image/png',
      createdAt: '2026-10-20T10:00:00.000Z',
    },
  ]);
  mount();
  const photoButton = await screen.findByRole('button', { name: /^Abrir foto do salão/ });
  fireEvent.click(photoButton);
  expect(screen.getByRole('dialog', { name: 'Foto do salão' })).toBeInTheDocument();
  expect(screen.getByTestId('profile-photo-lightbox')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Fechar foto' })).toBeInTheDocument();
});
it('vídeos publicados continuam visíveis na grade de Publicações', async () => {
  mount({ posts: [post, { ...post, id: 'video', title: 'Bastidores', videoUrl: '/reel.mp4' }] });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.getByRole('button', { name: /^Abrir vídeo: Bastidores/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Abrir publicação: Arte nova/ })).toBeInTheDocument();
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
it('oferece somente a agenda quando o salão não trabalha com fila', async () => {
  mount({ settings: { ...settings, operationMode: 'APPOINTMENTS_ONLY' } });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.getByRole('button', { name: 'Agendar' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Entrar na fila' })).not.toBeInTheDocument();
});
it('mantém alvos de toque, foco e estados legíveis nas ações e abas', async () => {
  mount();
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());

  const queue = screen.getByRole('button', { name: 'Entrar na fila' });
  expect(queue).toHaveClass(
    'min-h-11',
    'bg-accent-active-bg',
    'text-accent-active-fg',
    'focus-visible:outline-focus'
  );

  const whatsapp = screen.getByRole('link', { name: 'WhatsApp ↗' });
  const share = screen.getByRole('button', { name: 'Compartilhar perfil' });
  for (const action of [whatsapp, share]) {
    expect(action).toHaveClass('min-h-11', 'text-text-primary', 'focus-visible:outline-focus');
  }

  const publications = screen.getByRole('tab', { name: 'Publicações' });
  const about = screen.getByRole('tab', { name: 'Sobre' });
  expect(publications).toHaveClass(
    'min-h-12',
    'bg-accent-active-bg',
    'text-accent-active-fg',
    'focus-visible:outline-focus'
  );
  expect(about).toHaveClass(
    'min-h-12',
    'text-text-secondary',
    'hover:text-text-primary',
    'focus-visible:outline-focus'
  );
});
it('stories expirados não aparecem e stories ativos abrem o visualizador', async () => {
  vi.mocked(socialApi.stories).mockResolvedValue([
    {
      ...post,
      id: 'expired',
      title: 'Expirado',
      format: 'story',
      publishedAt: Date.now() - 25 * 3600_000,
    },
    { ...post, id: 'active', title: 'Hoje', format: 'story' },
  ]);
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Ver story: Hoje' }));
  expect(screen.getByRole('dialog', { name: 'Story' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Ver story: Expirado' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Fechar story' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('sem redes sociais não rende espaço vazio no cabeçalho nem na aba Sobre', async () => {
  mount();
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  expect(screen.queryByLabelText(/^Abrir .* de /)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Sobre' }));
  expect(screen.queryByText('Redes sociais')).not.toBeInTheDocument();
});
it('ícones das redes preenchidas aparecem no cabeçalho com link em nova aba', async () => {
  mount({
    settings: {
      ...settings,
      socialLinks: { instagram: 'https://instagram.com/estudio', x: 'https://x.com/estudio' },
    },
  });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  const instagram = screen.getByRole('link', { name: 'Abrir Instagram de Studio Teste' });
  expect(instagram).toHaveAttribute('href', 'https://instagram.com/estudio');
  expect(instagram).toHaveAttribute('target', '_blank');
  expect(instagram).toHaveAttribute('rel', 'noopener noreferrer');
  expect(screen.getByRole('link', { name: 'Abrir X de Studio Teste' })).toHaveAttribute(
    'href',
    'https://x.com/estudio'
  );
  expect(
    screen.queryByRole('link', { name: 'Abrir TikTok de Studio Teste' })
  ).not.toBeInTheDocument();
});
it('aba Sobre lista as redes com link em nova aba', async () => {
  mount({
    settings: {
      ...settings,
      socialLinks: { youtube: '@seucanal', facebook: 'facebook.com/suapagina' },
    },
  });
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('tab', { name: 'Sobre' }));
  // Cabeçalho + Sobre: todos os alvos apontam para a URL canônica em nova aba.
  for (const link of screen.getAllByRole('link', { name: 'Abrir YouTube de Studio Teste' })) {
    expect(link).toHaveAttribute('href', 'https://youtube.com/@seucanal');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  expect(
    screen.getAllByRole('link', { name: 'Abrir Facebook de Studio Teste' }).length
  ).toBeGreaterThan(0);
  expect(
    screen.getAllByRole('link', { name: 'Abrir Facebook de Studio Teste' })[0]
  ).toHaveAttribute('href', 'https://facebook.com/suapagina');
});

it('botão Compartilhar usa o link público /s/salon/:id (não a rota da SPA)', async () => {
  vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://agendai.example.com');
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(window.navigator, 'share', {
    value: share,
    configurable: true,
    writable: true,
  });

  mount();
  await waitFor(() => expect(socialApi.stories).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Compartilhar perfil' }));

  await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
  expect(share.mock.calls[0][0]).toEqual({
    title: 'Studio Teste',
    url: 'https://agendai.example.com/s/salon/salon',
  });
});
