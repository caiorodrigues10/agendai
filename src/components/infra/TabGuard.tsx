import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { LuLoader } from 'react-icons/lu';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { canAccessTab, DASHBOARD_GATED_TAB_IDS, getDefaultTab } from '../../config/tabRegistry';
import { AccessDeniedPage } from '../../pages/AccessDeniedPage';

/**
 * Guarda de rota por papel/permissão para as abas do painel.
 *
 * Antes desta guarda, abrir uma URL direta de uma aba proibida montava a
 * página e só depois um redirect in-page a escondia — com dados sensíveis
 * carregando em paralelo. Aqui o componente nem monta: quem não pode,
 * recebe AccessDenied. O backend continua sendo a autoridade
 * (requirePermission nas rotas); isto apenas impede vazamento visual.
 *
 * Decisões, nesta ordem:
 * 1. Assinatura ainda carregando → aguarda (não decide com `hasDashboard`
 *    incerto; se a assinatura falhar, `deriveHasDashboard(null)` deixa
 *    passar e o paywall real é o 403 da API).
 * 2. Papel/permissão (`canAccessTab`) → AccessDeniedPage.
 * 3. Paywall (aba de `DASHBOARD_GATED_TAB_IDS` sem plano Pro) → redireciona
 *    para o mesmo destino de upgrade do StaffDashboard, sem a mensagem de
 *    "fale com o dono do salão".
 */
export const TabGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { hasDashboard, data, loading: subscriptionLoading } = useSubscription();
  const { settings } = useBarbershop();
  const { tab } = useParams<{ tab: string }>();

  // PrivateRoute (ancora a rota /app/:tab) já trata loading e ausência de usuário.
  if (loading || !user) return <>{children}</>;

  if (subscriptionLoading && !data) {
    return (
      <div role="status" className="min-h-[60vh] flex items-center justify-center text-accent">
        <LuLoader className="animate-spin" size={40} />
      </div>
    );
  }

  const canAccess = canAccessTab(tab ?? 'overview', user.role, {
    hasDashboard: true,
    permissions: user.permissions,
  });
  if (!canAccess) return <AccessDeniedPage attemptedTab={tab} />;

  if (tab && DASHBOARD_GATED_TAB_IDS.includes(tab) && !hasDashboard) {
    const operationMode = settings?.operationMode ?? 'HYBRID';
    return <Navigate to={`/app/${getDefaultTab(user.role, operationMode)}`} replace />;
  }

  return <>{children}</>;
};
