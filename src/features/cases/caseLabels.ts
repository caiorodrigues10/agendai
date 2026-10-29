import type {
  CaseDocumentType,
  CaseEventType,
  CaseTaskStatus,
  DeadlineStatus,
  DeadlineType,
} from '../../infra/casesApi';
import type { CasePriority, ClientCaseStatus } from '../../infra/clientsApi';

/**
 * Rótulos e cores da gestão de processos.
 *
 * Um único lugar por status/tipo: a UI e os relatórios usam a mesma
 * vocabulary do escritório.
 */

export const CASE_STATUS_LABELS: Record<ClientCaseStatus, string> = {
  LEAD: 'Consulta',
  ACTIVE: 'Em andamento',
  AWAITING_CLIENT: 'Aguardando cliente',
  IN_COURT: 'Em tribunal',
  SUSPENDED: 'Suspenso',
  CLOSED: 'Encerrado',
  ARCHIVED: 'Arquivado',
};

/** Ordem do pipeline exibida na faixa de etapas. */
export const CASE_STATUS_ORDER: ClientCaseStatus[] = [
  'LEAD',
  'ACTIVE',
  'AWAITING_CLIENT',
  'IN_COURT',
  'SUSPENDED',
  'CLOSED',
];

export const CASE_STATUS_BADGE: Record<ClientCaseStatus, string> = {
  LEAD: 'bg-surface-2 text-text-secondary',
  ACTIVE: 'bg-accent/15 text-accent',
  AWAITING_CLIENT: 'bg-warning/15 text-warning',
  IN_COURT: 'bg-info/15 text-info',
  SUSPENDED: 'bg-surface-2 text-text-muted',
  CLOSED: 'bg-success/15 text-success',
  ARCHIVED: 'bg-surface-2 text-text-muted',
};

export const CASE_PRIORITY_LABELS: Record<CasePriority, string> = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const CASE_PRIORITY_BADGE: Record<CasePriority, string> = {
  LOW: 'bg-surface-2 text-text-muted',
  NORMAL: 'bg-surface-2 text-text-secondary',
  HIGH: 'bg-warning/15 text-warning',
  URGENT: 'bg-danger/15 text-danger',
};

export const TASK_STATUS_LABELS: Record<CaseTaskStatus, string> = {
  OPEN: 'Aberta',
  DONE: 'Concluída',
  CANCELED: 'Cancelada',
};

export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  JUDICIAL_RESPONSE: 'Resposta judicial',
  HEARING: 'Audiência',
  APPEAL: 'Recurso',
  CONTRACTUAL: 'Contratual',
  INTERNAL: 'Interno',
};

export const DEADLINE_STATUS_LABELS: Record<DeadlineStatus, string> = {
  PENDING: 'Pendente',
  FULFILLED: 'Cumprido',
  MISSED: 'Descumprido',
  CANCELED: 'Cancelado',
};

export const CASE_EVENT_TYPE_LABELS: Record<CaseEventType, string> = {
  NOTE: 'Anotação',
  MEETING: 'Reunião',
  FILING: 'Distribuição',
  COURT_MOTION: 'Andamento judicial',
  DEADLINE: 'Prazo',
  INTIMATION: 'Intimação',
  PAYMENT: 'Pagamento',
  CLIENT_CONTACT: 'Contato com cliente',
};

export const CASE_DOCUMENT_TYPE_LABELS: Record<CaseDocumentType, string> = {
  CONTRACT: 'Contrato',
  PROCURACAO: 'Procuração',
  PETITION: 'Peça',
  EVIDENCE: 'Prova',
  COURT_DOCUMENT: 'Documento judicial',
  INTAKE: 'Termo de abertura',
  RECEIPT: 'Recibo',
  OTHER: 'Outro',
};

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
}

/** Texto do prazo: "vence hoje", "em 3 dias úteis", "atrasado há 2 dias". */
export function formatDaysRemaining(days: number | null | undefined): string {
  if (days === null || days === undefined) return '—';
  if (days === 0) return 'vence hoje';
  if (days < 0) return `atrasado há ${Math.abs(days)} dias`;
  return `em ${days} dia${days === 1 ? '' : 's'}`;
}
