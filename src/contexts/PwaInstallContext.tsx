import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaInstallContextValue {
  canInstall: boolean;
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  installing: boolean;
  isInstalled: boolean;
  isIos: boolean;
  isMobile: boolean;
}

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

function isStandaloneDisplay() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  const standaloneMedia = window.matchMedia?.('(display-mode: standalone)');
  return (
    Boolean(standaloneMedia?.matches) ||
    navigatorWithStandalone.standalone === true
  );
}

export const PwaInstallProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneDisplay());
  const [installing, setInstalling] = useState(false);

  const userAgent = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(userAgent);
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  useEffect(() => {
    const displayMode = window.matchMedia?.('(display-mode: standalone)');

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    const handleDisplayModeChange = () => setIsInstalled(isStandaloneDisplay());

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    displayMode?.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      displayMode?.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt || isInstalled) return 'unavailable' as const;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice.outcome === 'accepted') setIsInstalled(true);
      return choice.outcome;
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt, isInstalled]);

  const value = useMemo<PwaInstallContextValue>(
    () => ({
      canInstall: Boolean(deferredPrompt) && !isInstalled,
      install,
      installing,
      isInstalled,
      isIos,
      isMobile,
    }),
    [deferredPrompt, install, installing, isInstalled, isIos, isMobile]
  );

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
};

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (!context) throw new Error('usePwaInstall must be used within PwaInstallProvider');
  return context;
}
