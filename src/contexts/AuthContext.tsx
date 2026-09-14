import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authApi, RegisterPayload } from '../infra/authApi';
import { authStorage } from '../infra/authStorage';
import { ApiError, refreshAccessToken } from '../infra/apiClient';
import { getErrorMessage } from '../utils/errorMessage';
import { StaffMember } from '../types';
import { usersApi } from '../infra/usersApi';

export type AuthResult = { ok: true } | { ok: false; message: string };

interface AuthContextValue {
  user: StaffMember | null;
  loading: boolean;
  login: (email: string, password: string, recaptchaToken?: string, rememberMe?: boolean) => Promise<AuthResult>;
  loginWithGoogle: (idToken: string) => Promise<AuthResult>;
  register: (data: RegisterPayload & { recaptchaToken?: string }) => Promise<AuthResult>;
  logout: () => void;
  hasRole: (roles: StaffMember['role'][]) => boolean;
  updateUserAvatar: (avatarUrl: string | null) => void;
  updateUserProfile: (payload: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
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
    let cancelled = false;
    const revision = authStorage.getRevision();
    const isCurrent = () => !cancelled && revision === authStorage.getRevision();
    const init = async () => {
      const token = authStorage.getAccessToken();
      const cachedUser = authStorage.getUser();
      let success = false;

      if (token) {
        try {
          const me = await authApi.me(token);
          if (!isCurrent()) return;
          setUser(normalizeUser(me.user));
          authStorage.setUser(me.user, authStorage.isPersistent());
          success = true;
        } catch (err) {
          if (!isCurrent()) return;
          // Erros de rede / rate limit / backend indisponível: mantém sessão
          // local em vez de forçar logout — evita expulsar o usuário por
          // instabilidade temporária.
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
          // 401 / token expirado → fluxo de refresh abaixo
        }
      }

      if (!success) {
        const refreshToken = authStorage.getRefreshToken();
        if (refreshToken || cachedUser) {
          try {
            const refreshed = await refreshAccessToken();
            if (!isCurrent()) return;
            const refreshedUser = authStorage.getUser();
            setUser(refreshed && refreshedUser ? normalizeUser(refreshedUser) : null);
          } catch (err) {
            if (!isCurrent()) return;
            if (
              err instanceof ApiError &&
              (err.statusCode === 0 ||
                err.code === 'NETWORK_ERROR' ||
                err.statusCode === 429 ||
                err.statusCode >= 500) &&
              cachedUser
            ) {
              // Rede indisponível: mantém sessão local; o próximo request
              // tentará refresh novamente.
              setUser(normalizeUser(cachedUser));
            } else {
              authStorage.clearTokens();
              authStorage.clearUser();
              setUser(null);
            }
          }
        } else {
          authStorage.clearTokens();
          authStorage.clearUser();
          setUser(null);
        }
      }
      setLoading(false);
    };
    void init().finally(() => { if (!cancelled) setLoading(false); });

    // Refresh periódico: renova o access token a cada 14 minutos para
    // evitar que a sessão expire durante uso ativo do painel.
    const REFRESH_INTERVAL_MS = 14 * 60 * 1000;
    const periodicRefresh = setInterval(() => {
      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken && !authStorage.hasStoredSession()) return;
      void refreshAccessToken().catch(() => {
        // Falha silenciosa: o próximo 401 acionará refresh via apiClient
      });
    }, REFRESH_INTERVAL_MS);

    // Escuta evento disparado pelo apiClient quando refresh falha
    const onSessionExpired = () => {
      authStorage.clearTokens();
      authStorage.clearUser();
      setUser(null);
    };
    window.addEventListener('agendai:session-expired', onSessionExpired);
    return () => {
      cancelled = true;
      window.removeEventListener('agendai:session-expired', onSessionExpired);
      clearInterval(periodicRefresh);
    };
  }, []);

  const persistSession = (resp: { user: any; accessToken: string; refreshToken?: string }, rememberMe?: boolean) => {
    const effectiveRememberMe = rememberMe ?? authStorage.getRememberMe();
    authStorage.setTokens(resp.accessToken, resp.refreshToken, effectiveRememberMe);
    authStorage.setUser(resp.user, effectiveRememberMe);
    authStorage.setRememberMe(effectiveRememberMe);
    setUser(normalizeUser(resp.user));
    sessionStorage.removeItem('agendai:access-block-info');
  };

  const login = async (email: string, password: string, recaptchaToken?: string, rememberMe = true): Promise<AuthResult> => {
    try {
      const resp = await authApi.login(email, password, recaptchaToken, rememberMe);
      persistSession(resp, rememberMe);
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
      persistSession(resp, true);
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
      persistSession(resp, true);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: getErrorMessage(err, 'Não foi possível criar sua conta. Tente novamente.'),
      };
    }
  };

  const logout = () => {
    const token = authStorage.getAccessToken();
    if (token) {
      // A limpeza local não depende da rede, mas o backend deve receber a
      // tentativa para invalidar refresh tokens e encerrar a sessão de fato.
      void authApi.logout(token).catch(() => undefined);
    }
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

  const updateUserAvatar = useCallback((avatarUrl: string | null) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatarUrl };
      authStorage.setUser(updated as any, authStorage.isPersistent());
      return updated;
    });
  }, []);

  const updateUserProfile = useCallback(async (payload: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => {
    const updated = await usersApi.updateMe(payload);
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updated } as StaffMember;
      authStorage.setUser(next as any, authStorage.isPersistent());
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, loginWithGoogle, register, logout, hasRole, updateUserAvatar, updateUserProfile }),
    [user, loading, updateUserAvatar, updateUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
