import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface ProfitSettings {
  id: string;
  barbershopId: string;
  defaultTaxRate: number;
  defaultCommission: number;
  overheadCategories: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface ProfitEntry {
  id: string;
  barbershopId: string;
  period: string;
  serviceId: string | null;
  staffId: string | null;
  revenue: number;
  directCosts: number;
  overheadCosts: number;
  taxAmount: number;
  commissionAmt: number;
  netProfit: number;
  marginPercent: number;
  computedAt: string;
  service?: { id: string; name: string } | null;
  staff?: { id: string; name: string } | null;
}

export interface ProfitPeriodData {
  period: string;
  entries: ProfitEntry[];
  totals: {
    revenue: number;
    directCosts: number;
    overheadCosts: number;
    taxAmount: number;
    commissionAmt: number;
    netProfit: number;
    marginPercent: number;
  };
}

export interface ProfitTrendPoint {
  period: string;
  revenue: number;
  netProfit: number;
  marginPercent: number;
}

export const profitApi = {
  getSettings: (barbershopId: string) =>
    apiClient<{ data: ProfitSettings }>(
      `/api/barbershops/${barbershopId}/profit/settings`,
      'GET', undefined, token()
    ).then(r => unwrap<ProfitSettings>(r)),

  updateSettings: (barbershopId: string, data: {
    defaultTaxRate?: number;
    defaultCommission?: number;
    overheadCategories?: Record<string, number>;
  }) =>
    apiClient<{ data: ProfitSettings }>(
      `/api/barbershops/${barbershopId}/profit/settings`,
      'PUT', data, token()
    ).then(r => unwrap<ProfitSettings>(r)),

  getPeriodProfit: (barbershopId: string, period: string) =>
    apiClient<{ data: ProfitPeriodData }>(
      `/api/barbershops/${barbershopId}/profit/period/${period}`,
      'GET', undefined, token()
    ).then(r => unwrap<ProfitPeriodData>(r)),

  computePeriod: (barbershopId: string, period: string) =>
    apiClient<{ data: ProfitPeriodData & { summary: Record<string, number> } }>(
      `/api/barbershops/${barbershopId}/profit/compute`,
      'POST', { period }, token()
    ).then(r => unwrap<ProfitPeriodData & { summary: Record<string, number> }>(r)),

  getTrend: (barbershopId: string, months?: number) => {
    const qs = new URLSearchParams();
    if (months) qs.set('months', String(months));
    const query = qs.toString();
    return apiClient<{ data: ProfitTrendPoint[] }>(
      `/api/barbershops/${barbershopId}/profit/trend${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<ProfitTrendPoint[]>(r));
  },

  getByService: (barbershopId: string, period?: string) => {
    const qs = new URLSearchParams();
    if (period) qs.set('period', period);
    const query = qs.toString();
    return apiClient<{ data: ProfitEntry[] }>(
      `/api/barbershops/${barbershopId}/profit/by-service${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<ProfitEntry[]>(r));
  },

  getByStaff: (barbershopId: string, period?: string) => {
    const qs = new URLSearchParams();
    if (period) qs.set('period', period);
    const query = qs.toString();
    return apiClient<{ data: ProfitEntry[] }>(
      `/api/barbershops/${barbershopId}/profit/by-staff${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<ProfitEntry[]>(r));
  },
};
