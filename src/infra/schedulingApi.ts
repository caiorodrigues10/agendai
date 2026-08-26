import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { Appointment, QueueItem } from '../types';
import { AvailabilitySlot } from '../utils/schedulingUtils';

function unwrap<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) return res.data as T;
  return res as T;
}

export interface ListAppointmentsParams {
  barbershopId?: string;
  date?: string;
  staffId?: string;
  from?: string;
  to?: string;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export const schedulingApi = {
  listQueue: async (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    // Token opcional: staff autenticado recebe a fila completa (com whatsapp);
    // visitante recebe a visão pública mascarada.
    const token = authStorage.getAccessToken() || undefined;
    const res = await apiClient<any>(`/api/queue${qs}`, 'GET', undefined, token);
    const data = unwrap<any[]>(res);
    return Array.isArray(data) ? data : [];
  },
  joinQueue: async (payload: any) => {
    const res = await apiClient<any>('/api/queue', 'POST', payload);
    return unwrap<QueueItem>(res);
  },
  updateQueueItem: async (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    const res = await apiClient<any>(`/api/queue/${id}`, 'PATCH', payload, token);
    return unwrap<QueueItem>(res);
  },
  deleteQueueItem: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/queue/${id}`, 'DELETE', undefined, token);
  },
  getQueueMetrics: async (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    const res = await apiClient<any>(`/api/queue/metrics${qs}`);
    return unwrap<{ completedCount: number }>(res);
  },
  listAppointments: (params: ListAppointmentsParams = {}) => {
    const token = authStorage.getAccessToken() || '';
    if (!token) return Promise.resolve([]);
    return apiClient<any>(`/api/appointments${buildQuery(params as Record<string, string | undefined>)}`, 'GET', undefined, token).then(res => unwrap<Appointment[]>(res));
  },
  getAvailability: (barbershopId: string, date: string, staffId?: string) => {
    const qs = buildQuery({ barbershopId, date, staffId });
    return apiClient<AvailabilitySlot[]>(`/api/appointments/availability${qs}`).then(res => unwrap<AvailabilitySlot[]>(res));
  },
  bookAppointment: async (payload: any) => {
    // Backend exige staff autenticado para criar agendamento
    const token = authStorage.getAccessToken() || undefined;
    const res = await apiClient<any>('/api/appointments', 'POST', payload, token);
    return unwrap<Appointment>(res);
  },
  updateAppointment: async (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    const res = await apiClient<any>(`/api/appointments/${id}`, 'PATCH', payload, token);
    return unwrap<Appointment>(res);
  },
  deleteAppointment: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/appointments/${id}`, 'DELETE', undefined, token);
  }
};
