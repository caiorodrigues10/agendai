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
  CONFIRMED: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  COMPLETED: 'bg-green-500/15 text-green-400 border border-green-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 border border-red-500/30',
  NO_SHOW: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
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
