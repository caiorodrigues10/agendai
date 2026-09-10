import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface WalletBalance {
  barbershopId: string;
  balance: number;
  currency: string;
}

export interface WalletEntry {
  id: string;
  barbershopId: string;
  type: string;
  amount: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export const walletApi = {
  getBalance: (barbershopId: string) =>
    apiClient<{ success: boolean; data: WalletBalance }>(
      `/api/barbershops/${barbershopId}/wallet/balance`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<WalletBalance>(r)),

  credit: (barbershopId: string, data: { amount: number; description: string; referenceId?: string }) =>
    apiClient<{ success: boolean; data: WalletEntry }>(
      `/api/barbershops/${barbershopId}/wallet/credit`,
      'POST',
      data,
      token()
    ).then(r => unwrap<WalletEntry>(r)),

  debit: (barbershopId: string, data: { amount: number; description: string; referenceId?: string }) =>
    apiClient<{ success: boolean; data: WalletEntry }>(
      `/api/barbershops/${barbershopId}/wallet/debit`,
      'POST',
      data,
      token()
    ).then(r => unwrap<WalletEntry>(r)),

  listEntries: (barbershopId: string, params?: { type?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString();
    return apiClient<{ success: boolean; data: WalletEntry[] }>(
      `/api/barbershops/${barbershopId}/wallet/entries${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<WalletEntry[]>(r));
  },

  transfer: (barbershopId: string, data: { toBarbershopId: string; amount: number; description: string }) =>
    apiClient<{ success: boolean; data: WalletEntry }>(
      `/api/barbershops/${barbershopId}/wallet/transfer`,
      'POST',
      data,
      token()
    ).then(r => unwrap<WalletEntry>(r)),
};
