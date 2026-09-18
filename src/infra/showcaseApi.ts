import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export type ShowcaseMode = 'direct_service' | 'whatsapp_evaluation';
export type ShowcaseStatusFilter = 'draft' | 'published' | 'hidden';
export type ShowcaseImageAuthorization =
  | 'team_confirmed'
  | 'no_identifiable_client'
  | 'pending_review';

export interface ShowcaseEntry {
  id: string;
  barbershopId: string;
  postId: string;
  title: string;
  description?: string;
  altText?: string;
  mode: string;
  serviceId?: string;
  staffId?: string;
  serviceName?: string;
  staffName?: string;
  servicePrice?: number;
  serviceDuration?: number;
  mediaUrl: string;
  mediaType: string;
  status: string;
  position: number;
  imageAuthorization?: string;
}

export interface ShowcaseAnalytics {
  totalViews: number;
  totalClicks: number;
  clickRate: number;
  byType: Record<string, number>;
}

export interface CreateShowcaseEntryInput {
  postId: string;
  title: string;
  description?: string;
  altText?: string;
  mode?: ShowcaseMode;
  serviceId?: string;
  staffId?: string;
  imageAuthorization: ShowcaseImageAuthorization;
  authorizedById?: string;
  authorizationNote?: string;
}

export interface UpdateShowcaseEntryInput {
  title?: string;
  description?: string | null;
  altText?: string | null;
  mode?: ShowcaseMode;
  serviceId?: string | null;
  staffId?: string | null;
  imageAuthorization?: ShowcaseImageAuthorization;
  authorizedById?: string | null;
  authorizationNote?: string | null;
}

type ShowcaseEntryRaw = Partial<ShowcaseEntry> & {
  id: string;
  post?: { imageUrl?: string | null; videoUrl?: string | null };
  service?: { name?: string | null; price?: number | string | null; durationMinutes?: number | null };
  staff?: { name?: string | null };
};

function asNumber(value: number | string | null | undefined): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeEntry(raw: ShowcaseEntryRaw): ShowcaseEntry {
  const mediaUrl = raw.post?.imageUrl || raw.post?.videoUrl || raw.mediaUrl || '';
  const mediaType = raw.post?.videoUrl ? 'video' : raw.mediaType || 'image';
  return {
    id: raw.id,
    barbershopId: raw.barbershopId ?? '',
    postId: raw.postId ?? '',
    title: raw.title ?? '',
    description: raw.description ?? undefined,
    altText: raw.altText ?? undefined,
    mode: raw.mode ?? '',
    serviceId: raw.serviceId ?? undefined,
    staffId: raw.staffId ?? undefined,
    serviceName: raw.service?.name ?? raw.serviceName ?? undefined,
    staffName: raw.staff?.name ?? raw.staffName ?? undefined,
    servicePrice: asNumber(raw.service?.price) ?? raw.servicePrice,
    serviceDuration: asNumber(raw.service?.durationMinutes) ?? raw.serviceDuration,
    mediaUrl,
    mediaType,
    status: raw.status ?? '',
    position: raw.position ?? 0,
    imageAuthorization: raw.imageAuthorization,
  };
}

function normalizeList(res: unknown): ShowcaseEntry[] {
  const data = unwrap<ShowcaseEntryRaw[] | ShowcaseEntryRaw>(res);
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  return rows.map(normalizeEntry);
}

function toStatusQuery(status?: string): ShowcaseStatusFilter | undefined {
  const normalized = status?.toLowerCase();
  if (normalized === 'draft' || normalized === 'published' || normalized === 'hidden') return normalized;
  return undefined;
}

export const showcaseApi = {
  getPublicShowcase: (barbershopId: string) =>
    apiClient<{ success: boolean; data: ShowcaseEntryRaw[] }>(
      `/api/barbershops/${barbershopId}/showcase`,
      'GET'
    ).then(normalizeList),

  getPublicEntry: (barbershopId: string, entryId: string) =>
    apiClient<{ success: boolean; data: ShowcaseEntryRaw }>(
      `/api/barbershops/${barbershopId}/showcase/${entryId}`,
      'GET'
    ).then(r => normalizeEntry(unwrap<ShowcaseEntryRaw>(r))),

  trackEvent: (
    barbershopId: string,
    entryId: string,
    eventType: string,
    metadata?: Record<string, unknown>
  ) =>
    apiClient<{ success: boolean; data: unknown }>(
      `/api/barbershops/${barbershopId}/showcase-events/${entryId}`,
      'POST',
      { eventType, ...(metadata ? { metadata } : {}) }
    ),

  listEntries: (barbershopId: string, params?: { status?: string }) =>
    apiClient<{ success: boolean; data: ShowcaseEntryRaw[] }>(
      `/api/barbershops/${barbershopId}/showcase-entries${buildQuery({ status: toStatusQuery(params?.status) })}`,
      'GET',
      undefined,
      token()
    ).then(normalizeList),

  createEntry: (barbershopId: string, data: CreateShowcaseEntryInput) =>
    apiClient<{ success: boolean; data: ShowcaseEntryRaw }>(
      `/api/barbershops/${barbershopId}/showcase-entries`,
      'POST',
      { ...data, barbershopId },
      token()
    ).then(r => normalizeEntry(unwrap<ShowcaseEntryRaw>(r))),

  updateEntry: (barbershopId: string, entryId: string, data: UpdateShowcaseEntryInput) =>
    apiClient<{ success: boolean; data: ShowcaseEntryRaw }>(
      `/api/barbershops/${barbershopId}/showcase-entries/${entryId}`,
      'PATCH',
      data,
      token()
    ).then(r => normalizeEntry(unwrap<ShowcaseEntryRaw>(r))),

  publishEntry: (barbershopId: string, entryId: string) =>
    apiClient<{ success: boolean; data: ShowcaseEntryRaw }>(
      `/api/barbershops/${barbershopId}/showcase-entries/${entryId}/publish`,
      'POST',
      undefined,
      token()
    ).then(r => normalizeEntry(unwrap<ShowcaseEntryRaw>(r))),

  hideEntry: (barbershopId: string, entryId: string) =>
    apiClient<{ success: boolean; data: ShowcaseEntryRaw }>(
      `/api/barbershops/${barbershopId}/showcase-entries/${entryId}/hide`,
      'POST',
      undefined,
      token()
    ).then(r => normalizeEntry(unwrap<ShowcaseEntryRaw>(r))),

  deleteEntry: (barbershopId: string, entryId: string) =>
    apiClient<{ success: boolean; message?: string }>(
      `/api/barbershops/${barbershopId}/showcase-entries/${entryId}`,
      'DELETE',
      undefined,
      token()
    ),

  reorder: (barbershopId: string, entries: { id: string; position: number }[]) =>
    apiClient<{ success: boolean; message?: string }>(
      `/api/barbershops/${barbershopId}/showcase-entries/order`,
      'PUT',
      { entries },
      token()
    ),

  getAnalytics: (barbershopId: string, params?: { from?: string; to?: string; entryId?: string }) =>
    apiClient<{ success: boolean; data: ShowcaseAnalytics }>(
      `/api/barbershops/${barbershopId}/showcase-analytics${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<ShowcaseAnalytics>(r)),
};
