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
  config?: Record<string, unknown>;
  discountType: string;
  discountValue: number;
  discountPercent?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  startAt?: string | null;
  endAt?: string | null;
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

const RULE_TYPE_TO_BACKEND: Record<string, string> = {
  TIME_BASED: 'peak_hours',
  HAPPY_HOUR: 'happy_hour',
  LOYALTY: 'loyalty_discount',
  PROMOTIONAL: 'custom',
  VOLUME: 'custom',
  peak_hours: 'peak_hours',
  happy_hour: 'happy_hour',
  loyalty_discount: 'loyalty_discount',
  first_visit: 'first_visit',
  weather_based: 'weather_based',
  day_of_week: 'day_of_week',
  seasonal: 'seasonal',
  custom: 'custom',
};

function toIso(value?: string) {
  if (!value) return undefined;
  if (value.includes('T')) return value;
  return `${value}T00:00:00.000Z`;
}

function rulePayload(data: {
  name: string;
  type: string;
  priority?: number;
  conditions?: PricingCondition[];
  discountType?: string;
  discountValue?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
}) {
  const discountPercent =
    data.discountType === 'FIXED' ? 0 : (data.discountValue ?? 0);
  return {
    name: data.name,
    type: RULE_TYPE_TO_BACKEND[data.type] ?? 'custom',
    priority: data.priority ?? 0,
    config: { conditions: data.conditions ?? [] },
    discountPercent,
    startAt: toIso(data.validFrom) ?? null,
    endAt: toIso(data.validUntil) ?? null,
  };
}

function normalizeRule(rule: PricingRule): PricingRule {
  const config = rule.config ?? {};
  const conditions = Array.isArray(rule.conditions)
    ? rule.conditions
    : Array.isArray((config as { conditions?: PricingCondition[] }).conditions)
      ? (config as { conditions: PricingCondition[] }).conditions
      : [];
  return {
    ...rule,
    conditions,
    discountType: rule.discountType || 'PERCENTAGE',
    discountValue: rule.discountValue ?? rule.discountPercent ?? 0,
    validFrom: rule.validFrom ?? rule.startAt ?? undefined,
    validUntil: rule.validUntil ?? rule.endAt ?? undefined,
  };
}

export const pricingApi = {
  list: (barbershopId: string) =>
    apiClient<{ data: PricingRule[] }>(
      `/api/barbershops/${barbershopId}/pricing-rules`,
      'GET', undefined, token()
    ).then(r => unwrap<PricingRule[]>(r).map(normalizeRule)),

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
      'POST', rulePayload(data), token()
    ).then(r => normalizeRule(unwrap<PricingRule>(r))),

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
      'PATCH', rulePayload({
        name: data.name ?? '',
        type: data.type ?? 'custom',
        priority: data.priority,
        conditions: data.conditions,
        discountType: data.discountType,
        discountValue: data.discountValue,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
      }), token()
    ).then(r => normalizeRule(unwrap<PricingRule>(r))),

  toggle: (barbershopId: string, ruleId: string) =>
    apiClient<{ data: PricingRule }>(
      `/api/barbershops/${barbershopId}/pricing-rules/${ruleId}/toggle`,
      'POST', undefined, token()
    ).then(r => normalizeRule(unwrap<PricingRule>(r))),

  remove: (barbershopId: string, ruleId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/pricing-rules/${ruleId}`,
      'DELETE', undefined, token()
    ),

  evaluate: (barbershopId: string, data: {
    serviceId: string;
    basePrice: number;
    clientId?: string;
    scheduledAt?: string;
  }) =>
    apiClient<{ data: PriceEvaluation }>(
      `/api/barbershops/${barbershopId}/evaluate-price`,
      'POST', data, token()
    ).then(r => unwrap<PriceEvaluation>(r)),
};
