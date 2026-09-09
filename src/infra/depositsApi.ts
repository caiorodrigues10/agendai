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

export interface DepositPolicy {
  depositRequired: string;
  depositDefaultPercent: number;
  depositDefaultAmount?: number;
  depositConfirmHours: number;
  depositInstructions?: string;
  depositPixKey?: string;
  depositRefundRule: string;
  noShowDepositRule: string;
  maxReschedules: number;
  rescheduleTransferDeposit: boolean;
  lateToleranceMinutes: number;
  riskThresholdNoShows: number;
  riskBlockDurationDays: number;
  riskReinforcedDeposit: boolean;
  riskManualApproval: boolean;
}

export interface AppointmentDeposit {
  id: string;
  appointmentId: string;
  expectedAmount: number;
  confirmedAmount?: number;
  status: string;
  paymentMethod?: string;
  confirmationNote?: string;
  expiresAt: string;
  refundRule: string;
  createdAt: string;
}

export const depositsApi = {
  getPolicy: (barbershopId: string) =>
    apiClient<{ success: boolean; data: DepositPolicy }>(
      `/api/barbershops/${barbershopId}/deposit-policy`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<DepositPolicy>(res)),

  updatePolicy: (barbershopId: string, data: Partial<DepositPolicy>) =>
    apiClient<{ success: boolean; data: DepositPolicy }>(
      `/api/barbershops/${barbershopId}/deposit-policy`,
      'PATCH',
      data,
      token()
    ).then(res => unwrap<DepositPolicy>(res)),

  getAppointmentDeposit: (appointmentId: string) =>
    apiClient<{ success: boolean; data: AppointmentDeposit }>(
      `/api/appointments/${appointmentId}/deposit`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<AppointmentDeposit>(res)),

  confirm: (appointmentId: string, data: { confirmedAmount?: number; paymentMethod: string; note?: string }) =>
    apiClient<{ success: boolean; data: AppointmentDeposit }>(
      `/api/appointments/${appointmentId}/deposit/confirm`,
      'POST',
      data,
      token()
    ).then(res => unwrap<AppointmentDeposit>(res)),

  waive: (appointmentId: string) =>
    apiClient<{ success: boolean; data: AppointmentDeposit }>(
      `/api/appointments/${appointmentId}/deposit/waive`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<AppointmentDeposit>(res)),

  reject: (appointmentId: string) =>
    apiClient<{ success: boolean; data: AppointmentDeposit }>(
      `/api/appointments/${appointmentId}/deposit/reject`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<AppointmentDeposit>(res)),

  refund: (appointmentId: string) =>
    apiClient<{ success: boolean; data: AppointmentDeposit }>(
      `/api/appointments/${appointmentId}/deposit/refund`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<AppointmentDeposit>(res)),

  list: (barbershopId: string, params?: { status?: string; from?: string; to?: string }) =>
    apiClient<{ success: boolean; data: AppointmentDeposit[] }>(
      `/api/barbershops/${barbershopId}/appointment-deposits${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<AppointmentDeposit[]>(res)),
};
