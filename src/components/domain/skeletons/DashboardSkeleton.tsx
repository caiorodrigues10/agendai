import React from 'react';
import { Skeleton, CardSkeleton, ListSkeleton, TableSkeleton } from '../../ui/skeletons';

/**
 * Skeleton da entrada do painel — estrutura neutra de cabeçalho,
 * navegação e conteúdo, sem dados pessoais.
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-bg" aria-hidden>
    {/* Header skeleton */}
    <div className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" width="2rem" height="2rem" />
          <Skeleton width="6rem" height="1rem" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="rounded" width="2rem" height="2rem" />
          <Skeleton variant="circle" width="2.25rem" height="2.25rem" />
        </div>
      </div>
    </div>

    {/* Nav tabs skeleton */}
    <div className="border-b border-border bg-surface/50">
      <div className="flex gap-1 px-4 py-2 overflow-x-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={`${4 + (i % 3)}rem`} height="2rem" />
        ))}
      </div>
    </div>

    {/* Content area */}
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} variant="stat" />
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <CardSkeleton />
          <TableSkeleton rows={4} cols={3} hasAvatar />
        </div>
        <div className="space-y-4">
          <CardSkeleton variant="avatar" />
          <CardSkeleton variant="avatar" />
          <ListSkeleton rows={3} hasAvatar />
        </div>
      </div>
    </div>
  </div>
);
