/// <reference types="vitest/globals" />
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { SubscriptionCheckout } from './CheckoutPage';
import { renderWithProviders } from '../tests/testUtils';

const subscribe = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Caio', email: 'caio@example.com', role: 'OWNER' },
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    hasRole: () => true,
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
    ]),
    get: vi.fn(),
  },
  pickPlanForCheckout: (list: { billingCycle: string }[]) => list[0],
}));

vi.mock('../infra/subscriptionsApi', () => ({
  subscriptionsApi: {
    subscribe: (...args: unknown[]) => subscribe(...args),
    setupTrialCard: vi.fn(),
  },
}));

vi.mock('../components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}));

describe('SubscriptionCheckout PCI', () => {
  beforeEach(() => {
    subscribe.mockReset();
  });

  it('não coleta PAN/CVV e oferece PIX e checkout hospedado de cartão', async () => {
    renderWithProviders(<SubscriptionCheckout billing="MONTHLY" />, { route: '/checkout' });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^PIX$/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /^Cartão$/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/cvv/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/•••• •••• •••• ••••/)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/número do cartão/i);

    fireEvent.click(screen.getByRole('button', { name: /^Cartão$/i }));
    expect(screen.queryByLabelText(/cvv/i)).not.toBeInTheDocument();
  });
});
