import React, { useEffect, useState } from 'react';
import {
  Cloud,
  CloudRain,
  CloudSun,
  Loader2,
  Sun,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Calendar,
} from 'lucide-react';
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
  if (code <= 1) return <Sun className="h-6 w-6 text-yellow-400" />;
  if (code <= 3) return <CloudSun className="h-6 w-6 text-neutral-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="h-6 w-6 text-blue-400" />;
  if (code >= 80 && code <= 82) return <CloudRain className="h-6 w-6 text-blue-400" />;
  if (code >= 95) return <CloudRain className="h-6 w-6 text-purple-400" />;
  return <Cloud className="h-6 w-6 text-neutral-400" />;
}

interface WeatherForecastWidgetProps {
  compact?: boolean;
}

export const WeatherForecastWidget: React.FC<WeatherForecastWidgetProps> = ({ compact = false }) => {
  const [insights, setInsights] = useState<WeatherInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationMissing, setLocationMissing] = useState(false);

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
              /localiza[cç][aã]o/i.test(err.message)
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted gap-2">
        <Loader2 size={18} className="animate-spin text-accent" />
        <span className="text-sm">Carregando previsão climática...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <Cloud className="mx-auto h-8 w-8 text-text-muted" />
        <p className="mt-3 text-sm text-text-muted">{error}</p>
        <p className="mt-1 text-xs text-text-muted">
          {locationMissing
            ? 'Configure a localização do salão em Configurações para ativar esta funcionalidade.'
            : 'A última previsão disponível será exibida assim que o serviço meteorológico responder.'}
        </p>
      </div>
    );
  }

  if (!insights || (insights.predictions.length === 0 && (!insights.forecast || insights.forecast.length === 0))) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <Calendar className="mx-auto h-8 w-8 text-text-muted" />
        <p className="mt-3 text-sm text-text-muted">Sem dados suficientes para previsão.</p>
        <p className="mt-1 text-xs text-text-muted">
          Informe a cidade do salão em Configurações para ver o clima.
        </p>
      </div>
    );
  }

  const { predictions, summary, highlights } = insights;
  const forecast = insights.forecast ?? [];

  if (compact) {
    const tomorrow = predictions[0];
    if (!tomorrow || tomorrow.riskLevel === 'low') return null;

    const style = RISK_STYLES[tomorrow.riskLevel];
    return (
      <div className={`rounded-xl border ${style.border} ${style.bg} p-4`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className={`h-5 w-5 ${style.icon}`} />
          <div>
            <p className={`text-sm font-bold ${style.text}`}>
              Amanhã: {tomorrow.condition} — {Math.abs(tomorrow.dropPct)}% menos clientes
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{tomorrow.recommendation}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {highlights?.length > 0 && (
        <div className="space-y-2">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {h}
            </div>
          ))}
        </div>
      )}

      {insights.modelTrained && predictions.length > 0 && summary?.bestDay && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Média semana</p>
          <p className={`mt-1 text-lg font-black ${summary.avgDropPct <= -10 ? 'text-red-400' : 'text-emerald-400'}`}>
            {finiteNumber(summary.avgDropPct) > 0 ? '+' : ''}{finiteNumber(summary.avgDropPct)}%
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Dias arriscados</p>
          <p className={`mt-1 text-lg font-black ${summary.highRiskCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {summary.highRiskCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Melhor dia</p>
          <p className="mt-1 text-sm font-bold text-emerald-400">
            {formatWeatherDayLabel(summary.bestDay.date)}
          </p>
          <p className="text-[10px] text-text-muted">{summary.bestDay.condition}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Pior dia</p>
          <p className="mt-1 text-sm font-bold text-red-400">
            {formatWeatherDayLabel(summary.worstDay.date)}
          </p>
          <p className="text-[10px] text-text-muted">{summary.worstDay.condition}</p>
        </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {(forecast.length > 0 ? forecast : predictions).map((p, index) => {
          const prediction = predictions[index];
          const style = RISK_STYLES[prediction?.riskLevel ?? 'low'];
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
              className="group relative min-h-52 overflow-hidden rounded-2xl border border-white/10 bg-bg text-left shadow-lg"
            >
              <img src={visual.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/95" />
              <div className="relative flex min-h-52 flex-col p-3.5">
              <div className="flex items-center justify-between"><p className="text-[10px] font-bold text-white/75">{formatWeatherDayLabel(date)}</p><span className={`h-2.5 w-2.5 rounded-full ${visual.glow}`} /></div>
              <div className="mt-auto">{getWeatherIcon(weatherCode)}</div>
              <p className="mt-2 min-h-8 text-xs font-bold leading-tight text-white">{condition}</p>
              {tempMax != null && (
                <p className={`mt-1 text-2xl font-black ${visual.accent}`}>
                  {Math.round(finiteNumber(tempMax))}° <span className="text-xs font-normal text-white/60">{tempMin != null ? `${Math.round(finiteNumber(tempMin))}°` : ''}</span>
                </p>
              )}
              <p className="mt-1 text-[10px] text-white/65">{rainProbability > 0 ? `${Math.round(rainProbability)}% de chuva` : `${rainAmount} mm previstos`}</p>
              {prediction && (
                <div className="mt-2">
                  <div className="h-1 rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${
                        prediction.riskLevel === 'high' || prediction.riskLevel === 'critical'
                          ? 'bg-red-400'
                          : prediction.riskLevel === 'medium'
                            ? 'bg-yellow-400'
                            : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, 100 + finiteNumber(prediction.dropPct)))}%` }}
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

      <p className="text-[10px] text-text-muted text-right">
        Modelo: {insights.modelTrained ? `${insights.historicalDays} dias de treino` : 'Insuficiente'} · Previsão: 7 dias
      </p>
    </div>
  );
};
