/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
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

const currentSaoPauloDate = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};

const currentSaoPauloMonth = () => currentSaoPauloDate().slice(0, 7);

const previousCivilDay = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
};

const previousCivilMonth = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
};

const baseData: AdminTrafficData = {
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
    visitorsBasis: 'sum_of_daily_distinct',
    sessions: 20,
    loggedInUsers: 10,
    newShops: 2,
    newUsers: 4,
    newUsersRemoved: 1,
  },
  prevTotals: null,
  deltaPct: {
    visits: 10,
    visitors: -5,
    sessions: null,
    loggedInUsers: 0,
    newShops: null,
    newUsers: 25,
  },
  series: [
    {
      bucketStart: '2026-11-09',
      label: '09/11',
      visits: 40,
      visitors: 20,
      sessions: 8,
      newShops: 1,
      newUsers: 2,
      newUsersRemoved: 0,
      partial: false,
    },
    {
      bucketStart: '2026-11-15',
      label: '15/11',
      visits: 60,
      visitors: 30,
      sessions: null,
      newShops: 1,
      newUsers: 2,
      newUsersRemoved: 1,
      partial: true,
    },
  ],
  areas: [
    {
      area: 'public_site',
      label: 'Site público',
      visits: 70,
      visitors: 35,
      sessions: 14,
    },
  ],
  origins: [{ host: 'www.google.com.br', visits: 25 }],
  loss: {
    counterRegressions: 0,
    redisUnavailableDrops: 0,
    notes: [],
  },
  userActivity: {
    firstRecordedAt: '2026-10-02T12:00:00.000Z',
  },
};

const authorizedUser = {
  id: 'master-1',
  name: 'Administradora',
  email: 'admin@agendai.local',
  role: 'MASTER_ADMIN' as const,
  internalPermissions: ['internal:traffic:read'],
};

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderPage(initialEntry = '/master/traffic') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TrafficOverviewPage />
      <LocationProbe />
    </MemoryRouter>
  );
}

