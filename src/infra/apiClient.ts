import { authStorage } from './authStorage';
import { setLastCorrelationId } from '../utils/correlationIdStore';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  retried?: boolean;
  signal?: AbortSignal;
  rateLimitAttempt?: number;
}

const isAbortError = (err: unknown): boolean =>
  (err instanceof DOMException && err.name === 'AbortError') ||
  (err instanceof Error && err.name === 'AbortError');

/**
 * Em produção (Render Static Site), o frontend é servido em um domínio diferente do backend.
 * A VITE_API_URL permite apontar as chamadas /api/* para o backend correto.
 * Em dev, o Vite proxy já redireciona /api → localhost:3333.
 */
export const API_BASE = (import.meta as any).env?.VITE_API_URL ?? '';

const RATE_LIMIT_MAX = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
let calls: number[] = [];

/** Códigos de bloqueio de acesso emitidos pelo backend (checkSubscription / blockedEntityService). */
export const ACCESS_BLOCKED_CODES = ['SUBSCRIPTION_REQUIRED', 'CPF_BLOCKED'] as const;
export type AccessBlockedCode = (typeof ACCESS_BLOCKED_CODES)[number];

export const ACCESS_BLOCKED_EVENT = 'agendai:access-blocked';

/** Rotas em que 401 NÃO deve disparar refresh (login/refresh/logout). */
const NO_REFRESH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout'];

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  data?: unknown;
  retryAfter?: number;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    data?: unknown,
    retryAfter?: number
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;
    this.retryAfter = retryAfter;
  }

  get isAccessBlocked(): boolean {
    return ACCESS_BLOCKED_CODES.includes(this.code as AccessBlockedCode);
  }
}

let rateLimitedUntil = 0;
const MAX_GET_RETRIES = 2;
const BACKOFF_BASE_MS = 1_000;
const MAX_AUTO_RETRY_WAIT_MS = 8_000;

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });

function parseRetryAfter(res: Response, bodyRetryAfter?: unknown): number | null {
  const header = Number(res.headers.get('retry-after'));
  if (Number.isFinite(header) && header > 0) return Math.ceil(header);
  const fromBody = Number(bodyRetryAfter);
  if (Number.isFinite(fromBody) && fromBody > 0) return Math.ceil(fromBody);
  return null;
}

function setRateLimitCooldown(retryAfterSeconds: number | null) {
  const ms = retryAfterSeconds != null ? retryAfterSeconds * 1_000 : BACKOFF_BASE_MS;
  rateLimitedUntil = Math.max(rateLimitedUntil, Date.now() + Math.min(ms, MAX_AUTO_RETRY_WAIT_MS));
}

async function waitForRateLimitGate(signal?: AbortSignal) {
  const wait = rateLimitedUntil - Date.now();
  if (wait > 0) await sleep(Math.min(wait, MAX_AUTO_RETRY_WAIT_MS), signal);
}

function backoffDelayMs(attempt: number): number {
  return BACKOFF_BASE_MS * 2 ** attempt + Math.floor(Math.random() * 250);
}

/** Um único refresh em voo — evita rajada de 401 renovando N vezes. */
let refreshInFlight: Promise<string | null> | null = null;

const REFRESH_LOCK = 'agendai-auth-refresh';

function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (locks?.request) {
    return locks.request(REFRESH_LOCK, task);
  }
  return task();
}

