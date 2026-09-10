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
  id: string;
  barbershopId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment?: string;
  sentiment?: string;
  createdAt: string;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  message: string;
  createdAt: string;
}

export interface ReputationStats {
  barbershopId: string;
  averageRating: number;
  totalReviews: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  ratingDistribution: Record<number, number>;
}

export const reputationApi = {
  getStats: (barbershopId: string) =>
    apiClient<{ success: boolean; data: ReputationStats }>(
      `/api/barbershops/${barbershopId}/reputation/stats`,
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

  listReviews: (barbershopId: string, params?: { sentiment?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.sentiment) qs.set('sentiment', params.sentiment);
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString();
    return apiClient<{ success: boolean; data: Review[] }>(
      `/api/barbershops/${barbershopId}/reputation/reviews${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<Review[]>(r));
  },

  respondToReview: (reviewId: string, message: string) =>
    apiClient<{ success: boolean; data: ReviewResponse }>(
      `/api/reputation/reviews/${reviewId}/respond`,
      'POST',
      { message },
      token()
    ).then(r => unwrap<ReviewResponse>(r)),

  getResponse: (reviewId: string) =>
    apiClient<{ success: boolean; data: ReviewResponse | null }>(
      `/api/reputation/reviews/${reviewId}/response`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<ReviewResponse | null>(r)),
};
