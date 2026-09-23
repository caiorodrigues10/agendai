import React from 'react';
import { Skeleton, SkeletonRegion } from '../../ui/Skeleton';

const StatCardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-border bg-surface p-3" aria-hidden>
    <Skeleton width="45%" height="0.625rem" className="mb-2" />
    <Skeleton width="65%" height="1.5rem" className="mb-1" />
    <Skeleton width="35%" height="0.5rem" />
  </div>
);

const DetailBlockSkeleton: React.FC = () => (
  <div className="rounded-xl border border-border bg-surface p-4 space-y-3" aria-hidden>
    <Skeleton width="40%" height="0.75rem" />
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton width="50%" height="0.75rem" />
        <Skeleton width="25%" height="0.75rem" />
      </div>
      <div className="flex justify-between">
        <Skeleton width="40%" height="0.75rem" />
        <Skeleton width="30%" height="0.75rem" />
      </div>
      <div className="flex justify-between">
        <Skeleton width="55%" height="0.75rem" />
        <Skeleton width="20%" height="0.75rem" />
      </div>
    </div>
  </div>
);

const CashSkeleton: React.FC = () => (
  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-3" aria-hidden>
    <div className="flex items-center justify-between">
      <Skeleton width="35%" height="0.75rem" />
      <Skeleton width="20%" height="1.75rem" variant="rounded" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Skeleton width="100%" height="2.5rem" variant="rounded" />
      <Skeleton width="100%" height="2.5rem" variant="rounded" />
    </div>
  </div>
);

export const FinanceResumoSkeleton: React.FC = () => (
  <SkeletonRegion loading label="Carregando resumo financeiro">
    <div className="space-y-4" aria-hidden>
      {/* 4 priority stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Caixa do dia */}
      <CashSkeleton />

      {/* Detail blocks */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DetailBlockSkeleton />
        <DetailBlockSkeleton />
        <DetailBlockSkeleton />
      </div>

      {/* Stock block */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-2" aria-hidden>
        <Skeleton width="30%" height="0.75rem" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton width="100%" height="2rem" variant="rounded" />
          <Skeleton width="100%" height="2rem" variant="rounded" />
          <Skeleton width="100%" height="2rem" variant="rounded" />
        </div>
      </div>
    </div>
  </SkeletonRegion>
);
