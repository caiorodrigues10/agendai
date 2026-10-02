import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'agendai:theme';
export const LEGACY_THEME_STORAGE_KEY = 'bq:theme';

interface ThemePreferenceValue {
  /** Preferência visual persistida. Não conhece sessão nem política de rota. */
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceValue | undefined>(undefined);

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
  if (legacy === 'light' || legacy === 'dark') {
    localStorage.setItem(THEME_STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    return legacy;
  }
  return 'dark';
};

/**
 * Provider visual puro: estado de tema + persistência (com migração da chave
 * legada `bq:theme`). Não aplica nada no documento e não consulta auth — a
 * política de tema fica em `contexts/ThemeContext`.
 */
export const ThemePreferenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
};

export const useThemePreference = () => {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  return ctx;
};
