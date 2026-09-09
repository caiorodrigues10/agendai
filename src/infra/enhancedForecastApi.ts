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
    apiClient<{ success: boolean; data: EnhancedForecast[] }>(
      `/api/barbershops/${barbershopId}/analytics/enhanced-forecast${buildQuery({ days })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<EnhancedForecast[]>(res)),
};
