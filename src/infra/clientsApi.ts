import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { SalonClient } from '../types';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

function buildQuery(params?: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  if (!params) return '';
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const clientsApi = {
  list: async (params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient<{ success: boolean; data: SalonClient[]; meta: ListMeta }>(
      `/api/clients${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return {
      data: unwrap<SalonClient[]>(res),
      meta: (res as { meta?: ListMeta }).meta ?? {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };
  },

  get: async (id: string) => {
    const res = await apiClient<{ success: boolean; data: SalonClient }>(
      `/api/clients/${id}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<SalonClient>(res);
  },

  create: async (body: { name: string; whatsapp: string; notes?: string | null }) => {
    const res = await apiClient<{ success: boolean; data: SalonClient }>(
      '/api/clients',
      'POST',
      body,
      token()
    );
    return unwrap<SalonClient>(res);
  },

  update: async (
    id: string,
    body: { name?: string; whatsapp?: string; notes?: string | null }
  ) => {
    const res = await apiClient<{ success: boolean; data: SalonClient }>(
      `/api/clients/${id}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<SalonClient>(res);
  },
};
