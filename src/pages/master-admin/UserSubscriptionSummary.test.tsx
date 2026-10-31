import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminInternalApi, type AccountDetail } from '../../infra/adminInternalApi';
import { UserSubscriptionSummary } from './UserSubscriptionSummary';
import { adminAccountActionsApi } from '../../infra/adminAccountActionsApi';
vi.mock('../../infra/adminAccountActionsApi', () => ({
  adminAccountActionsApi: { accountAction: vi.fn() },
}));

vi.mock('../../infra/adminInternalApi', () => ({ adminInternalApi: { getAccount: vi.fn() } }));
const getAccount = vi.mocked(adminInternalApi.getAccount);
const detail = (name = 'Salão Central', days = 5, planActive = false) =>
  ({
    shop: { name },
    subscription: planActive
      ? { status: 'ACTIVE', endDate: '2026-12-01T12:00:00Z', plan: { name: 'Profissional' } }
      : null,
    access: {
      trialDaysRemaining: days,
      trialEndDate: '2026-10-31T12:00:00Z',
      planActive,
      subscriptionAccessAllowed: days > 0 || planActive,
    },
  }) as AccountDetail;
beforeEach(() => {
  getAccount.mockReset();
});

describe('UserSubscriptionSummary', () => {
  it('reloads the updated days after extending the trial through the existing route', async () => {
    const initial = detail();
    initial.subscription = {
      status: 'TRIALING',
      endDate: '2026-10-31T12:00:00Z',
      plan: { name: 'Essencial' },
    } as AccountDetail['subscription'];
    const extended = {
      ...initial,
      access: { ...initial.access!, trialDaysRemaining: 95, trialEndDate: '2027-01-29T12:00:00Z' },
    };
    getAccount
      .mockResolvedValueOnce({ success: true, data: initial })
      .mockResolvedValue({ success: true, data: extended });
    vi.mocked(adminAccountActionsApi.accountAction).mockResolvedValue({ success: true, data: {} });
    render(<UserSubscriptionSummary shopId="one" />);
    await screen.findByText('5 dias restantes');
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar dias' }));
    fireEvent.change(screen.getByLabelText(/Dias para adicionar/), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText(/Motivo da extensão/), {
      target: { value: 'Extensão autorizada pelo suporte' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar dias' }));
    expect(await screen.findByText('95 dias restantes')).toBeInTheDocument();
    expect(screen.getByText('90 dias adicionados ao período grátis.')).toBeInTheDocument();
  });
  it('explains unlinked accounts without making a request', () => {
    render(<UserSubscriptionSummary shopId="" />);
    expect(screen.getByText(/Sem salão vinculado/)).toBeInTheDocument();
    expect(getAccount).not.toHaveBeenCalled();
  });
  it('shows server-provided trial days for an account without a paid subscription', async () => {
    getAccount.mockResolvedValue({ success: true, data: detail() });
    render(<UserSubscriptionSummary shopId="one" />);
    expect(await screen.findByText('5 dias restantes')).toBeInTheDocument();
    expect(screen.getByText('Nenhum plano contratado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver conta' })).toHaveAttribute(
      'href',
      '/master/accounts/one'
    );
  });
  it('distinguishes an active paid plan from an expired free period', async () => {
    getAccount.mockResolvedValue({ success: true, data: detail('Salão Pago', 0, true) });
    render(<UserSubscriptionSummary shopId="paid" />);
    expect(await screen.findByText('Plano ativo')).toBeInTheDocument();
    expect(screen.getByText('Profissional')).toBeInTheDocument();
    expect(screen.getByText('0 dias restantes')).toBeInTheDocument();
    expect(screen.getByText('Liberado')).toBeInTheDocument();
  });
  it('allows retry without treating an API failure as no subscription', async () => {
    getAccount
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValueOnce({ success: true, data: detail() });
    render(<UserSubscriptionSummary shopId="one" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível consultar');
    expect(screen.queryByText('Nenhum plano contratado')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('5 dias restantes')).toBeInTheDocument();
  });

  it('does not show an expired ACTIVE record as an active plan', async () => {
    const expired = detail('Salão vencido', 0, true);
    expired.access = { ...expired.access!, planActive: false, subscriptionAccessAllowed: false };
    getAccount.mockResolvedValue({ success: true, data: expired });
    render(<UserSubscriptionSummary shopId="expired" />);
    expect(await screen.findByText('Plano vencido')).toBeInTheDocument();
    expect(screen.getByText('Não liberado')).toBeInTheDocument();
  });

  it('does not invent trial days when an older API omits access metadata', async () => {
    const legacy = detail();
    delete legacy.access;
    getAccount.mockResolvedValue({ success: true, data: legacy });
    render(<UserSubscriptionSummary shopId="legacy" />);
    expect(
      await screen.findByText('Não foi possível consultar os dias restantes.')
    ).toBeInTheDocument();
    expect(screen.queryByText('0 dias restantes')).not.toBeInTheDocument();
  });
  it('ignores a slow response from the previously selected salon', async () => {
    let finishOld!: (value: { success: boolean; data: AccountDetail }) => void;
    const oldResponse = new Promise<{ success: boolean; data: AccountDetail }>(resolve => {
      finishOld = resolve;
    });
    getAccount.mockImplementation(id =>
      id === 'old' ? oldResponse : Promise.resolve({ success: true, data: detail('Novo salão', 9) })
    );
    const { rerender } = render(<UserSubscriptionSummary shopId="old" />);
    rerender(<UserSubscriptionSummary shopId="new" />);
    expect(await screen.findByText('9 dias restantes')).toBeInTheDocument();
    await act(async () => {
      finishOld({ success: true, data: detail('Salão anterior', 1) });
    });
    expect(screen.getByText('Plano de Novo salão')).toBeInTheDocument();
    expect(screen.queryByText('1 dia restante')).not.toBeInTheDocument();
  });
});
