import {
  contrastRatio,
  deriveButtonFg,
  PAGE_THEME_DARK_FALLBACK,
  PAGE_THEME_LIGHT_FALLBACK,
  type ContrastCheck,
} from '../../shared/pageThemeContrast';

/** Texto claro/escuro usado sobre a cor de destaque da página pública. */
export const ACCENT_FOREGROUND_LIGHT = PAGE_THEME_LIGHT_FALLBACK;
export const ACCENT_FOREGROUND_DARK = PAGE_THEME_DARK_FALLBACK;

export interface AccentContrastColors {
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
}

export interface AccentUiTokens {
  /** Texto legível sobre o fundo ativo. */
  foreground: string;
  /** Fundo do estado ativo. */
  background: string;
  /** Indicador visual do estado ativo. */
  border: string;
  /** O destaque não pode ser usado diretamente sobre o tema. */
  fallback: boolean;
}

/**
 * Escolhe o texto sobre o destaque pelo maior contraste WCAG. Os dois
 * candidatos garantem contraste alto para qualquer cor hexadecimal válida.
 */
export function deriveAccentForeground(accentColor: string): string {
  return deriveButtonFg(accentColor);
}

/**
 * Componentes de interface precisam de 3:1 contra o fundo e o cartão. Quando
 * o destaque não alcança esse mínimo, a interface usa o fallback textual.
 */
export function hasUsableAccentContrast(colors: AccentContrastColors): boolean {
  return (
    contrastRatio(colors.accentColor, colors.backgroundColor) >= 3 &&
    contrastRatio(colors.accentColor, colors.surfaceColor) >= 3
  );
}

/** Tokens do estado ativo: destaque real ou fallback legível + indicador. */
export function resolveAccentUiTokens(colors: AccentContrastColors): AccentUiTokens {
  if (hasUsableAccentContrast(colors)) {
    return {
      foreground: deriveAccentForeground(colors.accentColor),
      background: colors.accentColor,
      border: colors.accentColor,
      fallback: false,
    };
  }
  return {
    foreground: colors.textColor,
    background: colors.surfaceColor,
    border: colors.textColor,
    fallback: true,
  };
}

/**
 * O destaque com pouco contraste vira aviso, não bloqueio: o dono ainda pode
 * salvar e a interface aplica o fallback legível.
 */
export function isAccentContrastWarning(check: ContrastCheck): boolean {
  return check.key === 'accent-surface' || check.key === 'accent-background';
}
