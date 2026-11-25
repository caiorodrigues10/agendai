import React from 'react';
import { Button } from '../../../components/ui/Button';
import { LuLoaderCircle as Loader2, LuCheck as Check } from 'react-icons/lu';

export interface EditorHeaderProps {
  title: string;
  onClose: () => void;
  disabled: boolean;
}

/** Cabeçalho do editor (título + fechar). */
export function EditorHeader({ title, onClose, disabled }: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <h3 className="font-bold text-text-primary">{title}</h3>
      <button type="button" onClick={onClose} disabled={disabled} className="rounded-lg p-2 text-text-muted hover:text-text-primary disabled:opacity-40" aria-label="Fechar">
        ✕
      </button>
    </div>
  );
}

export interface EditorFooterProps {
  submitting: boolean;
  mediaBusy: boolean;
  editorMode: 'checking' | 'design' | 'legacy' | 'design-disabled';
  templatesLoading: boolean;
  onCancel: () => void;
  onSave: (action: 'draft' | 'publish') => void;
}

/** Rodapé do editor (cancelar / rascunho / publicar). */
export function EditorFooter({
  submitting, mediaBusy, editorMode, templatesLoading, onCancel, onSave,
}: EditorFooterProps) {
  return (
    <div className="border-t border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting || mediaBusy}
          className="gap-1.5"
        >
          Cancelar
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => onSave('draft')} disabled={submitting || mediaBusy || editorMode === 'checking'}
            className="gap-1.5"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
            Rascunho
          </Button>
          <Button variant="primary"
            onClick={() => onSave('publish')}
            disabled={submitting || mediaBusy || editorMode === 'checking' || (editorMode === 'legacy' && templatesLoading)}
            className="gap-2 px-5"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Check size={14} aria-hidden />}
            Publicar
          </Button>
        </div>
      </div>
    </div>
  );
}
