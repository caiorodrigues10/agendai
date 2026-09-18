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

export interface StaffScheduleEntry {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffService {
  id: string;
  staffId: string;
  serviceId: string;
  serviceName?: string;
  customPrice?: number | null;
  customTime?: number | null;
  customDuration?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface TimeOffRequest {
  id: string;
  staffId: string;
  staffName?: string;
  startAt: string;
  endAt: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

type StaffServiceRaw = StaffService & {
  service?: { name?: string | null };
  customTime?: number | string | null;
  customPrice?: number | string | null;
};

type TimeOffRaw = {
  id: string;
  staffId: string;
  startAt?: string;
  endAt?: string;
  startDate?: string;
  endDate?: string;
  reason?: string | null;
  status: string;
  approvedById?: string | null;
  createdAt: string;
  updatedAt?: string;
  staff?: { name?: string | null };
  approvedBy?: { id?: string; name?: string | null } | string | null;
};

function asNumber(value: number | string | null | undefined): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toIsoStart(value: string): string {
  if (value.includes('T')) return value;
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function toIsoEnd(value: string): string {
  if (value.includes('T')) return value;
  return new Date(`${value}T23:59:59.999Z`).toISOString();
}

function normalizeSchedule(raw: StaffScheduleEntry): StaffScheduleEntry {
  return {
    id: raw.id,
    staffId: raw.staffId,
    dayOfWeek: raw.dayOfWeek,
    startTime: raw.startTime,
    endTime: raw.endTime,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeService(raw: StaffServiceRaw): StaffService {
  const customTime = asNumber(raw.customTime) ?? raw.customDuration ?? null;
  return {
    id: raw.id,
    staffId: raw.staffId,
    serviceId: raw.serviceId,
    serviceName: raw.service?.name ?? raw.serviceName,
    customPrice: asNumber(raw.customPrice) ?? raw.customPrice ?? null,
    customTime,
    customDuration: customTime,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
  };
}

function normalizeTimeOff(raw: TimeOffRaw): TimeOffRequest {
  const startAt = raw.startAt ?? raw.startDate ?? '';
  const endAt = raw.endAt ?? raw.endDate ?? '';
  const approvedBy =
    typeof raw.approvedBy === 'string'
      ? raw.approvedBy
      : raw.approvedBy?.name ?? raw.approvedById ?? undefined;
  return {
    id: raw.id,
    staffId: raw.staffId,
    staffName: raw.staff?.name,
    startAt,
    endAt,
    startDate: startAt,
    endDate: endAt,
    reason: raw.reason ?? undefined,
    status: raw.status,
    approvedBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const staffApi = {
  getSchedules: (barbershopId: string, staffId: string) =>
    apiClient<{ success: boolean; data: StaffScheduleEntry[] }>(
      `/api/barbershops/${barbershopId}/staff-schedules${buildQuery({ staffId })}`,
      'GET',
      undefined,
      token()
    ).then(r => {
      const rows = unwrap<StaffScheduleEntry[]>(r);
      return (Array.isArray(rows) ? rows : []).map(normalizeSchedule);
    }),

  upsertSchedule: (
    barbershopId: string,
    staffId: string,
    data: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isActive?: boolean;
    }
  ) =>
    apiClient<{ success: boolean; data: StaffScheduleEntry }>(
      `/api/barbershops/${barbershopId}/staff-schedules`,
      'POST',
      {
        staffId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive ?? true,
      },
      token()
    ).then(r => normalizeSchedule(unwrap<StaffScheduleEntry>(r))),

  removeSchedule: (barbershopId: string, _staffId: string, scheduleId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/staff-schedules/${scheduleId}`,
      'DELETE',
      undefined,
      token()
    ),

  getAssignedServices: (barbershopId: string, staffId: string) =>
    apiClient<{ success: boolean; data: StaffServiceRaw[] }>(
      `/api/barbershops/${barbershopId}/staff-services${buildQuery({ staffId })}`,
      'GET',
      undefined,
      token()
    ).then(r => {
      const rows = unwrap<StaffServiceRaw[]>(r);
      return (Array.isArray(rows) ? rows : []).map(normalizeService);
    }),

  assignService: (
    barbershopId: string,
    staffId: string,
    data: {
      serviceId: string;
      customPrice?: number;
      customTime?: number;
      customDuration?: number;
    }
  ) =>
    apiClient<{ success: boolean; data: StaffServiceRaw }>(
      `/api/barbershops/${barbershopId}/staff-services`,
      'POST',
      {
        staffId,
        serviceId: data.serviceId,
        customPrice: data.customPrice,
        customTime: data.customTime ?? data.customDuration,
      },
      token()
    ).then(r => normalizeService(unwrap<StaffServiceRaw>(r))),

  removeService: (barbershopId: string, staffId: string, serviceId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/staff-services/${staffId}/${serviceId}`,
      'DELETE',
      undefined,
      token()
    ),

  listTimeOff: (barbershopId: string, staffId: string, params?: { status?: string }) =>
    apiClient<{ success: boolean; data: TimeOffRaw[] }>(
      `/api/barbershops/${barbershopId}/time-off${buildQuery({ staffId, status: params?.status })}`,
      'GET',
      undefined,
      token()
    ).then(r => {
      const rows = unwrap<TimeOffRaw[]>(r);
      return (Array.isArray(rows) ? rows : []).map(normalizeTimeOff);
    }),

  requestTimeOff: (
    barbershopId: string,
    staffId: string,
    data: {
      startDate?: string;
      endDate?: string;
      startAt?: string;
      endAt?: string;
      reason?: string;
    }
  ) =>
    apiClient<{ success: boolean; data: TimeOffRaw }>(
      `/api/barbershops/${barbershopId}/time-off`,
      'POST',
      {
        staffId,
        startAt: toIsoStart(data.startAt ?? data.startDate ?? ''),
        endAt: toIsoEnd(data.endAt ?? data.endDate ?? ''),
        reason: data.reason,
      },
      token()
    ).then(r => normalizeTimeOff(unwrap<TimeOffRaw>(r))),

  approveTimeOff: (barbershopId: string, _staffId: string, requestId: string) =>
    apiClient<{ success: boolean; data: TimeOffRaw }>(
      `/api/barbershops/${barbershopId}/time-off/${requestId}/approve`,
      'PATCH',
      undefined,
      token()
    ).then(r => normalizeTimeOff(unwrap<TimeOffRaw>(r))),

  rejectTimeOff: (barbershopId: string, _staffId: string, requestId: string) =>
    apiClient<{ success: boolean; data: TimeOffRaw }>(
      `/api/barbershops/${barbershopId}/time-off/${requestId}/reject`,
      'PATCH',
      undefined,
      token()
    ).then(r => normalizeTimeOff(unwrap<TimeOffRaw>(r))),
};
