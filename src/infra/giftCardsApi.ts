import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface GiftCard {
  id: string;
  barbershopId: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  buyerName?: string;
  buyerPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  purchaserId?: string;
  recipientId?: string;
  status: string;
  expiresAt?: string;
  purchasedAt: string;
  redeemedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCardUsage {
  id: string;
  giftCardId: string;
  amount: number;
  appointmentId?: string;
  notes?: string;
  createdAt: string;
}

export const giftCardsApi = {
  purchase: (barbershopId: string, data: {
    initialBalance: number;
    buyerName?: string;
    buyerPhone?: string;
    recipientName?: string;
    recipientPhone?: string;
    purchaserId?: string;
    recipientId?: string;
    expiresAt?: string;
  }) =>
    apiClient<{ data: GiftCard }>(
      `/api/barbershops/${barbershopId}/gift-cards`,
      'POST', data, token()
    ).then(r => unwrap<GiftCard>(r)),

  list: (barbershopId: string, params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiClient<{ data: GiftCard[] }>(
      `/api/barbershops/${barbershopId}/gift-cards${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<GiftCard[]>(r));
  },

  getById: (barbershopId: string, id: string) =>
    apiClient<{ data: GiftCard }>(
      `/api/barbershops/${barbershopId}/gift-cards/${id}`,
      'GET', undefined, token()
    ).then(r => unwrap<GiftCard>(r)),

  lookupByCode: (barbershopId: string, code: string) =>
    apiClient<{ data: GiftCard }>(
      `/api/barbershops/${barbershopId}/gift-cards/lookup?code=${encodeURIComponent(code)}`,
      'GET', undefined, token()
    ).then(r => unwrap<GiftCard>(r)),

  redeem: (barbershopId: string, id: string, data: {
    amount: number;
    appointmentId?: string;
    notes?: string;
  }) =>
    apiClient<{ data: GiftCard }>(
      `/api/barbershops/${barbershopId}/gift-cards/${id}/redeem`,
      'POST', data, token()
    ).then(r => unwrap<GiftCard>(r)),

  cancel: (barbershopId: string, id: string) =>
    apiClient<{ data: GiftCard }>(
      `/api/barbershops/${barbershopId}/gift-cards/${id}/cancel`,
      'POST', undefined, token()
    ).then(r => unwrap<GiftCard>(r)),

  getUsages: (barbershopId: string, id: string) =>
    apiClient<{ data: GiftCardUsage[] }>(
      `/api/barbershops/${barbershopId}/gift-cards/${id}/usages`,
      'GET', undefined, token()
    ).then(r => unwrap<GiftCardUsage[]>(r)),
};
