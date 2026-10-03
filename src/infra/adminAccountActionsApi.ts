import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

export type AccountControlAction =
  | 'suspend'
  | 'reactivate'
  | 'approve'
  | 'reject'
  | 'block'
  | 'notify'
  | 'extend-trial'
  | 'change-plan';

export interface AccountActionBody {
  reason: string;
  days?: number;
  planId?: string;
}

export interface ImpersonateResponse {
  success: boolean;
  data: {
    accessToken: string;
    expiresIn: number;
    user: { id: string; name: string; email: string; role: string; barbershopId?: string; avatarUrl?: string };
    shop: { id: string; name: string };
  };
}

/**
 * Ações de controle do master sobre uma conta (todas exigem reason ≥10
 * chars, validado pelo backend) + sessão de impersonation de 30min.
 */
export const adminAccountActionsApi = {
  accountAction(id: string, action: AccountControlAction, body: AccountActionBody) {
    return apiClient<{ success: boolean; data: unknown }>(
      `/api/admin/accounts/${id}/${action}`,
      'POST',
      body,
      token(),
    );
  },

  impersonate(id: string, reason: string) {
    return apiClient<ImpersonateResponse>(
      `/api/admin/accounts/${id}/impersonate`,
      'POST',
      { reason },
      token(),
    );
  },
};
