import React, { useEffect, useState } from 'react';
import { productsApi, type RetailSale, type RetailSaleLine } from '../../../infra/productsApi';
import { SmartSelect } from '../../ui/SmartSelect';
import { productMoney } from './productMoney';

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
  const [reason, setReason] = useState('');
  const [restock, setRestock] = useState(true);
  const [refundMethod, setRefundMethod] = useState('pix');
  const [lines, setLines] = useState<RefundLineState[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !sale) return;
    setReason('');
    setRestock(true);
    setRefundMethod(sale.paymentMethod === 'fiado' ? 'fiado_credit' : sale.paymentMethod);
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
  }, [open, sale]);

  if (!open || !sale) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = lines.filter(l => l.quantity > 0);
    if (!reason.trim() || !items.length) return;
    setSubmitting(true);
    try {
      await onConfirm({ reason: reason.trim(), restock, refundMethod, items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Estornar venda</h3>
          <button type="button" onClick={onClose} className="text-sm text-text-muted">Fechar</button>
        </div>
        <p className="mb-3 text-sm text-text-secondary">Total: {productMoney.format(sale.total)}</p>
        <form className="space-y-3" onSubmit={submit}>
          <textarea required value={reason} onChange={e => setReason(e.target.value)} placeholder="Motivo do estorno" rows={2} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary" />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={restock} onChange={e => setRestock(e.target.checked)} />
            Devolver ao estoque
          </label>
          <SmartSelect
            label="Forma de estorno"
            value={refundMethod}
            onChange={value => setRefundMethod(value ?? 'pix')}
            options={[
              { value: 'pix', label: 'PIX' },
              { value: 'cash', label: 'Dinheiro' },
              { value: 'credit_card', label: 'Crédito' },
              { value: 'debit_card', label: 'Débito' },
              { value: 'fiado_credit', label: 'Crédito em fiado' },
            ]}
            searchable={false}
          />
          <div className="space-y-2">
            {lines.map(line => (
              <div key={line.productId} className="flex items-center gap-2 text-sm">
                <span className="flex-1 text-text-primary">{line.productName}</span>
                <input
                  type="number"
                  min={0}
                  max={line.maxQty}
                  step="0.001"
                  value={line.quantity}
                  onChange={e => setLines(prev => prev.map(row => row.productId === line.productId ? { ...row, quantity: Number(e.target.value) } : row))}
                  className="w-20 rounded border border-border bg-bg px-2 py-1"
                />
                <span className="text-xs text-text-muted">máx {line.maxQty}</span>
              </div>
            ))}
          </div>
          <button type="submit" disabled={submitting || !lines.some(l => l.quantity > 0)} className="w-full rounded-xl bg-danger px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
            {submitting ? 'Estornando…' : 'Confirmar estorno'}
          </button>
        </form>
      </div>
    </div>
  );
};
