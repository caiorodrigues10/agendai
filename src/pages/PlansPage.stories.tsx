import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { expect, waitFor, within } from 'storybook/test';
import { PlansPage } from './PlansPage';
import { StoryProviders } from '../tests/storyProviders';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import type { Plan } from '../infra/plansApi';

/**
 * Planos anuais com preço fora dos defaults de `marketing/planPrices`
 * (Essencial R$ 140/ano e Pro R$ 200/ano): assim o preço renderizado só
 * aparece se `GET /api/plans` realmente responder.
 */
const plans: Plan[] = [
  {
    id: 'plan-essential-yearly',
    name: 'Essencial',
    description: 'Fila, agenda e equipe ilimitada',
    price: 120,
    billingCycle: 'YEARLY',
    maxEmployees: 0,
    hasDashboard: false,
    features: ['Fila digital', 'Agenda online'],
    active: true,
  },
  {
    id: 'plan-pro-yearly',
    name: 'Pro',
    description: 'Dashboard, financeiro e insights',
    price: 240,
    billingCycle: 'YEARLY',
    maxEmployees: 0,
    hasDashboard: true,
    features: ['Dashboard', 'Financeiro'],
    active: true,
  },
];

const plansHandler = http.get('/api/plans', () =>
  HttpResponse.json({ success: true, data: plans })
);

const meta = {
  title: 'Públicas/PlansPage',
  component: PlansPage,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <MemoryRouter initialEntries={['/planos']}>
        <StoryProviders withAuth>
          <SubscriptionProvider>
            <Story />
          </SubscriptionProvider>
        </StoryProviders>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [plansHandler] },
  },
} satisfies Meta<typeof PlansPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A página usa framer-motion (`initial opacity 0 → animate`); o axe do
 * addon-a11y roda no `afterEach`, logo após o play, e amostraria cores no
 * meio do fade (contrastes falsos). Espera as animações de entrada terminarem.
 */
const settleMotion = () => new Promise(resolve => setTimeout(resolve, 1500));

/**
 * `GET /api/plans` → 200 `{ success: true, data: [...] }`: os cards mostram o
 * preço anual derivado do fixture (R$ 10,00/mês, cobrado R$ 120,00/ano).
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: /^essencial$/i }, { timeout: 10000 });
    const essentialPrice = await canvas.findByTestId('plan-price-essential', {}, {
      timeout: 10000,
    });
    await waitFor(() => expect(essentialPrice.textContent).toContain('10,00'), {
      timeout: 10000,
    });
    const billed = await canvas.findByTestId('plan-billed-essential', {}, { timeout: 10000 });
    await waitFor(() => expect(billed.textContent).toContain('120,00'), { timeout: 10000 });
    await settleMotion();
  },
};

/**
 * `GET /api/plans` → 500 `{ success: false, message }`: o banner de erro
 * aparece entre o seletor mensal/anual e os cards (futuro SectionError) e a
 * mensagem do corpo da resposta é exibida como está.
 */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/plans', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível carregar os planos. Tente novamente.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      /Não foi possível carregar os planos/,
      {},
      { timeout: 10000 }
    );
    await settleMotion();
  },
};
