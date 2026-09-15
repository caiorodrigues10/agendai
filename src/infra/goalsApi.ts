import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface ProfessionalGoal {
  id: string;
  professionalId: string;
  professionalName?: string;
  barbershopId: string;
  metric: 'REVENUE' | 'APPOINTMENTS' | 'PRODUCTS_SOLD';
  target: number;
  current: number;
  percentage: number;
  period: string;
  startDate: string;
  endDate: string;
}

export const goalsApi = {
  list: (barbershopId: string, params?: { professionalId?: string; period?: string }) =>
    apiClient<{ success: boolean; data: ProfessionalGoal[] }>(
      `/api/barbershops/${barbershopId}/goals${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ProfessionalGoal[]>(res)),

  create: (barbershopId: string, data: {
    professionalId: string;
    metric: 'REVENUE' | 'APPOINTMENTS' | 'PRODUCTS_SOLD';
    target: number;
    startDate: string;
    endDate: string;
  }) =>
    apiClient<{ success: boolean; data: ProfessionalGoal }>(
      `/api/barbershops/${barbershopId}/goals`,
      'POST',
      data,
      token()
    ).then(res => unwrap<ProfessionalGoal>(res)),

  update: (barbershopId: string, goalId: string, data: { target?: number; endDate?: string }) =>
    apiClient<{ success: boolean; data: ProfessionalGoal }>(
      `/api/barbershops/${barbershopId}/goals/${goalId}`,
      'PATCH',
      data,
      token()
    ).then(res => unwrap<ProfessionalGoal>(res)),

  getProgress: (barbershopId: string, params?: { from?: string; to?: string }) =>
    apiClient<{ success: boolean; data: ProfessionalGoal[] }>(
      `/api/barbershops/${barbershopId}/goals/progress${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ProfessionalGoal[]>(res)),

  getRanking: (barbershopId: string, params?: {
    metric?: 'REVENUE' | 'APPOINTMENTS' | 'PRODUCTS_SOLD';
    startDate?: string;
    endDate?: string;
    from?: string;
    to?: string;
  }) =>
    apiClient<{ success: boolean; data: ProfessionalGoal[] }>(
      `/api/barbershops/${barbershopId}/goals/ranking${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ProfessionalGoal[]>(res)),
};
