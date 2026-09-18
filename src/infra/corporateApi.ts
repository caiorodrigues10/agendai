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
  companyName: string;
  cnpj?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  maxUnits: number;
  pricePerUnit: number;
  billingCycle: string;
  status: string;
  startedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface CorporateSubscription {
  id: string;
  planId: string;
  barbershopId: string;
  status: string;
  startedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  plan?: { id: string; name: string; companyName?: string };
  barbershop?: { id: string; name: string };
}

export interface CorporateValidation {
  active: boolean;
  subscription: CorporateSubscription | null;
}

export const corporateApi = {
  listPlans: () =>
    apiClient<{ success: boolean; data: CorporatePlan[] }>(
      '/api/admin/corporate-plans',
      'GET',
      undefined,
      token()
    ).then(r => unwrap<CorporatePlan[]>(r)),

  createPlan: (data: {
    name: string;
    companyName: string;
    contactEmail: string;
    contactPhone?: string;
    cnpj?: string;
    maxUnits: number;
    pricePerUnit: number;
    billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  }) =>
    apiClient<{ success: boolean; data: CorporatePlan }>(
      '/api/admin/corporate-plans',
      'POST',
      data,
      token()
    ).then(r => unwrap<CorporatePlan>(r)),

  updatePlan: (planId: string, data: Partial<CorporatePlan>) =>
    apiClient<{ success: boolean; data: CorporatePlan }>(
      `/api/admin/corporate-plans/${planId}`,
      'PATCH',
      data,
      token()
    ).then(r => unwrap<CorporatePlan>(r)),

  deletePlan: (planId: string) =>
    apiClient<{ success: boolean }>(
      `/api/admin/corporate-plans/${planId}`,
      'DELETE',
      undefined,
      token()
    ),

  subscribe: (planId: string, barbershopId: string) =>
    apiClient<{ success: boolean; data: CorporateSubscription }>(
      `/api/admin/corporate-plans/${planId}/subscribe`,
      'POST',
      { barbershopId },
      token()
    ).then(r => unwrap<CorporateSubscription>(r)),

  listSubscriptions: (planId: string) =>
    apiClient<{ success: boolean; data: CorporateSubscription[] }>(
      `/api/admin/corporate-plans/${planId}/subscriptions`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<CorporateSubscription[]>(r)),

  validate: (barbershopId: string) =>
    apiClient<{ success: boolean; data: CorporateValidation }>(
      `/api/barbershops/${barbershopId}/corporate/validate`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<CorporateValidation>(r)),
};
