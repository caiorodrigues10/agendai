import React, { useEffect, useState } from 'react';
import { CloudRain, Loader2, Sun, Cloud, CloudSun, AlertTriangle } from 'lucide-react';
import { financialApi, WeatherDemandPrediction } from '../../infra/financialApi';
import { formatWeatherDayLabel } from '../../utils/weatherUtils';
import { finiteNumber } from '../../utils/weatherVisuals';

interface DemandAlertBannerProps {
  compact?: boolean;
}

function getWeatherIcon(code: number): React.ReactNode {
  if (code <= 1) return <Sun className="h-4 w-4 text-yellow-400" />;
  if (code <= 3) return <CloudSun className="h-4 w-4 text-neutral-400" />;
  if (code >= 51) return <CloudRain className="h-4 w-4 text-blue-400" />;
  return <Cloud className="h-4 w-4 text-neutral-400" />;
}

const RISK_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  low: { bg: 'bg-emerald-400/5', border: 'border-emerald-400/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
  medium: { bg: 'bg-yellow-400/5', border: 'border-yellow-400/20', text: 'text-yellow-400', icon: 'text-yellow-400' },
  high: { bg: 'bg-red-400/5', border: 'border-red-400/20', text: 'text-red-400', icon: 'text-red-400' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' },
};

export const DemandAlertBanner: React.FC<DemandAlertBannerProps> = ({ compact = true }) => {
  const [tomorrow, setTomorrow] = useState<WeatherDemandPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    financialApi
      .getWeatherInsights(2)
      .then(data => {
        if (!cancelled && data.modelTrained && data.predictions.length > 0) {
          setTomorrow(data.predictions[0]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return null;
  }

  if (!tomorrow || tomorrow.riskLevel === 'low') {
    return null;
  }

  const style = RISK_STYLES[tomorrow.riskLevel] ?? RISK_STYLES.low;
  const dropPct = Math.abs(finiteNumber(tomorrow.dropPct));

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-3`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className={`h-4 w-4 shrink-0 ${style.icon}`} />
        <div className="min-w-0">
          <p className={`text-xs font-bold ${style.text}`}>
            {formatWeatherDayLabel(tomorrow.date)}: {tomorrow.condition} — {dropPct}% menos clientes
          </p>
          {!compact && (
            <p className="mt-0.5 text-[11px] text-text-muted truncate">{tomorrow.recommendation}</p>
          )}
        </div>
      </div>
    </div>
  );
};
