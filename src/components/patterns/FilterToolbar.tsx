import type { ReactNode } from 'react';

interface FilterToolbarProps {
  label: string;
  children: ReactNode;
  actions?: ReactNode;
  summary?: ReactNode;
  className?: string;
}

/** A labelled group, not an ARIA toolbar: native form keyboard behavior is retained. */
export function FilterToolbar({
  label,
  children,
  actions,
  summary,
  className = '',
}: FilterToolbarProps) {
  return (
    <section aria-label={label} className={`min-w-0 space-y-3 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
          {children}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {summary && (
        <div role="status" className="text-sm text-text-secondary">
          {summary}
        </div>
      )}
    </section>
  );
}
