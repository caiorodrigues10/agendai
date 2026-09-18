import React from 'react';
import { Skeleton, CardSkeleton, ListSkeleton } from '../../ui/skeletons';

/**
 * Skeleton da aba Hoje — indicadores e lista dos próximos atendimentos.
 */
export const TodaySkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden>
    {/* Indicadores do dia */}
    <div className="grid grid-cols-3 gap-3">
      <CardSkeleton variant="stat" />
      <CardSkeleton variant="stat" />
      <CardSkeleton variant="stat" />
    </div>
    {/* Próximos atendimentos */}
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <Skeleton width="35%" height="1rem" />
      <ListSkeleton rows={4} hasAvatar hasAction />
    </div>
  </div>
);
