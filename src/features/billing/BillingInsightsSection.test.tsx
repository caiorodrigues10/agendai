/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BillingInsightsSection } from './BillingInsightsSection';
import { adminApi, BillingInsights } from '../../infra/adminApi';

vi.mock('../../infra/adminApi', () => ({
  adminApi: { getBillingInsights: vi.fn(), exportBillingStatementCsv: vi.fn() },
}));

const insights: BillingInsights = {
  generatedAt: '2026-10-03T12:00:00.000Z',
  aging: {
    buckets: [
      { key: '1-7', label: '1 a 7 dias', amount: 200, count: 1 },
      { key: '8-15', label: '8 a 15 dias', amount: 0, count: 0 },
      { key: '16-30', label: '16 a 30 dias', amount: 0, count: 0 },
      { key: '31-60', label: '31 a 60 dias', amount: 0, count: 0 },
      { key: '61+', label: 'mais de 60 dias', amount: 50, count: 2 },
    ],
    totalAmount: 250,
    totalCount: 3,
  },
  cohorts: [
    { month: '2026-09', subscriptions: 4, retained: 3, canceled: 1, retainedPct: 75 },
    { month: '2026-10', subscriptions: 2, retained: 2, canceled: 0, retainedPct: 100 },
  ],
  economics: {
    mrr: 50.67,
    activeSubs: 3,
    arpa: 16.89,
    churnRatePct: 0,
    canceledIn30d: 0,
    ltv: null,
  },
  forecast: { pendingDue30d: 0, pendingDue30dCount: 0, expectedValue: 0, confidencePct: 75 },
};

describe('BillingInsightsSection', () => {
  afterEach(() => vi.clearAllMocks());

  it('carrega e exibe faixas, coortes, economia unitária e previsão', async () => {
    vi.mocked(adminApi.getBillingInsights).mockResolvedValue({ success: true, data: insights });

    render(<BillingInsightsSection />);

    expect(await screen.findByText('Análises financeiras')).toBeInTheDocument();
    expect(screen.getByText('Inadimplência por faixa')).toBeInTheDocument();
    expect(screen.getByText(/R\$ 250,00 em 3 fatura\(s\)/)).toBeInTheDocument();
    expect(screen.getByText('1 a 7 dias')).toBeInTheDocument();

    expect(screen.getByText('Coortes de assinaturas')).toBeInTheDocument();
    expect(screen.getByText('2026-09')).toBeInTheDocument();
    expect(screen.getAllByText('75,0%')).toHaveLength(2);

    expect(screen.getByText('Economia unitária')).toBeInTheDocument();
    expect(screen.getByText('R$ 50,67')).toBeInTheDocument();
    expect(screen.getByText('R$ 16,89')).toBeInTheDocument();

    expect(screen.getByText('Previsão de recebimento')).toBeInTheDocument();
    expect(screen.getByText('Confiança')).toBeInTheDocument();
  });

  it('mostra erro e recarrega ao tentar novamente', async () => {
    vi.mocked(adminApi.getBillingInsights)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ success: true, data: insights });

    render(<BillingInsightsSection />);

    expect(
      await screen.findByText('Não foi possível carregar as análises financeiras.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));

    expect(await screen.findByText('Análises financeiras')).toBeInTheDocument();
    expect(adminApi.getBillingInsights).toHaveBeenCalledTimes(2);
  });

  it('exporta o extrato CSV em blob', async () => {
    vi.mocked(adminApi.getBillingInsights).mockResolvedValue({ success: true, data: insights });
    vi.mocked(adminApi.exportBillingStatementCsv).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['id,status']),
    } as Response);
    const createObjectURL = vi.fn(() => 'blob:billing');
    const revokeObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;

    render(<BillingInsightsSection />);
    await screen.findByText('Análises financeiras');

    fireEvent.click(screen.getByRole('button', { name: /Extrato CSV/ }));

    await waitFor(() => expect(adminApi.exportBillingStatementCsv).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:billing');
  });
});
