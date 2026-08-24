import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { AccessBlockedPage } from './AccessBlockedPage';
import { renderWithProviders } from '../tests/testUtils';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Owner', email: 'o@test.com', role: 'owner' },
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
    blockInfo: {
      code: 'SUBSCRIPTION_REQUIRED',
      message: 'Assinatura necessária para continuar.',
    },
    refresh: vi.fn(),
    clearBlock: vi.fn(),
  }),
}));

describe('AccessBlockedPage', () => {
  it('renderiza mensagem de bloqueio sem crash', () => {
    renderWithProviders(<AccessBlockedPage />, { route: '/bloqueado' });
    expect(
      screen.getByRole('heading', { name: /assinatura necessária/i }),
    ).toBeInTheDocument();
  });
});
