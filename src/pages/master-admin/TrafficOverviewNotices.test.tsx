/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TrafficOverviewPage } from './TrafficOverviewPage';
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

const report = (visitorsBasis: AdminTrafficData['totals']['visitorsBasis']): AdminTrafficData =>
  ({
    period: {
      key: 'week',
      label: 'Semana',
      granularity: 'day',
      fromDay: '2026-11-09',
      toDay: '2026-11-15',
      prevFromDay: '2026-11-02',
      prevToDay: '2026-11-08',
      timezone: 'America/Sao_Paulo',
      dataFrom: '2026-10-01',
    },
    generatedAt: '2026-11-15T12:00:00.000Z',
    beaconEnabled: true,
    totals: {
      visits: 100,
      visitors: 50,
      visitorsBasis,
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
  }) as AdminTrafficData;

const renderPage = (initialEntry = '/master/traffic') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TrafficOverviewPage />
    </MemoryRouter>
  );

describe('TrafficOverviewPage — legendas e avisos', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'master-1',
        name: 'Administradora',
        email: 'admin@agendai.local',
        role: 'MASTER_ADMIN',
        internalPermissions: ['internal:traffic:read'],
      },
      loading: false,
    } as ReturnType<typeof useAuth>);
  });

  it('mostra o rótulo e a legenda de visitantes distintos do dia', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: report('daily_distinct'),
    });

    renderPage('/master/traffic?period=day');

    const dayLabel = await screen.findByText('Visitantes do dia');
    fireEvent.focus(dayLabel);
    expect(
      await screen.findByRole('tooltip', {
        name: 'Visitantes distintos do dia: quantas pessoas diferentes acessaram o site hoje.',
      })
    ).toBeInTheDocument();
  });

  it('mostra o rótulo e a legenda da soma dos visitantes distintos de cada dia', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: report('sum_of_daily_distinct'),
    });

    renderPage();

    const label = await screen.findByText('Visitantes (soma dos dias)');
    fireEvent.focus(label);
    expect(
      await screen.findByRole('tooltip', {
        name: 'Soma dos visitantes distintos de cada dia do período: a mesma pessoa pode ser contada em dias diferentes.',
      })
    ).toBeInTheDocument();
  });

  it('explica o que a coleta não conta, mesmo com a coleta ligada', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: report('sum_of_daily_distinct'),
    });

    renderPage();

    expect(
      await screen.findByText(
        'Não entram na contagem: quem ligou “não rastrear” no navegador, quem acessa páginas fora da lista monitorada e qualquer visita fora da produção (homologação, testes e localhost).'
      )
    ).toBeInTheDocument();
  });
});
