import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  reason: string;
  impact: string;
  suggestedAction: string;
  priority: 'high' | 'medium' | 'low';
  metadata: Record<string, unknown>;
}

export const recommendationsApi = {
  getRecommendations: (barbershopId: string) =>
    apiClient<{
      success: boolean;
      data: Recommendation[] | { recommendations?: Recommendation[] };
    }>(
      `/api/barbershops/${barbershopId}/analytics/recommendations`,
      'GET',
      undefined,
      token()
    ).then(res => {
      const data = res?.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'recommendations' in data) {
        const recommendations = data.recommendations;
        return Array.isArray(recommendations) ? recommendations : [];
      }
      return [];
    }),

  dismiss: (barbershopId: string, recommendationId: string) =>
    apiClient(`/api/barbershops/${barbershopId}/analytics/recommendations/${recommendationId}/dismiss`, 'POST', undefined, token()),
};
