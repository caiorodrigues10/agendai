import React, { useState } from 'react';
import { LuInbox as Inbox, LuUpload as Upload } from 'react-icons/lu';
import {
  casesApi,
  type CaseEventType,
  type CourtIntimation,
  type IntimationStatus,
} from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import { CASE_EVENT_TYPE_LABELS, formatDate } from './caseLabels';

export const INTIMATION_STATUS_LABELS: Record<IntimationStatus, string> = {
  NEW: 'Aguardando triagem',
  TRIAGED: 'Triada',
  LINKED: 'Vinculada ao processo',
  IGNORED: 'Ignorada',
};

export interface CaseIntimationsTabProps {
  caseId: string;
  intimations: CourtIntimation[];
  onChanged: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

/**
 * Digestão de intimações do processo.
 *
 * O escritório cola o texto da intimação recebida (email do tribunal,
 * notificação do PJe) e o sistema detecta o número do processo e sugere o
 * tipo do andamento. A triagem confirma o caso e gera o andamento.
 */
export const CaseIntimationsTab: React.FC<CaseIntimationsTabProps> = ({
  caseId,
  intimations,
  onChanged,
  onNotify,
}) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const importText = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const result = await casesApi.importIntimations({ text: text.trim() });
      setText('');
      await onChanged();
      onNotify?.(`${result.imported} intimação(ões) importada(s).`);
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const triage = async (intimation: CourtIntimation, status: IntimationStatus) => {
    try {
      await casesApi.triageIntimation(intimation.id, {
        status,
        caseId,
        createEvent: status === 'LINKED',
        visibleToClient: false,
      });
      await onChanged();
      onNotify?.('Intimação triada.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  return (
    <section className="space-y-3">
      <form onSubmit={importText} className="space-y-2">
        <label className="block space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Colar intimação recebida
          </span>
          <textarea
            className={`${FIELD_CONTROL} min-h-[5rem]`}
            value={text}
            onChange={event => setText(event.target.value)}
            placeholder="Cole aqui o texto da intimação (email do tribunal, notificação do PJe)…"
            aria-label="Texto da intimação"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
        >
          <Upload size={14} /> Importar e analisar
        </button>
      </form>

      {intimations.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhuma intimação registrada para este processo.
        </p>
      ) : (
        <ul className="space-y-2">
          {intimations.map(intimation => (
            <li
              key={intimation.id}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-text-primary">{intimation.subject}</p>
                  <p className="text-text-muted">
                    {formatDate(intimation.receivedAt)} · {intimation.source} ·{' '}
                    {INTIMATION_STATUS_LABELS[intimation.status]}
                    {intimation.detectedNumber ? ` · ${intimation.detectedNumber}` : ''}
                  </p>
                  <p className="mt-1 text-text-muted">
                    Tipo sugerido: {CASE_EVENT_TYPE_LABELS[intimation.suggestedType as CaseEventType]}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void triage(intimation, 'LINKED')}
                    disabled={intimation.status === 'LINKED'}
                    className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary disabled:opacity-50"
                  >
                    <Inbox size={12} /> Gerar andamento
                  </button>
                  <button
                    type="button"
                    onClick={() => void triage(intimation, 'IGNORED')}
                    disabled={intimation.status === 'IGNORED'}
                    className="rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-muted hover:text-text-primary disabled:opacity-50"
                  >
                    Ignorar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
