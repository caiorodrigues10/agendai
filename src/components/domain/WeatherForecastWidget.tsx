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

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === tomorrow.toDateString()) return 'Amanhã';

  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

interface WeatherForecastWidgetProps {
  compact?: boolean;
}

export const WeatherForecastWidget: React.FC<WeatherForecastWidgetProps> = ({ compact = false }) => {
  const [insights, setInsights] = useState<WeatherInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    financialApi
      .getWeatherInsights(7)
      .then(data => {
        if (!cancelled) {
          setInsights(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setLoading(false);
        }
      });
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
          Configure a localização do salão em Configurações para ativar esta funcionalidade.
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

      {predictions.length > 0 && summary?.bestDay && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Média semana</p>
          <p className={`mt-1 text-lg font-black ${summary.avgDropPct <= -10 ? 'text-red-400' : 'text-emerald-400'}`}>
            {summary.avgDropPct > 0 ? '+' : ''}{summary.avgDropPct}%
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
            {formatDate(summary.bestDay.date)}
          </p>
          <p className="text-[10px] text-text-muted">{summary.bestDay.condition}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Pior dia</p>
          <p className="mt-1 text-sm font-bold text-red-400">
            {formatDate(summary.worstDay.date)}
          </p>
          <p className="text-[10px] text-text-muted">{summary.worstDay.condition}</p>
        </div>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-7">
        {(forecast.length > 0 ? forecast : predictions).map((p, index) => {
          const prediction = predictions[index];
          const style = RISK_STYLES[prediction?.riskLevel ?? 'low'];
          const weatherCode = 'weatherCode' in p ? p.weatherCode : 0;
          const tempMax = 'tempMax' in p ? p.tempMax : undefined;
          const tempMin = 'tempMin' in p ? p.tempMin : undefined;
          const condition = p.condition;
          const date = p.date;
          return (
            <div
              key={date}
              className={`rounded-xl border ${style.border} ${style.bg} p-3 text-center transition-all hover:scale-[1.02]`}
            >
              <p className="text-[10px] font-bold text-text-muted">{formatDate(date)}</p>
              <div className="my-2 flex justify-center">{getWeatherIcon(weatherCode)}</div>
              <p className="text-xs font-bold text-text-secondary">{condition}</p>
              {tempMax != null && (
                <p className="mt-1 text-[11px] font-bold text-text-primary">
                  {Math.round(tempMax)}° <span className="font-normal text-text-muted">{tempMin != null ? `${Math.round(tempMin)}°` : ''}</span>
                </p>
              )}
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
                      style={{ width: `${Math.max(5, 100 + prediction.dropPct)}%` }}
                    />
                  </div>
                  <p className={`mt-1 text-[10px] font-bold ${style.text}`}>
                    {prediction.dropPct > 0 ? '+' : ''}{prediction.dropPct}%
                  </p>
                </div>
              )}
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
