import React, { useCallback, useEffect, useId, useState } from 'react';
import { LuInfo, LuRadioTower } from 'react-icons/lu';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  getSalonTraffic,
  type SalonTrafficData,
  type SalonTrafficPeriod,
} from '../../infra/salonTrafficApi';
import { useAuth } from '../../contexts/AuthContext';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../components/ui/chart';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardSkeleton,
  SectionError,
  SkeletonRegion,
  StatCard,
  Tooltip,
} from '../../components/patterns';
import { getVisitorBasisTooltip } from '../../shared/trafficVisitorBasis';

const salonTrafficChartConfig: ChartConfig = {
  visits: {
    label: 'Visitas',
    theme: { light: 'var(--chart-1)', dark: 'var(--chart-1)' },
  },
  visitors: {
    label: 'Visitantes',
    theme: { light: 'var(--chart-2)', dark: 'var(--chart-2)' },
  },
};

const PERIOD_CHOICES: { id: SalonTrafficPeriod; label: string }[] = [
  { id: 'day', label: 'Hoje' },
  { id: 'week', label: '7 dias' },
  { id: 'month', label: '30 dias' },
  { id: '3m', label: '3 meses' },
  { id: 'year', label: '1 ano' },
];

const CARD_PERIODS: SalonTrafficPeriod[] = ['day', 'week', 'month'];

const CARD_LABELS: Record<'day' | 'week' | 'month', string> = {
  day: 'Hoje',
  week: 'Últimos 7 dias',
  month: 'Últimos 30 dias',
};

const SECTION_LABELS: Record<string, string> = {
  profile: 'Perfil e cortes',
  queue: 'Fila',
  appointments: 'Agendamento',
  products: 'Produtos',
  other: 'Outras páginas',
};

const LOAD_ERROR = 'Não foi possível carregar as visitas ao seu salão.';

const formatCount = (value: number): string => value.toLocaleString('pt-BR');

interface CardsState {
  requestId: number;
  data: Partial<Record<'day' | 'week' | 'month', SalonTrafficData>> | null;
  error: string | null;
}

interface DetailState {
  requestId: number;
  period: SalonTrafficPeriod | null;
  data: SalonTrafficData | null;
  error: string | null;
}

/** Busca os totais de hoje / 7 / 30 dias (re-carrega a cada `requestId`). */
const useSalonTrafficCards = (
  enabled: boolean,
  barbershopId: string,
  requestId: number
): CardsState => {
  const [state, setState] = useState<CardsState>({ requestId: -1, data: null, error: null });

  useEffect(() => {
    if (!enabled || !barbershopId) return;
    let active = true;

    Promise.all(CARD_PERIODS.map(p => getSalonTraffic(barbershopId, { period: p })))
      .then(responses => {
        if (!active) return;
        const data: CardsState['data'] = {};
        CARD_PERIODS.forEach((p, index) => {
          data[p] = responses[index].data;
        });
        setState({ requestId, data, error: null });
      })
      .catch(() => {
        if (!active) return;
        setState({ requestId, data: null, error: LOAD_ERROR });
      });

    return () => {
      active = false;
    };
  }, [enabled, barbershopId, requestId]);

  return state;
};

/** Busca o detalhe do período selecionado (re-carrega a cada `requestId`). */
const useSalonTrafficDetail = (
  enabled: boolean,
  barbershopId: string,
  period: SalonTrafficPeriod,
  requestId: number
): DetailState => {
  const [state, setState] = useState<DetailState>({
    requestId: -1,
    period: null,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!enabled || !barbershopId) return;
    let active = true;

    getSalonTraffic(barbershopId, { period })
      .then(response => {
        if (!active) return;
        setState({ requestId, period, data: response.data, error: null });
      })
      .catch(() => {
        if (!active) return;
        setState({ requestId, period, data: null, error: LOAD_ERROR });
      });

    return () => {
      active = false;
    };
  }, [enabled, barbershopId, period, requestId]);

  return state;
};

interface SalonTrafficSectionProps {
  barbershopId: string;
}

/** Cards de hoje / 7 / 30 dias, com a legenda da base de visitantes. */
const SalonTrafficCards: React.FC<{ cards: NonNullable<CardsState['data']> }> = ({ cards }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {CARD_PERIODS.map(key => {
      const data = cards[key];
      if (!data) return null;
      return (
        <StatCard
          key={key}
          label={
            <Tooltip label={getVisitorBasisTooltip(data.totals.visitorsBasis)}>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded text-xs font-bold uppercase tracking-wide text-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
              >
                {CARD_LABELS[key]}
                <LuInfo size={12} aria-hidden="true" />
              </button>
            </Tooltip>
          }
          value={formatCount(data.totals.visitors)}
        />
      );
    })}
  </div>
);

