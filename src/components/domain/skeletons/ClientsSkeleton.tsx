import React from 'react';
import { Skeleton, TableSkeleton, CardSkeleton } from '../../ui/skeletons';

/**
 * Skeleton de clientes e equipe — linhas com avatar, texto e ações.
 */
export const ClientsSkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden>
    {/* Barra de busca e filtros */}
    <div className="flex items-center gap-3">
      <Skeleton variant="rounded" width="100%" height="2.5rem" />
      <Skeleton variant="rounded" width="6rem" height="2.5rem" />
      <Skeleton variant="rounded" width="5rem" height="2.5rem" />
    </div>
    {/* Tabela */}
    <div className="rounded-xl border border-border bg-surface p-4">
      <TableSkeleton rows={6} cols={5} hasAvatar hasActions />
    </div>
  </div>
);

/**
 * Skeleton de equipe — mesma estrutura, sem coluna de ações duplicada.
 */
export const TeamSkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden>
    <div className="flex items-center gap-3">
      <Skeleton variant="rounded" width="100%" height="2.5rem" />
      <Skeleton variant="rounded" width="7rem" height="2.5rem" />
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} variant="avatar" />
      ))}
    </div>
  </div>
);
