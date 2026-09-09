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

export interface LoyaltyProgram {
  id: string;
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
      'PUT',
      data,
      token()
    ).then(res => unwrap<LoyaltyProgram>(res)),

  getAccount: (barbershopId: string, clientId: string) =>
    apiClient<{ success: boolean; data: LoyaltyAccount }>(
      `/api/clients/${clientId}/loyalty${buildQuery({ barbershopId })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<LoyaltyAccount>(res)),

  getLedger: (barbershopId: string, clientId: string) =>
    apiClient<{ success: boolean; data: LoyaltyLedgerEntry[] }>(
      `/api/clients/${clientId}/loyalty/ledger${buildQuery({ barbershopId })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<LoyaltyLedgerEntry[]>(res)),

  redeemReward: (barbershopId: string, clientId: string) =>
    apiClient<{ success: boolean; data: LoyaltyLedgerEntry }>(
      '/api/loyalty/redemptions',
      'POST',
      { barbershopId, clientId },
      token()
    ).then(res => unwrap<LoyaltyLedgerEntry>(res)),

  getBalance: (barbershopId: string, clientId: string) =>
    apiClient<{ success: boolean; data: { balance: number } }>(
      `/api/loyalty/accounts/${clientId}/balance${buildQuery({ barbershopId })}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<{ balance: number }>(res)),
};
