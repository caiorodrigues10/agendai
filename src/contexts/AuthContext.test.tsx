/// <reference types="vitest/globals" />
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { BarbershopFiltersProvider, useBarbershopFilters } from './BarbershopFiltersContext';
import { authApi } from '@/infra/authApi';
import { authStorage } from '@/infra/authStorage';
import { organizationsApi } from '@/infra/organizationsApi';
import { ApiError } from '@/infra/apiClient';

vi.mock('@/infra/authApi', () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    switchAccount: vi.fn(),
    forgetAccount: vi.fn(),
    googleLogin: vi.fn(),
    registerWithGoogle: vi.fn(),
  },
}));
vi.mock('@/infra/organizationsApi', () => ({
  organizationsApi: { switchShop: vi.fn() },
}));
vi.mock('@/infra/apiClient', async importOriginal => {
  const actual = await importOriginal<typeof import('@/infra/apiClient')>();
  return { ...actual, refreshAccessToken: vi.fn() };
});

const me = vi.mocked(authApi.me);
const loginApi = vi.mocked(authApi.login);
const googleLoginApi = vi.mocked(authApi.googleLogin);
const switchAccountApi = vi.mocked(authApi.switchAccount);
const switchShopApi = vi.mocked(organizationsApi.switchShop);

const ownerUser = {
  id: 'u1',
  name: 'Caio',
  email: 'caio@example.com',
  role: 'OWNER',
  barbershopId: 'b0',
};

function Capture() {
  const auth = useAuth();
  const { barbershopId } = useBarbershopFilters();
  const [result, setResult] = useState('');

  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="tenant">{barbershopId ?? 'none'}</span>
      <span data-testid="user-shop">{auth.user?.barbershopId ?? 'none'}</span>
      <span data-testid="origin">
        {auth.switchOrigin ? `${auth.switchOrigin.barbershopId}|${auth.switchOrigin.orgId}` : 'none'}
      </span>
      <span data-testid="result">{result}</span>
      <button
        type="button"
        onClick={() =>
          void auth.switchShop('org1', 'b1').then(r => setResult(JSON.stringify(r)))
        }
      >
        acessar
      </button>
      <button
        type="button"
        onClick={() => void auth.switchBack().then(r => setResult(JSON.stringify(r)))}
      >
        voltar
      </button>
      <button
        type="button"
        onClick={() =>
          void auth
            .login('caio@example.com', 'senha123', undefined, false)
            .then(r => setResult(JSON.stringify(r)))
        }
      >
        entrar sem manter
      </button>
      <button
        type="button"
        onClick={() => void auth.loginWithSavedAccount('u2').then(r => setResult(JSON.stringify(r)))}
      >
        usar conta salva
      </button>
      <button
        type="button"
        onClick={() =>
          void auth.loginWithGoogle('fake-google-id-token').then(r => setResult(JSON.stringify(r)))
        }
      >
        entrar com google
      </button>
    </div>
  );
}

function renderAuth() {
  return render(
    <BarbershopFiltersProvider>
      <AuthProvider>
        <Capture />
      </AuthProvider>
    </BarbershopFiltersProvider>,
  );
}

async function renderBooted() {
  const view = renderAuth();
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
  return view;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  authStorage.setTokens('access-1', 'refresh-1', true);
  authStorage.setUser(ownerUser, true);
  me.mockResolvedValue({ user: ownerUser });
});

