import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { ticketsAssigned: number; tasksAssigned: number };
}

export interface Invitation {
  id: string;
  email: string;
  status: string;
  permissions?: string[];
  expiresAt: string;
  createdAt: string;
  invitedBy: { name: string };
}

export type InternalProfile = 'ADMIN' | 'SUPPORT' | 'FINANCE' | 'COMMERCIAL' | 'READ_ONLY';

export interface Ticket {
  id: string;
  protocol: string;
  title: string;
  description?: string;
  channel: string;
  category: string;
  priority: string;
  status: string;
  barbershopId: string | null;
  version?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  resolveNote: string | null;
  createdBy?: { id: string; name: string; email?: string; avatarUrl?: string | null };
  assignedTo: { id: string; name: string; avatarUrl?: string | null } | null;
  barbershop: { id: string; name: string } | null;
  comments?: TicketComment[];
  history?: TicketHistory[];
  tasks?: TicketTask[];
  _count?: { comments: number; history: number; tasks: number };
}

export interface TicketComment {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl?: string | null };
}

export interface TicketHistory {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  createdAt: string;
  actor: { id: string; name: string };
}

export interface TicketTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: { id: string; name: string } | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  barbershopId: string | null;
  ticketId: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  assignedTo: { id: string; name: string; avatarUrl?: string | null } | null;
  completedBy: { id: string; name: string } | null;
  barbershop: { id: string; name: string } | null;
  ticket: { id: string; protocol: string; title: string } | null;
  comments?: TaskComment[];
  history?: TaskHistory[];
  _count?: { comments: number; history: number };
}

export interface TaskComment {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl?: string | null };
}

export interface TaskHistory {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  createdAt: string;
  actor: { id: string; name: string };
}

export interface WorkSummary {
  summary: {
    totalOpenTickets: number;
    totalInProgressTickets: number;
    totalMyActiveTasks: number;
    totalCompletedToday: number;
    unassignedCount: number;
  };
  myOpenTickets: Ticket[];
  myOverdueTasks: Task[];
  myTodayTasks: Task[];
  unassignedTickets: Ticket[];
  recentActivity: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type OverviewPeriod = 'today' | '7d' | '30d' | '90d' | '12m';

export interface OverviewPlan {
  planId: string;
  name: string;
  price: number;
  billingCycle: string;
  activeSubscriptions: number;
  periodRevenue: number;
  periodInvoices: number;
}

export interface OverviewAttentionItem {
  id: string;
  severity: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  count: number;
  to: string;
}

export interface AdminOverview {
  period: {
    key: OverviewPeriod;
    label: string;
    bucket: 'hour' | 'day' | 'month';
    from: string;
    to: string;
    prevFrom: string;
    prevTo: string;
  };
  generatedAt: string;
  revenue: {
    mrr: number;
    arr: number;
    arpa: number;
    periodRevenue: number;
    periodRevenuePrev: number;
    periodRevenueDeltaPct: number | null;
    paidInvoices: number;
    byPlan: OverviewPlan[];
  };
  subscriptions: {
    active: number;
    trialing: number;
    pending: number;
    pastDue: number;
    unpaid: number;
    canceled: number;
    trialingExpiring3d: number;
    trialingExpiring7d: number;
    newInPeriod: number;
    newInPrevPeriod: number;
    upgrades: number;
    downgrades: number;
  };
  growth: {
    newShops: number;
    newShopsPrev: number;
    newShopsDeltaPct: number | null;
    activeShops: number;
    pendingApprovals: number;
    inactiveShops14d: number;
    churnShops: number;
    churnRevenue: number;
    trialStarted: number;
    trialPaid: number;
    trialToPaidPct: number | null;
  };
  usage: {
    appointmentsCreated: number;
    completedAppointments: number;
    gmv: number;
    newClients: number;
    whatsappSent: number;
    whatsappDelivered: number;
    emailSent: number;
    avgRating: number | null;
    reviews: number;
  };
  health: {
    errors5xx24h: number;
    errors5xxLastHour: number;
    cronFailures24h: number;
    outboxStuck: number;
    whatsappFailed24h: number;
    emailFailed24h: number;
    avgDeliveryLatencyMs: number;
  };
  attention: OverviewAttentionItem[];
  charts: {
    series: string[];
    newShops: number[];
    revenue: number[];
    appointmentsCreated: number[];
    appointmentsCompleted: number[];
    mrr: number[];
    funnel: {
      shopsCreated: number;
      onboardingCompleted: number;
      shopsWithAppointment: number;
      paidSubscriptions: number;
    };
  };
}

// ── Accounts ──────────────────────────────────────────────────────────────────

export type AccountsStatusFilter = 'active' | 'inactive';
export type AccountsApprovalFilter = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AccountsSort = 'recent' | 'oldest' | 'name';

export interface AccountPlanInfo {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
}

export interface AccountSubscription {
  status: string;
  startDate: string;
  endDate: string | null;
  plan: AccountPlanInfo;
}

export interface AccountRow {
  id: string;
  name: string;
  whatsapp: string;
  cnpj: string | null;
  address: string | null;
  city: string | null;
  active: boolean;
  approvalStatus: AccountsApprovalFilter;
  createdAt: string;
  counts: { users: number; appointments: number; tickets: number; queue: number };
  subscription: AccountSubscription | null;
}

export interface AccountsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AccountsStatusFilter;
  approval?: AccountsApprovalFilter;
  sort?: AccountsSort;
}

