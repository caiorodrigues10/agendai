import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FocusLock from 'react-focus-lock';
import {
  LuCreditCard as CreditCard,
  LuLoaderCircle as Loader2,
  LuCircleAlert as AlertCircle,
  LuCircleCheck as CheckCircle2,
  LuPiggyBank as PiggyBank,
  LuCalendar as Calendar,
  LuArrowRight as ArrowRight,
  LuCircleX as XCircle,
  LuX as X,
  LuUsers as Users,
  LuBanknote as Banknote,
  LuCalendarCheck as CalendarCheck,
  LuMegaphone as Megaphone,
  LuClock as Clock,
  LuListOrdered as ListOrdered,
  LuMessageCircle as MessageCircle,
  LuSparkles as Sparkles,
  LuWallet as Wallet,
  LuArrowRightLeft as ArrowRightLeft,
  LuHeartHandshake as HeartHandshake,
  LuZap as Zap,
  LuShieldCheck as ShieldCheck,
} from 'react-icons/lu';
import { useSubscription } from '../../contexts/SubscriptionContext';
import {
  subscriptionsApi,
  MySubscription,
  CancellationContext,
} from '../../infra/subscriptionsApi';
import { plansApi, Plan } from '../../infra/plansApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { SmartSelect } from '../ui/SmartSelect';
import { SubscriptionCheckout } from '../../pages/CheckoutPage';

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
  const [plansLoading, setPlansLoading] = useState(true);
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
  const [billingYearly, setBillingYearly] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [paySetupTrial, setPaySetupTrial] = useState(false);
  const [payPlanId, setPayPlanId] = useState<string | null>(null);
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
        const planList = await plansApi.list();
        if (cancelled) return;
        setPlans(planList.filter(p => p.active !== false));
      } catch {
        /* silent — painel principal continua */
      } finally {
        if (!cancelled) setPlansLoading(false);
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

  const sub = detail?.subscription;
  const trial = detail?.trial;
  const inCalendarTrial = Boolean(trial && !trial.isExpired);
  const needsCard = inCalendarTrial && !sub?.hasPaymentMethod;
  const hasPendingPayment = sub?.latestInvoice?.status === 'PENDING';

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
    setPayPlanId(plan.id);
    setPaySetupTrial(!payNow);
    setPayOpen(true);
  };

  const payPreferred = (payNow = true) => {
    const preferred =
      displayPlans.find(p => p.hasDashboard !== false || /pro/i.test(p.name)) ?? displayPlans[0];
    setPayPlanId(preferred?.id ?? sub?.planId ?? null);
    setPaySetupTrial(!payNow);
    setPayOpen(true);
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
        <p className="text-sm text-text-secondary mt-1">Veja seu plano atual e escolha a melhor opção para o salão.</p>
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

      {/* Situação do plano atual */}
      <div
        className={`rounded-2xl p-5 space-y-3 border ${
          needsCard ? 'border-warning/50 bg-warning/5' : 'border-border bg-surface'
        }`}
      >
        {sub ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
                  Plano atual
                </p>
                <p className="text-xl font-bold">{sub.planName}</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-border bg-surface-2">
                {STATUS_LABEL[sub.status] ?? sub.status}
              </span>
            </div>
            {trial && !trial.isExpired && (
              <div className="rounded-xl border border-accent/25 bg-accent/10 px-3 py-2.5">
                <p className="text-xs font-bold text-accent">
                  Trial Pro · {trial.daysRemainingInTrial} dias restantes
                </p>
              </div>
            )}
            {hasPendingPayment && (
              <div className="rounded-xl border border-warning/35 bg-warning/10 px-3 py-2.5">
                <p className="text-xs font-bold text-warning">Pagamento aguardando confirmação</p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  O plano só será ativado depois que o PIX ou cartão for confirmado.
                </p>
              </div>
            )}
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
            const isCurrent = sub?.planId === plan.id && sub.status === 'ACTIVE';
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

        {plansLoading && displayPlans.length === 0 && (
          <div className="flex justify-center py-8 text-accent">
            <Loader2 className="animate-spin" size={24} />
          </div>
        )}

        {displayPlans.length === 0 && !plansLoading && (
          <button
            type="button"
            onClick={() => payPreferred(true)}
            className="w-full py-3 rounded-xl bg-accent text-accent-fg text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent-hover"
          >
            Pagar com PIX ou cartão <ArrowRight size={15} />
          </button>
        )}
      </div>

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
                        <SmartSelect
                          value={pixKeyType}
                          onChange={val => setPixKeyType((val ?? 'EMAIL') as any)}
                          options={[
                            { value: 'EMAIL', label: 'E-mail' },
                            { value: 'CPF', label: 'CPF' },
                            { value: 'CNPJ', label: 'CNPJ' },
                            { value: 'PHONE', label: 'Celular' },
                            { value: 'RANDOM', label: 'Aleatória' },
                          ]}
                          clearable={false}
                        />
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

      {payOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-bg">
          <SubscriptionCheckout
            planId={payPlanId}
            billing={billingYearly ? 'YEARLY' : 'MONTHLY'}
            setupTrial={paySetupTrial}
            variant="embedded"
            onBack={() => {
              setPayOpen(false);
              setPayPlanId(null);
              setPaySetupTrial(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
