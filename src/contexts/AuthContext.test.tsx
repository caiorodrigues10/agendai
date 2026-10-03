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
  authApi: { me: vi.fn(), login: vi.fn(), register: vi.fn() },
}));
vi.mock('@/infra/organizationsApi', () => ({
  organizationsApi: { switchShop: vi.fn() },
}));
vi.mock('@/infra/apiClient', async importOriginal => {
  const actual = await importOriginal<typeof import('@/infra/apiClient')>();
  return { ...actual, refreshAccessToken: vi.fn() };
});

const me = vi.mocked(authApi.me);
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
