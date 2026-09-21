import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

/** Quando a resposta vem do legacy EmailDelivery (V1) — to/subject/status. */
export interface EmailLegacyRow {
  id: string;
  to: string;
  subject: string;
  status: string;
  createdAt: string;
}

/** Histórico do painel (EmailDeliveryLog — sanitizado, mascarado). */
export interface EmailDeliveryLog {
  id: string;
  template: string;
  category: string;
  to: string;
  recipientMasked: string;
  subject: string;
  status: string;
  attemptCount: number;
  providerId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export type EmailPreference = {
  category: 'ESSENTIAL' | 'OPERATION' | 'MARKETING';
  label: string;
  enabled: boolean;
  canDisable: boolean;
};

export type SalonaEmailSettings = {
  dailyDigestEnabled: boolean;
  dailyDigestTime: string;
  timezone: string;
  urgentAppointmentWindowHours: number;
  lowStockEnabled: boolean;
  performanceSummaryFrequency: 'weekly' | 'monthly' | 'off';
};

export const emailApi = {
  /** Minha preferência por categoria dentro do salão */
  getPreferences(barbershopId: string) {
    return apiClient<{ success: boolean; data: EmailPreference[] }>(
      `/api/barbershops/${barbershopId}/email-preferences`,
      'GET',
      undefined,
      token()
    ).then(r => r.data ?? []);
  },

  /** Ativa/desativa uma categoria no contexto do salão */
  updatePreference(barbershopId: string, category: string, enabled: boolean) {
    return apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/email-preferences/me`,
      'PATCH',
      { category, enabled },
      token()
    );
  },

  /** Configurações do salão (OWNER/ADMIN) */
  getSettings(barbershopId: string) {
    return apiClient<{ success: boolean; data: SalonaEmailSettings }>(
      `/api/barbershops/${barbershopId}/email-settings`,
      'GET',
      undefined,
      token()
    ).then(r => r.data);
  },

  updateSettings(barbershopId: string, data: Partial<SalonaEmailSettings>) {
    return apiClient<{ success: boolean; data: SalonaEmailSettings }>(
      `/api/barbershops/${barbershopId}/email-settings`,
      'PATCH',
      data,
      token()
    ).then(r => r.data);
  },

  /** Histórico de e-mails visível para o proprietário. */
  listHistory(barbershopId: string, opts: { page?: number; limit?: number; category?: string; search?: string } = {}) {
    const params = new URLSearchParams({ barbershopId });
    if (opts.page) params.set('page', String(opts.page));
    if (opts.limit) params.set('limit', String(opts.limit));
    if (opts.category) params.set('category', opts.category);
    if (opts.search) params.set('search', opts.search);

    return apiClient<{ success: boolean; data: EmailDeliveryLog[]; meta: { total: number; page: number; limit: number } }>(
      `/api/barbershops/${barbershopId}/email-history?${params.toString()}`,
      'GET',
      undefined,
      token()
    ).then(r => ({
      data: Array.isArray(r.data) ? r.data : [],
      meta: r.meta ?? { total: 0, page: 1, limit: 10 },
    }));
  },
};
