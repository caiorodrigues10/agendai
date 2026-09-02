import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div
            className={`rounded-xl p-2 shrink-0 ${
              variant === 'danger' ? 'bg-danger/15 text-danger' : 'bg-accent/15 text-accent'
            }`}
          >
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 id="confirm-dialog-title" className="font-bold text-text-primary">
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
            <p className="mt-2 text-sm text-text-secondary">{message}</p>
          </div>
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
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 min-h-11 rounded-xl font-bold text-accent-fg disabled:opacity-50 ${
              variant === 'danger' ? 'bg-danger hover:bg-danger/90' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {loading ? 'Aguarde…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
