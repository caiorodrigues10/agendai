import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

const token = () => authStorage.getAccessToken() || '';
const query = (params: Record<string, string | number | boolean | undefined>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined) qs.set(key, String(value)); });
  return qs.toString() ? `?${qs}` : '';
};
const data = <T>(result: { data: T }) => result.data;

export type CrmSegment = 'all' | 'new' | 'recurring' | 'vip' | 'at_risk' | 'inactive_30' | 'inactive_60' | 'inactive_90' | 'debtors' | 'package_expiring' | 'low_demand';
export type CrmClientMetric = { clientId: string; name: string; whatsapp: string; ltv: number; grossRevenue: number; receivedRevenue: number; outstanding: number; visits: number; avgTicket: number; lastVisitAt: string | null; daysSinceLastVisit: number | null; risk: 'low' | 'medium' | 'high'; segment: CrmSegment; favoriteService: string | null; activePackageSessions: number; marketingOptIn: boolean };
export type CrmOverview = { from: string; to: string; compare: { grossRevenue: number; receivedRevenue: number; customers: number } | null; kpis: Record<string, number | null>; byDay: Array<{ date: string; grossRevenue: number; receivedRevenue: number; visits: number }>; topClients: CrmClientMetric[]; segments: Array<{ segment: CrmSegment; label: string; count: number; potential: number }> };
export type CrmForecast = { horizon: number; maturity: 'insufficient' | 'preliminary' | 'trained'; historicalDays: number; backtest: { mae: number | null; mape: number | null }; predictions: Array<{ date: string; predictedVisits: number; predictedRevenue: number; confidenceLow: number; confidenceHigh: number; weather: string | null; risk: 'low' | 'medium' | 'high'; factors: string[] }> };

export const crmApi = {
  overview: async (params: { from?: string; to?: string; compare?: boolean } = {}) => data(await apiClient<{ data: CrmOverview }>(`/api/crm/overview${query(params)}`, 'GET', undefined, token())),
  clients: async (params: { page?: number; limit?: number; search?: string; segment?: CrmSegment; sort?: 'ltv' | 'lastVisit' | 'outstanding' } = {}) => {
    const result = await apiClient<{ data: CrmClientMetric[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/api/crm/clients${query(params)}`, 'GET', undefined, token());
    return result;
  },
  profile: async (id: string) => data(await apiClient<{ data: Record<string, unknown> }>(`/api/crm/clients/${id}`, 'GET', undefined, token())),
  forecast: async (horizon: 7 | 30 | 90) => data(await apiClient<{ data: CrmForecast }>(`/api/crm/forecast${query({ horizon })}`, 'GET', undefined, token())),
  previewCampaign: async (body: { name: string; segment: CrmSegment; message: string; clientIds?: string[] }) => data(await apiClient<{ data: { eligibleCount: number; sample: Array<{ id: string; name: string }> } }>('/api/crm/campaigns/preview', 'POST', body, token())),
  createCampaign: async (body: { name: string; segment: CrmSegment; message: string; clientIds?: string[] }) => data(await apiClient<{ data: unknown }>('/api/crm/campaigns', 'POST', body, token())),
  backfill: async () => data(await apiClient<{ data: { linked: number; events: number } }>('/api/crm/backfill', 'POST', {}, token())),
};
