import { apiClient, apiFetch } from './apiClient';
import { authStorage } from './authStorage';
import type { AuditLog } from './adminApi';

function token() {
  return authStorage.getAccessToken() || '';
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  q?: string;
  action?: string;
  resource?: string;
  userId?: string;
  shopId?: string;
  from?: string;
  to?: string;
}

export interface AuditFilterValues {
  q: string;
  action: string;
  resource: string;
  userId: string;
  shopId: string;
  from: string;
  to: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AuditFacets {
  resources: string[];
  users: { id: string; name: string; email: string }[];
  shops: { id: string; name: string }[];
}

export interface AuditAlerts {
  generatedAt: string;
  windowHours: number;
  total: number;
  byGroup: { key: string; label: string; count: number }[];
  recent: {
    id: string;
    action: string;
    resource: string;
    resourceId: string | null;
    userId: string;
    userName: string | null;
    createdAt: string;
  }[];
}

export interface AuditSessions {
  generatedAt: string;
  windowHours: number;
  sessions: {
    key: string;
    userId: string | null;
    email: string | null;
    name: string | null;
    ip: string | null;
    userAgent: string | null;
    lastEvent: string;
    lastAt: string;
    status: 'ACTIVE' | 'CLOSED' | 'EXPIRED';
  }[];
}

const auditQueryString = (params: AuditLogListParams): string => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  qs.set('limit', String(params.limit ?? 25));
  if (params.q) qs.set('search', params.q);
  if (params.action) qs.set('action', params.action);
  if (params.resource) qs.set('resource', params.resource);
  if (params.userId) qs.set('userId', params.userId);
  if (params.shopId) qs.set('shopId', params.shopId);
  if (params.from) qs.set('from', `${params.from}T00:00:00.000Z`);
  if (params.to) qs.set('to', `${params.to}T23:59:59.999Z`);
  return qs.toString();
};

export const buildAuditFilterParams = (values: AuditFilterValues): AuditLogListParams => ({
  q: values.q || undefined,
  action: values.action || undefined,
  resource: values.resource || undefined,
  userId: values.userId || undefined,
  shopId: values.shopId || undefined,
  from: values.from || undefined,
  to: values.to || undefined,
});

export const adminAuditApi = {
  getAuditLogs(params: AuditLogListParams = {}) {
    return apiClient<AuditLogsResponse>(
      `/api/admin/audit-logs?${auditQueryString(params)}`, 'GET', undefined, token()
    );
  },

  getAuditFacets() {
    return apiClient<{ success: boolean; data: AuditFacets }>(
      '/api/admin/audit-logs/facets', 'GET', undefined, token()
    );
  },

  getAuditAlerts() {
    return apiClient<{ success: boolean; data: AuditAlerts }>(
      '/api/admin/audit-logs/alerts', 'GET', undefined, token()
    );
  },

  getAuditSessions() {
    return apiClient<{ success: boolean; data: AuditSessions }>(
      '/api/admin/audit-logs/sessions', 'GET', undefined, token()
    );
  },

  exportAuditLogsCsv(params: AuditLogListParams = {}) {
    const filters: AuditLogListParams = { ...params };
    delete filters.page;
    return apiFetch(`/api/admin/audit-logs/export?${auditQueryString(filters)}`, {
      method: 'GET',
    }, token());
  },
};
