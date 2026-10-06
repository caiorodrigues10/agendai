import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { http, HttpResponse } from 'msw';
import { within } from 'storybook/test';
import { ReferralsTab } from './ReferralsTab';
import type { ReferralPlatformStats } from '../../infra/adminApi';
import { authStorage } from '../../infra/authStorage';

const stats: ReferralPlatformStats = {
  totalReferrals: 12,
  converted: 8,
  rejected: 1,
  pending: 3,
  conversionRate: 66.7,
  totalCreditDays: 30,
  topReferrers: [
    {
      barbershopId: 'shop-1',
      barbershopName: 'Barbearia Central',
      totalReferrals: 5,
      creditDays: 15,
    },
    {
      barbershopId: 'shop-2',
      barbershopName: 'Estúdio Norte',
      totalReferrals: 3,
      creditDays: 9,
    },
  ],
  monthlyEvolution: [
    { month: '2026-05', count: 1 },
    { month: '2026-06', count: 3 },
    { month: '2026-07', count: 2 },
    { month: '2026-08', count: 4 },
    { month: '2026-09', count: 2 },
  ],
};

const referralsOk = http.get('/api/admin/referrals', () =>
  HttpResponse.json({ success: true, data: stats })
);

const referralsError = http.get('/api/admin/referrals', () =>
  HttpResponse.json(
    { success: false, message: 'Não foi possível carregar indicações.' },
    { status: 500 }
  )
);

/**
 * `adminApi.getAuthHeader()` lança "Não autenticado" sem access token —
 * semeia um token barato antes do fetch e limpa ao desmontar (o test-runner
 * usa um único contexto do Playwright; storage vaza entre stories).
 */
const StoryFrame = ({ children }: { children: ReactNode }) => {
  useEffect(() => () => authStorage.clearTokens(), []);
  return <>{children}</>;
};

const meta = {
  title: 'MasterAdmin/ReferralsTab',
  component: ReferralsTab,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => {
      authStorage.setAccessToken('story-access-token', false);
      return (
        <StoryFrame>
          <Story />
        </StoryFrame>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [referralsOk] },
  },
} satisfies Meta<typeof ReferralsTab>;
export default meta;
type Story = StoryObj<typeof meta>;

/** `GET /api/admin/referrals` → 200 com as métricas globais do programa. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Indicações da plataforma', {}, { timeout: 10000 });
    await canvas.findByText('Barbearia Central', {}, { timeout: 10000 });
    await canvas.findByText('66.7%', {}, { timeout: 10000 });
  },
};

/**
 * `GET /api/admin/referrals` → 500 `{ success: false, message }`.
 * O branch de erro (ReferralsTab.tsx) substitui o corpo do componente e
 * exibe a mensagem + botão "Tentar de novo".
 */
export const Erro: Story = {
  parameters: { msw: { handlers: [referralsError] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      /Não foi possível carregar indicações/,
      {},
      { timeout: 10000 }
    );
    await canvas.findByText('Tentar novamente', {}, { timeout: 10000 });
  },
};
