const ACCESS_TOKEN_KEY = 'barber_access_token';
const ACCESS_TOKEN_SESSION_KEY = 'barber_access_token_session';
const REFRESH_TOKEN_KEY = 'barber_refresh_token';
const REFRESH_TOKEN_SESSION_KEY = 'barber_refresh_token_session';
const USER_KEY = 'barber_user';
const USER_SESSION_KEY = 'barber_user_session';
const REMEMBER_ME_KEY = 'barber_remember_me';
const SAVED_ACCOUNTS_KEY = 'barber_saved_accounts';
let revision = 0;

export interface SavedAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

function getRememberMe(): boolean {
  const preference = localStorage.getItem(REMEMBER_ME_KEY);
  if (preference !== null) return preference === 'true';
  return Boolean(localStorage.getItem(USER_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY));
}

/**
 * Retorna o refresh token do armazenamento.
 * Verifica localStorage primeiro (manter conectado), depois sessionStorage.
 */
function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_SESSION_KEY);
}

export const authStorage = {
  getRevision: () => revision,
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY),
  getRefreshToken,
  hasStoredSession: () => Boolean(
    localStorage.getItem(USER_KEY) ??
      sessionStorage.getItem(USER_SESSION_KEY) ??
      localStorage.getItem(ACCESS_TOKEN_KEY) ??
      sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY) ??
      getRefreshToken()
  ),
  isPersistent: getRememberMe,
  /** Preferência explícita do usuário (independente do storage de tokens). */
  getRememberMe,
  setRememberMe: (value: boolean) => localStorage.setItem(REMEMBER_ME_KEY, String(value)),
  setAccessToken: (token: string, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_SESSION_KEY, token);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },
  clearAccessToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
  },
  /**
   * Armazena os tokens.
   * @param rememberMe  true → refresh em localStorage (persiste entre sessões).
   *                    false/undefined → refresh em sessionStorage (apaga ao fechar o browser).
   */
  setTokens: (accessToken: string, refreshToken?: string, rememberMe = true) => {
    if (rememberMe) localStorage.setItem(REMEMBER_ME_KEY, 'true');
    else localStorage.setItem(REMEMBER_ME_KEY, 'false');
    authStorage.setAccessToken(accessToken, rememberMe);
    if (refreshToken) {
      if (rememberMe) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        sessionStorage.removeItem(REFRESH_TOKEN_SESSION_KEY);
      } else {
        sessionStorage.setItem(REFRESH_TOKEN_SESSION_KEY, refreshToken);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }
  },
  clearTokens: () => {
    revision++;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_SESSION_KEY);
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
