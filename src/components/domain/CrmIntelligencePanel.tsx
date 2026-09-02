import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  crmApi,
  CrmCampaign,
  CrmClientMetric,
  CrmForecast,
  CrmOverview,
  CrmSegment,
} from '../../infra/crmApi';
import { SmartSelect } from '../ui/SmartSelect';
import { getErrorMessage } from '../../utils/errorMessage';
import { CRM_SEGMENT_LABEL } from '../../utils/clientLabels';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface Props {
  canAnalytics: boolean;
  canCampaigns: boolean;
  period: { from: string; to: string };
  onPeriodChange: (period: { from: string; to: string }) => void;
  onOpenClient: (clientId: string) => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'bot') => void;
}

type Tab = 'overview' | 'clients' | 'intelligence' | 'campaigns';

const money = (value: unknown) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));

const shortDate = (value: string) =>
  new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

const segmentOptions: { value: CrmSegment; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: 'Novos' },
  { value: 'recurring', label: 'Recorrentes' },
  { value: 'vip', label: 'VIP' },
  { value: 'at_risk', label: 'Em risco' },
  { value: 'inactive_30', label: 'Inativos 30d' },
  { value: 'inactive_60', label: 'Inativos 60d' },
  { value: 'inactive_90', label: 'Inativos 90d' },
  { value: 'debtors', label: 'Devedores' },
];

const statusLabel: Record<CrmCampaign['status'], string> = {
  DRAFT: 'Rascunho',
  QUEUED: 'Enviando',
  SENT: 'Enviada',
  PARTIAL: 'Parcial',
  FAILED: 'Falhou',
  CANCELED: 'Cancelada',
};

function Kpi({
  label,
  value,
  moneyValue = true,
}: {
  label: string;
  value: unknown;
  moneyValue?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg p-3">
      <p className="text-xs text-text-muted">{label}</p>
      <strong className="mt-1 block text-base text-text-primary">
        {moneyValue ? money(value) : String(value ?? 0)}
      </strong>
    </div>
  );
}

function Empty({ children }: React.PropsWithChildren) {
  return (
    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
      {children}
    </p>
  );
}

function ClientCard({
  client,
  onOpen,
}: {
  client: CrmClientMetric;
  onOpen: () => void;
}) {
  const segment =
    CRM_SEGMENT_LABEL[client.segment] ??
    segmentOptions.find(item => item.value === client.segment)?.label ??
    client.segment;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl border border-border bg-surface p-3 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-text-primary">{client.name}</p>
          <p className="text-xs text-text-muted">{client.whatsapp || 'Sem WhatsApp'}</p>
        </div>
        <span className="shrink-0 rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
          {segment}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-text-muted">LTV</p>
          <p className="font-bold text-text-primary">{money(client.ltv)}</p>
        </div>
        <div>
          <p className="text-text-muted">Visitas</p>
          <p className="font-bold text-text-primary">{client.visits}</p>
        </div>
        <div>
          <p className="text-text-muted">Última</p>
          <p className="font-bold text-text-primary">
            {client.lastVisitAt ? shortDate(client.lastVisitAt) : '—'}
          </p>
        </div>
      </div>
    </button>
  );
}

function ClientTableRow({
  client,
  onOpen,
}: {
  client: CrmClientMetric;
  onOpen: () => void;
}) {
  const segment =
    CRM_SEGMENT_LABEL[client.segment] ??
    segmentOptions.find(item => item.value === client.segment)?.label ??
    client.segment;

  return (
    <tr onClick={onOpen} className="cursor-pointer border-t border-border hover:bg-bg">
      <td className="p-3 font-semibold">
        {client.name}
        <small className="block text-text-muted">{client.whatsapp || 'Sem WhatsApp'}</small>
      </td>
      <td className="p-3">{segment}</td>
      <td className="p-3">{client.visits}</td>
      <td className="p-3">{money(client.ltv)}</td>
      <td className="p-3">{money(client.outstanding)}</td>
      <td className="p-3">{client.lastVisitAt ? shortDate(client.lastVisitAt) : '—'}</td>
    </tr>
  );
}

