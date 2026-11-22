import { contrastRatio } from '../../shared/pageThemeContrast';
import {
  ACCENT_FOREGROUND_DARK,
  ACCENT_FOREGROUND_LIGHT,
  deriveAccentForeground,
  hasUsableAccentContrast,
  resolveAccentUiTokens,
} from './accentContrast';
import { THEME_PRESETS } from './presets';
import { pageThemeToCssVars } from './themeVars';

type ThemeVariant = Parameters<typeof pageThemeToCssVars>[1];
type CssVars = Record<string, string>;

interface ThemeColors {
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMutedColor: string;
}

function materialize(colors: ThemeColors, variant: ThemeVariant): CssVars {
  return pageThemeToCssVars(colors, variant) as unknown as CssVars;
}

describe('contraste da cor de destaque', () => {
  it('usa texto claro sobre #080808', () => {
    expect(deriveAccentForeground('#080808')).toBe(ACCENT_FOREGROUND_LIGHT);
    expect(contrastRatio(ACCENT_FOREGROUND_LIGHT, '#080808')).toBeGreaterThanOrEqual(4.5);
  });

  it('usa texto escuro sobre um destaque claro', () => {
    expect(deriveAccentForeground('#F2F5F3')).toBe(ACCENT_FOREGROUND_DARK);
    expect(contrastRatio(ACCENT_FOREGROUND_DARK, '#F2F5F3')).toBeGreaterThanOrEqual(4.5);
  });

  it('garante 4.5:1 na região de pior contraste da escala de luminância', () => {
    // #757575/#767676 ficam no ponto em que branco e preto disputam o maior contraste.
    expect(deriveAccentForeground('#757575')).toBe(ACCENT_FOREGROUND_LIGHT);
    expect(deriveAccentForeground('#767676')).toBe(ACCENT_FOREGROUND_DARK);
    expect(contrastRatio(ACCENT_FOREGROUND_LIGHT, '#757575')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(ACCENT_FOREGROUND_DARK, '#767676')).toBeGreaterThanOrEqual(4.5);
  });

  it('mantém o texto sobre o destaque legível no hover', () => {
    for (const accent of ['#757575', '#767676']) {
      const colors = {
        accentColor: accent,
        backgroundColor: '#FFFFFF',
        surfaceColor: '#FFFFFF',
        textColor: '#000000',
        textMutedColor: '#555555',
      };
      const vars = materialize(colors, 'light');
      const foreground = vars['--shop-accent-fg'];
      expect(contrastRatio(foreground, vars['--shop-accent-hover'])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(foreground, vars['--shop-accent-action-hover'])).toBeGreaterThanOrEqual(
        4.5
      );
      expect(
        contrastRatio(vars['--shop-action-primary-fg'], vars['--shop-action-primary-hover'])
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('aplica fallback quando #080808 fica perto do fundo escuro', () => {
    const colors = {
      accentColor: '#080808',
      backgroundColor: '#0F1110',
      surfaceColor: '#1B1F1D',
      textColor: '#F2F5F3',
    };
    expect(hasUsableAccentContrast(colors)).toBe(false);
    const tokens = resolveAccentUiTokens(colors);
    expect(tokens.fallback).toBe(true);
    expect(tokens.foreground).toBe(colors.textColor);
    expect(tokens.border).toBe(colors.textColor);
    expect(contrastRatio(tokens.foreground, tokens.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('aplica fallback quando um destaque claro fica sobre um tema claro', () => {
    const colors = {
      accentColor: '#F2F5F3',
      backgroundColor: '#F6F8F7',
      surfaceColor: '#FFFFFF',
      textColor: '#0F1110',
    };
    expect(hasUsableAccentContrast(colors)).toBe(false);
    expect(resolveAccentUiTokens(colors).fallback).toBe(true);
  });

  it('materializa os tokens de fallback no tema público', () => {
    const colors = {
      accentColor: '#080808',
      backgroundColor: '#0F1110',
      surfaceColor: '#1B1F1D',
      textColor: '#F2F5F3',
      textMutedColor: '#8B9990',
    };
    const vars = materialize(colors, 'dark');

    expect(vars['--shop-accent-active-bg']).toBe(colors.surfaceColor);
    expect(vars['--shop-accent-active-fg']).toBe(colors.textColor);
    expect(vars['--shop-accent-active-border']).toBe(colors.textColor);
    expect(vars['--shop-focus']).toBe(colors.textColor);
    expect(vars['--shop-accent-fg']).toBe(ACCENT_FOREGROUND_LIGHT);
    expect(vars['--shop-on-accent']).toBe(vars['--shop-accent-fg']);
    expect(
      contrastRatio(vars['--shop-accent-active-fg'], vars['--shop-accent-action-hover'])
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('usa o destaque real quando ele contrasta com fundo e cartão', () => {
    const colors = {
      accentColor: '#2CB58A',
      backgroundColor: '#0F1110',
      surfaceColor: '#1B1F1D',
      textColor: '#F2F5F3',
      textMutedColor: '#8B9990',
    };
    const tokens = resolveAccentUiTokens(colors);
    const vars = materialize(colors, 'dark');

    expect(tokens.fallback).toBe(false);
    expect(vars['--shop-accent-active-bg']).toBe(colors.accentColor);
    expect(vars['--shop-accent-active-fg']).toBe(vars['--shop-accent-fg']);
    expect(vars['--shop-accent-active-border']).toBe(colors.accentColor);
    expect(vars['--shop-focus']).toBe(colors.accentColor);
  });

  it.each(
    THEME_PRESETS.flatMap(preset =>
      (['light', 'dark'] as const).map(variant => [preset.label, variant, preset[variant]] as const)
    )
  )('mantém a aba ativa legível no preset %s (%s)', (_label, variant, colors) => {
    const tokens = resolveAccentUiTokens(colors);
    const vars = materialize(colors, variant);

    expect(contrastRatio(tokens.foreground, tokens.background)).toBeGreaterThanOrEqual(4.5);
    expect(tokens.fallback).toBe(!hasUsableAccentContrast(colors));
    expect(
      contrastRatio(vars['--shop-accent-active-fg'], vars['--shop-accent-active-bg'])
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(vars['--shop-accent-active-fg'], vars['--shop-accent-action-hover'])
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(vars['--shop-accent-fg'], vars['--shop-accent'])).toBeGreaterThanOrEqual(
      4.5
    );
  });

  it.each(
    THEME_PRESETS.flatMap(preset =>
      (['light', 'dark'] as const).map(variant => [preset.label, variant, preset[variant]] as const)
    )
  )(
    'mantém texto inativo e indicadores com contraste nos presets %s (%s)',
    (_label, variant, colors) => {
      const vars = materialize(colors, variant);

      expect(
        contrastRatio(vars['--shop-text-secondary'], vars['--shop-bg'])
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(vars['--shop-text-secondary'], vars['--shop-surface'])
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(vars['--shop-accent-active-border'], vars['--shop-bg'])
      ).toBeGreaterThanOrEqual(3);
      expect(
        contrastRatio(vars['--shop-accent-active-border'], vars['--shop-surface'])
      ).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(vars['--shop-focus'], vars['--shop-bg'])).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(vars['--shop-focus'], vars['--shop-surface'])).toBeGreaterThanOrEqual(3);
    }
  );
});
