import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

export type ReferralTierName = 'BRONZE' | 'SILVER' | 'GOLD';

export interface ReferralTierInfo {
  name: ReferralTierName;
  label: string;
  rewardDays: number;
  bonus: number;
  threshold: number;
  nextTier: ReferralTierName | null;
  nextThreshold: number | null;
}

export interface ReferralItem {
  id: string;
  status: 'PENDING' | 'QUALIFIED' | 'REWARDED' | 'REJECTED';
  shopName: string;
  rewardDays: number;
  createdAt: string;
  qualifiedAt: string | null;
  rewardedAt: string | null;
}

export interface ReferralDashboard {
  code: string;
  shareUrl: string;
  rewardDays: number;
  tier: ReferralTierInfo;
  convertedCount: number;
  nextTierIn: number | null;
  stats: {
    pending: number;
    converted: number;
    rejected: number;
    total: number;
    creditDays: number;
    subscriptionEndDate: string | null;
  };
  referrals: ReferralItem[];
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const referralsApi = {
  me: async () => {
    const token = authStorage.getAccessToken();
    const res = await apiClient<{ success: boolean; data: ReferralDashboard }>(
      '/api/referrals/me',
      'GET',
      undefined,
      token ?? undefined
    );
    return unwrap<ReferralDashboard>(res);
  },
  applyCode: async (code: string) => {
    const token = authStorage.getAccessToken();
    return apiClient<{ success: boolean }>(
      '/api/referrals/apply',
      'POST',
      { code },
      token ?? undefined
    );
  },
};