describe('AuthContext.switchShop', () => {
  it('persiste a sessão trocada, grava a origem e muda o tenant dos filtros', async () => {
    switchShopApi.mockResolvedValue({
      user: { ...ownerUser, barbershopId: 'b1' },
      accessToken: 'access-2',
    });
    await renderBooted();
    expect(screen.getByTestId('tenant')).toHaveTextContent('none');

    await userEvent.click(screen.getByRole('button', { name: 'acessar' }));

    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('{"ok":true}'));
    expect(switchShopApi).toHaveBeenCalledWith('org1', 'b1');
    expect(screen.getByTestId('user-shop')).toHaveTextContent('b1');
    expect(screen.getByTestId('tenant')).toHaveTextContent('b1');
    expect(screen.getByTestId('origin')).toHaveTextContent('b0|org1');
    expect(authStorage.getAccessToken()).toBe('access-2');
    expect(authStorage.getUser().barbershopId).toBe('b1');
    expect(authStorage.getSwitchOrigin()).toEqual({ barbershopId: 'b0', orgId: 'org1' });
  });

  it('voltar para o salão de origem limpa o registro de origem', async () => {
    switchShopApi.mockResolvedValue({
      user: { ...ownerUser, barbershopId: 'b1' },
      accessToken: 'access-2',
    });
    await renderBooted();

    await userEvent.click(screen.getByRole('button', { name: 'acessar' }));
    await waitFor(() => expect(screen.getByTestId('origin')).toHaveTextContent('b0|org1'));

    switchShopApi.mockResolvedValue({
      user: { ...ownerUser, barbershopId: 'b0' },
      accessToken: 'access-3',
    });
    await userEvent.click(screen.getByRole('button', { name: 'voltar' }));

    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('{"ok":true}'));
    expect(switchShopApi).toHaveBeenLastCalledWith('org1', 'b0');
    expect(screen.getByTestId('user-shop')).toHaveTextContent('b0');
    expect(screen.getByTestId('tenant')).toHaveTextContent('b0');
    expect(screen.getByTestId('origin')).toHaveTextContent('none');
    expect(authStorage.getSwitchOrigin()).toBeNull();
    expect(authStorage.getAccessToken()).toBe('access-3');
  });

  it('devolve mensagem em português quando o backend nega o acesso', async () => {
    switchShopApi.mockRejectedValue(new ApiError('Você não tem acesso a este salão.', 403));
    await renderBooted();

    await userEvent.click(screen.getByRole('button', { name: 'acessar' }));

    await waitFor(() =>
      expect(screen.getByTestId('result')).toHaveTextContent(
        '{"ok":false,"message":"Você não tem acesso a este salão."}',
      ),
    );
    expect(screen.getByTestId('user-shop')).toHaveTextContent('b0');
    expect(screen.getByTestId('tenant')).toHaveTextContent('none');
    expect(screen.getByTestId('origin')).toHaveTextContent('none');
    expect(authStorage.getAccessToken()).toBe('access-1');
  });
});

describe('AuthContext sessão (manter conectado e contas salvas)', () => {
  it('login com "manter conectado" desmarcado grava a preferência e não deixa token em storage', async () => {
    loginApi.mockResolvedValue({ user: ownerUser, accessToken: 'access-9' });
    await renderBooted();

    await userEvent.click(screen.getByRole('button', { name: 'entrar sem manter' }));

    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('{"ok":true}'));
    expect(loginApi).toHaveBeenCalledWith('caio@example.com', 'senha123', undefined, false);
    expect(authStorage.getRememberMe()).toBe(false);
    expect(authStorage.getUser()?.id).toBe('u1');
    expect(localStorage.getItem('barber_access_token')).toBeNull();
    expect(sessionStorage.getItem('barber_access_token_session')).toBeNull();
    expect(localStorage.getItem('barber_refresh_token')).toBeNull();
  });

  it('troca para uma conta salva persiste a nova sessão sem token no storage', async () => {
    const savedUser = {
      id: 'u2',
      name: 'Duda',
      email: 'duda@example.com',
      role: 'OWNER',
      barbershopId: 'b0',
    };
    switchAccountApi.mockResolvedValue({ user: savedUser, accessToken: 'access-2' });
    await renderBooted();

    await userEvent.click(screen.getByRole('button', { name: 'usar conta salva' }));

    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('{"ok":true}'));
    expect(switchAccountApi).toHaveBeenCalledWith('u2');
    expect(authStorage.getUser()?.id).toBe('u2');
    expect(authStorage.getRememberMe()).toBe(true);
    expect(authStorage.getSavedAccounts().map(a => a.id)).toContain('u2');
    expect(authStorage.getAccessToken()).toBe('access-2');
    expect(localStorage.getItem('barber_access_token')).toBeNull();
    expect(sessionStorage.getItem('barber_access_token_session')).toBeNull();
  });
});

