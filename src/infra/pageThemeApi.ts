import { apiClient, apiFetch } from './apiClient';
import { authStorage } from './authStorage';

export type RadiusStyle = 'squared' | 'rounded' | 'pill';
export type ButtonStyle = 'filled' | 'outline';

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

export const pageThemeApi = {
  /** Público (cacheável no back por 60s). `null` = salão sem tema = visual padrão. */
  getPublic: (barbershopId: string): Promise<PageTheme | null> =>
    apiClient<{ success: boolean; data: PageTheme | null }>(
      `/api/barbershops/${barbershopId}/page-theme`
    ).then(res => {
      const theme = unwrap<PageTheme | null>(res);
      return isValidPageTheme(theme) ? theme : null;
    }),

  update: (barbershopId: string, payload: PageThemeInput): Promise<PageTheme> => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: PageTheme }>(
      `/api/barbershops/${barbershopId}/page-theme`,
      'PUT',
      payload,
      token
    ).then(res => unwrap<PageTheme>(res));
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
    return parsed.data;
  },

  deleteCover: (barbershopId: string): Promise<PageTheme | null> => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: PageTheme | null }>(
      `/api/barbershops/${barbershopId}/page-theme/cover`,
      'DELETE',
      undefined,
      token
    ).then(res => unwrap<PageTheme | null>(res));
  },
};
