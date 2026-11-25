import type React from 'react';
import {
  LuRectangleHorizontal as RectangleHorizontal,
  LuRectangleVertical as RectangleVertical,
  LuSmartphone as Smartphone,
} from 'react-icons/lu';
import type { FeedPost, PostFormat, PostMode, PriceSplitPayload } from '../../types';
import type { DesignContent, DesignOverrides, PostTemplateDef } from '../../infra/postsApi';
import type { BarbershopContextValue } from '../../contexts/BarbershopContext';
import type { ObjectiveId, PostType } from './objectives';

// ─── Derivações de arranque do PostEditor ──────────────────────
// Funções puras que concentram os ramos (`?.`, `??`, ternários) fora do
// componente: dentro dele, cada ramo contaria na regra `complexity` do ESLint.

/** Chave do rascunho local: post novo usa a chave especial 'new'. */
export function draftStorageKey(post: FeedPost | null): string {
  return post?.id ?? 'new';
}

/** Modo inicial: só quem já tem designKey abre direto no editor legado. */
export function initialEditorMode(post: FeedPost | null): EditorMode {
  return post && !post.designKey ? 'legacy' : 'checking';
}

/** Design/formato salvos: o post prevalece sobre o rascunho local. */
export function pickSavedDesign(post: FeedPost | null, draft: LocalDraftPayload | null) {
  return {
    designKey: post?.designKey ?? draft?.designKey,
    designVersion: post?.designVersion ?? draft?.designVersion,
    format: post?.format,
  };
}

/** URL inicial da prévia legada (sem imagem → null). */
export function initialPreviewUrl(post: FeedPost | null): string | null {
  return post?.imageUrl ?? null;
}

/** Título do cabeçalho do diálogo do editor. */
export function editorTitle(isEditing: boolean): string {
  return isEditing ? 'Editar post' : 'Criar post';
}

/** Sem objetivo escolhido (e sem post em edição) → seletor de objetivo. */
export function needsObjectivePick(objectiveId: ObjectiveId | null, isEditing: boolean): boolean {
  return !objectiveId && !isEditing;
}

/** Contexto do salão ausente (testes/Storybook) → defaults vazios. */
export function readShopContext(ctx: BarbershopContextValue | undefined) {
  return {
    services: ctx?.services ?? [],
    settings: ctx?.settings ?? null,
  };
}

// ─── Tipos do editor ───────────────────────────────────────────

export type PostTone = 'promocional' | 'informativo' | 'divertido' | null;
export type EditorTab = 'content' | 'image' | 'format' | 'identity';
export type EditorMode = 'checking' | 'design' | 'legacy' | 'design-disabled';
export type TemplateFilter = 'all' | 'with-photo' | 'no-photo';

export const GROUP_LABELS: Record<string, string> = {
  agenda: 'Agenda',
  ofertas: 'Ofertas',
  resultados: 'Resultados',
  equipe: 'Equipe',
  depoimentos: 'Depoimentos',
  editorial: 'Editorial',
  tipografia: 'Tipografia',
};

export function groupLabel(key: string) {
  return GROUP_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/** Deriva photoMode de templates antigos que ainda não expõem o campo. */
export function templatePhotoMode(t: PostTemplateDef | undefined): 'none' | 'optional' | 'required' {
  if (!t) return 'none';
  if (t.photoMode) return t.photoMode;
  return t.requiredMedia > 0 ? 'required' : 'none';
}

export const FORMAT_OPTIONS: { id: PostFormat; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: 'square', label: 'Quadrado', hint: '1:1', icon: <RectangleHorizontal size={16} /> },
  { id: 'portrait', label: 'Retrato', hint: '4:5', icon: <RectangleVertical size={16} /> },
  { id: 'story', label: 'Story', hint: '9:16', icon: <Smartphone size={16} /> },
];

/**
 * Fallback do formato padrão por modelo — espelho de `defaultPostFormat()` do
 * back (price-split → 4:5, demais → 1:1), usado só antes do catálogo chegar.
 * Enquanto a lista carrega/erro, vale este valor; depois, o `defaultFormat`
 * vindo de `GET /api/posts/templates` (fonte única, ver BUSINESS_RULES.md).
 * A escolha manual no card "Formato" sempre prevalece sobre os dois.
 */
export const defaultFormatFor = (templateKey: string): PostFormat =>
  templateKey === 'price-split' ? 'portrait' : 'square';

export const MODE_OPTIONS: { id: PostMode; label: string }[] = [
  { id: 'queue', label: 'Fila' },
  { id: 'appointments', label: 'Agenda' },
  { id: 'both', label: 'Fila e Agenda' },
];

export const TONE_OPTIONS: { id: NonNullable<PostTone>; label: string }[] = [
  { id: 'promocional', label: 'Promocional' },
  { id: 'informativo', label: 'Informativo' },
  { id: 'divertido', label: 'Descontraído' },
];

export const TAB_LABELS: { id: EditorTab; label: string; num: number }[] = [
  { id: 'content', label: 'Conteúdo', num: 1 },
  { id: 'image', label: 'Imagem', num: 2 },
  { id: 'format', label: 'Formato', num: 3 },
  { id: 'identity', label: 'Identidade', num: 4 },
];

export const DRAFT_VERSION = 2;
export const CAPTION_MAX = 5000;
/** Limites que o motor de render aplica na imagem (Modelo #1 — manifesto). */
export const TITLE_RENDER_MAX = 40;
export const CTA_RENDER_MAX = 40;
/** Limites do modelo price-split (manifesto): lista e nome da marca. */
export const PRICE_MAX_ITEMS = 8;
export const PRICE_ITEM_RENDER_MAX = 48;
export const PRICE_BUSINESS_RENDER_MAX = 60;

export interface PriceRow {
  name: string;
  price: string;
}

/** Lista gravada no post (designOptions.priceSplit) → linhas do editor. */
export function itemsToRows(items: PriceSplitPayload['items'] | undefined): PriceRow[] {
  return (items ?? []).map(item => ({
    name: item?.name ?? '',
    price: item?.price === null || item?.price === undefined ? '' : String(item.price),
  }));
}

/** Lê a lista salva no post p/ pré-carregar o editor na edição. */
export function readStoredPriceSplit(designOptions: FeedPost['designOptions']): PriceSplitPayload | undefined {
  const value = designOptions?.priceSplit;
  if (!value || !Array.isArray(value.items)) return undefined;
  return { ...value, items: value.items ?? [] };
}

export function downloadImage(imageUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface LocalDraftPayload {
  version: number;
  savedAt: number;
  objectiveId: ObjectiveId | null;
  templateKey: string;
  paletteKey: string;
  format: PostFormat;
  postMode: PostMode;
  type: PostType;
  title: string;
  ctaText: string;
  content: string;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  /** Opcional: rascunhos antigos não têm e caem no seed de serviços. */
  priceItems?: PriceRow[];
  businessName?: string;
  /** Estado do gerador de designs preservado no rascunho local. */
  designKey?: string;
  designVersion?: number;
  designContent?: DesignContent;
  designOverrides?: DesignOverrides;
  /** Indica que o formato foi escolhido manualmente (não apenas o default). */
  formatTouched?: boolean;
}

/**
 * Snapshot "vivo" da prévia legada. O preview é disparado com debounce e
 * AbortController; o `seq`/`liveRef` impedem respostas fora de ordem.
 */
export interface LegacyPreviewState {
  templateKey: string;
  paletteKey: string;
  format: PostFormat;
  title: string;
  ctaText: string;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  postMode: PostMode;
  type: PostType;
  priceSplit: PriceSplitPayload | undefined;
}
