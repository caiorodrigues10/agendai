import { apiClient, apiFetch } from './apiClient';
import { authStorage } from './authStorage';

export type RadiusStyle = 'squared' | 'rounded' | 'pill';
export type ButtonStyle = 'filled' | 'outline';
/** AUTO = página segue o sistema; LIGHT/DARK = forçado pelo dono. */
export type PageThemeMode = 'AUTO' | 'LIGHT' | 'DARK';
export type PageThemeVariant = 'light' | 'dark';

/** Cores completas de uma variante (claro/escuro) do tema da página. */
export interface PageThemeVariantColors {
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMutedColor: string;
}

export interface PageTheme {
  id: string;
  barbershopId: string;
  presetKey: string | null;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMutedColor: string;
  radiusStyle: RadiusStyle;
  buttonStyle: ButtonStyle;
  /** Ausente em respostas legadas = AUTO. */
  mode?: PageThemeMode;
  /** Variante clara; null/ausente = ainda não materializada (gerada no cliente). */
  lightColors?: PageThemeVariantColors | null;
  /** Variante escura; ausente no legado = cores planas acima. */
  darkColors?: PageThemeVariantColors | null;
  coverUrl: string | null;
  coverPublicId: string | null;
  coverOverlay: number;
}

/** Payload do PUT (coverUrl/coverPublicId só quando o backend aceitá-los juntos). */
export type PageThemeInput = Omit<
  PageTheme,
  'id' | 'barbershopId' | 'coverUrl' | 'coverPublicId'
> & {
  coverUrl?: string | null;
  coverPublicId?: string | null;
};

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

/**
 * Shape mínimo de um PageTheme. Respostas malformadas (mocks genéricos de
 * `/api/**`, bug de back) viram `null` = visual padrão, em vez de crashar a
 * árvore React ao derivar CSS vars de campos undefined.
 */
function isValidPageTheme(value: unknown): value is PageTheme {
  if (!value || typeof value !== 'object') return false;
  const t = value as Partial<PageTheme>;
  return (
    typeof t.accentColor === 'string' &&
    typeof t.backgroundColor === 'string' &&
    typeof t.surfaceColor === 'string' &&
    typeof t.textColor === 'string' &&
    typeof t.textMutedColor === 'string' &&
    (t.radiusStyle === 'squared' || t.radiusStyle === 'rounded' || t.radiusStyle === 'pill') &&
    (t.buttonStyle === 'filled' || t.buttonStyle === 'outline') &&
    typeof t.coverOverlay === 'number'
  );
}

function isVariantColors(value: unknown): value is PageThemeVariantColors {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<PageThemeVariantColors>;
  return (
    typeof v.accentColor === 'string' &&
    typeof v.backgroundColor === 'string' &&
    typeof v.surfaceColor === 'string' &&
    typeof v.textColor === 'string' &&
    typeof v.textMutedColor === 'string'
  );
}

/**
 * Retrocompat: respostas legadas (sem `mode`/variantes) viram estrutura
 * completa — `darkColors` = cores planas, `lightColors` = null (gerada no
 * cliente), `mode` = AUTO. Shape de variante corrompido cai no mesmo caminho.
 */
export function normalizePageTheme(theme: PageTheme): PageTheme {
  const flatColors: PageThemeVariantColors = {
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    surfaceColor: theme.surfaceColor,
    textColor: theme.textColor,
    textMutedColor: theme.textMutedColor,
  };
  return {
    ...theme,
    mode: theme.mode === 'LIGHT' || theme.mode === 'DARK' ? theme.mode : 'AUTO',
    darkColors: isVariantColors(theme.darkColors) ? theme.darkColors : flatColors,
    lightColors: isVariantColors(theme.lightColors) ? theme.lightColors : null,
  };
}

export const pageThemeApi = {
  /** Público (cacheável no back por 60s). `null` = salão sem tema = visual padrão. */
  getPublic: (barbershopId: string): Promise<PageTheme | null> =>
    apiClient<{ success: boolean; data: PageTheme | null }>(
      `/api/barbershops/${barbershopId}/page-theme`
    ).then(res => {
      const theme = unwrap<PageTheme | null>(res);
      return isValidPageTheme(theme) ? normalizePageTheme(theme) : null;
    }),

  update: (barbershopId: string, payload: PageThemeInput): Promise<PageTheme> => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: PageTheme }>(
      `/api/barbershops/${barbershopId}/page-theme`,
      'PUT',
      payload,
      token
    ).then(res => {
      const theme = unwrap<PageTheme>(res);
      return isValidPageTheme(theme) ? normalizePageTheme(theme) : theme;
    });
  },

  uploadCover: async (barbershopId: string, file: File): Promise<PageTheme> => {
    const token = authStorage.getAccessToken() || '';
    const formData = new FormData();
    formData.append('cover', file);

    const response = await apiFetch(
      `/api/barbershops/${barbershopId}/page-theme/cover`,
      { method: 'POST', body: formData },
      token
    );
    const bodyText = await response.text();
    if (!response.ok) {
      let message = `Falha ao enviar a capa (${response.status})`;
      if (bodyText) {
        try {
          const parsed = JSON.parse(bodyText) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {
          /* corpo não-JSON: mantém mensagem genérica */
        }
      }
      throw new Error(message);
    }
    const parsed = JSON.parse(bodyText) as { data?: PageTheme };
    if (!parsed.data) throw new Error('Resposta inválida do servidor ao enviar a capa.');
    return isValidPageTheme(parsed.data) ? normalizePageTheme(parsed.data) : parsed.data;
  },

  deleteCover: (barbershopId: string): Promise<PageTheme | null> => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: PageTheme | null }>(
      `/api/barbershops/${barbershopId}/page-theme/cover`,
      'DELETE',
      undefined,
      token
    ).then(res => {
      const theme = unwrap<PageTheme | null>(res);
      return isValidPageTheme(theme) ? normalizePageTheme(theme) : theme;
    });
  },
};
