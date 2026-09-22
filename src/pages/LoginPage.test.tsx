/// <reference types="vitest/globals" />
import { fireEvent, screen } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '../tests/testUtils';

const loginMock = vi.fn();
const registerMock = vi.fn();
const registerWithGoogleMock = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: loginMock,
    loginWithGoogle: vi.fn(),
    register: registerMock,
    registerWithGoogle: registerWithGoogleMock,
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
    registerWithGoogleMock.mockReset();
  });

  it('renderiza formulário de login com e-mail e senha', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(screen.getByPlaceholderText(/seu@email\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /entrar/i }).length).toBeGreaterThan(0);
  });

  it('mostra validação ao submeter login vazio', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    const submit = screen.getAllByRole('button', { name: /entrar/i })[0];
    fireEvent.click(submit);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('renderiza passo 1 do cadastro com campos de acesso', () => {
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });
    expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });
});
