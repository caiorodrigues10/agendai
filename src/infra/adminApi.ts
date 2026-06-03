import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

export type DashboardPeriod = 'day' | 'week' | '1m' | '3m' | '6m' | '12m' | '1y' | '2y' | '3y' | '5y';

export interface DashboardChartPoint {
  label: string;
  newShops: number;
  appointments: number;
  completedQueue: number;
}

export interface DashboardKPIs {
  totalBarbershops: number;
  activeBarbershops: number;
  totalUsers: number;
  newInPeriod: number;
  growthRate: string;
}

export interface RecentBarbershop {
  id: string;
  name: string;
  whatsapp: string;
  active: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  address: string | null;
  _count: { users: number };
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: 'MASTER_ADMIN' | 'OWNER' | 'EMPLOYEE' | 'CUSTOMER';
  active: boolean;
  barbershopId: string | null;
  createdAt: string;
  barbershop?: { name: string };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface DashboardData {
  periodLabel: string;
  kpis: DashboardKPIs;
  chartData: DashboardChartPoint[];
  recentBarbershops: RecentBarbershop[];
}

export interface BarbershopListItem {
  id: string;
  name: string;
  cnpj: string | null;
  whatsapp: string;
  address: string | null;
  active: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  _count: { users: number; appointments: number; queue: number };
}

function getAuthHeader(): string {
  const token = authStorage.getAccessToken();
  if (!token) throw new Error('Não autenticado');
  return token;
}

export const adminApi = {
  getDashboard: (period: DashboardPeriod = '12m') =>
    apiClient<{ success: boolean; data: DashboardData }>(
      `/api/admin/dashboard?period=${period}`,
      'GET',
      undefined,
      getAuthHeader()
    ),

  listBarbershops: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    return apiClient<{ success: boolean; data: BarbershopListItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/admin/barbershops?${qs.toString()}`,
      'GET',
      undefined,
      getAuthHeader()
    );
  },

  listUsers: (params?: { page?: number; limit?: number; role?: string; active?: boolean; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.role) qs.set('role', params.role);
    if (params?.active !== undefined) qs.set('active', String(params.active));
    if (params?.search) qs.set('search', params.search);
    return apiClient<{ success: boolean; data: UserListItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/admin/users?${qs.toString()}`,
      'GET',
      undefined,
      getAuthHeader()
    );
  },

  createUser: (body: { name: string; email: string; password?: string; role: string; barbershopId?: string | null; active?: boolean }) =>
    apiClient<{ success: boolean; data: UserListItem }>(
      `/api/admin/users`,
      'POST',
      body,
      getAuthHeader()
    ),

  updateUser: (id: string, body: { name?: string; email?: string; role?: string; active?: boolean }) =>
    apiClient<{ success: boolean; data: UserListItem }>(
      `/api/admin/users/${id}`,
      'PATCH',
      body,
      getAuthHeader()
    ),

  deleteUser: (id: string) =>
    apiClient<{ success: boolean; message: string }>(
      `/api/admin/users/${id}`,
      'DELETE',
      undefined,
      getAuthHeader()
    ),

  listAuditLogs: (params?: { page?: number; limit?: number; userId?: string; resource?: string; action?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.userId) qs.set('userId', params.userId);
    if (params?.resource) qs.set('resource', params.resource);
    if (params?.action) qs.set('action', params.action);
    return apiClient<{ success: boolean; data: AuditLog[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/admin/audit-logs?${qs.toString()}`,
      'GET',
      undefined,
      getAuthHeader()
    );
  },

  updateBarbershopStatus: (id: string, body: { active?: boolean; approvalStatus?: string; rejectionReason?: string }) =>
    apiClient<{ success: boolean; data: any }>(
      `/api/admin/barbershops/${id}/status`,
      'PATCH',
      body,
      getAuthHeader()
    ),
};