async function doRefreshAccessToken(): Promise<string | null> {
  const revision = authStorage.getRevision();
  try {
    // O refresh token atual fica em cookie HTTP-only. Versões antigas também
    // podem tê-lo no storage, então mantemos esse valor apenas como compatibilidade.
    const refreshToken = authStorage.getRefreshToken();
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status !== 401 && res.status !== 403) {
        throw new ApiError('Não foi possível renovar a sessão agora. Tente novamente.', res.status);
      }
      if (revision !== authStorage.getRevision()) return null;
      authStorage.clearTokens();
      authStorage.clearUser();
      window.dispatchEvent(new Event('agendai:session-expired'));
      return null;
    }
    const bodyText = await res.text();
    if (!bodyText) {
      throw new ApiError('Resposta de sessão indisponível.', 502);
    }
    const json = tryParseJson(bodyText);
    if (!json || typeof json !== 'object') {
      throw new ApiError('Resposta de sessão inválida.', 502);
    }
    const obj = json as Record<string, unknown>;
    const data = (obj.data && typeof obj.data === 'object' ? obj.data as Record<string, unknown> : obj);
    const accessToken = typeof data.accessToken === 'string' ? data.accessToken : undefined;
    if (!accessToken) {
      throw new ApiError('Resposta de sessão incompleta.', 502);
    }
    if (revision !== authStorage.getRevision()) return null;
    const rememberMe = authStorage.isPersistent();
    authStorage.setTokens(accessToken, typeof data.refreshToken === 'string' ? data.refreshToken : undefined, rememberMe);
    if (data.user && typeof data.user === 'object') {
      // Merge: o payload de refresh não traz permissions/avatarUrl — preserva
      // os campos que o /auth/me já carregou em vez de sobrescrever o usuário
      const incoming = data.user as Record<string, unknown>;
      const previous = authStorage.getUser();
      authStorage.setUser(previous ? { ...previous, ...incoming } : incoming, rememberMe);
    }
    return accessToken;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Não foi possível renovar a sessão agora.', 0, 'NETWORK_ERROR');
  }
}

