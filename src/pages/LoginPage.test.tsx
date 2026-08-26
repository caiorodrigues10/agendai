import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '../tests/testUtils';

const loginMock = vi.fn();
const registerMock = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: loginMock,
    register: registerMock,
    logout: vi.fn(),
    hasRole: () => false,
  }),
}));

vi.mock('../utils/referralStorage', () => ({
  referralStorage: {
    get: () => null,
    set: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('LoginPage (usabilidade)', () => {
  beforeEach(() => {
    loginMock.mockReset();
    registerMock.mockReset();
  });

  it('renderiza formulário de login com e-mail e senha', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(screen.getByPlaceholderText(/seu@email\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /entrar/i }).length).toBeGreaterThan(0);
  });

  it('mostra validação ao submeter login vazio', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });
    const submit = screen.getAllByRole('button', { name: /entrar/i })[0];
    await user.click(submit);
    expect(loginMock).not.toHaveBeenCalled();
  });
});
