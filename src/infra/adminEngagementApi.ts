import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

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
};
