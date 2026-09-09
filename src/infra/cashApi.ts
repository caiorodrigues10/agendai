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
    ).then(res => unwrap<CashMovement>(res)),

  getMovements: (barbershopId: string, params?: { date?: string; paymentMethod?: string }) =>
    apiClient<{ success: boolean; data: CashMovement[] }>(
      `/api/barbershops/${barbershopId}/cash/movements${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<CashMovement[]>(res)),

  getSummary: (barbershopId: string, date?: string) =>
    apiClient<{ success: boolean; data: CashSummary }>(
      `/api/barbershops/${barbershopId}/cash/summary${buildQuery({ date })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<CashSummary>(res)),
};
