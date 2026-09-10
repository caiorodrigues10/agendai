import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface CorporatePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  maxUnits: number;
  features: string[];
  active: boolean;
  createdAt: string;
}

export interface CorporateSubscription {
  id: string;
  planId: string;
  planName: string;
  barbershopId: string;
  barbershopName: string;
  status: string;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

export const corporateApi = {
  listPlans: () =>
    apiClient<{ success: boolean; data: CorporatePlan[] }>(
      '/api/corporate/plans',
      'GET',
      undefined,
      token()
    ).then(r => unwrap<CorporatePlan[]>(r)),

  createPlan: (data: { name: string; description: string; price: number; maxUnits: number; features: string[] }) =>
    apiClient<{ success: boolean; data: CorporatePlan }>(
      '/api/corporate/plans',
      'POST',
      data,
      token()
    ).then(r => unwrap<CorporatePlan>(r)),

  updatePlan: (planId: string, data: Partial<CorporatePlan>) =>
    apiClient<{ success: boolean; data: CorporatePlan }>(
      `/api/corporate/plans/${planId}`,
      'PATCH',
      data,
      token()
    ).then(r => unwrap<CorporatePlan>(r)),

  deletePlan: (planId: string) =>
    apiClient<{ success: boolean }>(
      `/api/corporate/plans/${planId}`,
      'DELETE',
      undefined,
      token()
    ),

  subscribe: (data: { planId: string; barbershopId: string }) =>
    apiClient<{ success: boolean; data: CorporateSubscription }>(
      '/api/corporate/subscriptions',
      'POST',
      data,
      token()
    ).then(r => unwrap<CorporateSubscription>(r)),

  validate: (subscriptionId: string) =>
    apiClient<{ success: boolean; data: CorporateSubscription }>(
      `/api/corporate/subscriptions/${subscriptionId}/validate`,
      'POST',
      undefined,
      token()
    ).then(r => unwrap<CorporateSubscription>(r)),

  listSubscriptions: (params?: { barbershopId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.barbershopId) qs.set('barbershopId', params.barbershopId);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiClient<{ success: boolean; data: CorporateSubscription[] }>(
      `/api/corporate/subscriptions${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<CorporateSubscription[]>(r));
  },
};
