import React from 'react';
import { Skeleton, CardSkeleton, ListSkeleton } from '../../ui/skeletons';

/**
 * Skeleton da fila — cards de atendimento com nome, serviço e ações.
 */
export const QueueSkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden>
    {/* Status da fila */}
    <div className="grid grid-cols-2 gap-3">
      <CardSkeleton variant="stat" />
      <CardSkeleton variant="stat" />
    </div>
    {/* Controles */}
    <div className="flex gap-2">
      <Skeleton variant="rounded" width="7rem" height="2.25rem" />
      <Skeleton variant="rounded" width="6rem" height="2.25rem" />
      <Skeleton variant="rounded" width="5rem" height="2.25rem" />
    </div>
    {/* Cards da fila */}
    <ListSkeleton rows={5} hasAvatar hasAction />
  </div>
);
