import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FocusLock from 'react-focus-lock';
import {
  LuArrowRight as ArrowRight,
  LuCircleAlert as CircleAlert,
  LuCheck as Check,
  LuUsers as Users,
  LuX as X,
} from 'react-icons/lu';
import { Plan } from '../../infra/plansApi';
import { formatCurrencyBRL } from '../../utils/formatters';

interface TrialExpiredPaywallModalProps {
  open: boolean;
  plans: Plan[];
  isOwner: boolean;
  onClose: () => void;
}

export const TrialExpiredPaywallModal: React.FC<TrialExpiredPaywallModalProps> = ({
  open,
  plans,
  isOwner,
  onClose,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const goCheckout = (planId: string) => {
    navigate(`/checkout?planId=${encodeURIComponent(planId)}`);
  };

  const getPlanBadge = (plan: Plan) => {
    const isYearly = plan.billingCycle === 'YEARLY';
    const isPro = plan.hasDashboard !== false || /pro/i.test(plan.name);
    if (isYearly && isPro) return 'Melhor custo anual';
    if (isYearly) return '2 meses grátis';
    if (isPro) return 'Mais escolhido';
    return null;
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
      />
      <FocusLock returnFocus>
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trial-paywall-title"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 id="trial-paywall-title" className="text-lg font-bold text-text-primary">
                Período de teste encerrado
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {isOwner
                  ? 'Escolha um plano para reativar o painel. O pagamento libera o acesso na hora.'
                  : 'O trial do salão acabou. Peça ao dono para assinar um plano e liberar o painel.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 shrink-0"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-bg px-3 py-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <CircleAlert size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                O painel está pausado até a assinatura.
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                Seus dados continuam salvos e voltam assim que o plano for ativado.
              </p>
            </div>
          </div>

          {isOwner && plans.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              {plans.map(plan => {
                const badge = getPlanBadge(plan);
                const isRecommended = badge === 'Melhor custo anual';

                return (
                  <div
                    key={plan.id}
                    className={`bg-bg border rounded-2xl p-4 flex flex-col transition-colors ${
                      isRecommended
                        ? 'border-accent/60 shadow-[0_0_0_1px_rgba(44,181,138,0.12)]'
                        : 'border-border hover:border-accent/40'
                    }`}
                  >
                    <div className="mb-2 min-h-5">
                      {badge && (
                        <span className="inline-flex rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-bold text-warning">
                          {badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-text-primary mb-1">{plan.name}</h3>
                    <div className="mb-3">
                      <span className="text-xl font-bold text-accent">
                        {formatCurrencyBRL(plan.price)}
                      </span>
                      <span className="text-xs text-text-muted">
                        {plan.billingCycle === 'YEARLY' ? ' /ano' : ' /mês'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
                      <Users size={13} className="text-accent" />
                      {plan.maxEmployees === 0
                        ? 'Funcionários ilimitados'
                        : `Até ${plan.maxEmployees} funcionário${plan.maxEmployees > 1 ? 's' : ''}`}
                    </div>
                    <ul className="space-y-1.5 mb-4 flex-1">
                      {(plan.features ?? []).slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                          <Check size={12} className="text-success mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => goCheckout(plan.id)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                        isRecommended
                          ? 'bg-accent text-accent-fg hover:bg-accent-hover'
                          : 'border border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
                      }`}
                    >
                      Reativar
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={() => navigate('/planos')}
              className="w-full py-2.5 rounded-xl border border-border text-text-secondary text-sm font-bold flex items-center justify-center gap-2 hover:border-border-strong hover:text-text-primary"
            >
              Ver todos os planos <ArrowRight size={15} />
            </button>
          )}

          {isOwner && (
            <p className="mt-3 text-center text-xs text-text-muted">
              Você pode trocar de plano depois. A assinatura desbloqueia o painel assim que
              for aprovada.
            </p>
          )}
        </div>
      </FocusLock>
    </div>
  );
};
