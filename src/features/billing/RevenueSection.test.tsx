/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RevenueSection } from './RevenueSection';
import { adminApi, FinancialBarbershopRow } from '../../infra/adminApi';

vi.mock('../../infra/adminApi', () => ({
  adminApi: {
    getFinancialOverview: vi.fn(),
    getFinancialSummary: vi.fn(),
    getFinancialBarbershops: vi.fn(),
    getFinancialBarbershopDetail: vi.fn(),
    exportBillingStatementCsv: vi.fn(),
  },
}));

const overview = {
  expenses: { thisMonth: 100, allTime: 500, count: 5 },
  fiados: { activeDebtors: 3, totalDebtPending: 150, overdueCount: 1, barbershopsWithDebt: 2 },
};

const summary = {
  expenses: {
    total: 500,
    totalPaid: 400,
    totalPending: 100,
    count: 5,
    byType: [{ type: 'FIXED', total: 500, count: 5 }],
  },
  fiados: {
    activeDebtors: 3,
    totalOriginal: 200,
    totalPaid: 50,
    totalPending: 150,
    overdueCount: 1,
    overdueAmount: 30,
  },
};

const shop = (overrides: Partial<FinancialBarbershopRow> = {}): FinancialBarbershopRow => ({
  id: 'shop-1',
  name: 'Barbearia Central',
  whatsapp: '11999990000',
  active: true,
  approvalStatus: 'APPROVED',
  createdAt: '2026-09-01T12:00:00.000Z',
  expenses: { total: 80, count: 2 },
  fiados: { activeCount: 3, totalDebt: 120, overdueCount: 1 },
  ...overrides,
});

const shopsResponse = (
  data: FinancialBarbershopRow[],
  meta: Partial<{ total: number; page: number; limit: number; totalPages: number }> = {},
) => ({
  success: true,
  data,
  meta: { total: data.length, page: 1, limit: 10, totalPages: 1, ...meta },
});

describe('RevenueSection — lista de salões', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getFinancialOverview).mockResolvedValue({ success: true, data: overview } as never);
    vi.mocked(adminApi.getFinancialSummary).mockResolvedValue({ success: true, data: summary } as never);
    vi.mocked(adminApi.getFinancialBarbershops).mockResolvedValue(shopsResponse([shop()]) as never);
    vi.mocked(adminApi.getFinancialBarbershopDetail).mockResolvedValue({
      success: true,
      data: {
        barbershop: { ...shop(), subscription: null },
        invoices: {
          summary: { total: 0, paid: 0, pending: 0, overdue: 0, cancelled: 0, sumPaid: 0, sumOverdue: 0 },
          records: [],
        },
        payments: { count: 0, total: 0 },
        refunds: { count: 0, total: 0 },
        expenses: {
          summary: { total: 0, totalPaid: 0, totalPending: 0, count: 0 },
          byType: [],
          byCategory: [],
          records: [],
        },
        fiados: {
          summary: { activeDebtors: 0, totalDebt: 0, overdueCount: 0, overdueAmount: 0 },
          records: [],
        },
      },
    } as never);
  });

  it('lista despesas e fiados por salão e abre o detalhe ao clicar', async () => {
    render(<RevenueSection />);

    expect(await screen.findByText('Barbearia Central')).toBeInTheDocument();
    expect(screen.getByText(/2 despesa\(s\) · 3 fiado\(s\) em aberto/)).toBeInTheDocument();
    expect(screen.getByText('1 vencido(s)')).toBeInTheDocument();
    expect(adminApi.getFinancialBarbershops).toHaveBeenCalledWith({ page: 1, limit: 10, sort: 'debt' });

    fireEvent.click(screen.getByRole('button', { name: /Barbearia Central/ }));

    await waitFor(() => {
      expect(adminApi.getFinancialBarbershopDetail).toHaveBeenCalledWith(
        'shop-1',
        expect.objectContaining({ from: expect.any(String), to: expect.any(String) }),
      );
    });
    expect(await screen.findByRole('button', { name: /Exportar CSV/ })).toBeInTheDocument();
  });

  it('pagina a lista de salões', async () => {
    vi.mocked(adminApi.getFinancialBarbershops).mockResolvedValue(
      shopsResponse([shop()], { total: 25, page: 1, totalPages: 3 }) as never,
    );

    render(<RevenueSection />);
    await screen.findByText('Barbearia Central');
    expect(screen.getByText(/25 salão\(ões\) · página 1 de 3/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));

    await waitFor(() => {
      expect(adminApi.getFinancialBarbershops).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        sort: 'debt',
      });
    });
  });

  it('mostra estado vazio quando não há salões', async () => {
    vi.mocked(adminApi.getFinancialBarbershops).mockResolvedValue(shopsResponse([]) as never);

    render(<RevenueSection />);

    expect(await screen.findByText('Nenhum salão com dados financeiros.')).toBeInTheDocument();
  });
});
