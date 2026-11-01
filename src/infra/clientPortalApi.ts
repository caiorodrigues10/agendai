import { apiClient } from './apiClient';

const CLIENT_ACCESS_KEY = 'agendai_client_portal_access';
const CLIENT_REFRESH_KEY = 'agendai_client_portal_refresh';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return localStorage.getItem(CLIENT_ACCESS_KEY) || sessionStorage.getItem(CLIENT_ACCESS_KEY) || '';
}

function persistClientSession(accessToken: string, refreshToken?: string) {
  localStorage.setItem(CLIENT_ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(CLIENT_REFRESH_KEY, refreshToken);
}

function clearClientSession() {
  localStorage.removeItem(CLIENT_ACCESS_KEY);
  localStorage.removeItem(CLIENT_REFRESH_KEY);
  sessionStorage.removeItem(CLIENT_ACCESS_KEY);
  sessionStorage.removeItem(CLIENT_REFRESH_KEY);
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshSession(): Promise<string | null> {
  const refreshToken = localStorage.getItem(CLIENT_REFRESH_KEY);
  if (!refreshToken) return null;

  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/client/portal/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      const data = json?.data ?? json;
      if (data?.accessToken) {
        persistClientSession(data.accessToken, data.refreshToken);
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function clientFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const accessToken = token();
  const headers = new Headers(init?.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    const newToken = await tryRefreshSession();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(url, { ...init, headers });
    }
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface ClientIdentity {
  id: string;
  name: string;
  phone: string;
  phoneVerified: boolean;
}

export interface ClientSalonLink {
  id: string;
  barbershopId: string;
  barbershopName?: string;
  status: string;
  salonClientName?: string;
  marketingOptIn: boolean;
}

export interface ClientAppointment {
  id: string;
  barbershopName: string;
  serviceName: string;
  staffName?: string;
  date: string;
  time: string;
  status: string;
  price: number;
}

/**
 * Caso do escritório visto pelo portal do cliente.
 *
 * Regra de sigilo: **não** traz número de processo, apelido interno,
 * parte adversária, tribunal nem observações — só o rótulo seguro, os
 * andamentos marcados como visíveis, o próximo compromisso e os contratos
 * aguardando assinatura.
 */
export interface ClientPortalCase {
  id: string;
  barbershopId: string;
  barbershopName: string;
  label: string;
  status: string;
  practiceArea: string | null;
  nextAppointment: {
    id: string;
    scheduledAt: string;
    time: string | null;
    serviceName: string | null;
  } | null;
  sharedEvents: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    occurredAt: string;
  }[];
  pendingSignatures: {
    id: string;
    contractTitle: string;
    token: string;
  }[];
}

export interface ClientBenefit {
  type: string;
  description: string;
  available: number;
  used: number;
  validUntil?: string;
}

interface PortalDashboardPayload {
  identity?: ClientIdentity | null;
  links?: unknown[];
  careInstructions?: unknown[];
  recentAppointments?: unknown[];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function mapSalonLink(raw: unknown): ClientSalonLink {
  const link = asRecord(raw);
  const barbershop = asRecord(link.barbershop);
  const salonClient = asRecord(link.salonClient);
  return {
    id: String(link.id ?? ''),
    barbershopId: String(link.barbershopId ?? ''),
    barbershopName: typeof barbershop.name === 'string' ? barbershop.name : undefined,
    status: String(link.status ?? ''),
    salonClientName: typeof salonClient.name === 'string' ? salonClient.name : undefined,
    marketingOptIn: link.marketingOptIn !== false,
  };
}

function formatAppointmentDate(value: unknown): string {
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return '';
}

function mapAppointment(raw: unknown): ClientAppointment {
  const appt = asRecord(raw);
  const service = asRecord(appt.service);
  const staff = asRecord(appt.staff);
  const barbershop = asRecord(appt.barbershop);
  const price = typeof service.price === 'number' ? service.price : 0;
  return {
    id: String(appt.id ?? ''),
    barbershopName: typeof barbershop.name === 'string' ? barbershop.name : '',
    serviceName: typeof service.name === 'string' ? service.name : '',
    staffName: typeof staff.name === 'string' ? staff.name : undefined,
    date: formatAppointmentDate(appt.date),
    time: typeof appt.time === 'string' ? appt.time : '',
    status: String(appt.status ?? ''),
    price,
  };
}

async function getDashboard(barbershopId: string): Promise<PortalDashboardPayload> {
  const qs = new URLSearchParams({ barbershopId });
  const res = await clientFetch<{ data: PortalDashboardPayload }>(
    `/api/client/portal/dashboard?${qs.toString()}`
  );
  return unwrap<PortalDashboardPayload>(res);
}

export const clientPortalApi = {
  requestCode: (phone: string, name?: string, barbershopId?: string) =>
    apiClient<{ success: boolean; data?: unknown }>(
      '/api/client/portal/request-otp',
      'POST',
      { phone, name: name?.trim() || 'Cliente', ...(barbershopId ? { barbershopId } : {}) }
    ),

  verifyCode: async (phone: string, code: string) => {
    const res = await apiClient<{
      success: boolean;
      data?: { accessToken?: string; refreshToken?: string; identity?: ClientIdentity };
    }>('/api/client/portal/verify-otp', 'POST', { phone, code });
    const data = unwrap<{ accessToken?: string; refreshToken?: string; identity?: ClientIdentity }>(res);
    if (data?.accessToken) {
      persistClientSession(data.accessToken, data.refreshToken);
    }
    return data;
  },

  logout: async () => {
    try {
      await clientFetch<{ success: boolean }>('/api/client/portal/logout', { method: 'POST' });
    } finally {
      clearClientSession();
    }
  },

  logoutAll: async () => {
    try {
      await clientFetch<{ success: boolean }>('/api/client/portal/logout-all', { method: 'POST' });
    } finally {
      clearClientSession();
    }
  },

  getMe: () =>
    clientFetch<{ data: ClientIdentity }>('/api/client/portal/me').then(r =>
      unwrap<ClientIdentity>(r)
    ),

  getSalons: () =>
    clientFetch<{ data: unknown[] }>('/api/client/portal/my-links').then(r => {
      const links = unwrap<unknown[]>(r);
      return Array.isArray(links) ? links.map(mapSalonLink) : [];
    }),

  requestLink: (barbershopId: string) =>
    clientFetch<{ success: boolean; data?: unknown }>(
      '/api/client/portal/request-link',
      { method: 'POST', body: JSON.stringify({ barbershopId }), headers: { 'Content-Type': 'application/json' } }
    ),

  unlinkSalon: (linkId: string) =>
    clientFetch<{ success: boolean }>(
      `/api/client/portal/my-links/${linkId}/revoke`,
      { method: 'POST' }
    ),

  getAppointments: async (barbershopId: string, _params?: { status?: string; page?: number }) => {
    const dashboard = await getDashboard(barbershopId);
    const appointments = Array.isArray(dashboard.recentAppointments) ? dashboard.recentAppointments : [];
    return appointments.map(mapAppointment);
  },

  getHistory: async (barbershopId: string, params?: { page?: number }) => {
    const page = params?.page ?? 1;
    const res = await clientFetch<{ success: boolean; data: { data: unknown[]; total: number; page: number; limit: number } }>(
      `/api/client/portal/history?barbershopId=${barbershopId}&page=${page}&limit=20`
    );
    const payload = res && typeof res === 'object' && 'data' in res ? (res as { data: { data: unknown[]; total: number; page: number; limit: number } }).data : { data: [], total: 0, page: 1, limit: 20 };
    return { data: (payload.data ?? []).map(mapAppointment), total: payload.total ?? 0, page: payload.page ?? 1, limit: payload.limit ?? 20 };
  },

  /** Agora retorna benefits reais do dashboard (membro ativo do salão). */
  /** Casos compartilhados pelo escritório com o cliente. */
  getCases: async (): Promise<ClientPortalCase[]> => {
    const res = await clientFetch<{ data: unknown[] }>('/api/client/portal/cases');
    const cases = unwrap<unknown[]>(res);
    if (!Array.isArray(cases)) return [];
    return cases.map((raw: unknown) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const next = item.nextAppointment as Record<string, unknown> | null;
      return {
        id: String(item.id ?? ''),
        barbershopId: String(item.barbershopId ?? ''),
        barbershopName: String(item.barbershopName ?? ''),
        label: String(item.label ?? 'Processo'),
        status: String(item.status ?? ''),
        practiceArea: item.practiceArea ? String(item.practiceArea) : null,
        nextAppointment: next
          ? {
              id: String(next.id ?? ''),
              scheduledAt: String(next.scheduledAt ?? ''),
              time: next.time ? String(next.time) : null,
              serviceName: next.serviceName ? String(next.serviceName) : null,
            }
          : null,
        sharedEvents: Array.isArray(item.sharedEvents)
          ? item.sharedEvents.map((event: unknown) => {
              const e = (event ?? {}) as Record<string, unknown>;
              return {
                id: String(e.id ?? ''),
                type: String(e.type ?? 'NOTE'),
                title: String(e.title ?? ''),
                description: e.description ? String(e.description) : null,
                occurredAt: String(e.occurredAt ?? ''),
              };
            })
          : [],
        pendingSignatures: Array.isArray(item.pendingSignatures)
          ? item.pendingSignatures.map((sig: unknown) => {
              const s2 = (sig ?? {}) as Record<string, unknown>;
              return {
                id: String(s2.id ?? ''),
                contractTitle: String(s2.contractTitle ?? ''),
                token: String(s2.token ?? ''),
              };
            })
          : [],
      };
    });
  },

  getBenefits: async (barbershopId: string): Promise<ClientBenefit[]> => {
    const dashboard = await getDashboard(barbershopId);
    const raw = (dashboard as Record<string, unknown>).benefits;
    if (!Array.isArray(raw)) return [];
    return raw.map((b: Record<string, unknown>) => ({
      type: String(b.type ?? ""),
      description: String(b.description ?? ""),
      available: Number(b.available ?? 0),
      used: Number(b.used ?? 0),
      validUntil: b.validUntil ? String(b.validUntil) : undefined,
    }));
  },

  getCareInstructions: () =>
    clientFetch<{ data: unknown }>('/api/client/portal/my-care-instructions'),
};
