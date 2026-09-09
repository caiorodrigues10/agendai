import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface Resource {
  id: string;
  barbershopId: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  maxConcurrent: number;
  createdAt: string;
  updatedAt: string;
  barbershop?: { id: string; name: string };
}

export interface ResourceBooking {
  id: string;
  resourceId: string;
  barbershopId: string;
  appointmentId?: string;
  staffId?: string;
  startAt: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: string;
  resource?: { id: string; name: string; type: string };
  staff?: { id: string; name: string };
  appointment?: { id: string; customerName: string; date: string; time: string };
}

export interface ResourceAvailability {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  maxConcurrent: number;
  dateFrom: string;
  dateTo: string;
  bookings: {
    id: string;
    startAt: string;
    endTime: string;
    status: string;
    staffId?: string;
    appointmentId?: string;
  }[];
}

export const resourcesApi = {
  // ─── Resource CRUD ─────────────────────────────────────────
  list: (barbershopId: string, params?: { type?: string; isActive?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    const query = qs.toString();
    return apiClient<{ success: boolean; data: Resource[] }>(
      `/api/barbershops/${barbershopId}/resources${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<Resource[]>(r));
  },

  get: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: Resource }>(
      `/api/barbershops/${barbershopId}/resources/${id}`,
      'GET', undefined, token()
    ).then(r => unwrap<Resource>(r)),

  create: (barbershopId: string, data: {
    name: string;
    type: string;
    description?: string;
    isActive?: boolean;
    maxConcurrent?: number;
  }) =>
    apiClient<{ success: boolean; data: Resource }>(
      `/api/barbershops/${barbershopId}/resources`,
      'POST', data, token()
    ).then(r => unwrap<Resource>(r)),

  update: (barbershopId: string, id: string, data: Partial<Resource>) =>
    apiClient<{ success: boolean; data: Resource }>(
      `/api/barbershops/${barbershopId}/resources/${id}`,
      'PATCH', data, token()
    ).then(r => unwrap<Resource>(r)),

  remove: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/resources/${id}`,
      'DELETE', undefined, token()
    ),

  // ─── Availability ──────────────────────────────────────────
  getAvailability: (barbershopId: string, id: string, params: { dateFrom: string; dateTo: string }) => {
    const qs = new URLSearchParams({ dateFrom: params.dateFrom, dateTo: params.dateTo });
    return apiClient<{ success: boolean; data: ResourceAvailability }>(
      `/api/barbershops/${barbershopId}/resources/${id}/availability?${qs.toString()}`,
      'GET', undefined, token()
    ).then(r => unwrap<ResourceAvailability>(r));
  },

  // ─── Bookings ──────────────────────────────────────────────
  listBookings: (barbershopId: string, params: { dateFrom: string; dateTo: string; resourceId?: string; status?: string }) => {
    const qs = new URLSearchParams({ dateFrom: params.dateFrom, dateTo: params.dateTo });
    if (params.resourceId) qs.set('resourceId', params.resourceId);
    if (params.status) qs.set('status', params.status);
    return apiClient<{ success: boolean; data: ResourceBooking[] }>(
      `/api/barbershops/${barbershopId}/resource-bookings?${qs.toString()}`,
      'GET', undefined, token()
    ).then(r => unwrap<ResourceBooking[]>(r));
  },

  createBooking: (barbershopId: string, data: {
    resourceId: string;
    startAt: string;
    endTime: string;
    staffId?: string;
    appointmentId?: string;
    notes?: string;
  }) =>
    apiClient<{ success: boolean; data: ResourceBooking }>(
      `/api/barbershops/${barbershopId}/resources/${data.resourceId}/bookings`,
      'POST', data, token()
    ).then(r => unwrap<ResourceBooking>(r)),

  updateBooking: (barbershopId: string, bookingId: string, data: Partial<ResourceBooking>) =>
    apiClient<{ success: boolean; data: ResourceBooking }>(
      `/api/barbershops/${barbershopId}/resource-bookings/${bookingId}`,
      'PATCH', data, token()
    ).then(r => unwrap<ResourceBooking>(r)),

  cancelBooking: (barbershopId: string, bookingId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/resource-bookings/${bookingId}`,
      'DELETE', undefined, token()
    ),
};
