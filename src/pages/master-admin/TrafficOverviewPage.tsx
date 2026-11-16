import React, { type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasInternalPermission, INTERNAL_PERMISSIONS } from '../../utils/internalPermissions';
import { AccessDeniedPage } from '../AccessDeniedPage';
import { TrafficOverviewDashboard } from './TrafficOverviewDashboard';

export interface TrafficOverviewAccessProps {
  children: ReactNode;
}

/**
 * Keeps the dashboard unmounted until the caller is authorized. In
 * particular, a scoped master admin without `internal:traffic:read` never
 * causes a traffic request.
 */
export const TrafficOverviewAccess: React.FC<TrafficOverviewAccessProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  const canReadTraffic =
    user?.role === 'MASTER_ADMIN' &&
    hasInternalPermission(user.internalPermissions, INTERNAL_PERMISSIONS.TRAFFIC_READ);

  if (!canReadTraffic) return <AccessDeniedPage reason="permission" />;

  return <>{children}</>;
};

export const TrafficOverviewPage: React.FC = () => (
  <TrafficOverviewAccess>
    <TrafficOverviewDashboard />
  </TrafficOverviewAccess>
);

export default TrafficOverviewPage;
