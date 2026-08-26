const ACCESS_TOKEN_KEY = 'barber_access_token';
const USER_KEY = 'barber_user';

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearAccessToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  setTokens: (accessToken: string, _refreshToken?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    // refreshToken is now in httpOnly cookie — ignore
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    // Cookie is cleared by the backend logout endpoint
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
