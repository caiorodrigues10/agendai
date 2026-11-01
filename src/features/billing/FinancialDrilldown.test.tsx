/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FinancialDrilldown } from './FinancialDrilldown';
import { adminApi, FinancialBarbershopDetail } from '../../infra/adminApi';

vi.mock('../../infra/adminApi', () => ({
  adminApi: { getFinancialBarbershopDetail: vi.fn(), exportBillingStatementCsv: vi.fn() },
}));

const detail: FinancialBarbershopDetail = {
  barbershop: {
    id: 'shop-1',
    name: 'Barbearia Central',
    whatsapp: '11999990000',
    active: true,
    approvalStatus: 'APPROVED',
    createdAt: '2026-09-01T12:00:00.000Z',
    subscription: {
      status: 'PAST_DUE',
      endDate: '2026-09-01T12:00:00.000Z',
      plan: { name: 'Pro', price: 20 },
    },
  },
  invoices: {
    summary: {
      total: 4,
      paid: 2,
      pending: 1,
      overdue: 1,
      cancelled: 0,
      sumPaid: 40,
      sumOverdue: 20,
    },
    records: [
      {
        id: 'inv-1',
        amount: 20,
        status: 'PAID',
        dueDate: '2026-09-01T12:00:00.000Z',
        paidAt: '2026-09-01T12:00:00.000Z',
        createdAt: '2026-08-25T12:00:00.000Z',
        planName: 'Pro',
      },
    ],
  },
  payments: { count: 2, total: 40 },
  refunds: { count: 1, total: 10 },
  expenses: {
    summary: { total: 30, totalPaid: 20, totalPending: 10, count: 2 },
    byType: [{ type: 'RENT', total: 30, count: 2 }],
    byCategory: [{ category: 'Aluguel', total: 30, count: 2 }],
    records: [],
  },
  fiados: {
    summary: { activeDebtors: 1, totalDebt: 15, overdueCount: 1, overdueAmount: 15 },
    records: [
      {
        id: 'fiado-1',
        customerName: 'João Cliente',
        whatsapp: '11988887777',
        description: null,
        originalAmount: 15,
        paidAmount: 0,
        remainingAmount: 15,
        status: 'OPEN',
        dueDate: '2026-09-01T12:00:00.000Z',
        isOverdue: true,
        paymentsCount: 0,
      },
    ],
  },
};

const renderDrilldown = (onClose = vi.fn()) =>
  render(
    <FinancialDrilldown
      open
      barbershopId="shop-1"
      barbershopName="Barbearia Central"
      onClose={onClose}
    />,
  );

describe('FinancialDrilldown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getFinancialBarbershopDetail).mockResolvedValue({
      success: true,
      data: detail,
    } as never);
  });

  it('carrega assinatura, faturas, pagamentos, despesas e fiados', async () => {
    renderDrilldown();

    expect(await screen.findByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Em atraso')).toBeInTheDocument();
    expect(screen.getByText(/Recebido: R\$\s*40,00 · Em atraso: R\$\s*20,00/)).toBeInTheDocument();
    expect(screen.getByText(/2 no período/)).toBeInTheDocument();
    expect(screen.getByText(/1 no período/)).toBeInTheDocument();
    expect(screen.getByText('RENT')).toBeInTheDocument();
    expect(screen.getByText('Aluguel')).toBeInTheDocument();
    expect(screen.getByText('João Cliente')).toBeInTheDocument();
    expect(screen.getByText('vencido')).toBeInTheDocument();

    expect(adminApi.getFinancialBarbershopDetail).toHaveBeenCalledWith(
      'shop-1',
      expect.objectContaining({ from: expect.any(String), to: expect.any(String) }),
    );
  });

  it('recarrega ao alterar o período', async () => {
    renderDrilldown();
    await screen.findByText('Pro');

    fireEvent.change(screen.getByLabelText('De'), { target: { value: '2026-01-01' } });

    await waitFor(() => {
      expect(adminApi.getFinancialBarbershopDetail).toHaveBeenLastCalledWith(
        'shop-1',
        expect.objectContaining({ from: '2026-01-01' }),
      );
    });
  });

  it('exporta o CSV do salão no período', async () => {
    vi.mocked(adminApi.exportBillingStatementCsv).mockResolvedValue({ ok: true, blob: async () => new Blob(['a,b']) } as never);
    renderDrilldown();
    await screen.findByText('Pro');

    fireEvent.click(screen.getByRole('button', { name: /Exportar CSV/ }));

    await waitFor(() => {
      expect(adminApi.exportBillingStatementCsv).toHaveBeenCalledWith(
        expect.objectContaining({ barbershopId: 'shop-1', from: expect.any(String), to: expect.any(String) }),
      );
    });
  });

  it('mostra erro com opção de tentar novamente', async () => {
    vi.mocked(adminApi.getFinancialBarbershopDetail).mockRejectedValueOnce(new Error('Falha no financeiro'));
    renderDrilldown();

    expect((await screen.findAllByText('Falha no financeiro')).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => {
      expect(adminApi.getFinancialBarbershopDetail).toHaveBeenCalledTimes(2);
    });
  });

  it('não carrega quando fechado', () => {
    render(
      <FinancialDrilldown open={false} barbershopId="shop-1" onClose={vi.fn()} />,
    );

    expect(adminApi.getFinancialBarbershopDetail).not.toHaveBeenCalled();
  });
});
