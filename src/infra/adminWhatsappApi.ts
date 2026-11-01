import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

export interface WhatsAppOverview {
  generatedAt: string;
  globalSettings: {
    aiGloballyEnabled: boolean;
    ownerBotGloballyEnabled: boolean;
    outboundPaused: boolean;
    reason: string | null;
    updatedBy: string | null;
    updatedAt: string;
  };
  instances: {
    ai: { name: string | null; state: string | null };
    platform: { name: string | null; state: string | null };
  };
  counts: {
    shopsWithAiEnabled: number;
    shopsWithOwnerBotEnabled: number;
    aiConversationsTotal: number;
    aiMessages24h: number;
    ownerBotActions24h: number;
  };
  queues: Record<string, any>;
}

export interface WhatsAppInstance {
  kind: string;
  name: string;
  state: string | null;
  shopId?: string;
  shopName?: string;
}

export interface WhatsAppShop {
  id: string;
  name: string;
  city: string | null;
  active: boolean;
  approvalStatus: string;
  whatsappAiEnabled: boolean;
  evolutionInstanceName: string | null;
  ownerBot: { enabled: boolean; blocked: boolean; blockedAt: string | null } | null;
  counts: { aiConversations: number; OwnerBotActionLog: number };
}

export interface AiConversationSummary {
  id: string;
  barbershopId: string;
  barbershopName?: string;
  phoneMasked: string | null;
  status: string;
  startedAt: string;
  lastMessageAt: string;
  endedAt: string | null;
  messageCount: number;
}

export interface AiConversationDetail {
  id: string;
  barbershopId: string;
  barbershopName?: string;
  phoneMasked: string | null;
  status: string;
  context: any;
  startedAt: string;
  lastMessageAt: string;
  endedAt: string | null;
  messages: { id: string; direction: string; content: string; messageType: string; intent: string | null; confidence: number | null; sentAt: string }[];
}

export interface OwnerBotActionLog {
  id: string;
  barbershopId: string;
  barbershopName?: string;
  action: string;
  status: string;
  riskClass: string | null;
  phoneMasked: string | null;
  errorMessage: string | null;
  canUndo: boolean;
  undoneAt: string | null;
  createdAt: string;
}

export const adminWhatsappApi = {
  overview() {
    return apiClient<{ success: boolean; data: WhatsAppOverview }>('/api/admin/whatsapp/overview', 'GET', undefined, token());
  },
  instances() {
    return apiClient<{ success: boolean; data: WhatsAppInstance[] }>('/api/admin/whatsapp/instances', 'GET', undefined, token());
  },
  platformSettingsGet() {
    return apiClient<{ success: boolean; data: WhatsAppOverview['globalSettings'] }>('/api/admin/whatsapp/platform-settings', 'GET', undefined, token());
  },
  platformSettingsPut(body: { aiGloballyEnabled?: boolean; ownerBotGloballyEnabled?: boolean; outboundPaused?: boolean; reason: string }) {
    return apiClient<{ success: boolean; data: WhatsAppOverview['globalSettings'] }>('/api/admin/whatsapp/platform-settings', 'PUT', body, token());
  },
  shops(params?: { page?: number; limit?: number; search?: string; aiEnabled?: string }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    if (params?.aiEnabled) qs.set('aiEnabled', params.aiEnabled);
    return apiClient<{ success: boolean; data: WhatsAppShop[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/admin/whatsapp/shops?${qs.toString()}`,
      'GET',
      undefined,
      token(),
    );
  },
  patchShopAi(id: string, body: { enabled: boolean; reason: string }) {
    return apiClient<{ success: boolean; data: unknown }>(`/api/admin/whatsapp/shops/${id}/ai`, 'PATCH', body, token());
  },
  patchShopOwnerBot(id: string, body: { enabled?: boolean; blocked?: boolean; revokeLinks?: boolean; reason: string }) {
    return apiClient<{ success: boolean; data: unknown }>(`/api/admin/whatsapp/shops/${id}/owner-bot`, 'PATCH', body, token());
  },
  batchPatchShopAi(ids: string[], enabled: boolean, reason: string) {
    return apiClient<{ success: boolean; data: { updated: number } }>('/api/admin/whatsapp/shops/batch/ai', 'POST', { ids, enabled, reason }, token());
  },
  batchPatchShopOwnerBot(ids: string[], patch: { enabled?: boolean; blocked?: boolean }, reason: string) {
    return apiClient<{ success: boolean; data: { updated: number } }>('/api/admin/whatsapp/shops/batch/owner-bot', 'POST', { ids, ...patch, reason }, token());
  },
  failedNotifications() {
    return apiClient<{ success: boolean; data: { deliveries: any[]; outbox: any[] } }>('/api/admin/whatsapp/notifications/failed', 'GET', undefined, token());
  },
  retryDelivery(id: string, reason: string) {
    return apiClient<{ success: boolean; data: unknown }>(`/api/admin/whatsapp/notifications/${id}/retry`, 'POST', { reason }, token());
  },
  retryOutbox(id: string, reason: string) {
    return apiClient<{ success: boolean; data: unknown }>(`/api/admin/whatsapp/outbox/${id}/retry`, 'POST', { reason }, token());
  },
  reconnect(id: string, reason: string) {
    return apiClient<{ success: boolean; data: unknown }>(`/api/admin/whatsapp/shops/${id}/instance/reconnect`, 'POST', { reason }, token());
  },
  logout(id: string, reason: string) {
    return apiClient<{ success: boolean; data: unknown }>(`/api/admin/whatsapp/shops/${id}/instance/logout`, 'POST', { reason }, token());
  },
  aiConversations(params?: { page?: number; limit?: number; barbershopId?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.barbershopId) qs.set('barbershopId', params.barbershopId);
    if (params?.status) qs.set('status', params.status);
    return apiClient<{ success: boolean; data: AiConversationSummary[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/admin/whatsapp/ai/conversations?${qs.toString()}`,
      'GET',
      undefined,
      token(),
    );
  },
  aiConversationDetail(id: string) {
    return apiClient<{ success: boolean; data: AiConversationDetail }>(`/api/admin/whatsapp/ai/conversations/${id}`, 'GET', undefined, token());
  },
  aiTransfer(id: string, reason: string) {
    return apiClient<{ success: boolean; data: unknown }>(`/api/admin/whatsapp/ai/conversations/${id}/transfer`, 'POST', { reason }, token());
  },
  ownerBotActionLogs(params?: { page?: number; limit?: number; barbershopId?: string; riskClass?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.barbershopId) qs.set('barbershopId', params.barbershopId);
    if (params?.riskClass) qs.set('riskClass', params.riskClass);
    if (params?.status) qs.set('status', params.status);
    return apiClient<{ success: boolean; data: OwnerBotActionLog[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/admin/whatsapp/owner-bot/action-logs?${qs.toString()}`,
      'GET',
      undefined,
      token(),
    );
  },
  queues() {
    return apiClient<{ success: boolean; data: { counts: Record<string, any>; failed: Record<string, any[]> } }>('/api/admin/whatsapp/queues', 'GET', undefined, token());
  },
  reprocessJob(queue: string, jobId: string, reason: string) {
    return apiClient<{ success: boolean; data: unknown }>(`/api/admin/whatsapp/queues/${queue}/${jobId}/reprocess`, 'POST', { reason }, token());
  },
  cleanJob(queue: string, jobId: string, reason: string) {
    return apiClient<{ success: boolean; data: unknown }>(`/api/admin/whatsapp/queues/${queue}/${jobId}/clean`, 'POST', { reason }, token());
  },
};
