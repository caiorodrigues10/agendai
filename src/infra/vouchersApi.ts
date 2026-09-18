import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface Voucher {
  id: string;
  barbershopId: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  minPurchase?: number;
  maxUses?: number;
  currentUses: number;
  perClientLimit?: number;
  validFrom: string;
  validUntil: string;
  status: string;
  applicableServiceIds?: string[];
  applicableStaffIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VoucherUsage {
  id: string;
  voucherId: string;
  clientId?: string;
  clientName?: string;
  appointmentId?: string;
  amount: number;
  createdAt: string;
}

export const vouchersApi = {
  list: (barbershopId: string, params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiClient<{ data: Voucher[] }>(
      `/api/barbershops/${barbershopId}/vouchers${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<Voucher[]>(r));
  },

  create: (barbershopId: string, data: {
    name: string;
    description?: string;
    code?: string;
    type: string;
    value: number;
    minPurchase?: number;
    maxUses?: number;
    perClientLimit?: number;
    validFrom?: string;
    validUntil: string;
    applicableServiceIds?: string[];
    applicableStaffIds?: string[];
  }) =>
    apiClient<{ data: Voucher }>(
      `/api/barbershops/${barbershopId}/vouchers`,
      'POST', data, token()
    ).then(r => unwrap<Voucher>(r)),

  update: (barbershopId: string, voucherId: string, data: Partial<{
    name: string;
    description: string;
    type: string;
    value: number;
    minPurchase: number;
    maxUses: number;
    perClientLimit: number;
    validFrom: string;
    validUntil: string;
    applicableServiceIds: string[];
    applicableStaffIds: string[];
  }>) =>
    apiClient<{ data: Voucher }>(
      `/api/barbershops/${barbershopId}/vouchers/${voucherId}`,
      'PATCH', data, token()
    ).then(r => unwrap<Voucher>(r)),

  remove: (barbershopId: string, voucherId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/vouchers/${voucherId}`,
      'DELETE', undefined, token()
    ),

  validate: (barbershopId: string, code: string, data?: {
    serviceId?: string;
    staffId?: string;
    purchaseAmount?: number;
    clientId?: string;
  }) =>
    apiClient<{ data: { valid: boolean; voucher: Voucher; discount: number; message?: string } }>(
      `/api/barbershops/${barbershopId}/vouchers/validate`,
      'POST', { code, ...data }, token()
    ).then(r => unwrap<{ valid: boolean; voucher: Voucher; discount: number; message?: string }>(r)),

  apply: (barbershopId: string, voucherId: string, data: {
    appointmentId?: string;
    clientId?: string;
    amount: number;
  }) =>
    apiClient<{ data: Voucher }>(
      `/api/barbershops/${barbershopId}/vouchers/${voucherId}/apply`,
      'POST', data, token()
    ).then(r => unwrap<Voucher>(r)),

  listUsages: (barbershopId: string, voucherId: string) =>
    apiClient<{ data: VoucherUsage[] }>(
      `/api/barbershops/${barbershopId}/vouchers/${voucherId}/usages`,
      'GET', undefined, token()
    ).then(r => unwrap<VoucherUsage[]>(r)),
};
