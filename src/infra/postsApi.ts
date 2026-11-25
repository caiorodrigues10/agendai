import { API_BASE, ApiError, apiClient, apiFetch } from './apiClient';
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

export type DesignFontPair =
  | 'montserrat-inter'
  | 'playfair-poppins'
  | 'bebas-oswald'
  | 'dmserif-poppins'
  | 'anton-barlow'
  | 'playfair-barlow';

export type DesignCommercialBlock =
  | 'promo'
  | 'price'
  | 'services'
  | 'validity'
  | 'loyalty'
  | 'before-after';

const DESIGN_COMMERCIAL_BLOCKS = new Set<DesignCommercialBlock>([
  'promo',
  'price',
  'services',
  'validity',
  'loyalty',
  'before-after',
]);

export interface DesignEditable {
  maxChars?: number;
  minScale?: number;
  maxScale?: number;
  canHide?: boolean;
  canMove?: boolean;
}

export interface DesignVariant {
  paletteId: string;
  fontPair: DesignFontPair;
  motif: 'none' | 'lines' | 'dots' | 'diagonal' | 'frame' | 'texture';
  photoTreatment: 'full' | 'cutout' | 'circle' | 'duotone' | 'none';
  density: 'airy' | 'full';
}

export interface PostDesign {
  key: string;
  version: number;
  layoutId: string;
  variant: DesignVariant;
  slots: Record<string, string>;
  editable: Record<string, DesignEditable>;
  vocabulary: Record<string, string>;
  heroIcon: string;
  thumbnailUrl: string | null;
  /** Blocos comerciais suportados pela família, conforme o catálogo do servidor. */
  commercialBlocks: DesignCommercialBlock[];
}

/** `data` do catálogo de designs devolvido pelo servidor. */
export interface DesignCatalogData {
  segment: string;
  designs: PostDesign[];
  etag: string;
  /** Flag do servidor; o front não infere restrição por segmento. */
  advertisingRestricted: boolean;
  /** Biblioteca exata de ícones da pele do segmento. */
  icons: string[];
}

export interface DesignCatalog extends DesignCatalogData {
  /** `true` quando a requisição condicional respondeu 304. */
  notModified?: boolean;
}

export interface DesignService {
  name: string;
  price?: number | null;
  icon?: string;
}

export type DesignPromoKind = 'percent' | 'money' | 'from-to' | 'free' | 'custom';

export interface DesignPromo {
  kind: DesignPromoKind;
  percent?: number;
  amount?: number;
  from?: number;
  to?: number;
  /** Texto literal do dono; o render nunca acrescenta rótulos comerciais. */
  promoLabel?: string;
  /** Complemento literal do dono. */
  promoUnit?: string;
}

export interface DesignContent {
  businessName?: string;
  headline?: string;
  highlight?: string;
  tagline?: string;
  cta?: string;
  whatsapp?: string | null;
  instagram?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  logoUrl?: string | null;
  focal?: { x: number; y: number };
  services?: DesignService[];
  promo?: DesignPromo;
  validUntil?: string;
}

export interface DesignBackgroundColor {
  kind: 'color';
  color: string;
}

export interface DesignBackgroundGradient {
  kind: 'gradient';
  stops: { color: string; at: number }[];
  angle?: number;
}

export interface DesignBackgroundPhoto {
  kind: 'photo';
  url: string;
  focal?: { x: number; y: number };
  overlay?: number;
}

export type DesignBackground =
  | DesignBackgroundColor
  | DesignBackgroundGradient
  | DesignBackgroundPhoto;

export interface DesignOverrides {
  colors?: {
    bg?: string;
    panel?: string;
    accent?: string;
    text?: string;
  };
  fontPair?: DesignFontPair;
  textScale?: number;
  align?: 'left' | 'center' | 'right';
  visible?: Record<string, boolean>;
  background?: DesignBackground;
  logo?: {
    src?: string | null;
    shape?: 'round' | 'square' | 'none';
  };
  contacts?: {
    whatsapp?: string | null;
    instagram?: string | null;
    address?: string | null;
  };
  qr?: {
    data: string;
    enabled?: boolean;
  };
  nudge?: Record<string, { dx: number; dy: number; scale: number }>;
}

export interface DesignPreviewWarning {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export interface DesignPreviewResult {
  imageUrl: string;
  warnings: DesignPreviewWarning[];
  suggestions: Record<string, string>;
  width: number;
}

export interface PreviewDesignPayload {
  barbershopId: string;
  designKey: string;
  designVersion?: number;
  format?: PostFormat;
  overrides?: DesignOverrides;
  data?: DesignContent;
}

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
  designKey?: string;
  designVersion?: number;
  designOverrides?: DesignOverrides;
  designContent?: DesignContent;
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
  designKey: string;
  designVersion: number;
  designOverrides: DesignOverrides;
  designContent: DesignContent;
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
  /**
   * Formato padrão da arte do modelo (fonte única = catálogo do back;
   * regra e paridade em `docs/agents/BUSINESS_RULES.md`).
   */
  defaultFormat?: 'square' | 'portrait' | 'story';
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
  /** Marcada para aparecer na área "Publicações" do perfil público. */
  inGallery: boolean;
}

// ─── API ───────────────────────────────────────────────────────

/** Tamanho máximo por imagem, derivado da spec compartilhada (não duplica o número). */
const UPLOAD_MAX_MB = Math.round(COVER_IMAGE_SPEC.maxBytes / (1024 * 1024));

/** Cache somente em memória para revalidar o catálogo com If-None-Match. */
const designCatalogCache = new Map<string, DesignCatalog>();

