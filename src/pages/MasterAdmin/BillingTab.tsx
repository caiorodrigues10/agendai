import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SmartSelect } from '../../components/ui/SmartSelect';
import {
  Search,
  RefreshCcw,
  XCircle,
  CheckCircle2,
  Wallet,
  Receipt,
  CreditCard,
  Layers,
  Ban,
  AlertCircle,
  Unlock,
  Plus,
  Pencil,
  Trash2,
  QrCode,
  Bell,
  ExternalLink,
  RotateCcw,
  X,
  Landmark,
} from 'lucide-react';
import {
  adminApi,
  AdminNotificationItem,
  FinancialOverview,
  FinancialSummary,
  PaymentListItem,
  SubscriptionListItem,
  SubscriptionEconomics,
  PlanItem,
  BlockedEntityItem,
  ListMeta,
} from '../../infra/adminApi';
import { paymentsApi, Refund } from '../../infra/paymentsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { NotificationDeliveriesPanel } from '../../components/domain/NotificationDeliveriesPanel';
import { NotificationHealthPanel } from '../../components/domain/NotificationHealthPanel';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '—';

const formatDateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString('pt-BR') : '—';

const errorMessage = (err: unknown): string => getErrorMessage(err);

const EMPTY_META: ListMeta = { total: 0, page: 1, limit: 10, totalPages: 1 };

// ─────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────

const SectionError: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex items-center gap-3">
    <AlertCircle size={18} className="text-red-400 shrink-0" />
    <p className="text-sm text-red-400 flex-1">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs font-bold text-text-secondary hover:text-text-primary border border-border rounded-lg px-3 py-1.5 hover:bg-surface-2 transition-colors"
      >
        Tentar novamente
      </button>
    )}
  </div>
);

const TableSkeleton: React.FC<{ rows?: number; cols: number }> = ({ rows = 5, cols }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-6 py-4">
            <div className="h-4 bg-surface-2 rounded animate-pulse" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const EmptyRow: React.FC<{ cols: number; message: string }> = ({ cols, message }) => (
  <tr>
    <td colSpan={cols} className="px-6 py-16 text-center text-text-muted font-medium">
      {message}
    </td>
  </tr>
);

interface PaginationBarProps {
  meta: ListMeta;
  page: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ meta, page, loading, onPageChange }) => (
  <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-bg/40">
    <span className="text-xs text-text-muted font-medium">
      {loading
        ? '...'
        : meta.total === 0
          ? 'Nenhum registro'
          : `Exibindo ${(page - 1) * meta.limit + 1}–${Math.min(page * meta.limit, meta.total)} de ${meta.total}`}
    </span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <span className="text-xs text-text-muted font-mono">
        {page}/{Math.max(1, meta.totalPages)}
      </span>
      <button
        onClick={() => onPageChange(Math.min(meta.totalPages, page + 1))}
        disabled={page >= meta.totalPages}
        className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Próxima
      </button>
    </div>
  </div>
);

