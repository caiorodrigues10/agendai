import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

export const schedulingApi = {
  listQueue: (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any[]>(`/api/queue${qs}`);
  },
  joinQueue: (payload: any) => apiClient<any>('/api/queue', 'POST', payload),
  updateQueueItem: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/queue/${id}`, 'PATCH', payload, token);
  },
  deleteQueueItem: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/queue/${id}`, 'DELETE', undefined, token);
  },
  getQueueMetrics: (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<{completedCount: number}>(`/api/queue/metrics${qs}`);
  },
  listAppointments: (barbershopId?: string) => {
    const token = authStorage.getAccessToken() || '';
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any[]>(`/api/appointments${qs}`, 'GET', undefined, token);
  },
  bookAppointment: (payload: any) => apiClient<any>('/api/appointments', 'POST', payload),
  updateAppointment: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/appointments/${id}`, 'PATCH', payload, token);
  },
  deleteAppointment: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/appointments/${id}`, 'DELETE', undefined, token);
  }
};
