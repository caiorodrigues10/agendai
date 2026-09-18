import { apiClient } from './apiClient';

const CLIENT_ACCESS_KEY = 'agendai_client_portal_access';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function clientToken() {
  return localStorage.getItem(CLIENT_ACCESS_KEY) || sessionStorage.getItem(CLIENT_ACCESS_KEY) || '';
}

/** Client-portal wallet (authenticateClient). There is no barbershop shop-wallet API. */
export interface WalletBalance {
  id?: string;
  identityId?: string;
  balance: number;
  currency?: string;
}

export interface WalletEntry {
  id: string;
  type: string;
  amount: number;
  description?: string;
  referenceId?: string;
  createdAt: string;
}

export const walletApi = {
  getBalance: () =>
    apiClient<{ success: boolean; data: WalletBalance }>(
      '/api/client/portal/wallet',
      'GET',
      undefined,
      clientToken()
    ).then(r => unwrap<WalletBalance>(r)),

  debit: (data: { amount: number; description?: string; referenceId?: string }) =>
    apiClient<{ success: boolean; data: WalletEntry }>(
      '/api/client/portal/wallet/debit',
      'POST',
      data,
      clientToken()
    ).then(r => unwrap<WalletEntry>(r)),

  listEntries: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return apiClient<{ success: boolean; data: WalletEntry[] }>(
      `/api/client/portal/wallet/entries${query ? '?' + query : ''}`,
      'GET',
      undefined,
      clientToken()
    ).then(r => unwrap<WalletEntry[]>(r));
  },

  transfer: (data: { targetWalletId: string; amount: number; description?: string }) =>
    apiClient<{ success: boolean; data: WalletEntry }>(
      '/api/client/portal/wallet/transfer',
      'POST',
      data,
      clientToken()
    ).then(r => unwrap<WalletEntry>(r)),
};
