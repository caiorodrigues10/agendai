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
  name: string;
  description?: string | null;
  category?: string | null;
  checklistItems?: { title: string; description?: string | null; required?: boolean }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QualityAudit {
  id: string;
  protocolId: string;
  barbershopId: string;
  score: number | null;
  notes?: string | null;
  auditedAt?: string;
  protocol?: { id: string; name: string; category?: string | null };
  auditedBy?: { id: string; name: string } | null;
}

export interface QualityOverview {
  totalProtocols: number;
  activeProtocols: number;
  totalAudits: number;
  averageScore: number | null;
  recentAudits: { score: number | null; auditedAt: string; protocolId: string }[];
}

export const qualityApi = {
  listProtocols: (barbershopId: string) =>
    apiClient<{ success: boolean; data: QualityProtocol[] }>(
      `/api/barbershops/${barbershopId}/protocols`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<QualityProtocol[]>(r)),

  createProtocol: (barbershopId: string, data: { name: string; description?: string; category?: string }) =>
    apiClient<{ success: boolean; data: QualityProtocol }>(
      `/api/barbershops/${barbershopId}/protocols`,
      'POST',
      { barbershopId, ...data },
      token()
    ).then(r => unwrap<QualityProtocol>(r)),

  updateProtocol: (barbershopId: string, protocolId: string, data: Partial<QualityProtocol>) =>
    apiClient<{ success: boolean; data: QualityProtocol }>(
      `/api/barbershops/${barbershopId}/protocols/${protocolId}`,
      'PATCH',
      data,
      token()
    ).then(r => unwrap<QualityProtocol>(r)),

  deleteProtocol: (barbershopId: string, protocolId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/protocols/${protocolId}`,
      'DELETE',
      undefined,
      token()
    ),

  runAudit: (barbershopId: string, protocolId: string, data: {
    results: { checklistIndex: number; passed: boolean; note?: string }[];
    notes?: string;
  }) =>
    apiClient<{ success: boolean; data: QualityAudit }>(
      `/api/barbershops/${barbershopId}/protocols/${protocolId}/audits`,
      'POST',
      { protocolId, barbershopId, ...data },
      token()
    ).then(r => unwrap<QualityAudit>(r)),

  listAudits: (barbershopId: string, protocolId: string) =>
    apiClient<{ success: boolean; data: QualityAudit[] }>(
      `/api/barbershops/${barbershopId}/protocols/${protocolId}/audits`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<QualityAudit[]>(r)),

  getOverview: (barbershopId: string) =>
    apiClient<{ success: boolean; data: QualityOverview }>(
      `/api/barbershops/${barbershopId}/quality/overview`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<QualityOverview>(r)),
};
