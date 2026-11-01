import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface AiConversation {
  id: string;
  barbershopId: string;
  phone: string;
  normalizedPhone: string;
  status: string;
  context: Record<string, unknown>;
  startedAt: string;
  lastMessageAt: string;
  endedAt: string | null;
  _count?: { messages: number };
}

export interface AiMessage {
  id: string;
  conversationId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  messageType: string;
  intent: string | null;
  entities: Record<string, unknown>;
  confidence: number | null;
  sentAt: string;
}

export interface AiIntentLog {
  id: string;
  barbershopId: string;
  phone: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  handledBy: string;
  resolution: string | null;
  loggedAt: string;
}

export interface AiIntentStats {
  total: number;
  byIntent: Record<string, number>;
  byHandledBy: Record<string, number>;
  avgConfidence: number;
}

export interface AiSettings {
  barbershopId: string;
  name: string;
  enabled: boolean;
  /** A instância Evolution da IA está configurada no backend? */
  aiInstanceConfigured: boolean;
}

export interface AiProcessResult {
  conversationId: string;
  message: AiMessage;
  intent: string;
  confidence: number;
  transferredToHuman: boolean;
  handledBy: 'AI' | 'HUMAN' | 'HYBRID';
  reply: string;
}

export interface AiConversationList {
  conversations: AiConversation[];
  total: number;
  page: number;
  limit: number;
}

export interface AiIntentLogList {
  logs: AiIntentLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AiConversationQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export interface AiIntentLogQuery {
  intent?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const AI_INTENT_LABELS: Record<string, string> = {
  scheduling: 'Agendamento',
  reschedule: 'Remarcação',
  pricing: 'Preço',
  hours: 'Horário',
  location: 'Localização',
  human_transfer: 'Transferência',
  greeting: 'Saudação',
  farewell: 'Despespedida',
  unknown: 'Não entendido',
};

export const AI_CONVERSATION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativa',
  TRANSFERRED_TO_HUMAN: 'Transferida',
  CLOSED: 'Fechada',
  EXPIRED: 'Expirada',
};

export const AI_HANDLED_BY_LABELS: Record<string, string> = {
  AI: 'Resposta automática',
  HUMAN: 'Atendente',
  HYBRID: 'Automático + atendente',
};

export function aiIntentLabel(intent: string): string {
  return AI_INTENT_LABELS[intent] ?? intent;
}

export function aiConversationStatusLabel(status: string): string {
  return AI_CONVERSATION_STATUS_LABELS[status] ?? status;
}

export function aiHandledByLabel(handledBy: string): string {
  return AI_HANDLED_BY_LABELS[handledBy] ?? handledBy;
}

export const whatsappAiApi = {
  getSettings: (barbershopId: string) =>
    apiClient<{ success: boolean; data: AiSettings }>(
      `/api/barbershops/${barbershopId}/ai/settings`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<AiSettings>(res)),

  updateSettings: (barbershopId: string, enabled: boolean) =>
    apiClient<{ success: boolean; data: AiSettings }>(
      `/api/barbershops/${barbershopId}/ai/settings`,
      'PUT',
      { enabled },
      token()
    ).then(res => unwrap<AiSettings>(res)),

  listConversations: (barbershopId: string, query: AiConversationQuery = {}) => {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    const search = params.toString();
    const qs = search ? `?${search}` : '';
    return apiClient<{ success: boolean; data: AiConversationList }>(
      `/api/barbershops/${barbershopId}/ai/conversations${qs}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<AiConversationList>(res));
  },

  getConversationDetail: (barbershopId: string, conversationId: string) =>
    apiClient<{ success: boolean; data: AiConversation & { messages: AiMessage[] } }>(
      `/api/barbershops/${barbershopId}/ai/conversations/${conversationId}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<AiConversation & { messages: AiMessage[] }>(res)),

  getIntentLogs: (barbershopId: string, query: AiIntentLogQuery = {}) => {
    const params = new URLSearchParams();
    if (query.intent) params.set('intent', query.intent);
    if (query.startDate) params.set('startDate', query.startDate);
    if (query.endDate) params.set('endDate', query.endDate);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    const search = params.toString();
    const qs = search ? `?${search}` : '';
    return apiClient<{ success: boolean; data: AiIntentLogList }>(
      `/api/barbershops/${barbershopId}/ai/intent-logs${qs}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<AiIntentLogList>(res));
  },

  getStats: (barbershopId: string) =>
    apiClient<{ success: boolean; data: AiIntentStats }>(
      `/api/barbershops/${barbershopId}/ai/stats`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<AiIntentStats>(res)),

  transferToHuman: (barbershopId: string, conversationId: string) =>
    apiClient<{ success: boolean; data: AiConversation }>(
      `/api/barbershops/${barbershopId}/ai/conversations/${conversationId}/transfer`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<AiConversation>(res)),

  /** Simula uma mensagem do cliente (não envia nada ao WhatsApp). */
  processIncoming: (barbershopId: string, phone: string, content: string) =>
    apiClient<{ success: boolean; data: AiProcessResult }>(
      `/api/barbershops/${barbershopId}/ai/process`,
      'POST',
      { phone, content },
      token()
    ).then(res => unwrap<AiProcessResult>(res)),
};
