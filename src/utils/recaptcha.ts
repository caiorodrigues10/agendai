import { useEffect } from 'react';
import { logger } from './logger';
import { runWhenIdle } from './idle';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
const BADGE_CLASS = 'recaptcha-visible';
const EXECUTE_TIMEOUT_MS = 10000;

/** Mensagem clara (PT) quando o token não pôde ser obtido. */
export const RECAPTCHA_ERROR_MESSAGE =
  'Não foi possível validar a proteção antiabuso. Tente novamente.';

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
    script.onerror = () => {
      // Limpa a promessa para que uma nova tentativa (retry) possa reinjetar o
      // script — antes, a promessa rejeitada ficava presa e todo retry falhava.
      scriptPromise = null;
      script.remove();
      reject(new Error('Failed to load reCAPTCHA'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      value => {
        window.clearTimeout(timer);
        resolve(value);
      },
      err => {
        window.clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(message));
      },
    );
  });
}

/**
 * Obtém o token do reCAPTCHA v3 para a ação informada.
 *
 * - Sem `VITE_RECAPTCHA_SITE_KEY` (dev local): retorna `''` (caminho inerte).
 * - Com a key: **lança** `RECAPTCHA_ERROR_MESSAGE` em qualquer falha (script
 *   não carrega, `grecaptcha` indisponível, token vazio ou timeout) — antes
 *   retornava `''` e o formulário enviava a requisição SEM token, o que o
 *   backend rejeita em produção com 400 genérico.
 */
export async function getRecaptchaToken(action: string): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) return '';
  try {
    await loadScript();
    const grecaptcha = (window as { grecaptcha?: { execute?: unknown } }).grecaptcha;
    if (!grecaptcha || typeof grecaptcha.execute !== 'function') {
      throw new Error('grecaptcha indisponível');
    }
    const token = await withTimeout(
      Promise.resolve(grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })),
      EXECUTE_TIMEOUT_MS,
      'timeout em grecaptcha.execute',
    );
    if (typeof token !== 'string' || !token) {
      throw new Error('token vazio');
    }
    return token;
  } catch (err) {
    logger.warn('reCAPTCHA error:', err);
    throw new Error(RECAPTCHA_ERROR_MESSAGE);
  }
}

/**
 * Carrega o script e mostra o badge enquanto a página de login estiver montada.
 * O download fica adiado para a primeira interação (pointerdown/focusin) ou para
 * um idle após o `load` — assim api.js não disputa banda com LCP. O token
 * (`getRecaptchaToken`) continua carregando sob demanda no submit.
 *
 * O idle usa `runWhenIdle` (src/utils/idle.ts): `requestIdleCallback` onde
 * existe e `setTimeout(3000)` no Safari/WebKit, que não implementa a API.
 */
export function useRecaptchaBadge(): void {
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    let cancelled = false;
    let started = false;
    let idleTask: { cancel: () => void } | null = null;

    const show = () => {
      if (cancelled || started) return;
      started = true;
      void loadScript()
        .then(() => {
          if (!cancelled) document.body.classList.add(BADGE_CLASS);
        })
        .catch(err => logger.warn('reCAPTCHA badge error:', err));
    };

    const onInteraction = () => {
      document.removeEventListener('pointerdown', onInteraction, true);
      document.removeEventListener('focusin', onInteraction, true);
      window.removeEventListener('load', onIdleFallback);
      idleTask?.cancel();
      show();
    };

    const onIdleFallback = () => {
      idleTask = runWhenIdle(show, { timeout: 5000, delay: 3000 });
    };

    document.addEventListener('pointerdown', onInteraction, true);
    document.addEventListener('focusin', onInteraction, true);
    if (document.readyState === 'complete') onIdleFallback();
    else window.addEventListener('load', onIdleFallback, { once: true });

    return () => {
      cancelled = true;
      idleTask?.cancel();
      document.removeEventListener('pointerdown', onInteraction, true);
      document.removeEventListener('focusin', onInteraction, true);
      window.removeEventListener('load', onIdleFallback);
      document.body.classList.remove(BADGE_CLASS);
    };
  }, []);
}
