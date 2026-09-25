import React, { useEffect, useState } from 'react';
import {
  LuCloud as Cloud,
  LuCloudRain as CloudRain,
  LuCloudSun as CloudSun,
  LuLoaderCircle as Loader2,
  LuSun as Sun,
  LuTriangleAlert as AlertTriangle,
  LuTrendingDown as TrendingDown,
  LuTrendingUp as TrendingUp,
  LuCalendar as Calendar,
} from 'react-icons/lu';
import { financialApi, WeatherDemandPrediction, WeatherInsights } from '../../infra/financialApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatWeatherDayLabel } from '../../utils/weatherUtils';
import { ApiError } from '../../infra/apiClient';
import { finiteNumber, getWeatherVisual } from '../../utils/weatherVisuals';

const RISK_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  low: {
    bg: 'bg-emerald-400/5',
    border: 'border-emerald-400/20',
    text: 'text-emerald-400',
    icon: 'text-emerald-400',
  },
  medium: {
    bg: 'bg-yellow-400/5',
    border: 'border-yellow-400/20',
    text: 'text-yellow-400',
    icon: 'text-yellow-400',
  },
  high: {
    bg: 'bg-red-400/5',
    border: 'border-red-400/20',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
};

function getWeatherIcon(code: number): React.ReactNode {
  if (code <= 1) return <Sun size={24} className="h-6 w-6 text-yellow-400" />;
  if (code <= 3) return <CloudSun size={24} className="h-6 w-6 text-neutral-400" />;
  if (code >= 51 && code <= 67) return <CloudRain size={24} className="h-6 w-6 text-blue-400" />;
  if (code >= 80 && code <= 82) return <CloudRain size={24} className="h-6 w-6 text-blue-400" />;
  if (code >= 95) return <CloudRain size={24} className="h-6 w-6 text-purple-400" />;
  return <Cloud size={24} className="h-6 w-6 text-neutral-400" />;
}

interface WeatherForecastWidgetProps {
  compact?: boolean;
}

