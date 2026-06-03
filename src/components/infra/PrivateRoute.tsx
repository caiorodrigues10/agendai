import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  roles?: ('admin' | 'owner' | 'employee')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles, children, fallback }) => {
  const { user, loading, hasRole } = useAuth();
  if (loading) return null;
  if (!user) return <>{fallback ?? null}</>;
  if (roles && !hasRole(roles)) return <>{fallback ?? null}</>;
  return <>{children}</>;
};
