import React from 'react';
import { LuChevronRight as ChevronRight, LuSearch as Search } from 'react-icons/lu';
import type { CaseSummary } from '../../infra/casesApi';
import type { CasePriority, ClientCaseStatus } from '../../infra/clientsApi';
import { FIELD_CONTROL } from '../../components/ui/Field';
import {
  CASE_PRIORITY_BADGE,
  CASE_PRIORITY_LABELS,
  CASE_STATUS_BADGE,
  CASE_STATUS_LABELS,
} from './caseLabels';

interface CaseListSectionProps {
  cases: CaseSummary[];
  areas: string[];
  loading: boolean;
  status: ClientCaseStatus | '';
  priority: CasePriority | '';
  area: string;
  query: string;
  onStatusChange: (status: ClientCaseStatus | '') => void;
  onPriorityChange: (priority: CasePriority | '') => void;
  onAreaChange: (area: string) => void;
  onQueryChange: (query: string) => void;
  onSelect: (caseData: CaseSummary) => void;
}

/** Busca, filtros e lista de processos do escritório. */
export const CaseListSection: React.FC<CaseListSectionProps> = ({
  cases,
  areas,
  loading,
  status,
  priority,
  area,
  query,
  onStatusChange,
  onPriorityChange,
  onAreaChange,
  onQueryChange,
  onSelect,
}) => (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative flex-1 min-w-[12rem]">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <input
          className={`${FIELD_CONTROL} pl-8`}
          placeholder="Buscar por apelido, cliente ou número do processo"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          aria-label="Buscar processos"
        />
      </label>
      <select
        className={`${FIELD_CONTROL} w-auto`}
        value={status}
        onChange={event => onStatusChange(event.target.value as ClientCaseStatus | '')}
        aria-label="Filtrar por situação"
      >
        <option value="">Situação</option>
        {(Object.keys(CASE_STATUS_LABELS) as ClientCaseStatus[]).map(option => (
          <option key={option} value={option}>
            {CASE_STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      <select
        className={`${FIELD_CONTROL} w-auto`}
        value={priority}
        onChange={event => onPriorityChange(event.target.value as CasePriority | '')}
        aria-label="Filtrar por prioridade"
      >
        <option value="">Prioridade</option>
        {(Object.keys(CASE_PRIORITY_LABELS) as CasePriority[]).map(option => (
          <option key={option} value={option}>
            {CASE_PRIORITY_LABELS[option]}
          </option>
        ))}
      </select>
      {areas.length > 0 && (
        <select
          className={`${FIELD_CONTROL} w-auto`}
          value={area}
          onChange={event => onAreaChange(event.target.value)}
          aria-label="Filtrar por área de atuação"
        >
          <option value="">Área</option>
          {areas.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </div>

    {loading ? (
      <p className="rounded-xl border border-border bg-surface px-3 py-6 text-center text-xs text-text-muted">
        Carregando processos…
      </p>
    ) : cases.length === 0 ? (
      <p className="rounded-xl border border-border bg-surface px-3 py-6 text-center text-xs text-text-muted">
        Nenhum processo encontrado com os filtros atuais.
      </p>
    ) : (
      <ul className="space-y-2">
        {cases.map(item => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-accent/30"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-text-primary">
                  {item.title || item.nickname}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {[item.clientName, item.practiceArea, item.caseNumber].filter(Boolean).join(' · ')}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                  {item.pendingDeadlines > 0 && `${item.pendingDeadlines} prazo(s) pendente(s)`}
                  {item.pendingDeadlines > 0 && item.openTasks > 0 && ' · '}
                  {item.openTasks > 0 && `${item.openTasks} tarefa(s) aberta(s)`}
                  {item.responsibleName ? ` · ${item.responsibleName}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CASE_STATUS_BADGE[item.status]}`}
                >
                  {CASE_STATUS_LABELS[item.status]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CASE_PRIORITY_BADGE[item.priority]}`}
                >
                  {CASE_PRIORITY_LABELS[item.priority]}
                </span>
              </div>
              <ChevronRight size={16} className="shrink-0 text-text-muted" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);
