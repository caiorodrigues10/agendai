import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LuWallet as Wallet,
  LuReceipt as Receipt,
  LuCircleAlert as AlertCircle,
  LuLayers as Layers,
  LuLandmark as Landmark,
  LuCreditCard as CreditCard,
  LuBan as Ban,
} from 'react-icons/lu';
import { adminApi, BillingSummary } from '../../infra/adminApi';
import { BillingKpiCard, brl, errorMessage, SectionError } from './billingShared';

// ─────────────────────────────────────────────
// Seção: Resumo de cobrança da plataforma
// ─────────────────────────────────────────────

const money = (value: number | undefined): string =>
  value === undefined ? '—' : brl.format(value);

const countHint = (value: number | undefined, label: string): string | undefined =>
  value === undefined ? undefined : `${value} ${label}`;

const toneForDelta = (delta: number | null): 'positive' | 'negative' =>
  delta === null || delta >= 0 ? 'positive' : 'negative';

const EMPTY_BILLING_SUMMARY: BillingSummary = {
  generatedAt: '',
  period: { from: '', to: '' },
  collected: { month: 0, prevMonth: 0, deltaPct: null, year: 0, invoicesMonth: 0 },
  receivables: { pending: 0, pendingCount: 0, overdue: 0, overdueCount: 0, dueNext7d: 0, dueNext7dCount: 0 },
  mrr: { total: 0, byPlan: [] },
  renewals: { endingIn7d: 0, endingIn7dCount: 0, trialingEndingIn7d: 0, trialingEndingIn7dCount: 0 },
  churn: { canceledIn30d: 0, canceledRevenueIn30d: 0, pastDue: 0, pastDueCount: 0 },
  collectionRatePct: null,
};

