import React from 'react';
import { Skeleton, CardSkeleton, TableSkeleton } from '../../ui/skeletons';

/**
 * Skeleton financeiro — resumos e tabela de movimentações.
 */
export const FinancialSkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden>
    {/* KPIs */}
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} variant="stat" />
      ))}
    </div>
    {/* Gráfico placeholder */}
    <div className="rounded-xl border border-border bg-surface p-5">
      <Skeleton width="30%" height="1rem" className="mb-4" />
      <div className="flex items-end gap-2" style={{ height: '10rem' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width="100%"
            height={`${30 + ((i * 17) % 60)}%`}
          />
        ))}
      </div>
    </div>
    {/* Tabela de transações */}
    <div className="rounded-xl border border-border bg-surface p-4">
      <TableSkeleton rows={5} cols={5} hasActions />
    </div>
  </div>
);

/**
 * Skeleton de relatórios — indicadores, espaço de gráfico e tabelas.
 */
export const ReportsSkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden>
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} variant="stat" />
      ))}
    </div>
    {/* Área de gráfico */}
    <div className="rounded-xl border border-border bg-surface p-5">
      <Skeleton width="40%" height="1rem" className="mb-3" />
      <Skeleton width="100%" height="14rem" variant="rounded" />
    </div>
    <div className="rounded-xl border border-border bg-surface p-4">
      <TableSkeleton rows={4} cols={4} />
    </div>
  </div>
);
