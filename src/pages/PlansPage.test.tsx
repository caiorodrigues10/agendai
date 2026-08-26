import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
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

vi.mock('../components/marketing/PricingPersuasionCharts', () => ({
  PricingPersuasionCharts: () => <div data-testid="pricing-charts" />,
}));

describe('PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista planos mockados sem crash', async () => {
    renderWithProviders(<PlansPage />, { route: '/planos' });
    expect(screen.getByTestId('marketing-nav')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/essencial \/ mês/i)).toBeInTheDocument();
    });
  });
});
