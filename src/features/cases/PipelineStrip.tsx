import React from 'react';
import type { ClientCaseStatus } from '../../infra/clientsApi';
import { CASE_STATUS_LABELS, CASE_STATUS_ORDER } from './caseLabels';

interface PipelineStripProps {
  counts: Record<string, number>;
  selected: ClientCaseStatus | '';
  onSelect: (status: ClientCaseStatus | '') => void;
}

/** Etapas do pipeline com a contagem de processos de cada situação. */
export const PipelineStrip: React.FC<PipelineStripProps> = ({ counts, selected, onSelect }) => (
  <section aria-label="Etapas do pipeline" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
    {CASE_STATUS_ORDER.map(status => {
      const active = selected === status;
      return (
        <button
          key={status}
          type="button"
          onClick={() => onSelect(active ? '' : status)}
          aria-pressed={active}
          className={`rounded-xl border px-3 py-2 text-left transition-colors ${
            active ? 'border-accent/40 bg-accent/10' : 'border-border bg-surface hover:border-accent/30'
          }`}
        >
          <p className="font-display text-xl font-bold text-text-primary">{counts[status] ?? 0}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
            {CASE_STATUS_LABELS[status]}
          </p>
        </button>
      );
    })}
  </section>
);
