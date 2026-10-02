import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { getStatusLabel } from '../../utils/statusLabels';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'border-border bg-surface-2 text-text-secondary',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  info: 'border-support/30 bg-support/10 text-support',
};

/**
 * Ícone único de todos os selos: 14px, `shrink-0` (nunca comprime no flex),
 * traço 2.25 e `aria-hidden` — o texto é o rótulo acessível.
 * Não usar margens/translate manuais para compensar alinhamento: o container
 * já é `items-center` + `leading-none`. Se um ícone específico ainda parecer
 * 1px fora, ajustar SÓ nele com `-translate-y-px` e comentar o motivo.
 */
const ICON_PROPS = {
  size: 14,
  strokeWidth: 2.25,
  className: 'shrink-0',
  'aria-hidden': true,
} as const;

interface StatusBadgeProps {
  /** Tom semântico (tokens do tema: claro/escuro). */
  tone?: Tone;
  /** Ícone decorativo à esquerda do texto (ex.: `AlertTriangle`). */
  icon?: IconType;
  /** Rótulo simples; ignorado quando `children` é passado. */
  status?: string | null | undefined;
  labels?: Record<string, string>;
  className?: string;
  children?: ReactNode;
}

export function StatusBadge({
  tone = 'neutral',
  icon: Icon,
  status,
  labels,
  className = '',
  children,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold leading-none whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon {...ICON_PROPS} />}
      {children ?? (labels ? getStatusLabel(labels, status) : status || '—')}
    </span>
  );
}
