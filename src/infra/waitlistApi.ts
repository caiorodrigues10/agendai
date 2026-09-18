import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';
import { unwrapData, unwrapList } from '../utils/apiData';

function unwrap<T>(res: unknown): T {
  return unwrapData<T>(res);
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface WaitlistEntry {
  id: string;
  customerName: string;
  whatsapp: string;
  serviceId?: string;
  serviceName?: string;
  preferredStaffId?: string;
  preferredStaffName?: string;
  dateFrom: string;
  dateTo: string;
  preferredPeriods: string[];
  flexibilityMinutes: number;
  priority: number;
  origin: string;
  status: string;
  validUntil: string;
  createdAt: string;
}

export interface WaitlistOffer {
  id: string;
  entryId: string;
  offeredDate: string;
  offeredTime: string;
  staffId?: string;
  staffName?: string;
  token: string;
  expiresAt: string;
  response?: string;
  appointmentId?: string;
}

export const waitlistApi = {
  list: (barbershopId: string, params?: { status?: string; serviceId?: string }) =>
    apiClient<{ success: boolean; data: WaitlistEntry[] }>(
      `/api/barbershops/${barbershopId}/waitlist${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrapList<WaitlistEntry>(res)),

  create: (barbershopId: string, data: {
    customerName: string;
    whatsapp: string;
    serviceId?: string;
    preferredStaffId?: string;
    dateFrom: string;
    dateTo: string;
    preferredPeriods?: string[];
    flexibilityMinutes?: number;
    priority?: number;
  }) =>
    apiClient<{ success: boolean; data: WaitlistEntry }>(
      `/api/barbershops/${barbershopId}/waitlist`,
      'POST',
      data,
      token()
    ).then(res => unwrap<WaitlistEntry>(res)),

  update: (barbershopId: string, entryId: string, data: Partial<WaitlistEntry>) =>
    apiClient<{ success: boolean; data: WaitlistEntry }>(
      `/api/barbershops/${barbershopId}/waitlist/${entryId}`,
      'PATCH',
      data,
      token()
    ).then(res => unwrap<WaitlistEntry>(res)),

  remove: (barbershopId: string, entryId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/waitlist/${entryId}`,
      'DELETE',
      undefined,
      token()
    ),

  offerSlot: (barbershopId: string, entryId: string, data: { offeredDate: string; offeredTime: string; staffId?: string }) =>
    apiClient<{ success: boolean; data: WaitlistOffer }>(
      `/api/barbershops/${barbershopId}/waitlist/${entryId}/offer`,
      'POST',
      data,
      token()
    ).then(res => unwrap<WaitlistOffer>(res)),

  publicCreate: (data: { barbershopId: string; customerName: string; whatsapp: string; serviceId?: string; dateFrom: string; dateTo: string }) =>
    apiClient<{ success: boolean; data: WaitlistEntry }>(
      '/api/appointments/waitlist/public',
      'POST',
      data,
    ).then(res => unwrap<WaitlistEntry>(res)),

  getOffer: (queryToken: string) =>
    apiClient<{ success: boolean; data: WaitlistOffer }>(
      `/api/appointments/waitlist/public/offer${buildQuery({ token: queryToken })}`,
      'GET',
      undefined,
    ).then(res => unwrap<WaitlistOffer>(res)),

  acceptOffer: (queryToken: string) =>
    apiClient<{ success: boolean; data: WaitlistOffer }>(
      '/api/appointments/waitlist/public/accept',
      'POST',
      { token: queryToken },
    ).then(res => unwrap<WaitlistOffer>(res)),

  declineOffer: (queryToken: string) =>
    apiClient<{ success: boolean }>(
      '/api/appointments/waitlist/public/decline',
      'POST',
      { token: queryToken },
    ),
};
