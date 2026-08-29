import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FocusLock from 'react-focus-lock';
import { ArrowRight, Check, Users, X } from 'lucide-react';
import { Plan } from '../../infra/plansApi';

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 id="trial-paywall-title" className="text-lg font-bold text-text-primary">
                Período de teste encerrado
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {isOwner
                  ? 'Escolha um plano para continuar usando o painel. Sua sessão já está ativa — o pagamento libera o acesso na hora.'
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

          {isOwner && plans.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className="bg-bg border border-border rounded-2xl p-4 flex flex-col hover:border-accent/40 transition-colors"
                >
                  <h3 className="font-bold text-text-primary mb-1">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-xl font-bold text-accent">{formatPrice(plan.price)}</span>
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
                    className="w-full py-2.5 rounded-xl bg-accent text-accent-fg font-bold text-xs hover:bg-accent-hover transition-colors"
                  >
                    Assinar
                  </button>
                </div>
              ))}
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
        </div>
      </FocusLock>
    </div>
  );
};
