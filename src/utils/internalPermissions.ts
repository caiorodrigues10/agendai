export const INTERNAL_PERMISSIONS = {
  ALL: 'internal:all',
  DASHBOARD_READ: 'internal:dashboard:read',
  TEAM_MANAGE: 'internal:team:manage',
  SUPPORT_MANAGE: 'internal:support:manage',
  FINANCE_READ: 'internal:finance:read',
  OPERATIONS_READ: 'internal:operations:read',
  REFERRALS_READ: 'internal:referrals:read',
  AUDIT_READ: 'internal:audit:read',
  BARBERSHOPS_MANAGE: 'internal:barbershops:manage',
  ACCOUNTS_MANAGE: 'internal:accounts:manage',
  ACCOUNTS_IMPERSONATE: 'internal:accounts:impersonate',
  USERS_MANAGE: 'internal:users:manage',
  WHATSAPP_READ: 'internal:whatsapp:read',
  WHATSAPP_MANAGE: 'internal:whatsapp:manage',
} as const;

export type InternalPermission = (typeof INTERNAL_PERMISSIONS)[keyof typeof INTERNAL_PERMISSIONS];

/**
 * Mesma regra do backend: lista vazia/ausente significa acesso total.
 * O painel master usa isto só para esconder ações; o backend continua
 * sendo a fonte de verdade e responde 403 quando necessário.
 */
export function hasInternalPermission(
  permissions: readonly string[] | undefined,
  required: InternalPermission,
): boolean {
  if (!permissions || permissions.length === 0) return true;
  return permissions.includes(INTERNAL_PERMISSIONS.ALL) || permissions.includes(required);
}
