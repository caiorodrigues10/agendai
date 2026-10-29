import React, { useCallback, useEffect, useState } from 'react';
import { LuArrowLeft as ArrowLeft, LuArrowRightLeft as ArrowRightLeft } from 'react-icons/lu';
import {
  casesApi,
  type CaseContract,
  type CaseDeadline,
  type CaseDocument,
  type CaseEvent,
  type CaseFeeInvoice,
  type CaseOverview,
  type CaseSuccessFee,
  type CaseTask,
  type CaseTimeEntry,
  type CourtIntimation,
  type TimeEntrySummary,
} from '../../infra/casesApi';
import { clientsApi, type CasePriority, type ClientCaseStatus } from '../../infra/clientsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import type { StaffMember } from '../../types';
import { CaseDeadlinesTab } from './CaseDeadlinesTab';
import { CaseDocumentsTab } from './CaseDocumentsTab';
import { CaseEventsTab } from './CaseEventsTab';
import { CaseTasksTab } from './CaseTasksTab';
import { CaseContractsTab } from './CaseContractsTab';
import { CaseTimeEntriesTab } from './CaseTimeEntriesTab';
import { CaseIntimationsTab } from './CaseIntimationsTab';
import { CaseBillingTab } from './CaseBillingTab';
import { TransferCaseDialog } from './CaseTransfersPanel';
import { CaseSharingPanel } from './CaseSharingPanel';
import {
  CASE_PRIORITY_BADGE,
  CASE_PRIORITY_LABELS,
  CASE_STATUS_BADGE,
  CASE_STATUS_LABELS,
  formatCurrency,
  formatDate,
  formatDaysRemaining,
} from './caseLabels';

type DetailTab =
  | 'overview'
  | 'tasks'
  | 'deadlines'
  | 'events'
  | 'documents'
  | 'contracts'
  | 'time'
  | 'intimations'
  | 'billing';

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'tasks', label: 'Tarefas' },
  { id: 'deadlines', label: 'Prazos' },
  { id: 'events', label: 'Andamentos' },
  { id: 'documents', label: 'Documentos' },
  { id: 'contracts', label: 'Contratos' },
  { id: 'time', label: 'Horas' },
  { id: 'intimations', label: 'Intimações' },
  { id: 'billing', label: 'Honorários e NFS-e' },
];

