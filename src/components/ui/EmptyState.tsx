import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-border bg-surface-2 px-5 py-8 text-center ${className}`}
    >
      <p className="font-medium text-text-primary">{title}</p>
      {description ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
