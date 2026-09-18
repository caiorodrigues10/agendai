import React from 'react';
import { Skeleton } from './Skeleton';

export interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  /** Altura de cada linha */
  rowHeight?: string;
  /** Se true, a primeira célula de cada linha é circular (avatar) */
  hasAvatar?: boolean;
  /** Se true, a última coluna tem botões de ação */
  hasActions?: boolean;
  className?: string;
}

/**
 * Skeleton de tabela — linhas e colunas compatíveis com DataTable.
 * Usa <table> semântico para comunicação acessível correta.
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  cols = 4,
  rowHeight = '2.75rem',
  hasAvatar = false,
  hasActions = false,
  className = '',
}) => (
  <div className={`overflow-x-auto ${className}`} aria-hidden>
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, ci) => (
            <th key={ci} className="px-3 py-2 text-left">
              <Skeleton width="60%" height="0.875rem" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, ri) => (
          <tr key={ri} className="border-t border-border">
            {Array.from({ length: cols }).map((_, ci) => (
              <td key={ci} className="px-3 py-2" style={{ height: rowHeight }}>
                {hasAvatar && ci === 0 ? (
                  <div className="flex items-center gap-2">
                    <Skeleton variant="circle" width="2rem" height="2rem" />
                    <Skeleton width="70%" height="0.875rem" />
                  </div>
                ) : hasActions && ci === cols - 1 ? (
                  <div className="flex gap-1.5">
                    <Skeleton width="2rem" height="2rem" variant="rounded" />
                    <Skeleton width="2rem" height="2rem" variant="rounded" />
                  </div>
                ) : (
                  <Skeleton
                    width={ci === 0 ? '55%' : `${60 + ((ci * 17) % 30)}%`}
                    height="0.875rem"
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
