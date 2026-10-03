import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, SubscriptionListItem, ListMeta, SubscriptionEconomics } from '../../infra/adminApi';
import {
  brl,
  errorMessage,
  formatDate,
  EMPTY_META,
  SectionError,
  TableSkeleton,
  EmptyRow,
  PaginationBar,
  SubscriptionStatusBadge,
  SUBSCRIPTION_STATUS_CONFIG,
  CANCEL_REASON_LABELS,
} from './billingShared';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { LuSearch as Search } from 'react-icons/lu';

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

export const SubscriptionsSection: React.FC = () => {
  const [subs, setSubs] = useState<SubscriptionListItem[]>([]);
  const [meta, setMeta] = useState<ListMeta>(EMPTY_META);
  const [economics, setEconomics] = useState<SubscriptionEconomics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<{ id: string; name?: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'bot' } | null>(null);

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
    setCancellingId(barbershopId);
    try {
      await adminApi.cancelSubscription(barbershopId);
      await Promise.all([fetchSubs(), fetchEconomics()]);
      setToast({ message: 'Assinatura cancelada.', type: 'success' });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setCancellingId(null);
      setConfirmCancel(null);
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
          <Search size={24} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por salão ou CNPJ..."
            className="w-full bg-surface border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all placeholder:text-text-muted"
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
                  ? 'bg-accent text-accent-fg'
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
                          <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-warning/20 bg-warning/10 text-warning">
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
                            onClick={() => setConfirmCancel({ id: s.barbershopId, name: s.barbershopName })}
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
      <ConfirmDialog
        open={confirmCancel !== null}
        title="Cancelar assinatura"
        message={`Cancelar assinatura de "${confirmCancel?.name ?? confirmCancel?.id ?? ''}"?`}
        confirmLabel="Cancelar assinatura"
        variant="danger"
        loading={cancellingId !== null}
        onConfirm={() => confirmCancel && void handleCancel(confirmCancel.id, confirmCancel.name)}
        onCancel={() => setConfirmCancel(null)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
