import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface FiscalConfig {
  id: string;
  barbershopId: string;
  cnpj: string;
  stateRegistration: string | null;
  municipalRegistration: string | null;
  serviceCode: string | null;
  activityCode: string | null;
  nfeEnabled: boolean;
  nfeEnvironment: string;
  digitalCertPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NfeRecord {
  id: string;
  barbershopId: string;
  configId: string;
  appointmentId: string | null;
  nfseNumber: string | null;
  nfseProtocol: string | null;
  status: string;
  recipientName: string;
  recipientDoc: string;
  serviceValue: number;
  taxValue: number;
  issuedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
}

export interface FiscalStats {
  totalIssued: number;
  totalTax: number;
  monthly: Record<string, { count: number; tax: number; total: number }>;
}

export const fiscalApi = {
  getConfig: (barbershopId: string) =>
    apiClient<{ success: boolean; data: FiscalConfig | null }>(
      `/api/barbershops/${barbershopId}/fiscal/config`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<FiscalConfig | null>(r)),

  updateConfig: (barbershopId: string, data: {
    cnpj: string;
    stateRegistration?: string | null;
    municipalRegistration?: string | null;
    serviceCode?: string | null;
    activityCode?: string | null;
    nfeEnabled: boolean;
    nfeEnvironment?: string;
    digitalCertPath?: string | null;
  }) =>
    apiClient<{ success: boolean; data: FiscalConfig }>(
      `/api/barbershops/${barbershopId}/fiscal/config`,
      'PUT',
      data,
      token()
    ).then(r => unwrap<FiscalConfig>(r)),

  issueNfe: (barbershopId: string, data: {
    recipientName: string;
    recipientDoc: string;
    serviceValue: number;
    taxValue?: number;
    appointmentId?: string | null;
  }) =>
    apiClient<{ success: boolean; data: NfeRecord }>(
      `/api/barbershops/${barbershopId}/fiscal/nfe`,
      'POST',
      data,
      token()
    ).then(r => unwrap<NfeRecord>(r)),

  listRecords: (barbershopId: string, params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return apiClient<{ success: boolean; data: NfeRecord[]; total: number }>(
      `/api/barbershops/${barbershopId}/fiscal/nfe${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    );
  },

  getRecord: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: NfeRecord }>(
      `/api/barbershops/${barbershopId}/fiscal/nfe/${id}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<NfeRecord>(r)),

  cancelNfe: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: NfeRecord }>(
      `/api/barbershops/${barbershopId}/fiscal/nfe/${id}/cancel`,
      'POST',
      undefined,
      token()
    ).then(r => unwrap<NfeRecord>(r)),

  getStats: (barbershopId: string, months = 6) =>
    apiClient<{ success: boolean; data: FiscalStats }>(
      `/api/barbershops/${barbershopId}/fiscal/stats?months=${months}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<FiscalStats>(r)),
};
