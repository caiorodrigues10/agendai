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
    apiClient(`/api/barbershops/${barbershopId}/analytics/recommendations`, 'GET', undefined, token()),

  dismiss: (barbershopId: string, recommendationId: string) =>
    apiClient(`/api/barbershops/${barbershopId}/analytics/recommendations/${recommendationId}/dismiss`, 'POST', undefined, token()),
};
