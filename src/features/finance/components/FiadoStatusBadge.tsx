import type { FiadoStatus } from '../../../infra/financialApi';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { FIADO_STATUS_LABELS } from '../../../utils/statusLabels';

const TONES: Record<FiadoStatus, 'warning' | 'info' | 'success' | 'neutral'> = {
  PENDING: 'warning',
  PARTIAL: 'info',
  PAID: 'success',
  FORGIVEN: 'neutral',
};

interface FiadoStatusBadgeProps {
  status: FiadoStatus;
  isOverdue?: boolean;
}

export function FiadoStatusBadge({ status, isOverdue }: FiadoStatusBadgeProps) {
  return (
    <StatusBadge
      status={FIADO_STATUS_LABELS[status]}
      tone={TONES[status]}
      className="inline-flex items-center gap-1 text-[10px] font-bold! uppercase"
    >
      {FIADO_STATUS_LABELS[status]}
      {isOverdue && status !== 'PAID' && status !== 'FORGIVEN' ? (
        <span className="normal-case text-danger">· vencido</span>
      ) : null}
    </StatusBadge>
  );
}
