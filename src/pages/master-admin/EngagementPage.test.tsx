/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { EngagementPage } from './EngagementPage';
import { adminEngagementApi, type EngagementBilling, type EngagementSummary } from '../../infra/adminEngagementApi';

vi.mock('../../infra/adminEngagementApi', () => ({
  adminEngagementApi: { getEngagementSummary: vi.fn(), getBilling: vi.fn() },
}));

const billing: EngagementBilling = {
  generatedAt: '2026-10-03T12:00:00.000Z',
  summary: {
    registered: 10, paying: 3, trial: 2, late: 1, pending: 1, canceled: 1,
    activeWithoutPaidInvoice: 1, withoutSubscription: 1, collected30d: 340, overdueAmount: 80,
  },
  monthly: [{ month: '2026-10', amount: 340, invoices: 3, shops: 2 }],
  shops: [{
    id: 'b1', name: 'Barbearia Central', active: true, createdAt: '2026-01-01T12:00:00Z',
    subscriptionStatus: 'ACTIVE', planName: 'Pro anual', billingCycle: 'YEARLY', endDate: null,
    paidInvoices: 1, paidMonthsEquivalent: 12, totalPaid: 340,
    lastPaidAt: '2026-10-01T12:00:00Z', overdueAmount: 0, nextDueAt: null,
  }],
  matching: 1, nextCursor: null,
};

const summary: EngagementSummary = {
  generatedAt: '2026-10-03T12:00:00.000Z',
  funnel: [
    { key: 'total', label: 'Salões ativos', count: 10, pct: 100 },
    { key: 'services', label: 'Com serviços cadastrados', count: 8, pct: 80 },
    { key: 'catalog', label: 'Com catálogo de produtos', count: 5, pct: 50 },
    { key: 'onboarding', label: 'Onboarding concluído', count: 4, pct: 40 },
    { key: 'firstAppointment', label: 'Com ao menos 1 atendimento', count: 3, pct: 30 },
    { key: 'active7d', label: 'Ativos nos últimos 7 dias', count: 2, pct: 20 },
  ],
  features: [
    { key: 'agenda', label: 'Agenda', shops: 3, pct: 30 },
    { key: 'queue', label: 'Fila', shops: 7, pct: 70 },
    { key: 'retail', label: 'Vendas no balcão', shops: 2, pct: 20 },
    { key: 'fiado', label: 'Fiado', shops: 0, pct: 0 },
    { key: 'services', label: 'Serviços ativos', shops: 8, pct: 80 },
    { key: 'catalog', label: 'Catálogo de produtos', shops: 5, pct: 50 },
  ],
  nps: {
    windowDays: 90,
    responses: 10,
    promoters: 6,
    passives: 2,
    detractors: 2,
    score: 40,
    insufficient: false,
  },
  support: {
    open: 5,
    openOver24h: 2,
    resolved30d: 12,
    avgResolutionH: 26.5,
    avgFirstResponseH: 1.5,
  },
  churnRisk: [
    {
      id: 'b1',
      name: 'Barbearia Central',
      score: 2,
      reasons: ['Assinatura em atraso', 'Sem atividade há 30 dias'],
    },
  ],
};

describe('EngagementPage', () => {
  beforeEach(() => {
    vi.mocked(adminEngagementApi.getBilling).mockResolvedValue({ success: true, data: billing });
  });
  afterEach(() => vi.clearAllMocks());

  it('carrega e exibe funil, adoção, NPS, suporte e churn', async () => {
    vi.mocked(adminEngagementApi.getEngagementSummary).mockResolvedValue({
      success: true,
      data: summary,
    });

    render(<EngagementPage />);

    expect(await screen.findByRole('heading', { name: 'Engajamento' })).toBeInTheDocument();
    expect(screen.getByText('Funil de ativação')).toBeInTheDocument();
    expect(screen.getByText(/Com serviços cadastrados/)).toBeInTheDocument();
    expect(screen.getByText('Adoção por recurso')).toBeInTheDocument();
    expect(screen.getByText(/Vendas no balcão/)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'NPS' })).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();

    expect(screen.getByText('Suporte e SLA')).toBeInTheDocument();
    expect(screen.getByText('26,5 h')).toBeInTheDocument();
    expect(screen.getByText('1,5 h')).toBeInTheDocument();

    expect(screen.getByText('Risco de churn')).toBeInTheDocument();
    expect(screen.getAllByText('Barbearia Central').length).toBeGreaterThan(0);
    expect(screen.getByText('Assinatura em atraso')).toBeInTheDocument();
    expect(screen.getByText('Assinaturas e pagamentos')).toBeInTheDocument();
    expect(screen.getAllByText('Pro anual').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
  });

  it('mostra erro e recarrega ao tentar novamente', async () => {
    vi.mocked(adminEngagementApi.getEngagementSummary)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ success: true, data: summary });

    render(<EngagementPage />);

    expect(
      await screen.findByText('Não foi possível carregar o engajamento.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));

    expect(await screen.findByRole('heading', { name: 'Engajamento' })).toBeInTheDocument();
    expect(adminEngagementApi.getEngagementSummary).toHaveBeenCalledTimes(2);
  });

  it('sinaliza NPS sem dados suficientes abaixo de 10 respostas', async () => {
    vi.mocked(adminEngagementApi.getEngagementSummary).mockResolvedValue({
      success: true,
      data: {
        ...summary,
        nps: { ...summary.nps, responses: 3, score: 33, insufficient: true },
      },
    });

    render(<EngagementPage />);

    const notice = await screen.findByTestId('nps-insufficient');
    expect(notice).toHaveTextContent('Sem dados suficientes');
    expect(notice).toHaveTextContent('3 respostas');
    expect(screen.getByRole('heading', { name: 'NPS' })).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há salões em risco', async () => {
    vi.mocked(adminEngagementApi.getEngagementSummary).mockResolvedValue({
      success: true,
      data: { ...summary, churnRisk: [] },
    });

    render(<EngagementPage />);

    expect(
      await screen.findByText('Nenhum salão em risco no momento.'),
    ).toBeInTheDocument();
  });

  it('mantém as métricas de uso quando o acesso financeiro é negado', async () => {
    vi.mocked(adminEngagementApi.getBilling).mockRejectedValue(new (await import('../../infra/apiClient')).ApiError('Negado', 403));
    vi.mocked(adminEngagementApi.getEngagementSummary).mockResolvedValue({ success: true, data: summary });
    render(<EngagementPage />);
    expect(await screen.findByText(/exigem permissão de leitura do faturamento/)).toBeInTheDocument();
    expect(screen.getByText('Funil de ativação')).toBeInTheDocument();
  });
});
