import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface PricingRule {
  id: string;
  barbershopId: string;
  name: string;
  type: string;
  priority: number;
  isActive: boolean;
  conditions: PricingCondition[];
  discountType: string;
  discountValue: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingCondition {
  field: string;
  operator: string;
  value: string;
}

export interface PriceEvaluation {
  basePrice: number;
  finalPrice: number;
  appliedRules: { ruleId: string; ruleName: string; discount: number }[];
}

export const pricingApi = {
  list: (barbershopId: string) =>
    apiClient<{ data: PricingRule[] }>(
      `/api/barbershops/${barbershopId}/pricing-rules`,
      'GET', undefined, token()
    ).then(r => unwrap<PricingRule[]>(r)),

  getById: (barbershopId: string, ruleId: string) =>
    apiClient<{ data: PricingRule }>(
      `/api/barbershops/${barbershopId}/pricing-rules/${ruleId}`,
      'GET', undefined, token()
    ).then(r => unwrap<PricingRule>(r)),

  create: (barbershopId: string, data: {
    name: string;
    type: string;
    priority?: number;
    conditions: PricingCondition[];
    discountType: string;
    discountValue: number;
    maxDiscount?: number;
    validFrom?: string;
    validUntil?: string;
  }) =>
    apiClient<{ data: PricingRule }>(
      `/api/barbershops/${barbershopId}/pricing-rules`,
      'POST', data, token()
    ).then(r => unwrap<PricingRule>(r)),

  update: (barbershopId: string, ruleId: string, data: Partial<{
    name: string;
    type: string;
    priority: number;
    conditions: PricingCondition[];
    discountType: string;
    discountValue: number;
    maxDiscount: number;
    validFrom: string;
    validUntil: string;
  }>) =>
    apiClient<{ data: PricingRule }>(
      `/api/barbershops/${barbershopId}/pricing-rules/${ruleId}`,
      'PATCH', data, token()
    ).then(r => unwrap<PricingRule>(r)),

  toggle: (barbershopId: string, ruleId: string) =>
    apiClient<{ data: PricingRule }>(
      `/api/barbershops/${barbershopId}/pricing-rules/${ruleId}/toggle`,
      'POST', undefined, token()
    ).then(r => unwrap<PricingRule>(r)),

  remove: (barbershopId: string, ruleId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/pricing-rules/${ruleId}`,
      'DELETE', undefined, token()
    ),

  evaluate: (barbershopId: string, data: {
    serviceId: string;
    staffId?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    clientPhone?: string;
  }) =>
    apiClient<{ data: PriceEvaluation }>(
      `/api/barbershops/${barbershopId}/pricing-rules/evaluate`,
      'POST', data, token()
    ).then(r => unwrap<PriceEvaluation>(r)),
};
