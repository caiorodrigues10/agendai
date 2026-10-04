/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { EngagementPage } from './EngagementPage';
import { adminEngagementApi, EngagementSummary } from '../../infra/adminEngagementApi';

vi.mock('../../infra/adminEngagementApi', () => ({
  adminEngagementApi: { getEngagementSummary: vi.fn() },
}));

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
    expect(screen.getByText('Barbearia Central')).toBeInTheDocument();
    expect(screen.getByText('Assinatura em atraso')).toBeInTheDocument();
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
});
