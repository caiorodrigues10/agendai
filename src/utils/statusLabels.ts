export const FIADO_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PARTIAL: 'Parcial',
  PAID: 'Quitado',
  FORGIVEN: 'Perdoado',
};

export function getStatusLabel(
  labels: Record<string, string>,
  status: string | null | undefined
): string {
  return status ? (labels[status] ?? status) : '—';
}
