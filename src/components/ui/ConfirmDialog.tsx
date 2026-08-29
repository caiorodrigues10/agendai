import React, { useEffect } from 'react';
import FocusLock from 'react-focus-lock';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  submitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  submitting = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, submitting]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <FocusLock returnFocus>
        <div
          className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <h2 id="confirm-dialog-title" className="text-base font-bold text-text-primary mb-2">
            {title}
          </h2>
          <p className="text-sm text-text-secondary mb-5">{message}</p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-bold hover:text-text-primary cursor-pointer disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${
                variant === 'danger'
                  ? 'bg-danger text-white hover:opacity-90'
                  : 'bg-accent text-accent-fg hover:bg-accent-hover'
              }`}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </FocusLock>
    </div>
  );
};