export const CrmIntelligencePanel: React.FC<Props> = ({
  canAnalytics,
  canCampaigns,
  period,
  onPeriodChange,
  onOpenClient,
  onNotify,
}) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<CrmOverview | null>(null);
  const [overviewState, setOverviewState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [overviewError, setOverviewError] = useState('');
  const [forecast, setForecast] = useState<CrmForecast | null>(null);
  const [forecastHorizon, setForecastHorizon] = useState<7 | 30 | 90>(7);
  const [forecastError, setForecastError] = useState('');
  const [forecastLoading, setForecastLoading] = useState(false);
  const [clients, setClients] = useState<CrmClientMetric[]>([]);
  const [clientsMeta, setClientsMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [segment, setSegment] = useState<CrmSegment>('all');
  const [sort, setSort] = useState<'ltv' | 'lastVisit' | 'outstanding'>('ltv');
  const [campaigns, setCampaigns] = useState<CrmCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaign, setCampaign] = useState({
    name: 'Reativação de clientes',
    segment: 'inactive_30' as CrmSegment,
    message: 'Oi! Sentimos sua falta. Temos horários disponíveis esta semana — quer agendar?',
  });
  const [preview, setPreview] = useState<{
    eligibleCount: number;
    sample: { id: string; name: string }[];
  } | null>(null);
  const [confirmCampaignOpen, setConfirmCampaignOpen] = useState(false);
  const [confirmCampaignLoading, setConfirmCampaignLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadOverview = useCallback(async () => {
    if (!canAnalytics) return;
    setOverviewState('loading');
    setOverviewError('');
    try {
      setOverview(await crmApi.overview({ ...period, compare: true }));
      setOverviewState('idle');
    } catch (error) {
      setOverviewError(getErrorMessage(error, 'Não foi possível carregar o resumo do CRM.'));
      setOverviewState('error');
    }
  }, [canAnalytics, period]);

  const loadForecast = useCallback(async () => {
    setForecastLoading(true);
    setForecastError('');
    try {
      setForecast(await crmApi.forecast(forecastHorizon));
    } catch (error) {
      setForecastError(getErrorMessage(error, 'Não foi possível carregar a previsão.'));
    } finally {
      setForecastLoading(false);
    }
  }, [forecastHorizon]);

  const loadClients = useCallback(
    async (page = 1) => {
      setClientsLoading(true);
      setClientsError('');
      try {
        const result = await crmApi.clients({
          page,
          limit: 20,
          search: debouncedSearch || undefined,
          segment,
          sort,
          ...period,
        });
        setClients(result.data);
        setClientsMeta({
          total: result.meta.total,
          page: result.meta.page,
          totalPages: result.meta.totalPages,
        });
      } catch (error) {
        setClientsError(getErrorMessage(error, 'Não foi possível carregar os clientes.'));
      } finally {
        setClientsLoading(false);
      }
    },
    [debouncedSearch, period, segment, sort]
  );

  const loadCampaigns = useCallback(async () => {
    if (!canCampaigns) return;
    setCampaignsLoading(true);
    try {
      const result = await crmApi.campaigns({ limit: 20, ...period });
      setCampaigns(result.data);
    } catch (error) {
      onNotify?.(getErrorMessage(error, 'Não foi possível carregar as campanhas.'), 'error');
    } finally {
      setCampaignsLoading(false);
    }
  }, [canCampaigns, onNotify, period]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);
  useEffect(() => {
    if (tab === 'clients') void loadClients(1);
  }, [loadClients, tab]);
  useEffect(() => {
    if (tab === 'intelligence') void loadForecast();
  }, [loadForecast, tab]);
  useEffect(() => {
    if (tab === 'campaigns') void loadCampaigns();
  }, [loadCampaigns, tab]);

  const calculateAudience = async () => {
    try {
      setPreview(await crmApi.previewCampaign(campaign));
    } catch (error) {
      onNotify?.(getErrorMessage(error, 'Não foi possível calcular o público.'), 'error');
    }
  };

  const confirmCampaign = async () => {
    if (!preview) return;
    setConfirmCampaignLoading(true);
    try {
      await crmApi.createCampaign(campaign);
      setPreview(null);
      setConfirmCampaignOpen(false);
      await loadCampaigns();
      onNotify?.('Campanha confirmada e adicionada à fila.', 'success');
    } catch (error) {
      onNotify?.(getErrorMessage(error, 'Não foi possível confirmar a campanha.'), 'error');
    } finally {
      setConfirmCampaignLoading(false);
    }
  };

  const kpis = overview?.kpis ?? {};
  const chartData = useMemo(
    () => overview?.byDay.map(item => ({ ...item, label: shortDate(item.date) })) ?? [],
    [overview]
  );

  if (!canAnalytics) return null;

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-accent/25 bg-surface shadow-sm">
        <header className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Super CRM</p>
            <h2 className="text-lg font-bold text-text-primary">
              Receita, segmentos e previsão
            </h2>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-text-muted">
              De
              <input
                type="date"
                value={period.from}
                max={period.to}
                onChange={event =>
                  onPeriodChange({ ...period, from: event.target.value })
                }
                className="mt-1 block min-h-10 rounded-lg border border-border bg-bg px-2 text-text-primary"
              />
            </label>
            <label className="text-xs text-text-muted">
              Até
              <input
                type="date"
                value={period.to}
                min={period.from}
                onChange={event => onPeriodChange({ ...period, to: event.target.value })}
                className="mt-1 block min-h-10 rounded-lg border border-border bg-bg px-2 text-text-primary"
              />
            </label>
            <button
              type="button"
              onClick={() => void loadOverview()}
              disabled={overviewState === 'loading'}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-text-secondary"
            >
              <RefreshCw size={14} className={overviewState === 'loading' ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        </header>

        <nav aria-label="Áreas do CRM" className="flex overflow-x-auto border-b border-border px-2">
          {(
            [
              ['overview', 'Visão geral', BarChart3],
              ['clients', 'Clientes', Users],
              ['intelligence', 'Inteligência', BrainCircuit],
              ...(canCampaigns ? [['campaigns', 'Campanhas', Megaphone] as const] : []),
            ] as [Tab, string, React.ComponentType<{ size?: number; className?: string }>][]
          ).map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setTab(id)}
              className={`min-h-11 whitespace-nowrap px-3 text-xs font-bold ${
                tab === id ? 'border-b-2 border-accent text-accent' : 'text-text-muted'
              }`}
            >
              <Icon className="mr-1 inline" size={14} />
              {label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <div className="space-y-4 p-4">
            {overviewError && (
              <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{overviewError}</p>
            )}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi label="Faturamento bruto" value={kpis.grossRevenue} />
              <Kpi label="Recebido" value={kpis.receivedRevenue} />
              <Kpi label="Fiado em aberto" value={kpis.outstanding} />
              <Kpi label="Ticket médio" value={kpis.avgTicket} />
              <Kpi label="Clientes recorrentes" value={kpis.recurringCustomers} moneyValue={false} />
              <Kpi label="Receita em risco" value={kpis.revenueAtRisk} />
              <Kpi label="Não compareceram" value={kpis.noShows} moneyValue={false} />
              <Kpi label="Comparecimento" value={`${kpis.attendanceRate ?? 0}%`} moneyValue={false} />
            </div>
            <div className="rounded-xl border border-border p-3">
              <h3 className="mb-3 text-sm font-bold text-text-primary">
                Receita e recebimento por dia
              </h3>
              {chartData.length ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip formatter={value => money(value)} />
                      <Line
                        type="monotone"
                        dataKey="grossRevenue"
                        name="Bruto"
                        stroke="var(--color-chart-1)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="receivedRevenue"
                        name="Recebido"
                        stroke="var(--color-chart-2)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty>Ainda não há lançamentos neste período.</Empty>
              )}
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {(
                [
                  ['Serviços', overview?.byService],
                  ['Categorias', overview?.byCategory],
                  ['Profissionais', overview?.byProfessional],
                ] as const
              ).map(([label, values]) => (
                <div key={label} className="rounded-xl border border-border p-3">
                  <h3 className="mb-3 text-sm font-bold text-text-primary">
                    Receita por {label.toLowerCase()}
                  </h3>
                  {values?.length ? (
                    <div className="h-52">
                      <ResponsiveContainer>
                        <BarChart data={values.slice(0, 8)} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={85} fontSize={10} />
                          <Tooltip formatter={value => money(value)} />
                          <Bar
                            dataKey="revenue"
                            fill="var(--color-chart-1)"
                            radius={[0, 5, 5, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty>Sem dados.</Empty>
                  )}
                </div>
              ))}
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <h3 className="mb-2 text-sm font-bold text-text-primary">Clientes de maior valor</h3>
                {overview?.topClients.length ? (
                  overview.topClients.slice(0, 6).map(client => (
                    <button
                      type="button"
                      key={client.clientId}
                      onClick={() => onOpenClient(client.clientId)}
                      className="flex w-full justify-between border-t border-border py-2 text-left text-sm"
                    >
                      <span>
                        {client.name}
                        <small className="ml-2 text-text-muted">{client.visits} visitas</small>
                      </span>
                      <strong>{money(client.ltv)}</strong>
                    </button>
                  ))
                ) : (
                  <Empty>Sem clientes no período.</Empty>
                )}
              </div>
              <div className="rounded-xl border border-border p-3">
                <h3 className="mb-2 text-sm font-bold text-text-primary">Segmentos acionáveis</h3>
                {overview?.segments.map(item => (
                  <div
                    key={item.segment}
                    className="flex justify-between border-t border-border py-2 text-sm"
                  >
                    <span>{item.label}</span>
                    <span className="text-text-muted">
                      {item.count} · {money(item.potential)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'clients' && (
          <div className="space-y-4 p-4">
            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <label className="relative">
                <Search size={16} className="absolute left-3 top-3 text-text-muted" />
                <input
                  aria-label="Buscar cliente"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-border bg-bg pl-9 pr-3 text-sm"
                  placeholder="Buscar cliente ou WhatsApp"
                />
              </label>
              <SmartSelect
                mode="single"
                options={segmentOptions}
                aria-label="Filtrar segmento"
                value={segment}
                onChange={value => setSegment(value as CrmSegment)}
                searchable="auto"
              />
              <SmartSelect
                mode="single"
                options={[{ value: 'ltv', label: 'Maior LTV' }, { value: 'lastVisit', label: 'Visita recente' }, { value: 'outstanding', label: 'Maior dívida' }]}
                aria-label="Ordenar clientes"
                value={sort}
                onChange={value => setSort(value as typeof sort)}
                searchable={false}
              />
            </div>
            {clientsError && (
              <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{clientsError}</p>
            )}
            {clientsLoading ? (
              <Empty>Carregando clientes…</Empty>
            ) : clients.length ? (
              <>
                <div className="space-y-2 md:hidden">
                  {clients.map(client => (
                    <ClientCard
                      key={client.clientId}
                      client={client}
                      onOpen={() => onOpenClient(client.clientId)}
                    />
                  ))}
                </div>
                <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-bg text-left text-xs text-text-muted">
                      <tr>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Segmento</th>
                        <th className="p-3">Visitas</th>
                        <th className="p-3">LTV</th>
                        <th className="p-3">Dívida</th>
                        <th className="p-3">Última visita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(client => (
                        <ClientTableRow
                          key={client.clientId}
                          client={client}
                          onOpen={() => onOpenClient(client.clientId)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <Empty>Nenhum cliente encontrado.</Empty>
            )}
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>{clientsMeta.total} cliente(s)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Página anterior"
                  disabled={clientsMeta.page <= 1}
                  onClick={() => void loadClients(clientsMeta.page - 1)}
                  className="rounded-lg border border-border p-2 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  {clientsMeta.page}/{clientsMeta.totalPages}
                </span>
                <button
                  type="button"
                  aria-label="Próxima página"
                  disabled={clientsMeta.page >= clientsMeta.totalPages}
                  onClick={() => void loadClients(clientsMeta.page + 1)}
                  className="rounded-lg border border-border p-2 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'intelligence' && (
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              {([7, 30, 90] as const).map(horizon => (
                <button
                  type="button"
                  key={horizon}
                  onClick={() => setForecastHorizon(horizon)}
                  className={`min-h-10 rounded-lg px-4 text-sm font-bold ${
                    forecastHorizon === horizon
                      ? 'bg-accent text-accent-fg'
                      : 'border border-border text-text-secondary'
                  }`}
                >
                  {horizon} dias
                </button>
              ))}
            </div>
            {forecastError && (
              <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{forecastError}</p>
            )}
            {forecastLoading ? (
              <Empty>Calculando previsão…</Empty>
            ) : (
              forecast && (
                <>
                  <div className="rounded-xl bg-accent/10 p-3 text-sm text-text-secondary">
                    <strong>
                      Modelo{' '}
                      {forecast.maturity === 'trained'
                        ? 'treinado'
                        : forecast.maturity === 'preliminary'
                          ? 'preliminar'
                          : 'com dados insuficientes'}
                      .
                    </strong>{' '}
                    {forecast.historicalDays} dias analisados. MAE:{' '}
                    {forecast.backtest.mae == null ? 'indisponível' : money(forecast.backtest.mae)}{' '}
                    · MAPE:{' '}
                    {forecast.backtest.mape == null
                      ? 'indisponível'
                      : `${forecast.backtest.mape}%`}
                    .
                  </div>
                  <div className="h-64 rounded-xl border border-border p-3">
                    <ResponsiveContainer>
                      <LineChart
                        data={forecast.predictions.map(item => ({
                          ...item,
                          label: shortDate(item.date),
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="label" fontSize={10} />
                        <YAxis fontSize={11} />
                        <Tooltip formatter={value => money(value)} />
                        <Line
                          type="monotone"
                          dataKey="predictedRevenue"
                          name="Previsão"
                          stroke="var(--color-chart-3)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="confidenceLow"
                          name="Mínimo"
                          stroke="var(--color-chart-4)"
                          strokeDasharray="4 4"
                        />
                        <Line
                          type="monotone"
                          dataKey="confidenceHigh"
                          name="Máximo"
                          stroke="var(--color-chart-5)"
                          strokeDasharray="4 4"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid gap-2 lg:grid-cols-2">
                    {forecast.predictions.map(item => (
                      <div key={item.date} className="rounded-xl border border-border p-3">
                        <div className="flex justify-between gap-2">
                          <strong>{shortDate(item.date)}</strong>
                          <strong>{money(item.predictedRevenue)}</strong>
                        </div>
                        <p className="mt-1 text-xs text-text-muted">
                          {item.predictedVisits} atendimentos · {item.factors.join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )
            )}
          </div>
        )}

        {tab === 'campaigns' && canCampaigns && (
          <div className="grid gap-4 p-4 xl:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-border p-4">
              <h3 className="font-bold text-text-primary">Preparar campanha</h3>
              <p className="text-sm text-text-secondary">
                Somente clientes com consentimento e WhatsApp válido entram no público.
              </p>
              <input
                aria-label="Nome da campanha"
                value={campaign.name}
                onChange={event => setCampaign(current => ({ ...current, name: event.target.value }))}
                className="min-h-11 w-full rounded-lg border border-border bg-bg p-3 text-sm"
                placeholder="Nome da campanha"
              />
              <SmartSelect
                mode="single"
                options={segmentOptions}
                aria-label="Segmento da campanha"
                value={campaign.segment}
                onChange={value => setCampaign(current => ({ ...current, segment: value as CrmSegment }))}
                searchable="auto"
              />
              <textarea
                aria-label="Mensagem da campanha"
                value={campaign.message}
                onChange={event =>
                  setCampaign(current => ({ ...current, message: event.target.value }))
                }
                className="min-h-28 w-full rounded-lg border border-border bg-bg p-3 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void calculateAudience()}
                  className="min-h-11 rounded-lg border border-accent px-4 text-sm font-bold text-accent"
                >
                  Calcular público
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={() => setConfirmCampaignOpen(true)}
                    className="min-h-11 rounded-lg bg-accent px-4 text-sm font-bold text-accent-fg"
                  >
                    Confirmar para {preview.eligibleCount}
                  </button>
                )}
              </div>
              {preview && (
                <div className="rounded-lg bg-bg p-3 text-sm">
                  <strong>{preview.eligibleCount} elegíveis.</strong>
                  <p className="mt-1 text-text-muted">
                    Amostra:{' '}
                    {preview.sample.map(item => item.name).join(', ') || 'nenhum cliente'}
                  </p>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-text-primary">Histórico</h3>
                {campaignsLoading && (
                  <RefreshCw size={15} className="animate-spin text-text-muted" />
                )}
              </div>
              {campaigns.length ? (
                <div className="space-y-2">
                  {campaigns.map(item => (
                    <div key={item.id} className="rounded-lg border border-border bg-bg p-3">
                      <div className="flex justify-between gap-2">
                        <strong className="text-sm">{item.name}</strong>
                        <span className="text-xs font-bold text-accent">
                          {statusLabel[item.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">
                        {item.recipientCount} destinatários · {item.sentCount} enviados ·{' '}
                        {item.failedCount} falhas · {item.skippedCount} ignorados
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty>Nenhuma campanha no período.</Empty>
              )}
            </div>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmCampaignOpen}
        title="Confirmar campanha"
        message={`Enviar mensagem para ${preview?.eligibleCount ?? 0} cliente(s)?`}
        confirmLabel="Enviar campanha"
        loading={confirmCampaignLoading}
        onConfirm={() => void confirmCampaign()}
        onCancel={() => setConfirmCampaignOpen(false)}
      />
    </>
  );
};
