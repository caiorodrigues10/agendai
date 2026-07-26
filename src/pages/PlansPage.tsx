import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, AlertCircle, Users, ArrowLeft, Sparkles } from 'lucide-react';
import { plansApi, Plan } from '../infra/plansApi';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Logo } from '../components/ui/Logo';
import { SubscribeAuthModal } from '../components/domain/SubscribeAuthModal';
import { PricingPersuasionCharts } from '../components/marketing/PricingPersuasionCharts';

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subscriptionData } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    plansApi
      .list()
      .then(setPlans)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : '';
        const isOffline =
          msg.includes('Failed to fetch') ||
          msg.includes('NetworkError') ||
          msg.includes('HTTP 502') ||
          msg.includes('HTTP 503') ||
          msg.includes('HTTP 504');
        setError(
          isOffline
            ? 'Servidor indisponível. Inicie o backend (BarberQueue-back-end → npm run dev) e recarregue a página.'
            : 'Não foi possível carregar os planos. Tente novamente.'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const currentPlanId = subscriptionData?.subscription?.planId;
  const isSubscriptionActive =
    subscriptionData?.subscription &&
    ['TRIALING', 'ACTIVE'].includes(subscriptionData.subscription.status);

  const handleSubscribe = (plan: Plan) => {
    if (user) {
      navigate(`/checkout?planId=${plan.id}`);
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-text-secondary hover:text-accent transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <Logo size="sm" />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Escolha seu plano</h1>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">
            Novos salões têm 30 dias grátis do Pro completo — sem cartão.
            Depois: Essencial (R$14) ou Pro com dashboard (R$20). Anual = 2 meses grátis.
          </p>
        </div>

        <div className="mb-12">
          <PricingPersuasionCharts variant="app" />
        </div>

        {loading && (
          <div className="flex justify-center py-20 text-accent">
            <Loader2 className="animate-spin" size={36} />
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto p-4 bg-danger/10 border border-danger/30 rounded-xl flex items-center gap-2 text-danger text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!loading && !error && plans.length === 0 && (
          <p className="text-center text-text-muted py-16">Nenhum plano disponível no momento.</p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map(plan => {
            const isCurrent = plan.id === currentPlanId && isSubscriptionActive;
            const isYearly = plan.billingCycle === 'YEARLY' || /anual/i.test(plan.name);
            const isPro = plan.hasDashboard !== false && (plan.tierKey === 'pro' || /pro/i.test(plan.name));
            return (
              <div
                key={plan.id}
                className={`bg-surface border rounded-2xl p-6 flex flex-col transition-all ${
                  isCurrent
                    ? 'border-accent shadow-lg shadow-accent/10'
                    : isPro
                      ? 'border-accent/40 hover:border-accent'
                      : 'border-border hover:border-accent/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h2 className="text-lg font-bold">{plan.name}</h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPro && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent">
                        Completo
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent">
                        Plano atual
                      </span>
                    )}
                  </div>
                </div>
                {plan.description && (
                  <p className="text-xs text-text-muted mb-4">{plan.description}</p>
                )}

                <div className="mb-4">
                  <span className="text-3xl font-bold text-accent">{formatPrice(plan.price)}</span>
                  <span className="text-xs text-text-muted">
                    {' '}/{isYearly ? 'ano' : 'mês'}
                  </span>
                  {isYearly && (
                    <p className="text-[11px] text-success mt-1 font-medium">2 meses grátis (pague 10)</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                  <Users size={14} className="text-accent" />
                  {plan.maxEmployees === 0
                    ? 'Funcionários ilimitados'
                    : `Até ${plan.maxEmployees} funcionário${plan.maxEmployees > 1 ? 's' : ''}`}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Check size={14} className="text-success mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isCurrent
                      ? 'bg-surface-2 text-text-muted cursor-not-allowed'
                      : 'bg-accent text-accent-fg hover:bg-accent-hover'
                  }`}
                >
                  <Sparkles size={14} />
                  {isCurrent ? 'Assinado' : 'Assinar'}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {selectedPlan && (
        <SubscribeAuthModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
};
