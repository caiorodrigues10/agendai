import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { DaySchedule } from '../types';
import { mapScheduleToApi } from '../utils/schedulingUtils';

function unwrap<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) return res.data as T;
  return res as T;
}

export const barbershopApi = {
  listBarbershops: () => apiClient<any>('/api/barbershops').then(unwrap),
  getBarbershop: (id: string) => apiClient<any>(`/api/barbershops/${id}`).then(unwrap),
  getSchedule: (id: string) => apiClient<any>(`/api/barbershops/${id}/schedule`).then(unwrap),
  updateBarbershop: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/barbershops/${id}`, 'PATCH', payload, token).then(unwrap);
  },
  updateSchedule: (id: string, schedule: DaySchedule[]) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(
      `/api/barbershops/${id}/schedule`,
      'PATCH',
      mapScheduleToApi(schedule),
      token
    );
  },
  listServices: (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any>(`/api/services${qs}`).then(unwrap);
  },
  addService: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/services', 'POST', payload, token).then(unwrap);
  },
  updateService: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/services/${id}`, 'PATCH', payload, token).then(unwrap);
  },
  deleteService: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/services/${id}`, 'DELETE', undefined, token);
  },
  listStaff: (barbershopId?: string) => {
    const token = authStorage.getAccessToken() || '';
    if (!token) return Promise.resolve([]);
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any>(`/api/users${qs}`, 'GET', undefined, token).then(unwrap);
  },
  addStaff: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/users', 'POST', payload, token).then(unwrap);
  },
  updateStaff: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/users/${id}`, 'PATCH', payload, token).then(unwrap);
  },
  deleteStaff: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/users/${id}`, 'DELETE', undefined, token);
  },
  listFeed: (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any>(`/api/feed${qs}`).then(unwrap);
  },
  addPost: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/feed', 'POST', payload, token).then(unwrap);
  },
  deletePost: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/feed/${id}`, 'DELETE', undefined, token);
  },
  updatePost: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/feed/${id}`, 'PATCH', payload, token).then(unwrap);
  }
};
