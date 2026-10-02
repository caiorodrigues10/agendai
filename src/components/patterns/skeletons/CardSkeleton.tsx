import React from 'react';
import { Skeleton } from './Skeleton';

export interface CardSkeletonProps {
  /** Variante visual do card */
  variant?: 'default' | 'stat' | 'avatar' | 'compact';
  className?: string;
}

/**
 * Skeleton de card — composição reutilizável para cards do painel.
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'default',
  className = '',
}) => {
  if (variant === 'stat') {
    return (
      <div
        className={`rounded-xl border border-border bg-surface p-4 ${className}`}
        aria-hidden
      >
        <Skeleton width="40%" height="0.75rem" className="mb-2" />
        <Skeleton width="60%" height="1.75rem" className="mb-1" />
        <Skeleton width="50%" height="0.625rem" />
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border border-border bg-surface p-4 ${className}`}
        aria-hidden
      >
        <Skeleton variant="circle" width="2.75rem" height="2.75rem" />
        <div className="flex-1 space-y-1.5">
          <Skeleton width="65%" height="0.875rem" />
          <Skeleton width="45%" height="0.75rem" />
        </div>
        <Skeleton width="4rem" height="2rem" variant="rounded" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 ${className}`}
        aria-hidden
      >
        <div className="flex items-center gap-2.5">
          <Skeleton variant="circle" width="2rem" height="2rem" />
          <Skeleton width="8rem" height="0.875rem" />
        </div>
        <Skeleton width="3rem" height="1.5rem" variant="rounded" />
      </div>
    );
  }

  // default
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-5 space-y-3 ${className}`}
      aria-hidden
    >
      <div className="flex items-center justify-between">
        <Skeleton width="45%" height="1rem" />
        <Skeleton variant="circle" width="2rem" height="2rem" />
      </div>
      <Skeleton width="100%" height="0.75rem" />
      <Skeleton width="80%" height="0.75rem" />
      <div className="flex gap-2 pt-1">
        <Skeleton width="5rem" height="2rem" variant="rounded" />
        <Skeleton width="4rem" height="2rem" variant="rounded" />
      </div>
    </div>
  );
};