export interface AccountsListResponse {
  success: boolean;
  data: AccountRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: { total: number; active: number; inactive: number; pendingApproval: number };
  };
}

export interface AccountAttentionItem {
  id: string;
  severity: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  to?: string;
}

export interface AccountDetail {
  shop: {
    id: string;
    name: string;
    whatsapp: string;
    cnpj: string | null;
    address: string | null;
    city: string | null;
    active: boolean;
    approvalStatus: AccountsApprovalFilter;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    operationMode: string;
    businessSegment: string;
    onboardingCompletedAt: string | null;
    onboardingCurrentStep: string | null;
    organizationId: string | null;
  };
  members: { total: number; active: number; byRole: Record<string, number> };
  subscription:
    | (AccountSubscription & {
        id: string;
        cancelDate: string | null;
        cancelReason: string | null;
        createdAt: string;
      })
    | null;
  billing: { invoicesTotal: number; paid: number; overdue: number; pending: number; sumPaid: number };
  usage: {
    appointments: number;
    appointments30d: number;
    completed30d: number;
    queueEntries: number;
    tickets: number;
    servicesActive: number;
    productsActive: number;
    clients: number;
    lastAppointment: { id: string; date: string; time: string; status: string } | null;
  };
  attention: AccountAttentionItem[];
}

// ── Product adoption ──────────────────────────────────────────────────────────

export interface ProductAdoption {
  generatedAt: string;
  catalog: {
    shopsTotal: number;
    shopsWithCatalog: number;
    adoptionPct: number;
    productsActive: number;
    productsInactive: number;
    categoriesTotal: number;
    lowStock: number;
    outOfStock: number;
  };
  sales30d: { units: number; revenue: number };
  topProducts: { productId: string; name: string; units: number; revenue: number }[];
  topCategories: { categoryId: string | null; name: string; products: number }[];
}

// ── Operations ────────────────────────────────────────────────────────────────

export type OperationsStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';

export interface OperationsHealth {
  generatedAt: string;
  status: OperationsStatus;
  errors: {
    total24h: number;
    last24h5xx: number;
    lastHour5xx: number;
    byStatus: { statusCode: number; count: number }[];
    topPaths: { path: string; method: string; count: number }[];
  };
  cron: {
    failures24h: number;
    running: number;
    recentFailures: { id: string; jobName: string; startedAt: string; error: string | null }[];
  };
  delivery: {
    whatsapp: { total24h: number; failed24h: number; failedRatePct: number };
    email: { total24h: number; failed24h: number; failedRatePct: number };
  };
  outbox: { pending: number; failed: number };
}


// ── API ───────────────────────────────────────────────────────────────────────