/** Série do período escolhido (gráfico + descrição textual acessível). */
const SalonTrafficChartCard: React.FC<{
  detail: SalonTrafficData;
  period: SalonTrafficPeriod;
}> = ({ detail, period }) => (
  <Card>
    <CardHeader>
      <div>
        <CardTitle>Evolução das visitas</CardTitle>
        <p className="mt-1 text-xs text-text-muted">
          {PERIOD_CHOICES.find(choice => choice.id === period)?.label} · visitas e visitantes
        </p>
      </div>
      {detail.deltaPct && detail.deltaPct.visitors !== null && (
        <span
          className={`text-xs font-bold ${
            detail.deltaPct.visitors > 0
              ? 'text-success'
              : detail.deltaPct.visitors < 0
                ? 'text-danger'
                : 'text-text-muted'
          }`}
        >
          {detail.deltaPct.visitors > 0 ? '↑' : detail.deltaPct.visitors < 0 ? '↓' : '→'}{' '}
          {Math.abs(detail.deltaPct.visitors).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
          % em relação ao período anterior
        </span>
      )}
    </CardHeader>
    <CardBody className="space-y-4">
      {detail.series.length === 0 ? (
        <EmptyState
          title="Ainda sem visitas registradas"
          description="Quando alguém abrir a página pública do seu salão, os números aparecem aqui."
        />
      ) : (
        <>
          <ChartContainer
            id="salon-traffic-chart"
            config={salonTrafficChartConfig}
            className="aspect-auto h-56 w-full sm:h-64"
            role="img"
            aria-label="Gráfico de linhas de visitas e visitantes por período"
            aria-describedby="salon-traffic-chart-description"
          >
            <LineChart data={detail.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
                minTickGap={24}
                className="text-2xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                allowDecimals={false}
                className="text-2xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="visits"
                name="Visitas"
                stroke="var(--color-visits)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                name="Visitantes"
                stroke="var(--color-visitors)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>

          <details open className="rounded-lg border border-border bg-surface-2 px-3 py-2">
            <summary className="cursor-pointer text-xs font-bold text-text-primary">
              Descrição textual do gráfico
            </summary>
            <ul
              id="salon-traffic-chart-description"
              className="mt-2 space-y-1 text-xs text-text-secondary"
            >
              {detail.series.map(point => (
                <li key={point.bucketStart}>
                  {point.label}: {formatCount(point.visits)} visitas e{' '}
                  {formatCount(point.visitors)} visitantes.
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </CardBody>
  </Card>
);

/** Quebra por seção da página pública e origens (referrers) do período. */
const SalonTrafficBreakdowns: React.FC<{ detail: SalonTrafficData }> = ({ detail }) => (
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>O que as pessoas viram</CardTitle>
      </CardHeader>
      <CardBody>
        {detail.sections.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhuma seção registrada no período.</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {detail.sections.map(section => (
              <li key={section.section} className="flex items-center justify-between gap-4 py-2.5">
                <span className="min-w-0 truncate text-sm text-text-primary">
                  {SECTION_LABELS[section.section] ?? section.section}
                </span>
                <span className="shrink-0 text-sm font-semibold text-text-secondary">
                  {formatCount(section.visitors)} visitantes
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>De onde vieram</CardTitle>
      </CardHeader>
      <CardBody>
        {detail.origins.length === 0 ? (
          <p className="text-sm text-text-muted">
            Nenhuma origem registrada no período (acesso direto ou link compartilhado).
          </p>
        ) : (
          <ul className="divide-y divide-border/50">
            {detail.origins.map(origin => (
              <li key={origin.host} className="flex items-center justify-between gap-4 py-2.5">
                <span className="min-w-0 truncate text-sm text-text-primary">{origin.host}</span>
                <span className="shrink-0 text-sm font-semibold text-text-secondary">
                  {formatCount(origin.visits)} visitas
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  </div>
);

/** Seletor de janela (hoje / 7 / 30 dias / 3 meses / 1 ano). */
const SalonPeriodSelector: React.FC<{
  period: SalonTrafficPeriod;
  labelledBy: string;
  onChange: (period: SalonTrafficPeriod) => void;
}> = ({ period, labelledBy, onChange }) => (
  <div>
    <p id={labelledBy} className="mb-2 text-xs font-semibold text-text-muted">
      Período
    </p>
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="flex min-w-0 flex-wrap gap-1 rounded-xl border border-border bg-surface p-1"
    >
      {PERIOD_CHOICES.map(choice => {
        const active = choice.id === period;
        return (
          <button
            key={choice.id}
            type="button"
            aria-pressed={active}
            aria-label={`Período: ${choice.label}`}
            onClick={() => onChange(choice.id)}
            className={`min-h-11 min-w-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
              active
                ? 'bg-accent/15 text-accent'
                : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
            }`}
          >
            {choice.label}
          </button>
        );
      })}
    </div>
  </div>
);

/** Aviso de coleta desativada + nota de honestidade (nenhum número exibido). */
const CollectionDisabledNotice: React.FC = () => (
  <>
    <div
      role="status"
      className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text-primary"
    >
      <div className="flex items-start gap-3">
        <LuRadioTower className="mt-0.5 shrink-0 text-accent" size={18} aria-hidden="true" />
        <div>
          <p className="font-semibold">A coleta de tráfego está desativada.</p>
          <p className="mt-1 text-text-secondary">Por isso, os números de visitas não são exibidos.</p>
        </div>
      </div>
    </div>
    <p className="px-1 text-xs text-text-muted">
      Não contamos quem bloqueia rastreamento (DNT ou GPC) e os números são aproximados.
    </p>
  </>
);

/** Estados possíveis da seção (carregando, erro, coleta desativada ou dados). */
interface SalonTrafficViewState {
  loading: boolean;
  error: string | null;
  disabled: boolean;
  showData: boolean;
}

interface SalonTrafficViewProps extends SalonTrafficViewState {
  cards: NonNullable<CardsState['data']> | null;
  detail: SalonTrafficData | null;
  period: SalonTrafficPeriod;
  periodLabelId: string;
  onPeriodChange: (period: SalonTrafficPeriod) => void;
  onRetry: () => void;
}

/** Markup da seção, separado da lógica de busca/estado. */
const SalonTrafficView: React.FC<SalonTrafficViewProps> = ({
  cards,
  detail,
  period,
  periodLabelId,
  loading,
  error,
  disabled,
  showData,
  onPeriodChange,
  onRetry,
}) => (
  <section aria-labelledby="salon-traffic-title" className="space-y-4">
    <header className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted">Visitas</p>
      <h2 id="salon-traffic-title" className="text-xl font-bold text-text-primary">
        Visitas ao seu salão
      </h2>
      <p className="text-sm text-text-secondary">
        Quantas pessoas abriram a página pública do seu salão — perfil, fila, agenda e produtos.
      </p>
    </header>

    {disabled && <CollectionDisabledNotice />}

    {!error && !disabled && (
      <SalonPeriodSelector period={period} labelledBy={periodLabelId} onChange={onPeriodChange} />
    )}

    {loading && (
      <SkeletonRegion loading label="Carregando visitas ao seu salão">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CardSkeleton variant="stat" />
          <CardSkeleton variant="stat" />
          <CardSkeleton variant="stat" />
        </div>
        <div className="mt-3">
          <CardSkeleton />
        </div>
      </SkeletonRegion>
    )}

    {!loading && error && <SectionError message={error} onRetry={onRetry} />}

    {showData && detail && cards && (
      <div className="space-y-4">
        <SalonTrafficCards cards={cards} />
        <SalonTrafficChartCard detail={detail} period={period} />
        <SalonTrafficBreakdowns detail={detail} />
        <p className="px-1 text-xs text-text-muted">
          Não contamos quem bloqueia rastreamento (DNT ou GPC), acessos fora das páginas
          monitoradas nem visitas em ambientes que não são de produção — os números são
          aproximados.
        </p>
      </div>
    )}
  </section>
);

/**
 * "Visitas ao seu salão" — seção do dono (aba Link Público).
 *
 * Mostra quantas pessoas viram a página pública do salão hoje e nos últimos
 * 7/30 dias, a série do período escolhido, a quebra por seção e as origens.
 * Acesso: OWNER/MASTER_ADMIN (mesma regra da aba Link); funcionário não vê.
 */
export const SalonTrafficSection: React.FC<SalonTrafficSectionProps> = ({ barbershopId }) => {
  const { user, loading: authLoading } = useAuth();
  const canView = !authLoading && (user?.role === 'OWNER' || user?.role === 'MASTER_ADMIN');

  const [reloadKey, setReloadKey] = useState(0);
  const [period, setPeriod] = useState<SalonTrafficPeriod>('week');
  const cardsState = useSalonTrafficCards(canView, barbershopId, reloadKey);
  const detailState = useSalonTrafficDetail(canView, barbershopId, period, reloadKey);

  const periodLabelId = useId();
  const retry = useCallback(() => setReloadKey(key => key + 1), []);

  if (!canView) return null;

  const cardsLoading = cardsState.requestId !== reloadKey;
  const detailLoading = detailState.requestId !== reloadKey || detailState.period !== period;
  const loading = cardsLoading || detailLoading;
  const error = cardsLoading ? null : (cardsState.error ?? (detailLoading ? null : detailState.error));
  const cards = cardsState.data;
  const detail = detailState.period === period ? detailState.data : null;
  const disabled = !loading && !error && detail?.beaconEnabled === false;
  const showData = !loading && !error && !disabled && detail !== null && cards !== null;

  return (
    <SalonTrafficView
      cards={cards}
      detail={detail}
      period={period}
      periodLabelId={periodLabelId}
      loading={loading}
      error={error}
      disabled={disabled}
      showData={showData}
      onPeriodChange={setPeriod}
      onRetry={retry}
    />
  );
};

export default SalonTrafficSection;
