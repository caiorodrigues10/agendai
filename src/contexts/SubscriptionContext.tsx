import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { subscriptionsApi, MySubscription } from '../infra/subscriptionsApi';
import { ApiError } from '../infra/apiClient';
import { useAuth } from './AuthContext';

export type AccessState = 'unknown' | 'active' | 'trial' | 'blocked' | 'needs_card';

interface SubscriptionContextValue {
  /** Dados de GET /subscriptions/me (null enquanto não carregado ou usuário sem barbearia). */
  data: MySubscription | null;
  accessState: AccessState;
  loading: boolean;
  /**
   * Relatórios/financeiro liberados.
   * Trial = full access; após trial segue o flag do plano (Essencial = false).
   */
  hasDashboard: boolean;
  /** Detalhes do bloqueio quando accessState === 'blocked' (code, plans, reason...). */
  blockInfo: Record<string, any> | null;
  refresh: () => Promise<void>;
}

function deriveHasDashboard(data: MySubscription | null): boolean {
  if (!data) return true;
  if (data.trial && !data.trial.isExpired && data.subscription?.hasPaymentMethod) return true;
  if (data.subscription?.status === 'ACTIVE') {
    return data.subscription.planHasDashboard !== false;
  }
  return true;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

const deriveAccessState = (data: MySubscription | null): AccessState => {
  if (!data) return 'unknown';
  const sub = data.subscription;
  if (sub?.status === 'ACTIVE') return 'active';
  if (sub?.status === 'TRIALING' && sub.hasPaymentMethod) return 'trial';
  if (data.trial && !data.trial.isExpired) {
    // Calendário de trial sem cartão vaulted → obrigatório cadastrar
    if (!sub?.hasPaymentMethod) return 'needs_card';
    return 'trial';
  }
  if (sub && ['PAST_DUE', 'CANCELED', 'UNPAID'].includes(sub.status)) return 'blocked';
  if (data.trial?.isExpired) return 'blocked';
  return 'unknown';
};

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState<MySubscription | null>(null);
  const [blockInfo, setBlockInfo] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    // MASTER_ADMIN não tem barbearia — isento de assinatura
    if (!user || !user.barbershopId) {
      setData(null);
      setBlockInfo(null);
      return;
    }
    setLoading(true);
    try {
      const result = await subscriptionsApi.me();
      setData(result);
      setBlockInfo(null);
    } catch (err) {
      if (err instanceof ApiError && err.isAccessBlocked) {
        setBlockInfo({ code: err.code, ...err.data });
      }
      // Outros erros (rede etc.): mantém estado anterior — o backend continua
      // sendo a fonte de verdade a cada request via ApiError/evento global.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  // Refetch ao voltar o foco para a aba (ex.: usuário pagou o PIX em outro app)
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const value = useMemo(
    () => ({
      data,
      accessState: blockInfo
        ? blockInfo.reason === 'CARD_REQUIRED'
          ? ('needs_card' as const)
          : ('blocked' as const)
        : deriveAccessState(data),
      loading,
      hasDashboard: deriveHasDashboard(data),
      blockInfo,
      refresh
    }),
    [data, blockInfo, loading, refresh]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
