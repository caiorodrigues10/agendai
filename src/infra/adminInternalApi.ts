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
  expiresAt: string;
  createdAt: string;
  invitedBy: { name: string };
}

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
  createdBy: { id: string; name: string; avatarUrl?: string | null };
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

// ── API ───────────────────────────────────────────────────────────────────────

export const adminInternalApi = {
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

  inviteTeamMember(email: string) {
    return apiClient<{ success: boolean; data: Invitation }>(
      '/api/admin/team/invitations', 'POST', { email }, token()
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

  // Operations (reuse existing)
  getOperationsHealth() {
    return apiClient<{ success: boolean; data: any }>(
      '/api/admin/operations/notifications', 'GET', undefined, token()
    );
  },
};
