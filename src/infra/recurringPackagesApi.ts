import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';
import { unwrapData, unwrapList } from '../utils/apiData';

function unwrap<T>(res: unknown): T {
  return unwrapData<T>(res);
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface RecurringPackagePlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: string;
  isActive: boolean;
  maxMembers?: number;
  benefits: RecurringPackageBenefit[];
}

export interface RecurringPackageBenefit {
  id: string;
  serviceId?: string;
  serviceName?: string;
  type: string;
  quantity: number;
  discountPercent?: number;
  discountAmount?: number;
  description: string;
}

export interface ClientRecurringPackage {
  id: string;
  planId: string;
  planName?: string;
  clientId: string;
  clientName?: string;
  status: string;
  startDate: string;
  currentPeriodEnd: string;
  cycles: RecurringPackageCycle[];
  usageSummary: { benefitId: string; used: number; total: number }[];
}

export interface RecurringPackageCycle {
  id: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  status: string;
  paidAt?: string;
  paymentMethod?: string;
}

export const recurringPackagesApi = {
  listPlans: (barbershopId: string) =>
    apiClient<{ success: boolean; data: RecurringPackagePlan[] }>(
      `/api/barbershops/${barbershopId}/recurring-package-plans`,
      'GET',
      undefined,
      token()
    ).then(res => unwrapList<RecurringPackagePlan>(res)),

  createPlan: (barbershopId: string, data: { name: string; description?: string; price: number; billingCycle: string; benefits: any[] }) =>
    apiClient<{ success: boolean; data: RecurringPackagePlan }>(
      `/api/barbershops/${barbershopId}/recurring-package-plans`,
      'POST',
      data,
      token()
    ).then(res => unwrap<RecurringPackagePlan>(res)),

  updatePlan: (barbershopId: string, planId: string, data: Partial<RecurringPackagePlan>) =>
    apiClient<{ success: boolean; data: RecurringPackagePlan }>(
      `/api/barbershops/${barbershopId}/recurring-package-plans/${planId}`,
      'PATCH',
      data,
      token()
    ).then(res => unwrap<RecurringPackagePlan>(res)),

  listMemberships: (barbershopId: string, params?: { status?: string; clientId?: string }) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage[] }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrapList<ClientRecurringPackage>(res)),

  createMembership: (barbershopId: string, data: { planId: string; clientId: string }) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages`,
      'POST',
      data,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  getMembership: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages/${id}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  activate: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages/${id}/activate`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  pause: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages/${id}/pause`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  resume: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages/${id}/resume`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  cancel: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages/${id}/cancel`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  recordPayment: (barbershopId: string, id: string, cycleId: string, data: { paymentMethod: string }) =>
    apiClient<{ success: boolean; data: RecurringPackageCycle }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages/${id}/cycles/${cycleId}/payment`,
      'POST',
      data,
      token()
    ).then(res => unwrap<RecurringPackageCycle>(res)),

  useBenefit: (barbershopId: string, id: string, benefitId: string, appointmentId?: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages/${id}/benefits/${benefitId}/use`,
      'POST',
      { appointmentId },
      token()
    ),

  reverseBenefit: (barbershopId: string, id: string, benefitId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/client-recurring-packages/${id}/benefits/${benefitId}/reverse`,
      'POST',
      undefined,
      token()
    ),
};

// Backward-compatible alias using old URL paths
export const membershipsApi = {
  listPlans: (barbershopId: string) =>
    apiClient<{ success: boolean; data: RecurringPackagePlan[] }>(
      `/api/barbershops/${barbershopId}/membership-plans`,
      'GET',
      undefined,
      token()
    ).then(res => unwrapList<RecurringPackagePlan>(res)),

  createPlan: (barbershopId: string, data: { name: string; description?: string; price: number; billingCycle: string; benefits: any[] }) =>
    apiClient<{ success: boolean; data: RecurringPackagePlan }>(
      `/api/barbershops/${barbershopId}/membership-plans`,
      'POST',
      data,
      token()
    ).then(res => unwrap<RecurringPackagePlan>(res)),

  updatePlan: (barbershopId: string, planId: string, data: Partial<RecurringPackagePlan>) =>
    apiClient<{ success: boolean; data: RecurringPackagePlan }>(
      `/api/barbershops/${barbershopId}/membership-plans/${planId}`,
      'PATCH',
      data,
      token()
    ).then(res => unwrap<RecurringPackagePlan>(res)),

  listMemberships: (barbershopId: string, params?: { status?: string; clientId?: string }) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage[] }>(
      `/api/barbershops/${barbershopId}/client-memberships${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrapList<ClientRecurringPackage>(res)),

  createMembership: (barbershopId: string, data: { planId: string; clientId: string }) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-memberships`,
      'POST',
      data,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  getMembership: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  activate: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/activate`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  pause: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/pause`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  resume: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/resume`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  cancel: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientRecurringPackage }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/cancel`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientRecurringPackage>(res)),

  recordPayment: (barbershopId: string, id: string, cycleId: string, data: { paymentMethod: string }) =>
    apiClient<{ success: boolean; data: RecurringPackageCycle }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/cycles/${cycleId}/payment`,
      'POST',
      data,
      token()
    ).then(res => unwrap<RecurringPackageCycle>(res)),

  useBenefit: (barbershopId: string, id: string, benefitId: string, appointmentId?: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/benefits/${benefitId}/use`,
      'POST',
      { appointmentId },
      token()
    ),

  reverseBenefit: (barbershopId: string, id: string, benefitId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/benefits/${benefitId}/reverse`,
      'POST',
      undefined,
      token()
    ),
};
