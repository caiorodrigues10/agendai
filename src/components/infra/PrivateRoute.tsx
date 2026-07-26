import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  roles?: ('admin' | 'owner' | 'employee' | 'MASTER_ADMIN' | 'OWNER' | 'EMPLOYEE' | 'ADMIN')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles, children, fallback }) => {
  const { user, loading, hasRole } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-accent">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }
  if (!user) return <>{fallback ?? null}</>;
  if (roles && !hasRole(roles)) return <>{fallback ?? null}</>;
  return <>{children}</>;
};
