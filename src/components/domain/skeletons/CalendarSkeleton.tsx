import React from 'react';
import { Skeleton, CardSkeleton } from '../../ui/skeletons';

/**
 * Skeleton da agenda — cabeçalho de data e grade de horários.
 */
export const CalendarSkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden>
    {/* Cabeçalho de navegação de data */}
    <div className="flex items-center justify-between">
      <Skeleton variant="rounded" width="8rem" height="2.25rem" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width="2rem" height="2rem" />
        <Skeleton variant="rounded" width="2rem" height="2rem" />
        <Skeleton variant="rounded" width="2rem" height="2rem" />
      </div>
    </div>
    {/* Grade semanal */}
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton width="100%" height="1.5rem" variant="rounded" />
          {Array.from({ length: 3 }).map((_, j) => (
            <Skeleton
              key={j}
              width="100%"
              height={`${2.5 + ((i + j) % 3) * 0.5}rem`}
              variant="rounded"
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);
