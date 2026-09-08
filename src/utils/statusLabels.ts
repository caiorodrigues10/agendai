export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  CONFIRMED: 'Confirmado',
  RECEIVED: 'Recebido',
  FAILED: 'Falhou',
  REFUNDED: 'Estornado',
  CANCELED: 'Cancelado',
  EXPIRED: 'Expirado',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  TRIALING: 'Período de teste',
  PENDING: 'Pagamento pendente',
  ACTIVE: 'Ativa',
  CANCELED: 'Cancelada',
  PAST_DUE: 'Em atraso',
  UNPAID: 'Não paga',
};

export const FIADO_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PARTIAL: 'Parcial',
  PAID: 'Quitado',
  FORGIVEN: 'Perdoado',
};

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

export const NOTIFICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Em envio',
  SENT: 'Enviada',
  FAILED: 'Falhou',
  SKIPPED: 'Ignorada',
};

export const REFUND_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSED: 'Processado',
  FAILED: 'Falhou',
  CANCELED: 'Cancelado',
};

export function getStatusLabel(
  labels: Record<string, string>,
  status: string | null | undefined
): string {
  return status ? (labels[status] ?? status) : '—';
}
