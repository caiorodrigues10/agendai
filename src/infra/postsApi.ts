import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import type { FeedPost, PostMode } from '../types';

function token() {
  return authStorage.getAccessToken() || '';
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

// ─── Types ─────────────────────────────────────────────────────

export type PostStatus = 'draft' | 'scheduled' | 'published';
export type PostFormat = 'square' | 'portrait' | 'story';

export interface PostDesignOptions {
  focalX?: number;
  focalY?: number;
  overlay?: number;
}

export interface CreatePostPayload {
  barbershopId: string;
  type: 'haircut' | 'beard' | 'announcement';
  title?: string;
  content?: string;
  ctaText?: string;
  templateKey?: string;
  format?: PostFormat;
  paletteKey?: string;
  designOptions?: PostDesignOptions;
  primaryMediaId?: string | null;
  secondaryMediaId?: string | null;
  postMode?: PostMode;
  scheduledFor?: string | null;
  status?: 'draft';
}

export type UpdatePostPayload = Partial<{
  title: string | null;
  ctaText: string | null;
  content: string;
  postMode: PostMode;
  templateKey: string;
  format: PostFormat;
  paletteKey: string;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  designOptions: PostDesignOptions;
}>;

export interface PostListResponse {
  data: FeedPost[];
  meta: { total: number; page: number; limit: number };
}

export interface PostTemplateDef {
  key: string;
  name: string;
  description: string;
  requiredMedia: number;
  formats: string[];
  previewUrl: string;
}

export interface PostPaletteDef {
  key: string;
  label: string;
}

export interface WhatsappAudience {
  eligible: number;
  whatsappConnected: boolean;
  postPublished: boolean;
}

export interface PostMedia {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

// ─── API ───────────────────────────────────────────────────────

export const postsApi = {
  /** Listagem paginada filtrada por status. */
  list(barbershopId: string, opts: { status?: PostStatus; page?: number; limit?: number } = {}) {
    const params = new URLSearchParams({ barbershopId });
    if (opts.status) params.set('status', opts.status);
    if (opts.page) params.set('page', String(opts.page));
    if (opts.limit) params.set('limit', String(opts.limit));
    return apiClient<{ success: boolean; data: FeedPost[]; meta: { total: number; page: number; limit: number } }>(
      `/api/posts?${params.toString()}`, 'GET', undefined, token()
    ).then(r => ({ data: unwrap<FeedPost[]>(r), meta: (r as any).meta ?? { total: 0, page: 1, limit: 12 } }));
  },

  /** Compat: lista legada de rascunhos/agendados. */
  listScheduled(barbershopId: string) {
    return apiClient<{ success: boolean; data: FeedPost[] }>(
      `/api/posts/scheduled?barbershopId=${encodeURIComponent(barbershopId)}`,
      'GET', undefined, token()
    ).then(r => unwrap<FeedPost[]>(r));
  },

  templates() {
    return apiClient<{ success: boolean; data: PostTemplateDef[] }>(
      '/api/posts/templates', 'GET', undefined, token()
    ).then(r => unwrap<PostTemplateDef[]>(r));
  },

  palettes() {
    return apiClient<{ success: boolean; data: PostPaletteDef[] }>(
      '/api/posts/palettes', 'GET', undefined, token()
    ).then(r => unwrap<PostPaletteDef[]>(r));
  },

  /** Preview com debounce/cache do lado do componente. */
  preview(barbershopId: string, opts: {
    postMode?: PostMode;
    type?: 'haircut' | 'beard' | 'announcement';
    title?: string;
    ctaText?: string;
    templateKey?: string;
    format?: PostFormat;
    paletteKey?: string;
    primaryMediaId?: string | null;
    secondaryMediaId?: string | null;
  }) {
    const params = new URLSearchParams({ barbershopId });
    if (opts.postMode) params.set('postMode', opts.postMode);
    if (opts.type) params.set('type', opts.type);
    if (opts.title) params.set('title', opts.title);
    if (opts.ctaText) params.set('ctaText', opts.ctaText);
    if (opts.templateKey) params.set('templateKey', opts.templateKey);
    if (opts.format) params.set('format', opts.format);
    if (opts.paletteKey) params.set('paletteKey', opts.paletteKey);
    if (opts.primaryMediaId) params.set('primaryMediaId', opts.primaryMediaId);
    if (opts.secondaryMediaId) params.set('secondaryMediaId', opts.secondaryMediaId);
    return apiClient<{ success: boolean; data: { imageUrl: string } }>(
      `/api/posts/preview?${params.toString()}`, 'GET', undefined, token()
    ).then(r => unwrap<{ imageUrl: string }>(r).imageUrl);
  },

  /** Cria como rascunho por padrão. Publicar/agendar usam as ações abaixo. */
  create(payload: CreatePostPayload) {
    return apiClient<{ success: boolean; data: FeedPost }>(
      '/api/posts', 'POST', payload, token()
    ).then(r => unwrap<FeedPost>(r));
  },

  /** Edição de conteúdo/mídia/visual — regenera a imagem quando necessário. */
  update(id: string, payload: UpdatePostPayload) {
    return apiClient<{ success: boolean; data: FeedPost }>(
      `/api/posts/${id}`, 'PATCH', payload, token()
    ).then(r => unwrap<FeedPost>(r));
  },

  // ── Transições explícitas ─────────────────────────────────

  publish(id: string) {
    return apiClient<{ success: boolean; data: FeedPost }>(
      `/api/posts/${id}/publish`, 'POST', undefined, token()
    ).then(r => unwrap<FeedPost>(r));
  },

  schedule(id: string, scheduledFor: string) {
    return apiClient<{ success: boolean; data: FeedPost }>(
      `/api/posts/${id}/schedule`, 'POST', { scheduledFor }, token()
    ).then(r => unwrap<FeedPost>(r));
  },

  cancelSchedule(id: string) {
    return apiClient<{ success: boolean; data: FeedPost }>(
      `/api/posts/${id}/cancel-schedule`, 'POST', undefined, token()
    ).then(r => unwrap<FeedPost>(r));
  },

  // ── WhatsApp (ação separada) ──────────────────────────────

  whatsappAudience(id: string) {
    return apiClient<{ success: boolean; data: WhatsappAudience }>(
      `/api/posts/${id}/whatsapp-audience`, 'GET', undefined, token()
    ).then(r => unwrap<WhatsappAudience>(r));
  },

  sendWhatsapp(id: string) {
    return apiClient<{ success: boolean; data: { queued: number } }>(
      `/api/posts/${id}/whatsapp`, 'POST', undefined, token()
    ).then(r => unwrap<{ queued: number }>(r));
  },

  remove(id: string) {
    return apiClient<{ success: boolean }>(
      `/api/posts/${id}`, 'DELETE', undefined, token()
    );
  },

  // ── Mídia ─────────────────────────────────────────────────

  listMedia(barbershopId: string) {
    return apiClient<{ success: boolean; data: PostMedia[] }>(
      `/api/posts/media?barbershopId=${encodeURIComponent(barbershopId)}`,
      'GET', undefined, token()
    ).then(r => unwrap<PostMedia[]>(r));
  },

  uploadMedia(barbershopId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return fetch(`/api/posts/media/${barbershopId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: form,
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      return unwrap<PostMedia>(json);
    });
  },

  deleteMedia(id: string) {
    return apiClient<{ success: boolean }>(
      `/api/posts/media/${id}`, 'DELETE', undefined, token()
    );
  },
};
