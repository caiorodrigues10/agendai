import { apiClient, apiFetch } from './apiClient';
import { authStorage } from './authStorage';
import { COVER_IMAGE_SPEC } from '../shared/imageSpecs';
import type { FeedPost, PostMode, PriceSplitPayload } from '../types';

function token() {
  return authStorage.getAccessToken() || '';
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

// ─── Types ─────────────────────────────────────────────────────

export type PostStatus = 'draft' | 'published';
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
  /** Lista de preços do modelo price-split (também persistida em designOptions). */
  priceSplit?: PriceSplitPayload;
  primaryMediaId?: string | null;
  secondaryMediaId?: string | null;
  postMode?: PostMode;
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
  priceSplit: PriceSplitPayload;
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
  /** Marcada para a galeria pública do perfil (aba "Fotos"). */
  inGallery: boolean;
}

// ─── API ───────────────────────────────────────────────────────

/** Tamanho máximo por imagem, derivado da spec compartilhada (não duplica o número). */
const UPLOAD_MAX_MB = Math.round(COVER_IMAGE_SPEC.maxBytes / (1024 * 1024));

/**
 * Converte a resposta de erro do upload em Error com mensagem amigável:
 * extrai `message`/`error` do corpo JSON quando existe; trata 413/415/429 e
 * 5xx com textos específicos; nunca devolve JSON/HTML cru ao toast.
 */
async function uploadMediaError(res: Response): Promise<Error> {
  const text = await res.text().catch(() => '');
  let serverMessage: string | null = null;
  try {
    const parsed = JSON.parse(text) as Record<string, unknown> | null;
    if (parsed && typeof parsed === 'object') {
      const candidate = parsed.message ?? parsed.error;
      if (typeof candidate === 'string') serverMessage = candidate;
      else if (candidate && typeof candidate === 'object' && typeof (candidate as { message?: unknown }).message === 'string') {
        serverMessage = (candidate as { message: string }).message;
      }
    }
  } catch { /* corpo não é JSON (HTML/texto cru) */ }
  // Message parseada que ainda parece payload serializado é descartada.
  if (serverMessage && /^\s*[{[]/.test(serverMessage)) serverMessage = null;

  if (res.status === 413) return new Error(`A imagem é muito grande. O limite é de ${UPLOAD_MAX_MB} MB por arquivo.`);
  if (res.status === 415) return new Error('Formato de imagem não suportado. Use JPG, PNG ou WebP.');
  if (res.status === 429) return new Error('Muitos envios em sequência. Aguarde um instante e tente novamente.');
  if (res.status >= 500) return new Error('O servidor falhou ao processar a imagem. Tente novamente em instantes.');
  return new Error(serverMessage || 'Não foi possível enviar a imagem.');
}

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
    priceSplit?: PriceSplitPayload;
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
    // Objeto viaja como JSON na query (o backend faz preprocess no schema).
    if (opts.priceSplit) params.set('priceSplit', JSON.stringify(opts.priceSplit));
    return apiClient<{ success: boolean; data: { imageUrl: string } }>(
      `/api/posts/preview?${params.toString()}`, 'GET', undefined, token()
    ).then(r => unwrap<{ imageUrl: string }>(r).imageUrl);
  },

  /** Cria como rascunho por padrão. Publicar usa a ação abaixo. */
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

  listMedia(barbershopId: string, opts: { inGallery?: boolean } = {}) {
    const params = new URLSearchParams({ barbershopId });
    if (opts.inGallery !== undefined) params.set('inGallery', String(opts.inGallery));
    return apiClient<{ success: boolean; data: PostMedia[] }>(
      `/api/posts/media?${params.toString()}`,
      'GET', undefined, token()
    ).then(r => unwrap<PostMedia[]>(r));
  },

  uploadMedia(barbershopId: string, file: File, opts: { inGallery?: boolean } = {}) {
    const form = new FormData();
    // Field antes do arquivo: o Fastify multipart só expõe fields que chegam antes do stream.
    form.append('inGallery', String(opts.inGallery ?? false));
    form.append('file', file);
    return apiFetch(`/api/posts/media/${encodeURIComponent(barbershopId)}`, {
      method: 'POST',
      body: form,
    }, token()).then(async (res) => {
      if (!res.ok) throw await uploadMediaError(res);
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
