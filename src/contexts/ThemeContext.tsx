import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useAuthOptional } from './AuthContext';
import { Theme, ThemePreferenceProvider, useThemePreference } from './theme/ThemePreferenceContext';

export type { Theme };

interface ThemeContextValue {
  theme: Theme;
  /** Tema efetivo no documento: preferência só vale com sessão; público fica dark. */
  resolvedTheme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyDocumentTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  root.style.backgroundColor = theme === 'dark' ? '#0a0a0a' : '#eef2f0';
}

/**
 * Política visual: marketing / login / público = dark; painel logado =
 * preferência do usuário. Camada separada do ThemePreferenceProvider, que só
 * conhece a preferência persistida e não depende de sessão.
 */
const ThemePolicyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme, setTheme, toggleTheme } = useThemePreference();
  const auth = useAuthOptional();

  const resolvedTheme: Theme = auth?.user ? theme : 'dark';

  useEffect(() => {
    applyDocumentTheme(resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ThemePreferenceProvider>
    <ThemePolicyProvider>{children}</ThemePolicyProvider>
  </ThemePreferenceProvider>
);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
