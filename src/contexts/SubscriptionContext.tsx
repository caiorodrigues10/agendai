import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { subscriptionsApi, MySubscription } from '../infra/subscriptionsApi';
import { ApiError } from '../infra/apiClient';
import { useAuth } from './AuthContext';

export type AccessState = 'unknown' | 'active' | 'trial' | 'blocked';

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
  if (data.subscription) {
    return data.subscription.planHasDashboard !== false;
  }
  // Trial sem assinatura: acesso completo (captura)
  if (data.trial && !data.trial.isExpired) return true;
  return true;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

const deriveAccessState = (data: MySubscription | null): AccessState => {
  if (!data) return 'unknown';
  if (data.subscription) {
    return ['TRIALING', 'ACTIVE'].includes(data.subscription.status) ? 'active' : 'blocked';
  }
  if (data.trial) return data.trial.isExpired ? 'blocked' : 'trial';
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
      accessState: blockInfo ? ('blocked' as const) : deriveAccessState(data),
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