/**
 * Renova o access token via fetch direto (não usa apiClient → sem recursão).
 * Retorna o novo access token ou null se a sessão morreu.
 * Serializa entre abas (Web Locks) para não rotacionar o mesmo cookie duas vezes.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = withRefreshLock(doRefreshAccessToken).finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

const SKIP_SANITIZE_KEYS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'confirmPassword',
  'recaptchaToken',
  'idToken',
  'refreshToken',
  'accessToken',
  'token',
]);

const sanitize = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object') return payload;
  if (Array.isArray(payload)) return payload.map(sanitize);
  return Object.entries(payload as Record<string, unknown>).reduce(
    (acc, [k, v]) => {
      if (typeof v === 'string') {
        acc[k] = SKIP_SANITIZE_KEYS.has(k) ? v : v.replace(/[<>]/g, '').trim();
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
const buildApiError = (status: number, rawBody: string, retryAfter?: number): ApiError => {
  const body = tryParseJson(rawBody) as Record<string, unknown> | null;
  if (!body) {
    return new ApiError(rawBody || `HTTP ${status}`, status, undefined, undefined, retryAfter);
  }

  let message: string = typeof body.message === 'string' ? body.message : `HTTP ${status}`;
  let code: string | undefined = typeof body.code === 'string' ? body.code : undefined;
  let data: unknown = { ...body };

  // Compat: `message` pode ser um JSON serializado com { code, message, ... }
  const nested = typeof body.message === 'string' ? tryParseJson(body.message) as Record<string, unknown> | null : null;
  if (nested && typeof nested === 'object' && nested !== null && 'code' in nested) {
    code = String(nested.code);
    message = typeof nested.message === 'string' ? nested.message : message;
    data = { ...(data as Record<string, unknown>), ...nested };
  }
  (data as Record<string, unknown>).message = message;

  const retryAfterFromBody = Number((data as Record<string, unknown>).retryAfter);
  const finalRetryAfter =
    retryAfter ??
    (Number.isFinite(retryAfterFromBody) && retryAfterFromBody > 0
      ? Math.ceil(retryAfterFromBody)
      : undefined);

  return new ApiError(message, status, code, data, finalRetryAfter);
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
  options: ApiRequestOptions = {}
): Promise<T> => {
  checkRateLimit();
  if (method === 'GET') await waitForRateLimitGate(options.signal);
  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const hasJsonBody = body !== undefined && body !== null;
  if (hasJsonBody) {
    headers['Content-Type'] = 'application/json';
  }

  const attempt = options.rateLimitAttempt ?? 0;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: hasJsonBody ? JSON.stringify(sanitize(body)) : undefined,
      credentials: 'include',
      signal: options.signal,
    });
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.',
      0,
      'NETWORK_ERROR',
      { cause: err instanceof Error ? err.message : String(err) }
    );
  }

  // Track correlation ID from response for error reporting
  const corrId = res.headers.get('x-correlation-id');
  if (corrId) {
    setLastCorrelationId(corrId);
  }

  if (!res.ok) {
    if (res.status === 429 && method === 'GET' && attempt < MAX_GET_RETRIES) {
      const rawBody = await res.clone().text();
      const parsedBody = tryParseJson(rawBody) as Record<string, unknown> | null;
      const retryAfter = parseRetryAfter(res, parsedBody?.retryAfter);
      setRateLimitCooldown(retryAfter);
      if (retryAfter == null || retryAfter * 1000 <= MAX_AUTO_RETRY_WAIT_MS) {
        const waitMs =
          retryAfter != null
            ? Math.min(retryAfter * 1_000, MAX_AUTO_RETRY_WAIT_MS)
            : backoffDelayMs(attempt);
        await sleep(waitMs + Math.floor(Math.random() * 250), options.signal);
        return apiClient<T>(url, method, body, token, {
          ...options,
          rateLimitAttempt: attempt + 1,
        });
      }
      const error = buildApiError(res.status, rawBody, retryAfter ?? undefined);
      notifyIfAccessBlocked(error);
      throw error;
    }

    const shouldRefresh =
      res.status === 401 &&
      Boolean(token) &&
      !options.retried &&
      !NO_REFRESH_PATHS.some(p => url.startsWith(p));

    if (shouldRefresh) {
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        return apiClient<T>(url, method, body, nextToken, { ...options, retried: true });
      }
    }

    const text = await res.text();
    const retryAfterHeader = Number(res.headers.get('retry-after'));
    const error = buildApiError(
      res.status,
      text,
      Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
        ? Math.ceil(retryAfterHeader)
        : undefined
    );
    // 401 com access token apresentado e fora das rotas de login/registro:
    // a sessão é inválida/expirada (refresh não resolveu). Marca com um código
    // próprio para o getErrorMessage traduzir em PT-BR amigável.
    if (
      res.status === 401 &&
      Boolean(token) &&
      !NO_REFRESH_PATHS.some(p => url.startsWith(p)) &&
      !error.code
    ) {
      error.code = 'SESSION_EXPIRED';
      if (!error.message || /^HTTP\s*\d+$/i.test(error.message)) {
        error.message = 'Sua sessão expirou. Faça login novamente.';
      }
    }
    notifyIfAccessBlocked(error);
    throw error;
  }

  // Defensivo: lê como texto primeiro para tratar 2xx com body vazio/inválido
  const bodyText = await res.text();
  if (!bodyText) {
    // 2xx sem conteúdo é sucesso legítimo (ex.: DELETE → 204)
    return undefined as unknown as T;
  }
  const parsed = tryParseJson(bodyText);
  if (!parsed) {
    throw new ApiError(
      'O servidor enviou uma resposta inválida. Tente novamente em instantes.',
      res.status,
      'INVALID_RESPONSE'
    );
  }
  return parsed as T;
};

export const apiFetch = async (
  url: string,
  init: RequestInit = {},
  token?: string,
  retried = false
): Promise<Response> => {
  checkRateLimit();
  const headers = new Headers(init.headers);
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...init,
      headers,
      credentials: init.credentials ?? 'include',
    });
    const corrId = response.headers.get('x-correlation-id');
    if (corrId) setLastCorrelationId(corrId);
    if (
      response.status === 401 &&
      token &&
      !retried &&
      !NO_REFRESH_PATHS.some(p => url.startsWith(p))
    ) {
      const nextToken = await refreshAccessToken();
      if (nextToken) return apiFetch(url, init, nextToken, true);
    }
    return response;
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.',
      0,
      'NETWORK_ERROR',
      { cause: err instanceof Error ? err.message : String(err) }
    );
  }
};
