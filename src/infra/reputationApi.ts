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

export interface PublicReviewContext {
  id: string;
  expiresAt: string;
  alreadySubmitted: boolean;
  barbershop: {
    id: string;
    name: string;
    logoUrl?: string | null;
    googleReviewUrl?: string | null;
  };
  serviceName: string;
  staffName?: string | null;
  customerName?: string | null;
}

export interface PublicReviewSummary {
  average: number | null;
  count: number;
  threshold: number;
  showAverage: boolean;
  reviews: Review[];
}

export const reputationApi = {
  getPublicReviewContext: (reviewToken: string) =>
    apiClient<{ success: boolean; data: PublicReviewContext }>(
      `/api/reviews/public/context?token=${encodeURIComponent(reviewToken)}`
    ).then(r => unwrap<PublicReviewContext>(r)),

  submitPublicReview: (reviewToken: string, rating: number, comment?: string) =>
    apiClient<{ success: boolean; data: Review }>(
      '/api/appointments/public/review',
      'POST',
      { token: reviewToken, rating, comment: comment?.trim() || undefined }
    ).then(r => unwrap<Review>(r)),

  getPublicSummary: (barbershopId: string) =>
    apiClient<{ success: boolean; data: PublicReviewSummary }>(
      `/api/barbershops/${barbershopId}/reviews?limit=6`
    ).then(r => unwrap<PublicReviewSummary>(r)),

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
