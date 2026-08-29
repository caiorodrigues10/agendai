import { useAuth } from '../contexts/AuthContext';

export type EmployeePermission =
  | 'QUEUE_MANAGE'
  | 'APPOINTMENTS_MANAGE'
  | 'APPOINTMENTS_VIEW_ALL'
  | 'APPOINTMENTS_CANCEL'
  | 'CLIENTS_MANAGE'
  | 'PACKAGES_SELL'
  | 'FINANCE_VIEW'
  | 'FINANCE_MANAGE'
  | 'REPORTS_VIEW'
  | 'MARKETING_MANAGE';

export const ALL_PERMISSIONS: EmployeePermission[] = [
  'QUEUE_MANAGE',
  'APPOINTMENTS_MANAGE',
  'APPOINTMENTS_VIEW_ALL',
  'APPOINTMENTS_CANCEL',
  'CLIENTS_MANAGE',
  'PACKAGES_SELL',
  'FINANCE_VIEW',
  'FINANCE_MANAGE',
  'REPORTS_VIEW',
  'MARKETING_MANAGE',
];

export const PERMISSION_LABELS: Record<EmployeePermission, string> = {
  QUEUE_MANAGE: 'Gerenciar fila',
  APPOINTMENTS_MANAGE: 'Gerenciar agendamentos',
  APPOINTMENTS_VIEW_ALL: 'Ver agenda de todos',
  APPOINTMENTS_CANCEL: 'Cancelar agendamentos',
  CLIENTS_MANAGE: 'Gerenciar clientes',
  PACKAGES_SELL: 'Vender pacotes',
  FINANCE_VIEW: 'Ver financeiro',
  FINANCE_MANAGE: 'Gerenciar financeiro',
  REPORTS_VIEW: 'Ver relatórios',
  MARKETING_MANAGE: 'Gerenciar marketing',
};

/**
 * Returns effective permissions for the current user.
 * OWNER and MASTER_ADMIN get all permissions implicitly.
 */
export function usePermissions() {
  const { user } = useAuth();

  const isOwnerOrAdmin = user?.role === 'OWNER' || user?.role === 'MASTER_ADMIN';
  const permissions: EmployeePermission[] = isOwnerOrAdmin
    ? ALL_PERMISSIONS
    : (user as any)?.permissions ?? [];

  function hasPermission(perm: EmployeePermission): boolean {
    return permissions.includes(perm);
  }

  function hasAny(...perms: EmployeePermission[]): boolean {
    return perms.some(p => permissions.includes(p));
  }

  return { permissions, hasPermission, hasAny, isOwnerOrAdmin };
}
