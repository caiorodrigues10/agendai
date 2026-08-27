import React, { useEffect, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { ListOrdered, Loader2, X } from 'lucide-react';
import { QueueItem, Service } from '../../types';

interface ReturnToQueueModalProps {
  item: QueueItem;
  waiting: QueueItem[];
  services: Service[];
  submitting?: boolean;
  onConfirm: (insertAt: number) => void;
  onClose: () => void;
}

export const ReturnToQueueModal: React.FC<ReturnToQueueModalProps> = ({
  item,
  waiting,
  services,
  submitting = false,
  onConfirm,
  onClose,
}) => {
  const defaultSlot = waiting.length;
  const [insertAt, setInsertAt] = useState(defaultSlot);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  const serviceName = (q: QueueItem) => services.find(s => s.id === q.serviceId)?.name ?? 'Serviço';

  const slots: { insertAt: number; label: string; hint?: string }[] = [
    {
      insertAt: 0,
      label: waiting.length === 0 ? 'Primeiro da fila' : 'Na frente de todos',
      hint: waiting[0] ? `Antes de ${waiting[0].customerName}` : undefined,
    },
    ...waiting.map((q, i) => ({
      insertAt: i + 1,
      label: i === waiting.length - 1 ? 'No fim da fila' : `Depois de ${q.customerName}`,
      hint:
        i < waiting.length - 1
          ? `Entre ${q.customerName} e ${waiting[i + 1].customerName}`
          : `Último, depois de ${q.customerName}`,
    })),
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-queue-title"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <FocusLock returnFocus>
        <div
          className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2
                id="return-queue-title"
                className="text-lg font-bold text-text-primary flex items-center gap-2"
              >
                <ListOrdered size={18} className="text-accent" />
                Voltar para a fila
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Onde <span className="font-semibold text-text-primary">{item.customerName}</span>{' '}
                deve entrar na espera?
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 shrink-0 cursor-pointer disabled:opacity-50"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {waiting.length > 0 && (
            <div className="mb-4 rounded-xl border border-border bg-bg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Ordem atual da espera
              </p>
              <ol className="space-y-1.5">
                {waiting.map((q, i) => (
                  <li key={q.id} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="text-text-muted font-bold w-6">#{i + 1}</span>
                    <span className="text-text-primary font-medium">{q.customerName}</span>
                    <span className="text-text-muted text-xs">· {serviceName(q)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <fieldset className="space-y-2 mb-5">
            <legend className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
              Inserir
            </legend>
            {slots.map(slot => (
              <label
                key={slot.insertAt}
                className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                  insertAt === slot.insertAt
                    ? 'border-accent/50 bg-accent/10'
                    : 'border-border bg-bg hover:border-border-strong'
                }`}
              >
                <input
                  type="radio"
                  name="insertAt"
                  className="mt-1 accent-emerald-500 cursor-pointer"
                  checked={insertAt === slot.insertAt}
                  onChange={() => setInsertAt(slot.insertAt)}
                />
                <span>
                  <span className="block text-sm font-bold text-text-primary">{slot.label}</span>
                  {slot.hint && (
                    <span className="block text-xs text-text-muted mt-0.5">{slot.hint}</span>
                  )}
                </span>
              </label>
            ))}
          </fieldset>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-bold hover:text-text-primary cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onConfirm(insertAt)}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-accent text-accent-fg text-sm font-bold hover:bg-accent-hover cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Confirmar
            </button>
          </div>
        </div>
      </FocusLock>
    </div>
  );
};
