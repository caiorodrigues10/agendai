import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import { LuMessageSquareText as MessageSquare, LuX as X } from 'react-icons/lu';
import { FIELD_CONTROL } from './Field';

interface PromptModalProps {
  open: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  open,
  title,
  message,
  placeholder,
  defaultValue = '',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return createPortal(
    <FocusLock returnFocus>
      <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-4 sm:items-center">
        <button
          type="button"
          aria-label="Fechar"
          onClick={onCancel}
          className="absolute inset-0 cursor-default"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="prompt-modal-title"
          className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl overflow-hidden"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-xl p-2 shrink-0 bg-accent/15 text-accent">
              <MessageSquare size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 id="prompt-modal-title" className="font-bold text-text-primary">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg p-1 text-text-muted hover:bg-bg"
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
              {message && <p className="mt-2 text-sm text-text-secondary">{message}</p>}
            </div>
          </div>
          <div className="mt-4">
            <textarea
              className={`${FIELD_CONTROL} min-h-[80px] resize-y`}
              placeholder={placeholder}
              value={value}
              onChange={e => setValue(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 min-h-11 rounded-xl border border-border font-bold text-text-secondary disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => onConfirm(value)}
              disabled={loading}
              className="flex-1 min-h-11 rounded-xl font-bold bg-accent text-accent-fg hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? 'Aguarde…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </FocusLock>,
    document.body
  );
};
