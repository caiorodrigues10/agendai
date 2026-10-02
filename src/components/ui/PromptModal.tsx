import React, { useEffect, useState } from 'react';
import { LuMessageSquareText as MessageSquare } from 'react-icons/lu';
import { FIELD_CONTROL } from './Field';
import { ModalShell } from '../patterns/ModalShell';

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

  return (
    <ModalShell
      open={open}
      title={title}
      titleId="prompt-modal-title"
      icon={<MessageSquare size={20} />}
      loading={loading}
      onClose={onCancel}
      className="overflow-hidden"
      body={
        <textarea
          className={`${FIELD_CONTROL} min-h-[80px] resize-y`}
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={loading}
          autoFocus
        />
      }
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
            onClick={() => onConfirm(value)}
            disabled={loading}
            className="flex-1 min-h-11 rounded-xl font-bold bg-accent text-accent-fg hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? 'Aguarde…' : confirmLabel}
          </button>
        </>
      }
    >
      {message && <p className="mt-2 text-sm text-text-secondary">{message}</p>}
    </ModalShell>
  );
};
