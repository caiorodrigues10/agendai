import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CloudSun,
  Info,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { enhancedForecastApi, EnhancedForecast } from '../../infra/enhancedForecastApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatCurrencyBRL, formatNumberBR } from '../../utils/formatters';

const shortDate = (value: string) =>
  new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

const confidenceBadge: Record<string, { label: string; className: string }> = {
  insufficient: { label: 'Insuficiente', className: 'bg-gray-500/12 text-gray-400' },
  preliminary: { label: 'Preliminar', className: 'bg-warning/12 text-warning' },
  reliable: { label: 'Confiável', className: 'bg-success/12 text-success' },
};

const maturityLabel = (items: EnhancedForecast[]) => {
  if (items.length === 0) return { label: 'Sem dados', color: 'text-text-muted' };
  const reliable = items.filter(i => i.confidence === 'reliable').length;
  const pct = Math.round((reliable / items.length) * 100);
  if (pct >= 70) return { label: `${pct}% confiável`, color: 'text-success' };
  if (pct >= 40) return { label: `${pct}% preliminar`, color: 'text-warning' };
  return { label: `${pct}% insuficiente`, color: 'text-text-muted' };
};

export const EnhancedForecastPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();

  const [forecast, setForecast] = useState<EnhancedForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await enhancedForecastApi.getForecast(barbershopId, 7);
      setForecast(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = forecast.map(f => ({
    date: shortDate(f.date),
    predicted: f.predicted,
    confidence: f.confidence,
  }));

  const maturity = maturityLabel(forecast);
  const totalPredicted = forecast.reduce((sum, f) => sum + f.predicted, 0);
  const avgPredicted = forecast.length > 0 ? totalPredicted / forecast.length : 0;

  const allFactors = forecast.flatMap(f => f.factors);
  const uniqueFactors = Array.from(
    new Map(allFactors.map(factor => [factor.label, factor])).values()
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_24px_70px_-46px_rgba(0,0,0,0.9)]">
      <div className="flex flex-col gap-4 border-b border-border bg-gradient-to-r from-accent/10 via-transparent to-transparent p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
            <TrendingUp size={19} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary">Previsão de demanda</h2>
              <span className="rounded-full border border-border bg-bg/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Próximos 7 dias
              </span>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Tendência calculada a partir do histórico, agenda e clima.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-bg/70 px-4 text-sm font-semibold text-text-secondary transition-all hover:border-accent/30 hover:text-accent disabled:opacity-50"
        >
          <BarChart3 size={15} />
          Atualizar
        </button>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
        )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-bg/40 py-20 text-sm text-text-muted">
          <Loader2 size={20} className="animate-spin text-accent" />
          Preparando previsão...
        </div>
      ) : forecast.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg/40 px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <CloudSun size={26} />
          </span>
          <h3 className="mt-4 text-base font-semibold text-text-primary">Previsão em preparação</h3>
          <p className="mx-auto mt-1 max-w-lg text-sm leading-relaxed text-text-muted">
            Continue usando a agenda e concluindo atendimentos. Assim que houver histórico suficiente,
            as tendências diárias aparecerão aqui.
          </p>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-bg/50 p-5">
          <TrendingUp className="absolute -bottom-3 -right-2 text-accent/10" size={72} />
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Demanda estimada
          </p>
          <p className="mt-2 text-2xl font-black text-accent">{formatNumberBR(totalPredicted)}</p>
          <p className="mt-1 text-xs text-text-muted">atendimentos em 7 dias</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-bg/50 p-5">
          <Calendar className="absolute -bottom-3 -right-2 text-text-primary/5" size={72} />
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Média diária
          </p>
          <p className="mt-2 text-2xl font-black text-text-primary">{formatNumberBR(avgPredicted)}</p>
          <p className="mt-1 text-xs text-text-muted">atendimentos por dia</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-bg/50 p-5">
          <BarChart3 className="absolute -bottom-3 -right-2 text-text-primary/5" size={72} />
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Confiança da análise
          </p>
          <p className={`mt-2 text-2xl font-black ${maturity.color}`}>{maturity.label}</p>
          <p className="mt-1 text-xs text-text-muted">qualidade da amostra</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg/45 p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Movimento por dia</h3>
            <p className="mt-0.5 text-xs text-text-muted">Comparativo da demanda prevista</p>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
            estimativa
          </span>
        </div>
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                    axisLine={{ stroke: 'var(--color-border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: 'var(--color-text-primary)' }}
                    formatter={(value: number) => [formatNumberBR(value), 'Previsto']}
                  />
                  <Bar
                    dataKey="predicted"
                    fill="var(--color-accent)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
              {forecast.map(f => {
                const badge = confidenceBadge[f.confidence] ?? confidenceBadge.insufficient;
                return (
                  <div
                    key={f.date}
                    className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface/60 p-2.5 text-center"
                  >
                    <span className="text-[10px] font-medium text-text-muted">
                      {shortDate(f.date)}
                    </span>
                    <span className="text-sm font-semibold text-text-primary">
                      {formatNumberBR(f.predicted)}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
      </div>

      {uniqueFactors.length > 0 && (
        <div className="rounded-2xl border border-border bg-bg/45 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Info size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Fatores de influência</h3>
          </div>
          <div className="space-y-2">
            {uniqueFactors.map(factor => (
              <div
                key={factor.label}
                className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-2.5"
              >
                <span className="text-sm text-text-secondary">{factor.label}</span>
                <span
                  className={`text-sm font-semibold ${
                    factor.signal === 'positive'
                      ? 'text-success'
                      : factor.signal === 'negative'
                      ? 'text-danger'
                      : 'text-text-muted'
                  }`}
                >
                  {factor.value > 0 ? '+' : ''}
                  {factor.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
      </div>
    </section>
  );
};
