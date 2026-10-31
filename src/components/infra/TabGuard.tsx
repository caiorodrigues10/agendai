import React from 'react';
import { useParams } from 'react-router-dom';
import { canAccessTab } from '../../config/tabRegistry';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { AccessDeniedPage } from '../../pages/AccessDeniedPage';

/**
 * Guarda de rota por papel/permissão para as abas do painel.
 *
 * Antes desta guarda, abrir uma URL direta de uma aba proibida montava a
 * página e só depois um redirect in-page a escondia — com dados sensíveis
 * carregando em paralelo. Aqui o componente nem monta: quem não pode,
 * recebe AccessDenied. O backend continua sendo a autoridade
 * (requirePermission nas rotas); isto apenas impede vazamento visual.
 */
export const TabGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { hasDashboard, data, loading: subscriptionLoading } = useSubscription();
  const { tab } = useParams<{ tab: string }>();

  // PrivateRoute (ancora a rota /app/:tab) já trata loading e ausência de usuário.
  if (loading || !user) return <>{children}</>;

  if (subscriptionLoading && !data)
    return (
      <p role="status" className="p-6 text-sm text-text-secondary">
        Carregando acesso ao painel…
      </p>
    );

  const canAccess = canAccessTab(tab ?? 'overview', user.role, {
    hasDashboard,
    permissions: user.permissions,
  });
  if (!canAccess) {
    const permittedWithDashboard = canAccessTab(tab ?? 'overview', user.role, {
      hasDashboard: true,
      permissions: user.permissions,
    });
    return (
      <AccessDeniedPage
        attemptedTab={tab}
        reason={!hasDashboard && permittedWithDashboard ? 'plan' : 'permission'}
      />
    );
  }

  return <>{children}</>;
};
