/**
 * Helper ÚNICO de entrega da capa da página pública.
 *
 * A capa aceita QUALQUER medida de origem; este módulo monta a URL do
 * Cloudinary que:
 *  - recorta para 16:9 na entrega (`c_fill,ar_16:9`);
 *  - aplica o ponto focal (`coverFocalX/Y` do tema → `g_xy_center,x_,y_`
 *    calculados sobre o original; centro padrão = `g_auto`);
 *  - nunca amplia além do original (`coverWidth/coverHeight` do back limitam
 *    `w_*` e o srcset; sem original conhecido, teto de 1920);
 *  - entrega `f_auto,q_auto` (formato/qualidade adaptativos).
 *
 * Usado por: página pública (`ShopPageTheme`), prévia do painel
 * (`previewMockup`), editor de enquadramento (`CoverFocalEditor`, sem recorte
 * para arrastar suave) e Open Graph (`buildCoverOgUrl`). `dpr_auto` fica de
 * fora de propósito: dobrar a densidade violaria o "nunca ampliar".
 */

/** Larguras do srcset da capa (crescem até o limite do original). */
export const COVER_SRCSET_WIDTHS = [640, 960, 1280, 1600, 1920] as const;

/** Teto de segurança quando as dimensões originais são desconhecidas (legado). */
const FALLBACK_MAX_WIDTH = 1920;

export interface CoverDeliveryOptions {
  /** Largura desejada em px (padrão 1600). */
  width?: number;
  /** Ponto focal horizontal 0–100 (ausente/50 = centro). */
  focalX?: number | null;
  /** Ponto focal vertical 0–100 (ausente/50 = centro). */
  focalY?: number | null;
  /** Largura original do arquivo (`coverWidth` do tema). */
  originalWidth?: number | null;
  /** Altura original do arquivo (`coverHeight` do tema). */
  originalHeight?: number | null;
}

function clampPercent(value: number | null | undefined, fallback = 50): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Maior largura pedida sem ampliar: min(largura desejada, original,
 * 16:9 contido no original). Sem original conhecido → teto de 1920.
 */
function resolveCap(options: CoverDeliveryOptions): number {
  const caps: number[] = [FALLBACK_MAX_WIDTH];
  if (options.originalWidth && options.originalWidth > 0) {
    caps.push(Math.floor(options.originalWidth));
  }
  if (options.originalHeight && options.originalHeight > 0) {
    caps.push(Math.floor((options.originalHeight * 16) / 9));
  }
  return Math.max(1, Math.min(...caps));
}

/** `g_auto` no centro; focal ajustado → `g_xy_center` em px do original. */
function focalGravity(options: CoverDeliveryOptions): string {
  const focalX = clampPercent(options.focalX);
  const focalY = clampPercent(options.focalY);
  if (focalX === 50 && focalY === 50) return 'g_auto';
  if (!options.originalWidth || !options.originalHeight) return 'g_auto';
  const x = Math.min(
    Math.floor(options.originalWidth),
    Math.max(0, Math.round((focalX / 100) * options.originalWidth)),
  );
  const y = Math.min(
    Math.floor(options.originalHeight),
    Math.max(0, Math.round((focalY / 100) * options.originalHeight)),
  );
  return `g_xy_center,x_${x},y_${y}`;
}

function withTransforms(url: string, transforms: string): string {
  if (!url.includes('/image/upload/')) return url;
  return url.replace('/image/upload/', `/image/upload/${transforms}/`);
}

/** URL de capa com recorte 16:9 + focal + sem ampliação (usada como `src`). */
export function buildCoverUrl(url: string, options: CoverDeliveryOptions = {}): string {
  const width = Math.max(1, Math.min(options.width ?? 1600, resolveCap(options)));
  return withTransforms(
    url,
    `c_fill,ar_16:9,${focalGravity(options)},w_${width},f_auto,q_auto`,
  );
}

/**
 * Srcset com as larguras padrão filtradas pelo limite do original (nunca
 * pede mais do que o arquivo tem). String vazia para URLs não-Cloudinary.
 */
export function buildCoverSrcSet(url: string, options: CoverDeliveryOptions = {}): string {
  if (!url.includes('/image/upload/')) return '';
  const cap = resolveCap(options);
  const widths = COVER_SRCSET_WIDTHS.filter(w => w <= cap);
  const list = widths.length > 0 ? widths : [cap];
  return list
    .map(w => `${buildCoverUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ');
}

/**
 * URL SEM recorte (só `f_auto,q_auto,w_*`) para o editor de enquadramento:
 * o `<img>` renderiza o original e o `object-position` faz o arraste suave
 * sem rebuscar a rede a cada pixel.
 */
export function buildCoverSourceUrl(url: string, options: CoverDeliveryOptions = {}): string {
  const cap =
    options.originalWidth && options.originalWidth > 0
      ? Math.min(FALLBACK_MAX_WIDTH, Math.floor(options.originalWidth))
      : FALLBACK_MAX_WIDTH;
  const width = Math.max(1, Math.min(options.width ?? 1280, cap));
  return withTransforms(url, `f_auto,q_auto,w_${width}`);
}

/** URL do cartão Open Graph (1200×630 JPG) com o mesmo focal da página. */
export function buildCoverOgUrl(url: string, options: CoverDeliveryOptions = {}): string {
  return withTransforms(
    url,
    `w_1200,h_630,c_fill,${focalGravity(options)},f_jpg,q_auto`,
  );
}

/** `object-position` CSS derivado do focal (mesmo vocabulário 0–100). */
export function coverObjectPosition(
  focalX?: number | null,
  focalY?: number | null,
): string {
  return `${clampPercent(focalX)}% ${clampPercent(focalY)}%`;
}
