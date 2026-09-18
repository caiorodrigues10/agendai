import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';
import { unwrapData, unwrapList } from '../utils/apiData';

function token() {
  return authStorage.getAccessToken() || '';
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export interface CashMovement {
  id: string;
  barbershopId: string;
  type: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  sourceType?: string;
  sourceId?: string;
  createdBy: string;
  createdAt: string;
}

export interface CashSummary {
  date: string;
  movements: CashMovement[];
  byMethod: Record<string, { count: number; total: number }>;
  total: number;
}

export const cashApi = {
  registerMovement: (barbershopId: string, data: {
    type: string;
    amount: number;
    paymentMethod: string;
    description?: string;
    sourceType?: string;
    sourceId?: string;
    idempotencyKey?: string;
  }) =>
    apiClient<{ success: boolean; data: CashMovement }>(
      `/api/barbershops/${barbershopId}/cash/movements`,
      'POST',
      data,
      token()
    ).then(res => unwrapData<CashMovement>(res)),

  getMovements: (barbershopId: string, params?: { date?: string; paymentMethod?: string }) =>
    apiClient<{ success: boolean; data: CashMovement[] }>(
      `/api/barbershops/${barbershopId}/cash/movements${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrapList<CashMovement>(res)),

  getSummary: (barbershopId: string, date?: string) =>
    apiClient<{ success: boolean; data: CashSummary }>(
      `/api/barbershops/${barbershopId}/cash/summary${buildQuery({ date })}`,
      'GET',
      undefined,
      token()
    ).then(res => {
      const data = unwrapData<CashSummary | { summary?: CashSummary['byMethod']; totalMovements?: number }>(res);
      if (data && typeof data === 'object' && 'byMethod' in data && data.byMethod) {
        return data as CashSummary;
      }
      const byMethod =
        data && typeof data === 'object' && 'summary' in data && data.summary && typeof data.summary === 'object'
          ? data.summary
          : {};
      const total = Object.values(byMethod).reduce((sum, entry) => sum + (entry?.total ?? 0), 0);
      return {
        date: todayIso(),
        movements: [],
        byMethod,
        total,
      };
    }),
};
