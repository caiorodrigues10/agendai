/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SalonTrafficSection } from './SalonTrafficSection';
import { getSalonTraffic, type SalonTrafficData, type SalonTrafficPeriod } from '../../infra/salonTrafficApi';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../infra/apiClient';

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
      fromDay: '2026-11-10',
      toDay: '2026-11-16',
      prevFromDay: '2026-11-03',
      prevToDay: '2026-11-09',
      timezone: 'America/Sao_Paulo',
      dataFrom: null,
    },
    generatedAt: '2026-11-16T12:00:00.000Z',
    beaconEnabled: true,
    totals: {
      visits: 42,
      visitors: 30,
      // Janelas maiores somam visitantes distintos de cada dia.
      visitorsBasis: period === 'day' ? 'daily_distinct' : 'sum_of_daily_distinct',
    },
    prevTotals: { visits: 20, visitors: 12, visitorsBasis: 'daily_distinct' },
    deltaPct: { visits: 50, visitors: 75 },
    series: [
      {
        bucketStart: '2026-11-15',
        label: '15/11',
        visits: 12,
        visitors: 9,
        partial: false,
      },
      {
        bucketStart: '2026-11-16',
        label: '16/11',
        visits: 30,
        visitors: 21,
        partial: true,
      },
    ],
    sections: [
      { section: 'profile', visits: 20, visitors: 15 },
      { section: 'queue', visits: 12, visitors: 8 },
      { section: 'appointments', visits: 6, visitors: 5 },
      { section: 'products', visits: 4, visitors: 3 },
    ],
    origins: [
      { host: 'www.instagram.com', visits: 14 },
      { host: 'wa.me', visits: 6 },
    ],
    ...overrides,
  }) as SalonTrafficData;

const mockGetSalonTraffic = () =>
  vi.mocked(getSalonTraffic).mockImplementation(
    async (_barbershopId, query) =>
      ({ success: true, data: makeData(query.period) }) as Awaited<
        ReturnType<typeof getSalonTraffic>
      >
  );

// O Router é necessário para o link "Ver planos e renovar" do estado de
// assinatura vencida.
const renderSection = () =>
  render(
    <MemoryRouter>
      <SalonTrafficSection barbershopId="shop-1" />
    </MemoryRouter>
  );

