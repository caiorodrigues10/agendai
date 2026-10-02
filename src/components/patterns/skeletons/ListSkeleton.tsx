import React from 'react';
import { Skeleton } from './Skeleton';

export interface ListSkeletonProps {
  rows?: number;
  /** Se true, cada linha tem avatar circular */
  hasAvatar?: boolean;
  /** Se true, cada linha tem ícone à esquerda */
  hasIcon?: boolean;
  /** Se true, exibe linha de ação à direita */
  hasAction?: boolean;
  className?: string;
}

/**
 * Skeleton de lista — items com texto e ações.
 */
export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  rows = 5,
  hasAvatar = false,
  hasIcon = false,
  hasAction = false,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`} aria-hidden>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
      >
        {hasAvatar && (
          <Skeleton variant="circle" width="2.25rem" height="2.25rem" />
        )}
        {hasIcon && !hasAvatar && (
          <Skeleton variant="rounded" width="2rem" height="2rem" />
        )}
        <div className="flex-1 space-y-1.5">
          <Skeleton width={`${55 + ((i * 13) % 30)}%`} height="0.875rem" />
          <Skeleton width={`${35 + ((i * 7) % 25)}%`} height="0.625rem" />
        </div>
        {hasAction && (
          <Skeleton width="4.5rem" height="2rem" variant="rounded" />
        )}
      </div>
    ))}
  </div>
);
