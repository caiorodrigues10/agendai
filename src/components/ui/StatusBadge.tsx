import type { ReactNode } from 'react';
import { getStatusLabel } from '../../utils/statusLabels';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'border-border bg-surface-2 text-text-secondary',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-support/30 bg-support/10 text-support',
};

interface StatusBadgeProps {
  status: string | null | undefined;
  labels?: Record<string, string>;
  tone?: Tone;
  className?: string;
  children?: ReactNode;
}

export function StatusBadge({
  status,
  labels,
  tone = 'neutral',
  className = '',
  children,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children ?? (labels ? getStatusLabel(labels, status) : status || '—')}
    </span>
  );
}
