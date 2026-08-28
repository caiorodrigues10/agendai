import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FocusLock from 'react-focus-lock';
import {
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PiggyBank,
  TrendingDown,
  Calendar,
  ArrowRight,
  XCircle,
  X,
  Users,
  Banknote,
  CalendarCheck,
  Megaphone,
  Clock,
  ListOrdered,
  MessageCircle,
  Sparkles,
  Wallet,
  ArrowRightLeft,
  HeartHandshake,
  Gift,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import {
  subscriptionsApi,
  PlanEconomics,
  MySubscription,
  CancellationContext,
} from '../../infra/subscriptionsApi';
import { plansApi, Plan } from '../../infra/plansApi';
import { referralsApi, ReferralDashboard } from '../../infra/referralsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { trialCampaign } from '../../marketing/trialCampaign';
import { ShareReferralButton } from './ShareReferralButton';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_LABEL: Record<string, string> = {
  TRIALING: 'Em trial',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento pendente',
  CANCELED: 'Cancelada',
  UNPAID: 'Não paga',
};

const CANCEL_REASONS: { value: string; label: string }[] = [
  { value: 'price', label: 'Preço alto / quero pagar menos' },
  { value: 'low_usage', label: 'Não uso o suficiente' },
  { value: 'migrating', label: 'Vou migrar para outro sistema' },
  { value: 'missing_features', label: 'Faltam funcionalidades' },
  { value: 'technical_issues', label: 'Problemas técnicos' },
  { value: 'closing', label: 'Vou encerrar o salão' },
  { value: 'other', label: 'Outro' },
];

const RETENTION_BENEFITS = [
  {
    icon: <ListOrdered size={18} />,
    title: 'Fila digital',
    desc: 'Seus clientes entram na fila pelo celular, sem baixar app.',
  },
  {
    icon: <MessageCircle size={18} />,
    title: 'Lembretes no WhatsApp',
    desc: 'Agendamentos confirmados automaticamente e menos faltas.',
  },
  {
    icon: <Sparkles size={18} />,
    title: 'Insights com IA',
    desc: 'Previsão de movimento e dicas para encaixar mais serviços.',
  },
  {
    icon: <Megaphone size={18} />,
    title: 'Posts automáticos',
    desc: 'Divulgue o salão sem gastar tempo criando conteúdo.',
  },
  {
    icon: <Wallet size={18} />,
    title: 'Financeiro e fiado',
    desc: 'Controle de caixa, despesas e fiado dos clientes em um só lugar.',
  },
  {
    icon: <ArrowRightLeft size={18} />,
    title: 'Comparativo mensal vs anual',
    desc: 'Veja quanto o plano anual economiza frente ao mensal.',
  },
];

export const OwnerSubscriptionPanel: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading: ctxLoading, refresh } = useSubscription();
  const [detail, setDetail] = useState<MySubscription | null>(data);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [referral, setReferral] = useState<ReferralDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [cancelCtx, setCancelCtx] = useState<CancellationContext | null>(null);
  const [cancelCtxLoading, setCancelCtxLoading] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<'CPF' | 'CNPJ' | 'PHONE' | 'EMAIL' | 'RANDOM'>(
    'EMAIL'
  );
  const [billingYearly, setBillingYearly] = useState(true);
  const cancelTriggerRef = useRef<HTMLButtonElement>(null);

  const needsPixKey =
    cancelCtx?.proratedRefundAvailable && cancelCtx?.refundProvider === 'ABACATEPAY';

  useEffect(() => {
    if (data) setDetail(data);
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [planList, ref] = await Promise.all([
          plansApi.list().catch(() => [] as Plan[]),
          referralsApi.me().catch(() => null),
        ]);
        if (cancelled) return;
        setPlans(planList.filter(p => p.active !== false));
        setReferral(ref);
      } catch {
        /* silent — painel principal continua */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showCancelModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCancelModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCancelModal]);

  const economics: PlanEconomics | undefined = detail?.economics;
  const sub = detail?.subscription;
  const trial = detail?.trial;
  const inCalendarTrial = Boolean(trial && !trial.isExpired);
  const needsCard = inCalendarTrial && !sub?.hasPaymentMethod;
  const onYearly = economics?.currentBillingCycle === 'YEARLY';
  const onMonthly = economics?.currentBillingCycle === 'MONTHLY';

  const displayPlans = useMemo(() => {
    const source = plans.length > 0 ? plans : (detail?.plans ?? []);
    const cycle = billingYearly ? 'YEARLY' : 'MONTHLY';
    const byCycle = source.filter(p => (p.billingCycle ?? 'MONTHLY') === cycle);
    const pool = byCycle.length > 0 ? byCycle : source;
    const isPro = (p: Plan) => p.hasDashboard !== false || /pro/i.test(p.name);
    const essential = pool.find(p => !isPro(p));
    const pro = pool.find(p => isPro(p));
    return [essential, pro].filter(Boolean) as Plan[];
  }, [plans, detail?.plans, billingYearly]);

  const goCheckout = (plan: Plan, payNow = true) => {
    const billing = (plan.billingCycle ?? (billingYearly ? 'YEARLY' : 'MONTHLY')) as
      'MONTHLY' | 'YEARLY';
    const setup = !payNow && (needsCard || sub?.status !== 'ACTIVE') ? '&setup=trial' : '';
    navigate(`/checkout?planId=${encodeURIComponent(plan.id)}&billing=${billing}${setup}`);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelStep(1);
    setCancelReason(null);
    setCancelCtx(null);
    setPixKey('');
    setPixKeyType('EMAIL');
    cancelTriggerRef.current?.focus();
  };

  const openCancelModal = async () => {
    if (!sub || sub.status === 'CANCELED') return;
    setShowCancelModal(true);
    setCancelStep(1);
    setCancelReason(null);
    setError(null);
    setSuccess(null);
    setCancelCtx(null);
    setPixKey('');
    setPixKeyType('EMAIL');
    setCancelCtxLoading(true);
    try {
      const ctx = await subscriptionsApi.getCancellationContext();
      setCancelCtx(ctx);
    } catch {
      setCancelCtx(null);
    } finally {
      setCancelCtxLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason) return;
    setCancelling(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await subscriptionsApi.cancel({
        cancelReason,
        ...(pixKey ? { pixKey, pixKeyType } : {}),
      });
      const pr = res?.proratedRefund;
      setSuccess(
        pr?.status === 'SUCCEEDED'
          ? `Assinatura cancelada. Reembolso proporcional de ${brl(pr.amount)} (com multa de 20%) devolvido automaticamente.`
          : 'Assinatura cancelada.'
      );
      setShowCancelModal(false);
      await refresh();
      const me = await subscriptionsApi.me();
      setDetail(me);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível cancelar.'));
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
          Escolha Essencial ou Pro e pague no checkout (PIX ou cartão). O atalho também fica no
          topo: <span className="font-semibold text-text-primary">Plano</span>.
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

      <div className="rounded-2xl border-2 border-accent/50 bg-accent/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-extrabold text-text-primary">Pagar o plano</p>
          <p className="text-xs text-text-secondary mt-0.5">
            PIX ou cartão no checkout. Escolha Essencial ou Pro abaixo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const preferred =
              displayPlans.find(p => p.hasDashboard !== false || /pro/i.test(p.name)) ??
              displayPlans[0];
            if (preferred) goCheckout(preferred, true);
            else navigate('/planos');
          }}
          className="shrink-0 px-4 py-3 rounded-xl bg-accent text-accent-fg text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent-hover shadow-lg shadow-accent/20"
        >
          <CreditCard size={16} /> Ir para o pagamento
        </button>
      </div>

      {/* Indicação — card em destaque */}
      <div className="relative overflow-hidden rounded-2xl border border-accent/40 bg-linear-to-br from-accent/15 via-surface to-surface p-5">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-accent text-accent-fg flex items-center justify-center shadow-lg shadow-accent/25">
            <Gift size={24} />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              Programa de indicação
            </p>
            <h3 className="text-lg font-extrabold text-text-primary leading-tight">
              Indique um salão e ganhe{' '}
              <span className="text-accent">+{referral?.rewardDays ?? 30} dias grátis</span>
            </h3>
            <p className="text-sm text-text-secondary">
              Cada amigo que assinar estende sua assinatura. Quanto mais indicar, mais sobe de nível
              (Bronze → Prata → Ouro) e maior a recompensa.
            </p>
            {referral ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <code className="text-[11px] bg-bg/80 border border-border rounded-lg px-2.5 py-1.5 text-text-primary truncate max-w-[min(100%,280px)]">
                  {referral.shareUrl}
                </code>
                <ShareReferralButton
                  shareUrl={referral.shareUrl}
                  shareText={`Use meu link e ganhe trial no AGENDAI: ${referral.shareUrl}`}
                />
                <button
                  type="button"
                  onClick={() => navigate('/app/referrals')}
                  className="text-xs font-bold text-accent hover:underline"
                >
                  Ver minhas indicações →
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/app/referrals')}
                className="inline-flex items-center gap-2 mt-1 px-4 py-2.5 rounded-xl bg-accent text-accent-fg text-sm font-bold hover:bg-accent-hover"
              >
                <Gift size={15} /> Abrir indicações e copiar link
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status atual + urgência */}
      <div
        className={`rounded-2xl p-5 space-y-3 border ${
          needsCard ? 'border-warning/50 bg-warning/5' : 'border-border bg-surface'
        }`}
      >
        {needsCard && (
          <div className="flex items-start gap-2 rounded-xl bg-warning/15 border border-warning/30 px-3 py-2.5">
            <Zap size={16} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-warning">{trialCampaign.huntHeadline}</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {trial?.daysRemainingInTrial ?? 30} dia(s) de Pro restantes — escolha o plano abaixo
                e cadastre o cartão em menos de 1 minuto. Sem cobrança agora.
              </p>
            </div>
          </div>
        )}

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
                {sub.hasPaymentMethod && sub.cardLast4 && (
                  <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-success" />
                    Cartão •••• {sub.cardLast4}
                    {sub.cardBrand ? ` (${sub.cardBrand})` : ''}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-border bg-surface-2">
                {STATUS_LABEL[sub.status] ?? sub.status}
              </span>
            </div>
            {trial && !trial.isExpired && (
              <div className="rounded-xl border border-accent/25 bg-accent/10 px-3 py-2.5">
                <p className="text-xs font-bold text-accent">
                  Trial Pro · {trial.daysRemainingInTrial} dia(s) restantes
                </p>
                <p className="mt-0.5 text-[11px] text-text-secondary">
                  Acesso Pro completo até {new Date(trial.trialEndsAt).toLocaleDateString('pt-BR')}.{' '}
                  {trialCampaign.ownerEvaluate}
                </p>
              </div>
            )}
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
              Trial Pro · 30 dias
            </p>
            <p className="text-lg font-bold mt-1">
              {trial.isExpired
                ? 'Trial expirado'
                : `${trial.daysRemainingInTrial} dia(s) restantes`}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {trial.isExpired ? (
                <>
                  Pro completo até {new Date(trial.trialEndsAt).toLocaleDateString('pt-BR')}.{' '}
                  {trialCampaign.afterTrial}
                </>
              ) : (
                <>
                  Pro completo até {new Date(trial.trialEndsAt).toLocaleDateString('pt-BR')}.{' '}
                  {trialCampaign.huntBody}
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Nenhuma assinatura ativa.</p>
        )}

        {sub && sub.status !== 'CANCELED' && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              ref={cancelTriggerRef}
              onClick={openCancelModal}
              disabled={cancelling}
              className="px-4 py-2.5 rounded-xl border border-danger/40 text-danger text-sm font-bold flex items-center gap-2 hover:bg-danger/10 disabled:opacity-60"
            >
              {cancelling ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Planos — pagamento */}
      <div id="planos-pagamento" className="space-y-3 scroll-mt-24">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Zap size={16} className="text-accent" />
              {needsCard ? 'Escolha o plano e cadastre o cartão' : 'Planos'}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {needsCard
                ? 'Checkout direto — cartão em 1 minuto, sem cobrança no trial.'
                : 'Anual = 2 meses grátis. Troque quando quiser.'}
            </p>
          </div>
          <div className="flex bg-surface border border-border rounded-xl p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBillingYearly(false)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                !billingYearly ? 'bg-accent/15 text-accent' : 'text-text-muted'
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingYearly(true)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                billingYearly ? 'bg-accent/15 text-accent' : 'text-text-muted'
              }`}
            >
              Anual · 2 meses off
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {displayPlans.map(plan => {
            const isPro = plan.hasDashboard !== false || /pro/i.test(plan.name);
            const isCurrent = sub?.planId === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-4 flex flex-col gap-3 ${
                  isPro
                    ? 'border-accent/50 bg-accent/5 ring-1 ring-accent/20'
                    : 'border-border bg-surface'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      {isPro ? 'Mais vendido' : 'Começar barato'}
                    </p>
                    <p className="text-lg font-extrabold">{plan.name}</p>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-success/15 text-success">
                      Atual
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black text-text-primary">
                  {brl(plan.price)}
                  <span className="text-xs font-medium text-text-muted">
                    /{plan.billingCycle === 'YEARLY' || billingYearly ? 'ano' : 'mês'}
                  </span>
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {isPro
                    ? 'Painel completo, financeiro, insights e IA. Ideal se você quer crescer com dados — não no feeling.'
                    : 'Fila + agenda + equipe ilimitada. Perfeito para operar o salão sem pagar pelo dashboard ainda.'}
                </p>
                <ul className="space-y-1.5 text-xs text-text-secondary">
                  {(isPro
                    ? [
                        'Dashboard e relatórios',
                        'Financeiro, despesas e fiado',
                        'Insights de movimento + IA',
                      ]
                    : ['Fila digital + agenda', 'Funcionários ilimitados', 'Link público do salão']
                  ).map(f => (
                    <li key={f} className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-accent shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => goCheckout(plan, true)}
                  className={`mt-auto w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    isPro
                      ? 'bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20'
                      : 'border border-accent/40 text-accent hover:bg-accent/10'
                  }`}
                >
                  <CreditCard size={15} />
                  {isCurrent ? `Pagar / renovar ${plan.name}` : `Pagar ${plan.name}`}
                  <ArrowRight size={14} />
                </button>
                {inCalendarTrial && (
                  <button
                    type="button"
                    onClick={() => goCheckout(plan, false)}
                    className="w-full text-[11px] font-bold text-text-muted hover:text-text-secondary"
                  >
                    Só cadastrar cartão (cobra depois do trial)
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {displayPlans.length === 0 && (
          <button
            type="button"
            onClick={() => navigate('/planos')}
            className="w-full py-3 rounded-xl bg-accent text-accent-fg text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent-hover"
          >
            Ver planos <ArrowRight size={15} />
          </button>
        )}
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
                {onMonthly
                  ? 'Quanto você deixa de economizar'
                  : 'Receita que a plataforma deixa de cobrar'}
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
                  Desconto que o AGENDAI deixou de faturar no seu plano anual neste período (
                  {brl(economics.platformForegoneRevenuePerYear)}/ano).
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

      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeCancelModal}
        >
          <FocusLock autoFocus returnFocus onDeactivation={closeCancelModal}>
            <div
              className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={closeCancelModal}
                className="absolute right-4 top-4 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>

              {cancelStep === 1 ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-3">
                      <HeartHandshake size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">
                      Sentimos muito em ver você ir
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Antes de ir, veja o que você construiu até aqui.
                    </p>
                  </div>

                  {cancelCtxLoading ? (
                    <div className="flex justify-center py-12 text-accent">
                      <Loader2 className="animate-spin" size={28} />
                    </div>
                  ) : cancelCtx?.hasUsage ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          {
                            icon: <Users size={17} />,
                            value: String(cancelCtx.uniqueCustomers),
                            label: 'clientes atendidos',
                          },
                          {
                            icon: <Banknote size={17} />,
                            value: brl(cancelCtx.revenue),
                            label: 'em serviços',
                          },
                          {
                            icon: <CalendarCheck size={17} />,
                            value: String(cancelCtx.appointmentsCompleted),
                            label: 'agendamentos',
                          },
                          ...(cancelCtx.savingsSoFar > 0
                            ? [
                                {
                                  icon: <PiggyBank size={17} />,
                                  value: brl(cancelCtx.savingsSoFar),
                                  label: 'economizados no anual',
                                },
                              ]
                            : []),
                          ...(cancelCtx.postsPublished > 0
                            ? [
                                {
                                  icon: <Megaphone size={17} />,
                                  value: String(cancelCtx.postsPublished),
                                  label: 'posts publicados',
                                },
                              ]
                            : []),
                          {
                            icon: <Clock size={17} />,
                            value: String(cancelCtx.usageDays),
                            label: 'dias com a gente',
                          },
                        ].map(m => (
                          <div
                            key={m.label}
                            className="bg-bg/50 border border-border rounded-xl p-4 text-center"
                          >
                            <div className="w-8 h-8 mx-auto rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-2">
                              {m.icon}
                            </div>
                            <p className="text-lg font-black text-text-primary leading-tight">
                              {m.value}
                            </p>
                            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">
                              {m.label}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl bg-accent/5 border border-accent/15 px-4 py-3 flex items-center gap-2">
                        <Sparkles size={15} className="text-accent shrink-0" />
                        <p className="text-xs text-text-secondary">
                          Esses resultados são seus — não perca tudo isso agora.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {RETENTION_BENEFITS.map(b => (
                          <div
                            key={b.title}
                            className="flex gap-3 bg-bg/50 border border-border rounded-xl p-4"
                          >
                            <div className="w-9 h-9 shrink-0 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                              {b.icon}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">{b.title}</p>
                              <p className="text-xs text-text-secondary mt-0.5">{b.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl bg-accent/5 border border-accent/15 px-4 py-3 flex items-center gap-2">
                        <Sparkles size={15} className="text-accent shrink-0" />
                        <p className="text-xs text-text-secondary">
                          Tudo isso ainda espera por você no AgendAI.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    {cancelCtx && !cancelCtx.hasUsage && (
                      <button
                        onClick={() => {
                          closeCancelModal();
                          navigate('/app');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-accent text-accent-fg text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent-hover"
                      >
                        Explorar recursos <ArrowRight size={15} />
                      </button>
                    )}
                    {!cancelCtxLoading && (
                      <button
                        onClick={closeCancelModal}
                        className="flex-1 py-2.5 rounded-xl bg-accent text-accent-fg text-sm font-bold hover:bg-accent-hover"
                      >
                        Continuar com meu plano
                      </button>
                    )}
                    {!cancelCtxLoading && (
                      <button
                        onClick={() => setCancelStep(2)}
                        className="px-5 py-2.5 rounded-xl border border-danger/40 text-danger text-sm font-bold hover:bg-danger/10"
                      >
                        Cancelar mesmo assim
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-text-primary">Nos conte o motivo</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Sua opinião nos ajuda a melhorar.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex gap-2 mb-4">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    {CANCEL_REASONS.map(r => (
                      <label
                        key={r.value}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                          cancelReason === r.value
                            ? 'border-accent bg-accent/10'
                            : 'border-border bg-bg/40 hover:border-border-strong'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancel-reason"
                          value={r.value}
                          checked={cancelReason === r.value}
                          onChange={() => setCancelReason(r.value)}
                          className="accent-accent w-4 h-4 shrink-0"
                        />
                        <span className="text-sm font-medium text-text-primary">{r.label}</span>
                      </label>
                    ))}
                  </div>

                  {cancelCtx?.proratedRefundAvailable && (
                    <div className="rounded-xl bg-success/10 border border-success/30 px-4 py-3 flex gap-2 mt-5">
                      <Banknote size={15} className="text-success shrink-0 mt-0.5" />
                      <p className="text-xs text-success">
                        Você receberá automaticamente o valor proporcional do período já pago e não
                        utilizado, com multa de 20% sobre o valor do reembolso. O acesso continua
                        até o fim do seu período.
                      </p>
                    </div>
                  )}

                  {needsPixKey && (
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Wallet size={15} className="text-accent shrink-0" />
                        <p className="text-sm font-bold text-text-primary">
                          Chave PIX para devolução
                        </p>
                      </div>
                      <p className="text-xs text-text-secondary -mt-2">
                        Seu pagamento foi feito pelo AbacatePay, que só reembolsa o total. Para
                        devolvermos apenas o proporcional, enviamos um PIX para sua chave. Informe a
                        chave onde deseja receber.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pixKey}
                          onChange={e => setPixKey(e.target.value)}
                          placeholder="Chave PIX (ex.: email, CPF, celular)"
                          className="flex-1 px-3 py-2.5 rounded-xl bg-bg border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                        />
                        <select
                          value={pixKeyType}
                          onChange={e => setPixKeyType(e.target.value as any)}
                          className="px-3 py-2.5 rounded-xl bg-bg border border-border text-sm text-text-primary focus:outline-none focus:border-accent"
                        >
                          <option value="EMAIL">E-mail</option>
                          <option value="CPF">CPF</option>
                          <option value="CNPJ">CNPJ</option>
                          <option value="PHONE">Celular</option>
                          <option value="RANDOM">Aleatória</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl bg-warning/10 border border-warning/30 px-4 py-3 flex gap-2 mt-5">
                    <AlertCircle size={15} className="text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-warning">
                      Ao cancelar você perde o acesso aos recursos no fim do período já pago.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-5">
                    <button
                      onClick={() => setCancelStep(1)}
                      className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-bold hover:bg-surface-2"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleConfirmCancel}
                      disabled={!cancelReason || (needsPixKey && !pixKey.trim()) || cancelling}
                      className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40"
                    >
                      {cancelling ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <XCircle size={15} />
                      )}
                      Cancelar assinatura
                    </button>
                  </div>
                </>
              )}
            </div>
          </FocusLock>
        </div>
      )}
    </div>
  );
};
