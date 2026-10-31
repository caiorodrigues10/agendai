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

const auditCalendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  calendar: 'gregory',
  numberingSystem: 'latn',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const parseAuditDay = (day: string): Date => {
  const date = new Date(`${day}T12:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== day
  ) {
    throw new RangeError('Data de auditoria inválida. Use YYYY-MM-DD.');
  }
  return date;
};

const auditCalendarDay = (timestamp: number): string => {
  const parts: Record<string, string> = {};
  for (const part of auditCalendar.formatToParts(timestamp)) parts[part.type] = part.value;
  return `${parts.year.padStart(4, '0')}-${parts.month}-${parts.day}`;
};

/**
 * First real instant of a São Paulo calendar day. Looking up the day boundary
 * through Intl also handles historical DST dates when midnight did not exist;
 * neither the browser's timezone nor a fixed UTC offset determines the range.
 */
const startOfAuditDay = (day: string): number => {
  const noon = parseAuditDay(day).getTime();
  const calendarDay = 24 * 60 * 60 * 1000;
  let lower = noon - calendarDay;
  let upper = noon + calendarDay;
  while (lower < upper) {
    const middle = lower + Math.floor((upper - lower) / 2);
    if (auditCalendarDay(middle) < day) lower = middle + 1;
    else upper = middle;
  }
  return lower;
};

const endOfAuditDay = (day: string): number => {
  const next = parseAuditDay(day);
  next.setUTCDate(next.getUTCDate() + 1);
  return startOfAuditDay(next.toISOString().slice(0, 10)) - 1;
};

const auditQueryString = (params: AuditLogListParams): string => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  qs.set('limit', String(params.limit ?? 25));
  if (params.q) qs.set('search', params.q);
  if (params.action) qs.set('action', params.action);
  if (params.resource) qs.set('resource', params.resource);
  if (params.userId) qs.set('userId', params.userId);
  if (params.shopId) qs.set('shopId', params.shopId);
  if (params.from) qs.set('from', new Date(startOfAuditDay(params.from)).toISOString());
  if (params.to) qs.set('to', new Date(endOfAuditDay(params.to)).toISOString());
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
  async getAuditLogs(params: AuditLogListParams = {}) {
    return apiClient<AuditLogsResponse>(
      `/api/admin/audit-logs?${auditQueryString(params)}`,
      'GET',
      undefined,
      token()
    );
  },

  getAuditFacets() {
    return apiClient<{ success: boolean; data: AuditFacets }>(
      '/api/admin/audit-logs/facets',
      'GET',
      undefined,
      token()
    );
  },

  getAuditAlerts() {
    return apiClient<{ success: boolean; data: AuditAlerts }>(
      '/api/admin/audit-logs/alerts',
      'GET',
      undefined,
      token()
    );
  },

  async exportAuditLogsCsv(params: AuditLogListParams = {}) {
    const filters: AuditLogListParams = { ...params };
    delete filters.page;
    return apiFetch(
      `/api/admin/audit-logs/export?${auditQueryString(filters)}`,
      {
        method: 'GET',
      },
      token()
    );
  },
};
