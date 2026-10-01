import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Loader } from '../ui/Loader';

const RELOAD_FLAG = 'agendai:chunk-reload-once';

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|loading chunk|importing a module script failed|error loading dynamically|failed to fetch/i.test(
    message
  );
}

function flagValue(key: string): string | null {
  try {
    return sessionStorage.getItem(RELOAD_FLAG);
  } catch {
    // sem sessionStorage não há como lembrar do reload — tratado como "já recarregou"
    return key;
  }
}

function setFlag(key: string): boolean {
  try {
    sessionStorage.setItem(RELOAD_FLAG, key);
    return true;
  } catch {
    // sem sessionStorage não há como limitar o reload — não recarrega
    return false;
  }
}

function clearFlag(key: string): void {
  if (flagValue(key) !== key) return;
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    // ignora
  }
}

async function loadWithRecovery<M>(loader: () => Promise<M>, key: string): Promise<M> {
  try {
    const mod = await loader();
    clearFlag(key);
    return mod;
  } catch (error) {
    if (!isChunkLoadError(error)) throw error;

    try {
      const mod = await loader();
      clearFlag(key);
      return mod;
    } catch (retryError) {
      if (!isChunkLoadError(retryError)) throw retryError;
      if (flagValue(key) === key) throw retryError;
      if (!setFlag(key)) throw retryError;
      window.location.reload();
      return new Promise<M>(() => undefined);
    }
  }
}

/**
 * Painel carregado sob demanda: Suspense com o fallback já usado no app,
 * ErrorBoundary de seção e recuperação de chunk (1 retry + no máximo 1 reload).
 * O call site continua com as mesmas props do componente original.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyPanel<M extends Record<string, React.ComponentType<any>>, K extends keyof M & string>(
  loader: () => Promise<M>,
  key: K
): React.ComponentType<React.ComponentProps<M[K]>> {
  const Component = lazy(async (): Promise<{ default: React.ComponentType<React.ComponentProps<M[K]>> }> => {
    const mod = await loadWithRecovery(loader, String(key));
    return { default: mod[key] };
  });

  const LazyPainel: React.FC<React.ComponentProps<M[K]>> = props => (
    <ErrorBoundary variant="section">
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );

  LazyPainel.displayName = `LazyPanel(${String(key)})`;
  return LazyPainel;
}
