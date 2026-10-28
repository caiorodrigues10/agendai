import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LuArrowRight as ArrowRight,
  LuCheck as Check,
  LuCircleCheck as CheckCircle2,
  LuLoaderCircle as Loader2,
  LuX as X,
} from 'react-icons/lu';
import { plansApi, Plan } from '../infra/plansApi';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { MarketingLayout } from '../layouts/marketing/MarketingLayout';
import { SectionError } from '../components/patterns/states/SectionError';
import { PricingPersuasionCharts } from '../features/marketing';
import { softwareApplicationLd } from '../marketing/softwareApplicationLd';
import { getErrorMessage } from '../utils/errorMessage';
import { trialCampaign } from '../marketing/trialCampaign';
import { isPaidSubscription, staffHomePath } from '../utils/subscriptionPaywall';
import { formatCurrencyBRL } from '../utils/formatters';
import {
  ESSENTIAL_MONTHLY,
  PRO_MONTHLY,
  ESSENTIAL_YEARLY,
  PRO_YEARLY,
} from '../marketing/planPrices';

const matrix = [
  { label: 'Fila digital + agenda online', essential: true, pro: true },
  { label: 'Funcionários ilimitados', essential: true, pro: true },
  { label: 'Link público do salão', essential: true, pro: true },
  { label: 'Dashboard e relatórios', essential: false, pro: true },
  { label: 'Financeiro, despesas e fiado', essential: false, pro: true },
  { label: 'Insights de movimento', essential: false, pro: true },
  { label: 'IA preditiva (Pro)', essential: false, pro: true },
];

const objections = [
  {
    q: 'Preciso de cartão no trial?',
    a: 'Não. Qualquer plano começa com 30 dias de Pro completo, sem cartão. Experimente e veja se faz sentido para o seu modelo de negócio. Depois segue o plano que você escolheu.',
  },
  {
    q: 'E se eu só quiser fila e agenda?',
    a: 'Escolha o Essencial: nos 30 dias você testa o Pro e vê se o dashboard faz sentido para o seu negócio; depois o plano desce para Essencial a R$ 14/mês — sem taxa por cadeira.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Sem multa e sem drama. Anual ainda sai mais barato que 12 mensalidades.',
  },
  {
    q: 'Funciona no celular?',
    a: 'Sim. Cliente usa o link no browser. Equipe opera no painel — sem app obrigatório.',
  },
];

type Tier = 'essential' | 'pro';

function tierAmounts(tier: Tier, plan: Plan | undefined, yearly: boolean) {
  const monthly = tier === 'pro' ? PRO_MONTHLY : ESSENTIAL_MONTHLY;
  const yearlyTotal = tier === 'pro' ? PRO_YEARLY : ESSENTIAL_YEARLY;
  if (!yearly) {
    const amount =
      plan && (plan.billingCycle ?? 'MONTHLY') !== 'YEARLY' && plan.price > 0
        ? plan.price
        : monthly;
    return { amount, struck: null as number | null, billedYearly: null as number | null };
  }
  const billed =
    plan && plan.billingCycle === 'YEARLY' && plan.price > 0 ? plan.price : yearlyTotal;
  return { amount: billed / 12, struck: monthly, billedYearly: billed };
}

function FeatureList({
  rows,
  accent,
}: {
  rows: { label: string; included: boolean }[];
  accent?: boolean;
}) {
  return (
    <ul className="mt-6 flex-1 space-y-2.5">
      {rows.map(row => (
        <li
          key={row.label}
          aria-label={`${row.included ? 'Inclui' : 'Não inclui'} ${row.label}`}
          className={`flex items-start gap-2.5 text-sm ${
            row.included ? 'text-text-primary' : 'text-text-muted'
          }`}
        >
          <span className="mt-0.5 shrink-0" aria-hidden>
            {row.included ? (
              <Check size={16} className={accent ? 'text-accent' : 'text-text-secondary'} />
            ) : (
              <X size={16} className="text-text-muted" />
            )}
          </span>
          <span>{row.label}</span>
        </li>
      ))}
    </ul>
  );
}

