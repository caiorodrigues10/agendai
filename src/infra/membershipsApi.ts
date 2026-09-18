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

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: string;
  isActive: boolean;
  maxMembers?: number;
  benefits: MembershipBenefit[];
}

export interface MembershipBenefit {
  id: string;
  serviceId?: string;
  serviceName?: string;
  type: string;
  quantity: number;
  discountPercent?: number;
  discountAmount?: number;
  description: string;
}

export interface ClientMembership {
  id: string;
  planId: string;
  planName?: string;
  clientId: string;
  clientName?: string;
  status: string;
  startDate: string;
  currentPeriodEnd: string;
  cycles: MembershipCycle[];
  usageSummary: { benefitId: string; used: number; total: number }[];
}

export interface MembershipCycle {
  id: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  status: string;
  paidAt?: string;
  paymentMethod?: string;
}

export const membershipsApi = {
  listPlans: (barbershopId: string) =>
    apiClient<{ success: boolean; data: MembershipPlan[] }>(
      `/api/barbershops/${barbershopId}/membership-plans`,
      'GET',
      undefined,
      token()
    ).then(res => unwrapList<MembershipPlan>(res)),

  createPlan: (barbershopId: string, data: { name: string; description?: string; price: number; billingCycle: string; benefits: any[] }) =>
    apiClient<{ success: boolean; data: MembershipPlan }>(
      `/api/barbershops/${barbershopId}/membership-plans`,
      'POST',
      data,
      token()
    ).then(res => unwrap<MembershipPlan>(res)),

  updatePlan: (barbershopId: string, planId: string, data: Partial<MembershipPlan>) =>
    apiClient<{ success: boolean; data: MembershipPlan }>(
      `/api/barbershops/${barbershopId}/membership-plans/${planId}`,
      'PATCH',
      data,
      token()
    ).then(res => unwrap<MembershipPlan>(res)),

  listMemberships: (barbershopId: string, params?: { status?: string; clientId?: string }) =>
    apiClient<{ success: boolean; data: ClientMembership[] }>(
      `/api/barbershops/${barbershopId}/client-memberships${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrapList<ClientMembership>(res)),

  createMembership: (barbershopId: string, data: { planId: string; clientId: string }) =>
    apiClient<{ success: boolean; data: ClientMembership }>(
      `/api/barbershops/${barbershopId}/client-memberships`,
      'POST',
      data,
      token()
    ).then(res => unwrap<ClientMembership>(res)),

  getMembership: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientMembership }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<ClientMembership>(res)),

  activate: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientMembership }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/activate`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientMembership>(res)),

  pause: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientMembership }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/pause`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientMembership>(res)),

  resume: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientMembership }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/resume`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientMembership>(res)),

  cancel: (barbershopId: string, id: string) =>
    apiClient<{ success: boolean; data: ClientMembership }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/cancel`,
      'POST',
      undefined,
      token()
    ).then(res => unwrap<ClientMembership>(res)),

  recordPayment: (barbershopId: string, id: string, cycleId: string, data: { paymentMethod: string }) =>
    apiClient<{ success: boolean; data: MembershipCycle }>(
      `/api/barbershops/${barbershopId}/client-memberships/${id}/cycles/${cycleId}/payment`,
      'POST',
      data,
      token()
    ).then(res => unwrap<MembershipCycle>(res)),

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
