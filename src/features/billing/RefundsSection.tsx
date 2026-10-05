import React, { useState, useEffect, useCallback } from 'react';
import { paymentsApi, Refund } from '../../infra/paymentsApi';
import {
  brl,
  errorMessage,
  formatDate,
  SectionError,
} from './billingShared';
import { DataTableState } from '../../components/patterns';
import { LuRefreshCcw as RefreshCcw } from 'react-icons/lu';

// ─────────────────────────────────────────────
// Seção: Reembolsos
// ─────────────────────────────────────────────

const REFUND_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SUCCEEDED: {
    label: 'Concluído',
    className: 'bg-success/10 text-success border-success/20',
  },
  FAILED: { label: 'Falhou', className: 'bg-danger/10 text-danger border-danger/20' },
  PENDING: {
    label: 'Pendente',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  RECONCILIATION_REQUIRED: {
    label: 'Conciliação pendente',
    className: 'bg-warning/10 text-warning border-warning/20',
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

export const RefundsSection: React.FC<{ shopNames: Map<string, string> }> = ({ shopNames }) => {
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
      {loading || refunds.length === 0 ? (
        <DataTableState
          loading={loading}
          isEmpty={!loading}
          emptyTitle="Nenhum reembolso encontrado."
          skeletonProps={{ cols: 6 }}
        />
      ) : (
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
                {refunds.map(r => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
