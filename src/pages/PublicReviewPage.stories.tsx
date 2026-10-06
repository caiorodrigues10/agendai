import type { Loader, Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fireEvent, within } from 'storybook/test';
import PublicReviewPage from './PublicReviewPage';
import type { PublicReviewContext } from '../infra/reputationApi';

const REVIEW_TOKEN = 'token-avalide';

/**
 * O token vive no `window.location.hash` (`#token=...`) e é lido em
 * `useState(getTokenFromLocation)` — ou seja, uma única vez, no mount.
 * O loader roda antes da renderização, então é o único ponto determinístico
 * para expor o hash ao componente. O próprio componente limpa o hash logo
 * após ler (`history.replaceState(pathname)`), sem poluir as próximas stories.
 */
const withReviewToken: Loader = () => {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#token=${REVIEW_TOKEN}`
  );
};

const reviewContext: PublicReviewContext = {
  id: 'rev-ctx-1',
  expiresAt: '2026-10-08T12:00:00.000Z',
  alreadySubmitted: false,
  barbershop: {
    id: 'shop-1',
    name: 'Barbearia Central',
    logoUrl: null,
    googleReviewUrl: null,
  },
  serviceName: 'Corte degradê',
  staffName: 'Rafael',
  customerName: 'João',
};

/**
 * `GET /api/reviews/public/context?token=...` → envelope `{ success, data }`
 * (o wrapper faz `unwrap` em `res.data`).
 */
const contextOk = http.get('/api/reviews/public/context', () =>
  HttpResponse.json({ success: true, data: reviewContext })
);

const mswHandlers = [contextOk];

const meta = {
  title: 'Públicas/PublicReviewPage',
  component: PublicReviewPage,
  tags: ['autodocs', 'test'],
  loaders: [withReviewToken],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof PublicReviewPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Contexto carregado (`GET /api/reviews/public/context?token=...` →
 * `{ success, data }`) com as estrelas liberadas para avaliação.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Avaliação verificada', {}, { timeout: 10000 });
    await canvas.findByText('Barbearia Central', {}, { timeout: 10000 });
    await canvas.findByText(/atendimento de corte degradê/, {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: 'Enviar avaliação' }, { timeout: 10000 });
  },
};

/**
 * Falha do envio (`POST /api/appointments/public/review` → 500
 * `{ success: false, message }`): banner inline de erro dentro do bloco
 * `mt-8 space-y-5` (site futuro do SectionError) mantém o formulário na tela.
 */
export const ErroEnvio: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.post('/api/appointments/public/review', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível enviar sua avaliação.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Avaliação verificada', {}, { timeout: 10000 });
    await fireEvent.click(
      await canvas.findByRole('button', { name: '5 estrelas' }, { timeout: 10000 })
    );
    await fireEvent.click(canvas.getByRole('button', { name: 'Enviar avaliação' }));
    await canvas.findByText(/Não foi possível enviar sua avaliação/, {}, { timeout: 10000 });
  },
};
