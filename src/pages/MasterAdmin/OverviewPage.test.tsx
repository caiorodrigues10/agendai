/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OverviewPage } from './OverviewPage';
import { adminInternalApi, AdminOverview } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: { getOverview: vi.fn() },
}));

const overview: AdminOverview = {
  period: {
    key: '30d',
    label: 'Últimos 30 dias',
    bucket: 'day',
    from: '2026-09-03T00:00:00.000Z',
    to: '2026-10-03T00:00:00.000Z',
    prevFrom: '2026-08-04T00:00:00.000Z',
    prevTo: '2026-09-03T00:00:00.000Z',
  },
  generatedAt: new Date().toISOString(),
  revenue: {
    mrr: 50.67,
    arr: 608.04,
    arpa: 16.89,
    periodRevenue: 234,
    periodRevenuePrev: 0,
    periodRevenueDeltaPct: null,
    paidInvoices: 3,
    byPlan: [
      {
        planId: 'plan-pro-anual',
        name: 'Pro Anual',
        price: 200,
        billingCycle: 'YEARLY',
        activeSubscriptions: 1,
        periodRevenue: 200,
        periodInvoices: 1,
      },
    ],
  },
  subscriptions: {
    active: 2,
    trialing: 1,
    pending: 0,
    pastDue: 1,
    unpaid: 0,
    canceled: 0,
    trialingExpiring3d: 0,
    trialingExpiring7d: 1,
    newInPeriod: 2,
    newInPrevPeriod: 1,
    upgrades: 1,
    downgrades: 0,
  },
  growth: {
    newShops: 4,
    newShopsPrev: 0,
    newShopsDeltaPct: null,
    activeShops: 4,
    pendingApprovals: 0,
    inactiveShops14d: 1,
    churnShops: 0,
    churnRevenue: 0,
    trialStarted: 2,
    trialPaid: 1,
    trialToPaidPct: 50,
  },
  usage: {
    appointmentsCreated: 300,
    completedAppointments: 12,
    gmv: 1500,
    newClients: 30,
    whatsappSent: 40,
    whatsappDelivered: 35,
    emailSent: 8,
    avgRating: 4.5,
    reviews: 10,
  },
  health: {
    errors5xx24h: 0,
    errors5xxLastHour: 0,
    cronFailures24h: 0,
    outboxStuck: 0,
    whatsappFailed24h: 0,
    emailFailed24h: 0,
    avgDeliveryLatencyMs: 320,
  },
  attention: [
    {
      id: 'overdue-invoices',
      severity: 'danger',
      title: 'Cobranças vencidas',
      description: 'Faturas com vencimento passado e sem pagamento.',
      count: 2,
      to: '/master/billing',
    },
  ],
  charts: {
    series: ['2026-10-01', '2026-10-02', '2026-10-03'],
    newShops: [1, 0, 2],
    revenue: [14, 20, 200],
    appointmentsCreated: [100, 100, 100],
    appointmentsCompleted: [4, 4, 4],
    mrr: [34, 50.67, 50.67],
    funnel: {
      shopsCreated: 4,
      onboardingCompleted: 3,
      shopsWithAppointment: 2,
      paidSubscriptions: 2,
    },
  },
};

function renderPage(initialEntry = '/master/overview') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <OverviewPage />
    </MemoryRouter>,
  );
}

describe('OverviewPage', () => {
  beforeEach(() => {
    vi.mocked(adminInternalApi.getOverview).mockResolvedValue({
      success: true,
      data: overview,
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('carrega a visão geral e exibe os KPIs principais', async () => {
    renderPage();

    expect(await screen.findByText('Visão geral')).toBeInTheDocument();
    expect(adminInternalApi.getOverview).toHaveBeenCalledWith('30d');

    expect(screen.getByText('R$ 234,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 50,67')).toBeInTheDocument();
    expect(screen.getByText('4 novos · 0 pendentes')).toBeInTheDocument();
    expect(screen.getByText('Pro Anual')).toBeInTheDocument();
    expect(screen.queryByText('Nada pendente no momento.')).not.toBeInTheDocument();
    expect(screen.getByText('Cobranças vencidas')).toBeInTheDocument();
  });

  it('usa o período da URL e atualiza ao trocar o período', async () => {
    renderPage('/master/overview?period=90d');

    await screen.findByText('Visão geral');
    expect(adminInternalApi.getOverview).toHaveBeenCalledWith('90d');

    fireEvent.click(screen.getByRole('button', { name: '7 dias' }));

    await waitFor(() => {
      expect(adminInternalApi.getOverview).toHaveBeenCalledWith('7d');
    });
  });

  it('mostra estado de erro com opção de tentar novamente', async () => {
    vi.mocked(adminInternalApi.getOverview).mockRejectedValue(new Error('boom'));

    renderPage();

    expect(
      await screen.findByText('Não foi possível carregar a visão geral.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });
});
