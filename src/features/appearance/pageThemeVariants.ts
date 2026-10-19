import type {
  PageTheme,
  PageThemeVariant,
  PageThemeVariantColors,
} from '../../infra/pageThemeApi';
import { generateVariantColors } from '../../shared/pageThemeContrast';

type ColorsSource = Pick<
  PageTheme,
  'accentColor' | 'backgroundColor' | 'surfaceColor' | 'textColor' | 'textMutedColor'
> &
  Pick<PageTheme, 'darkColors' | 'lightColors'>;

/** Cores planas (formato legado) do tema. */
export function flatColors(theme: ColorsSource): PageThemeVariantColors {
  return {
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    surfaceColor: theme.surfaceColor,
    textColor: theme.textColor,
    textMutedColor: theme.textMutedColor,
  };
}

/**
 * Cores da variante ativa: dark materializado = `darkColors` (ou o espelho
 * legado plano); light não materializada = gerada a partir do accent escuro
 * (mesmo gerador do backend — garante AA na variante clara).
 */
export function resolveVariantColors(
  theme: ColorsSource,
  variant: PageThemeVariant
): PageThemeVariantColors {
  const dark = theme.darkColors ?? flatColors(theme);
  if (variant === 'dark') return dark;
  return theme.lightColors ?? generateVariantColors(dark.accentColor, 'light');
}
