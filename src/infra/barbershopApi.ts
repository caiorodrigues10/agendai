import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { DaySchedule, Service, StaffMember, FeedPost, PostMode, PostConfig } from '../types';
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
  },

  getPostPreview: (barbershopId: string, postMode: PostMode, type: string) => {
    const token = authStorage.getAccessToken() || '';
    const qs = `barbershopId=${encodeURIComponent(barbershopId)}&postMode=${postMode}&type=${encodeURIComponent(type)}`;
    return apiClient<any>(`/api/posts/preview?${qs}`, 'GET', undefined, token).then(res => unwrap<{ imageUrl: string }>(res));
  },
  createPost: (payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/posts', 'POST', payload, token).then(res => unwrap<FeedPost>(res));
  },
  updateScheduledPost: (id: string, payload: any) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/posts/${id}`, 'PATCH', payload, token).then(res => unwrap<FeedPost>(res));
  },
  listScheduledPosts: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/posts/scheduled?barbershopId=${encodeURIComponent(barbershopId)}`, 'GET', undefined, token).then(res => unwrap<FeedPost[]>(res));
  },
  getPostConfig: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(`/api/posts/config?barbershopId=${encodeURIComponent(barbershopId)}`, 'GET', undefined, token).then(res => unwrap<PostConfig>(res));
  },
  savePostConfig: (barbershopId: string, autoPostEnabled: boolean) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>('/api/posts/config', 'PUT', { barbershopId, autoPostEnabled }, token).then(res => unwrap<PostConfig>(res));
  },
  deleteScheduledPost: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/posts/${id}`, 'DELETE', undefined, token);
  },

  getLogoUploadUrl: (barbershopId: string, mimeType: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(
      `/api/barbershops/${barbershopId}/logo/upload-url?mimeType=${encodeURIComponent(mimeType)}`,
      'GET',
      undefined,
      token
    ).then(unwrap) as Promise<{ uploadUrl: string; publicUrl: string }>;
  },

  confirmLogo: (barbershopId: string, logoUrl: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<any>(
      `/api/barbershops/${barbershopId}/logo`,
      'PATCH',
      { logoUrl },
      token
    ).then(unwrap);
  },

  deleteLogo: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(
      `/api/barbershops/${barbershopId}/logo`,
      'DELETE',
      undefined,
      token
    );
  },
};