/** Resolve a URL relativa da miniatura contra a API configurada no front. */
export function resolveDesignThumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

async function designResponseError(response: Response): Promise<ApiError> {
  const raw = await response.text().catch(() => '');
  let message = raw || `HTTP ${response.status}`;
  let code: string | undefined;
  let data: unknown = raw;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.message === 'string') message = parsed.message;
    if (typeof parsed.code === 'string') code = parsed.code;
    data = parsed;
  } catch {
    /* resposta não-JSON */
  }
  return new ApiError(message, response.status, code, data);
}

function invalidDesignCatalog(): never {
  throw new ApiError(
    'O servidor devolveu um catálogo de designs com capacidades comerciais inválidas.',
    502,
    'INVALID_DESIGN_CATALOG',
  );
}

/**
 * Valida as capacidades que o backend filtrou. O front não infere restrições
 * por segmento nem completa uma lista ausente: um contrato incompleto falha
 * fechado em vez de liberar controles comerciais indevidamente.
 */
function assertDesignCatalogCapabilities(data: {
  designs?: unknown;
  advertisingRestricted?: unknown;
}): void {
  if (
    typeof data.advertisingRestricted !== 'boolean' ||
    !Array.isArray(data.designs)
  ) {
    invalidDesignCatalog();
  }

  for (const design of data.designs) {
    if (!design || typeof design !== 'object') invalidDesignCatalog();
    const blocks = (design as { commercialBlocks?: unknown }).commercialBlocks;
    if (!Array.isArray(blocks)) invalidDesignCatalog();
    if (blocks.some(block => !DESIGN_COMMERCIAL_BLOCKS.has(block as DesignCommercialBlock))) {
      invalidDesignCatalog();
    }
  }
}

/** GET condicional do catálogo; 304 reaproveita o payload cacheado. */
async function requestDesignCatalog(
  barbershopId: string,
  opts: { etag?: string; signal?: AbortSignal } = {},
  retriedWithoutEtag = false,
): Promise<DesignCatalog> {
  const params = new URLSearchParams({ barbershopId });
  const cached = designCatalogCache.get(barbershopId);
  const etag = opts.etag ?? cached?.etag;
  const response = await apiFetch(
    `/api/posts/designs?${params.toString()}`,
    {
      method: 'GET',
      headers: etag ? { 'If-None-Match': etag } : undefined,
      signal: opts.signal,
    },
    token(),
  );

  if (response.status === 304) {
    if (cached) return { ...cached, notModified: true };
    // Um 304 sem cache local não pode virar um catálogo vazio: refaz uma
    // requisição sem If-None-Match para recuperar o payload completo.
    if (!retriedWithoutEtag) {
      return requestDesignCatalog(barbershopId, { signal: opts.signal }, true);
    }
    throw new ApiError('O servidor respondeu 304 sem um catálogo disponível.', 304);
  }
  if (!response.ok) throw await designResponseError(response);

  const body = (await response.json()) as {
    success?: boolean;
    data?: {
      segment?: string;
      designs?: PostDesign[];
      etag?: string;
      advertisingRestricted?: boolean;
      icons?: string[];
    };
  };
  const data = body.data ?? {};
  assertDesignCatalogCapabilities(data);
  const result: DesignCatalog = {
    segment: data.segment ?? '',
    designs: (data.designs as PostDesign[]).map(design => ({
      ...design,
      slots: design.slots ?? {},
      editable: design.editable ?? {},
      vocabulary: design.vocabulary ?? {},
      thumbnailUrl: resolveDesignThumbnailUrl(design.thumbnailUrl),
    })),
    etag: data.etag ?? response.headers.get('etag') ?? '',
    advertisingRestricted: data.advertisingRestricted as boolean,
    icons: data.icons ?? [],
  };
  designCatalogCache.set(barbershopId, result);
  return result;
}

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
    return apiClient<{
      success: boolean;
      data: FeedPost[];
      meta?: { total: number; page: number; limit: number };
    }>(
      `/api/posts?${params.toString()}`, 'GET', undefined, token()
    ).then(r => ({ data: unwrap<FeedPost[]>(r), meta: r.meta ?? { total: 0, page: 1, limit: 12 } }));
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

  /**
   * Catálogo de designs do segmento, resolvido no servidor. A segunda
   * chamada usa If-None-Match e reaproveita o payload em memória no 304.
   */
  listDesigns(barbershopId: string, opts: { etag?: string; signal?: AbortSignal } = {}) {
    return requestDesignCatalog(barbershopId, opts);
  },

  /** Limpa o cache condicional do catálogo (usado ao trocar de salão/teste). */
  clearDesignCache(barbershopId?: string) {
    if (barbershopId) designCatalogCache.delete(barbershopId);
    else designCatalogCache.clear();
  },

  /** URL absoluta/relativa pronta para <img src> da miniatura estática. */
  designThumbnailUrl(url: string | null | undefined) {
    return resolveDesignThumbnailUrl(url);
  },

  /** Prévia renderizada do design; o signal cancela requests obsoletos. */
  previewDesign(payload: PreviewDesignPayload, signal?: AbortSignal) {
    return apiClient<{ success: boolean; data: DesignPreviewResult }>(
      '/api/posts/designs/preview', 'POST', payload, token(), { signal }
    ).then(r => unwrap<DesignPreviewResult>(r));
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
    signal?: AbortSignal;
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
      `/api/posts/preview?${params.toString()}`, 'GET', undefined, token(), { signal: opts.signal }
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
