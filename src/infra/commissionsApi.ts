import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

export interface CommissionEntry {
  id: string;
  queueItemId: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  percentage: number;
  amount: number;
  createdAt: string;
}

export interface CommissionSummary {
  grossTotal: number;
  commissionTotal: number;
  byProfessional: {
    professionalId: string;
    professionalName: string;
    commissionTotal: number;
    entryCount: number;
  }[];
}

function unwrap<T>(response: unknown): T {
  return response && typeof response === 'object' && 'data' in response
    ? (response as { data: T }).data
    : response as T;
}

export const commissionsApi = {
  list: async (params: { from?: string; to?: string; professionalId?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    const token = authStorage.getAccessToken() || '';
    const response = await apiClient<{ success: boolean; data: CommissionEntry[] }>(`/api/commissions?${query}`, 'GET', undefined, token);
    return unwrap<CommissionEntry[]>(response);
  },
  summary: async (params: { from?: string; to?: string; professionalId?: string } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    const token = authStorage.getAccessToken() || '';
    const response = await apiClient<{ success: boolean; data: CommissionSummary }>(`/api/commissions/summary?${query}`, 'GET', undefined, token);
    return unwrap<CommissionSummary>(response);
  },
};