export const WeatherForecastWidget: React.FC<WeatherForecastWidgetProps> = ({ compact = false }) => {
  const [insights, setInsights] = useState<WeatherInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationMissing, setLocationMissing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setLocationMissing(false);
    const load = async () => {
      try {
        const data = await financialApi.getWeatherInsights(7);
        if (!cancelled) setInsights(data);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setLocationMissing(
            err instanceof ApiError &&
              err.statusCode === 400 &&
              (err.code === 'WEATHER_LOCATION_MISSING' || /localiza[cç][aã]o/i.test(err.message))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted gap-2">
        <Loader2 size={18} className="animate-spin text-accent" />
        <span className="text-sm">Consultando previsão do tempo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <Cloud size={24} className="mx-auto h-8 w-8 text-text-muted" />
        <p className="mt-3 text-sm font-semibold text-text-primary">Não foi possível carregar o clima</p>
        <p className="mt-1 text-xs text-text-muted">
          {locationMissing
            ? 'Cadastre a cidade do salão em Configurações para ativar a previsão climática.'
            : 'Verifique sua conexão e tente novamente. Enquanto isso, o restante do painel continua funcionando normalmente.'}
        </p>
        {!locationMissing && <p className="mt-1 text-[11px] text-text-muted/80">{error}</p>}
        {!locationMissing && (
          <button
            type="button"
            onClick={() => setReloadKey(k => k + 1)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
          >
            <Loader2 size={12} /> Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (!insights || (insights.predictions.length === 0 && (!insights.forecast || insights.forecast.length === 0))) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <Calendar size={24} className="mx-auto h-8 w-8 text-text-muted" />
        <p className="mt-3 text-sm font-semibold text-text-primary">Aguardando dados do clima</p>
        <p className="mt-1 text-xs text-text-muted">
          {locationMissing
            ? 'Configure a cidade do salão em Configurações para ver a previsão do tempo e a demanda estimada.'
            : 'A previsão climática ficará disponível assim que o serviço meteorológico responder. Enquanto isso, as outras funcionalidades estão operacionais.'}
        </p>
      </div>
    );
  }

  const { predictions, summary, highlights } = insights;
  const forecast = insights.forecast ?? [];

  if (compact) {
    const tomorrow = predictions[0];
    if (!tomorrow || tomorrow.riskLevel === 'low') return null;

    const style = RISK_STYLES[tomorrow.riskLevel] ?? RISK_STYLES.low;
    return (
      <div className={`rounded-xl border ${style.border} ${style.bg} p-4`}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className={`h-5 w-5 ${style.icon}`} />
          <div>
            <p className={`text-sm font-bold ${style.text}`}>
              {formatWeatherDayLabel(tomorrow.date)}: {tomorrow.condition} — {Math.abs(finiteNumber(tomorrow.dropPct))}% menos clientes
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{tomorrow.recommendation}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {highlights?.length > 0 && (
        <div className="space-y-1.5">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {h}
            </div>
          ))}
        </div>
      )}

      {insights.modelTrained && predictions.length > 0 && summary?.bestDay && summary?.worstDay && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Média da semana</p>
          <p className={`mt-1.5 text-lg font-black ${summary.avgDropPct <= -10 ? 'text-red-400' : 'text-emerald-400'}`}>
            {finiteNumber(summary.avgDropPct) > 0 ? '+' : ''}{finiteNumber(summary.avgDropPct)}%
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Dias de queda</p>
          <p className={`mt-1.5 text-lg font-black ${summary.highRiskCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {summary.highRiskCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Melhor dia</p>
          <p className="mt-1.5 text-sm font-bold text-emerald-400">
            {formatWeatherDayLabel(summary.bestDay.date)}
          </p>
          <p className="text-[10px] text-white/45">{summary.bestDay.condition}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Pior dia</p>
          <p className="mt-1.5 text-sm font-bold text-red-400">
            {formatWeatherDayLabel(summary.worstDay.date)}
          </p>
          <p className="text-[10px] text-white/45">{summary.worstDay.condition}</p>
        </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {(forecast.length > 0 ? forecast : predictions).map((p, index) => {
          const prediction = predictions[index];
          const style = RISK_STYLES[prediction?.riskLevel ?? 'low'] ?? RISK_STYLES.low;
          const weatherCode = 'weatherCode' in p ? p.weatherCode : 0;
          const tempMax = 'tempMax' in p ? p.tempMax : undefined;
          const tempMin = 'tempMin' in p ? p.tempMin : undefined;
          const condition = p.condition;
          const date = p.date;
          const visual = getWeatherVisual(weatherCode, condition);
          const rainProbability = 'precipProbability' in p ? finiteNumber(p.precipProbability) : 0;
          const rainAmount = 'precipMm' in p ? finiteNumber(p.precipMm) : 0;
          return (
            <div
              key={date}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-bg text-left shadow-lg transition-transform duration-200 hover:scale-[1.03]"
            >
              <img src={visual.image} alt="" className={`weather-image weather-image--${visual.effect} absolute inset-0 h-full w-full object-cover`} />
              <span aria-hidden="true" className={`weather-effect weather-effect--${visual.effect}`} />
              <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/10 via-black/30 to-black/80" />
              <div className="relative z-10 flex flex-col p-3">
                {/* Header: day + glow dot */}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-white/80">
                    {formatWeatherDayLabel(date)}
                  </p>
                  <span className={`h-2 w-2 rounded-full ${visual.glow}`} />
                </div>

                {/* Weather icon + condition */}
                <div className="mt-3 flex items-center gap-2">
                  {getWeatherIcon(weatherCode)}
                  <p className="text-[11px] font-semibold leading-tight text-white/90 line-clamp-2">{condition}</p>
                </div>

                {/* Temperature */}
                {tempMax != null && (
                  <p className={`mt-2.5 text-xl font-black leading-none ${visual.accent}`}>
                    {Math.round(finiteNumber(tempMax))}°
                    {tempMin != null && (
                      <span className="ml-1 text-[11px] font-medium text-white/50">{Math.round(finiteNumber(tempMin))}°</span>
                    )}
                  </p>
                )}

                {/* Rain info */}
                <p className="mt-1.5 text-[10px] text-white/55">
                  {rainProbability > 0 ? `${Math.round(rainProbability)}% chuva` : rainAmount > 0 ? `${rainAmount} mm` : 'Sem chuva'}
                </p>

                {/* Demand prediction bar */}
                {insights.modelTrained && prediction && (
                  <div className="mt-auto pt-2.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all ${
                          prediction.riskLevel === 'high' || prediction.riskLevel === 'critical'
                            ? 'bg-red-400'
                            : prediction.riskLevel === 'medium'
                              ? 'bg-yellow-400'
                              : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, 100 + finiteNumber(prediction.dropPct)))}%` }}
                      />
                    </div>
                    <p className={`mt-1 text-[10px] font-bold ${style.text}`}>
                      {finiteNumber(prediction.dropPct) > 0 ? '+' : ''}{finiteNumber(prediction.dropPct)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-white/30 text-right">
        {insights.modelTrained
          ? `Previsão baseada em ${insights.historicalDays} dias de dados`
          : 'Previsão com dados limitados'} · Próximos 7 dias
      </p>
    </div>
  );
};
