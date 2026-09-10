import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

export interface Integration {
  id: string;
  barbershopId: string;
  type: string;
  provider: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'RATE_LIMITED';
  config: Record<string, unknown>;
  credentials: Record<string, unknown>;
  lastSyncAt: string | null;
  syncError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationSyncLog {
  id: string;
  integrationId: string;
  direction: 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  recordsCount: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

export const integrationsApi = {
  list: (barbershopId: string) =>
    apiClient<{ success: boolean; data: Integration[] }>(
      `/api/barbershops/${barbershopId}/integrations`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<Integration[]>(res)),

  get: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: Integration }>(
      `/api/barbershops/${barbershopId}/integrations/${id}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<Integration>(res)),

  create: (barbershopId: string, data: {
    type: string;
    provider: string;
    config: Record<string, unknown>;
    credentials: Record<string, unknown>;
  }) =>
    apiClient<{ success: boolean; data: Integration }>(
      `/api/barbershops/${barbershopId}/integrations`,
      'POST',
      data,
      token()
    ).then(res => unwrap<Integration>(res)),

  update: (barbershopId: string, id: string, data: {
    config?: Record<string, unknown>;
    credentials?: Record<string, unknown>;
    status?: string;
  }) =>
    apiClient<{ success: boolean; data: Integration }>(
      `/api/barbershops/${barbershopId}/integrations/${id}`,
      'PATCH',
      data,
      token()
    ).then(res => unwrap<Integration>(res)),

  delete: (barbershopId: string, id: string) =>
    apiClient<void>(
      `/api/barbershops/${barbershopId}/integrations/${id}`,
      'DELETE',
      undefined,
      token()
    ),

  test: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: { success: boolean; type: string; provider: string; message: string } }>(
      `/api/barbershops/${barbershopId}/integrations/${id}/test`,
      'POST',
      {},
      token()
    ).then(res => unwrap<{ success: boolean; type: string; provider: string; message: string }>(res)),

  sync: (barbershopId: string, id: string, direction?: string) =>
    apiClient<{ success: boolean; data: { integrationId: string; syncLogId: string; direction: string; recordsCount: number; message: string } }>(
      `/api/barbershops/${barbershopId}/integrations/${id}/sync`,
      'POST',
      direction ? { direction } : {},
      token()
    ).then(res => unwrap<{ integrationId: string; syncLogId: string; direction: string; recordsCount: number; message: string }>(res)),

  getSyncLogs: (barbershopId: string, id: string, page = 1, limit = 20) =>
    apiClient<{ success: boolean; data: IntegrationSyncLog[]; meta: { total: number; page: number; limit: number } }>(
      `/api/barbershops/${barbershopId}/integrations/${id}/sync-logs?page=${page}&limit=${limit}`,
      'GET',
      undefined,
      token()
    ).then(res => ({
      data: unwrap<IntegrationSyncLog[]>(res),
      meta: (res as any).meta ?? { total: 0, page, limit },
    })),
};
