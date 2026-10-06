/**
 * Story da rota pública `/checkout?planId=...`: o `CheckoutPage` lê o plano do
 * query param `planId` (`useSearchParams`, CheckoutPage.tsx:931) e monta o
 * `SubscriptionCheckout` na variante `page` — sem portal, então tudo é
 * consultado dentro do `canvasElement`.
 *
 * Composição de providers na mesma ordem do app (`src/app/index.tsx`):
 * BarbershopFilters → Auth → Theme → Subscription, dentro de um `MemoryRouter`
 * já posicionado na rota de checkout. Token/usuário são semeados no
 * `authStorage` antes do AuthProvider montar (o boot chama `GET /api/auth/me`
 * com o Bearer e o SubscriptionProvider chama `GET /api/subscriptions/me`) e
 * limpos ao desmontar — o test-runner usa um único contexto do Playwright, e
 * sem o cleanup o storage vaza entre stories.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { CheckoutPage } from './CheckoutPage';
import { StoryProviders } from '../tests/storyProviders';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { authStorage } from '../infra/authStorage';
import type { Plan } from '../infra/plansApi';
import type { MySubscription } from '../infra/subscriptionsApi';
import type { StaffMember } from '../types';

const storyUser: StaffMember = {
  id: 'usr-1',
  name: 'Caio',
  email: 'caio@agendaja.com.br',
  role: 'OWNER',
  barbershopId: 'shop-1',
  emailVerified: true,
};

const planPro: Plan = {
  id: 'plan-pro',
  name: 'Pro',
  description: 'Painel completo',
  price: 1199,
  billingCycle: 'YEARLY',
  maxEmployees: 0,
  hasDashboard: true,
  tierKey: 'pro',
  features: ['Dashboard e relatórios', 'Financeiro, despesas e fiado'],
  active: true,
  createdAt: '2026-01-02T12:00:00.000Z',
};

const mySubscription: MySubscription = {
  subscription: null,
  trial: {
    isInTrial: true,
    trialEndsAt: '2026-10-31T12:00:00.000Z',
    daysRemainingInTrial: 30,
    isExpired: false,
  },
  plans: [planPro],
};

const json = (data: unknown) => HttpResponse.json({ success: true, data });

/**
 * Handlers compartilhados (o `mswLoader` do preview troca o conjunto inteiro a
 * cada story). Envelopes: `{ success, data }` para as APIs de domínio e
 * `{ user }` para o boot da sessão (authApi.me).
 */
const mswHandlers = [
  http.get('/api/auth/me', () => HttpResponse.json({ user: storyUser })),
  http.get('/api/subscriptions/me', () => json(mySubscription)),
  // plansApi.get('plan-pro') → unwrap de { success, data }
  http.get('/api/plans/:id', () => json(planPro)),
];

/** Semeia sessão antes do AuthProvider montar e limpa ao desmontar. */
const StoryFrame = ({ children }: { children: ReactNode }) => {
  useEffect(
    () => () => {
      authStorage.clearTokens();
      authStorage.clearUser();
    },
    []
  );
  return <>{children}</>;
};

const meta = {
  title: 'Assinatura/CheckoutPage',
  component: CheckoutPage,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => {
      authStorage.setAccessToken('story-access-token', false);
      authStorage.setUser(storyUser, false);
      return (
        <MemoryRouter initialEntries={['/checkout?planId=plan-pro']}>
          <StoryFrame>
            <StoryProviders withAuth>
              <ThemeProvider>
                <SubscriptionProvider>
                  <Story />
                </SubscriptionProvider>
              </ThemeProvider>
            </StoryProviders>
          </StoryFrame>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof CheckoutPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Checkout renderizado: resumo do plano + botão de submissão do PIX visíveis. */
const waitForCheckout = async (canvas: ReturnType<typeof within>) => {
  await canvas.findByText('Plano escolhido', {}, { timeout: 10000 });
  await canvas.findByRole('heading', { name: 'Pro' }, { timeout: 10000 });
};

/** Plano carregado via `GET /api/plans/plan-pro` e corpo do checkout na variante `page`. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForCheckout(canvas);
    await canvas.findByRole('button', { name: 'Gerar QR Code PIX' }, { timeout: 10000 });
  },
};

/**
 * Banner de erro inline (CheckoutPage.tsx:511-515). Caminho escolhido: validação
 * client-side do cartão — troca para "Cartão" e submete sem preencher o documento,
 * então `validatePayerForm` devolve `CPF inválido. Confira o número.` antes de
 * qualquer chamada de rede (nenhum handler extra, zero latência/ambiguidade).
 */
export const Erro: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForCheckout(canvas);
    const tab = await canvas.findByRole('button', { name: 'Cartão' }, { timeout: 10000 });
    await userEvent.click(tab);
    await userEvent.click(
      await canvas.findByRole('button', { name: /Pagar/ }, { timeout: 10000 })
    );
    await canvas.findByText('CPF inválido. Confira o número.', {}, { timeout: 10000 });
  },
};
