import { useEffect } from 'react';
import { logger } from './logger';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
const BADGE_CLASS = 'recaptcha-visible';

let scriptLoaded = false;
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (!RECAPTCHA_SITE_KEY) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export async function getRecaptchaToken(action: string): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) return '';
  try {
    await loadScript();
    const grecaptcha = (window as any).grecaptcha;
    if (!grecaptcha) return '';
    return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
  } catch (err) {
    logger.warn('reCAPTCHA error:', err);
    return '';
  }
}

/**
 * Carrega o script e mostra o badge enquanto a página de login estiver montada.
 * O download fica adiado para a primeira interação (pointerdown/focusin) ou para
 * um idle após o `load` — assim api.js não disputa banda com LCP. O token
 * (`getRecaptchaToken`) continua carregando sob demanda no submit.
 */
export function useRecaptchaBadge(): void {
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    let cancelled = false;
    let started = false;

    const show = () => {
      if (cancelled || started) return;
      started = true;
      void loadScript().then(() => {
        if (!cancelled) document.body.classList.add(BADGE_CLASS);
      });
    };

    const onInteraction = () => {
      document.removeEventListener('pointerdown', onInteraction, true);
      document.removeEventListener('focusin', onInteraction, true);
      window.removeEventListener('load', onIdleFallback);
      show();
    };

    const onIdleFallback = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(show, { timeout: 5000 });
      else window.setTimeout(show, 3000);
    };

    document.addEventListener('pointerdown', onInteraction, true);
    document.addEventListener('focusin', onInteraction, true);
    if (document.readyState === 'complete') onIdleFallback();
    else window.addEventListener('load', onIdleFallback, { once: true });

    return () => {
      cancelled = true;
      document.removeEventListener('pointerdown', onInteraction, true);
      document.removeEventListener('focusin', onInteraction, true);
      window.removeEventListener('load', onIdleFallback);
      document.body.classList.remove(BADGE_CLASS);
    };
  }, []);
}
