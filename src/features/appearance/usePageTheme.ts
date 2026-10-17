import { useCallback, useEffect, useState } from 'react';
import { pageThemeApi, type PageTheme } from '../../infra/pageThemeApi';

interface ThemeState {
  loading: boolean;
  theme: PageTheme | null;
}

/**
 * Cache por salão em memória de módulo: evita re-fetch (e flash do tema
 * padrão) quando o usuário troca de aba na página pública ou volta do back.
 * `data: null` do back = salão sem tema = visual padrão do app (zero regressão).
 */
const cache = new Map<string, PageTheme | null>();
const inflight = new Map<string, Promise<PageTheme | null>>();

export function getCachedPageTheme(barbershopId: string): PageTheme | null | undefined {
  return cache.has(barbershopId) ? cache.get(barbershopId) : undefined;
}

/** Atualiza o cache (ex.: após Salvar no painel) sem esperar o Cache-Control do back. */
export function setCachedPageTheme(barbershopId: string, theme: PageTheme | null): void {
  cache.set(barbershopId, theme);
}

/** Uso interno/testes: limpa o cache em memória por salão. */
export function clearPageThemeCache(barbershopId?: string): void {
  if (barbershopId) {
    cache.delete(barbershopId);
    inflight.delete(barbershopId);
    return;
  }
  cache.clear();
  inflight.clear();
}

function fetchTheme(barbershopId: string): Promise<PageTheme | null> {
  const existing = inflight.get(barbershopId);
  if (existing) return existing;
  const promise = pageThemeApi
    .getPublic(barbershopId)
    .then(theme => {
      cache.set(barbershopId, theme);
      return theme;
    })
    .catch(() => null)
    .finally(() => inflight.delete(barbershopId));
  inflight.set(barbershopId, promise);
  return promise;
}

function initialState(barbershopId: string | null | undefined): ThemeState {
  const cached = barbershopId ? getCachedPageTheme(barbershopId) : undefined;
  return {
    loading: Boolean(barbershopId) && cached === undefined,
    theme: cached ?? null,
  };
}

export function usePageTheme(barbershopId: string | null | undefined) {
  const [state, setState] = useState<ThemeState>(() => initialState(barbershopId));
  const [prevId, setPrevId] = useState(barbershopId);

  // Troca de salão: reseta o estado derivado do cache durante o render
  // (padrão "adjusting state when props change", sem efeito cascata).
  if (prevId !== barbershopId) {
    setPrevId(barbershopId);
    setState(initialState(barbershopId));
  }

  useEffect(() => {
    if (!barbershopId) return;
    if (getCachedPageTheme(barbershopId) !== undefined) return;
    let active = true;
    fetchTheme(barbershopId).then(theme => {
      if (active) setState({ loading: false, theme });
    });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  const applyTheme = useCallback(
    (theme: PageTheme | null) => {
      if (barbershopId) setCachedPageTheme(barbershopId, theme);
      setState({ loading: false, theme });
    },
    [barbershopId]
  );

  return { loading: state.loading, theme: state.theme, applyTheme };
}