interface CaseDetailProps {
  caseData: {
    id: string;
    clientId: string;
    clientName: string;
    nickname: string;
    title: string | null;
    status: ClientCaseStatus;
    priority: CasePriority;
    practiceArea: string | null;
    caseNumber: string | null;
    courtName: string | null;
    opponent: string | null;
    claimedAmount: number | null;
    awardedAmount: number | null;
    responsibleStaffId: string | null;
    responsibleName: string | null;
    openedAt: string;
  };
  staff?: StaffMember[];
  onBack: () => void;
  onChanged?: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

/** Detalhe do processo: visão geral, tarefas, prazos, andamentos, documentos e financeiro. */
export const CaseDetail: React.FC<CaseDetailProps> = ({
  caseData,
  staff = [],
  onBack,
  onChanged,
  onNotify,
}) => {
  const [tab, setTab] = useState<DetailTab>('overview');
  const [overview, setOverview] = useState<CaseOverview | null>(null);
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [deadlines, setDeadlines] = useState<CaseDeadline[]>([]);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [contracts, setContracts] = useState<CaseContract[]>([]);
  const [timeEntries, setTimeEntries] = useState<CaseTimeEntry[]>([]);
  const [timeSummary, setTimeSummary] = useState<TimeEntrySummary | null>(null);
  const [intimations, setIntimations] = useState<CourtIntimation[]>([]);
  const [successFees, setSuccessFees] = useState<CaseSuccessFee[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<CaseFeeInvoice[]>([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        summary,
        taskList,
        deadlineList,
        eventList,
        documentList,
        contractList,
        entryList,
        entrySummary,
        intimationList,
        feeList,
        invoiceList,
      ] = await Promise.all([
        casesApi.overview(caseData.id),
        casesApi.listTasks(caseData.id),
        casesApi.listDeadlines({ caseId: caseData.id }),
        casesApi.listEvents(caseData.id),
        casesApi.listDocuments(caseData.id),
        casesApi.listContracts({ caseId: caseData.id }),
        casesApi.listTimeEntries({ caseId: caseData.id }),
        casesApi.timeEntrySummary(caseData.id),
        casesApi.listIntimations({ caseId: caseData.id }),
        casesApi.listSuccessFees({ caseId: caseData.id }),
        casesApi.listFeeInvoices({ caseId: caseData.id }),
      ]);
      setOverview(summary);
      setTasks(taskList);
      setDeadlines(deadlineList);
      setEvents(eventList);
      setDocuments(documentList);
      setContracts(contractList);
      setTimeEntries(entryList);
      setTimeSummary(entrySummary);
      setIntimations(intimationList);
      setSuccessFees(feeList);
      setFeeInvoices(invoiceList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [caseData.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial do detalhe
    void load();
  }, [load]);

  const updateCase = async (body: Record<string, unknown>) => {
    try {
      await clientsApi.updateCase(caseData.clientId, caseData.id, body);
      await load();
      await onChanged?.();
      onNotify?.('Processo atualizado.');
    } catch (err) {
      setError(getErrorMessage(err));
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-4">
      <CaseDetailHeader
        caseData={caseData}
        onBack={onBack}
        onTransfer={() => setShowTransfer(true)}
      />

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}

      <CaseClassificationFields
        caseData={caseData}
        staff={staff}
        onUpdate={updateCase}
      />

      <nav aria-label="Abas do processo" className="flex flex-wrap gap-1 border-b border-border pb-2">
        {TABS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? 'page' : undefined}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              tab === item.id ? 'bg-accent/15 text-accent' : 'text-text-muted hover:bg-text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-6 text-center text-xs text-text-muted">
          Carregando processo…
        </p>
      ) : (
        <>
          {tab === 'overview' && overview && (
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Tarefas abertas" value={String(overview.tasks.open)} hint={`${overview.tasks.done} concluída(s)`} />
              <StatCard label="Prazos pendentes" value={String(overview.deadlines.pending)} hint={`${overview.deadlines.overdue} em atraso`} />
              <StatCard label="Documentos" value={String(overview.documents)} hint={`${overview.events} andamento(s)`} />
              <StatCard
                label="Próximo prazo"
                value={overview.deadlines.next ? formatDate(overview.deadlines.next.dueDate) : '—'}
                hint={overview.deadlines.next ? formatDaysRemaining(overview.deadlines.next.daysRemaining) : 'nenhum prazo'}
              />
              <CaseDataSummary caseData={caseData} />
              <CaseSharingPanel caseData={caseData} onChanged={load} onNotify={onNotify} />
            </section>
          )}

          {tab === 'tasks' && (
            <CaseTasksTab
              caseId={caseData.id}
              tasks={tasks}
              staff={staff}
              onChanged={load}
              onNotify={onNotify}
            />
          )}

          {tab === 'deadlines' && (
            <CaseDeadlinesTab
              caseId={caseData.id}
              deadlines={deadlines}
              onChanged={load}
              onNotify={onNotify}
            />
          )}

          {tab === 'events' && (
            <CaseEventsTab
              caseId={caseData.id}
              events={events}
              onChanged={load}
              onNotify={onNotify}
            />
          )}

          {tab === 'documents' && (
            <CaseDocumentsTab
              caseId={caseData.id}
              documents={documents}
              onChanged={load}
              onNotify={onNotify}
            />
          )}

          {tab === 'contracts' && (
            <CaseContractsTab
              caseId={caseData.id}
              contracts={contracts}
              onChanged={load}
              onNotify={onNotify}
            />
          )}

          {tab === 'time' && (
            <CaseTimeEntriesTab
              caseId={caseData.id}
              entries={timeEntries}
              summary={timeSummary}
              staff={staff}
              onChanged={load}
              onNotify={onNotify}
            />
          )}

          {tab === 'intimations' && (
            <CaseIntimationsTab
              caseId={caseData.id}
              intimations={intimations}
              onChanged={load}
              onNotify={onNotify}
            />
          )}

          {showTransfer && (
            <TransferCaseDialog
              caseId={caseData.id}
              onClose={() => setShowTransfer(false)}
              onDone={load}
              onNotify={onNotify}
            />
          )}

          {tab === 'billing' && overview && (
            <section className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard label="Honorários recebidos" value={formatCurrency(overview.revenue)} hint={`${overview.completedAppointments} atendimento(s) concluído(s)`} />
                <StatCard label="Saldo em aberto" value={formatCurrency(overview.outstanding)} hint="fiado do cliente" />
                <StatCard label="Valor da causa" value={formatCurrency(caseData.claimedAmount)} hint={`obtido: ${formatCurrency(caseData.awardedAmount)}`} />
              </div>
              <CaseBillingTab
                caseId={caseData.id}
                clientId={caseData.clientId}
                successFees={successFees}
                invoices={feeInvoices}
                onChanged={load}
                onNotify={onNotify}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
};

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
      <p className="font-display text-lg font-bold text-text-primary">{value}</p>
      {hint && <p className="text-[11px] text-text-muted">{hint}</p>}
    </div>
  );
}

interface CaseDetailHeaderProps {
  caseData: CaseDetailProps['caseData'];
  onBack: () => void;
  onTransfer?: () => void;
}

const CaseDetailHeader: React.FC<CaseDetailHeaderProps> = ({ caseData, onBack, onTransfer }) => (
  <header className="space-y-2">
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1 text-xs font-bold text-text-muted hover:text-text-primary"
    >
      <ArrowLeft size={14} /> Processos
    </button>
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="font-display text-lg font-bold tracking-wide text-text-primary">
        {caseData.title || caseData.nickname}
      </h2>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CASE_STATUS_BADGE[caseData.status]}`}>
        {CASE_STATUS_LABELS[caseData.status]}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CASE_PRIORITY_BADGE[caseData.priority]}`}>
        {CASE_PRIORITY_LABELS[caseData.priority]}
      </span>
    </div>
    <p className="text-xs text-text-muted">
      {[caseData.clientName, caseData.practiceArea, caseData.caseNumber, caseData.courtName]
        .filter(Boolean)
        .join(' · ')}
    </p>
    {onTransfer && (
      <button
        type="button"
        onClick={onTransfer}
        className="mt-1 inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-muted hover:text-text-primary"
      >
        <ArrowRightLeft size={12} /> Transferir para outra unidade
      </button>
    )}
  </header>
);

interface CaseClassificationFieldsProps {
  caseData: CaseDetailProps['caseData'];
  staff: StaffMember[];
  onUpdate: (body: Record<string, unknown>) => void | Promise<void>;
}

const CaseClassificationFields: React.FC<CaseClassificationFieldsProps> = ({
  caseData,
  staff,
  onUpdate,
}) => (
  <section className="grid gap-3 sm:grid-cols-3">
    <label className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Situação</span>
      <select
        className={FIELD_CONTROL}
        value={caseData.status}
        onChange={event => void onUpdate({ status: event.target.value })}
        aria-label="Situação do processo"
      >
        {(Object.keys(CASE_STATUS_LABELS) as ClientCaseStatus[]).map(status => (
          <option key={status} value={status}>
            {CASE_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </label>
    <label className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Prioridade</span>
      <select
        className={FIELD_CONTROL}
        value={caseData.priority}
        onChange={event => void onUpdate({ priority: event.target.value })}
        aria-label="Prioridade do processo"
      >
        {(Object.keys(CASE_PRIORITY_LABELS) as CasePriority[]).map(priority => (
          <option key={priority} value={priority}>
            {CASE_PRIORITY_LABELS[priority]}
          </option>
        ))}
      </select>
    </label>
    <label className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Responsável</span>
      <select
        className={FIELD_CONTROL}
        value={caseData.responsibleStaffId ?? ''}
        onChange={event => void onUpdate({ responsibleStaffId: event.target.value || null })}
        aria-label="Responsável pelo processo"
      >
        <option value="">Não atribuir</option>
        {staff.map(member => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
    </label>
  </section>
);

interface CaseDataSummaryProps {
  caseData: CaseDetailProps['caseData'];
}

const CaseDataSummary: React.FC<CaseDataSummaryProps> = ({ caseData }) => (
  <div className="rounded-xl border border-border bg-surface px-3 py-2.5 sm:col-span-2 lg:col-span-4">
    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Dados do processo</p>
    <dl className="mt-1 grid gap-x-4 gap-y-1 text-xs text-text-secondary sm:grid-cols-2">
      <div>
        <dt className="inline text-text-muted">Parte adversária: </dt>
        <dd className="inline">{caseData.opponent ?? '—'}</dd>
      </div>
      <div>
        <dt className="inline text-text-muted">Valor da causa: </dt>
        <dd className="inline">{formatCurrency(caseData.claimedAmount)}</dd>
      </div>
      <div>
        <dt className="inline text-text-muted">Valor obtido: </dt>
        <dd className="inline">{formatCurrency(caseData.awardedAmount)}</dd>
      </div>
      <div>
        <dt className="inline text-text-muted">Aberto em: </dt>
        <dd className="inline">{formatDate(caseData.openedAt)}</dd>
      </div>
    </dl>
  </div>
);
