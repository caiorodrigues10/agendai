import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

export type DashboardPeriod =
  'day' | 'week' | '1m' | '3m' | '6m' | '12m' | '1y' | '2y' | '3y' | '5y';

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

// ─── Tipos do módulo de Faturamento (Master Admin) ───────────────────────────

export interface FinancialOverview {
  expenses: {
    thisMonth: number;
    allTime: number;
    count: number;
  };
  fiados: {
    activeDebtors: number;
    totalDebtPending: number;
    overdueCount: number;
    barbershopsWithDebt: number;
  };
}

export interface FinancialSummary {
  expenses: {
    total: number;
    totalPaid: number;
    totalPending: number;
    count: number;
    byType: { type: string; total: number; count: number }[];
  };
  fiados: {
    activeDebtors: number;
    totalOriginal: number;
    totalPaid: number;
    totalPending: number;
    overdueCount: number;
    overdueAmount: number;
  };
}

export interface PaymentListItem {
  id: string;
  mpPaymentId: string | null;
  provider?: 'MERCADOPAGO' | 'ABACATEPAY';
  providerPaymentId?: string | null;
  checkoutUrl?: string | null;
  status:
    | 'pending'
    | 'approved'
    | 'authorized'
    | 'in_process'
    | 'in_mediation'
    | 'rejected'
    | 'cancelled'
    | 'refunded'
    | 'charged_back';
  statusDetail: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'payment_link';
  transactionAmount: number;
  currency: string;
  description: string;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionListItem {
  id: string;
  barbershopId: string;
  barbershopName?: string;
  planId: string;
  planName?: string;
  planPrice?: number;
  planBillingCycle?: 'MONTHLY' | 'YEARLY';
  status: string;
  startDate: string | null;
  endDate: string | null;
  cancelDate: string | null;
  cancelReason?: string | null;
  trialEndsAt: string;
  latestInvoice: { id: string; status: string; amount: number; createdAt: string } | null;
}

export interface SubscriptionEconomics {
  yearlySavingsPerYear: number;
  activeYearlySubscriptions: number;
  activeMonthlySubscriptions: number;
  totalTenantSavingsSoFar: number;
  totalPlatformForegoneSoFar: number;
  projectedAnnualDiscount: number;
  monthlyPlanPrice: number | null;
  yearlyPlanPrice: number | null;
}

export interface PlanItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle?: 'MONTHLY' | 'YEARLY';
  maxEmployees: number;
  hasDashboard?: boolean;
  tierKey?: string;
  features: string[];
  active: boolean;
  createdAt: string;
}

