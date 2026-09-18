import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface Review {
  id?: string;
  barbershopId?: string;
  clientId?: string;
  clientName?: string;
  rating: number;
  comment?: string | null;
  sentiment?: string;
  createdAt: string;
  response?: ReviewResponse | string | null;
  staff?: { name: string } | null;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  content?: string;
  message?: string;
  createdAt: string;
}

export interface ReputationStats {
  barbershopId: string;
  avgRating: number;
  totalReviews: number;
  npsScore: number | null;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentNegative: number;
  computedAt?: string | null;
}

export const reputationApi = {
  getStats: (barbershopId: string) =>
    apiClient<{ success: boolean; data: ReputationStats }>(
      `/api/barbershops/${barbershopId}/reputation`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<ReputationStats>(r)),

  compute: (barbershopId: string) =>
    apiClient<{ success: boolean; data: ReputationStats }>(
      `/api/barbershops/${barbershopId}/reputation/compute`,
      'POST',
      undefined,
      token()
    ).then(r => unwrap<ReputationStats>(r)),

  listReviews: (barbershopId: string, params?: { staffId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.staffId) qs.set('staffId', params.staffId);
    const query = qs.toString();
    return apiClient<{ success: boolean; data: { reviews?: Review[] } | Review[] }>(
      `/api/barbershops/${barbershopId}/reviews${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => {
      const data = unwrap<{ reviews?: Review[] } | Review[]>(r);
      return Array.isArray(data) ? data : (data.reviews ?? []);
    });
  },

  respondToReview: (barbershopId: string, reviewId: string, content: string) =>
    apiClient<{ success: boolean; data: ReviewResponse }>(
      `/api/barbershops/${barbershopId}/reviews/${reviewId}/respond`,
      'POST',
      { content },
      token()
    ).then(r => unwrap<ReviewResponse>(r)),

  getResponse: (barbershopId: string, reviewId: string) =>
    apiClient<{ success: boolean; data: ReviewResponse | null }>(
      `/api/barbershops/${barbershopId}/reviews/${reviewId}/response`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<ReviewResponse | null>(r)),
};
