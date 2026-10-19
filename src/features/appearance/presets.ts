import type {
  ButtonStyle,
  PageThemeInput,
  PageThemeVariantColors,
  RadiusStyle,
} from '../../infra/pageThemeApi';
import { PAGE_THEME_DEFAULTS } from '../../shared/pageThemeDefaults';

export interface ThemePreset {
  key: string;
  label: string;
  /**
   * Legado (formato antigo, cores planas): igual à variante "principal" da
   * paleta — dark nas 7 paletas escuras e light no preset `claro`. Mantida
   * congelada porque os testes de contraste AA rodam sobre ela.
   */
  colors: Pick<
    PageThemeInput,
    'accentColor' | 'backgroundColor' | 'surfaceColor' | 'textColor' | 'textMutedColor'
  >;
  /** Variante clara do tema (fundo claro). AA verificado nos dois pares. */
  light: PageThemeVariantColors;
  /** Variante escura do tema (fundo escuro). AA verificado nos dois pares. */
  dark: PageThemeVariantColors;
  radiusStyle: RadiusStyle;
  buttonStyle: ButtonStyle;
}

interface PresetDefinition {
  key: string;
  label: string;
  /** Qual variante alimenta o campo legado `colors` (chip + testes AA). */
  legacy: 'light' | 'dark';
  light: PageThemeVariantColors;
  dark: PageThemeVariantColors;
  radiusStyle: RadiusStyle;
  buttonStyle: ButtonStyle;
}

const DEFAULT_DARK: PageThemeVariantColors = {
  accentColor: PAGE_THEME_DEFAULTS.accentColor,
  backgroundColor: PAGE_THEME_DEFAULTS.backgroundColor,
  surfaceColor: PAGE_THEME_DEFAULTS.surfaceColor,
  textColor: PAGE_THEME_DEFAULTS.textColor,
  textMutedColor: PAGE_THEME_DEFAULTS.textMutedColor,
};

const DEFAULT_LIGHT: PageThemeVariantColors = {
  accentColor: '#1C7E61',
  backgroundColor: '#F3F5F4',
  surfaceColor: '#FFFFFF',
  textColor: '#14201B',
  textMutedColor: '#5A6B63',
};

/**
 * Paletas prontas. Cada paleta tem as DUAS variantes (light/dark) e todas
 * passam no contraste WCAG AA (ver presets.test.ts) — o `accentColor` de cada
 * variante foi ajustado para ≥3:1 contra fundo/superfície.
 */
const PRESET_DEFINITIONS: PresetDefinition[] = [
  {
    key: 'esmeralda',
    label: 'Esmeralda',
    legacy: 'dark',
    dark: DEFAULT_DARK,
    light: {
      accentColor: '#15805E',
      backgroundColor: '#F2F7F4',
      surfaceColor: '#FFFFFF',
      textColor: '#0E1512',
      textMutedColor: '#56635C',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'rosa',
    label: 'Rosa',
    legacy: 'dark',
    dark: {
      accentColor: '#F472B6',
      backgroundColor: '#1A0F16',
      surfaceColor: '#2A1521',
      textColor: '#FBF1F6',
      textMutedColor: '#C9A5B8',
    },
    light: {
      accentColor: '#B4186C',
      backgroundColor: '#FBF2F6',
      surfaceColor: '#FFFFFF',
      textColor: '#171013',
      textMutedColor: '#6A5560',
    },
    radiusStyle: 'pill',
    buttonStyle: 'filled',
  },
  {
    key: 'dourado',
    label: 'Dourado',
    legacy: 'dark',
    dark: {
      accentColor: '#EAB308',
      backgroundColor: '#17130A',
      surfaceColor: '#241D10',
      textColor: '#F7F1E3',
      textMutedColor: '#C4B694',
    },
    light: {
      accentColor: '#8A6D1F',
      backgroundColor: '#F8F6EE',
      surfaceColor: '#FFFFFF',
      textColor: '#17140C',
      textMutedColor: '#6A6142',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'azul',
    label: 'Azul',
    legacy: 'dark',
    dark: {
      accentColor: '#60A5FA',
      backgroundColor: '#0B1220',
      surfaceColor: '#131C2E',
      textColor: '#EFF4FB',
      textMutedColor: '#A7B6CC',
    },
    light: {
      accentColor: '#1D63C8',
      backgroundColor: '#F1F5FB',
      surfaceColor: '#FFFFFF',
      textColor: '#0E1219',
      textMutedColor: '#55606F',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'roxo',
    label: 'Roxo',
    legacy: 'dark',
    dark: {
      accentColor: '#A78BFA',
      backgroundColor: '#130F1D',
      surfaceColor: '#1D1730',
      textColor: '#F4F1FB',
      textMutedColor: '#B4A9CC',
    },
    light: {
      accentColor: '#6D43D6',
      backgroundColor: '#F5F3FC',
      surfaceColor: '#FFFFFF',
      textColor: '#131019',
      textMutedColor: '#5D5770',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'laranja',
    label: 'Laranja',
    legacy: 'dark',
    dark: {
      accentColor: '#FB923C',
      backgroundColor: '#1A100A',
      surfaceColor: '#26170E',
      textColor: '#FAF2EB',
      textMutedColor: '#CBAE97',
    },
    light: {
      accentColor: '#C2410C',
      backgroundColor: '#FBF4EE',
      surfaceColor: '#FFFFFF',
      textColor: '#17120E',
      textMutedColor: '#6B5B4C',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'claro',
    label: 'Claro',
    legacy: 'light',
    light: DEFAULT_LIGHT,
    dark: {
      accentColor: '#1C7E61',
      backgroundColor: '#0F1312',
      surfaceColor: '#1B211E',
      textColor: '#EFF4F1',
      textMutedColor: '#93A099',
    },
    radiusStyle: 'rounded',
    buttonStyle: 'filled',
  },
  {
    key: 'preto-dourado',
    label: 'Preto & dourado',
    legacy: 'dark',
    dark: {
      accentColor: '#D4AF37',
      backgroundColor: '#0A0A0A',
      surfaceColor: '#161616',
      textColor: '#F5F5F0',
      textMutedColor: '#ABA49A',
    },
    light: {
      accentColor: '#8A6D1F',
      backgroundColor: '#FAF7F0',
      surfaceColor: '#FFFFFF',
      textColor: '#16150F',
      textMutedColor: '#635F52',
    },
    radiusStyle: 'pill',
    buttonStyle: 'outline',
  },
];

export const THEME_PRESETS: ThemePreset[] = PRESET_DEFINITIONS.map(
  ({ legacy, light, dark, ...rest }) => ({
    ...rest,
    colors: legacy === 'light' ? light : dark,
    light,
    dark,
  })
);

export function getPresetByKey(key: string | null | undefined): ThemePreset | undefined {
  return THEME_PRESETS.find(p => p.key === key);
}
