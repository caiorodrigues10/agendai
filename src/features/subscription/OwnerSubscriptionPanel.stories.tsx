import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { OwnerSubscriptionPanel } from './OwnerSubscriptionPanel';
import { StoryProviders } from '../../tests/storyProviders';
import { SubscriptionProvider } from '../../contexts/SubscriptionContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { authStorage } from '../../infra/authStorage';
import type { CancellationContext, MySubscription } from '../../infra/subscriptionsApi';
import type { Plan } from '../../infra/plansApi';
import type { StaffMember } from '../../types';

const storyUser: StaffMember = {
  id: 'usr-1',
  name: 'Caio',
  email: 'caio@agendaja.com.br',
  role: 'OWNER',
  barbershopId: 'shop-1',
  emailVerified: true,
};

const plans: Plan[] = [
  {
    id: 'plan-essencial',
    name: 'Essencial',
    description: 'Fila + agenda',
    price: 59.9,
    billingCycle: 'MONTHLY',
    maxEmployees: 0,
    hasDashboard: false,
    tierKey: 'essencial',
    features: ['Fila digital + agenda', 'Funcionários ilimitados', 'Link público do salão'],
    active: true,
    createdAt: '2026-01-02T12:00:00.000Z',
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    description: 'Painel completo',
    price: 119.9,
    billingCycle: 'MONTHLY',
    maxEmployees: 0,
    hasDashboard: true,
    tierKey: 'pro',
    features: ['Dashboard e relatórios', 'Financeiro, despesas e fiado', 'Insights de movimento + IA'],
    active: true,
    createdAt: '2026-01-02T12:00:00.000Z',
  },
];

const mySubscription: MySubscription = {
  subscription: {
    id: 'sub-1',
    barbershopId: 'shop-1',
    planId: 'plan-essencial',
    planName: 'Essencial',
    planPrice: 59.9,
    planBillingCycle: 'MONTHLY',
    planHasDashboard: false,
    status: 'ACTIVE',
    startDate: '2026-01-20T12:00:00.000Z',
    endDate: null,
    cancelDate: null,
    createdAt: '2026-01-20T12:00:00.000Z',
    trialEndsAt: '2026-01-30T12:00:00.000Z',
    daysRemainingInTrial: null,
    hasPaymentMethod: true,
    cardLast4: '4242',
    cardBrand: 'visa',
    latestInvoice: null,
  },
  plans,
};

const cancellationContext: CancellationContext = {
  hasUsage: true,
  usageDays: 214,
  appointmentsTotal: 380,
  appointmentsCompleted: 312,
  queueCompleted: 445,
  postsPublished: 18,
  revenue: 48250.5,
  uniqueCustomers: 156,
  savingsSoFar: 240,
  yearlySavingsPerYear: 239.8,
  currentBillingCycle: 'MONTHLY',
  planName: 'Essencial',
  proratedRefundAvailable: false,
  refundProvider: null,
};

const mswHandlers = [
  http.get('/api/auth/me', () => HttpResponse.json({ user: storyUser })),
  http.get('/api/subscriptions/me', () =>
    HttpResponse.json({ success: true, data: mySubscription })
  ),
  http.get('/api/plans', () => HttpResponse.json({ success: true, data: plans })),
  http.get('/api/plans/:id', ({ params }) =>
    HttpResponse.json({
      success: true,
      data: plans.find(p => p.id === String(params.id)) ?? plans[1],
    })
  ),
  http.get('/api/subscriptions/cancellation-context', () =>
    HttpResponse.json({ success: true, data: cancellationContext })
  ),
];

/**
 * Semeia token/usuário em `sessionStorage` (sem `rememberMe`) antes do
 * AuthProvider montar e limpa tudo ao desmontar: o test-runner usa um único
 * contexto do Playwright, então storage vaza entre stories sem este cleanup.
 */
const StoryFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  title: 'Assinatura/OwnerSubscriptionPanel',
  component: OwnerSubscriptionPanel,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => {
      authStorage.setAccessToken('story-access-token', false);
      authStorage.setUser(storyUser, false);
      return (
        <MemoryRouter>
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
} satisfies Meta<typeof OwnerSubscriptionPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Espera o painel carregado (assinatura + grade de planos) antes do capture. */
const waitForPanel = async (canvas: ReturnType<typeof within>) => {
  await canvas.findByText('Ativa', {}, { timeout: 10000 });
  await canvas.findByText('Pagar Pro', {}, { timeout: 10000 });
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitForPanel(within(canvasElement));
  },
};

/** Modal de cancelamento (Etapa 6d, já convertido para ModalShell). */
export const Cancelamento: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForPanel(canvas);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Cancelar' }, { timeout: 10000 })
    );
    const body = within(document.body);
    await body.findByText('Sentimos muito em ver você ir', {}, { timeout: 10000 });
    await body.findByText('clientes atendidos', {}, { timeout: 10000 });
  },
};

/**
 * Overlay do checkout (`payOpen`) — alvo da D-010: baseline pré-conversão do
 * `fixed inset-0` full-screen com o `SubscriptionCheckout` embutido.
 */
export const CheckoutAberto: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForPanel(canvas);
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Pagar / renovar Essencial' },
        { timeout: 10000 }
      )
    );
    const body = within(document.body);
    await body.findByText('Plano escolhido', {}, { timeout: 10000 });
  },
};
