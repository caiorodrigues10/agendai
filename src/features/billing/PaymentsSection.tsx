import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, PaymentListItem, ListMeta } from '../../infra/adminApi';
import { paymentsApi } from '../../infra/paymentsApi';
import {
  brl,
  errorMessage,
  formatDateTime,
  EMPTY_META,
  SectionError,
  TableSkeleton,
  EmptyRow,
  PaginationBar,
  PaymentStatusBadge,
  PaymentMethodIcon,
  PAYMENT_METHOD_LABELS,
  paymentRefLabel,
} from './billingShared';
import {
  LuCircleCheck as CheckCircle2,
  LuRotateCcw as RotateCcw,
  LuRefreshCcw as RefreshCcw,
  LuX as X,
  LuCircleAlert as AlertCircle,
} from 'react-icons/lu';

interface RefundModalProps {
  payment: PaymentListItem;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  busy: boolean;
  error: string | null;
}

const RefundModal: React.FC<RefundModalProps> = ({ payment, onClose, onSubmit, busy, error }) => {
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 3;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Reembolsar pagamento</h3>
            <p className="text-xs text-text-muted mt-1">
              {formatDateTime(payment.createdAt)} ·{' '}
              {PAYMENT_METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-bg/50 border border-border rounded-xl px-4 py-3 flex items-center justify-between mb-4">
          <span className="text-xs text-text-secondary font-medium">Valor do pagamento</span>
          <span className="text-lg font-black text-text-primary">
            {brl.format(payment.transactionAmount)}
          </span>
        </div>

        {error && (
          <div className="bg-danger/5 border border-danger/20 text-danger text-xs rounded-xl px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
          Motivo do reembolso
        </label>
        <textarea
          rows={3}
          maxLength={500}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Ex: cobrança indevida, solicitação do cliente..."
          className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-focus transition-all resize-none"
        />
        <p className="text-[10px] text-text-muted text-right mt-1">{reason.length}/500</p>

        <div className="rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 flex gap-2 mt-3">
          <AlertCircle size={15} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning">
            Reembolso TOTAL — a assinatura do salão será cancelada.
          </p>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-xl text-sm font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSubmit(reason.trim())}
            disabled={!valid || busy}
            className="flex-1 px-4 py-2.5 bg-danger text-white rounded-xl text-sm font-bold hover:bg-danger transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {busy ? <RefreshCcw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            Confirmar reembolso
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Seção: Pagamentos
// ─────────────────────────────────────────────

export const PaymentsSection: React.FC<{ shopNames: Map<string, string> }> = ({ shopNames }) => {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [meta, setMeta] = useState<ListMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState<PaymentListItem | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundNotice, setRefundNotice] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listPayments({ page, limit: 10 });
      setPayments(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRefund = async (reason: string) => {
    if (!refundTarget) return;
    setRefunding(true);
    setRefundError(null);
    try {
      await paymentsApi.refundPayment(refundTarget.id, reason);
      setRefundNotice(
        `Reembolso de ${brl.format(refundTarget.transactionAmount)} solicitado com sucesso.`
      );
      setRefundTarget(null);
      await fetchPayments();
    } catch (err) {
      setRefundError(errorMessage(err));
    } finally {
      setRefunding(false);
    }
  };

  if (error) return <SectionError message={error} onRetry={fetchPayments} />;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {refundNotice && (
        <div className="mx-4 mt-4 bg-success/10 border border-success/20 text-success text-xs rounded-xl px-4 py-2.5 flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0" /> {refundNotice}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-text-muted uppercase text-[10px] font-bold tracking-widest border-b border-border">
            <tr>
              <th className="px-6 py-3.5">Descrição</th>
              <th className="px-6 py-3.5 hidden md:table-cell">Salão</th>
              <th className="px-6 py-3.5">Valor</th>
              <th className="px-6 py-3.5">Método</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 hidden lg:table-cell">Data</th>
              <th className="px-6 py-3.5">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <TableSkeleton cols={7} />
            ) : payments.length === 0 ? (
              <EmptyRow cols={7} message="Nenhum pagamento encontrado." />
            ) : (
              payments.map(p => (
                <tr key={p.id} className="hover:bg-surface-2/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-primary text-sm max-w-[220px] truncate">
                      {p.description || '—'}
                    </div>
                    <div className="text-[10px] text-text-muted font-mono">
                      {paymentRefLabel(p)}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-xs text-text-secondary max-w-[160px] truncate">
                      {shopNames.get(p.barbershopId) ?? p.barbershopId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-text-primary">
                      {brl.format(p.transactionAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                      <PaymentMethodIcon method={p.paymentMethod} />
                      {PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <PaymentStatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-xs text-text-secondary">
                      {formatDateTime(p.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'approved' ? (
                      <button
                        onClick={() => {
                          setRefundError(null);
                          setRefundTarget(p);
                        }}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-warning border border-warning/20 hover:bg-warning/10 rounded-lg px-2.5 py-1.5 transition-all"
                      >
                        <RotateCcw size={11} />
                        Reembolsar
                      </button>
                    ) : (
                      <span className="text-[10px] text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar meta={meta} page={page} loading={loading} onPageChange={setPage} />
      {refundTarget && (
        <RefundModal
          payment={refundTarget}
          onClose={() => {
            setRefundTarget(null);
            setRefundError(null);
          }}
          onSubmit={handleRefund}
          busy={refunding}
          error={refundError}
        />
      )}
    </div>
  );
};
