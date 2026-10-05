/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BillingSummarySection } from './BillingSummarySection';
import { adminApi, BillingSummary } from '../../infra/adminApi';

vi.mock('../../infra/adminApi', () => ({
  adminApi: { getBillingSummary: vi.fn() },
}));

const summary: BillingSummary = {
  generatedAt: '2026-10-03T12:00:00.000Z',
  period: { from: '2026-10-01T03:00:00.000Z', to: '2026-10-03T12:00:00.000Z' },
  collected: { month: 200, prevMonth: 34, deltaPct: 488.2, year: 234, invoicesMonth: 1 },
  receivables: {
    pending: 12,
    pendingCount: 1,
    overdue: 180,
    overdueCount: 1,
    dueNext7d: 14,
    dueNext7dCount: 1,
  },
  mrr: {
    total: 50.67,
    byPlan: [
      {
        planId: 'plan-pro',
        name: 'Pro',
        price: 20,
        billingCycle: 'MONTHLY',
        active: true,
        subscriptions: 1,
        monthlyValue: 20,
      },
      {
        planId: 'plan-essential',
        name: 'Essencial',
        price: 14,
        billingCycle: 'MONTHLY',
        active: true,
        subscriptions: 1,
        monthlyValue: 14,
      },
    ],
  },
  renewals: { endingIn7d: 20, endingIn7dCount: 1, trialingEndingIn7d: 14, trialingEndingIn7dCount: 1 },
  churn: { canceledIn30d: 2, canceledRevenueIn30d: 34, pastDue: 16.67, pastDueCount: 1 },
  collectionRatePct: 75,
};

describe('BillingSummarySection', () => {
  beforeEach(() => {
    vi.mocked(adminApi.getBillingSummary).mockResolvedValue({
      success: true,
      data: summary,
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('carrega o resumo e exibe os KPIs de cobrança', async () => {
    render(<BillingSummarySection />);

    expect((await screen.findAllByText('R$ 200,00')).length).toBeGreaterThan(0);
    expect(adminApi.getBillingSummary).toHaveBeenCalledTimes(1);

    expect(screen.getByText('Coletado no mês')).toBeInTheDocument();
    expect(screen.getByText('Inadimplência')).toBeInTheDocument();
    expect(screen.getByText('R$ 50,67')).toBeInTheDocument();
    expect(screen.getByText('MRR')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText(/488\.2% vs mês anterior/)).toBeInTheDocument();
  });

  it('exibe o MRR por plano e as assinaturas em risco', async () => {
    render(<BillingSummarySection />);

    await screen.findByText('MRR por plano');
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('(1 · R$ 20,00/mês)')).toBeInTheDocument();
    expect(screen.getByText('Essencial')).toBeInTheDocument();

    expect(screen.getByText('Assinaturas em risco')).toBeInTheDocument();
    expect(screen.getByText('Receita da plataforma')).toBeInTheDocument();
    expect(screen.getByText('Trial encerrando em 7 dias')).toBeInTheDocument();
  });

  it('mostra estado de erro com opção de tentar novamente', async () => {
    vi.mocked(adminApi.getBillingSummary).mockRejectedValue(new Error('boom'));

    render(<BillingSummarySection />);

    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => {
      expect(adminApi.getBillingSummary).toHaveBeenCalledTimes(2);
    });
  });
});
