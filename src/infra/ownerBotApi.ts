import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface OwnerBotLinkCode {
  code: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface OwnerBotActionEntry {
  id: string;
  action: string;
  status: string;
  createdAt: string;
}

export interface OwnerBotStatus {
  linked: boolean;
  phoneMasked: string | null;
  linkedAt: string | null;
  /** Número do bot da plataforma (dígitos, com DDI) — usado no link wa.me. */
  botPhone: string | null;
  shopPhoneMasked: string | null;
  highlights: string[];
  recentActions: OwnerBotActionEntry[];
}

const ACTION_LABELS: Record<string, string> = {
  LINK: 'Vínculo criado',
  UNLINK: 'Vínculo removido',
  SCHEDULE: 'Agendamento criado',
  CANCEL: 'Agendamento cancelado',
  RESCHEDULE: 'Agendamento remarcado',
  CHECK_IN: 'Check-in',
  COMPLETE: 'Atendimento encerrado',
  NO_SHOW: 'Falta registrada',
  WALK_IN: 'Encaixe na fila',
  UNDO: 'Ação desfeita',
  BLOCK: 'Assistente bloqueado',
  UNBLOCK: 'Assistente desbloqueado',
  CREATE_EXPENSE: 'Despesa registrada',
  CREATE_SALE: 'Venda registrada',
  PAYMENT_RECEIVED: 'Pagamento registrado',
  STOCK_ADJUST: 'Estoque ajustado',
  CAMPAIGN_SEND: 'Campanha enviada',
};

export function ownerBotActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export interface OwnerBotPreferences {
  enabled: boolean;
  blocked: boolean;
  briefingEnabled: boolean;
  briefingTime: string;
  summaryEnabled: boolean;
  summaryTime: string;
  alertsEnabled: boolean;
  alertTypes: string[];
  tone: 'FRIENDLY' | 'FORMAL';
  language: string;
}

export type OwnerBotAlertType =
  | 'CLIENT_LATE'
  | 'FREE_SLOT'
  | 'CANCELLATION'
  | 'LOW_STOCK'
  | 'GOAL_RISK'
  | 'PAYMENT_DUE'
  | 'INSTANCE_OFFLINE';

export const OWNER_BOT_ALERT_TYPES: OwnerBotAlertType[] = [
  'CLIENT_LATE',
  'FREE_SLOT',
  'CANCELLATION',
  'LOW_STOCK',
  'GOAL_RISK',
  'PAYMENT_DUE',
  'INSTANCE_OFFLINE',
];

export const OWNER_BOT_ALERT_LABELS: Record<OwnerBotAlertType, string> = {
  CLIENT_LATE: 'cliente atrasado',
  FREE_SLOT: 'horário vago nas próximas 2h',
  CANCELLATION: 'cancelamento de última hora',
  LOW_STOCK: 'estoque baixo',
  GOAL_RISK: 'meta em risco',
  PAYMENT_DUE: 'pagamento ou assinatura pendente',
  INSTANCE_OFFLINE: 'WhatsApp do salão desconectado',
};

export interface OwnerBotCatalogCommand {
  id: string;
  category: string;
  categoryLabel: string;
  risk: 'READ' | 'WRITE' | 'SENSITIVE';
  riskLabel: string;
  description: string;
  examples: string[];
}

export interface OwnerBotCatalogCategory {
  id: string;
  label: string;
  commands: OwnerBotCatalogCommand[];
}

export interface OwnerBotCatalog {
  categories: OwnerBotCatalogCategory[];
  total: number;
}

export interface OwnerBotActionLogEntry {
  id: string;
  action: string;
  commandId: string | null;
  riskClass: string | null;
  status: string;
  phoneMasked: string | null;
  canUndo: boolean;
  undoneAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface OwnerBotActionLogQuery {
  limit?: number;
  from?: string;
  to?: string;
  commandId?: string;
  riskClass?: 'READ' | 'WRITE' | 'SENSITIVE';
  status?: 'SUCCESS' | 'ERROR' | 'NEEDS_CONFIRMATION' | 'BLOCKED';
}

export type OwnerBotPreferencesPatch = Partial<OwnerBotPreferences>;

export const ownerBotApi = {
  getStatus: (barbershopId: string) =>
    apiClient<{ success: boolean; data: OwnerBotStatus }>(
      `/api/barbershops/${barbershopId}/owner-bot/status`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<OwnerBotStatus>(res)),

  createLinkCode: (barbershopId: string) =>
    apiClient<{ success: boolean; data: OwnerBotLinkCode }>(
      `/api/barbershops/${barbershopId}/owner-bot/link-code`,
      'POST',
      {},
      token()
    ).then(res => unwrap<OwnerBotLinkCode>(res)),

  unlink: (barbershopId: string) =>
    apiClient<{ success: boolean; data: { linked: boolean } }>(
      `/api/barbershops/${barbershopId}/owner-bot/link`,
      'DELETE',
      undefined,
      token()
    ).then(res => unwrap<{ linked: boolean }>(res)),

  getPreferences: (barbershopId: string) =>
    apiClient<{ success: boolean; data: OwnerBotPreferences }>(
      `/api/barbershops/${barbershopId}/owner-bot/preferences`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<OwnerBotPreferences>(res)),

  updatePreferences: (barbershopId: string, patch: OwnerBotPreferencesPatch) =>
    apiClient<{ success: boolean; data: OwnerBotPreferences }>(
      `/api/barbershops/${barbershopId}/owner-bot/preferences`,
      'PUT',
      patch,
      token()
    ).then(res => unwrap<OwnerBotPreferences>(res)),

  getCatalog: (barbershopId: string) =>
    apiClient<{ success: boolean; data: OwnerBotCatalog }>(
      `/api/barbershops/${barbershopId}/owner-bot/catalog`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<OwnerBotCatalog>(res)),

  getActionLogs: (barbershopId: string, query: OwnerBotActionLogQuery = {}) => {
    const params = new URLSearchParams();
    if (query.limit) params.set('limit', String(query.limit));
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.commandId) params.set('commandId', query.commandId);
    if (query.riskClass) params.set('riskClass', query.riskClass);
    if (query.status) params.set('status', query.status);
    const search = params.toString();
    const qs = search ? `?${search}` : '';
    return apiClient<{ success: boolean; data: OwnerBotActionLogEntry[] }>(
      `/api/barbershops/${barbershopId}/owner-bot/action-logs${qs}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<OwnerBotActionLogEntry[]>(res));
  },
};
