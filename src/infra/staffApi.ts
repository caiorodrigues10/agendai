import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface StaffScheduleEntry {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffService {
  id: string;
  staffId: string;
  serviceId: string;
  serviceName?: string;
  customPrice?: number;
  customDuration?: number;
  isActive: boolean;
  createdAt: string;
}

export interface TimeOffRequest {
  id: string;
  staffId: string;
  staffName?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const staffApi = {
  // Schedule
  getSchedules: (barbershopId: string, staffId: string) =>
    apiClient<{ data: StaffScheduleEntry[] }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/schedules`,
      'GET', undefined, token()
    ).then(r => unwrap<StaffScheduleEntry[]>(r)),

  upsertSchedule: (barbershopId: string, staffId: string, data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
    isActive?: boolean;
  }) =>
    apiClient<{ data: StaffScheduleEntry }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/schedules`,
      'POST', data, token()
    ).then(r => unwrap<StaffScheduleEntry>(r)),

  removeSchedule: (barbershopId: string, staffId: string, scheduleId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/schedules/${scheduleId}`,
      'DELETE', undefined, token()
    ),

  // Service assignment
  getAssignedServices: (barbershopId: string, staffId: string) =>
    apiClient<{ data: StaffService[] }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/services`,
      'GET', undefined, token()
    ).then(r => unwrap<StaffService[]>(r)),

  assignService: (barbershopId: string, staffId: string, data: {
    serviceId: string;
    customPrice?: number;
    customDuration?: number;
  }) =>
    apiClient<{ data: StaffService }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/services`,
      'POST', data, token()
    ).then(r => unwrap<StaffService>(r)),

  removeService: (barbershopId: string, staffId: string, serviceId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/services/${serviceId}`,
      'DELETE', undefined, token()
    ),

  // Time-off requests
  listTimeOff: (barbershopId: string, staffId: string, params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiClient<{ data: TimeOffRequest[] }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/time-off${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<TimeOffRequest[]>(r));
  },

  requestTimeOff: (barbershopId: string, staffId: string, data: {
    startDate: string;
    endDate: string;
    reason?: string;
  }) =>
    apiClient<{ data: TimeOffRequest }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/time-off`,
      'POST', data, token()
    ).then(r => unwrap<TimeOffRequest>(r)),

  approveTimeOff: (barbershopId: string, staffId: string, requestId: string) =>
    apiClient<{ data: TimeOffRequest }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/time-off/${requestId}/approve`,
      'POST', undefined, token()
    ).then(r => unwrap<TimeOffRequest>(r)),

  rejectTimeOff: (barbershopId: string, staffId: string, requestId: string) =>
    apiClient<{ data: TimeOffRequest }>(
      `/api/barbershops/${barbershopId}/staff/${staffId}/time-off/${requestId}/reject`,
      'POST', undefined, token()
    ).then(r => unwrap<TimeOffRequest>(r)),
};
