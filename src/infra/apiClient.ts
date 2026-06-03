export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const RATE_LIMIT_MAX = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
let calls: number[] = [];

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
    throw new Error('Rate limit excedido. Tente novamente em instantes.');
  }
  calls.push(now);
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
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
};