const BillingSummaryKpis: React.FC<{
  data: BillingSummary | null;
  loading: boolean;
}> = ({ data, loading }) => {
  const s = data ?? EMPTY_BILLING_SUMMARY;
  const delta = s.collected.deltaPct;
  const deltaHint =
    delta === null ? 'Sem base de comparação' : `${delta >= 0 ? '+' : ''}${delta}% vs mês anterior`;

  const primary: {
    icon: React.ReactNode;
    value: string;
    label: string;
    hint?: string;
    tone?: 'default' | 'positive' | 'negative';
  }[] = [
    {
      icon: <Wallet size={16} />,
      value: money(s.collected.month),
      label: 'Coletado no mês',
      hint: data ? `${s.collected.invoicesMonth} fatura(s) · ${deltaHint}` : undefined,
      tone: toneForDelta(delta),
    },
    {
      icon: <Receipt size={16} />,
      value: money(s.receivables.pending),
      label: 'A receber',
      hint: countHint(s.receivables.pendingCount, 'fatura(s) pendente(s)'),
    },
    {
      icon: <AlertCircle size={16} />,
      value: money(s.receivables.overdue),
      label: 'Inadimplência',
      hint: countHint(s.receivables.overdueCount, 'fatura(s) vencida(s)'),
      tone: 'negative',
    },
    {
      icon: <Layers size={16} />,
      value: money(s.mrr.total),
      label: 'MRR',
      hint: countHint(s.mrr.byPlan.length, 'plano(s) com assinantes'),
    },
  ];

  const secondary: {
    icon: React.ReactNode;
    value: string;
    label: string;
    hint?: string;
    tone?: 'default' | 'positive' | 'negative';
  }[] = [
    {
      icon: <Landmark size={16} />,
      value: s.collectionRatePct !== null ? `${s.collectionRatePct}%` : '—',
      label: 'Taxa de cobrança (90d)',
      hint: 'Faturas pagas sobre as emitidas',
    },
    {
      icon: <CreditCard size={16} />,
      value: money(s.receivables.dueNext7d),
      label: 'Vencendo em 7 dias',
      hint: countHint(s.receivables.dueNext7dCount, 'fatura(s)'),
    },
    {
      icon: <Receipt size={16} />,
      value: String(s.renewals.endingIn7dCount),
      label: 'Renovações em 7 dias',
      hint: money(s.renewals.endingIn7d),
    },
    {
      icon: <Ban size={16} />,
      value: String(s.churn.canceledIn30d),
      label: 'Cancelamentos (30d)',
      hint: data ? `${brl.format(s.churn.canceledRevenueIn30d)} de recorrência perdida` : undefined,
      tone: 'negative',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {primary.map(card => (
          <BillingKpiCard key={card.label} loading={loading} {...card} />
        ))}
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {secondary.map(card => (
          <BillingKpiCard key={card.label} loading={loading} {...card} />
        ))}
      </div>
    </>
  );
};

const BillingMrrByPlan: React.FC<{
  data: BillingSummary | null;
  loading: boolean;
}> = ({ data, loading }) => {
  const byPlan = data?.mrr.byPlan ?? [];
  const maxMrr = Math.max(...byPlan.map(p => p.monthlyValue), 1);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 hover:border-border-strong transition-colors">
      <h3 className="text-sm font-bold text-text-primary mb-4">MRR por plano</h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-surface-2/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : byPlan.length === 0 ? (
        <p className="text-sm text-text-muted py-6 text-center">
          Nenhuma assinatura ativa no momento.
        </p>
      ) : (
        <div className="space-y-4">
          {byPlan.map(plan => (
            <div key={plan.planId}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-text-secondary">
                  {plan.name}
                  <span className="text-text-muted font-medium ml-2">
                    ({plan.subscriptions} · {brl.format(plan.price)}
                    {plan.billingCycle === 'YEARLY' ? '/ano' : '/mês'})
                  </span>
                </span>
                <span className="text-xs font-bold text-text-primary">
                  {brl.format(plan.monthlyValue)}
                </span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(plan.monthlyValue / maxMrr) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-linear-to-r from-chart-2/60 to-chart-2/80 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BillingSummaryPanels: React.FC<{
  data: BillingSummary | null;
  loading: boolean;
}> = ({ data, loading }) => {
  const riskRows = data
    ? [
        {
          label: 'Em atraso (PAST_DUE)',
          value: `${data.churn.pastDueCount} · ${brl.format(data.churn.pastDue)}`,
          danger: true,
        },
        {
          label: 'Trial encerrando em 7 dias',
          value: `${data.renewals.trialingEndingIn7dCount} · ${brl.format(data.renewals.trialingEndingIn7d)}`,
        },
        {
          label: 'Renovações em 7 dias',
          value: `${data.renewals.endingIn7dCount} · ${brl.format(data.renewals.endingIn7d)}`,
        },
        {
          label: 'Cancelados em 30 dias',
          value: `${data.churn.canceledIn30d} · ${brl.format(data.churn.canceledRevenueIn30d)}`,
        },
      ]
    : [];

  const delta = data?.collected.deltaPct ?? null;
  const revenueRows = data
    ? [
        { label: 'Mês atual', value: brl.format(data.collected.month), positive: true },
        { label: 'Mês anterior', value: brl.format(data.collected.prevMonth) },
        {
          label: 'Variação',
          value: delta === null ? '—' : `${delta >= 0 ? '+' : ''}${delta}%`,
          positive: delta !== null && delta >= 0,
          negative: delta !== null && delta < 0,
        },
        { label: 'Acumulado no ano', value: brl.format(data.collected.year) },
      ]
    : [];

  const renderRows = (
    rows: { label: string; value: string; danger?: boolean; positive?: boolean; negative?: boolean }[],
  ) =>
    rows.map(row => (
      <div key={row.label} className="flex items-center justify-between gap-3">
        <span className="text-text-secondary">{row.label}</span>
        <span
          className={`font-bold ${
            row.danger
              ? 'text-danger'
              : row.positive
                ? 'text-success'
                : row.negative
                  ? 'text-danger'
                  : 'text-text-primary'
          }`}
        >
          {row.value}
        </span>
      </div>
    ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-surface border border-border rounded-2xl p-6 hover:border-border-strong transition-colors">
        <h3 className="text-sm font-bold text-text-primary mb-4">Assinaturas em risco</h3>
        {loading || !data ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 bg-surface-2/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 text-sm">{renderRows(riskRows)}</div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 hover:border-border-strong transition-colors">
        <h3 className="text-sm font-bold text-text-primary mb-4">Receita da plataforma</h3>
        {loading || !data ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 bg-surface-2/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 text-sm">{renderRows(revenueRows)}</div>
        )}
      </div>
    </div>
  );
};

export const BillingSummarySection: React.FC = () => {
  const [data, setData] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    adminApi
      .getBillingSummary()
      .then(res => {
        if (!active) return;
        setData(res.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (error) return <SectionError message={error} onRetry={() => setReloadKey(key => key + 1)} />;

  return (
    <div className="space-y-6">
      <BillingSummaryKpis data={data} loading={loading} />
      <BillingMrrByPlan data={data} loading={loading} />
      <BillingSummaryPanels data={data} loading={loading} />
    </div>
  );
};
