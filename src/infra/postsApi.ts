import { apiClient, apiFetch, ApiError, ACCESS_BLOCKED_EVENT } from './apiClient';
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
export type PostPhotoMode = 'none' | 'optional' | 'required';

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
  videoUrl?: string | null;
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
  videoUrl: string | null;
  designOptions: PostDesignOptions;
}>;

export interface PostListResponse {
  data: FeedPost[];
  meta: { total: number; page: number; limit: number };
}

export interface PostTemplateDef {
  businessCategory?: 'barbearia' | 'salao' | 'beleza';
  sampleTitle?: string;
  recommended?: boolean;
  contextLabel?: string;
  key: string;
  name: string;
  description: string;
  requiredMedia: number;
  formats: string[];
  previewUrl: string;
  /** Grupo de exibição no catálogo (agenda, ofertas, …). */
  group: string;
  /** 'none' = sem foto; 'optional' = foto opcional (usa imagem ilustrativa se ausente); 'required' = foto obrigatória. */
  photoMode: PostPhotoMode;
  /** Chave da imagem ilustrativa padrão (ex.: salon/barber/beauty) quando photoMode = 'optional'. */
  stockImageKey?: string | null;
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

  templates(barbershopId?: string) {
    if (!barbershopId) {
      return apiClient<{ success: boolean; data: PostTemplateDef[] }>(
        '/api/posts/templates', 'GET', undefined, token()
      ).then(r => unwrap<PostTemplateDef[]>(r));
    }
    const params = new URLSearchParams({ barbershopId });
    return apiClient<{ success: boolean; data: PostTemplateDef[] }>(
      `/api/posts/templates?${params.toString()}`, 'GET', undefined, token()
    ).then(r => unwrap<PostTemplateDef[]>(r));
  },

  palettes() {
    return apiClient<{ success: boolean; data: PostPaletteDef[] }>(
      '/api/posts/palettes', 'GET', undefined, token()
    ).then(r => unwrap<PostPaletteDef[]>(r));
  },

  /** Preview com debounce/cache do lado do componente. */
  async preview(barbershopId: string, opts: {
    postMode?: PostMode;
    type?: 'haircut' | 'beard' | 'announcement';
    title?: string;
    ctaText?: string;
    templateKey?: string;
    format?: PostFormat;
    paletteKey?: string;
    primaryMediaId?: string | null;
    secondaryMediaId?: string | null;
  }, options: { signal?: AbortSignal } = {}) {
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
    const controller = new AbortController();
    const cancel = () => controller.abort();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new ApiError('A prévia demorou demais para carregar. Tente novamente.', 504, 'POST_PREVIEW_TIMEOUT'));
        controller.abort();
      }, 30_000);
    });
    options.signal?.addEventListener('abort', cancel, { once: true });
    if (options.signal?.aborted) cancel();
    try {
      const response = await Promise.race([
        apiClient<{ success: boolean; data: { imageUrl: string } }>(
          `/api/posts/preview?${params.toString()}`, 'GET', undefined, token(), { signal: controller.signal }
        ),
        deadline,
      ]);
      const imageUrl = unwrap<{ imageUrl?: string }>(response)?.imageUrl;
      if (typeof imageUrl !== 'string' || !imageUrl) throw new ApiError('A API não retornou a imagem da prévia. Tente novamente.', 502, 'INVALID_RESPONSE');
      return imageUrl;
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', cancel);
    }
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
    ).then(r => {
      const media = unwrap<PostMedia[]>(r);
      if (!Array.isArray(media)) throw new ApiError('A API retornou uma biblioteca de imagens inválida. Tente novamente.', 502, 'INVALID_RESPONSE');
      return media;
    });
  },

  uploadMedia(barbershopId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return apiFetch(`/api/posts/media/${encodeURIComponent(barbershopId)}`, {
      method: 'POST',
      body: form,
    }, token()).then(async (res) => {
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const body = json && typeof json === 'object' ? json as Record<string, unknown> : null;
        const fallback = res.status === 413 ? 'A imagem deve ter no máximo 5 MB. Envie um arquivo menor.' : 'Não foi possível enviar a imagem. Tente novamente.';
        const error = new ApiError(typeof body?.message === 'string' ? body.message : fallback, res.status, typeof body?.code === 'string' ? body.code : undefined, body ?? undefined);
        if (error.isAccessBlocked) {
          window.dispatchEvent(new CustomEvent(ACCESS_BLOCKED_EVENT, { detail: { ...body, code: error.code, statusCode: error.statusCode, message: error.message } }));
        }
        throw error;
      }
      const media = unwrap<PostMedia | null>(json);
      if (!media?.id || !media.url) throw new ApiError('A API não confirmou o envio da imagem. Tente novamente.', 502, 'INVALID_RESPONSE');
      return media;
    });
  },

  deleteMedia(id: string) {
    return apiClient<{ success: boolean }>(
      `/api/posts/media/${id}`, 'DELETE', undefined, token()
    );
  },
};
