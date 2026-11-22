import type { CSSProperties } from 'react';
import type { PageTheme, PageThemeVariant, RadiusStyle } from '../../infra/pageThemeApi';
import {
  ACCENT_FOREGROUND_DARK,
  ACCENT_FOREGROUND_LIGHT,
  deriveAccentForeground,
  resolveAccentUiTokens,
} from './accentContrast';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function mix(hex: string, target: string, amount: number): string {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(target);
  const ch = (a: number, b: number) => Math.round(a + (b - a) * amount);
  return (
    '#' +
    [ch(r1, r2), ch(g1, g2), ch(b1, b2)]
      .map(v => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export type ThemeColorSource = Pick<
  PageTheme,
  'accentColor' | 'backgroundColor' | 'surfaceColor' | 'textColor' | 'textMutedColor'
>;

/**
 * Cores semânticas (perigo/sucesso/aviso) por variante — espelham os valores
 * de `styles/tokens.css` (:root claro e .dark). Fixas aqui porque o wrapper do
 * salão escolhe a variante sem trocar a classe `.dark` do documento.
 */
const SEMANTIC_COLORS: Record<
  PageThemeVariant,
  { danger: string; dangerFg: string; success: string; warning: string }
> = {
  light: { danger: '#B91C1C', dangerFg: '#FFFFFF', success: '#107836', warning: '#B45309' },
  dark: { danger: '#F87171', dangerFg: '#0F1110', success: '#22C55E', warning: '#F59E0B' },
};

/**
 * Mapeia o tema salvo (na variante ativa) para CSS variables escopadas num
 * wrapper. Emit DUAS famílias com o mesmo valor concreto:
 *
 * - `--shop-*`: canônica da página do salão (variantes light/dark);
 * - `--ag-*`: espelho legado — compat com testes, `shop-page-theme.css` e
 *   qualquer `var(--ag-*)` que já exista dentro do escopo.
 *
 * As utilities do Tailwind resolvem `var(--shop-x, var(--ag-x))`
 * (`styles/tokens.css`), então o conteúdo dentro do wrapper herda a variante
 * sem estilos inline espalhados; fora dele nada muda.
 */
export function pageThemeToCssVars(
  theme: ThemeColorSource,
  variant: PageThemeVariant
): CSSProperties {
  const { accentColor, backgroundColor, surfaceColor, textColor, textMutedColor } = theme;
  const accentForeground = deriveAccentForeground(accentColor);
  const accentUi = resolveAccentUiTokens(theme);
  // O hover afasta o fundo do texto: um destaque escuro com texto claro fica
  // mais escuro; um destaque claro com texto escuro fica mais claro. Assim o
  // foreground escolhido continua com contraste >=4.5:1 também no hover.
  const hoverTarget =
    accentForeground === ACCENT_FOREGROUND_LIGHT ? ACCENT_FOREGROUND_DARK : ACCENT_FOREGROUND_LIGHT;
  // No fallback, o hover afasta o cartão do texto (rumo ao fundo), preservando
  // a razão >=4.5:1 exigida entre texto e cartão.
  const fallbackHover = mix(surfaceColor, backgroundColor, 0.08);
  const semantic = SEMANTIC_COLORS[variant];

  const values: Record<string, string> = {
    bg: backgroundColor,
    surface: surfaceColor,
    'surface-2': mix(surfaceColor, textColor, 0.06),
    border: mix(backgroundColor, textColor, 0.16),
    'border-strong': mix(backgroundColor, textColor, 0.3),
    'text-primary': textColor,
    'text-secondary': mix(textColor, textMutedColor, 0.45),
    'text-muted': textMutedColor,
    accent: accentColor,
    'accent-hover': mix(accentColor, hoverTarget, 0.15),
    'accent-fg': accentForeground,
    'accent-active-bg': accentUi.background,
    'accent-active-fg': accentUi.foreground,
    'accent-active-border': accentUi.border,
    'accent-action-hover': accentUi.fallback ? fallbackHover : mix(accentColor, hoverTarget, 0.15),
    'action-primary': accentColor,
    'action-primary-hover': mix(accentColor, hoverTarget, 0.15),
    'action-primary-fg': accentForeground,
    selection: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
    // O foco precisa continuar visível mesmo quando o destaque tem <3:1.
    focus: accentUi.fallback ? accentUi.border : accentColor,
    'hover-border': `color-mix(in srgb, ${accentColor} 40%, transparent)`,
    'input-bg': surfaceColor,
    'input-border': mix(backgroundColor, textColor, 0.22),
    brand: accentColor,
    'brand-hover': mix(accentColor, hoverTarget, 0.15),
    danger: semantic.danger,
    'danger-fg': semantic.dangerFg,
    success: semantic.success,
    warning: semantic.warning,
    'on-media': '#FFFFFF',
    'media-overlay': '#000000',
  };

  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(values)) {
    vars[`--shop-${name}`] = value;
    vars[`--ag-${name}`] = value;
  }
  // Aliases canônicos citados na spec (mesmo valor, vocabulário da página).
  vars['--shop-text'] = textColor;
  vars['--shop-on-accent'] = values['accent-fg'];

  return {
    ...vars,
    color: textColor,
    colorScheme: variant,
  } as CSSProperties;
}

/**
 * Estilo dos cantos via variáveis `--radius-*` do Tailwind v4.
 *
 * Valores pensados para NUNCA virar formas estranhas (o antigo `9999px` em
 * tudo transformava cards em pílulas/círculos — ver prévia da aparência):
 * - `squared`: canto reto de verdade (0).
 * - `rounded`/`pill`: `clamp()` com base em `em` — cresce com a tipografia do
 *   elemento, tem piso (4px) e teto (12px/20px), e resolve igual nos dois
 *   eixos (sem elipses). Chips/botões `rounded-full` continuam pílula: essa
 *   utilidade não usa as vars de raio.
 */
const RADIUS_STYLES: Record<RadiusStyle, string> = {
  squared: '0px',
  rounded: 'clamp(4px, 1em, 12px)',
  pill: 'clamp(4px, 1em, 20px)',
};

/** Estilo dos cantos: escala `--radius-*` do Tailwind v4 + alias canônico `--shop-radius`. */
export function radiusCssVars(radiusStyle: RadiusStyle): CSSProperties {
  const value = RADIUS_STYLES[radiusStyle];
  if (!value) return {};
  const vars: Record<string, string> = { '--shop-radius': value };
  for (const scale of ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']) {
    vars[`--radius-${scale}`] = value;
  }
  return vars as CSSProperties;
}

/**
 * URL de entrega do Cloudinary com transformações (`f_auto,q_auto,w_*`).
 * URLs não-Cloudinary (legacy GCS) retornam intactas.
 */
export function cloudinaryDeliveryUrl(url: string, width?: number): string {
  if (!url.includes('/image/upload/')) return url;
  const transforms = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto';
  return url.replace('/image/upload/', `/image/upload/${transforms}/`);
}

/**
 * Proporção da capa da página pública — COMPARTILHADA entre a página real
 * (`ShopPageTheme`) e a prévia do painel (`PreviewCover`) para manter
 * proporção/densidade idênticas. Mobile 16:6, desktop 16:4 (nunca mais que
 * ~22% da altura do mockup). A página real espelha os valores nas classes
 * Tailwind `aspect-[16/6] sm:aspect-[16/4]` (Tailwind exige classes estáticas);
 * a prévia aplica este objeto via `style`, porque media queries não valem
 * dentro do mockup escalado.
 */
export const COVER_ASPECT = {
  mobile: '16 / 6',
  desktop: '16 / 4',
} as const;

// URLs da capa (recorte 16:9 + focal + srcset sem ampliar) vivem no helper
// único `src/shared/coverImage.ts` — página pública, prévia e OG compartilham.
