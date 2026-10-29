import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuBriefcase as Briefcase,
  LuCalendarClock as CalendarClock,
  LuArrowRightLeft as ArrowRightLeft,
  LuPlus as Plus,
} from 'react-icons/lu';
import { casesApi, type CaseSummary, type PracticeAreaReportRow } from '../../infra/casesApi';
import type { CasePriority, ClientCaseStatus } from '../../infra/clientsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import type { StaffMember } from '../../types';
import { CaseDetail } from './CaseDetail';
import { CaseListSection } from './CaseListSection';
import { DeadlinePanel } from './DeadlinePanel';
import { NewCaseDialog } from './NewCaseDialog';
import { PipelineStrip } from './PipelineStrip';
import { CaseTransfersPanel } from './CaseTransfersPanel';
import { formatCurrency } from './caseLabels';

type HubView = 'cases' | 'deadlines' | 'transfers';

interface CasesHubProps {
  staff?: StaffMember[];
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

/**
 * Gestão de processos do escritório (segmento LAW_FIRM).
 *
 * Duas visões: o pipeline de processos e o calendário de prazos do
 * escritório. Tudo é interno — nada aqui aparece para o cliente.
 */
export const CasesHub: React.FC<CasesHubProps> = ({ staff = [], onNotify }) => {
  const [view, setView] = useState<HubView>('cases');
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [report, setReport] = useState<PracticeAreaReportRow[]>([]);
  const [selected, setSelected] = useState<CaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClientCaseStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | ''>('');
  const [areaFilter, setAreaFilter] = useState('');
  const [query, setQuery] = useState('');
  const [showNewCase, setShowNewCase] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, counts, areas] = await Promise.all([
        casesApi.list({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          practiceArea: areaFilter || undefined,
          q: query.trim() || undefined,
          limit: 100,
        }),
        casesApi.pipeline(),
        casesApi.practiceAreaReport(),
      ]);
      setCases(list);
      setPipeline(counts);
      setReport(areas);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, areaFilter, query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial do pipeline
    void load();
  }, [load]);

  const areas = useMemo(
    () => report.map(row => row.practiceArea).filter(Boolean),
    [report]
  );

  const refreshDetail = useCallback(async () => {
    if (!selected) return;
    try {
      const updated = await casesApi.get(selected.id);
      setSelected(updated);
      setPipeline(await casesApi.pipeline());
    } catch {
      /* mantém a tela anterior */
    }
  }, [selected]);

  if (selected) {
    return (
      <CaseDetail
        caseData={selected}
        staff={staff}
        onBack={() => {
          setSelected(null);
          void load();
        }}
        onChanged={refreshDetail}
        onNotify={onNotify}
      />
    );
  }

  return (
    <div className="space-y-5">
      <CasesHubHeader view={view} onViewChange={setView} onNewCase={() => setShowNewCase(true)} />

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}

      {view === 'transfers' ? (
        <CaseTransfersPanel onNotify={onNotify} />
      ) : view === 'cases' ? (
        <>
          <PipelineStrip
            counts={pipeline}
            selected={statusFilter}
            onSelect={setStatusFilter}
          />

          <section className="grid gap-3 lg:grid-cols-[1fr_18rem]">
            <CaseListSection
              cases={cases}
              areas={areas}
              loading={loading}
              status={statusFilter}
              priority={priorityFilter}
              area={areaFilter}
              query={query}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onAreaChange={setAreaFilter}
              onQueryChange={setQuery}
              onSelect={setSelected}
            />

            <aside aria-label="Resumo por área de atuação" className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Por área de atuação
              </p>
              {report.length === 0 ? (
                <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
                  Sem dados de área ainda.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {report.map(row => (
                    <li key={row.practiceArea} className="rounded-xl border border-border bg-surface px-3 py-2">
                      <p className="text-xs font-bold text-text-primary">{row.practiceArea}</p>
                      <p className="text-[11px] text-text-muted">
                        {row.total} processo(s) · {row.active} ativo(s)
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        causa {formatCurrency(row.claimed)} · honorários {formatCurrency(row.revenue)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </section>
        </>
      ) : (
        <DeadlinePanel onNotify={onNotify} onChanged={load} />
      )}

      {showNewCase && (
        <NewCaseDialog
          practiceAreas={areas}
          onClose={() => setShowNewCase(false)}
          onCreated={async () => {
            setShowNewCase(false);
            await load();
            onNotify?.('Processo criado.');
          }}
        />
      )}
    </div>
  );
};

interface CasesHubHeaderProps {
  view: HubView;
  onViewChange: (view: HubView) => void;
  onNewCase: () => void;
}

const CasesHubHeader: React.FC<CasesHubHeaderProps> = ({ view, onViewChange, onNewCase }) => (
  <header className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="font-display text-lg font-bold tracking-wide text-text-primary">
        Gestão de processos
      </h2>
      <p className="text-xs text-text-muted">
        Pipeline, prazos e andamentos do escritório (uso interno).
      </p>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex rounded-xl border border-border bg-surface p-0.5">
        <button
          type="button"
          onClick={() => onViewChange('cases')}
          aria-pressed={view === 'cases'}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            view === 'cases' ? 'bg-accent text-accent-fg' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Briefcase size={13} /> Processos
        </button>
        <button
          type="button"
          onClick={() => onViewChange('deadlines')}
          aria-pressed={view === 'deadlines'}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            view === 'deadlines' ? 'bg-accent text-accent-fg' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <CalendarClock size={13} /> Prazos
        </button>
        <button
          type="button"
          onClick={() => onViewChange('transfers')}
          aria-pressed={view === 'transfers'}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            view === 'transfers' ? 'bg-accent text-accent-fg' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <ArrowRightLeft size={13} /> Transferências
        </button>
      </div>
      <button
        type="button"
        onClick={onNewCase}
        className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg"
      >
        <Plus size={14} /> Novo processo
      </button>
    </div>
  </header>
);
