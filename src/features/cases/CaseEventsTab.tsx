import React, { useState } from 'react';
import { LuEye as Eye, LuPlus as Plus } from 'react-icons/lu';
import { casesApi, type CaseEvent } from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import { CASE_EVENT_TYPE_LABELS, formatDateTime } from './caseLabels';
export interface EventsTabProps {
  caseId: string;
  events: CaseEvent[];
  onChanged: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const CaseEventsTab: React.FC<EventsTabProps> = ({ caseId, events, onChanged, onNotify }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('NOTE');
  const [description, setDescription] = useState('');
  const [visibleToClient, setVisibleToClient] = useState(false);
  const [saving, setSaving] = useState(false);

  const addEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await casesApi.createEvent(caseId, {
        title: title.trim(),
        type: type as CaseEvent['type'],
        description: description.trim() || null,
        visibleToClient,
      });
      setTitle('');
      setDescription('');
      setVisibleToClient(false);
      await onChanged();
      onNotify?.('Andamento registrado.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-3">
      <form onSubmit={addEvent} className="space-y-2 rounded-xl border border-border bg-surface p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Novo andamento</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[12rem] space-y-1">
            <span className="text-[11px] text-text-muted">Título</span>
            <input
              className={FIELD_CONTROL}
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Ex.: Reunião com cliente"
              aria-label="Título do andamento"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-text-muted">Tipo</span>
            <select className={FIELD_CONTROL} value={type} onChange={event => setType(event.target.value)} aria-label="Tipo do andamento">
              {(Object.keys(CASE_EVENT_TYPE_LABELS) as CaseEvent['type'][]).map(option => (
                <option key={option} value={option}>
                  {CASE_EVENT_TYPE_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
          >
            <Plus size={14} /> Registrar
          </button>
        </div>
        <textarea
          className={`${FIELD_CONTROL} resize-none`}
          rows={2}
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Detalhamento do andamento (opcional)"
          aria-label="Detalhamento do andamento"
        />
        <label className="flex items-center gap-2 text-[11px] text-text-secondary">
          <input
            type="checkbox"
            checked={visibleToClient}
            onChange={event => setVisibleToClient(event.target.checked)}
          />
          Compartilhar este andamento com o cliente no portal
        </label>
      </form>

      {events.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhum andamento registrado.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {[...events].reverse().map(item => (
            <li key={item.id} className="rounded-xl border border-border bg-surface px-3 py-2">
              <p className="text-xs font-bold text-text-primary">{item.title}</p>
              <p className="text-[11px] text-text-muted">
                {[CASE_EVENT_TYPE_LABELS[item.type], formatDateTime(item.occurredAt), item.authorName]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {item.description && (
                <p className="mt-1 whitespace-pre-line text-[11px] text-text-secondary">{item.description}</p>
              )}
              {item.visibleToClient && (
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success">
                  <Eye size={11} /> Visível ao cliente
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

