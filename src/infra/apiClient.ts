import { authStorage } from './authStorage';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const RATE_LIMIT_MAX = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
let calls: number[] = [];

/** Códigos de bloqueio de acesso emitidos pelo backend (checkSubscription / blockedEntityService). */
export const ACCESS_BLOCKED_CODES = ['SUBSCRIPTION_REQUIRED', 'CPF_BLOCKED'] as const;
export type AccessBlockedCode = (typeof ACCESS_BLOCKED_CODES)[number];

export const ACCESS_BLOCKED_EVENT = 'agendai:access-blocked';

/** Rotas em que 401 NÃO deve disparar refresh (login/refresh). */
const NO_REFRESH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  data?: unknown;

  constructor(message: string, statusCode: number, code?: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;
  }

  get isAccessBlocked(): boolean {
    return ACCESS_BLOCKED_CODES.includes(this.code as AccessBlockedCode);
  }
}

/** Um único refresh em voo — evita rajada de 401 renovando N vezes. */
let refreshInFlight: Promise<string | null> | null = null;

/**
 * Renova o access token via fetch direto (não usa apiClient → sem recursão).
 * Retorna o novo access token ou null se a sessão morreu.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        authStorage.clearTokens();
        authStorage.clearUser();
        window.dispatchEvent(new Event('agendai:session-expired'));
        return null;
      }
      const json = await res.json();
      const data = json?.data ?? json;
      const accessToken = data?.accessToken as string | undefined;
      const nextRefresh = data?.refreshToken as string | undefined;
      if (!accessToken || !nextRefresh) {
        authStorage.clearTokens();
        authStorage.clearUser();
        window.dispatchEvent(new Event('agendai:session-expired'));
        return null;
      }
      authStorage.setTokens(accessToken, nextRefresh);
      if (data.user) authStorage.setUser(data.user);
      return accessToken;
    } catch {
      authStorage.clearTokens();
      authStorage.clearUser();
      window.dispatchEvent(new Event('agendai:session-expired'));
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

const sanitize = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object') return payload;
  if (Array.isArray(payload)) return payload.map(sanitize);
  return Object.entries(payload as Record<string, unknown>).reduce(
    (acc, [k, v]) => {
      if (typeof v === 'string') {
        acc[k] = v.replace(/[<>]/g, '').trim();
      } else {
        acc[k] = sanitize(v);
      }
      return acc;
    },
    {} as Record<string, unknown>
  );
};

const checkRateLimit = () => {
  const now = Date.now();
  calls = calls.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  if (calls.length >= RATE_LIMIT_MAX) {
    throw new ApiError('Rate limit excedido. Tente novamente em instantes.', 429);
  }
  calls.push(now);
};

const tryParseJson = (text: string): unknown => {
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Constrói um ApiError a partir do corpo de erro do backend.
 * O backend responde `{ success: false, message, code?, ...extras }`; em versões
 * antigas a `message` podia ser um JSON serializado (`{ code, message, ... }`),
 * então também tentamos parsear esse caso para extrair `code`/`plans`/etc.
 */
const buildApiError = (status: number, rawBody: string): ApiError => {
  const body = tryParseJson(rawBody);
  if (!body) {
    return new ApiError(rawBody || `HTTP ${status}`, status);
  }

  let message: string = typeof body.message === 'string' ? body.message : `HTTP ${status}`;
  let code: string | undefined = typeof body.code === 'string' ? body.code : undefined;
  let data: unknown = { ...(body as Record<string, unknown>) };

  // Compat: `message` pode ser um JSON serializado com { code, message, ... }
  const nested = typeof body.message === 'string' ? tryParseJson(body.message) : null;
  if (nested && typeof nested === 'object' && nested !== null && 'code' in nested) {
    code = String(nested.code);
    message = typeof nested.message === 'string' ? nested.message : message;
    data = { ...(data as Record<string, unknown>), ...(nested as Record<string, unknown>) };
  }
  (data as Record<string, unknown>).message = message;

  return new ApiError(message, status, code, data);
};

const notifyIfAccessBlocked = (error: ApiError) => {
  if (!error.isAccessBlocked) return;
  window.dispatchEvent(
    new CustomEvent(ACCESS_BLOCKED_EVENT, {
      detail: {
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
        ...(error.data as Record<string, unknown>),
      },
    })
  );
};

export const apiClient = async <T>(
  url: string,
  method: HttpMethod = 'GET',
  body?: unknown,
  token?: string,
  _retried = false
): Promise<T> => {
  checkRateLimit();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(sanitize(body)) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.',
      0,
      'NETWORK_ERROR',
      { cause: err instanceof Error ? err.message : String(err) }
    );
  }

  if (!res.ok) {
    const shouldRefresh =
      res.status === 401 &&
      Boolean(token) &&
      !_retried &&
      !NO_REFRESH_PATHS.some(p => url.startsWith(p));

    if (shouldRefresh) {
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        return apiClient<T>(url, method, body, nextToken, true);
      }
    }

    const text = await res.text();
    const error = buildApiError(res.status, text);
    notifyIfAccessBlocked(error);
    throw error;
  }
  return res.json() as Promise<T>;
};
