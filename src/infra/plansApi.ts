import { apiClient } from './apiClient';

export type PlanBillingCycle = 'MONTHLY' | 'YEARLY';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle?: PlanBillingCycle;
  /** 0 = ilimitado */
  maxEmployees: number;
  hasDashboard?: boolean;
  tierKey?: string;
  features: string[];
  active?: boolean;
  createdAt?: string;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

export function pickPlanForCheckout(
  list: Plan[],
  billing: PlanBillingCycle = 'YEARLY'
): Plan | null {
  const active = list.filter(p => p.active !== false);
  const source = active.length > 0 ? active : list;
  const cycle = source.filter(p => (p.billingCycle ?? 'MONTHLY') === billing);
  const pool = cycle.length > 0 ? cycle : source;
  return pool.find(p => p.hasDashboard !== false || /pro/i.test(p.name)) ?? pool[0] ?? null;
}

export const plansApi = {
  list: () =>
    apiClient<{ success: boolean; data: Plan[] }>('/api/plans').then(res => {
      const data = unwrap<Plan[] | { data?: Plan[] }>(res);
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && Array.isArray((data as { data?: Plan[] }).data)) {
        return (data as { data: Plan[] }).data;
      }
      return [];
    }),
  get: (id: string) =>
    apiClient<{ success: boolean; data: Plan }>(`/api/plans/${id}`).then(res => unwrap<Plan>(res)),
};
