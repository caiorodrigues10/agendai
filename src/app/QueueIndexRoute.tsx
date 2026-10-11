import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { isShopStaffRole } from '../contexts/BarbershopContext';
import { PublicPageSkeleton } from '../components/patterns/skeletons';

const PublicHome = lazy(() => import('../pages/PublicHome'));

/**
 * Rota `/queue` sem `:id` (auditoria L2): decide o destino ANTES de baixar o
 * chunk pesado do PublicHome.
 *
 * Critério espelha o PublicHome/BarbershopContext: staff logado com salão
 * próprio abre a fila do salão; nos demais casos a URL cai na landing
 * (`<Navigate to="/" />`), que era o resultado final já existente — só que
 * depois de executar ~1,1 MB de bundle só para redirecionar.
 */
export const QueueIndexRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const { barbershopId } = useBarbershopFilters();

  if (loading) {
    return (
      <div role="status" aria-label="Carregando salão">
        <PublicPageSkeleton />
      </div>
    );
  }

  const staffShopId = user?.barbershopId && isShopStaffRole(user.role) ? user.barbershopId : null;
  const tenantId = barbershopId ?? staffShopId;

  if (!tenantId) {
    return <Navigate to="/" replace />;
  }

  return <PublicHome />;
};
