/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountActionsPanel } from './AccountActionsPanel';
import { adminAccountActionsApi } from '../../infra/adminAccountActionsApi';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('../../infra/adminAccountActionsApi', () => ({
  adminAccountActionsApi: { accountAction: vi.fn(), impersonate: vi.fn() },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../utils/errorMessage', () => ({
  getErrorMessage: (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback,
}));

const startImpersonation = vi.fn();

const SHOP = {
  id: 'shop-1',
  name: 'Barbearia Central',
  active: true,
  approvalStatus: 'APPROVED',
  cnpj: '12345678000199',
};

function renderPanel(subscription: { status: string } | null = { status: 'ACTIVE' }) {
  const onDone = vi.fn();
  render(
    <MemoryRouter initialEntries={['/master/accounts/shop-1']}>
      <Routes>
        <Route
          path="/master/accounts/:id"
          element={
            <AccountActionsPanel shop={SHOP} subscription={subscription} onDone={onDone} />
          }
        />
        <Route path="/app/overview" element={<div>painel-dono</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return { onDone };
}

async function confirmWith(reason: string, confirmLabel: string) {
  fireEvent.click(await screen.findByRole('button', { name: confirmLabel }));
  const dialog = await screen.findByRole('alertdialog');
  fireEvent.change(within(dialog).getByPlaceholderText(/Por que esta ação/), {
    target: { value: reason },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: confirmLabel }));
}

describe('AccountActionsPanel', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      startImpersonation,
      exitImpersonation: vi.fn(),
      impersonationShop: null,
    } as never);
  });

  afterEach(() => vi.clearAllMocks());

  it('mostra só as ações válidas para o estado da conta', () => {
    renderPanel();

    expect(screen.getByText('Ações de controle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Suspender/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reativar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aprovar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rejeitar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bloquear/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar aviso/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar agora/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Estender/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trocar plano/ })).toBeInTheDocument();
  });

  it('suspende a conta com motivo e recarrega via onDone', async () => {
    vi.mocked(adminAccountActionsApi.accountAction).mockResolvedValue({ success: true, data: {} });
    const { onDone } = renderPanel();

    await confirmWith('violação detectada na plataforma', 'Suspender');

    await waitFor(() =>
      expect(adminAccountActionsApi.accountAction).toHaveBeenCalledWith('shop-1', 'suspend', {
        reason: 'violação detectada na plataforma',
      }),
    );
    expect(onDone).toHaveBeenCalled();
  });

  it('mostra o erro do backend quando a ação falha', async () => {
    vi.mocked(adminAccountActionsApi.accountAction).mockRejectedValue(new Error('já está suspensa'));
    const { onDone } = renderPanel();

    await confirmWith('motivo válido com dez caracteres', 'Suspender');

    expect(await screen.findByText('já está suspensa')).toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('entra em impersonation e navega para o painel do dono', async () => {
    vi.mocked(adminAccountActionsApi.impersonate).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'imp-token',
        expiresIn: 1800,
        user: { id: 'owner-1', name: 'Dono', email: 'd@x.com', role: 'OWNER' },
        shop: { id: 'shop-1', name: 'Barbearia Central' },
      },
    });
    const { onDone } = renderPanel();

    await confirmWith('verificar configuração do salão', 'Entrar agora');

    await waitFor(() =>
      expect(adminAccountActionsApi.impersonate).toHaveBeenCalledWith(
        'shop-1',
        'verificar configuração do salão',
      ),
    );
    expect(startImpersonation).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'imp-token' }),
    );
    expect(await screen.findByText('painel-dono')).toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('não lista Bloquear CNPJ quando a conta não tem CNPJ', () => {
    render(
      <MemoryRouter>
        <AccountActionsPanel
          shop={{ ...SHOP, cnpj: null }}
          subscription={null}
          onDone={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('button', { name: /Bloquear/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Trocar plano/ })).not.toBeInTheDocument();
  });
});
