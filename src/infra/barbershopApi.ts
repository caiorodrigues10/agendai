import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { DaySchedule, Service, StaffMember, FeedPost } from '../types';
import { mapScheduleToApi } from '../utils/schedulingUtils';

function unwrap<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) return res.data as T;
  return res as T;
}

interface BarbershopData {
  id: string;
  name: string;
  whatsapp: string;
  logoUrl: string | null;
  cnpj: string | null;
  address: string | null;
  createdAt: string;
  active: boolean;
  evolutionInstanceName: string | null;
}

interface ScheduleDay {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export const barbershopApi = {
  listBarbershops: () => apiClient<any>('/api/barbershops').then(res => unwrap<BarbershopData[]>(res)),
  getBarbershop: (id: string) => apiClient<any>(`/api/barbershops/${id}`).then(res => unwrap<BarbershopData>(res)),
  getSchedule: (id: string) => apiClient<any>(`/api/barbershops/${id}/schedule`).then(res => unwrap<ScheduleDay[]>(res)),
  updateBarbershop: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/barbershops/${id}`, 'PATCH', payload, token).then(res => unwrap<BarbershopData>(res));
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
    return apiClient<any>(`/api/services${qs}`).then(res => unwrap<Service[]>(res));
  },
  addService: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/services', 'POST', payload, token).then(res => unwrap<Service>(res));
  },
  updateService: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/services/${id}`, 'PATCH', payload, token).then(res => unwrap<Service>(res));
  },
  deleteService: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/services/${id}`, 'DELETE', undefined, token);
  },
  listStaff: (barbershopId?: string) => {
    const token = authStorage.getAccessToken() || '';
    if (!token) return Promise.resolve([]);
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any>(`/api/users${qs}`, 'GET', undefined, token).then(res => unwrap<StaffMember[]>(res));
  },
  addStaff: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/users', 'POST', payload, token).then(res => unwrap<StaffMember>(res));
  },
  updateStaff: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/users/${id}`, 'PATCH', payload, token).then(res => unwrap<StaffMember>(res));
  },
  deleteStaff: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/users/${id}`, 'DELETE', undefined, token);
  },
  listFeed: (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any>(`/api/feed${qs}`).then(res => unwrap<FeedPost[]>(res));
  },
  addPost: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/feed', 'POST', payload, token).then(res => unwrap<FeedPost>(res));
  },
  deletePost: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/feed/${id}`, 'DELETE', undefined, token);
  },
  updatePost: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/feed/${id}`, 'PATCH', payload, token).then(res => unwrap<FeedPost>(res));
  }
};
