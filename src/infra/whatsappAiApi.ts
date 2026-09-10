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

export interface IntentStats {
  total: number;
  byIntent: Record<string, number>;
  byHandledBy: Record<string, number>;
  avgConfidence: number;
}

type ProcessResult = { conversationId: string; message: AiMessage; intent: string; confidence: number; transferredToHuman: boolean };
type ListResult = { conversations: AiConversation[]; total: number; page: number; limit: number };
type DetailResult = AiConversation & { messages: AiMessage[] };
type LogsResult = { logs: AiIntentLog[]; total: number; page: number; limit: number };

export const whatsappAiApi = {
  processIncoming: (barbershopId: string, phone: string, content: string) =>
    apiClient<{ success: boolean; data: ProcessResult }>(
      `/api/barbershops/${barbershopId}/ai/process`,
      'POST',
      { phone, content },
      token()
    ).then(r => unwrap<ProcessResult>(r)),

  listConversations: (barbershopId: string, params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return apiClient<{ success: boolean; data: ListResult }>(
      `/api/barbershops/${barbershopId}/ai/conversations${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<ListResult>(r));
  },

  getConversationDetail: (barbershopId: string, conversationId: string) =>
    apiClient<{ success: boolean; data: DetailResult }>(
      `/api/barbershops/${barbershopId}/ai/conversations/${conversationId}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<DetailResult>(r)),

  getIntentLogs: (barbershopId: string, params?: { intent?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.intent) qs.set('intent', params.intent);
    if (params?.startDate) qs.set('startDate', params.startDate);
    if (params?.endDate) qs.set('endDate', params.endDate);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return apiClient<{ success: boolean; data: LogsResult }>(
      `/api/barbershops/${barbershopId}/ai/intent-logs${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<LogsResult>(r));
  },

  getStats: (barbershopId: string) =>
    apiClient<{ success: boolean; data: IntentStats }>(
      `/api/barbershops/${barbershopId}/ai/stats`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<IntentStats>(r)),

  transferToHuman: (barbershopId: string, conversationId: string) =>
    apiClient<{ success: boolean; data: AiConversation }>(
      `/api/barbershops/${barbershopId}/ai/conversations/${conversationId}/transfer`,
      'POST',
      undefined,
      token()
    ).then(r => unwrap<AiConversation>(r)),
};
