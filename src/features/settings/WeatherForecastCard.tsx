import React, { useEffect, useState } from 'react';
import { ShopSettings } from '../../types';
import { barbershopApi, ShopWeatherDay } from '../../infra/barbershopApi';
import { finiteNumber } from '../../utils/weatherVisuals';
import {
  LuCloud as Cloud,
  LuCloudRain as CloudRain,
  LuCloudSun as CloudSun,
  LuSun as Sun,
  LuLoaderCircle as Loader2,
} from 'react-icons/lu';

function weatherIcon(code: number) {
  if (code <= 1) return <Sun size={16} className="text-warning" />;
  if (code <= 3) return <CloudSun size={16} className="text-text-secondary" />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) {
    return <CloudRain size={16} className="text-support" />;
  }
  return <Cloud size={16} className="text-text-muted" />;
}

function weatherDayLabel(dateStr: string) {
  const day = new Date(`${dateStr}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (day.toDateString() === today.toDateString()) return 'Hoje';
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (day.toDateString() === tomorrow.toDateString()) return 'Amanhã';
  return day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
}

export const WeatherForecastCard: React.FC<{
  barbershopId?: string;
  settings: ShopSettings;
}> = ({ barbershopId, settings }) => {
  const [forecast, setForecast] = useState<ShopWeatherDay[] | null>(null);
  const [weatherFailed, setWeatherFailed] = useState(false);
  const locationReady = settings.latitude != null && settings.longitude != null;

  useEffect(() => {
    if (!barbershopId || settings.latitude == null || settings.longitude == null) return;
    let cancelled = false;
    barbershopApi
      .getWeatherForecast(barbershopId, 7)
      .then(data => {
        if (!cancelled) {
          setWeatherFailed(false);
          setForecast(data.forecast);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWeatherFailed(true);
          setForecast(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [barbershopId, settings.latitude, settings.longitude]);

  if (!locationReady) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Cloud size={16} className="text-accent" />
        <h3 className="text-lg font-bold text-text-primary">Previsão do tempo</h3>
      </div>
      <p className="text-xs text-text-muted mb-4">
        Clima previsto para os próximos 7 dias — usado para prever demanda.
      </p>
      {!forecast && !weatherFailed && (
        <p className="text-[11px] text-text-muted flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin" /> Carregando clima...
        </p>
      )}
      {weatherFailed && (
        <p className="text-[11px] text-text-muted">Não foi possível carregar a previsão do tempo.</p>
      )}
      {forecast && forecast.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {forecast.slice(0, 7).map(day => (
            <div key={day.date} className="rounded-lg border border-border bg-bg p-2 text-center">
              <p className="text-[10px] font-bold text-text-muted">{weatherDayLabel(day.date)}</p>
              <div className="my-1 flex justify-center">{weatherIcon(day.weatherCode)}</div>
              <p className="text-[11px] font-bold text-text-primary">{Math.round(finiteNumber(day.tempMax))}°</p>
              <p className="text-[10px] text-text-muted">{Math.round(finiteNumber(day.tempMin))}°</p>
              <p className="mt-1 text-[10px] text-text-secondary leading-tight line-clamp-2">{day.condition}</p>
              {finiteNumber(day.precipProbability) > 0 && (
                <p className="mt-0.5 text-[10px] text-support">{Math.round(finiteNumber(day.precipProbability))}%</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
