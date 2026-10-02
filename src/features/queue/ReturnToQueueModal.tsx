import React, { useState } from 'react';
import { LuListOrdered as ListOrdered, LuLoaderCircle as Loader2 } from 'react-icons/lu';
import { QueueItem, Service } from '../../types';
import { ModalShell } from '../../components/patterns/ModalShell';

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
    <ModalShell
      open
      title="Voltar para a fila"
      titleId="return-queue-title"
      icon={<ListOrdered size={18} />}
      loading={submitting}
      onClose={() => {
        if (!submitting) onClose();
      }}
      className="max-h-[90vh] overflow-y-auto"
      body={
        <>
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

          <fieldset className="space-y-2">
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
                  className="mt-1 accent-accent cursor-pointer"
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
        </>
      }
      footer={
        <>
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
        </>
      }
    >
      <p className="mt-1 text-sm text-text-secondary">
        Onde <span className="font-semibold text-text-primary">{item.customerName}</span> deve
        entrar na espera?
      </p>
    </ModalShell>
  );
};
