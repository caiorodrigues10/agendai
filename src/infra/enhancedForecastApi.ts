import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';
import type { ShopWeatherDay } from './barbershopApi';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface ForecastFactor {
  signal: string;
  value: number;
  label: string;
}

export interface EnhancedForecast {
  date: string;
  predicted: number;
  confidence: 'insufficient' | 'preliminary' | 'reliable';
  factors: ForecastFactor[];
}

export interface EnhancedForecastReport {
  predictions: EnhancedForecast[];
  forecast: ShopWeatherDay[];
}

const getForecastReport = (barbershopId: string, days?: number) =>
  apiClient<{
    success: boolean;
    data: EnhancedForecast[] | { predictions?: EnhancedForecast[]; forecast?: ShopWeatherDay[] };
  }>(
    `/api/barbershops/${barbershopId}/analytics/enhanced-forecast${buildQuery({ days })}`,
    'GET', undefined, token()
  ).then((res): EnhancedForecastReport => {
    const data = unwrap<unknown>(res);
    if (Array.isArray(data)) return { predictions: data as EnhancedForecast[], forecast: [] };
    if (!data || typeof data !== 'object') return { predictions: [], forecast: [] };
    const report = data as { predictions?: unknown; forecast?: unknown };
    return {
      predictions: Array.isArray(report.predictions) ? report.predictions as EnhancedForecast[] : [],
      forecast: Array.isArray(report.forecast) ? report.forecast as ShopWeatherDay[] : [],
    };
  });

export const enhancedForecastApi = {
  getForecastReport,
  getForecast: (barbershopId: string, days?: number) =>
    getForecastReport(barbershopId, days).then(report => report.predictions),
};
