interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  className = '',
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação" className={`flex items-center justify-between gap-3 ${className}`}>
      <button
        type="button"
        className="rounded-lg border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <span className="text-sm text-text-muted">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className="rounded-lg border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </button>
    </nav>
  );
}
