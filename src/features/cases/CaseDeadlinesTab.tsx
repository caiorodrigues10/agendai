import React, { useState } from 'react';
import { LuPlus as Plus, LuTrash2 as Trash } from 'react-icons/lu';
import { casesApi, type CaseDeadline } from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import {
  DEADLINE_STATUS_LABELS,
  DEADLINE_TYPE_LABELS,
  formatDate,
  formatDaysRemaining,
} from './caseLabels';
export interface DeadlinesTabProps {
  caseId: string;
  deadlines: CaseDeadline[];
  onChanged: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const CaseDeadlinesTab: React.FC<DeadlinesTabProps> = ({ caseId, deadlines, onChanged, onNotify }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('JUDICIAL_RESPONSE');
  const [dueDate, setDueDate] = useState('');
  const [businessDays, setBusinessDays] = useState('');
  const [saving, setSaving] = useState(false);

  const addDeadline = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await casesApi.createDeadline(caseId, {
        title: title.trim(),
        type: type as CaseDeadline['type'],
        dueDate: dueDate || undefined,
        businessDays: businessDays ? Number(businessDays) : undefined,
      });
      setTitle('');
      setDueDate('');
      setBusinessDays('');
      await onChanged();
      onNotify?.('Prazo criado.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (deadline: CaseDeadline, status: 'FULFILLED' | 'PENDING') => {
    try {
      await casesApi.updateDeadline(deadline.id, { status });
      await onChanged();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  const removeDeadline = async (deadline: CaseDeadline) => {
    try {
      await casesApi.deleteDeadline(deadline.id);
      await onChanged();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  return (
    <section className="space-y-3">
      <form onSubmit={addDeadline} className="space-y-2 rounded-xl border border-border bg-surface p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Novo prazo</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[12rem] space-y-1">
            <span className="text-[11px] text-text-muted">Título</span>
            <input
              className={FIELD_CONTROL}
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Ex.: Contestação"
              aria-label="Título do prazo"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-text-muted">Tipo</span>
            <select className={FIELD_CONTROL} value={type} onChange={event => setType(event.target.value)} aria-label="Tipo do prazo">
              {(Object.keys(DEADLINE_TYPE_LABELS) as CaseDeadline['type'][]).map(option => (
                <option key={option} value={option}>
                  {DEADLINE_TYPE_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-text-muted">Data</span>
            <input type="date" className={FIELD_CONTROL} value={dueDate} onChange={event => setDueDate(event.target.value)} aria-label="Data do prazo" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-text-muted">Dias úteis</span>
            <input
              type="number"
              min={1}
              max={365}
              className={FIELD_CONTROL}
              value={businessDays}
              onChange={event => setBusinessDays(event.target.value)}
              placeholder="opcional"
              aria-label="Prazo em dias úteis"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
          >
            <Plus size={14} /> Criar prazo
          </button>
        </div>
        <p className="text-[11px] text-text-muted">
          Com "dias úteis", a data é calculada a partir de hoje pulando fins de semana e feriados.
        </p>
      </form>

      {deadlines.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhum prazo registrado.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {deadlines.map(deadline => {
            const overdue = (deadline.daysRemaining ?? 0) < 0 && deadline.status === 'PENDING';
            return (
              <li key={deadline.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-text-primary">{deadline.title}</p>
                  <p className="truncate text-[11px] text-text-muted">
                    {[
                      DEADLINE_TYPE_LABELS[deadline.type],
                      formatDate(deadline.dueDate),
                      DEADLINE_STATUS_LABELS[deadline.status],
                      overdue ? formatDaysRemaining(deadline.daysRemaining) : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                {deadline.status === 'PENDING' ? (
                  <button
                    type="button"
                    onClick={() => void setStatus(deadline, 'FULFILLED')}
                    className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-success"
                  >
                    Cumprir
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void setStatus(deadline, 'PENDING')}
                    className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary"
                  >
                    Reabrir
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void removeDeadline(deadline)}
                  aria-label={`Remover prazo ${deadline.title}`}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

