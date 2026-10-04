import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

export type SessionStatus = 'active' | 'revoked' | 'expired';

export interface AdminSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  barbershopId: string | null;
  deviceLabel: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  status: SessionStatus;
  revokedAt: string | null;
  revokedReason: string | null;
  current: boolean;
}

export interface AdminSessionListParams {
  page?: number;
  limit?: number;
  userId?: string;
  status?: SessionStatus | '';
}

export interface AdminSessionListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RevokeSessionsPayload {
  reason: string;
  confirmSelf?: boolean;
}

export const adminSessionsApi = {
  list(params: AdminSessionListParams = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    qs.set('limit', String(params.limit ?? 10));
    if (params.userId) qs.set('userId', params.userId);
    if (params.status) qs.set('status', params.status);
    return apiClient<{ success: boolean; data: AdminSession[]; meta: AdminSessionListMeta }>(
      `/api/admin/sessions?${qs.toString()}`,
      'GET',
      undefined,
      token()
    );
  },

  revoke(id: string, payload: RevokeSessionsPayload) {
    return apiClient<{ success: boolean; data: { id: string; revoked: boolean } }>(
      `/api/admin/sessions/${id}/revoke`,
      'POST',
      payload,
      token()
    );
  },

  revokeAllForUser(userId: string, payload: RevokeSessionsPayload) {
    return apiClient<{ success: boolean; data: { targetUserId: string; tokens: number; sessions: number } }>(
      `/api/admin/users/${userId}/revoke-all-sessions`,
      'POST',
      payload,
      token()
    );
  },
};
