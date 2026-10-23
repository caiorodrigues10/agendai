import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import {
  CloudinaryUploadError,
  uploadToCloudinary,
  type SignedImageUpload,
} from './cloudinaryDirectUpload';

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
  /** Ponto focal do recorte 16:9 (0–100); ausente em resposta legada = 50/50. */
  coverFocalX?: number;
  coverFocalY?: number;
  /** Dimensões originais da capa (recorte sem ampliar); ausente = desconhecidas. */
  coverWidth?: number | null;
  coverHeight?: number | null;
}

/** Payload do PUT (coverUrl/coverPublicId só quando o backend aceitá-los juntos). */
export type PageThemeInput = Omit<
  PageTheme,
  'id' | 'barbershopId' | 'coverUrl' | 'coverPublicId'
> & {
  coverUrl?: string | null;
  coverPublicId?: string | null;
};

/** Body do confirm de capa (back é a autoridade: valida recurso no Cloudinary). */
interface ConfirmCoverBody {
  publicId: string;
  version?: number;
}

/** Opções do upload direto ao Cloudinary (progresso + cancelamento). */
export interface UploadCoverOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

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

  /**
   * Capa via upload DIRETO ao Cloudinary (sem passar o arquivo pelo back):
   * 1. POST /uploads/sign { kind: 'cover' } → credenciais assinadas no back
   * 2. FormData direto no Cloudinary (progresso/AbortSignal em `options`)
   * 3. POST /page-theme/cover/confirm { publicId, version } → back valida o
   *    recurso (pasta/dimensões/formato) e grava. Assinatura expirada re-assina
   *    UMA vez automaticamente.
   */
  uploadCover: async (
    barbershopId: string,
    file: File,
    options?: UploadCoverOptions,
  ): Promise<PageTheme> => {
    const token = authStorage.getAccessToken() || '';
    const sign = async (): Promise<SignedImageUpload> => {
      const res = await apiClient<{ success: boolean; data: SignedImageUpload }>(
        `/api/barbershops/${barbershopId}/uploads/sign`,
        'POST',
        { kind: 'cover' },
        token
      );
      return unwrap<SignedImageUpload>(res);
    };

    let credentials = await sign();
    let uploaded;
    try {
      uploaded = await uploadToCloudinary(credentials, {
        file,
        onProgress: options?.onProgress,
        signal: options?.signal,
      });
    } catch (err) {
      if (err instanceof CloudinaryUploadError && err.signatureExpired && !options?.signal?.aborted) {
        try {
          credentials = await sign();
          uploaded = await uploadToCloudinary(credentials, {
            file,
            onProgress: options?.onProgress,
            signal: options?.signal,
          });
        } catch (retryErr) {
          // Re-assinou UMA vez e falhou de novo: mensagem amigável (nunca
          // texto técnico do Cloudinary).
          if (retryErr instanceof CloudinaryUploadError && retryErr.signatureExpired) {
            throw new CloudinaryUploadError('Não foi possível autorizar o envio. Tente novamente.');
          }
          throw retryErr;
        }
      } else {
        throw err;
      }
    }

    const confirmRes = await apiClient<{ success: boolean; data: PageTheme }>(
      `/api/barbershops/${barbershopId}/page-theme/cover/confirm`,
      'POST',
      { publicId: uploaded.publicId, version: uploaded.version } satisfies ConfirmCoverBody,
      token
    );
    const theme = unwrap<PageTheme>(confirmRes);
    return isValidPageTheme(theme) ? normalizePageTheme(theme) : theme;
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
