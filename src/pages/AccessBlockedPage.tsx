import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CalendarX2, Check, Users, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Plan } from '../infra/plansApi';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Logo } from '../components/ui/Logo';
import { BLOCK_INFO_STORAGE_KEY } from '../components/infra/AccessBlockedListener';

interface BlockInfo {
  code?: 'SUBSCRIPTION_REQUIRED' | 'CPF_BLOCKED' | string;
  message?: string;
  plans?: Plan[];
  reason?: string;
  blockedAt?: string;
  subscriptionStatus?: string;
}

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.toLocaleDateString('pt-BR', { dateStyle: 'long' });
};

export const AccessBlockedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { blockInfo: contextBlockInfo } = useSubscription();

  const blockInfo: BlockInfo = useMemo(() => {
    try {
      const stored = sessionStorage.getItem(BLOCK_INFO_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // sessionStorage corrompido — usa o contexto
    }
    return contextBlockInfo ?? {};
  }, [contextBlockInfo]);

  const isCpfBlocked = blockInfo.code === 'CPF_BLOCKED';
  const plans = blockInfo.plans ?? [];
  const blockedAt = formatDate(blockInfo.blockedAt);

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-lg text-text-muted hover:text-danger transition-colors"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
              isCpfBlocked ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
            }`}
          >
            {isCpfBlocked ? <ShieldAlert size={32} /> : <CalendarX2 size={32} />}
          </div>

          <h1 className="text-2xl font-bold mb-3">
            {isCpfBlocked ? 'Acesso bloqueado' : 'Assinatura necessária'}
          </h1>

          <p className="text-text-secondary text-sm max-w-md mx-auto">
            {blockInfo.message ??
              (isCpfBlocked
                ? 'Seu CPF está bloqueado por inadimplência. Regularize seu plano para continuar.'
                : 'Seu período de acesso expirou. Assine um plano para continuar usando a plataforma.')}
          </p>

          {isCpfBlocked && (blockInfo.reason || blockedAt) && (
            <div className="mt-6 max-w-md mx-auto bg-surface border border-danger/30 rounded-xl p-4 text-left text-sm space-y-1">
              {blockInfo.reason && (
                <p className="text-text-secondary">
                  <span className="font-bold text-text-primary">Motivo: </span>
                  {blockInfo.reason}
                </p>
              )}
              {blockedAt && (
                <p className="text-text-secondary">
                  <span className="font-bold text-text-primary">Bloqueado em: </span>
                  {blockedAt}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Planos vindos do próprio erro — evita nova chamada à API */}
        {plans.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {plans.map(plan => (
              <div
                key={plan.id}
                className="bg-surface border border-border rounded-2xl p-5 flex flex-col hover:border-accent/40 transition-colors"
              >
                <h2 className="font-bold mb-1">{plan.name}</h2>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-accent">{formatPrice(plan.price)}</span>
                  <span className="text-xs text-text-muted"> /mês</span>
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
                  onClick={() => navigate(`/checkout?planId=${plan.id}&setup=trial`)}
                  className="w-full py-2.5 rounded-xl bg-accent text-accent-fg font-bold text-xs hover:bg-accent-hover transition-colors"
                >
                  Assinar
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate('/planos')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-fg font-bold text-sm hover:bg-accent-hover transition-colors"
          >
            {plans.length > 0 ? 'Ver todos os planos' : 'Ver planos e regularizar'}
            <ArrowRight size={15} />
          </button>
          <p className="text-xs text-text-muted mt-4">
            Após a confirmação do pagamento, seu acesso é liberado automaticamente.
          </p>
        </div>
      </main>
    </div>
  );
};
