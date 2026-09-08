import type { ReactNode } from 'react';

interface FinanceSummaryCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: 'positive' | 'negative';
  isCount?: boolean;
}

export function FinanceSummaryCard({
  icon,
  label,
  value,
  hint,
  tone,
  isCount,
}: FinanceSummaryCardProps) {
  const valueClass =
    tone === 'positive'
      ? 'text-success'
      : tone === 'negative'
        ? 'text-danger'
        : isCount
          ? 'text-text-primary'
          : 'text-accent';

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-3 shadow-lg">
      <div className="absolute -right-2 -top-2 text-border opacity-20">{icon}</div>
      <p className="mb-1 text-xs font-bold uppercase text-text-muted">{label}</p>
      <h3 className={`truncate text-lg font-bold sm:text-xl ${valueClass}`}>{value}</h3>
      {hint ? <p className="mt-1 text-[10px] text-text-muted">{hint}</p> : null}
    </div>
  );
}
