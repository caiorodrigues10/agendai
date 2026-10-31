import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';

function token() {
  return authStorage.getAccessToken() || '';
}

export interface EngagementFunnelStep {
  key: string;
  label: string;
  count: number;
  pct: number;
}

export interface EngagementFeature {
  key: string;
  label: string;
  shops: number;
  pct: number;
}

export interface EngagementChurnRisk {
  id: string;
  name: string;
  score: number;
  reasons: string[];
}

export interface EngagementSummary {
  generatedAt: string;
  funnel: EngagementFunnelStep[];
  features: EngagementFeature[];
  nps: {
    windowDays: number;
    responses: number;
    promoters: number;
    passives: number;
    detractors: number;
    score: number | null;
    /** Abaixo de 10 respostas na janela o agregado não é exibido como confiável. */
    insufficient: boolean;
  };
  support: {
    open: number;
    openOver24h: number;
    resolved30d: number;
    avgResolutionH: number | null;
    avgFirstResponseH: number | null;
  };
  churnRisk: EngagementChurnRisk[];
}

export type EngagementBillingFilter = 'all' | 'paying' | 'late' | 'trial' | 'withoutSubscription';

export interface EngagementBillingShop {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  subscriptionStatus: 'TRIALING' | 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | null;
  planName: string | null;
  billingCycle: string | null;
  endDate: string | null;
  paidInvoices: number;
  paidMonthsEquivalent: number;
  totalPaid: number;
  lastPaidAt: string | null;
  overdueAmount: number;
  nextDueAt: string | null;
}

export interface EngagementBilling {
  generatedAt: string;
  summary: {
    registered: number;
    paying: number;
    trial: number;
    late: number;
    pending: number;
    canceled: number;
    activeWithoutPaidInvoice: number;
    withoutSubscription: number;
    collected30d: number;
    overdueAmount: number;
  };
  monthly: { month: string; amount: number; invoices: number; shops: number }[];
  shops: EngagementBillingShop[];
  matching: number;
  nextCursor: string | null;
}

/** Engajamento do master: funil de ativação, NPS, SLA de suporte e churn. */
export const adminEngagementApi = {
  getEngagementSummary() {
    return apiClient<{ success: boolean; data: EngagementSummary }>(
      '/api/admin/engagement/summary',
      'GET',
      undefined,
      token(),
    );
  },
  getBilling(params: { search?: string; filter?: EngagementBillingFilter; cursor?: string } = {}) {
    return apiClient<{ success: boolean; data: EngagementBilling }>(
      `/api/admin/engagement/billing${buildQuery(params)}`,
      'GET',
      undefined,
      token(),
    );
  },
};
