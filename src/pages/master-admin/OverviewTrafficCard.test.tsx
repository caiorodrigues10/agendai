/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OverviewTrafficCard } from './OverviewTrafficCard';
import { adminTrafficApi, type AdminTrafficData } from '../../infra/adminTrafficApi';
import { useAuth } from '../../contexts/AuthContext';
import { getSaoPauloCivilDate } from './trafficOverviewUtils';

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

const authorizedUser = {
  id: 'master-1',
  name: 'Administradora',
  email: 'admin@agendai.local',
  role: 'MASTER_ADMIN' as const,
  internalPermissions: ['internal:traffic:read'],
};

const makeReport = (
  visitors: number,
  visitorsBasis: AdminTrafficData['totals']['visitorsBasis'],
  beaconEnabled = true
): AdminTrafficData =>
  ({
    beaconEnabled,
    totals: {
      visitors,
      visitorsBasis,
    },
  }) as AdminTrafficData;

const renderCard = () =>
  render(
    <MemoryRouter initialEntries={['/master/overview']}>
      <OverviewTrafficCard />
    </MemoryRouter>
  );

describe('OverviewTrafficCard', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: authorizedUser,
      loading: false,
    } as ReturnType<typeof useAuth>);

    vi.mocked(adminTrafficApi.getTrafficReport).mockImplementation(
      async query =>
        ({
          success: true,
          data:
            query.period === 'day'
              ? makeReport(7, 'daily_distinct')
              : makeReport(21, 'sum_of_daily_distinct'),
        }) as Awaited<ReturnType<typeof adminTrafficApi.getTrafficReport>>
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('não exibe o card nem consulta a API sem a permissão de tráfego', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        ...authorizedUser,
        internalPermissions: ['internal:dashboard:read'],
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderCard();

    expect(screen.queryByText('Pessoas que entraram')).not.toBeInTheDocument();
    expect(adminTrafficApi.getTrafficReport).not.toHaveBeenCalled();
  });

  it('exibe visitantes de hoje e dos últimos 7 dias com link para o tráfego', async () => {
    renderCard();

    expect(await screen.findByText('Pessoas que entraram')).toBeInTheDocument();
    expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledWith({
      period: 'day',
      area: 'all',
      date: getSaoPauloCivilDate(),
    });
    expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledWith({ period: 'week', area: 'all' });
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pessoas que entraram/ })).toHaveAttribute(
      'href',
      '/master/traffic'
    );
  });

  it('mostra skeleton enquanto os relatórios estão carregando', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockReturnValue(
      new Promise(() => undefined) as ReturnType<typeof adminTrafficApi.getTrafficReport>
    );

    const { container } = renderCard();

    expect(screen.getByText('Carregando pessoas que entraram')).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    await waitFor(() => expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledTimes(2));
  });

  it('mostra erro com opção de tentar novamente', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockRejectedValue(new Error('boom'));

    renderCard();

    expect(
      await screen.findByText('Não foi possível carregar os números de visitantes.')
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });

  it('mostra aviso e não exibe zeros quando a coleta está desativada', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: makeReport(0, 'daily_distinct', false),
    });

    renderCard();

    expect(await screen.findByText('A coleta de tráfego está desativada.')).toBeInTheDocument();
    expect(
      screen.getByText('Por isso, os números de visitantes não são exibidos.')
    ).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
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