describe('SalonTrafficSection', () => {
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

  it('não exibe a seção nem consulta a API para funcionário', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: employeeUser,
      loading: false,
    } as ReturnType<typeof useAuth>);

    renderSection();

    expect(screen.queryByText('Visitas ao seu salão')).not.toBeInTheDocument();
    expect(getSalonTraffic).not.toHaveBeenCalled();
  });

  it('não exibe a seção enquanto a sessão carrega', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: ownerUser,
      loading: true,
    } as ReturnType<typeof useAuth>);

    renderSection();

    expect(screen.queryByText('Visitas ao seu salão')).not.toBeInTheDocument();
    expect(getSalonTraffic).not.toHaveBeenCalled();
  });

  it('mostra skeleton enquanto carrega', () => {
    vi.mocked(getSalonTraffic).mockReturnValue(
      new Promise(() => undefined) as ReturnType<typeof getSalonTraffic>
    );

    const { container } = renderSection();

    expect(screen.getByText('Visitas ao seu salão')).toBeInTheDocument();
    expect(screen.getByText('Carregando visitas ao seu salão')).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('consulta os cards (hoje/7/30 dias) e o detalhe do período padrão', async () => {
    renderSection();

    await screen.findByText('Evolução das visitas');
    expect(getSalonTraffic).toHaveBeenCalledWith('shop-1', { period: 'day' });
    expect(getSalonTraffic).toHaveBeenCalledWith('shop-1', { period: 'week' });
    expect(getSalonTraffic).toHaveBeenCalledWith('shop-1', { period: 'month' });
  });

  it('exibe totais, série, seções, origens e delta', async () => {
    renderSection();

    await screen.findByText('Evolução das visitas');

    // Cards de hoje/7/30 dias.
    expect(screen.getByText('Últimos 7 dias')).toBeInTheDocument();
    expect(screen.getByText('Últimos 30 dias')).toBeInTheDocument();

    // Delta vs período anterior.
    expect(screen.getByText(/em relação ao período anterior/)).toBeInTheDocument();

    // Quebra por seção.
    expect(screen.getByText('Perfil e cortes')).toBeInTheDocument();
    expect(screen.getByText('Fila')).toBeInTheDocument();
    expect(screen.getByText('Agendamento')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('15 visitantes')).toBeInTheDocument();

    // Origens.
    expect(screen.getByText('www.instagram.com')).toBeInTheDocument();
    expect(screen.getByText('wa.me')).toBeInTheDocument();

    // Nota honesta.
    expect(screen.getByText(/DNT ou GPC/)).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há série de visitas', async () => {
    vi.mocked(getSalonTraffic).mockImplementation(
      async (_barbershopId, query) =>
        ({
          success: true,
          data: makeData(query.period, {
            totals: { visits: 0, visitors: 0, visitorsBasis: 'daily_distinct' },
            deltaPct: null,
            series: [],
            sections: [],
            origins: [],
          }),
        }) as Awaited<ReturnType<typeof getSalonTraffic>>
    );

    renderSection();

    expect(await screen.findByText('Ainda sem visitas registradas')).toBeInTheDocument();
    expect(
      screen.getByText('Nenhuma seção registrada no período.')
    ).toBeInTheDocument();
  });

  it('mostra erro com opção de tentar novamente', async () => {
    vi.mocked(getSalonTraffic).mockRejectedValue(new Error('boom'));

    renderSection();

    expect(
      await screen.findByText('Não foi possível carregar as visitas ao seu salão.')
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const callsAfterFailure = vi.mocked(getSalonTraffic).mock.calls.length;
    mockGetSalonTraffic();
    fireEvent.click(screen.getByText('Tentar novamente'));

    await screen.findByText('Evolução das visitas');
    expect(vi.mocked(getSalonTraffic).mock.calls.length).toBeGreaterThan(
      callsAfterFailure
    );
  });

  it('mostra aviso e esconde os números quando a coleta está desativada', async () => {
    vi.mocked(getSalonTraffic).mockImplementation(
      async (_barbershopId, query) =>
        ({
          success: true,
          data: makeData(query.period, { beaconEnabled: false }),
        }) as Awaited<ReturnType<typeof getSalonTraffic>>
    );

    renderSection();

    expect(await screen.findByText('A coleta de tráfego está desativada.')).toBeInTheDocument();
    expect(
      screen.getByText('Por isso, os números de visitas não são exibidos.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Evolução das visitas')).not.toBeInTheDocument();
  });

  it('troca o período do detalhe ao escolher outra janela', async () => {
    renderSection();

    await screen.findByText('Evolução das visitas');
    const callsBefore = vi.mocked(getSalonTraffic).mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: 'Período: 30 dias' }));

    await waitFor(() =>
      expect(vi.mocked(getSalonTraffic).mock.calls.length).toBeGreaterThan(callsBefore)
    );
    expect(getSalonTraffic).toHaveBeenCalledWith('shop-1', { period: 'month' });
    expect(
      screen.getByRole('button', { name: 'Período: 30 dias' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Período: 7 dias' })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('usa a base de visitantes retornada pela API nas legendas', async () => {
    renderSection();

    await screen.findByText('Evolução das visitas');

    // Rótulo do card "Hoje" (o botão de período tem nome acessível "Período: Hoje").
    const todayLabel = screen.getByRole('button', { name: 'Hoje' });
    fireEvent.focus(todayLabel);
    expect(
      await screen.findByRole('tooltip', { name: 'Visitantes distintos no dia.' })
    ).toBeVisible();

    fireEvent.blur(todayLabel);
    const weekLabel = screen.getByRole('button', { name: 'Últimos 7 dias' });
    fireEvent.focus(weekLabel);
    expect(
      await screen.findByRole('tooltip', {
        name: 'Soma dos visitantes distintos de cada dia. A mesma pessoa pode ser contada em dias diferentes.',
      })
    ).toBeVisible();
  });
});

/**
 * Bloqueio de acesso: o relatório é recurso pago e a resposta diz **por quê**
 * (o `code` do backend). O tratamento difere por causa — assinatura vencida
 * oferece renovação; bloqueio de CPF, não.
 */
describe('SalonTrafficSection — acesso bloqueado', () => {
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

  it('mostra aviso de assinatura vencida (402) com link para os planos e sem retry', async () => {
    vi.mocked(getSalonTraffic).mockRejectedValue(
      new ApiError('Sem assinatura ativa', 402, 'SUBSCRIPTION_REQUIRED')
    );

    renderSection();

    expect(
      await screen.findByText(
        'Sua assinatura está vencida. Renove o plano para ver as visitas ao seu salão.'
      )
    ).toBeInTheDocument();
    // Nunca a mensagem genérica de falha de carregamento.
    expect(
      screen.queryByText('Não foi possível carregar as visitas ao seu salão.')
    ).not.toBeInTheDocument();
    // Retry não resolve assinatura vencida.
    expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Ver planos e renovar/ });
    expect(link).toHaveAttribute('href', '/planos');
  });

  it('mostra aviso de acesso bloqueado (CPF_BLOCKED) sem link de planos e sem retry', async () => {
    vi.mocked(getSalonTraffic).mockRejectedValue(
      new ApiError('CPF bloqueado', 403, 'CPF_BLOCKED')
    );

    renderSection();

    expect(
      await screen.findByText(
        'O acesso aos dados do seu salão está bloqueado. Entre em contato com o suporte para liberar o acesso.'
      )
    ).toBeInTheDocument();
    // Não é caso de assinatura: nem a mensagem genérica, nem a de assinatura.
    expect(
      screen.queryByText('Não foi possível carregar as visitas ao seu salão.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Sua assinatura está vencida. Renove o plano para ver as visitas ao seu salão.'
      )
    ).not.toBeInTheDocument();
    // Retry não resolve bloqueio de acesso.
    expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument();
    // Renovar o plano não resolve este bloqueio: sem link de renovação.
    expect(screen.queryByRole('link', { name: /Ver planos e renovar/ })).not.toBeInTheDocument();
  });
});
