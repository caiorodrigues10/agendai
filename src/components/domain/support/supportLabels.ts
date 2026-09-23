import type { SupportCategory, SupportPriority } from '../../../infra/supportApi';

export type SupportFormCategory =
  | 'BUG'
  | 'WRONG_DATA'
  | 'SUGGESTION'
  | 'QUESTION'
  | 'BILLING'
  | 'ACCESS'
  | 'SCHEDULE';

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  ERROR: 'Bug ou erro',
  SUGGESTION: 'Sugestão',
  FEEDBACK: 'Feedback',
  QUESTION: 'Dúvida',
  BILLING: 'Cobrança',
  ACCESS: 'Acesso',
  SCHEDULE: 'Agendamento',
};

export const SUPPORT_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em atendimento',
  WAITING_SHOP: 'Aguardando você',
  RESOLVED: 'Resolvido',
  CANCELLED: 'Cancelado',
};

export const SUPPORT_STATUS_COLORS: Record<string, string> = {
  OPEN: 'text-support bg-support/10',
  IN_PROGRESS: 'text-accent bg-accent/10',
  WAITING_SHOP: 'text-warning bg-warning/10',
  RESOLVED: 'text-success bg-success/10',
  CANCELLED: 'text-text-muted bg-surface-2',
};

export const SUPPORT_PRIORITY_LABELS: Record<SupportPriority, string> = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const SUPPORT_FORM_CATEGORIES: {
  value: SupportFormCategory;
  label: string;
  description: string;
  category: SupportCategory;
}[] = [
  { value: 'BUG', label: 'Bug ou erro', description: 'Algo travou ou não funcionou', category: 'ERROR' },
  { value: 'WRONG_DATA', label: 'Dado incorreto', description: 'Informação errada na tela', category: 'ERROR' },
  { value: 'SUGGESTION', label: 'Sugestão', description: 'Ideia para melhorar o sistema', category: 'SUGGESTION' },
  { value: 'QUESTION', label: 'Dúvida', description: 'Como usar algum recurso', category: 'QUESTION' },
  { value: 'BILLING', label: 'Cobrança', description: 'Pagamento ou plano', category: 'BILLING' },
  { value: 'ACCESS', label: 'Acesso', description: 'Login, senha ou permissão', category: 'ACCESS' },
  { value: 'SCHEDULE', label: 'Agendamento', description: 'Problemas na agenda', category: 'SCHEDULE' },
];

export function toSupportCategory(formCategory: SupportFormCategory): SupportCategory {
  return SUPPORT_FORM_CATEGORIES.find(option => option.value === formCategory)?.category ?? 'ERROR';
}
