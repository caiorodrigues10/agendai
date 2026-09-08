import { getStatusLabel } from '../../utils/statusLabels';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

const TONES: Record<Tone, string> = {
  neutral: 'border-border bg-surface-2 text-text-secondary',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
};

interface StatusBadgeProps {
  status: string | null | undefined;
  labels?: Record<string, string>;
  tone?: Tone;
  className?: string;
}

export function StatusBadge({
  status,
  labels,
  tone = 'neutral',
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {labels ? getStatusLabel(labels, status) : status || '—'}
    </span>
  );
}
