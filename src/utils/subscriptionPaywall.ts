import { MySubscription } from '../infra/subscriptionsApi';

export function staffHomePath(role?: string | null): string {
  const r = (role ?? '').toUpperCase();
  if (r === 'MASTER_ADMIN' || r === 'ADMIN') return '/master/dashboard';
  return '/app/queue';
}

/** Assinatura paga de verdade (não é só trial calendário / TRIALING). */
export function isPaidSubscription(data: MySubscription | null): boolean {
  const sub = data?.subscription;
  if (!sub) return false;
  if (sub.status === 'ACTIVE' && sub.hasPaymentMethod) return true;
  if (sub.status === 'ACTIVE' && sub.latestInvoice?.status === 'PAID') return true;
  return false;
}

/** Trial ativo ou assinatura paga — o dono já pode usar o painel. */
export function hasPanelAccess(data: MySubscription | null, role?: string | null): boolean {
  const r = (role ?? '').toUpperCase();
  if (r === 'MASTER_ADMIN' || r === 'ADMIN') return true;
  if (!data) return false;
  return !needsPaywallAfterAuth(data);
}

/**
 * Trial calendário acabou e não há assinatura ACTIVE.
 * Login já emitiu JWT; a UI mostra o modal em vez de entrar no painel.
 */
export function needsPaywallAfterAuth(data: MySubscription | null): boolean {
  if (!data) return false;
  if (data.subscription?.status === 'ACTIVE') return false;
  const paidUntil = data.subscription?.endDate;
  if (
    data.subscription?.status === 'CANCELED' &&
    paidUntil &&
    new Date(paidUntil) > new Date()
  ) {
    return false;
  }
  if (data.trial && !data.trial.isExpired) return false;
  return Boolean(data.trial?.isExpired) || Boolean(data.subscription);
}
