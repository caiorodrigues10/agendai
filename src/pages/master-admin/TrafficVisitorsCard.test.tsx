/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TrafficVisitorsCard } from './TrafficVisitorsCard';
import { adminTrafficApi, type AdminTrafficData } from '../../infra/adminTrafficApi';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
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

const report = (overrides: Partial<AdminTrafficData> = {}): AdminTrafficData =>
  ({
    period: {
      key: 'day',
      label: 'Dia',
      granularity: 'hour',
      fromDay: '2026-11-16',
      toDay: '2026-11-16',
      prevFromDay: '2026-11-15',
      prevToDay: '2026-11-15',
      timezone: 'America/Sao_Paulo',
      dataFrom: '2026-10-01',
    },
    generatedAt: '2026-11-16T12:00:00.000Z',
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
    userActivity: { firstRecordedAt: '2026-10-02T12:00:00.000Z' },
    ...overrides,
  }) as AdminTrafficData;

const masterWith = (internalPermissions: string[]) =>
  ({
    user: {
      id: 'master-1',
      name: 'Master',
      email: 'master@agendai.local',
      role: 'MASTER_ADMIN',
      internalPermissions,
    },
    loading: false,
  }) as ReturnType<typeof useAuth>;

const renderCard = () =>
  render(
    <MemoryRouter>
      <TrafficVisitorsCard />
    </MemoryRouter>
  );

describe('TrafficVisitorsCard', () => {
  beforeEach(() => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockImplementation(async query =>
      query.period === 'day'
        ? ({ success: true, data: report() } as never)
        : ({
            success: true,
            data: report({
              totals: {
                visits: 700,
                visitors: 250,
                visitorsBasis: 'sum_of_daily_distinct',
                sessions: 120,
                loggedInUsers: 60,
                newShops: 12,
                newUsers: 30,
                newUsersRemoved: 2,
              },
            }),
          } as never)
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('não mostra nada e não consulta a API sem a permissão de tráfego', async () => {
    vi.mocked(useAuth).mockReturnValue(masterWith(['internal:dashboard:read']));

    const { container } = renderCard();

    expect(container).toBeEmptyDOMElement();
    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).not.toHaveBeenCalled();
    });
    expect(screen.queryByText('Pessoas que entraram')).not.toBeInTheDocument();
  });

  it('não mostra nada para quem não é master admin', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'owner-1',
        name: 'Dona',
        email: 'dona@salao.local',
        role: 'OWNER',
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    const { container } = renderCard();

    expect(container).toBeEmptyDOMElement();
    expect(adminTrafficApi.getTrafficReport).not.toHaveBeenCalled();
  });

  it('mostra o skeleton enquanto carrega', () => {
    vi.mocked(useAuth).mockReturnValue(masterWith(['internal:traffic:read']));
    vi.mocked(adminTrafficApi.getTrafficReport).mockReturnValue(new Promise(() => undefined));

    renderCard();

    expect(screen.getByTestId('traffic-visitors-card-loading')).toBeInTheDocument();
    expect(screen.queryByText('Pessoas que entraram')).not.toBeInTheDocument();
  });

  it('mostra os visitantes de hoje e dos últimos 7 dias, com o link para o tráfego', async () => {
    vi.mocked(useAuth).mockReturnValue(masterWith(['internal:traffic:read']));

    renderCard();

    expect(await screen.findByText('Pessoas que entraram')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('últimos 7 dias: 250')).toBeInTheDocument();

    // As duas consultas usam a área "all" e os períodos dia e semana.
    expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledWith({ period: 'day', area: 'all' });
    expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledWith({ period: 'week', area: 'all' });

    const link = screen.getByRole('link', { name: 'Ver tráfego' });
    expect(link).toHaveAttribute('href', '/master/traffic');
  });

  it('explica como cada número é calculado (base distinta do dia e soma dos dias)', async () => {
    vi.mocked(useAuth).mockReturnValue(masterWith(['internal:traffic:read']));

    renderCard();

    const trigger = await screen.findByRole('button', { name: 'Como este número é calculado' });
    fireEvent.focus(trigger);

    expect(
      await screen.findByRole('tooltip', {
        name: 'Hoje: visitantes distintos do dia. Últimos 7 dias: soma dos visitantes distintos de cada dia (a mesma pessoa pode ser contada em dias diferentes).',
      })
    ).toBeInTheDocument();
  });

  it('mostra o erro da API sem virar zero enganoso', async () => {
    vi.mocked(useAuth).mockReturnValue(masterWith(['internal:traffic:read']));
    vi.mocked(adminTrafficApi.getTrafficReport).mockRejectedValue(new Error('boom'));

    renderCard();

    expect(
      await screen.findByText('Falha ao carregar os visitantes do site.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Pessoas que entraram')).not.toBeInTheDocument();
  });

  it('avisa que a coleta está desativada em vez de mostrar zeros', async () => {
    vi.mocked(useAuth).mockReturnValue(masterWith(['internal:traffic:read']));
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: report({ beaconEnabled: false }),
    } as never);

    renderCard();

    const notice = await screen.findByText(/A coleta de tráfego está desativada/);
    expect(notice.closest('[role="status"]')).not.toBeNull();
    expect(screen.queryByText('Pessoas que entraram')).not.toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });
});
