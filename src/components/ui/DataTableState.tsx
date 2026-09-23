import { LuLoaderCircle as Loader2 } from 'react-icons/lu';
import { EmptyState } from './EmptyState';
import { SectionError } from './SectionError';
import { TableSkeleton, TableSkeletonProps } from './TableSkeleton';

interface DataTableStateProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  /** Quando fornecido, exibe este skeleton em vez do spinner genérico. */
  skeleton?: React.ReactNode;
  /** Alternativa: gera TableSkeleton automaticamente com estas props. */
  skeletonProps?: TableSkeletonProps;
}

export function DataTableState({
  loading,
  error,
  isEmpty,
  emptyTitle = 'Nenhum item encontrado',
  emptyDescription,
  onRetry,
  skeleton,
  skeletonProps,
}: DataTableStateProps) {
  if (loading)
    return (
      <div className="py-4" aria-busy aria-live="polite">
        <span className="sr-only">Carregando</span>
        {skeleton ?? (
          skeletonProps ? (
            <TableSkeleton {...skeletonProps} />
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-accent" aria-label="Carregando" />
            </div>
          )
        )}
      </div>
    );
  if (error) return <SectionError message={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return null;
}
