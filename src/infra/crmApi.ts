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
export interface CrmClientMetric { clientId: string; name: string; whatsapp: string; ltv: number; grossRevenue: number; receivedRevenue: number; outstanding: number; visits: number; avgTicket: number; lastVisitAt: string | null; nextExpectedVisitAt?: string | null; daysSinceLastVisit: number | null; risk: 'low' | 'medium' | 'high'; segment: CrmSegment; favoriteService: string | null; activePackageSessions: number; marketingOptIn: boolean }
export interface CrmRevenueGroup { id: string; name: string; revenue: number; visits: number }
export interface CrmOverview { from: string; to: string; compare: { grossRevenue: number; receivedRevenue: number; customers: number } | null; kpis: Record<string, number | null>; byDay: { date: string; grossRevenue: number; receivedRevenue: number; visits: number }[]; byService: CrmRevenueGroup[]; byCategory: CrmRevenueGroup[]; byProfessional: CrmRevenueGroup[]; topClients: CrmClientMetric[]; segments: { segment: CrmSegment; label: string; count: number; potential: number }[] }
export interface CrmForecast { horizon: number; maturity: 'insufficient' | 'preliminary' | 'trained'; historicalDays: number; backtest: { mae: number | null; mape: number | null }; predictions: { date: string; predictedVisits: number; predictedRevenue: number; confidenceLow: number; confidenceHigh: number; weather: string | null; risk: 'low' | 'medium' | 'high'; factors: string[] }[] }
export interface CrmCampaign { id: string; name: string; segment: string; message: string; status: 'DRAFT' | 'QUEUED' | 'SENT' | 'PARTIAL' | 'FAILED' | 'CANCELED'; recipientCount: number; sentCount: number; failedCount: number; skippedCount: number; createdAt: string; confirmedAt: string | null; recipients?: { id: string; status: string; error?: string | null; client?: { id: string; name: string; whatsapp: string } }[] }

export interface CrmClientProfile extends CrmClientMetric {
  client?: { id: string; name: string; whatsapp: string; notes?: string | null; marketingOptIn?: boolean };
  timeline?: { id: string; kind: string; grossAmount: number; receivedAmount: number; outstandingDelta: number; occurredAt: string }[];
  appointments?: { id: string; date: string; time: string; status: string; serviceName?: string | null }[];
  fiados?: { id: string; amount: number; outstanding: number; status: string; createdAt: string }[];
  packages?: {
    id: string;
    packageId: string;
    packageName: string | null;
    serviceId: string;
    serviceName: string | null;
    totalSessions: number;
    remainingSessions: number;
    status: string;
    purchasedAt: string;
    expiresAt: string | null;
    pricePaid: number;
    paymentMethod: string;
  }[];
}

export const crmApi = {
  overview: async (params: { from?: string; to?: string; compare?: boolean } = {}) => data(await apiClient<{ data: CrmOverview }>(`/api/crm/overview${query(params)}`, 'GET', undefined, token())),
  clients: async (params: { page?: number; limit?: number; search?: string; segment?: CrmSegment; sort?: 'ltv' | 'lastVisit' | 'outstanding'; from?: string; to?: string } = {}) => {
    const result = await apiClient<{ data: CrmClientMetric[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/api/crm/clients${query(params)}`, 'GET', undefined, token());
    return result;
  },
  profile: async (id: string, params: { from?: string; to?: string } = {}) =>
    data(await apiClient<{ data: CrmClientProfile }>(`/api/crm/clients/${id}${query(params)}`, 'GET', undefined, token())),
  forecast: async (horizon: 7 | 30 | 90) => data(await apiClient<{ data: CrmForecast }>(`/api/crm/forecast${query({ horizon })}`, 'GET', undefined, token())),
  previewCampaign: async (body: { name: string; segment: CrmSegment; message: string; clientIds?: string[] }) => data(await apiClient<{ data: { eligibleCount: number; sample: { id: string; name: string }[] } }>('/api/crm/campaigns/preview', 'POST', body, token())),
  createCampaign: async (body: { name: string; segment: CrmSegment; message: string; clientIds?: string[] }) => data(await apiClient<{ data: unknown }>('/api/crm/campaigns', 'POST', body, token())),
  campaigns: async (params: { page?: number; limit?: number; status?: CrmCampaign['status']; from?: string; to?: string } = {}) => apiClient<{ data: CrmCampaign[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/api/crm/campaigns${query(params)}`, 'GET', undefined, token()),
  campaign: async (id: string) => data(await apiClient<{ data: CrmCampaign }>(`/api/crm/campaigns/${id}`, 'GET', undefined, token())),
  backfill: async () => data(await apiClient<{ data: { linked: number; events: number } }>('/api/crm/backfill', 'POST', {}, token())),
};
