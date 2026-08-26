import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authApi, RegisterPayload } from '../infra/authApi';
import { authStorage } from '../infra/authStorage';
import { ApiError } from '../infra/apiClient';
import { getErrorMessage } from '../utils/errorMessage';
import { StaffMember } from '../types';

export type AuthResult = { ok: true } | { ok: false; message: string };

interface AuthContextValue {
  user: StaffMember | null;
  loading: boolean;
  login: (email: string, password: string, recaptchaToken?: string) => Promise<AuthResult>;
  loginWithGoogle: (idToken: string) => Promise<AuthResult>;
  register: (data: RegisterPayload & { recaptchaToken?: string }) => Promise<AuthResult>;
  logout: () => void;
  hasRole: (roles: StaffMember['role'][]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  /** Normaliza o role pra uppercase — o backend retorna "owner", "employee" etc. */
  const normalizeUser = (u: unknown): StaffMember => {
    const raw = u as StaffMember;
    return { ...raw, role: (raw.role?.toUpperCase?.() ?? raw.role) as StaffMember['role'] };
  };

  const [user, setUser] = useState<StaffMember | null>(() => {
    const stored = authStorage.getUser();
    return stored ? normalizeUser(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = authStorage.getAccessToken();
      const cachedUser = authStorage.getUser();
      let success = false;

      if (token) {
        try {
          const me = await authApi.me(token);
          setUser(normalizeUser(me.user));
          authStorage.setUser(me.user);
          success = true;
        } catch (err) {
          // Rate limit / rede: mantém sessão local em vez de forçar logout
          if (
            err instanceof ApiError &&
            (err.statusCode === 0 ||
              err.code === 'NETWORK_ERROR' ||
              err.statusCode === 429 ||
              err.statusCode >= 500)
          ) {
            if (cachedUser) {
              setUser(normalizeUser(cachedUser));
              success = true;
            }
          }
          // Token inválido ou expirado → tentar refresh abaixo
        }
      }

      if (!success) {
        try {
          const resp = await authApi.refresh();
          authStorage.setTokens(resp.accessToken);
          authStorage.setUser(resp.user);
          setUser(normalizeUser(resp.user));
        } catch (err) {
          if (
            err instanceof ApiError &&
            (err.statusCode === 0 ||
              err.code === 'NETWORK_ERROR' ||
              err.statusCode === 429 ||
              err.statusCode >= 500) &&
            cachedUser
          ) {
            setUser(normalizeUser(cachedUser));
          } else {
            authStorage.clearTokens();
            authStorage.clearUser();
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    init();

    // Escuta evento disparado pelo apiClient quando refresh falha
    const onSessionExpired = () => {
      authStorage.clearTokens();
      authStorage.clearUser();
      setUser(null);
    };
    window.addEventListener('agendai:session-expired', onSessionExpired);
    return () => window.removeEventListener('agendai:session-expired', onSessionExpired);
  }, []);

  const persistSession = (resp: { user: any; accessToken: string; refreshToken?: string }) => {
    authStorage.setTokens(resp.accessToken);
    authStorage.setUser(resp.user);
    setUser(normalizeUser(resp.user));
    sessionStorage.removeItem('agendai:access-block-info');
  };

  const login = async (email: string, password: string, recaptchaToken?: string): Promise<AuthResult> => {
    try {
      const resp = await authApi.login(email, password, recaptchaToken);
      persistSession(resp);
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError && err.isAccessBlocked) {
        return { ok: false, message: getErrorMessage(err, err.message) };
      }
      return { ok: false, message: getErrorMessage(err, 'E-mail ou senha inválidos') };
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<AuthResult> => {
    try {
      const resp = await authApi.googleLogin(idToken);
      persistSession(resp);
      return { ok: true };
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.statusCode === 404 &&
        err.code === 'GOOGLE_ACCOUNT_NOT_FOUND'
      ) {
        return {
          ok: false,
          message: 'Conta não encontrada. Cadastre-se normalmente com e-mail e senha.',
        };
      }
      return { ok: false, message: getErrorMessage(err, 'Erro ao autenticar com Google.') };
    }
  };

  const register = async (data: RegisterPayload & { recaptchaToken?: string }): Promise<AuthResult> => {
    try {
      const resp = await authApi.register(data);
      persistSession(resp);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: getErrorMessage(err, 'Não foi possível criar sua conta. Tente novamente.'),
      };
    }
  };

  const logout = () => {
    authStorage.clearTokens();
    authStorage.clearUser();
    sessionStorage.removeItem('agendai:access-block-info');
    setUser(null);
  };

  const hasRole = (roles: StaffMember['role'][]) => {
    if (!user) return false;
    const normalizedUserRole = user.role.toUpperCase() as StaffMember['role'];
    const normalizedRoles = roles.map(r => r.toUpperCase());
    return normalizedRoles.includes(normalizedUserRole);
  };

  const value = useMemo(
    () => ({ user, loading, login, loginWithGoogle, register, logout, hasRole }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