export interface BlockedEntityItem {
  id: string;
  type: string;
  value: string;
  reason: string | null;
  barbershopId: string | null;
  isActive: boolean;
  blockedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralPlatformStats {
  totalReferrals: number;
  converted: number;
  rejected: number;
  pending: number;
  conversionRate: number;
  totalCreditDays: number;
  topReferrers: {
    barbershopId: string;
    barbershopName: string;
    totalReferrals: number;
    creditDays: number;
  }[];
  monthlyEvolution: { month: string; count: number }[];
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

  listBarbershops: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    return apiClient<{
      success: boolean;
      data: BarbershopListItem[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/api/admin/barbershops?${qs.toString()}`, 'GET', undefined, getAuthHeader());
  },

  listUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    active?: boolean;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.role) qs.set('role', params.role);
    if (params?.active !== undefined) qs.set('active', String(params.active));
    if (params?.search) qs.set('search', params.search);
    return apiClient<{
      success: boolean;
      data: UserListItem[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/api/admin/users?${qs.toString()}`, 'GET', undefined, getAuthHeader());
  },

  createUser: (body: {
    name: string;
    email: string;
    password?: string;
    role: string;
    barbershopId?: string | null;
    active?: boolean;
  }) =>
    apiClient<{ success: boolean; data: UserListItem }>(
      `/api/admin/users`,
      'POST',
      body,
      getAuthHeader()
    ),

  updateUser: (
    id: string,
    body: { name?: string; email?: string; role?: string; active?: boolean }
  ) =>
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

  listAuditLogs: (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    resource?: string;
    action?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.userId) qs.set('userId', params.userId);
    if (params?.resource) qs.set('resource', params.resource);
    if (params?.action) qs.set('action', params.action);
    return apiClient<{
      success: boolean;
      data: AuditLog[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/api/admin/audit-logs?${qs.toString()}`, 'GET', undefined, getAuthHeader());
  },

  updateBarbershopStatus: (
    id: string,
    body: { active?: boolean; approvalStatus?: string; rejectionReason?: string }
  ) =>
    apiClient<{ success: boolean; data: any }>(
      `/api/admin/barbershops/${id}/status`,
      'PATCH',
      body,
      getAuthHeader()
    ),

  // ─── Faturamento: financeiro consolidado ────────────────────────────────

  getFinancialOverview: () =>
    apiClient<{ success: boolean; data: FinancialOverview }>(
      `/api/admin/financial/overview`,
      'GET',
      undefined,
      getAuthHeader()
    ),

  getFinancialSummary: (params?: { barbershopId?: string; from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.barbershopId) qs.set('barbershopId', params.barbershopId);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const query = qs.toString();
    return apiClient<{ success: boolean; data: FinancialSummary }>(
      `/api/admin/financial/summary${query ? `?${query}` : ''}`,
      'GET',
      undefined,
      getAuthHeader()
    );
  },

  // ─── Faturamento: pagamentos ────────────────────────────────────────────

  listPayments: (params?: { page?: number; limit?: number; barbershopId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.barbershopId) qs.set('barbershopId', params.barbershopId);
    return apiClient<{ success: boolean; data: PaymentListItem[]; meta: ListMeta }>(
      `/api/payments?${qs.toString()}`,
      'GET',
      undefined,
      getAuthHeader()
    );
  },

  // ─── Faturamento: assinaturas ───────────────────────────────────────────

  listSubscriptions: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    return apiClient<{ success: boolean; data: SubscriptionListItem[]; meta: ListMeta }>(
      `/api/admin/subscriptions?${qs.toString()}`,
      'GET',
      undefined,
      getAuthHeader()
    );
  },

  getSubscriptionEconomics: () =>
    apiClient<{ success: boolean; data: SubscriptionEconomics }>(
      `/api/admin/subscriptions/economics`,
      'GET',
      undefined,
      getAuthHeader()
    ),

  cancelSubscription: (barbershopId: string) =>
    apiClient<{ success: boolean; message: string }>(
      `/api/admin/subscriptions/${barbershopId}`,
      'DELETE',
      undefined,
      getAuthHeader()
    ),

  // ─── Faturamento: planos ────────────────────────────────────────────────

  listPlans: (includeInactive = true) =>
    apiClient<{ success: boolean; data: PlanItem[] }>(
      `/api/plans${includeInactive ? '?all=true' : ''}`,
      'GET',
      undefined,
      getAuthHeader()
    ),

  createPlan: (body: {
    name: string;
    description?: string;
    price: number;
    billingCycle?: 'MONTHLY' | 'YEARLY';
    maxEmployees: number;
    hasDashboard?: boolean;
    tierKey?: string;
    features: string[];
  }) =>
    apiClient<{ success: boolean; data: PlanItem }>(
      `/api/admin/plans`,
      'POST',
      body,
      getAuthHeader()
    ),

  updatePlan: (
    id: string,
    body: {
      name?: string;
      description?: string;
      price?: number;
      billingCycle?: 'MONTHLY' | 'YEARLY';
      maxEmployees?: number;
      hasDashboard?: boolean;
      tierKey?: string;
      features?: string[];
      active?: boolean;
    }
  ) =>
    apiClient<{ success: boolean; data: PlanItem }>(
      `/api/admin/plans/${id}`,
      'PATCH',
      body,
      getAuthHeader()
    ),

  deactivatePlan: (id: string) =>
    apiClient<{
      success: boolean;
      message: string;
      data: { activeSubscriptionsRemaining: number; info: string };
    }>(`/api/admin/plans/${id}`, 'DELETE', undefined, getAuthHeader()),

  // ─── Faturamento: bloqueios (inadimplência) ─────────────────────────────

  listBlockedEntities: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.type) qs.set('type', params.type);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    if (params?.search) qs.set('search', params.search);
    return apiClient<{ success: boolean; data: BlockedEntityItem[]; meta: ListMeta }>(
      `/api/admin/blocked-entities?${qs.toString()}`,
      'GET',
      undefined,
      getAuthHeader()
    );
  },

  unblockEntity: (id: string) =>
    apiClient<{ success: boolean; data: BlockedEntityItem }>(
      `/api/admin/blocked-entities/${id}`,
      'DELETE',
      undefined,
      getAuthHeader()
    ),

  // ─── Notificações admin ─────────────────────────────────────────────────

  listNotifications: (params?: {
    page?: number;
    limit?: number;
    read?: boolean;
    type?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.read !== undefined) qs.set('read', String(params.read));
    if (params?.type) qs.set('type', params.type);
    return apiClient<{
      success: boolean;
      data: AdminNotificationItem[];
      meta: ListMeta & { unreadCount: number };
    }>(`/api/admin/notifications?${qs.toString()}`, 'GET', undefined, getAuthHeader());
  },

  unreadNotificationsCount: () =>
    apiClient<{ success: boolean; data: { count: number } }>(
      '/api/admin/notifications/unread-count',
      'GET',
      undefined,
      getAuthHeader()
    ),

  markNotificationRead: (id: string) =>
    apiClient<{ success: boolean; data: AdminNotificationItem }>(
      `/api/admin/notifications/${id}/read`,
      'PATCH',
      undefined,
      getAuthHeader()
    ),

  markAllNotificationsRead: () =>
    apiClient<{ success: boolean; message: string }>(
      '/api/admin/notifications/read-all',
      'PATCH',
      undefined,
      getAuthHeader()
    ),

  getReferralStats: async () => {
    const res = await apiClient<{ success: boolean; data: ReferralPlatformStats }>(
      '/api/admin/referrals',
      'GET',
      undefined,
      getAuthHeader()
    );
    if (res && typeof res === 'object' && 'data' in res) {
      return (res as { data: ReferralPlatformStats }).data;
    }
    return res as unknown as ReferralPlatformStats;
  },
};
