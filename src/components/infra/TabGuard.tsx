import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessTab } from '../../config/tabRegistry';
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
  const { tab } = useParams<{ tab: string }>();

  // PrivateRoute (ancora a rota /app/:tab) já trata loading e ausência de usuário.
  if (loading || !user) return <>{children}</>;

  const canAccess = canAccessTab(tab ?? 'overview', user.role, { permissions: user.permissions });
  if (!canAccess) return <AccessDeniedPage attemptedTab={tab} />;

  return <>{children}</>;
};
