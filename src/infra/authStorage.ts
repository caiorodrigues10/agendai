const ACCESS_TOKEN_KEY = 'barber_access_token';
const ACCESS_TOKEN_SESSION_KEY = 'barber_access_token_session';
const REFRESH_TOKEN_KEY = 'barber_refresh_token';
const REFRESH_TOKEN_SESSION_KEY = 'barber_refresh_token_session';
const USER_KEY = 'barber_user';
const USER_SESSION_KEY = 'barber_user_session';

/**
 * Retorna o refresh token do armazenamento.
 * Verifica localStorage primeiro (manter conectado), depois sessionStorage.
 */
function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_SESSION_KEY);
}

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY),
  getRefreshToken,
  isPersistent: () => Boolean(
    localStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY)
  ),
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
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_SESSION_KEY);
  },
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: any, rememberMe = true) => {
    const serialized = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(USER_KEY, serialized);
      sessionStorage.removeItem(USER_SESSION_KEY);
    } else {
      sessionStorage.setItem(USER_SESSION_KEY, serialized);
      localStorage.removeItem(USER_KEY);
    }
  },
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_SESSION_KEY);
  },
};
