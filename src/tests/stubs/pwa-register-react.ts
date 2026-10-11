/// <reference types="vitest/globals" />
import { useState } from 'react';

export const swStub = { offlineReady: true, needRefresh: false };

interface RegisterSWResult {
  offlineReady: [boolean, (v: boolean) => void];
  needRefresh: [boolean, (v: boolean) => void];
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

export function useRegisterSW(_options?: { onRegisterError?: (error: Error) => void }): RegisterSWResult {
  const [offlineReady, setOfflineReady] = useState(swStub.offlineReady);
  const [needRefresh, setNeedRefresh] = useState(swStub.needRefresh);
  return {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker: () => Promise.resolve(),
  };
}
