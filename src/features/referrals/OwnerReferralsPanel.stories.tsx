import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { within } from 'storybook/test';
import { OwnerReferralsPanel } from './OwnerReferralsPanel';
import type { ReferralDashboard } from '../../infra/referralsApi';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const dashboard: ReferralDashboard = {
  code: 'EP6V4AAS',
  shareUrl: 'https://agendaja.com.br/convite/EP6V4AAS',
  rewardDays: 7,
  tier: {
    name: 'BRONZE',
    label: 'Bronze',
    rewardDays: 7,
    bonus: 0,
    threshold: 1,
    nextTier: 'SILVER',
    nextThreshold: 3,
  },
  convertedCount: 1,
  nextTierIn: 2,
  stats: {
    pending: 2,
    converted: 1,
    rejected: 0,
    total: 3,
    creditDays: 7,
    subscriptionEndDate: null,
  },
  referrals: [
    {
      id: 'ref-1',
      status: 'REWARDED',
      shopName: 'Barbearia Central',
      rewardDays: 7,
      createdAt: '2026-09-10T12:00:00.000Z',
      qualifiedAt: '2026-09-12T12:00:00.000Z',
      rewardedAt: '2026-09-13T12:00:00.000Z',
    },
    {
      id: 'ref-2',
      status: 'PENDING',
      shopName: 'Studio Aurora',
      rewardDays: 7,
      createdAt: '2026-09-28T12:00:00.000Z',
      qualifiedAt: null,
      rewardedAt: null,
    },
  ],
};

/** `GET /api/referrals/me` → 500 dispara o early-return `if (error && !data)`. */
const meErro = () =>
  http.get('/api/referrals/me', () =>
    HttpResponse.json(
      { success: false, message: 'Não foi possível carregar indicações.' },
      { status: 500 }
    )
  );

const mswHandlers = [http.get('/api/referrals/me', () => json(dashboard))];

const meta = {
  title: 'Indicações/OwnerReferralsPanel',
  component: OwnerReferralsPanel,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof OwnerReferralsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Dashboard carregado (nível, link de indicação e histórico). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: 'Indicações' }, { timeout: 10000 });
    await canvas.findByText('Seu link de indicação', {}, { timeout: 10000 });
  },
};

/**
 * Falha do carregamento (GET /api/referrals/me → 500): early-return com o
 * `SectionError` (mensagem + botão "Tentar novamente")
 * (OwnerReferralsPanel L74-L77).
 */
export const Erro: Story = {
  parameters: { msw: { handlers: [meErro()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(/Não foi possível carregar indicações/, {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: 'Tentar novamente' }, { timeout: 10000 });
  },
};
