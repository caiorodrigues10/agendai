import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authApi } from '../infra/authApi';
import { authStorage } from '../infra/authStorage';
import { StaffMember } from '../types';

interface AuthContextValue {
  user: StaffMember | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: StaffMember['role'][]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffMember | null>(authStorage.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = authStorage.getAccessToken();
      let success = false;

      if (token) {
        try {
          const me = await authApi.me(token);
          setUser(me.user as StaffMember);
          authStorage.setUser(me.user);
          success = true;
        } catch {
          // Token inválido ou expirado, tentar refresh abaixo
        }
      }

      if (!success) {
        const refreshToken = authStorage.getRefreshToken();
        if (refreshToken) {
          try {
            const resp = await authApi.refresh(refreshToken);
            authStorage.setTokens(resp.accessToken, resp.refreshToken);
            authStorage.setUser(resp.user);
            setUser(resp.user as StaffMember);
          } catch {
            authStorage.clearTokens();
            authStorage.clearUser();
            setUser(null);
          }
        } else {
          authStorage.clearTokens();
          authStorage.clearUser();
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const resp = await authApi.login(email, password);
      authStorage.setTokens(resp.accessToken, resp.refreshToken);
      authStorage.setUser(resp.user);
      setUser(resp.user as StaffMember);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    authStorage.clearTokens();
    authStorage.clearUser();
    setUser(null);
  };

  const hasRole = (roles: StaffMember['role'][]) => {
    if (!user) return false;
    const normalizedUserRole = user.role.toUpperCase() as StaffMember['role'];
    const normalizedRoles = roles.map(r => r.toUpperCase());
    return normalizedRoles.includes(normalizedUserRole);
  };

  const value = useMemo(() => ({ user, loading, login, logout, hasRole }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
