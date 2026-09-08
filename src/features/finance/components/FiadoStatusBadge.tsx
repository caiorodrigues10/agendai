import type { FiadoStatus } from '../../../infra/financialApi';
import { FIADO_STATUS_LABELS } from '../../../utils/statusLabels';

const classes: Record<FiadoStatus, string> = {
  PENDING: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  PARTIAL: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  PAID: 'border-green-500/20 bg-green-500/10 text-green-400',
  FORGIVEN: 'border-border bg-surface-2 text-text-muted',
};

interface FiadoStatusBadgeProps {
  status: FiadoStatus;
  isOverdue?: boolean;
}

export function FiadoStatusBadge({ status, isOverdue }: FiadoStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${classes[status]}`}
    >
      {FIADO_STATUS_LABELS[status]}
      {isOverdue && status !== 'PAID' && status !== 'FORGIVEN' ? (
        <span className="normal-case text-danger">· vencido</span>
      ) : null}
    </span>
  );
}
