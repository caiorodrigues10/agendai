import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { adminApi, FinancialOverview, FinancialSummary } from '../../infra/adminApi';
import { brl, errorMessage, SectionError, BillingKpiCard } from './billingShared';
import {
  LuWallet as Wallet,
  LuReceipt as Receipt,
  LuCircleAlert as AlertCircle,
  LuBan as Ban,
} from 'react-icons/lu';

const EXPENSE_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fixa',
  VARIABLE: 'Variável',
  ONE_TIME: 'Pontual',
};

// ─────────────────────────────────────────────
// Seção: Receita / KPIs
// ─────────────────────────────────────────────

export const RevenueSection: React.FC = () => {
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
                      className="h-full bg-linear-to-r from-chart-2/60 to-chart-2/80 rounded-full"
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
                <p className="text-lg font-black text-success">
                  {brl.format(summary.fiados.totalPaid)}
                </p>
              </div>
              <div className="bg-bg/40 border border-border rounded-xl p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-1">
                  Pendente
                </p>
                <p className="text-lg font-black text-warning">
                  {brl.format(summary.fiados.totalPending)}
                </p>
              </div>
              <div className="bg-bg/40 border border-border rounded-xl p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-1">
                  Vencido ({summary.fiados.overdueCount})
                </p>
                <p className="text-lg font-black text-danger">
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
