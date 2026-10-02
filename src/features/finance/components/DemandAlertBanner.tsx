import React, { useEffect, useState } from 'react';
import {
  LuCloudRain as CloudRain,
  LuLoaderCircle as Loader2,
  LuSun as Sun,
  LuCloud as Cloud,
  LuCloudSun as CloudSun,
  LuTriangleAlert as AlertTriangle,
} from 'react-icons/lu';
import { financialApi, WeatherDemandPrediction } from '../../../infra/financialApi';
import { formatWeatherDayLabel } from '../../../utils/weatherUtils';
import { finiteNumber } from '../../../utils/weatherVisuals';

interface DemandAlertBannerProps {
  compact?: boolean;
}

function getWeatherIcon(code: number): React.ReactNode {
  if (code <= 1) return <Sun size={24} className="h-4 w-4 text-warning" />;
  if (code <= 3) return <CloudSun size={24} className="h-4 w-4 text-text-muted" />;
  if (code >= 51) return <CloudRain size={24} className="h-4 w-4 text-support" />;
  return <Cloud size={24} className="h-4 w-4 text-text-muted" />;
}

const RISK_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  low: { bg: 'bg-success/5', border: 'border-success/20', text: 'text-success', icon: 'text-success' },
  medium: { bg: 'bg-warning/5', border: 'border-warning/20', text: 'text-warning', icon: 'text-warning' },
  high: { bg: 'bg-danger/5', border: 'border-danger/20', text: 'text-danger', icon: 'text-danger' },
  critical: { bg: 'bg-danger/10', border: 'border-danger/30', text: 'text-danger', icon: 'text-danger' },
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
        <AlertTriangle size={24} className={`h-4 w-4 shrink-0 ${style.icon}`} />
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
