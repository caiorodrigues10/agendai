import type { CSSProperties } from 'react';
import type { PageTheme, RadiusStyle } from '../../infra/pageThemeApi';
import { deriveButtonFg } from '../../shared/pageThemeContrast';

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

function luminanceOf(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export type ThemeColorSource = Pick<
  PageTheme,
  'accentColor' | 'backgroundColor' | 'surfaceColor' | 'textColor' | 'textMutedColor'
>;

/**
 * Mapeia o tema salvo para as CSS variables globais (`--ag-*`), escopadas num
 * wrapper. As utilities do Tailwind (`bg-surface`, `text-text-primary`…)
 * referenciam `var(--ag-*)` em runtime, então todo o conteúdo dentro do
 * wrapper herda o tema sem estilos inline espalhados.
 */
export function pageThemeToCssVars(theme: ThemeColorSource): CSSProperties {
  const { accentColor, backgroundColor, surfaceColor, textColor, textMutedColor } = theme;
  const toward = luminanceOf(accentColor) > 128 ? '#000000' : '#FFFFFF';

  return {
    '--ag-bg': backgroundColor,
    '--ag-surface': surfaceColor,
    '--ag-surface-2': mix(surfaceColor, textColor, 0.06),
    '--ag-border': mix(backgroundColor, textColor, 0.16),
    '--ag-border-strong': mix(backgroundColor, textColor, 0.3),
    '--ag-text-primary': textColor,
    '--ag-text-secondary': mix(textColor, textMutedColor, 0.45),
    '--ag-text-muted': textMutedColor,
    '--ag-accent': accentColor,
    '--ag-accent-hover': mix(accentColor, toward, 0.15),
    '--ag-accent-fg': deriveButtonFg(accentColor),
    '--ag-action-primary': accentColor,
    '--ag-action-primary-hover': mix(accentColor, toward, 0.15),
    '--ag-action-primary-fg': deriveButtonFg(accentColor),
    '--ag-selection': `color-mix(in srgb, ${accentColor} 14%, transparent)`,
    '--ag-focus': accentColor,
    '--ag-hover-border': `color-mix(in srgb, ${accentColor} 40%, transparent)`,
    '--ag-input-bg': surfaceColor,
    '--ag-input-border': mix(backgroundColor, textColor, 0.22),
    '--ag-brand': accentColor,
    '--ag-brand-hover': mix(accentColor, toward, 0.15),
    color: textColor,
  } as CSSProperties;
}

const RADIUS_STYLES: Record<RadiusStyle, string> = {
  squared: '0px',
  rounded: '',
  pill: '9999px',
};

/** Estilo dos cantos via variáveis `--radius-*` do Tailwind v4. */
export function radiusCssVars(radiusStyle: RadiusStyle): CSSProperties {
  const value = RADIUS_STYLES[radiusStyle];
  if (!value) return {};
  const vars: Record<string, string> = {};
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

export const COVER_SRCSET_WIDTHS = [640, 1024, 1600, 1920] as const;

export function coverSrcSet(url: string): string {
  return COVER_SRCSET_WIDTHS.map(w => `${cloudinaryDeliveryUrl(url, w)} ${w}w`).join(', ');
}