describe('AuthContext.loginWithGoogle (auditoria)', () => {
  it('sucesso persiste a sessão com "manter conectado" e devolve ok', async () => {
    googleLoginApi.mockResolvedValue({ user: ownerUser, accessToken: 'at-google' });
    await renderBooted();

    await userEvent.click(screen.getByRole('button', { name: 'entrar com google' }));

    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('{"ok":true}'));
    expect(googleLoginApi).toHaveBeenCalledWith('fake-google-id-token');
    expect(authStorage.getRememberMe()).toBe(true);
    expect(authStorage.getUser()?.id).toBe('u1');
    // S5: o access token vive só em memória; a sessão fica na preferência/user.
    expect(localStorage.getItem('barber_access_token')).toBeNull();
    expect(authStorage.getSavedAccounts().map(a => a.id)).toContain('u1');
  });

  // 404 sem `code` (qualquer outro erro 404 que não seja o do Google): o
  // branch não dispara e o fallback devolve a mensagem crua do backend.
  it('404 sem `code` cai no fallback com a mensagem do backend', async () => {
    googleLoginApi.mockRejectedValue(
      new ApiError('Conta não encontrada. Cadastre-se normalmente com e-mail e senha.', 404)
    );
    await renderBooted();

    await userEvent.click(screen.getByRole('button', { name: 'entrar com google' }));

    await waitFor(() =>
      expect(screen.getByTestId('result')).toHaveTextContent(
        '{"ok":false,"message":"Conta não encontrada. Cadastre-se normalmente com e-mail e senha."}'
      )
    );
    // Nenhuma sessão nova é gravada no caminho de erro.
    expect(authStorage.getRememberMe()).toBe(true); // preferência já gravada no boot
  });

  // Corrigido (item 2): o backend agora devolve GOOGLE_ACCOUNT_NOT_FOUND em
  // `code` (back: GoogleLoginUseCase.ts — 4o argumento do AppError; handler
  // app.ts serializa `code`). O branch do AuthContext dispara e a orientação
  // em PT-BR chega ao usuário — antes ele via o código cru, porque o valor
  // vinha em `errors` e o getErrorMessage lia `data.errors` antes da message.
  it('404 com GOOGLE_ACCOUNT_NOT_FOUND em `code` dispara o branch do AuthContext', async () => {
    googleLoginApi.mockRejectedValue(
      new ApiError('Conta não encontrada. Cadastre-se normalmente com e-mail e senha.', 404, 'GOOGLE_ACCOUNT_NOT_FOUND')
    );
    await renderBooted();

    await userEvent.click(screen.getByRole('button', { name: 'entrar com google' }));

    await waitFor(() =>
      expect(screen.getByTestId('result')).toHaveTextContent(
        '{"ok":false,"message":"Conta não encontrada. Cadastre-se normalmente com e-mail e senha."}'
      )
    );
    // O código nunca aparece na mensagem visível.
    expect(screen.getByTestId('result').textContent).not.toContain('GOOGLE_ACCOUNT_NOT_FOUND');
    // Nenhuma sessão nova é gravada no caminho de erro.
    expect(authStorage.getUser()?.id).toBe('u1'); // sessão do boot, não nova
  });

  it('401 do Google devolve o texto literal do backend (não vira "sessão expirou")', async () => {
    googleLoginApi.mockRejectedValue(new ApiError('Token Google inválido ou expirado', 401));
    await renderBooted();

    await userEvent.click(screen.getByRole('button', { name: 'entrar com google' }));

    await waitFor(() =>
      expect(screen.getByTestId('result')).toHaveTextContent(
        '{"ok":false,"message":"Token Google inválido ou expirado"}'
      )
    );
  });
});
