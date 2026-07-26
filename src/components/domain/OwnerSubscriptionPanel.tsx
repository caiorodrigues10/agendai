import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PiggyBank,
  TrendingDown,
  Calendar,
  ArrowRight,
  XCircle
} from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import {
  subscriptionsApi,
  PlanEconomics,
  MySubscription
} from '../../infra/subscriptionsApi';
import { ApiError } from '../../infra/apiClient';

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_LABEL: Record<string, string> = {
  TRIALING: 'Em trial',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento pendente',
  CANCELED: 'Cancelada',
  UNPAID: 'Não paga'
};

export const OwnerSubscriptionPanel: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading: ctxLoading, refresh } = useSubscription();
  const [detail, setDetail] = useState<MySubscription | null>(data);
  const [loading, setLoading] = useState(!data);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await subscriptionsApi.me();
        if (!cancelled) setDetail(me);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Falha ao carregar assinatura.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (data) setDetail(data);
  }, [data]);

  const economics: PlanEconomics | undefined = detail?.economics;
  const sub = detail?.subscription;
  const trial = detail?.trial;
  const onYearly = economics?.currentBillingCycle === 'YEARLY';
  const onMonthly = economics?.currentBillingCycle === 'MONTHLY';

  const handleCancel = async () => {
    if (!sub || sub.status === 'CANCELED') return;
    const ok = window.confirm(
      'Cancelar a assinatura? Você perderá o acesso ao fim do período já pago / trial.'
    );
    if (!ok) return;
    setCancelling(true);
    setError(null);
    setSuccess(null);
    try {
      await subscriptionsApi.cancel();
      setSuccess('Assinatura cancelada.');
      await refresh();
      const me = await subscriptionsApi.me();
      setDetail(me);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível cancelar.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || ctxLoading) {
    return (
      <div className="flex justify-center py-16 text-accent">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <CreditCard size={20} className="text-accent" /> Assinatura
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Gerencie seu plano e veja a economia do anual frente ao mensal.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success text-sm flex gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {success}
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
        {sub ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
                  Plano atual
                </p>
                <p className="text-xl font-bold">{sub.planName}</p>
                <p className="text-sm text-text-secondary">
                  {brl(sub.planPrice)}
                  {sub.planBillingCycle === 'YEARLY' || onYearly ? '/ano' : '/mês'}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-border bg-surface-2">
                {STATUS_LABEL[sub.status] ?? sub.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-accent" />
                Início:{' '}
                <span className="text-text-primary font-medium">
                  {new Date(sub.startDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {sub.endDate && (
                <div>
                  Vence:{' '}
                  <span className="text-text-primary font-medium">
                    {new Date(sub.endDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : trial ? (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
              Período de trial
            </p>
            <p className="text-lg font-bold mt-1">
              {trial.isExpired
                ? 'Trial expirado'
                : `${trial.daysRemainingInTrial} dia(s) restantes`}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Termina em {new Date(trial.trialEndsAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Nenhuma assinatura ativa.</p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => navigate('/planos')}
            className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-accent text-accent-fg text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent-hover"
          >
            {sub ? 'Trocar plano' : 'Ver planos'} <ArrowRight size={15} />
          </button>
          {sub && sub.status !== 'CANCELED' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-4 py-2.5 rounded-xl border border-danger/40 text-danger text-sm font-bold flex items-center gap-2 hover:bg-danger/10 disabled:opacity-60"
            >
              {cancelling ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
              Cancelar
            </button>
          )}
        </div>
      </div>

      {economics && economics.yearlySavingsPerYear > 0 && (
        <div className="grid gap-3">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-success mb-2">
              <PiggyBank size={18} />
              <h3 className="font-bold text-sm">Economia com o plano anual</h3>
            </div>
            {onYearly ? (
              <>
                <p className="text-2xl font-bold text-success">{brl(economics.savedSoFar)}</p>
                <p className="text-xs text-text-secondary mt-1">
                  Já economizado vs. pagar o mensal no mesmo período (
                  {economics.monthsActive.toFixed(1)} mese(s)).
                </p>
                <p className="text-xs text-text-muted mt-2">
                  Projeção em 12 meses: {brl(economics.projectedYearlySavings)} (
                  {brl(economics.yearlySavingsPerYear)}/ano de desconto).
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-text-muted">{brl(0)}</p>
                <p className="text-xs text-text-secondary mt-1">
                  Você ainda não está no anual. Economia possível:{' '}
                  <span className="text-success font-bold">
                    {brl(economics.yearlySavingsPerYear)}/ano
                  </span>
                  .
                </p>
              </>
            )}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-warning mb-2">
              <TrendingDown size={18} />
              <h3 className="font-bold text-sm">
                {onMonthly ? 'Quanto você deixa de economizar' : 'Receita que a plataforma deixa de cobrar'}
              </h3>
            </div>
            {onMonthly ? (
              <>
                <p className="text-2xl font-bold text-warning">
                  {brl(economics.missedSavingsSoFar)}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Acumulado no período atual permanecendo no mensal. Por ano:{' '}
                  {brl(economics.missedSavingsPerYear)}.
                </p>
              </>
            ) : onYearly ? (
              <>
                <p className="text-2xl font-bold text-warning">
                  {brl(economics.platformForegoneRevenueSoFar)}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Desconto que o AGENDAI deixou de faturar no seu plano anual neste período
                  ({brl(economics.platformForegoneRevenuePerYear)}/ano).
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-warning">
                  {brl(economics.yearlySavingsPerYear)}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Desconto anual disponível se você migrar do mensal para o anual.
                </p>
              </>
            )}
          </div>

          {economics.monthlyPlan && economics.yearlyPlan && (
            <p className="text-[11px] text-text-muted px-1">
              Comparativo: {economics.monthlyPlan.name} {brl(economics.monthlyPlan.price)}/mês × 12
              = {brl(economics.monthlyPlan.price * 12)} vs {economics.yearlyPlan.name}{' '}
              {brl(economics.yearlyPlan.price)}/ano.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
