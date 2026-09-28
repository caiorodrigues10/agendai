import { ClientPackageStatus } from '../types';

export const PACKAGE_STATUS_LABEL: Record<ClientPackageStatus | string, string> = {
  ACTIVE: 'Ativo',
  DEPLETED: 'Esgotado',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
};

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

export const APPOINTMENT_STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-support/15 text-support border border-support/30',
  COMPLETED: 'bg-success/15 text-success border border-success/30',
  CANCELLED: 'bg-danger/15 text-danger border border-danger/30',
  NO_SHOW: 'bg-surface-2 text-text-secondary border border-border',
};

export const CRM_SEGMENT_LABEL: Record<string, string> = {
  all: 'Todos',
  new: 'Novo',
  recurring: 'Recorrente',
  vip: 'VIP',
  at_risk: 'Em risco',
  inactive_30: 'Inativo 30d',
  inactive_60: 'Inativo 60d',
  inactive_90: 'Inativo 90d',
  debtors: 'Devedor',
  package_expiring: 'Pacote expirando',
  low_demand: 'Baixa demanda',
};

export const RISK_LABEL: Record<string, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
};
