import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { QueueItem } from '../types';
import { AvailabilitySlot } from '../utils/schedulingUtils';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

export interface ListAppointmentsParams {
  barbershopId?: string;
  date?: string;
  staffId?: string;
  from?: string;
  to?: string;
}

interface JoinQueuePayload {
  customerName: string;
  whatsapp: string;
  serviceId: string;
  barbershopId: string;
  sessionId?: string;
  responsibleSessionId?: string;
}

export interface QueueUpdatePayload {
  status: QueueItem['status'];
  finalPrice?: number;
  completedBy?: string;
  paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'fiado';
  insertAt?: number;
  commissionSplits?: { professionalId: string; percentage: number }[];
}

function buildQuery(params: Record<string, string | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export const schedulingApi = {
  listQueue: async (barbershopId?: string, sessionId?: string) => {
    const qs = buildQuery({ barbershopId, sessionId });
    // Token opcional: staff autenticado recebe a fila completa (com whatsapp);
    // visitante recebe a visão pública mascarada (customerId só da própria sessão).
    const token = authStorage.getAccessToken() || undefined;
    const res = await apiClient<{ success: boolean; data: QueueItem[] }>(
      `/api/queue${qs}`,
      'GET',
      undefined,
      token
    );
    const data = unwrap<QueueItem[]>(res);
    return Array.isArray(data) ? data : [];
  },
  joinQueue: async (payload: JoinQueuePayload) => {
    // No painel, o token permite ao backend reconhecer uma inclusão manual do staff.
    // Na página pública continua anônimo quando não houver sessão autenticada.
    const token = authStorage.getAccessToken() || undefined;
    const res = await apiClient<{ success: boolean; data: QueueItem }>(
      '/api/queue',
      'POST',
      payload,
      token
    );
    return unwrap<QueueItem>(res);
  },
  updateQueueItem: async (id: string, payload: QueueUpdatePayload) => {
    const token = authStorage.getAccessToken() || '';
    const res = await apiClient<{ success: boolean; data: QueueItem }>(
      `/api/queue/${id}`,
      'PATCH',
      payload,
      token
    );
    return unwrap<QueueItem>(res);
  },
  deleteQueueItem: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/queue/${id}`, 'DELETE', undefined, token);
  },
  getQueueMetrics: async (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    const res = await apiClient<{ success: boolean; data: { completedCount: number } }>(
      `/api/queue/metrics${qs}`
    );
    return unwrap<{ completedCount: number }>(res);
  },
  listAppointments: (params: ListAppointmentsParams = {}) => {
    const token = authStorage.getAccessToken() || '';
    if (!token) return Promise.resolve([]);
    return apiClient<{ success: boolean; data: unknown[] }>(
      `/api/appointments${buildQuery(params as Record<string, string | undefined>)}`,
      'GET',
      undefined,
      token
    ).then(res => unwrap<unknown[]>(res));
  },
  getAvailability: (barbershopId: string, date: string, staffId?: string) => {
    const qs = buildQuery({ barbershopId, date, staffId });
    return apiClient<{ success: boolean; data: AvailabilitySlot[] }>(
      `/api/appointments/availability${qs}`
    ).then(res => unwrap<AvailabilitySlot[]>(res));
  },
  bookAppointment: async (payload: unknown) => {
    // Backend exige staff autenticado para criar agendamento
    const token = authStorage.getAccessToken() || undefined;
    const res = await apiClient<{ success: boolean; data: unknown }>(
      '/api/appointments',
      'POST',
      payload,
      token
    );
    return unwrap<unknown>(res);
  },
  bookAppointmentPublic: async (payload: unknown) => {
    const res = await apiClient<{ success: boolean; data: unknown }>(
      '/api/appointments/public',
      'POST',
      payload
    );
    return unwrap<unknown>(res);
  },
  updateAppointment: async (id: string, payload: unknown) => {
    const token = authStorage.getAccessToken() || '';
    const res = await apiClient<{ success: boolean; data: unknown }>(
      `/api/appointments/${id}`,
      'PATCH',
      payload,
      token
    );
    return unwrap<unknown>(res);
  },
  deleteAppointment: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/appointments/${id}`, 'DELETE', undefined, token);
  },
  checkInAppointment: async (appointmentId: string) => {
    const token = authStorage.getAccessToken() || '';
    const res = await apiClient<{ success: boolean; data: { queueItemId: string; appointmentId: string } }>(
      `/api/appointments/${appointmentId}/check-in`,
      'POST',
      undefined,
      token
    );
    return unwrap<{ queueItemId: string; appointmentId: string }>(res);
  },
};