export const adminInternalApi = {
  // Overview
  getOverview(period: OverviewPeriod = '30d') {
    return apiClient<{ success: boolean; data: AdminOverview }>(
      `/api/admin/overview?period=${period}`, 'GET', undefined, token()
    );
  },

  getProductAdoption() {
    return apiClient<{ success: boolean; data: ProductAdoption }>(
      '/api/admin/product/adoption', 'GET', undefined, token()
    );
  },

  // Accounts
  getAccounts(params: AccountsListParams = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    if (params.approval) q.set('approval', params.approval);
    if (params.sort) q.set('sort', params.sort);
    const query = q.toString();
    return apiClient<AccountsListResponse>(
      `/api/admin/accounts${query ? `?${query}` : ''}`, 'GET', undefined, token()
    );
  },

  getAccount(id: string) {
    return apiClient<{ success: boolean; data: AccountDetail }>(
      `/api/admin/accounts/${id}`, 'GET', undefined, token()
    );
  },

  // Work
  getWorkSummary() {
    return apiClient<{ success: boolean; data: WorkSummary }>(
      '/api/admin/work/summary', 'GET', undefined, token()
    ).then(r => r.data);
  },

  // Team
  listTeam(params: { page?: number; limit?: number; search?: string; status?: string } = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    return apiClient<{ success: boolean; users: TeamMember[]; invitations: Invitation[]; meta: any }>(
      `/api/admin/team?${q.toString()}`, 'GET', undefined, token()
    );
  },

  inviteTeamMember(email: string, profile: InternalProfile = 'ADMIN') {
    return apiClient<{ success: boolean; data: Invitation }>(
      '/api/admin/team/invitations', 'POST', { email, profile }, token()
    );
  },

  resendInvitation(id: string) {
    return apiClient<{ success: boolean; data: Invitation }>(
      `/api/admin/team/invitations/${id}/resend`, 'POST', undefined, token()
    );
  },

  revokeInvitation(id: string) {
    return apiClient<{ success: boolean; data: { success: boolean } }>(
      `/api/admin/team/invitations/${id}`, 'DELETE', undefined, token()
    );
  },

  deactivateMember(id: string) {
    return apiClient<{ success: boolean; data: { success: boolean } }>(
      `/api/admin/team/${id}/status`, 'PATCH', { active: false }, token()
    );
  },

  reactivateMember(id: string) {
    return apiClient<{ success: boolean; data: { success: boolean; alreadyActive?: boolean } }>(
      `/api/admin/team/${id}/status`, 'PATCH', { active: true }, token()
    );
  },

  // Tickets
  listTickets(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    return apiClient<{ success: boolean; data: Ticket[]; meta: any }>(
      `/api/admin/tickets?${q.toString()}`, 'GET', undefined, token()
    );
  },

  getTicket(id: string) {
    return apiClient<{ success: boolean; data: Ticket }>(
      `/api/admin/tickets/${id}`, 'GET', undefined, token()
    ).then(r => r.data);
  },

  createTicket(data: { title: string; description: string; barbershopId?: string | null; channel?: string; category?: string; priority?: string }) {
    return apiClient<{ success: boolean; data: Ticket }>(
      '/api/admin/tickets', 'POST', data, token()
    ).then(r => r.data);
  },

  updateTicket(id: string, data: { status?: string; priority?: string; assignedToId?: string | null; category?: string; cancelReason?: string; resolveNote?: string; version: number }) {
    return apiClient<{ success: boolean; data: Ticket }>(
      `/api/admin/tickets/${id}`, 'PATCH', data, token()
    ).then(r => r.data);
  },

  addTicketComment(id: string, text: string) {
    return apiClient<{ success: boolean; data: TicketComment }>(
      `/api/admin/tickets/${id}/comments`, 'POST', { text }, token()
    ).then(r => r.data);
  },

  // Tasks
  listTasks(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    return apiClient<{ success: boolean; data: Task[]; meta: any }>(
      `/api/admin/tasks?${q.toString()}`, 'GET', undefined, token()
    );
  },

  getTask(id: string) {
    return apiClient<{ success: boolean; data: Task }>(
      `/api/admin/tasks/${id}`, 'GET', undefined, token()
    ).then(r => r.data);
  },

  createTask(data: { title: string; description?: string; priority?: string; assignedToId?: string | null; dueDate?: string; barbershopId?: string | null; ticketId?: string | null }) {
    return apiClient<{ success: boolean; data: Task }>(
      '/api/admin/tasks', 'POST', data, token()
    ).then(r => r.data);
  },

  updateTask(id: string, data: { status?: string; priority?: string; assignedToId?: string | null; title?: string; description?: string | null; dueDate?: string | null; reason?: string; version: number }) {
    return apiClient<{ success: boolean; data: Task }>(
      `/api/admin/tasks/${id}`, 'PATCH', data, token()
    ).then(r => r.data);
  },

  addTaskComment(id: string, text: string) {
    return apiClient<{ success: boolean; data: TaskComment }>(
      `/api/admin/tasks/${id}/comments`, 'POST', { text }, token()
    ).then(r => r.data);
  },

  // Operations
  getOperationsHealth() {
    return apiClient<{ success: boolean; data: OperationsHealth }>(
      '/api/admin/operations/health', 'GET', undefined, token()
    );
  },
};
