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

function unwrap<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) return res.data as T;
  return res as T;
}

export const plansApi = {
  list: () => apiClient<any>('/api/plans').then(res => unwrap<Plan[]>(res)),
  get: (id: string) => apiClient<any>(`/api/plans/${id}`).then(res => unwrap<Plan>(res))
};
