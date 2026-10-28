import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

/** Shared hierarchy for task headings; actions wrap without squeezing the title. */
export function PageHeader({
  title,
  description,
  actions,
  as: Heading = 'h2',
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="min-w-0 space-y-1">
        <Heading className="text-xl font-bold tracking-tight text-text-primary [overflow-wrap:anywhere]">
          {title}
        </Heading>
        {description && (
          <div className="max-w-prose text-sm leading-relaxed text-text-secondary">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>}
    </div>
  );
}
