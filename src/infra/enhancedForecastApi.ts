import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';

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

export const enhancedForecastApi = {
  getForecast: (barbershopId: string, days?: number) =>
    apiClient<{
      success: boolean;
      data: EnhancedForecast[] | { predictions?: EnhancedForecast[] };
    }>(
      `/api/barbershops/${barbershopId}/analytics/enhanced-forecast${buildQuery({ days })}`,
      'GET',
      undefined,
      token()
    ).then(res => {
      const data = unwrap<unknown>(res);

      // The analytics endpoint wraps the predictions in `data.predictions`.
      // Keep this API returning an array so consumers never try to render the
      // response envelope as forecast items.
      if (Array.isArray(data)) return data as EnhancedForecast[];
      if (data && typeof data === 'object' && 'predictions' in data) {
        const predictions = (data as { predictions?: unknown }).predictions;
        return Array.isArray(predictions) ? predictions as EnhancedForecast[] : [];
      }
      return [];
    }),
};
