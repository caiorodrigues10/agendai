import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface LoyaltyProgram {
  id: string | null;
  barbershopId: string;
  type: string;
  isActive: boolean;
  config: { visitsRequired: number; rewardDescription: string; cashbackPercent?: number };
}

export interface LoyaltyAccount {
  id: string;
  clientId: string;
  barbershopId: string;
  totalVisits: number;
  rewardCount: number;
  balance?: number;
}

export interface LoyaltyLedgerEntry {
  id: string;
  type: string;
  description: string;
  amount?: number;
  createdAt: string;
}

export const loyaltyApi = {
  getProgram: (barbershopId: string) =>
    apiClient<{ success: boolean; data: LoyaltyProgram }>(
      `/api/barbershops/${barbershopId}/loyalty/program`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<LoyaltyProgram>(res)),

  updateProgram: (barbershopId: string, data: { isActive: boolean; config: any }) =>
    apiClient<{ success: boolean; data: LoyaltyProgram }>(
      `/api/barbershops/${barbershopId}/loyalty/program`,
      'POST',
      { type: 'VISITS', ...data },
      token()
    ).then(res => unwrap<LoyaltyProgram>(res)),

  getAccount: (barbershopId: string, clientId: string) =>
    apiClient<{ success: boolean; data: { account: LoyaltyAccount; entries: LoyaltyLedgerEntry[] } }>(
      `/api/barbershops/${barbershopId}/loyalty/accounts/${clientId}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<{ account: LoyaltyAccount }>(res).account),

  getLedger: (barbershopId: string, clientId: string) =>
    apiClient<{ success: boolean; data: LoyaltyLedgerEntry[] }>(
      `/api/barbershops/${barbershopId}/loyalty/accounts/${clientId}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<{ entries?: LoyaltyLedgerEntry[] }>(res).entries ?? []),

  redeemReward: (barbershopId: string, clientId: string) =>
    apiClient<{ success: boolean; data: LoyaltyLedgerEntry }>(
      `/api/barbershops/${barbershopId}/loyalty/redeem`,
      'POST',
      { clientId },
      token()
    ).then(res => unwrap<LoyaltyLedgerEntry>(res)),

  getBalance: (barbershopId: string, clientId: string) =>
    apiClient<{ success: boolean; data: { balance: number } }>(
      `/api/barbershops/${barbershopId}/loyalty/accounts/${clientId}/balance`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<{ balance: number }>(res)),
};
