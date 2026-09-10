import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BarChart3, Cloud, CloudLightning, CloudRain, CloudSun, Droplets, Info, Loader2, Sun, TrendingUp } from 'lucide-react';
import { enhancedForecastApi, EnhancedForecast } from '../../infra/enhancedForecastApi';
import type { ShopWeatherDay } from '../../infra/barbershopApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatNumberBR } from '../../utils/formatters';

const dateLabel = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return {
    weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
    date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  };
};

const weatherTheme = (day: ShopWeatherDay) => {
  if (day.weatherCode >= 95) return { Icon: CloudLightning, card: 'border-violet-400/25 bg-violet-500/8', icon: 'bg-violet-500/15 text-violet-300' };
  if (day.precipProbability >= 45 || (day.weatherCode >= 51 && day.weatherCode <= 82)) return { Icon: CloudRain, card: 'border-sky-400/25 bg-sky-500/8', icon: 'bg-sky-500/15 text-sky-300' };
  if (day.weatherCode <= 1) return { Icon: Sun, card: 'border-amber-400/25 bg-amber-500/8', icon: 'bg-amber-500/15 text-amber-300' };
  if (day.weatherCode <= 3) return { Icon: CloudSun, card: 'border-cyan-400/20 bg-cyan-500/8', icon: 'bg-cyan-500/15 text-cyan-300' };
  return { Icon: Cloud, card: 'border-border bg-bg/55', icon: 'bg-surface-2 text-text-secondary' };
};

export const EnhancedForecastPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [predictions, setPredictions] = useState<EnhancedForecast[]>([]);
  const [weather, setWeather] = useState<ShopWeatherDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const report = await enhancedForecastApi.getForecastReport(barbershopId, 7);
      setPredictions(report.predictions);
      setWeather(report.forecast);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => { void load(); }, [load]);

  const predictionByDate = new Map(predictions.map(item => [item.date.slice(0, 10), item]));
  const total = predictions.reduce((sum, item) => sum + item.predicted, 0);
  const rainyDays = weather.filter(day => day.precipProbability >= 45).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_24px_70px_-46px_rgba(0,0,0,0.9)]">
      <div className="flex flex-col gap-4 border-b border-border bg-gradient-to-r from-accent/10 via-transparent to-transparent p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent"><CloudSun size={20} /></span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary">Clima e demanda da semana</h2>
              <span className="rounded-full border border-border bg-bg/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">Próximos 7 dias</span>
            </div>
            <p className="mt-1 text-sm text-text-muted">Previsão do tempo cruzada com o movimento esperado do salão.</p>
          </div>
        </div>
        <button type="button" onClick={load} disabled={loading} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-bg/70 px-4 text-sm font-semibold text-text-secondary transition hover:border-accent/30 hover:text-accent disabled:opacity-50">
          <BarChart3 size={15} /> Atualizar
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {error && <div className="mb-4 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"><AlertCircle size={16} />{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-14 text-sm text-text-muted"><Loader2 size={20} className="animate-spin text-accent" />Consultando clima e agenda...</div>
        ) : weather.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-bg/40 px-6 py-10 text-center">
            <CloudSun size={28} className="mx-auto text-accent" />
            <h3 className="mt-3 font-semibold text-text-primary">Previsão indisponível no momento</h3>
            <p className="mx-auto mt-1 max-w-lg text-sm text-text-muted">A cidade está cadastrada. Não conseguimos consultar o serviço meteorológico agora; tente atualizar em alguns instantes.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
              {weather.slice(0, 7).map(day => {
                const theme = weatherTheme(day);
                const label = dateLabel(day.date);
                const demand = predictionByDate.get(day.date.slice(0, 10));
                return (
                  <article key={day.date} className={`min-w-0 rounded-2xl border p-3.5 ${theme.card}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div><p className="text-xs font-bold capitalize text-text-primary">{label.weekday}</p><p className="text-[10px] text-text-muted">{label.date}</p></div>
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.icon}`}><theme.Icon size={19} /></span>
                    </div>
                    <p className="mt-4 text-2xl font-black text-text-primary">{Math.round(day.tempMax)}°</p>
                    <p className="truncate text-[11px] text-text-muted">{day.condition}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
                      <span className="flex items-center gap-1 text-sky-300"><Droplets size={11} />{Math.round(day.precipProbability)}%</span>
                      <span className="text-text-muted">mín. {Math.round(day.tempMin)}°</span>
                    </div>
                    {demand && <div className="mt-2 rounded-lg bg-bg/45 px-2 py-1.5 text-center text-[10px] font-semibold text-accent">{formatNumberBR(demand.predicted)} atendimentos</div>}
                  </article>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-bg/45 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-text-secondary"><Info size={15} className="text-accent" />{predictions.length ? `${formatNumberBR(total)} atendimentos estimados para a semana.` : 'A estimativa de movimento aparecerá quando houver mais histórico de atendimentos.'}</div>
              <div className="flex shrink-0 items-center gap-2 text-xs text-text-muted"><TrendingUp size={14} className="text-accent" />{rainyDays ? `${rainyDays} ${rainyDays === 1 ? 'dia com' : 'dias com'} chance de chuva` : 'Semana sem chuva relevante'}</div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
