import React from 'react';
import { LuTrendingDown, LuTrendingUp } from 'react-icons/lu';
import { Card } from './Card';

export interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  delta?: {
    label: React.ReactNode;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon,
  delta,
  className = '',
}) => (
  <Card className={`p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</span>
      {icon && <span className="rounded-lg bg-accent/10 p-2 text-accent">{icon}</span>}
    </div>
    <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
    {(delta || hint) && (
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {delta && (
          <span
            className={`inline-flex items-center gap-1 font-bold ${
              delta.direction === 'up'
                ? 'text-success'
                : delta.direction === 'down'
                  ? 'text-danger'
                  : 'text-text-muted'
            }`}
          >
            {delta.direction === 'up' ? (
              <LuTrendingUp size={14} aria-hidden="true" />
            ) : delta.direction === 'down' ? (
              <LuTrendingDown size={14} aria-hidden="true" />
            ) : null}
            {delta.label}
          </span>
        )}
        {hint && <span className="text-text-muted">{hint}</span>}
      </div>
    )}
  </Card>
);
