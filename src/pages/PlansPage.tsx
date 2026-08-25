import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Check, CheckCircle2, Loader2, X } from 'lucide-react';
import { plansApi, Plan } from '../infra/plansApi';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PricingPersuasionCharts } from '../components/marketing/PricingPersuasionCharts';
import { getErrorMessage } from '../utils/errorMessage';
import { trialCampaign } from '../marketing/trialCampaign';

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ESSENTIAL_MONTHLY = 14;
const PRO_MONTHLY = 20;
const ESSENTIAL_YEARLY = 140;
const PRO_YEARLY = 200;

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

export const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setupTrial = searchParams.get('setup') === 'trial';
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
    const onScroll = () => setStickyVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentPlanId = subscriptionData?.subscription?.planId;
  const isSubscriptionActive =
    subscriptionData?.subscription &&
    ['TRIALING', 'ACTIVE'].includes(subscriptionData.subscription.status);

  const handleSubscribe = (plan: Plan) => {
    const billing = isYearly ? 'YEARLY' : 'MONTHLY';
    const setupQ =
      setupTrial || !subscriptionData?.subscription?.hasPaymentMethod ? '&setup=trial' : '';
    if (user) {
      navigate(`/checkout?planId=${plan.id}&billing=${billing}${setupQ}`);
      return;
    }
    // Cadastro na tela original de login — sem modal embutido
    navigate(`/login?tab=register&planId=${encodeURIComponent(plan.id)}&billing=${billing}`);
  };

  const getDisplayPrice = (plan: Plan) => {
    if (isYearly) {
      if (/pro/i.test(plan.name) || plan.hasDashboard) return PRO_YEARLY;
      return ESSENTIAL_YEARLY;
    }
    if (/pro/i.test(plan.name) || plan.hasDashboard) return PRO_MONTHLY;
    return ESSENTIAL_MONTHLY;
  };

  const isPro = (plan: Plan) => plan.hasDashboard !== false || /pro/i.test(plan.name);
  const isEssential = (plan: Plan) => !isPro(plan);

  const proPlan = plans.find(p => isPro(p));
  const essentialPlan = plans.find(p => isEssential(p));
  const displayPlans = [essentialPlan, proPlan].filter(Boolean) as Plan[];

  const startPro = () => {
    if (proPlan) handleSubscribe(proPlan);
    else navigate('/login');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-neutral-100 selection:bg-emerald-500/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[15%] top-[-12%] h-[55%] w-[55%] rounded-full bg-emerald-900/25 blur-[140px]" />
        <div className="absolute -right-[10%] top-[25%] h-[40%] w-[40%] rounded-full bg-teal-900/15 blur-[120px]" />
      </div>

      <MarketingNav />

      <main className="relative z-10">
        {/* Hero */}
        <section className="px-6 pb-10 pt-36 md:px-10 md:pt-44 xl:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90"
            >
              {trialCampaign.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-5xl font-black tracking-[-0.05em] text-white md:text-7xl"
            >
              Menos que um corte.
              <br />
              <span className="text-emerald-400">Mais que o caderno.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-neutral-400 md:text-xl"
            >
              {trialCampaign.body} {trialCampaign.afterTrial} Anual = 2 meses grátis. Equipe
              ilimitada nos dois.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3"
            >
              {[
                { value: 'R$ 14', label: 'Essencial / mês' },
                { value: 'R$ 20', label: 'Pro / mês' },
                { value: '1 corte', label: 'paga o plano' },
              ].map(item => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/8 bg-white/3 px-3 py-4"
                >
                  <p className="text-xl font-black text-white md:text-2xl">{item.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 md:text-xs">
                    {item.label}
                  </p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <button
                type="button"
                onClick={startPro}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-emerald-400 px-8 py-4 text-base font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                {trialCampaign.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="mt-3 text-sm text-neutral-500">{trialCampaign.heroSubline}</p>
            </motion.div>
          </div>
        </section>

        {/* Loss aversion strip */}
        <section className="border-y border-white/8 bg-white/2 px-6 py-10 md:px-10">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                title: '3 faltas no mês',
                body: 'Com ticket de R$ 55, são R$ 165 sumindo — mais que 8× o Pro.',
              },
              {
                title: 'R$ 6 a mais',
                body: 'Pro vs Essencial. Menos que um café/semana por dashboard + financeiro.',
              },
              {
                title: '2 meses grátis',
                body: 'No anual você paga 10 e usa 12. Economia de R$ 40 no Pro.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <p className="text-lg font-black text-white">{item.title}</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-400">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Toggle + cards */}
        <section id="precos" className="px-6 py-16 md:px-10 md:py-20 xl:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/4 p-1">
                <button
                  type="button"
                  onClick={() => setIsYearly(false)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    !isYearly ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearly(true)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    isYearly ? 'bg-emerald-400 text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Anual
                  <span className="ml-2 text-[10px] font-black uppercase tracking-wider opacity-80">
                    −2 meses
                  </span>
                </button>
              </div>
              {isYearly && (
                <p className="text-sm font-semibold text-emerald-300">
                  Melhor custo: anual já selecionado
                </p>
              )}
            </div>

            {loading && (
              <div className="flex justify-center py-20 text-emerald-400">
                <Loader2 className="animate-spin" size={36} />
              </div>
            )}

            {error && (
              <div className="mx-auto mb-8 flex max-w-md items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {!loading && !error && displayPlans.length > 0 && (
              <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
                {displayPlans.map(plan => {
                  const currentIsPro = isPro(plan);
                  const isCurrent = plan.id === currentPlanId && isSubscriptionActive;
                  const price = getDisplayPrice(plan);
                  const period = isYearly ? 'ano' : 'mês';
                  const monthlyEquivalent = isYearly
                    ? currentIsPro
                      ? PRO_YEARLY / 12
                      : ESSENTIAL_YEARLY / 12
                    : null;
                  const yearlySavings = currentIsPro
                    ? PRO_MONTHLY * 12 - PRO_YEARLY
                    : ESSENTIAL_MONTHLY * 12 - ESSENTIAL_YEARLY;

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className={`relative flex flex-col rounded-[2rem] border p-8 transition ${
                        currentIsPro
                          ? 'border-emerald-400/45 bg-[#0c1610] shadow-[0_0_80px_rgba(52,211,153,0.12)] md:scale-[1.02]'
                          : 'border-white/10 bg-[#0d110e]'
                      }`}
                    >
                      {currentIsPro && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                          Recomendado
                        </div>
                      )}

                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-black text-white">{plan.name}</h2>
                        {isCurrent && (
                          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-neutral-400">
                        {currentIsPro
                          ? 'Dashboard, financeiro e insights — visão de dono.'
                          : 'Fila, agenda e equipe. Operação limpa, preço baixo.'}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-emerald-300/90">
                        {trialCampaign.planIncluded}
                      </p>

                      <div className="mt-6 mb-2">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`text-5xl font-black tracking-tight ${
                              currentIsPro ? 'text-emerald-400' : 'text-white'
                            }`}
                          >
                            {formatPrice(price)}
                          </span>
                          <span className="text-sm text-neutral-500">/{period}</span>
                        </div>
                        {monthlyEquivalent != null && (
                          <p className="mt-2 text-sm font-semibold text-emerald-300">
                            ≈ {formatPrice(monthlyEquivalent)}/mês · economize{' '}
                            {formatPrice(yearlySavings)}
                          </p>
                        )}
                        {!isYearly && (
                          <p className="mt-2 text-sm text-neutral-500">
                            Ou {formatPrice(currentIsPro ? PRO_YEARLY : ESSENTIAL_YEARLY)}
                            /ano (2 meses grátis)
                          </p>
                        )}
                      </div>

                      <p className="mb-6 text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Funcionários ilimitados · sem taxa por cadeira
                      </p>

                      <ul className="mb-8 flex-1 space-y-3">
                        {(plan.features.length > 0
                          ? plan.features
                          : currentIsPro
                            ? [
                                'Tudo do Essencial',
                                'Dashboard e relatórios',
                                'Financeiro, despesas e fiado',
                                'Insights de movimento',
                              ]
                            : [
                                'Fila digital e agenda online',
                                'Funcionários ilimitados',
                                'Serviços, perfil e feed',
                                'Suporte por e-mail',
                              ]
                        ).map(feature => (
                          <li
                            key={feature}
                            className="flex items-start gap-2.5 text-sm text-neutral-300"
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                currentIsPro ? 'bg-emerald-400/15' : 'bg-white/6'
                              }`}
                            >
                              <Check
                                size={12}
                                className={currentIsPro ? 'text-emerald-400' : 'text-neutral-400'}
                              />
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={() => handleSubscribe(plan)}
                        disabled={!!isCurrent}
                        className={`group flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-black transition ${
                          isCurrent
                            ? 'cursor-not-allowed bg-white/5 text-neutral-500'
                            : currentIsPro
                              ? 'bg-emerald-400 text-black hover:-translate-y-0.5 hover:bg-emerald-300'
                              : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        {isCurrent ? 'Assinado' : trialCampaign.cta}
                        {!isCurrent && (
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        )}
                      </button>
                      {!isCurrent && (
                        <p className="mt-2 text-center text-[11px] text-neutral-500">
                          {currentIsPro
                            ? trialCampaign.afterTrialThenPro
                            : trialCampaign.afterTrialThenEssential}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Charts */}
        <section className="border-y border-white/8 bg-white/1.5 px-6 py-20 md:px-10 md:py-28 xl:px-12">
          <div className="mx-auto max-w-6xl">
            <PricingPersuasionCharts variant="dark" />
          </div>
        </section>

        {/* Matrix */}
        <section className="px-6 py-20 md:px-10 xl:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
                Comparativo
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                Essencial opera. Pro enxerga.
              </h2>
            </div>

            <div className="overflow-hidden rounded-4xl border border-white/10 bg-[#0a0f0c]">
              <div className="grid grid-cols-[1.5fr_0.75fr_0.75fr] border-b border-white/8 px-5 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-500 md:px-8 md:text-xs">
                <span>Recurso</span>
                <span className="text-center">Essencial</span>
                <span className="text-center text-emerald-300">Pro</span>
              </div>
              {matrix.map(row => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.5fr_0.75fr_0.75fr] items-center border-b border-white/6 px-5 py-4 last:border-b-0 md:px-8"
                >
                  <span className="text-sm font-semibold text-neutral-200">{row.label}</span>
                  <span className="flex justify-center">
                    {row.essential ? (
                      <CheckCircle2 className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <X className="h-5 w-5 text-neutral-700" />
                    )}
                  </span>
                  <span className="flex justify-center">
                    {row.pro ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <X className="h-5 w-5 text-neutral-700" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Objections */}
        <section className="border-y border-white/8 bg-white/2 px-6 py-20 md:px-10 xl:px-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-3xl font-black tracking-tight text-white md:text-4xl">
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
                  className="rounded-3xl border border-white/8 bg-[#0d110e] p-6"
                >
                  <p className="text-base font-black text-white">{item.q}</p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-neutral-400">
                    {item.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-24 md:px-10 md:pb-36 xl:px-12">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-emerald-400/15 bg-[#0d1510] px-8 py-16 text-center md:rounded-[3.5rem] md:px-16 md:py-20">
            <div className="absolute left-1/2 top-0 h-64 w-2/3 -translate-x-1/2 rounded-full bg-emerald-400/12 blur-[100px]" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300/80">
                {trialCampaign.eyebrow}
              </p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
                Comece com 30 dias de Pro. Veja se faz sentido para o seu negócio.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-neutral-400">
                {trialCampaign.body} {trialCampaign.afterTrial}
              </p>
              <button
                type="button"
                onClick={startPro}
                className="group mt-10 inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-black text-black transition hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                {trialCampaign.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />

      {/* Sticky CTA */}
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
          onClick={startPro}
          className="group inline-flex items-center gap-2.5 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-black text-black shadow-[0_16px_50px_rgba(16,185,129,0.45)] ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-emerald-300 md:px-7 md:text-base"
        >
          {trialCampaign.ctaShort}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default PlansPage;
