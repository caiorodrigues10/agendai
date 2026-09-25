/// <reference types="vitest/globals" />
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '../tests/testUtils';
import type { StaffMember } from '../types';

const loginMock = vi.fn();
const registerMock = vi.fn();
const registerWithGoogleMock = vi.fn();
const loginWithGoogleMock = vi.fn();
const loginWithSavedAccountMock = vi.fn();
const forgetSavedAccountMock = vi.fn();
const navigateMock = vi.fn();
const subscriptionsMeMock = vi.hoisted(() => vi.fn());

let authState: { user: StaffMember | null; loading: boolean };
let hasStoredSessionMock = false;
let savedAccountsMock: Array<{ id: string; name: string; email: string; avatarUrl?: string }> = [];

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: authState.user,
    loading: authState.loading,
    login: loginMock,
    loginWithGoogle: loginWithGoogleMock,
    loginWithSavedAccount: loginWithSavedAccountMock,
    forgetSavedAccount: forgetSavedAccountMock,
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

vi.mock('../infra/authStorage', () => ({
  authStorage: {
    getSavedAccounts: () => savedAccountsMock,
    hasStoredSession: () => hasStoredSessionMock,
    getUser: () => authState.user,
  },
}));

vi.mock('../infra/subscriptionsApi', () => ({
  subscriptionsApi: { me: subscriptionsMeMock },
}));

describe('LoginPage (usabilidade)', () => {
  beforeEach(() => {
    authState = { user: null, loading: false };
    hasStoredSessionMock = false;
    savedAccountsMock = [];
    loginMock.mockReset();
    registerMock.mockReset();
    registerWithGoogleMock.mockReset();
    loginWithGoogleMock.mockReset();
    loginWithSavedAccountMock.mockReset();
    forgetSavedAccountMock.mockReset();
    navigateMock.mockReset();
    subscriptionsMeMock.mockReset();
    subscriptionsMeMock.mockRejectedValue(new Error('offline'));
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

  it('redireciona sessão master restaurada direto para o painel master', async () => {
    authState = {
      loading: false,
      user: {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'MASTER_ADMIN',
      } as StaffMember,
    };

    renderWithProviders(<LoginPage />, { route: '/login' });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/master/work', { replace: true });
    });
  });

  it('honra o deep link preservado (location.state.from) após autenticação', async () => {
    authState = {
      loading: false,
      user: {
        id: 'owner-1',
        name: 'Caio',
        email: 'caio@example.com',
        role: 'OWNER',
      } as StaffMember,
    };

    renderWithProviders(<LoginPage />, {
      route: '/login',
      entryState: { from: { pathname: '/app/financeiro' } },
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/app/financeiro', { replace: true });
    });
    expect(navigateMock).not.toHaveBeenCalledWith('/app/queue', { replace: true });
  });

  it('ignora deep link de rota de outro papel e cai no painel do usuário', async () => {
    authState = {
      loading: false,
      user: {
        id: 'emp-1',
        name: 'João',
        email: 'joao@example.com',
        role: 'EMPLOYEE',
      } as StaffMember,
    };

    renderWithProviders(<LoginPage />, {
      route: '/login',
      entryState: { from: { pathname: '/master/tickets' } },
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/app/queue', { replace: true });
    });
    expect(navigateMock).not.toHaveBeenCalledWith('/master/tickets', { replace: true });
  });

  it('aguarda restauracao antes de mostrar contas salvas', () => {
    authState = { user: null, loading: true };
    savedAccountsMock = [{ id: 'user-1', name: 'Caio', email: 'caio@example.com' }];

    renderWithProviders(<LoginPage />, { route: '/login' });

    expect(screen.queryByText(/contas salvas/i)).not.toBeInTheDocument();
  });

  it('renderiza passo 1 do cadastro com campos de acesso', () => {
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });
    expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });
});
