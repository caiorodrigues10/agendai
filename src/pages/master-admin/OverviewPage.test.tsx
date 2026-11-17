/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OverviewPage } from './OverviewPage';
import { adminInternalApi, AdminOverview } from '../../infra/adminInternalApi';
import { adminTrafficApi, type AdminTrafficData } from '../../infra/adminTrafficApi';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: { getOverview: vi.fn(), getProductAdoption: vi.fn() },
}));

vi.mock('../../infra/adminTrafficApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/adminTrafficApi')>();
  return {
    ...actual,
    adminTrafficApi: {
      getTrafficReport: vi.fn(),
      exportTrafficCsv: vi.fn(),
    },
  };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
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

const trafficReport = (overrides: Partial<AdminTrafficData> = {}): AdminTrafficData =>
  ({
    period: {
      key: 'day',
      label: 'Dia',
      granularity: 'hour',
      fromDay: '2026-10-03',
      toDay: '2026-10-03',
      prevFromDay: '2026-10-02',
      prevToDay: '2026-10-02',
      timezone: 'America/Sao_Paulo',
      dataFrom: '2026-09-01',
    },
    generatedAt: '2026-10-03T12:00:00.000Z',
    beaconEnabled: true,
    totals: {
      visits: 100,
      visitors: 42,
      visitorsBasis: 'daily_distinct',
      sessions: 20,
      loggedInUsers: 10,
      newShops: 2,
      newUsers: 4,
      newUsersRemoved: 1,
    },
    prevTotals: null,
    deltaPct: null,
    series: [],
    areas: [],
    origins: [],
    loss: { counterRegressions: 0, redisUnavailableDrops: 0, notes: [] },
    userActivity: { firstRecordedAt: '2026-09-02T12:00:00.000Z' },
    ...overrides,
  }) as AdminTrafficData;

function renderPage(initialEntry = '/master/overview') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <OverviewPage />
    </MemoryRouter>,
  );
}

describe('OverviewPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'master-1',
        name: 'Master',
        email: 'master@agendai.local',
        role: 'MASTER_ADMIN',
        internalPermissions: ['internal:traffic:read'],
      },
      loading: false,
    } as ReturnType<typeof useAuth>);
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: trafficReport(),
    });
    vi.mocked(adminInternalApi.getOverview).mockResolvedValue({
      success: true,
      data: overview,
    } as never);
    vi.mocked(adminInternalApi.getProductAdoption).mockResolvedValue({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        catalog: {
          shopsTotal: 4,
          shopsWithCatalog: 3,
          adoptionPct: 75,
          productsActive: 32,
          productsInactive: 0,
          categoriesTotal: 14,
          lowStock: 3,
          outOfStock: 0,
        },
        sales30d: { units: 0, revenue: 0 },
        topProducts: [],
        topCategories: [{ categoryId: null, name: 'Sem categoria', products: 31 }],
      },
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
    expect(await screen.findByText('Adoção de produtos')).toBeInTheDocument();
    expect(adminInternalApi.getProductAdoption).toHaveBeenCalledTimes(1);
  });

  it('mostra o card de pessoas que entraram com os visitantes de hoje e dos últimos 7 dias', async () => {
    renderPage();

    expect(await screen.findByText('Pessoas que entraram')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('últimos 7 dias: 42')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver tráfego' })).toHaveAttribute(
      'href',
      '/master/traffic',
    );

    expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledWith({ period: 'day', area: 'all' });
    expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledWith({ period: 'week', area: 'all' });
  });

  it('não mostra o card de pessoas que entraram sem a permissão de tráfego', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'master-2',
        name: 'Master',
        email: 'master@agendai.local',
        role: 'MASTER_ADMIN',
        internalPermissions: ['internal:dashboard:read'],
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderPage();

    expect(await screen.findByText('Visão geral')).toBeInTheDocument();
    expect(screen.queryByText('Pessoas que entraram')).not.toBeInTheDocument();
    expect(adminTrafficApi.getTrafficReport).not.toHaveBeenCalled();
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
