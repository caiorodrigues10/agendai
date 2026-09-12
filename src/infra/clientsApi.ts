import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { SalonClient } from '../types';
import { buildQuery } from '../utils/query';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProcedureRecord {
  id: string;
  barbershopId: string;
  clientId: string;
  professionalName: string;
  title: string;
  formula: string | null;
  details: string | null;
  serviceName: string | null;
  queueItemId: string | null;
  appointmentId: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
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

  update: async (id: string, body: { name?: string; whatsapp?: string; notes?: string | null }) => {
    const res = await apiClient<{ success: boolean; data: SalonClient }>(
      `/api/clients/${id}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<SalonClient>(res);
  },

  delete: async (id: string) => {
    await apiClient<void>(`/api/clients/${id}`, 'DELETE', undefined, token());
  },

  // Procedure records
  listProcedures: async (clientId: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    const res = await apiClient<{ success: boolean; data: ProcedureRecord[] }>(
      `/api/clients/${clientId}/procedures${query}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<ProcedureRecord[]>(res);
  },

  getLatestProcedure: async (clientId: string) => {
    const res = await apiClient<{ success: boolean; data: ProcedureRecord | null }>(
      `/api/clients/${clientId}/procedures/latest`,
      'GET',
      undefined,
      token()
    );
    return unwrap<ProcedureRecord | null>(res);
  },

  createProcedure: async (clientId: string, body: {
    professionalName: string;
    title: string;
    formula?: string;
    details?: string;
    serviceName?: string;
    queueItemId?: string;
    appointmentId?: string;
    occurredAt?: string;
  }) => {
    const res = await apiClient<{ success: boolean; data: ProcedureRecord }>(
      `/api/clients/${clientId}/procedures`,
      'POST',
      body,
      token()
    );
    return unwrap<ProcedureRecord>(res);
  },

  updateProcedure: async (clientId: string, recordId: string, body: {
    professionalName?: string;
    title?: string;
    formula?: string | null;
    details?: string | null;
    serviceName?: string | null;
  }) => {
    const res = await apiClient<{ success: boolean; data: ProcedureRecord }>(
      `/api/clients/${clientId}/procedures/${recordId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<ProcedureRecord>(res);
  },

  deleteProcedure: async (clientId: string, recordId: string) => {
    await apiClient<void>(
      `/api/clients/${clientId}/procedures/${recordId}`,
      'DELETE',
      undefined,
      token()
    );
  },
};
