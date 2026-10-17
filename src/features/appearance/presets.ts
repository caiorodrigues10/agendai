import type { ButtonStyle, PageThemeInput, RadiusStyle } from '../../infra/pageThemeApi';
import { PAGE_THEME_DEFAULTS } from '../../shared/pageThemeDefaults';

export interface ThemePreset {
  key: string;
  label: string;
  colors: Pick<
    PageThemeInput,
    'accentColor' | 'backgroundColor' | 'surfaceColor' | 'textColor' | 'textMutedColor'
  >;
  radiusStyle: RadiusStyle;
  buttonStyle: ButtonStyle;
}

/** Paletas prontas. Todas devem passar no contraste WCAG AA (ver presets.test.ts). */
export const THEME_PRESETS: ThemePreset[] = [
  {
    key: 'esmeralda',
    label: 'Esmeralda',
    colors: {
      accentColor: PAGE_THEME_DEFAULTS.accentColor,
      backgroundColor: PAGE_THEME_DEFAULTS.backgroundColor,
      surfaceColor: PAGE_THEME_DEFAULTS.surfaceColor,
      textColor: PAGE_THEME_DEFAULTS.textColor,
      textMutedColor: PAGE_THEME_DEFAULTS.textMutedColor,
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'rosa',
    label: 'Rosa',
    colors: {
      accentColor: '#F472B6',
      backgroundColor: '#1A0F16',
      surfaceColor: '#2A1521',
      textColor: '#FBF1F6',
      textMutedColor: '#C9A5B8',
    },
    radiusStyle: 'pill',
    buttonStyle: 'filled',
  },
  {
    key: 'dourado',
    label: 'Dourado',
    colors: {
      accentColor: '#EAB308',
      backgroundColor: '#17130A',
      surfaceColor: '#241D10',
      textColor: '#F7F1E3',
      textMutedColor: '#C4B694',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'azul',
    label: 'Azul',
    colors: {
      accentColor: '#60A5FA',
      backgroundColor: '#0B1220',
      surfaceColor: '#131C2E',
      textColor: '#EFF4FB',
      textMutedColor: '#A7B6CC',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'roxo',
    label: 'Roxo',
    colors: {
      accentColor: '#A78BFA',
      backgroundColor: '#130F1D',
      surfaceColor: '#1D1730',
      textColor: '#F4F1FB',
      textMutedColor: '#B4A9CC',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'laranja',
    label: 'Laranja',
    colors: {
      accentColor: '#FB923C',
      backgroundColor: '#1A100A',
      surfaceColor: '#26170E',
      textColor: '#FAF2EB',
      textMutedColor: '#CBAE97',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'claro',
    label: 'Claro',
    colors: {
      accentColor: '#1C7E61',
      backgroundColor: '#F3F5F4',
      surfaceColor: '#FFFFFF',
      textColor: '#14201B',
      textMutedColor: '#5A6B63',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'preto-dourado',
    label: 'Preto & dourado',
    colors: {
      accentColor: '#D4AF37',
      backgroundColor: '#0A0A0A',
      surfaceColor: '#161616',
      textColor: '#F5F5F0',
      textMutedColor: '#ABA49A',
    },
    radiusStyle: 'pill',
    buttonStyle: 'outline',
  },
];

export function getPresetByKey(key: string | null | undefined): ThemePreset | undefined {
  return THEME_PRESETS.find(p => p.key === key);
}
