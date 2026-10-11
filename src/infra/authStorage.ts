import { impersonationStorage } from './impersonationStorage';
const ACCESS_TOKEN_KEY = 'barber_access_token';
const ACCESS_TOKEN_SESSION_KEY = 'barber_access_token_session';
const REFRESH_TOKEN_KEY = 'barber_refresh_token';
const REFRESH_TOKEN_SESSION_KEY = 'barber_refresh_token_session';
const USER_KEY = 'barber_user';
const USER_SESSION_KEY = 'barber_user_session';
const REMEMBER_ME_KEY = 'barber_remember_me';
const SAVED_ACCOUNTS_KEY = 'barber_saved_accounts';
const SWITCH_ORIGIN_KEY = 'barber_switch_origin';
let revision = 0;

/**
 * Access token vive só em memória (S5): localStorage/sessionStorage nunca
 * recebem tokens. O refresh token é cookie HTTP-only do backend (`refresh_token`,
 * path /api/auth) — invisível para o JS.
 */
let accessTokenInMemory: string | null = null;

/** Migração: remove as chaves de token gravadas por versões antigas. */
function purgeLegacyTokenKeys() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_SESSION_KEY);
}

export interface SavedAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

/** Sessão original (salão de origem + organização usada na troca) para "Voltar". */
export interface SwitchOrigin {
  barbershopId: string;
  orgId: string;
}

function getRememberMe(): boolean {
  const preference = localStorage.getItem(REMEMBER_ME_KEY);
  if (preference !== null) return preference === 'true';
  return Boolean(localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_SESSION_KEY));
}

/**
 * Refresh token legado em storage (versões antigas do app). Serve só para a
 * primeira renovação após o upgrade — o backend rotaciona, grava o cookie e
 * `setTokens` limpa essas chaves. Depois disso sempre `null`.
 */
function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_SESSION_KEY);
}

export const authStorage = {
  getRevision: () => revision,
  // Durante um impersonation o token de impersonation tem prioridade sobre o
  // token da sessão atual (ambos só em memória).
  getAccessToken: () =>
    impersonationStorage.get()?.accessToken ?? accessTokenInMemory,
  getRefreshToken,
  hasStoredSession: () => Boolean(
    accessTokenInMemory ||
      localStorage.getItem(USER_KEY) ||
      sessionStorage.getItem(USER_SESSION_KEY) ||
      getRefreshToken()
  ),
  isPersistent: getRememberMe,
  /** Preferência explícita do usuário (independente do storage de tokens). */
  getRememberMe,
  setRememberMe: (value: boolean) => localStorage.setItem(REMEMBER_ME_KEY, String(value)),
  setAccessToken: (token: string, _rememberMe = true) => {
    accessTokenInMemory = token;
    // Migração: qualquer token novo vem de resposta autenticada, então as
    // chaves antigas em storage deixam de ter uso.
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
  },
  clearAccessToken: () => {
    accessTokenInMemory = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
  },
  /**
   * Guarda a sessão: access token em memória; refresh token fica no cookie
   * HTTP-only definido pelo backend. `refreshToken` é ignorado se vier no
   * corpo (compatibilidade com versões antigas) e as chaves legadas são
   * removidas aqui.
   */
  setTokens: (accessToken: string, _refreshToken?: string, rememberMe = true) => {
    if (rememberMe) localStorage.setItem(REMEMBER_ME_KEY, 'true');
    else localStorage.setItem(REMEMBER_ME_KEY, 'false');
    authStorage.setAccessToken(accessToken, rememberMe);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_SESSION_KEY);
  },
  clearTokens: () => {
    revision++;
    accessTokenInMemory = null;
    purgeLegacyTokenKeys();
    localStorage.removeItem(REMEMBER_ME_KEY);
  },
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_SESSION_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  setUser: (user: any, rememberMe = true) => {
    const serialized = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      localStorage.setItem(USER_KEY, serialized);
      sessionStorage.removeItem(USER_SESSION_KEY);
    } else {
      localStorage.setItem(REMEMBER_ME_KEY, 'false');
      sessionStorage.setItem(USER_SESSION_KEY, serialized);
      localStorage.removeItem(USER_KEY);
    }
  },
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(SWITCH_ORIGIN_KEY);
  },
  getSwitchOrigin: (): SwitchOrigin | null => {
    try {
      const raw = localStorage.getItem(SWITCH_ORIGIN_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed.barbershopId === 'string' && typeof parsed.orgId === 'string'
        ? parsed
        : null;
    } catch {
      return null;
    }
  },
  setSwitchOrigin: (origin: SwitchOrigin) => {
    localStorage.setItem(SWITCH_ORIGIN_KEY, JSON.stringify(origin));
  },
  clearSwitchOrigin: () => {
    localStorage.removeItem(SWITCH_ORIGIN_KEY);
  },
  getSavedAccounts: (): SavedAccount[] => {
    try {
      const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  upsertSavedAccount: (user: SavedAccount) => {
    const accounts = authStorage.getSavedAccounts();
    const filtered = accounts.filter(a => a.id !== user.id);
    filtered.unshift({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl });
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered.slice(0, 5)));
  },
  removeSavedAccount: (id: string) => {
    const accounts = authStorage.getSavedAccounts();
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts.filter(a => a.id !== id)));
  },
};
