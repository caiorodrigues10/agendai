import React, { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, WifiOff, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PwaUpdatePrompt: React.FC = () => {
  const [online, setOnline] = useState(() => navigator.onLine);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      if (import.meta.env.DEV) console.error('Falha ao registrar PWA', error);
    },
  });

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const dismiss = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (online && !offlineReady && !needRefresh) return null;

  return (
    <aside
      className="fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[80] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-border bg-surface/95 p-3 text-text-primary shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:left-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {!online ? <WifiOff size={18} /> : needRefresh ? <RefreshCw size={18} /> : <CheckCircle2 size={18} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">
          {!online ? 'Você está offline' : needRefresh ? 'Nova versão disponível' : 'AgendAI pronto para uso offline'}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          {!online
            ? 'A interface abre, mas dados e ações do salão precisam de internet.'
            : needRefresh
              ? 'Atualize para receber as melhorias mais recentes.'
              : 'Os dados operacionais continuam protegidos e não são armazenados no cache.'}
        </p>
      </div>
      {needRefresh && online ? (
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="min-h-10 shrink-0 rounded-xl bg-accent px-3 text-xs font-bold text-accent-fg"
        >
          Atualizar
        </button>
      ) : (
        <button
          type="button"
          onClick={dismiss}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-text-muted hover:bg-surface-2 hover:text-text-primary"
          aria-label="Fechar aviso"
        >
          <X size={18} />
        </button>
      )}
    </aside>
  );
};