describe('TrafficOverviewPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: authorizedUser,
      loading: false,
    } as ReturnType<typeof useAuth>);
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: baseData,
    });
    vi.mocked(adminTrafficApi.exportTrafficCsv).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['bucket,visitas']),
    } as Response);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('usa os filtros da URL e aplica a âncora histórica do dia', async () => {
    renderPage('/master/traffic?period=day&area=public_site&userRole=OWNER');

    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledWith({
        period: 'day',
        area: 'public_site',
        userRole: 'OWNER',
        date: currentSaoPauloDate(),
      });
    });

    expect(screen.getByLabelText('Data')).toHaveValue(currentSaoPauloDate());
    expect(screen.getByLabelText('Data')).toHaveAttribute('max', currentSaoPauloDate());
    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        `period=day&area=public_site&userRole=OWNER&date=${currentSaoPauloDate()}`
      );
    });
  });

  it('usa a âncora histórica do mês vinda da URL', async () => {
    renderPage('/master/traffic?period=month&userRole=CUSTOMER');

    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledWith({
        period: 'month',
        area: 'all',
        userRole: 'CUSTOMER',
        month: currentSaoPauloMonth(),
      });
    });
    expect(screen.getByLabelText('Mês de referência')).toHaveValue(currentSaoPauloMonth());
    expect(screen.getByLabelText('Mês de referência')).toHaveAttribute(
      'max',
      currentSaoPauloMonth()
    );
  });

  it('altera o período na URL, limpa âncoras irrelevantes e envia apenas a âncora aplicável', async () => {
    renderPage();

    ['Dia', 'Semana', 'Mês', '3 meses', '6 meses', 'Último ano', 'Anos'].forEach(label => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
    await waitFor(() => expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent('period=week');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Dia' }));
    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenLastCalledWith({
        period: 'day',
        area: 'all',
        date: currentSaoPauloDate(),
      });
    });
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      `date=${currentSaoPauloDate()}`
    );
    expect(screen.getByTestId('location-search')).not.toHaveTextContent('month=');

    const historicalDay = previousCivilDay(currentSaoPauloDate());
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: historicalDay } });
    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenLastCalledWith({
        period: 'day',
        area: 'all',
        date: historicalDay,
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Mês' }));
    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenLastCalledWith({
        period: 'month',
        area: 'all',
        month: currentSaoPauloMonth(),
      });
    });
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      `month=${currentSaoPauloMonth()}`
    );
    expect(screen.getByTestId('location-search')).not.toHaveTextContent('date=');

    const historicalMonth = previousCivilMonth(currentSaoPauloMonth());
    fireEvent.change(screen.getByLabelText('Mês de referência'), {
      target: { value: historicalMonth },
    });
    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenLastCalledWith({
        period: 'month',
        area: 'all',
        month: historicalMonth,
      });
    });

    fireEvent.click(screen.getByRole('button', { name: '3 meses' }));
    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenLastCalledWith({
        period: '3m',
        area: 'all',
      });
    });
    expect(screen.getByTestId('location-search')).not.toHaveTextContent('date=');
    expect(screen.getByTestId('location-search')).not.toHaveTextContent('month=');
  });

  it('filtra por área e papel dos novos usuários', async () => {
    renderPage();

    await waitFor(() => expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: 'Páginas de salão' }));
    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenLastCalledWith({
        period: 'week',
        area: 'salon_public',
      });
    });

    fireEvent.change(screen.getByLabelText('Papel dos novos usuários'), {
      target: { value: 'CUSTOMER' },
    });
    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenLastCalledWith({
        period: 'week',
        area: 'salon_public',
        userRole: 'CUSTOMER',
      });
    });
    expect(screen.getByTestId('location-search')).toHaveTextContent('area=salon_public');
    expect(screen.getByTestId('location-search')).toHaveTextContent('userRole=CUSTOMER');
    expect(
      await screen.findByText('dos quais removidos: 1 · filtro: Cliente (CUSTOMER)')
    ).toBeInTheDocument();
  });

  it('mostra o rótulo e a legenda de visitantes distintos do dia', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: {
        ...baseData,
        totals: { ...baseData.totals, visitorsBasis: 'daily_distinct' },
      },
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
    renderPage();

    expect(
      await screen.findByText(
        'Não entram na contagem: quem ligou “não rastrear” no navegador, quem acessa páginas fora da lista monitorada e qualquer visita fora da produção (homologação, testes e localhost).'
      )
    ).toBeInTheDocument();
  });

  it('exibe KPIs e apenas as variações fornecidas pela API', async () => {
    renderPage();

    const kpis = await screen.findByRole('region', {
      name: 'Indicadores principais de tráfego',
    });
    expect(within(kpis).getByText('Visitas')).toBeInTheDocument();
    expect(within(kpis).getByText('Sessões')).toBeInTheDocument();
    expect(within(kpis).getByText('Usuários logados')).toBeInTheDocument();
    expect(within(kpis).getByText('Novos salões')).toBeInTheDocument();
    expect(within(kpis).getByText('Novos usuários')).toBeInTheDocument();

    expect(screen.getByText('↑ Δ% +10% em relação ao período anterior')).toBeInTheDocument();
    expect(screen.getByText('↓ Δ% -5% em relação ao período anterior')).toBeInTheDocument();
    expect(screen.getByText('→ Δ% 0% em relação ao período anterior')).toBeInTheDocument();
    expect(screen.getByText('↑ Δ% +25% em relação ao período anterior')).toBeInTheDocument();
    expect(screen.getAllByText(/Δ%/)).toHaveLength(4);
    expect(within(kpis).getByText('dos quais removidos: 1 · todos os papéis')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Gráfico de linhas com duas séries: Visitas em linha contínua e Visitantes em linha tracejada.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('09/11: 40 visitas e 20 visitantes.')).toBeInTheDocument();
    expect(screen.getByText('www.google.com.br')).toBeInTheDocument();
    expect(screen.getByText('25 visitas')).toBeInTheDocument();
  });

  it('destaca semanas parciais e preserva sessões nulas', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: {
        ...baseData,
        period: { ...baseData.period, key: '3m', label: '3 meses', granularity: 'week' },
        series: [
          {
            ...baseData.series[0],
            bucketStart: '2026-08-31',
            label: '31/08',
            sessions: null,
            partial: true,
          },
        ],
      },
    });

    renderPage('/master/traffic?period=3m');

    const status = await screen.findByText('semana parcial');
    const row = status.closest('tr');
    expect(row).not.toBeNull();
    expect(row).toHaveClass('bg-warning/10');
    expect(within(row as HTMLElement).getByText('—')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'dos quais removidos' })).toBeInTheDocument();
  });

  it('identifica corretamente o bucket parcial de acordo com a granularidade', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: {
        ...baseData,
        period: { ...baseData.period, key: 'day', label: 'Dia', granularity: 'hour' },
        series: [
          {
            ...baseData.series[0],
            bucketStart: '2026-11-15T09',
            label: '09:00',
            sessions: null,
            partial: true,
          },
        ],
      },
    });

    renderPage('/master/traffic?period=day');

    expect(await screen.findByText('hora parcial')).toBeInTheDocument();
    expect(screen.queryByText('semana parcial')).not.toBeInTheDocument();
  });

  it('exibe os avisos de início de contagem e a situação de coleta desativada', async () => {
    const { unmount } = renderPage();

    expect(
      await screen.findByText('contagem de visitas a partir de 01/10/2026')
    ).toBeInTheDocument();
    expect(screen.getByText('usuários logados a partir de 02/10/2026')).toBeInTheDocument();
    unmount();

    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: { ...baseData, beaconEnabled: false },
    });
    renderPage();

    const noticeText = await screen.findByText(/A coleta de tráfego está desativada/);
    const notice = noticeText.closest('[role="status"]');
    expect(notice).not.toBeNull();
    expect(notice).toHaveTextContent('A coleta de tráfego está desativada');
    expect(notice).toHaveTextContent('os dados podem estar ausentes');
    expect(notice).toHaveTextContent('a ausência é esperada');
  });

  it('mostra estado vazio quando a coleta está ativa e não há série', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: {
        ...baseData,
        series: [],
        areas: [],
        origins: [],
      },
    });

    renderPage();

    expect(await screen.findByText('Nenhum dado de tráfego no período')).toBeInTheDocument();
    expect(
      screen.getByText(
        'A coleta está ativa, mas ainda não há registros para os filtros selecionados.'
      )
    ).toBeInTheDocument();
  });

  it('mostra estado vazio coerente quando a coleta está desativada', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport).mockResolvedValue({
      success: true,
      data: {
        ...baseData,
        beaconEnabled: false,
        series: [],
        areas: [],
        origins: [],
      },
    });

    renderPage();

    expect(await screen.findByText('Nenhum dado de tráfego no período')).toBeInTheDocument();
    expect(
      screen.getByText('A coleta está desativada e não há registros para os filtros selecionados.')
    ).toBeInTheDocument();
    expect(screen.getByText(/A coleta de tráfego está desativada/)).toBeInTheDocument();
  });

  it('mostra erro da API e permite tentar novamente', async () => {
    vi.mocked(adminTrafficApi.getTrafficReport)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ success: true, data: baseData });

    renderPage();

    expect(
      await screen.findByText('Não foi possível carregar os dados de tráfego.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => {
      expect(adminTrafficApi.getTrafficReport).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText('↑ Δ% +10% em relação ao período anterior')).toBeInTheDocument();
  });

  it('exporta o CSV com todos os filtros ativos e informa falhas de exportação', async () => {
    const createObjectURL = vi.fn(() => 'blob:traffic');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    renderPage('/master/traffic?period=day&date=2026-11-10&area=logged_area&userRole=OWNER');

    const exportButton = screen.getByRole('button', { name: 'Exportar CSV' });
    await waitFor(() => expect(exportButton).toBeEnabled());
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(adminTrafficApi.exportTrafficCsv).toHaveBeenCalledWith({
        period: 'day',
        area: 'logged_area',
        userRole: 'OWNER',
        date: '2026-11-10',
      });
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:traffic');
    });

    vi.mocked(adminTrafficApi.exportTrafficCsv).mockResolvedValueOnce({
      ok: false,
      blob: async () => new Blob([]),
    } as Response);
    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    expect(
      await screen.findByText('Não foi possível exportar os dados de tráfego.')
    ).toBeInTheDocument();
  });

  it('indica o carregamento durante a exportação do CSV', async () => {
    let resolveExport: (response: Response) => void = () => undefined;
    const pendingExport = new Promise<Response>(resolve => {
      resolveExport = resolve;
    });
    vi.mocked(adminTrafficApi.exportTrafficCsv).mockReturnValueOnce(pendingExport);
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:traffic-loading'),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    renderPage();
    const exportButton = screen.getByRole('button', { name: 'Exportar CSV' });
    await waitFor(() => expect(exportButton).toBeEnabled());
    fireEvent.click(exportButton);

    const loadingButton = await screen.findByRole('button', { name: 'Exportando...' });
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');

    resolveExport({
      ok: true,
      blob: async () => new Blob(['bucket,visitas']),
    } as Response);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeEnabled();
    });
  });

  it('não monta nem consulta o painel sem a permissão de tráfego', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        ...authorizedUser,
        internalPermissions: ['internal:dashboard:read'],
      },
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(adminTrafficApi.getTrafficReport).not.toHaveBeenCalled();
  });
});
