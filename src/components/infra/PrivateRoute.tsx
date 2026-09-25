import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LuLoaderCircle as Loader2 } from 'react-icons/lu';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  roles?: ('MASTER_ADMIN' | 'OWNER' | 'EMPLOYEE')[];
  children: React.ReactNode;
  /** Sobrescreve o redirect padrão; quando omitido, vai para /login preservando a rota tentada (`state.from`). */
  fallback?: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles, children, fallback }) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-accent">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }
  if (!user || (roles && !hasRole(roles))) {
    return <>{fallback ?? <Navigate to="/login" replace state={{ from: location }} />}</>;
  }
  return <>{children}</>;
};
