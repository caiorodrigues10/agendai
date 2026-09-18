import React from 'react';
import { Skeleton, CardSkeleton, ListSkeleton } from '../../ui/skeletons';

/**
 * Skeleton de página pública do salão — perfil, serviços, agendamento e showcase.
 */
export const PublicPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-bg" aria-hidden>
    {/* Hero */}
    <div className="relative h-48 w-full overflow-hidden bg-surface">
      <Skeleton className="h-full w-full" />
    </div>

    {/* Perfil */}
    <div className="mx-auto max-w-3xl px-4 -mt-10">
      <div className="flex items-end gap-4">
        <Skeleton variant="circle" width="5rem" height="5rem" className="border-4 border-bg" />
        <div className="flex-1 space-y-2 pb-2">
          <Skeleton width="12rem" height="1.25rem" />
          <Skeleton width="8rem" height="0.875rem" />
        </div>
      </div>
    </div>

    {/* Conteúdo */}
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Serviços */}
      <div className="space-y-3">
        <Skeleton width="30%" height="1rem" />
        <ListSkeleton rows={4} hasIcon hasAction />
      </div>

      {/* Agendamento */}
      <CardSkeleton />

      {/* Showcase */}
      <div className="space-y-3">
        <Skeleton width="25%" height="1rem" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-3 space-y-2">
              <Skeleton width="100%" height="6rem" variant="rounded" />
              <Skeleton width="70%" height="0.875rem" />
              <Skeleton width="40%" height="0.75rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
