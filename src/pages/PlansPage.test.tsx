/// <reference types="vitest/globals" />
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlansPage } from './PlansPage';
import { renderWithProviders } from '../tests/testUtils';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    hasRole: () => false,
  }),
}));

vi.mock('../contexts/SubscriptionContext', () => ({
  useSubscription: () => ({
    data: null,
    loading: false,
    blockInfo: null,
    refresh: vi.fn(),
    clearBlock: vi.fn(),
  }),
}));

vi.mock('../infra/plansApi', () => ({
  plansApi: {
    list: vi.fn(async () => [
      {
        id: 'p1',
        name: 'Essencial',
        description: 'Plano básico',
        price: 14,
        billingCycle: 'MONTHLY',
        maxEmployees: 0,
        hasDashboard: false,
        features: ['Fila'],
        active: true,
      },
      {
        id: 'p2',
        name: 'Pro',
        description: 'Plano completo',
        price: 20,
        billingCycle: 'MONTHLY',
        maxEmployees: 0,
        hasDashboard: true,
        features: ['Dashboard'],
        active: true,
      },
    ]),
  },
}));

vi.mock('../components/marketing/MarketingNav', () => ({
  MarketingNav: () => <nav data-testid="marketing-nav">nav</nav>,
}));

vi.mock('../components/marketing/MarketingFooter', () => ({
  MarketingFooter: () => <footer data-testid="marketing-footer">footer</footer>,
}));

vi.mock('../features/marketing', () => ({
  PricingPersuasionCharts: () => <div data-testid="pricing-charts" />,
}));

describe('PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra teste, essencial e pro com o selo do plano popular', async () => {
    renderWithProviders(<PlansPage />, { route: '/planos' });
    expect(screen.getByTestId('marketing-nav')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /^essencial$/i })).toBeInTheDocument();
    expect(document.querySelector('h1')?.textContent).toMatch(/teste grátis ou escolha o plano/i);
    expect(screen.getByRole('heading', { name: /^teste grátis$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^pro$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /começar teste grátis/i })).toBeInTheDocument();
    expect(screen.getByText(/mais escolhido/i)).toBeInTheDocument();
    expect(screen.getByTestId('pricing-charts')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /essencial opera\. pro enxerga/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /objeções que a gente já ouviu/i })).toBeInTheDocument();
  });

  it('alterna o preço mensal e o equivalente anual', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlansPage />, { route: '/planos' });

    expect(await screen.findByTestId('plan-price-essential')).toHaveTextContent('11,67');
    expect(screen.getByTestId('plan-price-pro')).toHaveTextContent('16,67');
    expect(screen.getByTestId('plan-billed-essential')).toHaveTextContent('140,00');
    expect(screen.getByTestId('plan-billed-pro')).toHaveTextContent('200,00');

    await user.click(screen.getByRole('button', { name: /^mensal$/i }));

    expect(screen.getByTestId('plan-price-essential')).toHaveTextContent('14,00');
    expect(screen.getByTestId('plan-price-pro')).toHaveTextContent('20,00');
    expect(screen.queryByTestId('plan-billed-essential')).not.toBeInTheDocument();
    expect(screen.queryByTestId('plan-billed-pro')).not.toBeInTheDocument();
  });

  it('marca no essencial o que o plano não inclui', async () => {
    renderWithProviders(<PlansPage />, { route: '/planos' });
    const essential = (await screen.findByRole('heading', { name: /^essencial$/i })).closest(
      'article'
    );
    expect(essential).not.toBeNull();
    expect(
      within(essential as HTMLElement).getByRole('listitem', {
        name: /não inclui dashboard e relatórios/i,
      })
    ).toBeInTheDocument();
  });
});
