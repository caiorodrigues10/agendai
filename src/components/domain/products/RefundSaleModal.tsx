import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi, type RetailSale, type RetailSaleLine } from '../../../infra/productsApi';
import { SmartSelect } from '../../ui/SmartSelect';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_FOOTER } from '../../ui/Field';
import { productMoney } from './productMoney';
import { RefundSaleSchema, RefundSaleFormData } from '../../../schemas';

interface RefundLineState {
  productId: string;
  productName: string;
  maxQty: number;
  quantity: number;
}

interface Props {
  open: boolean;
  sale: RetailSale | null;
  onClose: () => void;
  onConfirm: (payload: { reason: string; restock: boolean; refundMethod: string; items: { productId: string; quantity: number }[] }) => Promise<void>;
}

export const RefundSaleModal: React.FC<Props> = ({ open, sale, onClose, onConfirm }) => {
  const [lines, setLines] = useState<RefundLineState[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RefundSaleFormData>({
    resolver: zodResolver(RefundSaleSchema),
    defaultValues: {
      reason: '',
      restock: true,
      refundMethod: 'pix',
    },
  });

  useEffect(() => {
    if (!open || !sale) return;
    reset({
      reason: '',
      restock: true,
      refundMethod: sale.paymentMethod === 'fiado' ? 'fiado_credit' : sale.paymentMethod,
    });
    setLines(
      sale.lines
        .map((line: RetailSaleLine) => ({
          productId: line.productId,
          productName: line.productName,
          maxQty: line.quantity - line.refundedQty,
          quantity: line.quantity - line.refundedQty,
        }))
        .filter(line => line.maxQty > 0)
    );
  }, [open, sale, reset]);

  if (!open || !sale) return null;

  const onSubmit = async (data: RefundSaleFormData) => {
    const items = lines.filter(l => l.quantity > 0);
    if (!items.length) return;
    setSubmitting(true);
    try {
      await onConfirm({
        reason: data.reason.trim(),
        restock: data.restock,
        refundMethod: data.refundMethod,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Estornar venda</h3>
          <button type="button" onClick={onClose} className="text-sm text-text-muted">Fechar</button>
        </div>
        <p className="mb-3 text-sm text-text-secondary">Total: {productMoney.format(sale.total)}</p>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Motivo do estorno" error={errors.reason?.message}>
            <textarea
              placeholder="Descreva o motivo do estorno"
              rows={2}
              className={`${errors.reason ? FIELD_CONTROL_ERROR : FIELD_CONTROL} resize-none`}
              {...register('reason')}
            />
          </Field>
          <Controller
            control={control}
            name="restock"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={e => field.onChange(e.target.checked)}
                />
                Devolver ao estoque
              </label>
            )}
          />
          <Controller
            control={control}
            name="refundMethod"
            render={({ field, fieldState }) => (
              <SmartSelect
                label="Forma de estorno"
                value={field.value}
                onChange={value => field.onChange(value ?? 'pix')}
                error={fieldState.error?.message}
                options={[
                  { value: 'pix', label: 'PIX' },
                  { value: 'cash', label: 'Dinheiro' },
                  { value: 'credit_card', label: 'Crédito' },
                  { value: 'debit_card', label: 'Débito' },
                  { value: 'fiado_credit', label: 'Crédito em fiado' },
                ]}
                searchable={false}
              />
            )}
          />
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-secondary">Itens a estornar</p>
            {lines.map(line => (
              <div key={line.productId} className="rounded-lg border border-border bg-bg p-3">
                <p className="mb-2 text-sm font-medium text-text-primary">{line.productName}</p>
                <Field label="Qtd a estornar" hint={`Máximo: ${line.maxQty}`}>
                  <input
                    type="number"
                    min={0}
                    max={line.maxQty}
                    step="0.001"
                    value={line.quantity}
                    onChange={e =>
                      setLines(prev =>
                        prev.map(row =>
                          row.productId === line.productId
                            ? { ...row, quantity: Number(e.target.value) }
                            : row
                        )
                      )
                    }
                    className={FIELD_CONTROL}
                  />
                </Field>
              </div>
            ))}
          </div>
          <div className={FORM_FOOTER}>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 flex-1 rounded-xl bg-surface-2 py-3 text-sm font-bold text-text-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !lines.some(l => l.quantity > 0)}
              className="min-h-11 flex-1 rounded-xl bg-danger px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {submitting ? 'Estornando…' : 'Confirmar estorno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
