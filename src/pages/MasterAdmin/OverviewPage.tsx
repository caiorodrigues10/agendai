import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuLoader, LuTriangleAlert, LuRefreshCcw } from 'react-icons/lu';
import {
  adminInternalApi,
  AdminOverview,
  OverviewPeriod,
} from '../../infra/adminInternalApi';
import {
  bucketLabel,
  ChartRow,
  EmptyPeriodNotice,
  OverviewAttention,
  OverviewCharts,
  OverviewFooter,
  OverviewGrowth,
  OverviewHealth,
  OverviewKpis,
  OverviewPlans,
} from './OverviewPanels';
import { OverviewProductAdoption } from './OverviewProductAdoption';

const PERIODS: { key: OverviewPeriod; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: '12m', label: '12 meses' },
];

const VALID_PERIODS = PERIODS.map((option) => option.key);

const timeAgo = (iso: string, now: number): string => {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `há ${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.round(hours / 24)}d`;
};

const buildChartRows = (data: AdminOverview | null): ChartRow[] => {
  if (!data) return [];
  const { series, revenue, mrr, newShops, appointmentsCreated, appointmentsCompleted } = data.charts;
  return series.map((date, index) => ({
    date,
    label: bucketLabel(date, data.period.bucket),
    revenue: revenue[index] ?? 0,
    mrr: mrr[index] ?? 0,
    newShops: newShops[index] ?? 0,
    created: appointmentsCreated[index] ?? 0,
    completed: appointmentsCompleted[index] ?? 0,
  }));
};

const hasMovements = (data: AdminOverview): boolean =>
  data.revenue.mrr > 0 ||
  data.revenue.periodRevenue > 0 ||
  data.growth.newShops > 0 ||
  data.usage.appointmentsCreated > 0;

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <LuLoader className="animate-spin text-accent" size={32} />
  </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="text-center py-20">
    <LuTriangleAlert className="mx-auto mb-3 text-warning" size={32} />
    <p className="text-text-secondary mb-3">{message}</p>
    <button onClick={onRetry} className="text-accent text-sm hover:underline">
      Tentar novamente
    </button>
  </div>
);

const PeriodSelector: React.FC<{
  current: OverviewPeriod;
  onChange: (next: OverviewPeriod) => void;
}> = ({ current, onChange }) => (
  <div className="flex rounded-lg border border-border bg-surface p-1" role="group" aria-label="Período">
    {PERIODS.map((option) => (
      <button
        key={option.key}
        type="button"
        aria-pressed={current === option.key}
        onClick={() => onChange(option.key)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-focus ${
          current === option.key ? 'bg-accent text-white' : 'text-text-secondary hover:bg-hover-bg'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const OverviewPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loadedPeriod, setLoadedPeriod] = useState<OverviewPeriod | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ period: OverviewPeriod; message: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const periodParam = searchParams.get('period') as OverviewPeriod | null;
  const period: OverviewPeriod =
    periodParam && VALID_PERIODS.includes(periodParam) ? periodParam : '30d';

  const fetchInto = useCallback(
    async (target: OverviewPeriod, failureMessage: string) => {
      try {
        const res = await adminInternalApi.getOverview(target);
        setData(res.data);
        setLoadedPeriod(target);
        setError(null);
      } catch {
        setError({ period: target, message: failureMessage });
      }
    },
    [],
  );

  const retry = useCallback(() => {
    void fetchInto(period, 'Não foi possível carregar a visão geral.');
  }, [fetchInto, period]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await adminInternalApi.getOverview(period);
      setData(res.data);
      setLoadedPeriod(period);
      setError(null);
    } catch {
      setError({ period, message: 'Não foi possível atualizar os dados.' });
    } finally {
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    let active = true;
    adminInternalApi
      .getOverview(period)
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setLoadedPeriod(period);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError({ period, message: 'Não foi possível carregar a visão geral.' });
      });
    return () => {
      active = false;
    };
  }, [period]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, []);

  const chartRows = useMemo(() => buildChartRows(data), [data]);
  const currentError = error?.period === period ? error.message : null;
  const loading = !currentError && loadedPeriod !== period;

  const changePeriod = (next: OverviewPeriod) => {
    const params = new URLSearchParams(searchParams);
    params.set('period', next);
    setSearchParams(params, { replace: true });
  };

  if (loading && !data) return <LoadingState />;
  if (currentError && !data) return <ErrorState message={currentError} onRetry={retry} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Visão geral</h1>
          <p className="text-sm text-text-muted">
            {data.period.label} · atualizado {timeAgo(data.generatedAt, now)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector current={period} onChange={changePeriod} />
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            aria-label="Atualizar dados"
            className="p-2 rounded-lg border border-border bg-surface text-text-muted hover:bg-hover-bg disabled:opacity-60"
          >
            <LuRefreshCcw size={16} className={refreshing ? 'animate-spin' : undefined} />
          </button>
        </div>
      </div>

      {currentError && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          <LuTriangleAlert size={16} />
          {currentError}
        </div>
      )}

      {!hasMovements(data) && <EmptyPeriodNotice />}

      <OverviewKpis data={data} />
      <OverviewCharts rows={chartRows} />

      <div className="grid md:grid-cols-2 gap-4">
        <OverviewPlans data={data} />
        <OverviewGrowth data={data} />
      </div>

      <OverviewHealth data={data} />
      <OverviewProductAdoption />
      <OverviewAttention attention={data.attention} />
      <OverviewFooter />
    </div>
  );
};

export default OverviewPage;
