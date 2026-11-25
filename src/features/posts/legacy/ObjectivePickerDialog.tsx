import React from 'react';
import { EditorDialog } from '../EditorDialog';
import { OBJECTIVES, type ObjectiveId } from '../objectives';
import { LuChevronRight as ChevronRight } from 'react-icons/lu';

export interface ObjectivePickerDialogProps {
  onClose: () => void;
  onPick: (objectiveId: ObjectiveId) => void;
}

/** Primeiro passo do editor: escolher o objetivo do post. */
export function ObjectivePickerDialog({ onClose, onPick }: ObjectivePickerDialogProps) {
  return (
    <EditorDialog>
      <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[92dvh] sm:rounded-2xl sm:border sm:border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-bold text-text-primary">Criar post</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-text-muted hover:text-text-primary" aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-xs font-bold text-text-secondary">Qual o objetivo do post?</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {OBJECTIVES.map(obj => (
              <button
                key={obj.id}
                type="button"
                onClick={() => onPick(obj.id)}
                className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface p-4 text-left transition hover:border-accent/50"
              >
                <p className="text-sm font-bold text-text-primary">{obj.label}</p>
                <p className="text-xs leading-relaxed text-text-muted">{obj.description}</p>
                <span className="flex items-center gap-1 text-xs font-semibold text-text-muted">
                  Escolher <ChevronRight size={12} aria-hidden />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </EditorDialog>
  );
}
