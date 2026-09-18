import React from 'react';
import { Skeleton, CardSkeleton } from '../../ui/skeletons';

/**
 * Skeleton do clima — 7 cards do tamanho dos definitivos,
 * sem inventar temperaturas ou condições.
 */
export const WeatherSkeleton: React.FC = () => (
  <div className="space-y-3" aria-hidden>
    <Skeleton width="45%" height="1rem" />
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-3"
        >
          <Skeleton width="2.5rem" height="0.625rem" />
          <Skeleton variant="circle" width="2.5rem" height="2.5rem" />
          <Skeleton width="2rem" height="1rem" />
          <Skeleton width="1.5rem" height="0.625rem" />
        </div>
      ))}
    </div>
  </div>
);
