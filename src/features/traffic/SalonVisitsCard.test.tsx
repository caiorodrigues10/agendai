/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SalonVisitsCard } from './SalonVisitsCard';
import {
  getSalonTraffic,
  type SalonTrafficData,
  type SalonTrafficPeriod,
} from '../../infra/salonTrafficApi';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../infra/salonTrafficApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/salonTrafficApi')>();
  return {
    ...actual,
    getSalonTraffic: vi.fn(),
  };
});

const ownerUser = {
  id: 'owner-1',
  name: 'Dona',
  email: 'dona@salao.local',
  role: 'OWNER' as const,
};

const employeeUser = {
  id: 'emp-1',
  name: 'Barbeiro',
  email: 'barbeiro@salao.local',
  role: 'EMPLOYEE' as const,
};

const makeData = (
  period: SalonTrafficPeriod,
  overrides: Partial<SalonTrafficData> = {}
): SalonTrafficData =>
  ({
    period: {
      key: period,
      label: period,
      granularity: 'day',
      fromDay: '2026-11-16',
      toDay: '2026-11-16',
      prevFromDay: null,
      prevToDay: null,
      timezone: 'America/Sao_Paulo',
      dataFrom: null,
    },
    generatedAt: '2026-11-16T12:00:00.000Z',
    beaconEnabled: true,
    totals: {
      visits: 12,
      visitors: period === 'day' ? 5 : 40,
      visitorsBasis: period === 'day' ? 'daily_distinct' : 'sum_of_daily_distinct',
    },
    prevTotals: null,
    deltaPct: null,
    series: [],
    sections: [],
    origins: [],
    ...overrides,
  }) as SalonTrafficData;

const mockGetSalonTraffic = () =>
  vi.mocked(getSalonTraffic).mockImplementation(
    async (_barbershopId, query) =>
      ({ success: true, data: makeData(query.period) }) as Awaited<
        ReturnType<typeof getSalonTraffic>
      >
  );

const renderCard = () =>
  render(
    <MemoryRouter>
      <SalonVisitsCard barbershopId="shop-1" />
    </MemoryRouter>
  );

describe('SalonVisitsCard', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: ownerUser,
      loading: false,
    } as ReturnType<typeof useAuth>);
    mockGetSalonTraffic();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('não exibe o card nem consulta a API para funcionário', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: employeeUser,
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderCard();

    expect(screen.queryByText('Visitas ao seu salão')).not.toBeInTheDocument();
    expect(getSalonTraffic).not.toHaveBeenCalled();
  });

  it('não exibe o card nem consulta a API sem salão', () => {
    render(
      <MemoryRouter>
        <SalonVisitsCard barbershopId="" />
      </MemoryRouter>
    );

    expect(screen.queryByText('Visitas ao seu salão')).not.toBeInTheDocument();
    expect(getSalonTraffic).not.toHaveBeenCalled();
  });

  it('mostra skeleton enquanto carrega', () => {
    vi.mocked(getSalonTraffic).mockReturnValue(
      new Promise(() => undefined) as ReturnType<typeof getSalonTraffic>
    );

    const { container } = renderCard();

    expect(screen.getByText('Carregando visitas ao seu salão')).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('consulta hoje e os últimos 7 dias e exibe os totais', async () => {
    renderCard();

    expect(await screen.findByText('Visitas ao seu salão')).toBeInTheDocument();
    await screen.findByText('5');
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(getSalonTraffic).toHaveBeenCalledWith('shop-1', { period: 'day' });
    expect(getSalonTraffic).toHaveBeenCalledWith('shop-1', { period: 'week' });

    const link = screen.getAllByRole('link', { name: /Ver detalhes/ })[0];
    expect(link).toHaveAttribute('href', '/app/link');
  });

  it('mostra erro com opção de tentar novamente', async () => {
    vi.mocked(getSalonTraffic).mockRejectedValue(new Error('boom'));

    renderCard();

    expect(
      await screen.findByText('Não foi possível carregar as visitas ao seu salão.')
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const callsAfterFailure = vi.mocked(getSalonTraffic).mock.calls.length;
    mockGetSalonTraffic();
    fireEvent.click(screen.getByText('Tentar novamente'));

    await waitFor(() =>
      expect(vi.mocked(getSalonTraffic).mock.calls.length).toBeGreaterThan(callsAfterFailure)
    );
  });

  it('mostra aviso quando a coleta está desativada', async () => {
    vi.mocked(getSalonTraffic).mockImplementation(
      async (_barbershopId, query) =>
        ({
          success: true,
          data: makeData(query.period, { beaconEnabled: false }),
        }) as Awaited<ReturnType<typeof getSalonTraffic>>
    );

    renderCard();

    expect(await screen.findByText('A coleta de tráfego está desativada.')).toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('usa a base de visitantes retornada pela API nas legendas', async () => {
    renderCard();

    const todayLabel = await screen.findByText('Hoje');
    fireEvent.focus(todayLabel);
    expect(
      await screen.findByRole('tooltip', { name: 'Visitantes distintos no dia.' })
    ).toBeVisible();

    fireEvent.blur(todayLabel);
    const weekLabel = screen.getByText('Últimos 7 dias');
    fireEvent.focus(weekLabel);
    expect(
      await screen.findByRole('tooltip', {
        name: 'Soma dos visitantes distintos de cada dia. A mesma pessoa pode ser contada em dias diferentes.',
      })
    ).toBeVisible();
  });
});