const BillingKpiCard: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
  hint?: string;
  tone?: 'default' | 'positive' | 'negative';
  loading?: boolean;
}> = ({ icon, value, label, hint, tone = 'default', loading }) => {
  const toneClass =
    tone === 'positive'
      ? 'text-green-400'
      : tone === 'negative'
        ? 'text-red-400'
        : 'text-text-primary';
  return (
    <div className="bg-surface border border-border p-5 rounded-2xl hover:border-border-strong transition-colors">
      <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 mb-4">
        {icon}
      </div>
      {loading ? (
        <div className="h-8 w-28 bg-surface-2 rounded animate-pulse mb-1" />
      ) : (
        <h3 className={`text-2xl font-black tracking-tighter mb-1 ${toneClass}`}>{value}</h3>
      )}
      <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">{label}</p>
      {hint && <p className="text-[10px] text-text-muted mt-1">{hint}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────
// Badges
// ─────────────────────────────────────────────

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  approved: { label: 'Aprovado', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  authorized: {
    label: 'Autorizado',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  pending: {
    label: 'Pendente',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  in_process: {
    label: 'Em análise',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  in_mediation: {
    label: 'Mediação',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  rejected: { label: 'Rejeitado', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  cancelled: { label: 'Cancelado', className: 'bg-surface-2 text-text-muted border-border-strong' },
  refunded: {
    label: 'Reembolsado',
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  charged_back: { label: 'Chargeback', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = PAYMENT_STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-surface-2 text-text-muted border-border-strong',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
};

const SUBSCRIPTION_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Ativa', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  TRIALING: { label: 'Trial', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  PAST_DUE: {
    label: 'Em atraso',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  UNPAID: { label: 'Não paga', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  CANCELED: { label: 'Cancelada', className: 'bg-surface-2 text-text-muted border-border-strong' },
};

const SubscriptionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = SUBSCRIPTION_STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-surface-2 text-text-muted border-border-strong',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Crédito',
  debit_card: 'Débito',
  pix: 'PIX',
  payment_link: 'Link',
  asaas: 'Asaas',
};

const CANCEL_REASON_LABELS: Record<string, string> = {
  price: 'Preço alto / quero pagar menos',
  low_usage: 'Não uso o suficiente',
  migrating: 'Vou migrar para outro sistema',
  missing_features: 'Faltam funcionalidades',
  technical_issues: 'Problemas técnicos',
  closing: 'Vou encerrar o salão',
  other: 'Outro',
};

function paymentRefLabel(p: PaymentListItem): string {
  if (p.mpPaymentId) return `MP #${p.mpPaymentId}`;
  if (p.providerPaymentId) return `${p.provider ?? 'ABACATEPAY'} #${p.providerPaymentId}`;
  return p.provider ?? '—';
}

function PaymentMethodIcon({ method }: { method: string }) {
  if (method === 'pix') return <QrCode size={12} />;
  if (method === 'payment_link') return <ExternalLink size={12} />;
  if (method === 'asaas') return <Landmark size={12} />;
  return <CreditCard size={12} />;
}

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
          <div className="bg-red-500/5 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-2.5 mb-4">
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
          className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all resize-none"
        />
        <p className="text-[10px] text-text-muted text-right mt-1">{reason.length}/500</p>

        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 flex gap-2 mt-3">
          <AlertCircle size={15} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-400">
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
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {busy ? <RefreshCcw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            Confirmar reembolso
          </button>
        </div>
      </div>
    </div>
  );
};

const EXPENSE_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fixa',
  VARIABLE: 'Variável',
  ONE_TIME: 'Pontual',
};

// ─────────────────────────────────────────────
// Seção: Receita / KPIs
// ─────────────────────────────────────────────

const RevenueSection: React.FC = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, summaryRes] = await Promise.all([
        adminApi.getFinancialOverview(),
        adminApi.getFinancialSummary(),
      ]);
      setOverview(overviewRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) return <SectionError message={error} onRetry={fetchData} />;

  const byType = summary?.expenses.byType ?? [];
  const maxByType = Math.max(...byType.map(t => t.total), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <BillingKpiCard
          icon={<Wallet size={16} />}
          value={overview ? brl.format(overview.expenses.thisMonth) : '—'}
          label="Despesas no mês"
          hint="Despesas registradas pelas barbearias"
          loading={loading}
        />
        <BillingKpiCard
          icon={<Receipt size={16} />}
          value={overview ? brl.format(overview.expenses.allTime) : '—'}
          label="Despesas acumuladas"
          hint={overview ? `${overview.expenses.count} lançamentos` : undefined}
          loading={loading}
        />
        <BillingKpiCard
          icon={<AlertCircle size={16} />}
          value={overview ? brl.format(overview.fiados.totalDebtPending) : '—'}
          label="Fiado pendente"
          hint={overview ? `${overview.fiados.activeDebtors} devedores ativos` : undefined}
          tone="negative"
          loading={loading}
        />
        <BillingKpiCard
          icon={<Ban size={16} />}
          value={overview ? String(overview.fiados.overdueCount) : '—'}
          label="Fiados vencidos"
          hint={overview ? `${overview.fiados.barbershopsWithDebt} salões com dívida` : undefined}
          tone="negative"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Despesas por tipo */}
        <div className="bg-surface border border-border rounded-2xl p-6 hover:border-border-strong transition-colors">
          <h3 className="text-sm font-bold text-text-primary mb-4">Despesas por tipo</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 bg-surface-2/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : byType.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center">Nenhuma despesa registrada.</p>
          ) : (
            <div className="space-y-4">
              {byType.map(item => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-text-secondary">
                      {EXPENSE_TYPE_LABELS[item.type] ?? item.type}
                      <span className="text-text-muted font-medium ml-2">({item.count})</span>
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      {brl.format(item.total)}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.total / maxByType) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-linear-to-r from-violet-500/60 to-violet-400/80 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo de fiados */}
        <div className="bg-surface border border-border rounded-2xl p-6 hover:border-border-strong transition-colors">
          <h3 className="text-sm font-bold text-text-primary mb-4">
            Fiados (crédito com clientes)
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-surface-2/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : summary ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg/40 border border-border rounded-xl p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-1">
                  Total original
                </p>
                <p className="text-lg font-black text-text-primary">
                  {brl.format(summary.fiados.totalOriginal)}
                </p>
              </div>
              <div className="bg-bg/40 border border-border rounded-xl p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-1">
                  Total pago
                </p>
                <p className="text-lg font-black text-green-400">
                  {brl.format(summary.fiados.totalPaid)}
                </p>
              </div>
              <div className="bg-bg/40 border border-border rounded-xl p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-1">
                  Pendente
                </p>
                <p className="text-lg font-black text-yellow-400">
                  {brl.format(summary.fiados.totalPending)}
                </p>
              </div>
              <div className="bg-bg/40 border border-border rounded-xl p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-1">
                  Vencido ({summary.fiados.overdueCount})
                </p>
                <p className="text-lg font-black text-red-400">
                  {brl.format(summary.fiados.overdueAmount)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Seção: Pagamentos
// ─────────────────────────────────────────────

const PaymentsSection: React.FC<{ shopNames: Map<string, string> }> = ({ shopNames }) => {
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
        <div className="mx-4 mt-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl px-4 py-2.5 flex items-center gap-2">
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
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/10 rounded-lg px-2.5 py-1.5 transition-all"
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

// ─────────────────────────────────────────────
// Seção: Assinaturas
// ─────────────────────────────────────────────

const SUBSCRIPTION_FILTERS = [
  'all',
  'ACTIVE',
  'TRIALING',
  'PAST_DUE',
  'CANCELED',
  'UNPAID',
] as const;

const SubscriptionsSection: React.FC = () => {
  const [subs, setSubs] = useState<SubscriptionListItem[]>([]);
  const [meta, setMeta] = useState<ListMeta>(EMPTY_META);
  const [economics, setEconomics] = useState<SubscriptionEconomics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchEconomics = useCallback(async () => {
    try {
      const res = await adminApi.getSubscriptionEconomics();
      setEconomics(res.data);
    } catch {
      /* KPIs opcionais */
    }
  }, []);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listSubscriptions({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      });
      setSubs(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchEconomics();
  }, [fetchEconomics]);

  useEffect(() => {
    const timer = setTimeout(fetchSubs, 300);
    return () => clearTimeout(timer);
  }, [fetchSubs]);

  const handleCancel = async (barbershopId: string, shopName?: string) => {
    if (!window.confirm(`Cancelar assinatura de "${shopName ?? barbershopId}"?`)) return;
    setCancellingId(barbershopId);
    try {
      await adminApi.cancelSubscription(barbershopId);
      await Promise.all([fetchSubs(), fetchEconomics()]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {economics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="bg-surface border border-border rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
              Economia dos salões (acumulada)
            </p>
            <p className="text-xl font-bold text-success mt-1">
              {brl.format(economics.totalTenantSavingsSoFar)}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              Desconto do anual vs mensal até agora ({economics.activeYearlySubscriptions}{' '}
              anual(is))
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
              Receita deixada de ganhar
            </p>
            <p className="text-xl font-bold text-warning mt-1">
              {brl.format(economics.totalPlatformForegoneSoFar)}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              Mesmo desconto, na visão da plataforma
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
              Desconto projetado / ano
            </p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {brl.format(economics.projectedAnnualDiscount)}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              {brl.format(economics.yearlySavingsPerYear)} por assinatura anual
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
              Mix ativo
            </p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {economics.activeMonthlySubscriptions}m / {economics.activeYearlySubscriptions}a
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              Mensal{' '}
              {economics.monthlyPlanPrice != null ? brl.format(economics.monthlyPlanPrice) : '—'} ·
              Anual{' '}
              {economics.yearlyPlanPrice != null ? brl.format(economics.yearlyPlanPrice) : '—'}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por salão ou CNPJ..."
            className="w-full bg-surface border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1 overflow-x-auto scroller-hidden">
          {SUBSCRIPTION_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-violet-500 text-black'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {s === 'all' ? 'Todas' : (SUBSCRIPTION_STATUS_CONFIG[s]?.label ?? s)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <SectionError message={error} onRetry={fetchSubs} />
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-text-muted uppercase text-[10px] font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Salão</th>
                  <th className="px-6 py-3.5">Plano</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 hidden lg:table-cell">Início</th>
                  <th className="px-6 py-3.5 hidden lg:table-cell">Vencimento</th>
                  <th className="px-6 py-3.5 hidden xl:table-cell">Fim do trial</th>
                  <th className="px-6 py-3.5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <TableSkeleton cols={7} />
                ) : subs.length === 0 ? (
                  <EmptyRow cols={7} message="Nenhuma assinatura encontrada." />
                ) : (
                  subs.map(s => (
                    <tr key={s.id} className="hover:bg-surface-2/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-text-primary text-sm max-w-[180px] truncate">
                          {s.barbershopName ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-text-secondary font-medium">
                          {s.planName ?? '—'}
                        </div>
                        {s.planPrice != null && (
                          <div className="text-[10px] text-text-muted">
                            {brl.format(s.planPrice)}
                            {s.planBillingCycle === 'YEARLY' ? '/ano' : '/mês'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <SubscriptionStatusBadge status={s.status} />
                        {s.cancelReason && (
                          <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                            Motivo: {CANCEL_REASON_LABELS[s.cancelReason] ?? s.cancelReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs text-text-secondary">
                          {formatDate(s.startDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs text-text-secondary">{formatDate(s.endDate)}</span>
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <span className="text-xs text-text-secondary">
                          {formatDate(s.trialEndsAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {s.status !== 'CANCELED' ? (
                          <button
                            onClick={() => handleCancel(s.barbershopId, s.barbershopName)}
                            disabled={cancellingId === s.barbershopId}
                            className="text-[10px] font-bold uppercase tracking-wider text-danger hover:underline disabled:opacity-50"
                          >
                            {cancellingId === s.barbershopId ? '…' : 'Cancelar'}
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
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Seção: Planos
// ─────────────────────────────────────────────

interface PlanFormModalProps {
  plan: PlanItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ plan, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    price: plan ? String(plan.price) : '',
    billingCycle: (plan?.billingCycle ?? 'MONTHLY') as 'MONTHLY' | 'YEARLY',
    maxEmployees: plan ? String(plan.maxEmployees) : '0',
    hasDashboard: plan?.hasDashboard ?? true,
    tierKey: plan?.tierKey ?? 'pro',
    features: plan?.features.join('\n') ?? '',
    active: plan?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price.replace(',', '.'));
    const maxEmployees = Number(form.maxEmployees);
    const features = form.features
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    if (!price || price <= 0) {
      setError('Informe um preço válido.');
      return;
    }
    if (Number.isNaN(maxEmployees) || maxEmployees < 0) {
      setError('Máx. funcionários: 0 = ilimitado.');
      return;
    }
    if (features.length === 0) {
      setError('Informe ao menos uma feature (uma por linha).');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (plan) {
        await adminApi.updatePlan(plan.id, {
          name: form.name,
          description: form.description || undefined,
          price,
          billingCycle: form.billingCycle,
          maxEmployees,
          hasDashboard: form.hasDashboard,
          tierKey: form.tierKey,
          features,
          active: form.active,
        });
      } else {
        await adminApi.createPlan({
          name: form.name,
          description: form.description || undefined,
          price,
          billingCycle: form.billingCycle,
          maxEmployees,
          hasDashboard: form.hasDashboard,
          tierKey: form.tierKey,
          features,
        });
      }
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-bold text-text-primary tracking-tight">
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Nome
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all"
              placeholder="Ex: Plano Pro"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Descrição
            </label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all"
              placeholder="Descrição curta do plano"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Preço ({form.billingCycle === 'YEARLY' ? 'anual' : 'mensal'}) (R$)
              </label>
              <input
                type="text"
                required
                inputMode="decimal"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all"
                placeholder="99.90"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Ciclo
              </label>
              <SmartSelect
                mode="single"
                options={[{ value: 'MONTHLY', label: 'Mensal' }, { value: 'YEARLY', label: 'Anual' }]}
                value={form.billingCycle}
                onChange={value => setForm({ ...form, billingCycle: (value ?? 'MONTHLY') as 'MONTHLY' | 'YEARLY' })}
                searchable={false}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Máx. funcionários (0 = ilimitado)
            </label>
            <input
              type="number"
              required
              min={0}
              value={form.maxEmployees}
              onChange={e => setForm({ ...form, maxEmployees: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Tier
              </label>
              <select
                value={form.tierKey}
                onChange={e => setForm({ ...form, tierKey: e.target.value })}
                className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all"
              >
                <option value="essential">essential</option>
                <option value="pro">pro</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, hasDashboard: !form.hasDashboard })}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  form.hasDashboard
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-surface-2 text-text-muted border-border'
                }`}
              >
                {form.hasDashboard ? 'Com dashboard' : 'Sem dashboard'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Features (uma por linha)
            </label>
            <textarea
              required
              rows={4}
              value={form.features}
              onChange={e => setForm({ ...form, features: e.target.value })}
              className="w-full bg-bg border border-border text-text-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-all resize-none"
              placeholder={'Fila digital\nAgendamentos ilimitados\nRelatórios'}
            />
          </div>
          {plan && (
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                form.active
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}
            >
              {form.active ? <CheckCircle2 size={16} /> : <Ban size={16} />}
              {form.active ? 'Plano ativo' : 'Plano inativo'}
            </button>
          )}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-xl text-sm font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-violet-500 text-black rounded-xl text-sm font-bold hover:bg-violet-400 transition-all disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const PlansSection: React.FC = () => {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listPlans(true);
      setPlans(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDeactivate = async (plan: PlanItem) => {
    if (
      !confirm(
        `Desativar o plano "${plan.name}"? Salões que já assinam continuam até o vencimento.`
      )
    )
      return;
    try {
      const res = await adminApi.deactivatePlan(plan.id);
      if (res.data?.info) alert(res.data.info);
      fetchPlans();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  if (error) return <SectionError message={error} onRetry={fetchPlans} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedPlan(null);
            setModalOpen(true);
          }}
          className="bg-violet-500 hover:bg-violet-400 text-black px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={16} />
          Novo Plano
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 bg-surface-2/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl px-6 py-16 text-center text-text-muted font-medium">
          Nenhum plano cadastrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-surface border rounded-2xl p-5 flex flex-col gap-3 transition-colors ${
                plan.active
                  ? 'border-border hover:border-border-strong'
                  : 'border-border opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-text-primary truncate">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                    plan.active
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-surface-2 text-text-muted border-border-strong'
                  }`}
                >
                  {plan.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div>
                <span className="text-2xl font-black text-text-primary tracking-tighter">
                  {brl.format(plan.price)}
                </span>
                <span className="text-xs text-text-muted">
                  /{plan.billingCycle === 'YEARLY' ? 'ano' : 'mês'}
                </span>
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">
                {plan.maxEmployees === 0
                  ? 'Funcionários ilimitados'
                  : `Até ${plan.maxEmployees} funcionário${plan.maxEmployees !== 1 ? 's' : ''}`}
                {' · '}
                {plan.hasDashboard === false ? 'Sem dashboard' : 'Com dashboard'}
              </p>
              <ul className="space-y-1.5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 size={12} className="text-violet-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
                >
                  <Pencil size={12} />
                  Editar
                </button>
                {plan.active && (
                  <button
                    onClick={() => handleDeactivate(plan)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={12} />
                    Desativar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <PlanFormModal
          plan={selectedPlan}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchPlans();
          }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Seção: Bloqueios (inadimplência)
// ─────────────────────────────────────────────

const BlockedSection: React.FC = () => {
  const [entities, setEntities] = useState<BlockedEntityItem[]>([]);
  const [meta, setMeta] = useState<ListMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listBlockedEntities({
        page,
        limit: 10,
        isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
        search: search || undefined,
      });
      setEntities(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchEntities, 300);
    return () => clearTimeout(timer);
  }, [fetchEntities]);

  const handleUnblock = async (entity: BlockedEntityItem) => {
    if (
      !confirm(
        `Desbloquear ${entity.type} ${entity.value}? O acesso será restaurado imediatamente.`
      )
    )
      return;
    setUnblockingId(entity.id);
    try {
      await adminApi.unblockEntity(entity.id);
      fetchEntities();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por valor ou motivo..."
            className="w-full bg-surface border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1">
          {(['active', 'inactive', 'all'] as const).map(s => (
            <button
              key={s}
              onClick={() => {
                setActiveFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeFilter === s
                  ? 'bg-violet-500 text-black'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {s === 'active' ? 'Bloqueados' : s === 'inactive' ? 'Desbloqueados' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <SectionError message={error} onRetry={fetchEntities} />
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-text-muted uppercase text-[10px] font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Tipo / Valor</th>
                  <th className="px-6 py-3.5 hidden md:table-cell">Motivo</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 hidden lg:table-cell">Bloqueado em</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <TableSkeleton cols={5} />
                ) : entities.length === 0 ? (
                  <EmptyRow cols={5} message="Nenhum bloqueio encontrado." />
                ) : (
                  entities.map(entity => (
                    <tr key={entity.id} className="hover:bg-surface-2/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-surface-2 text-text-secondary border-border-strong mr-2">
                          {entity.type}
                        </span>
                        <span className="font-mono text-sm text-text-primary">{entity.value}</span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs text-text-secondary max-w-[220px] truncate block">
                          {entity.reason ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                            entity.isActive
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-green-500/10 text-green-400 border-green-500/20'
                          }`}
                        >
                          {entity.isActive ? <Ban size={9} /> : <CheckCircle2 size={9} />}
                          {entity.isActive ? 'Bloqueado' : 'Desbloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs text-text-secondary">
                          {formatDateTime(entity.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {entity.isActive && (
                          <button
                            onClick={() => handleUnblock(entity)}
                            disabled={unblockingId === entity.id}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 border border-green-500/20 hover:bg-green-500/10 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
                          >
                            {unblockingId === entity.id ? (
                              <RefreshCcw size={12} className="animate-spin" />
                            ) : (
                              <Unlock size={12} />
                            )}
                            Desbloquear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <PaginationBar meta={meta} page={page} loading={loading} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Notificações admin
// ─────────────────────────────────────────────

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  BLOCK_AUTO: 'Bloqueio automático',
  UNBLOCK_AUTO: 'Desbloqueio automático',
  UNBLOCK_MANUAL: 'Desbloqueio manual',
  SUBSCRIPTION_EXPIRED: 'Assinatura expirada',
  PAYMENT_RECEIVED: 'Pagamento recebido',
  CONTACT_MESSAGE: 'Mensagem de contato',
};

const NotificationsSection: React.FC = () => {
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listNotifications({
        page,
        limit: 20,
        read: filter === 'unread' ? false : undefined,
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e?.message ?? 'Falha ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await adminApi.markNotificationRead(id);
      setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      setMeta(prev => (prev ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) } : prev));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      setMeta(prev => (prev ? { ...prev, unreadCount: 0 } : prev));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2 border border-transparent'
              }`}
            >
              {f === 'all'
                ? 'Todas'
                : `Não lidas${meta?.unreadCount ? ` (${meta.unreadCount})` : ''}`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {(meta?.unreadCount ?? 0) > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 border border-violet-500/20 hover:bg-violet-500/10 rounded-lg px-3 py-1.5 transition-all"
            >
              Marcar todas como lidas
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all disabled:opacity-50"
            aria-label="Atualizar"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error ? (
        <SectionError message={error} onRetry={fetchNotifications} />
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-text-muted uppercase text-[10px] font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Notificação</th>
                  <th className="px-6 py-3.5 hidden md:table-cell">Tipo</th>
                  <th className="px-6 py-3.5 hidden lg:table-cell">Data</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <TableSkeleton cols={4} />
                ) : items.length === 0 ? (
                  <EmptyRow cols={4} message="Nenhuma notificação encontrada." />
                ) : (
                  items.map(n => (
                    <tr
                      key={n.id}
                      className={`hover:bg-surface-2/20 transition-colors ${!n.read ? 'bg-violet-500/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p
                          className={`text-sm ${n.read ? 'text-text-secondary' : 'text-text-primary font-semibold'}`}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 max-w-md">{n.message}</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs text-text-secondary">
                          {NOTIFICATION_TYPE_LABELS[n.type] ?? n.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs text-text-secondary">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {n.read ? (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            Lida
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-xs font-bold text-violet-400 hover:text-violet-300 border border-violet-500/20 hover:bg-violet-500/10 rounded-lg px-3 py-1.5 transition-all"
                          >
                            Marcar lida
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {meta && (
            <PaginationBar meta={meta} page={page} loading={loading} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Seção: Reembolsos
// ─────────────────────────────────────────────

const REFUND_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SUCCEEDED: {
    label: 'Concluído',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  FAILED: { label: 'Falhou', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  PENDING: {
    label: 'Pendente',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  RECONCILIATION_REQUIRED: {
    label: 'Conciliação pendente',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
};

const RefundStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = REFUND_STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-surface-2 text-text-muted border-border-strong',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
};

const RefundsSection: React.FC<{ shopNames: Map<string, string> }> = ({ shopNames }) => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentsApi.listRefunds();
      setRefunds(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  if (error) return <SectionError message={error} onRetry={fetchRefunds} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Estornos solicitados sobre pagamentos aprovados. Status atualizado pelo provedor.
        </p>
        <button
          onClick={fetchRefunds}
          disabled={loading}
          className="p-2 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all disabled:opacity-50"
          aria-label="Atualizar"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-text-muted uppercase text-[10px] font-bold tracking-widest border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Valor</th>
                <th className="px-6 py-3.5 hidden md:table-cell">Motivo</th>
                <th className="px-6 py-3.5 hidden lg:table-cell">Salão</th>
                <th className="px-6 py-3.5">Provedor</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 hidden lg:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <TableSkeleton cols={6} />
              ) : refunds.length === 0 ? (
                <EmptyRow cols={6} message="Nenhum reembolso encontrado." />
              ) : (
                refunds.map(r => (
                  <tr key={r.id} className="hover:bg-surface-2/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-text-primary">{brl.format(r.amount)}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs text-text-secondary max-w-[240px] truncate block">
                        {r.reason || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs text-text-secondary max-w-[160px] truncate block">
                        {shopNames.get(r.barbershopId) ?? r.barbershopId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-text-secondary font-medium">{r.provider}</span>
                    </td>
                    <td className="px-6 py-4">
                      <RefundStatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs text-text-secondary">{formatDate(r.createdAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// BillingTab (raiz)
// ─────────────────────────────────────────────

type BillingSection =
  'revenue' | 'payments' | 'refunds' | 'subscriptions' | 'plans' | 'blocked' | 'notifications';

const SECTION_OPTIONS: { value: BillingSection; icon: React.ReactNode; label: string }[] = [
  { value: 'revenue', icon: <Wallet size={14} />, label: 'Receita' },
  { value: 'payments', icon: <CreditCard size={14} />, label: 'Pagamentos' },
  { value: 'refunds', icon: <RotateCcw size={14} />, label: 'Reembolsos' },
  { value: 'subscriptions', icon: <Receipt size={14} />, label: 'Assinaturas' },
  { value: 'plans', icon: <Layers size={14} />, label: 'Planos' },
  { value: 'blocked', icon: <Ban size={14} />, label: 'Bloqueios' },
  { value: 'notifications', icon: <Bell size={14} />, label: 'Notificações' },
];

export const BillingTab: React.FC = () => {
  const [section, setSection] = useState<BillingSection>('revenue');
  const [shopNames, setShopNames] = useState<Map<string, string>>(new Map());

  // Nome dos salões para exibir na listagem de pagamentos (endpoint só retorna barbershopId)
  useEffect(() => {
    adminApi
      .listBarbershops({ limit: 100 })
      .then(res => setShopNames(new Map(res.data.map(s => [s.id, s.name]))))
      .catch(() => {
        /* fallback: exibe o ID */
      });
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Faturamento</h2>
          <p className="text-text-secondary text-sm mt-1">
            Pagamentos, assinaturas, planos e inadimplência da plataforma
          </p>
        </div>
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 overflow-x-auto scroller-hidden">
          {SECTION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSection(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                section === opt.value
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {section === 'revenue' && <RevenueSection />}
      {section === 'payments' && <PaymentsSection shopNames={shopNames} />}
      {section === 'refunds' && <RefundsSection shopNames={shopNames} />}
      {section === 'subscriptions' && <SubscriptionsSection />}
      {section === 'plans' && <PlansSection />}
      {section === 'blocked' && <BlockedSection />}
      {section === 'notifications' && (
        <div className="space-y-8">
          <NotificationHealthPanel />
          <NotificationDeliveriesPanel
            masterAdmin
            barbershops={Array.from(shopNames, ([id, name]) => ({ id, name }))}
          />
          <div>
            <h3 className="mb-3 text-lg font-bold text-text-primary">Alertas administrativos</h3>
            <NotificationsSection />
          </div>
        </div>
      )}
    </div>
  );
};
