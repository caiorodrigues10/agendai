import React from 'react';
import { Skeleton } from './Skeleton';

export interface FormSkeletonProps {
  fields?: number;
  /** Se true, exibe botões de ação no final */
  hasActions?: boolean;
  /** Se true, exibe campo de upload */
  hasUpload?: boolean;
  className?: string;
}

/**
 * Skeleton de formulário — campos e ações.
 */
export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 4,
  hasActions = true,
  hasUpload = false,
  className = '',
}) => (
  <div className={`space-y-5 ${className}`} aria-hidden>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-1.5">
        <Skeleton width={`${30 + ((i * 11) % 20)}%`} height="0.75rem" />
        <Skeleton width="100%" height="2.5rem" variant="rounded" />
      </div>
    ))}
    {hasUpload && (
      <div className="space-y-1.5">
        <Skeleton width="35%" height="0.75rem" />
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border py-8">
          <Skeleton width="6rem" height="1rem" />
        </div>
      </div>
    )}
    {hasActions && (
      <div className="flex gap-2 pt-2">
        <Skeleton width="6rem" height="2.25rem" variant="rounded" />
        <Skeleton width="5rem" height="2.25rem" variant="rounded" />
      </div>
    )}
  </div>
);
