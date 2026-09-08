import { Loader2 } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { SectionError } from './SectionError';

interface DataTableStateProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
}

export function DataTableState({
  loading,
  error,
  isEmpty,
  emptyTitle = 'Nenhum item encontrado',
  emptyDescription,
  onRetry,
}: DataTableStateProps) {
  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-accent" aria-label="Carregando" />
      </div>
    );
  if (error) return <SectionError message={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return null;
}
