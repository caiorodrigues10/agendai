import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface QualityProtocol {
  id: string;
  barbershopId: string;
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityAudit {
  id: string;
  barbershopId: string;
  protocolId: string;
  protocolTitle: string;
  auditorId: string;
  auditorName: string;
  score: number;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface QualityOverview {
  barbershopId: string;
  averageScore: number;
  totalAudits: number;
  protocolsActive: number;
  recentTrend: 'UP' | 'DOWN' | 'STABLE';
  breakdownByCategory: { category: string; avgScore: number }[];
}

export const qualityApi = {
  listProtocols: (barbershopId: string) =>
    apiClient<{ success: boolean; data: QualityProtocol[] }>(
      `/api/barbershops/${barbershopId}/quality/protocols`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<QualityProtocol[]>(r)),

  createProtocol: (barbershopId: string, data: { title: string; description: string; category: string }) =>
    apiClient<{ success: boolean; data: QualityProtocol }>(
      `/api/barbershops/${barbershopId}/quality/protocols`,
      'POST',
      data,
      token()
    ).then(r => unwrap<QualityProtocol>(r)),

  updateProtocol: (barbershopId: string, protocolId: string, data: Partial<QualityProtocol>) =>
    apiClient<{ success: boolean; data: QualityProtocol }>(
      `/api/barbershops/${barbershopId}/quality/protocols/${protocolId}`,
      'PATCH',
      data,
      token()
    ).then(r => unwrap<QualityProtocol>(r)),

  deleteProtocol: (barbershopId: string, protocolId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/quality/protocols/${protocolId}`,
      'DELETE',
      undefined,
      token()
    ),

  runAudit: (barbershopId: string, data: { protocolId: string; score: number; notes?: string }) =>
    apiClient<{ success: boolean; data: QualityAudit }>(
      `/api/barbershops/${barbershopId}/quality/audits`,
      'POST',
      data,
      token()
    ).then(r => unwrap<QualityAudit>(r)),

  listAudits: (barbershopId: string, params?: { protocolId?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.protocolId) qs.set('protocolId', params.protocolId);
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString();
    return apiClient<{ success: boolean; data: QualityAudit[] }>(
      `/api/barbershops/${barbershopId}/quality/audits${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<QualityAudit[]>(r));
  },

  getOverview: (barbershopId: string) =>
    apiClient<{ success: boolean; data: QualityOverview }>(
      `/api/barbershops/${barbershopId}/quality/overview`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<QualityOverview>(r)),
};
