import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { PostDetail } from './PostDetail';
import { authStorage } from '../../infra/authStorage';
import type { PublicSocialPost } from '../../infra/socialApi';

const post: PublicSocialPost = {
  id: 'post-1',
  type: 'announcement',
  title: 'Promoção de corte + barba',
  content: 'Somente esta semana: combo com 20% de desconto. Agende pelo perfil do salão.',
  createdAt: Date.parse('2026-09-28T10:00:00.000Z'),
  likes: 12,
  commentsCount: 1,
  shopName: 'Barbearia Central',
  postMode: 'both',
  ctaText: 'Agendar',
};

const commentsPage = {
  data: [
    {
      id: 'cmt-1',
      content: 'Fechou! Agendo para sábado.',
      createdAt: '2026-09-29T10:00:00.000Z',
      authorId: 'cli-9',
      authorName: 'João Silva',
    },
  ],
  meta: { page: 1, limit: 20, total: 1 },
};

const commentsOk = http.get('/api/salons/:salonId/posts/:postId/comments', () =>
  HttpResponse.json(commentsPage)
);

const commentFail = http.post('/api/salons/:salonId/posts/:postId/comments', () =>
  HttpResponse.json(
    { success: false, message: 'Não foi possível publicar o comentário.' },
    { status: 500 }
  )
);

const mswHandlers = [commentsOk];

/**
 * Limpa tokens de portal do cliente e `authStorage` ao desmontar: o
 * test-runner usa um único contexto do Playwright, então storage vaza entre
 * stories sem este cleanup (mesmo padrão de TicketDetailPage).
 */
const StoryFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(
    () => () => {
      authStorage.clearTokens();
      authStorage.clearUser();
      localStorage.removeItem('agendai_client_portal_access');
      localStorage.removeItem('agendai_client_portal_refresh');
      sessionStorage.removeItem('agendai_client_portal_access');
      sessionStorage.removeItem('agendai_client_portal_refresh');
    },
    []
  );
  return <>{children}</>;
};

const meta = {
  title: 'Loja/PostDetail',
  component: PostDetail,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => {
      // Semeia sessão ANTES do PostDetail montar: `canComment` e `viewerId`
      // nascem de `socialApi.canComment()`/`authStorage` no primeiro render.
      // Com token de staff, o efeito de `getMe` (portal do cliente) nem roda.
      authStorage.setAccessToken('story-staff-token', false);
      authStorage.setUser(
        { id: 'usr-story-1', name: 'Caio', role: 'CLIENT' },
        false
      );
      return (
        <MemoryRouter>
          <StoryFrame>
            <Story />
          </StoryFrame>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
  args: {
    salonId: 'shop-1',
    post,
    onLike: async () => undefined,
  },
} satisfies Meta<typeof PostDetail>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Feed público com o post e os comentários carregados (GET de comments →
 * success) e o formulário de comentário visível (viewer semeado no decorator).
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Barbearia Central', {}, { timeout: 10000 });
    await canvas.findByText('Promoção de corte + barba', {}, { timeout: 10000 });
    await canvas.findByText('Fechou! Agendo para sábado.', {}, { timeout: 10000 });
    await canvas.findByLabelText('Adicionar comentário', {}, { timeout: 10000 });
  },
};

/**
 * Falha ao publicar comentário (POST /api/salons/:salonId/posts/:postId/comments
 * → 500): banner `role="alert"` com o texto de fallback em L502 do PostDetail,
 * visível ao lado do form (o GET de comments permanece com sucesso).
 */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        commentFail,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Promoção de corte + barba', {}, { timeout: 10000 });
    await canvas.findByText('Fechou! Agendo para sábado.', {}, { timeout: 10000 });
    await userEvent.type(
      await canvas.findByLabelText('Adicionar comentário', {}, { timeout: 10000 }),
      'Quero agendar para amanhã'
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enviar comentário' }, { timeout: 10000 })
    );
    await canvas.findByText(
      /Não foi possível publicar o comentário/,
      {},
      { timeout: 10000 }
    );
  },
};
