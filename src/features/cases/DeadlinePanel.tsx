import React, { useCallback, useEffect, useState } from 'react';
import { LuPlus as Plus, LuTrash2 as Trash } from 'react-icons/lu';
import { casesApi, type CaseDeadline, type OfficeHoliday } from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL } from '../../components/ui/Field';
import {
  DEADLINE_STATUS_LABELS,
  DEADLINE_TYPE_LABELS,
  formatDate,
  formatDaysRemaining,
} from './caseLabels';

interface DeadlinePanelProps {
  onNotify?: (message: string, type?: 'success' | 'error') => void;
  onChanged?: () => void | Promise<void>;
}

/**
 * Calendário de prazos do escritório.
 *
 * Lista os prazos (com dias úteis restantes) e os feriados/suspensões que a
 *escritório não atende — usados no cálculo de prazo em dias úteis.
 */
export const DeadlinePanel: React.FC<DeadlinePanelProps> = ({ onNotify, onChanged }) => {
  const [deadlines, setDeadlines] = useState<CaseDeadline[]>([]);
  const [holidays, setHolidays] = useState<OfficeHoliday[]>([]);
  const [window, setWindow] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deadlineList, holidayList] = await Promise.all([
        casesApi.listDeadlines({ withinBusinessDays: window, limit: 100 }),
        casesApi.listHolidays(),
      ]);
      setDeadlines(deadlineList);
      setHolidays(holidayList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [window]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial do calendário
    void load();
  }, [load]);

  const addHoliday = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!holidayDate || !holidayName.trim()) return;
    setSaving(true);
    try {
      await casesApi.createHoliday({ date: holidayDate, name: holidayName.trim() });
      setHolidayDate('');
      setHolidayName('');
      await load();
      onNotify?.('Feriado registrado.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeHoliday = async (holiday: OfficeHoliday) => {
    try {
      await casesApi.deleteHoliday(holiday.id);
      await load();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  const setStatus = async (deadline: CaseDeadline, status: 'FULFILLED' | 'PENDING') => {
    try {
      await casesApi.updateDeadline(deadline.id, { status });
      await load();
      await onChanged?.();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger lg:col-span-2">
          {error}
        </p>
      )}
      <DeadlineList
        deadlines={deadlines}
        loading={loading}
        window={window}
        onWindowChange={setWindow}
        onSetStatus={setStatus}
      />

      <aside aria-label="Feriados do escritório" className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Feriados e suspensões
        </p>
        <HolidayForm
          date={holidayDate}
          name={holidayName}
          saving={saving}
          onDateChange={setHolidayDate}
          onNameChange={setHolidayName}
          onSubmit={addHoliday}
        />

        {holidays.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-3 py-3 text-center text-[11px] text-text-muted">
            Nenhum feriado cadastrado. Os feriados nacionais já são considerados.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {holidays.map(holiday => (
              <li
                key={holiday.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-text-primary">{holiday.name}</p>
                  <p className="text-[11px] text-text-muted">{formatDate(holiday.date)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeHoliday(holiday)}
                  aria-label={`Remover feriado ${holiday.name}`}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
};

interface HolidayFormProps {
  date: string;
  name: string;
  saving: boolean;
  onDateChange: (date: string) => void;
  onNameChange: (name: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

const HolidayForm: React.FC<HolidayFormProps> = ({
  date,
  name,
  saving,
  onDateChange,
  onNameChange,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="space-y-2 rounded-xl border border-border bg-surface p-3">
    <Field label="Data">
      <input
        type="date"
        className={FIELD_CONTROL}
        value={date}
        onChange={event => onDateChange(event.target.value)}
        aria-label="Data do feriado"
      />
    </Field>
    <Field label="Nome">
      <input
        className={FIELD_CONTROL}
        value={name}
        onChange={event => onNameChange(event.target.value)}
        placeholder="Ex.: Feriado municipal"
        aria-label="Nome do feriado"
      />
    </Field>
    <button
      type="submit"
      disabled={saving || !date || !name.trim()}
      className="flex w-full items-center justify-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
    >
      <Plus size={14} /> Adicionar
    </button>
  </form>
);

interface DeadlineListProps {
  deadlines: CaseDeadline[];
  loading: boolean;
  window: number;
  onWindowChange: (value: number) => void;
  onSetStatus: (deadline: CaseDeadline, status: 'FULFILLED' | 'PENDING') => void;
}

const DeadlineList: React.FC<DeadlineListProps> = ({
  deadlines,
  loading,
  window: windowDays,
  onWindowChange,
  onSetStatus,
}) => (
  <section aria-label="Prazos do escritório" className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Próximos prazos</p>
      <label className="flex items-center gap-2 text-[11px] text-text-muted">
        Janela
        <select
          className={`${FIELD_CONTROL} w-auto py-1 text-xs`}
          value={windowDays}
          onChange={event => onWindowChange(Number(event.target.value))}
          aria-label="Janela de prazos em dias úteis"
        >
          {[5, 10, 15, 30, 60].map(value => (
            <option key={value} value={value}>
              {value} dias úteis
            </option>
          ))}
        </select>
      </label>
    </div>

    {loading ? (
      <p className="rounded-xl border border-border bg-surface px-3 py-6 text-center text-xs text-text-muted">
        Carregando prazos…
      </p>
    ) : deadlines.length === 0 ? (
      <p className="rounded-xl border border-border bg-surface px-3 py-6 text-center text-xs text-text-muted">
        Nenhum prazo pendente na janela selecionada.
      </p>
    ) : (
      <ul className="space-y-1.5">
        {deadlines.map(deadline => {
          const overdue = (deadline.daysRemaining ?? 0) < 0 && deadline.status === 'PENDING';
          return (
            <li
              key={deadline.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-text-primary">{deadline.title}</p>
                <p className="truncate text-[11px] text-text-muted">
                  {[
                    deadline.caseName ? `Processo: ${deadline.caseName}` : null,
                    DEADLINE_TYPE_LABELS[deadline.type],
                    formatDate(deadline.dueDate),
                    DEADLINE_STATUS_LABELS[deadline.status],
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  overdue ? 'bg-danger/15 text-danger' : 'bg-surface-2 text-text-secondary'
                }`}
              >
                {formatDaysRemaining(deadline.daysRemaining)}
              </span>
              {deadline.status === 'PENDING' ? (
                <button
                  type="button"
                  onClick={() => onSetStatus(deadline, 'FULFILLED')}
                  className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-success"
                >
                  Cumprir
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSetStatus(deadline, 'PENDING')}
                  className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary"
                >
                  Reabrir
                </button>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </section>
);
