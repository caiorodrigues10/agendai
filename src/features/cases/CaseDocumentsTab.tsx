import React, { useState } from 'react';
import { LuPlus as Plus, LuTrash2 as Trash } from 'react-icons/lu';
import { casesApi, type CaseDocument } from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import { CASE_DOCUMENT_TYPE_LABELS, formatDate } from './caseLabels';
export interface DocumentsTabProps {
  caseId: string;
  documents: CaseDocument[];
  onChanged: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const CaseDocumentsTab: React.FC<DocumentsTabProps> = ({ caseId, documents, onChanged, onNotify }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('OTHER');
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const addDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await casesApi.createDocument(caseId, {
        title: title.trim(),
        type: type as CaseDocument['type'],
        fileUrl: fileUrl.trim() || null,
        notes: notes.trim() || null,
      });
      setTitle('');
      setFileUrl('');
      setNotes('');
      await onChanged();
      onNotify?.('Documento registrado.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeDocument = async (document: CaseDocument) => {
    try {
      await casesApi.deleteDocument(caseId, document.id);
      await onChanged();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  return (
    <section className="space-y-3">
      <form onSubmit={addDocument} className="space-y-2 rounded-xl border border-border bg-surface p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Novo documento</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[12rem] space-y-1">
            <span className="text-[11px] text-text-muted">Título</span>
            <input
              className={FIELD_CONTROL}
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Ex.: Procuração assinada"
              aria-label="Título do documento"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-text-muted">Tipo</span>
            <select className={FIELD_CONTROL} value={type} onChange={event => setType(event.target.value)} aria-label="Tipo do documento">
              {(Object.keys(CASE_DOCUMENT_TYPE_LABELS) as CaseDocument['type'][]).map(option => (
                <option key={option} value={option}>
                  {CASE_DOCUMENT_TYPE_LABELS[option]}
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
        <label className="block space-y-1">
          <span className="text-[11px] text-text-muted">Link do arquivo (opcional)</span>
          <input
            className={FIELD_CONTROL}
            value={fileUrl}
            onChange={event => setFileUrl(event.target.value)}
            placeholder="https://..."
            aria-label="Link do arquivo"
          />
        </label>
        <textarea
          className={`${FIELD_CONTROL} resize-none`}
          rows={2}
          value={notes}
          onChange={event => setNotes(event.target.value)}
          placeholder="Observações (opcional)"
          aria-label="Observações do documento"
        />
      </form>

      {documents.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhum documento registrado.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {documents.map(document => (
            <li key={document.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-text-primary">{document.title}</p>
                <p className="truncate text-[11px] text-text-muted">
                  {[CASE_DOCUMENT_TYPE_LABELS[document.type], document.version ? `v${document.version}` : null, formatDate(document.createdAt)]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              {document.fileUrl && (
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-accent"
                >
                  Abrir
                </a>
              )}
              <button
                type="button"
                onClick={() => void removeDocument(document)}
                aria-label={`Remover documento ${document.title}`}
                className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger"
              >
                <Trash size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
