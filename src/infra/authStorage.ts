const ACCESS_TOKEN_KEY = 'barber_access_token';
const REFRESH_TOKEN_KEY = 'barber_refresh_token';
const REFRESH_TOKEN_SESSION_KEY = 'barber_refresh_token_session';
const USER_KEY = 'barber_user';

/**
 * Retorna o refresh token do armazenamento.
 * Verifica localStorage primeiro (manter conectado), depois sessionStorage.
 */
function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_SESSION_KEY);
}

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken,
  setAccessToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearAccessToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  /**
   * Armazena os tokens.
   * @param rememberMe  true → refresh em localStorage (persiste entre sessões).
   *                    false/undefined → refresh em sessionStorage (apaga ao fechar o browser).
   */
  setTokens: (accessToken: string, refreshToken?: string, rememberMe = true) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
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
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_SESSION_KEY);
  },
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  },
};
