import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface ClientIdentity {
  id: string;
  name: string;
  phone: string;
  phoneVerified: boolean;
}

export interface ClientSalonLink {
  id: string;
  barbershopId: string;
  barbershopName?: string;
  status: string;
  salonClientName?: string;
  marketingOptIn: boolean;
}

export interface ClientAppointment {
  id: string;
  barbershopName: string;
  serviceName: string;
  staffName?: string;
  date: string;
  time: string;
  status: string;
  price: number;
}

export interface ClientBenefit {
  type: string;
  description: string;
  available: number;
  used: number;
  validUntil?: string;
}

export const clientPortalApi = {
  requestCode: (phone: string) =>
    apiClient<{ success: boolean; data?: unknown }>('/api/client-portal/auth/request-code', 'POST', { phone }),

  verifyCode: (phone: string, code: string) =>
    apiClient<{ success: boolean; data?: unknown }>('/api/client-portal/auth/verify-code', 'POST', { phone, code }),

  logout: () =>
    apiClient<{ success: boolean }>('/api/client-portal/auth/logout', 'POST', undefined, token()),

  logoutAll: () =>
    apiClient<{ success: boolean }>('/api/client-portal/auth/logout-all', 'POST', undefined, token()),

  getMe: () =>
    apiClient<{ data: ClientIdentity }>('/api/client-portal/me', 'GET', undefined, token()).then(r => unwrap<ClientIdentity>(r)),

  getSalons: () =>
    apiClient<{ data: ClientSalonLink[] }>('/api/client-portal/salons', 'GET', undefined, token()).then(r => unwrap<ClientSalonLink[]>(r)),

  requestLink: (barbershopId: string) =>
    apiClient<{ success: boolean; data?: unknown }>('/api/client-portal/salon-links', 'POST', { barbershopId }, token()),

  unlinkSalon: (linkId: string) =>
    apiClient<{ success: boolean }>(`/api/client-portal/salon-links/${linkId}`, 'DELETE', undefined, token()),

  getAppointments: (barbershopId: string, params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString();
    return apiClient<{ data: ClientAppointment[] }>(
      `/api/client-portal/salons/${barbershopId}/appointments${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<ClientAppointment[]>(r));
  },

  getHistory: (barbershopId: string, params?: { page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString();
    return apiClient<{ data: unknown }>(
      `/api/client-portal/salons/${barbershopId}/history${query ? '?' + query : ''}`,
      'GET', undefined, token()
    );
  },

  getBenefits: (barbershopId: string) =>
    apiClient<{ data: ClientBenefit[] }>(
      `/api/client-portal/salons/${barbershopId}/benefits`,
      'GET', undefined, token()
    ).then(r => unwrap<ClientBenefit[]>(r)),

  getCareInstructions: () =>
    apiClient<{ data: unknown }>('/api/client-portal/care-instructions', 'GET', undefined, token()),
};
