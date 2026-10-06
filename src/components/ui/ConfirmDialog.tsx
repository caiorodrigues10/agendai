import React from 'react';
import { LuTriangleAlert as AlertTriangle } from 'react-icons/lu';
import { ModalShell } from '../patterns/ModalShell';

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
}) => (
  <ModalShell
    open={open}
    title={title}
    titleId="confirm-dialog-title"
    role="alertdialog"
    icon={<AlertTriangle size={20} />}
    iconClassName={variant === 'danger' ? 'bg-danger/15 text-danger' : 'bg-accent/15 text-accent'}
    loading={loading}
    onClose={onCancel}
    footer={
      <>
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
          className={`flex-1 min-h-11 rounded-xl font-bold disabled:opacity-50 ${
            variant === 'danger' ? 'bg-danger text-danger-fg hover:bg-danger/90' : 'bg-accent text-accent-fg hover:bg-accent-hover'
          }`}
        >
          {loading ? 'Aguarde…' : confirmLabel}
        </button>
      </>
    }
  >
    <p className="mt-2 text-sm text-text-secondary">{message}</p>
  </ModalShell>
);
