import { useCallback, useEffect, useRef, useState } from 'react';
import { barbershopApi } from '../infra/barbershopApi';

export type OnboardingStatus = Awaited<ReturnType<typeof barbershopApi.getOnboarding>>;

export function useOnboardingStatus(barbershopId: string | null | undefined) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loaded, setLoaded] = useState(false);
  const request = useRef(0);

  const load = useCallback(async () => {
    await Promise.resolve();
    const version = ++request.current;
    if (!barbershopId) {
      if (version === request.current) {
        setStatus(null);
        setLoaded(true);
      }
      return;
    }
    try {
      const data = await barbershopApi.getOnboarding(barbershopId);
      if (version === request.current) {
        setStatus(data);
        setLoaded(true);
      }
    } catch {
      if (version === request.current) {
        setStatus(null);
        setLoaded(true);
      }
    }
  }, [barbershopId]);

  const refresh = useCallback(() => load(), [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch de status inicial (mesmo padrão de OnboardingChecklist)
    void load();
    return () => {
      request.current = request.current + 1;
    };
  }, [load]);

  return {
    status,
    loaded,
    completed: status?.completed ?? false,
    welcomeSeen: status?.welcomeSeen ?? false,
    dismissed: status?.dismissed ?? false,
    refresh,
  };
}