export const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subscriptionData } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(true);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    plansApi
      .list()
      .then(setPlans)
      .catch((err: unknown) => {
        setError(getErrorMessage(err, 'Não foi possível carregar os planos. Tente novamente.'));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentPlanId = subscriptionData?.subscription?.planId;
  const alreadyPaid = isPaidSubscription(subscriptionData);

  const handleSubscribe = (plan: Plan) => {
    const billing = (plan.billingCycle ?? (isYearly ? 'YEARLY' : 'MONTHLY')) as
      'MONTHLY' | 'YEARLY';
    if (user) {
      navigate(`/checkout?planId=${plan.id}&billing=${billing}`);
      return;
    }
    navigate(`/cadastro?planId=${encodeURIComponent(plan.id)}&billing=${billing}`);
  };

  const isPro = (plan: Plan) => plan.hasDashboard !== false || /pro/i.test(plan.name);
  const isEssential = (plan: Plan) => !isPro(plan);

  const cycle: Plan['billingCycle'] = isYearly ? 'YEARLY' : 'MONTHLY';
  const byCycle = plans.filter(p => (p.billingCycle ?? 'MONTHLY') === cycle);
  const pool = byCycle.length > 0 ? byCycle : plans;
  const proPlan = pool.find(p => isPro(p));
  const essentialPlan = pool.find(p => isEssential(p));

  const staffLoggedIn = Boolean(
    user && ['OWNER', 'EMPLOYEE', 'MASTER_ADMIN', 'ADMIN'].includes(user.role.toUpperCase())
  );
  /** Só manda ao painel quem já pagou. Trial com acesso ainda precisa chegar no PIX/cartão. */
  const goToExistingPanel = staffLoggedIn && alreadyPaid;

  const startTrial = () => {
    if (user) {
      navigate(staffHomePath(user.role));
      return;
    }
    navigate('/cadastro');
  };

  const trialCta = goToExistingPanel ? trialCampaign.ctaGoToPanel : 'Começar teste grátis';

  const paidCta = (name: 'Essencial' | 'Pro', isCurrent: boolean) => {
    if (isCurrent) return 'Assinado';
    if (user && !alreadyPaid) return 'Pagar com PIX ou cartão';
    return name === 'Pro' ? 'Assinar Pro' : 'Assinar Essencial';
  };

  const essentialPrice = tierAmounts('essential', essentialPlan, isYearly);
  const proPrice = tierAmounts('pro', proPlan, isYearly);
  const essentialCurrent = Boolean(
    alreadyPaid && essentialPlan && essentialPlan.id === currentPlanId
  );
  const proCurrent = Boolean(alreadyPaid && proPlan && proPlan.id === currentPlanId);

  const trialRows = [
    ...matrix.map(row => ({ label: row.label, included: row.pro })),
    { label: 'Continua depois sem escolher um plano', included: false },
  ];
  const essentialRows = matrix.map(row => ({ label: row.label, included: row.essential }));
  const proRows = matrix.map(row => ({ label: row.label, included: row.pro }));

  return (
    <MarketingLayout
      wrapperClassName="dark min-h-screen overflow-x-hidden bg-bg font-sans text-text-primary selection:bg-accent/30"
      title="Planos e preços — Essencial e Pro | Agenda Já"
      description="Fila digital, agenda online e equipe ilimitada a partir de R$ 14/mês. 30 dias de Pro grátis, sem cartão. Anual com 2 meses grátis."
      path="/planos"
      jsonLd={softwareApplicationLd('/planos')}
      background={
        <>
          <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute -left-[15%] top-[-12%] h-[55%] w-[55%] rounded-full bg-accent/25 blur-[140px]" />
            <div className="absolute -right-[10%] top-[18%] h-[40%] w-[40%] rounded-full bg-teal-900/15 blur-[120px]" />
          </div>
        </>
      }
      afterFooter={
        <>
          <div
            className={`fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 transition duration-300 md:justify-end md:px-8 md:pb-6 ${
              stickyVisible
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-4 opacity-0'
            }`}
            aria-hidden={!stickyVisible}
          >
            <button
              type="button"
              tabIndex={stickyVisible ? 0 : -1}
              onClick={startTrial}
              className="group inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-3.5 text-sm font-black text-accent-fg shadow-[0_16px_50px_rgba(16,185,129,0.45)] ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-accent-hover md:px-7 md:text-base"
            >
              {trialCta}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </>
      }
    >
      <main className="relative z-10">
        <section id="precos" className="px-6 pb-16 pt-32 md:px-10 md:pb-20 md:pt-40 xl:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black tracking-[-0.04em] text-text-primary sm:text-5xl md:text-6xl"
              >
                Teste grátis ou escolha o plano
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-text-secondary md:text-lg"
              >
                {trialCampaign.body} {trialCampaign.afterTrial}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 flex justify-center"
            >
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1">
                <button
                  type="button"
                  aria-pressed={!isYearly}
                  onClick={() => setIsYearly(false)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    !isYearly
                      ? 'bg-surface text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  aria-pressed={isYearly}
                  onClick={() => setIsYearly(true)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    isYearly
                      ? 'bg-surface text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Anual
                </button>
                <span className="rounded-full bg-accent px-3 py-2 text-xs font-black uppercase tracking-wider text-accent-fg">
                  2 meses grátis
                </span>
              </div>
            </motion.div>

            {error && <SectionError message={error} className="mx-auto mt-8 max-w-md" />}

            {loading ? (
              <div className="flex justify-center py-20 text-accent">
                <Loader2 className="animate-spin" size={36} />
              </div>
            ) : (
              <div className="mt-10 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3 lg:items-end lg:gap-4 lg:py-4">
                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col rounded-[1.75rem] border border-border bg-surface p-6 md:p-7"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-black uppercase tracking-[0.18em] text-text-primary">
                      Teste grátis
                    </h2>
                    <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-text-primary">
                      30 dias
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary">
                    Para quem quer ver o Pro antes de pagar. Fila, agenda, dashboard e financeiro,
                    sem cartão.
                  </p>
                  <div className="mt-5" data-testid="plan-price-trial">
                    <span className="text-4xl font-black tracking-tight text-text-primary sm:text-5xl">
                      R$ 0
                    </span>
                    <p className="mt-1 text-xs font-medium text-text-secondary">por 30 dias</p>
                  </div>
                  <button
                    type="button"
                    onClick={startTrial}
                    className="mt-5 w-full rounded-2xl bg-surface-2 py-3.5 text-sm font-bold text-text-primary transition hover:bg-border"
                  >
                    {trialCta}
                  </button>
                  <p className="mt-2 text-center text-xs text-text-muted">
                    Sem cartão, sem cobrança automática
                  </p>
                  <FeatureList rows={trialRows} />
                </motion.article>

                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex flex-col rounded-[1.75rem] border border-border bg-linear-to-b from-accent/10 to-surface p-6 md:p-7"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-black uppercase tracking-[0.18em] text-text-primary">
                      Essencial
                    </h2>
                    {essentialCurrent && (
                      <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent">
                        Atual
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary">
                    Fila, agenda e equipe ilimitada, sem taxa por cadeira.
                  </p>
                  <div className="mt-5">
                    {essentialPrice.struck != null && (
                      <p className="text-sm font-semibold text-text-muted line-through">
                        {formatCurrencyBRL(essentialPrice.struck)}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1.5">
                      <span
                        data-testid="plan-price-essential"
                        className="text-4xl font-black tracking-tight text-text-primary sm:text-5xl"
                      >
                        {formatCurrencyBRL(essentialPrice.amount)}
                      </span>
                      <span className="text-sm text-text-secondary">/mês</span>
                    </div>
                    {essentialPrice.billedYearly != null && (
                      <p
                        data-testid="plan-billed-essential"
                        className="mt-1 text-xs font-medium text-text-secondary"
                      >
                        cobrado {formatCurrencyBRL(essentialPrice.billedYearly)}/ano
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => essentialPlan && handleSubscribe(essentialPlan)}
                    disabled={!essentialPlan || essentialCurrent}
                    className={`mt-5 w-full rounded-2xl border py-3.5 text-sm font-black transition ${
                      !essentialPlan || essentialCurrent
                        ? 'cursor-not-allowed border-border bg-surface-2 text-text-muted'
                        : 'border-border bg-transparent text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    {essentialPlan ? paidCta('Essencial', essentialCurrent) : 'Indisponível'}
                  </button>
                  {!essentialCurrent && (
                    <p className="mt-2 text-center text-xs text-text-muted">
                      {trialCampaign.afterTrialThenEssential}
                    </p>
                  )}
                  <FeatureList rows={essentialRows} />
                </motion.article>

                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative z-10 flex flex-col rounded-[1.75rem] border border-accent/50 bg-linear-to-b from-accent/10 to-surface p-6 shadow-[0_0_80px_rgba(52,211,153,0.16)] md:p-7 "
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-black uppercase tracking-widest text-accent-fg">
                    Mais escolhido
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-black uppercase tracking-[0.18em] text-text-primary">
                      Pro
                    </h2>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {isYearly && (
                        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-text-primary">
                          2 meses grátis
                        </span>
                      )}
                      {proCurrent && (
                        <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent">
                          Atual
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary">
                    Para quem quer enxergar o caixa: dashboard, financeiro, fiado e insights.
                  </p>
                  <div className="mt-5">
                    {proPrice.struck != null && (
                      <p className="text-sm font-semibold text-text-muted line-through">
                        {formatCurrencyBRL(proPrice.struck)}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1.5">
                      <span
                        data-testid="plan-price-pro"
                        className="text-4xl font-black tracking-tight text-accent sm:text-5xl"
                      >
                        {formatCurrencyBRL(proPrice.amount)}
                      </span>
                      <span className="text-sm text-text-secondary">/mês</span>
                    </div>
                    {proPrice.billedYearly != null && (
                      <p
                        data-testid="plan-billed-pro"
                        className="mt-1 text-xs font-medium text-text-secondary"
                      >
                        cobrado {formatCurrencyBRL(proPrice.billedYearly)}/ano
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => proPlan && handleSubscribe(proPlan)}
                    disabled={!proPlan || proCurrent}
                    className={`mt-5 w-full rounded-2xl py-3.5 text-sm font-black transition ${
                      !proPlan || proCurrent
                        ? 'cursor-not-allowed bg-surface-2 text-text-muted'
                        : 'bg-accent text-accent-fg hover:-translate-y-0.5 hover:bg-accent-hover'
                    }`}
                  >
                    {proPlan ? paidCta('Pro', proCurrent) : 'Indisponível'}
                  </button>
                  {!proCurrent && (
                    <p className="mt-2 text-center text-xs text-text-secondary">
                      {trialCampaign.afterTrialThenPro}
                    </p>
                  )}
                  <FeatureList rows={proRows} accent />
                </motion.article>
              </div>
            )}

            <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-text-muted">
              O teste de 30 dias de Pro começa no cadastro, sem cartão. A cobrança só é criada
              quando você contrata Essencial ou Pro. No anual, você paga 10 meses e usa 12.
            </p>
            {goToExistingPanel && user?.role?.toUpperCase() === 'OWNER' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/app/subscription')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-6 py-3 text-sm font-black text-accent hover:bg-accent/20"
                >
                  Gerenciar plano no painel
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-border bg-surface-2 px-6 py-20 md:px-10 md:py-28 xl:px-12">
          <div className="mx-auto max-w-6xl">
            <PricingPersuasionCharts variant="dark" />
          </div>
        </section>

        <section className="px-6 py-20 md:px-10 xl:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent/90">
                Comparativo
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-text-primary md:text-5xl">
                Essencial opera. Pro enxerga.
              </h2>
            </div>

            <div className="overflow-hidden rounded-4xl border border-border bg-surface">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[1.5fr_0.75fr_0.75fr] border-b border-border px-5 py-4 text-xs font-black uppercase tracking-wider text-text-muted md:px-8 md:text-xs">
                  <span>Recurso</span>
                  <span className="text-center">Essencial</span>
                  <span className="text-center text-accent">Pro</span>
                </div>
                {matrix.map(row => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1.5fr_0.75fr_0.75fr] items-center border-b border-border px-5 py-4 last:border-b-0 md:px-8"
                  >
                    <span className="text-sm font-semibold text-text-primary">{row.label}</span>
                    <span className="flex justify-center">
                      {row.essential ? (
                        <CheckCircle2 size={24} className="h-5 w-5 text-text-secondary" />
                      ) : (
                        <X size={24} className="h-5 w-5 text-text-muted" />
                      )}
                    </span>
                    <span className="flex justify-center">
                      {row.pro ? (
                        <CheckCircle2 size={24} className="h-5 w-5 text-accent" />
                      ) : (
                        <X size={24} className="h-5 w-5 text-text-muted" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface-2 px-6 py-20 md:px-10 xl:px-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-3xl font-black tracking-tight text-text-primary md:text-4xl">
              Objeções que a gente já ouviu
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {objections.map((item, i) => (
                <motion.div
                  key={item.q}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-3xl border border-border bg-surface p-6"
                >
                  <p className="text-base font-black text-text-primary">{item.q}</p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary">
                    {item.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
};

export default PlansPage;
