import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  barbershops: { id: string; name: string }[];
  members?: { id: string; userId: string; role: string; user: { name: string; email: string } }[];
}

export interface OrganizationDashboardShop {
  barbershopId: string;
  name: string;
  logoUrl: string | null;
  isOpen: boolean;
  accessLevel: 'FULL' | 'OPERATIONAL';
  liveNow: number;
  revenue?: { today: number; week: number; month: number };
}

export interface AvailableBarbershop {
  id: string;
  name: string;
  logoUrl?: string | null;
  city?: string | null;
}

export interface AttachedBarbershop {
  id: string;
  name: string;
  organizationId: string | null;
}

export const organizationsApi = {
  listMy: () =>
    apiClient<{ data: Organization[] }>('/api/organizations', 'GET', undefined, token()).then(r => unwrap<Organization[]>(r)),

  create: (data: { name: string; slug: string; logoUrl?: string }) =>
    apiClient<{ data: Organization }>('/api/organizations', 'POST', data, token()).then(r => unwrap<Organization>(r)),

  getById: (id: string) =>
    apiClient<{ data: Organization }>(`/api/organizations/${id}`, 'GET', undefined, token()).then(r => unwrap<Organization>(r)),

  update: (id: string, data: { name?: string; slug?: string; logoUrl?: string | null }) =>
    apiClient<{ data: Organization }>(`/api/organizations/${id}`, 'PATCH', data, token()).then(r => unwrap<Organization>(r)),

  delete: (id: string) =>
    apiClient(`/api/organizations/${id}`, 'DELETE', undefined, token()),

  inviteMember: (orgId: string, data: { userId: string; role: string }) =>
    apiClient(`/api/organizations/${orgId}/members`, 'POST', data, token()),

  listMembers: (orgId: string) =>
    apiClient(`/api/organizations/${orgId}/members`, 'GET', undefined, token()),

  updateMemberRole: (orgId: string, memberId: string, role: string) =>
    apiClient(`/api/organizations/${orgId}/members/${memberId}`, 'PATCH', { role }, token()),

  removeMember: (orgId: string, memberId: string) =>
    apiClient(`/api/organizations/${orgId}/members/${memberId}`, 'DELETE', undefined, token()),

  getDashboard: (orgId: string) =>
    apiClient<{ data: OrganizationDashboardShop[] }>(`/api/organizations/${orgId}/dashboard`, 'GET', undefined, token()).then(r => unwrap<OrganizationDashboardShop[]>(r)),

  listAvailableBarbershops: (orgId: string) =>
    apiClient<{ data: AvailableBarbershop[] }>(`/api/organizations/${orgId}/available-barbershops`, 'GET', undefined, token()).then(r => unwrap<AvailableBarbershop[]>(r)),

  attachBarbershop: (orgId: string, barbershopId: string) =>
    apiClient<{ data: AttachedBarbershop }>(`/api/organizations/${orgId}/barbershops`, 'POST', { barbershopId }, token()).then(r => unwrap<AttachedBarbershop>(r)),

  detachBarbershop: (orgId: string, barbershopId: string) =>
    apiClient<{ data: AttachedBarbershop }>(`/api/organizations/${orgId}/barbershops/${barbershopId}`, 'DELETE', undefined, token()).then(r => unwrap<AttachedBarbershop>(r)),
};
