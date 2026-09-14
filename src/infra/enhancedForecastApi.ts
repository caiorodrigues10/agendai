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
  factors: (ForecastFactor | string)[];
}

function normalizePredictions(value: unknown): EnhancedForecast[] {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item.date === 'string').map(item => {
    const predicted = Number(item.predicted ?? item.predictedQueue);
    return {
      date: item.date,
      predicted: Number.isFinite(predicted) ? Math.max(0, predicted) : 0,
      confidence: ['preliminary', 'reliable'].includes(item.confidence) ? item.confidence : 'insufficient',
      factors: Array.isArray(item.factors) ? item.factors : [],
    };
  });
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
    if (Array.isArray(data)) return { predictions: normalizePredictions(data), forecast: [] };
    if (!data || typeof data !== 'object') return { predictions: [], forecast: [] };
    const report = data as { predictions?: unknown; forecast?: unknown };
    return {
      predictions: normalizePredictions(report.predictions),
      forecast: Array.isArray(report.forecast) ? report.forecast as ShopWeatherDay[] : [],
    };
  });

export const enhancedForecastApi = {
  getForecastReport,
  getForecast: (barbershopId: string, days?: number) =>
    getForecastReport(barbershopId, days).then(report => report.predictions),
};
