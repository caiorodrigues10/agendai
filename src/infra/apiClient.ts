export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const RATE_LIMIT_MAX = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
let calls: number[] = [];

/** Códigos de bloqueio de acesso emitidos pelo backend (checkSubscription / blockedEntityService). */
export const ACCESS_BLOCKED_CODES = ['SUBSCRIPTION_REQUIRED', 'CPF_BLOCKED'] as const;
export type AccessBlockedCode = (typeof ACCESS_BLOCKED_CODES)[number];

export const ACCESS_BLOCKED_EVENT = 'bq:access-blocked';

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  data?: any;

  constructor(message: string, statusCode: number, code?: string, data?: any) {
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

const sanitize = (payload: any) => {
  if (!payload || typeof payload !== 'object') return payload;
  if (Array.isArray(payload)) return payload.map(sanitize);
  return Object.entries(payload).reduce((acc, [k, v]) => {
    if (typeof v === 'string') {
      acc[k] = v.replace(/[<>]/g, '').trim();
    } else {
      acc[k] = sanitize(v);
    }
    return acc;
  }, {} as any);
};

const checkRateLimit = () => {
  const now = Date.now();
  calls = calls.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  if (calls.length >= RATE_LIMIT_MAX) {
    throw new ApiError('Rate limit excedido. Tente novamente em instantes.', 429);
  }
  calls.push(now);
};

const tryParseJson = (text: string): any | null => {
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
  let data: any = { ...body };

  // Compat: `message` pode ser um JSON serializado com { code, message, ... }
  const nested = typeof body.message === 'string' ? tryParseJson(body.message) : null;
  if (nested && typeof nested.code === 'string') {
    code = nested.code;
    message = typeof nested.message === 'string' ? nested.message : message;
    data = { ...data, ...nested };
  }
  data.message = message;

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
        ...error.data
      }
    })
  );
};

export const apiClient = async <T>(
  url: string,
  method: HttpMethod = 'GET',
  body?: any,
  token?: string
): Promise<T> => {
  checkRateLimit();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(sanitize(body)) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    const error = buildApiError(res.status, text);
    notifyIfAccessBlocked(error);
    throw error;
  }
  return res.json() as Promise<T>;
};
