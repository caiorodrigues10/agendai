import React, { useState } from 'react';
import { LuPlus as Plus, LuTrash2 as Trash } from 'react-icons/lu';
import {
  casesApi,
  type CaseTimeEntry,
  type TimeEntrySummary,
} from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import type { StaffMember } from '../../types';
import { formatCurrency, formatDate } from './caseLabels';

export interface CaseTimeEntriesTabProps {
  caseId: string;
  entries: CaseTimeEntry[];
  summary: TimeEntrySummary | null;
  staff: StaffMember[];
  onChanged: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

/** Minutos → "1h30". */
function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}min`;
  if (!rest) return `${hours}h`;
  return `${hours}h${String(rest).padStart(2, '0')}`;
}

/**
 * Timesheet do processo — horas trabalhadas e valor a faturar.
 *
 * O valor é derivado (minutos/60 × valor/hora); o escritório lança horas,
 * não valores, para a cobrança não divergir do trabalho feito.
 */
export const CaseTimeEntriesTab: React.FC<CaseTimeEntriesTabProps> = ({
  caseId,
  entries,
  summary,
  staff,
  onChanged,
  onNotify,
}) => {
  const [staffUserId, setStaffUserId] = useState('');
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [hourlyRate, setHourlyRate] = useState('');
  const [billable, setBillable] = useState(true);
  const [saving, setSaving] = useState(false);

  const addEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedMinutes = Number(minutes);
    if (!staffUserId || !Number.isFinite(parsedMinutes) || parsedMinutes <= 0) return;
    setSaving(true);
    try {
      await casesApi.createTimeEntry(caseId, {
        staffUserId,
        description: description.trim() || null,
        minutes: parsedMinutes,
        billable,
        hourlyRate: hourlyRate.trim() ? Number(hourlyRate) : null,
      });
      setDescription('');
      setMinutes('60');
      setHourlyRate('');
      await onChanged();
      onNotify?.('Lançamento de horas registrado.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleBilled = async (entry: CaseTimeEntry) => {
    try {
      await casesApi.updateTimeEntry(entry.id, { billed: !entry.billed });
      await onChanged();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  const removeEntry = async (entry: CaseTimeEntry) => {
    try {
      await casesApi.deleteTimeEntry(entry.id);
      await onChanged();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  return (
    <section className="space-y-3">
      {summary && (
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard label="Horas lançadas" value={formatMinutes(summary.totalMinutes)} />
          <SummaryCard label="Horas cobráveis" value={formatMinutes(summary.billableMinutes)} />
          <SummaryCard label="Valor total" value={formatCurrency(summary.billableAmount)} />
          <SummaryCard label="A faturar" value={formatCurrency(summary.unbilledAmount)} />
        </div>
      )}

      <form onSubmit={addEntry} className="flex flex-wrap items-end gap-2">
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Profissional
          </span>
          <select
            className={FIELD_CONTROL}
            value={staffUserId}
            onChange={event => setStaffUserId(event.target.value)}
            aria-label="Profissional que trabalhou"
          >
            <option value="">Selecione…</option>
            {staff.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[10rem] flex-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Atividade
          </span>
          <input
            className={FIELD_CONTROL}
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Ex.: Petição inicial"
            aria-label="Descrição da atividade"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Minutos</span>
          <input
            className={FIELD_CONTROL}
            type="number"
            min={1}
            value={minutes}
            onChange={event => setMinutes(event.target.value)}
            aria-label="Minutos trabalhados"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Valor/hora</span>
          <input
            className={FIELD_CONTROL}
            type="number"
            min={0}
            step="0.01"
            value={hourlyRate}
            onChange={event => setHourlyRate(event.target.value)}
            placeholder="R$ 0,00"
            aria-label="Valor por hora"
          />
        </label>
        <label className="flex items-center gap-1 pb-2 text-[11px] text-text-secondary">
          <input
            type="checkbox"
            checked={billable}
            onChange={event => setBillable(event.target.checked)}
          />
          Cobrável
        </label>
        <button
          type="submit"
          disabled={saving || !staffUserId}
          className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
        >
          <Plus size={14} /> Lançar
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhuma hora lançada neste processo.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {entries.map(entry => (
            <li
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs"
            >
              <div>
                <p className="font-bold text-text-primary">
                  {entry.description || 'Atividade sem descrição'}
                </p>
                <p className="text-text-muted">
                  {entry.staffName ?? 'Profissional'} · {formatDate(entry.entryDate)} ·{' '}
                  {formatMinutes(entry.minutes)}
                  {entry.billable ? ` · ${formatCurrency(entry.amount)}` : ' · não cobrável'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void toggleBilled(entry)}
                  className="rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary"
                >
                  {entry.billed ? 'Faturado' : 'Marcar faturado'}
                </button>
                <button
                  type="button"
                  onClick={() => void removeEntry(entry)}
                  aria-label={`Excluir lançamento de ${entry.description ?? 'horas'}`}
                  className="rounded-lg border border-border p-1 text-text-muted hover:text-danger"
                >
                  <Trash size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const SummaryCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
    <p className="font-display text-lg font-bold text-text-primary">{value}</p>
  </div>
);
