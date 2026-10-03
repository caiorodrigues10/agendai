import React from 'react';
import { ListMeta, PaymentListItem } from '../../infra/adminApi';
import { getErrorMessage } from '../../utils/errorMessage';
import {
  LuCircleAlert as AlertCircle,
  LuQrCode as QrCode,
  LuExternalLink as ExternalLink,
  LuLandmark as Landmark,
  LuCreditCard as CreditCard,
} from 'react-icons/lu';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '—';

export const formatDateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString('pt-BR') : '—';

export const errorMessage = (err: unknown): string => getErrorMessage(err);

export const EMPTY_META: ListMeta = { total: 0, page: 1, limit: 10, totalPages: 1 };

// ─────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────

export const SectionError: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="bg-danger/5 border border-danger/20 rounded-2xl p-5 flex items-center gap-3">
    <AlertCircle size={18} className="text-danger shrink-0" />
    <p className="text-sm text-danger flex-1">{message}</p>
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

export const TableSkeleton: React.FC<{ rows?: number; cols: number }> = ({ rows = 5, cols }) => (
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

export const EmptyRow: React.FC<{ cols: number; message: string }> = ({ cols, message }) => (
  <tr>
    <td colSpan={cols} className="px-6 py-16 text-center text-text-muted font-medium">
      {message}
    </td>
  </tr>
);

export interface PaginationBarProps {
  meta: ListMeta;
  page: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({ meta, page, loading, onPageChange }) => (
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

export const BillingKpiCard: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
  hint?: string;
  tone?: 'default' | 'positive' | 'negative';
  loading?: boolean;
}> = ({ icon, value, label, hint, tone = 'default', loading }) => {
  const toneClass =
    tone === 'positive'
      ? 'text-success'
      : tone === 'negative'
        ? 'text-danger'
        : 'text-text-primary';
  return (
    <div className="bg-surface border border-border p-5 rounded-2xl hover:border-border-strong transition-colors">
      <div className="w-9 h-9 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent mb-4">
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

export const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  approved: { label: 'Aprovado', className: 'bg-success/10 text-success border-success/20' },
  authorized: {
    label: 'Autorizado',
    className: 'bg-success/10 text-success border-success/20',
  },
  pending: {
    label: 'Pendente',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  in_process: {
    label: 'Em análise',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  in_mediation: {
    label: 'Mediação',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  rejected: { label: 'Rejeitado', className: 'bg-danger/10 text-danger border-danger/20' },
  cancelled: { label: 'Cancelado', className: 'bg-surface-2 text-text-muted border-border-strong' },
  refunded: {
    label: 'Reembolsado',
    className: 'bg-support/10 text-support border-support/20',
  },
  charged_back: { label: 'Chargeback', className: 'bg-danger/10 text-danger border-danger/20' },
};

export const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
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

export const SUBSCRIPTION_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Ativa', className: 'bg-success/10 text-success border-success/20' },
  TRIALING: { label: 'Trial', className: 'bg-support/10 text-support border-support/20' },
  PAST_DUE: {
    label: 'Em atraso',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  UNPAID: { label: 'Não paga', className: 'bg-danger/10 text-danger border-danger/20' },
  CANCELED: { label: 'Cancelada', className: 'bg-surface-2 text-text-muted border-border-strong' },
};

export const SubscriptionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
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

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Crédito',
  debit_card: 'Débito',
  pix: 'PIX',
  payment_link: 'Link',
  asaas: 'Asaas',
};

export const CANCEL_REASON_LABELS: Record<string, string> = {
  price: 'Preço alto / quero pagar menos',
  low_usage: 'Não uso o suficiente',
  migrating: 'Vou migrar para outro sistema',
  missing_features: 'Faltam funcionalidades',
  technical_issues: 'Problemas técnicos',
  closing: 'Vou encerrar o salão',
  other: 'Outro',
};

export function paymentRefLabel(p: PaymentListItem): string {
  if (p.mpPaymentId) return `MP #${p.mpPaymentId}`;
  if (p.providerPaymentId) return `${p.provider ?? 'ABACATEPAY'} #${p.providerPaymentId}`;
  return p.provider ?? '—';
}

export function PaymentMethodIcon({ method }: { method: string }) {
  if (method === 'pix') return <QrCode size={12} />;
  if (method === 'payment_link') return <ExternalLink size={12} />;
  if (method === 'asaas') return <Landmark size={12} />;
  return <CreditCard size={12} />;
}
