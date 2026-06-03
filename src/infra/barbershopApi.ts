import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

export const barbershopApi = {
  listBarbershops: () => apiClient<any[]>('/api/barbershops'),
  getBarbershop: (id: string) => apiClient<any>(`/api/barbershops/${id}`),
  updateBarbershop: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/barbershops/${id}`, 'PATCH', payload, token);
  },
  listServices: (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any[]>(`/api/services${qs}`);
  },
  addService: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/services', 'POST', payload, token);
  },
  updateService: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/services/${id}`, 'PATCH', payload, token);
  },
  deleteService: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/services/${id}`, 'DELETE', undefined, token);
  },
  listStaff: (barbershopId?: string) => {
    const token = authStorage.getAccessToken() || '';
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any[]>(`/api/users${qs}`, 'GET', undefined, token);
  },
  addStaff: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/users', 'POST', payload, token);
  },
  updateStaff: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/users/${id}`, 'PATCH', payload, token);
  },
  deleteStaff: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/users/${id}`, 'DELETE', undefined, token);
  },
  listFeed: (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<any[]>(`/api/feed${qs}`);
  },
  addPost: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/feed', 'POST', payload, token);
  },
  deletePost: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/feed/${id}`, 'DELETE', undefined, token);
  },
  updatePost: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/feed/${id}`, 'PATCH', payload, token);
  }
};
