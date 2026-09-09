import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface ShowcaseEntry {
  id: string;
  postId: string;
  title: string;
  description?: string;
  altText?: string;
  mode: string;
  serviceName?: string;
  staffName?: string;
  servicePrice?: number;
  serviceDuration?: number;
  mediaUrl: string;
  mediaType: string;
  status: string;
  position: number;
}

export const showcaseApi = {
  // Public
  getPublicShowcase: (barbershopId: string, params?: { serviceId?: string; staffId?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.serviceId) qs.set('serviceId', params.serviceId);
    if (params?.staffId) qs.set('staffId', params.staffId);
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString();
    return apiClient<{ data: ShowcaseEntry[] }>(
      `/api/public/barbershops/${barbershopId}/showcase${query ? '?' + query : ''}`,
      'GET'
    ).then(r => unwrap<ShowcaseEntry[]>(r));
  },

  getPublicEntry: (barbershopId: string, entryId: string) =>
    apiClient<{ data: ShowcaseEntry }>(
      `/api/public/barbershops/${barbershopId}/showcase/${entryId}`,
      'GET'
    ).then(r => unwrap<ShowcaseEntry>(r)),

  trackEvent: (entryId: string, eventType: string) =>
    apiClient<{ success: boolean }>('/api/public/showcase/events', 'POST', { entryId, eventType }),

  // Staff management
  listEntries: (barbershopId: string, params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiClient<{ data: ShowcaseEntry[] }>(
      `/api/barbershops/${barbershopId}/showcase${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<ShowcaseEntry[]>(r));
  },

  createEntry: (barbershopId: string, data: { postId: string; title: string; description?: string; mode: string; serviceId?: string; staffId?: string }) =>
    apiClient<{ data: ShowcaseEntry }>(
      `/api/barbershops/${barbershopId}/showcase`,
      'POST', data, token()
    ).then(r => unwrap<ShowcaseEntry>(r)),

  updateEntry: (barbershopId: string, entryId: string, data: Partial<ShowcaseEntry>) =>
    apiClient<{ data: ShowcaseEntry }>(
      `/api/barbershops/${barbershopId}/showcase/${entryId}`,
      'PATCH', data, token()
    ).then(r => unwrap<ShowcaseEntry>(r)),

  reorder: (barbershopId: string, order: { id: string; position: number }[]) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/showcase/order`,
      'PUT', { order }, token()
    ),

  getAnalytics: (barbershopId: string, params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const query = qs.toString();
    return apiClient<{ data: unknown }>(
      `/api/barbershops/${barbershopId}/showcase/analytics${query ? '?' + query : ''}`,
      'GET', undefined, token()
    );
  },
};
