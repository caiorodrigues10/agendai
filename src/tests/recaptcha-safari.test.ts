/**
 * Contrato Safari/WebKit do reCAPTCHA (ITEM 1):
 * - sem `requestIdleCallback`, o badge ainda é agendado (fallback setTimeout);
 * - `getRecaptchaToken` LANÇA em falha quando há site key (não envia sem token);
 * - falha de carga do script permite retry (scriptPromise é resetada);
 * - timeout no `grecaptcha.execute` (página não fica travada no submit).
 */
const SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
const BADGE_CLASS = 'recaptcha-visible';

type IdleWindow = Window & { requestIdleCallback?: unknown; cancelIdleCallback?: unknown };
const w = window as IdleWindow;
const originalRIC = w.requestIdleCallback;
const originalCIC = w.cancelIdleCallback;

function recaptchaScripts(): HTMLScriptElement[] {
  return [...document.querySelectorAll<HTMLScriptElement>('script[src*="recaptcha/api.js"]')];
}

function clearScripts(): void {
  recaptchaScripts().forEach(s => s.remove());
}

async function importRecaptcha() {
  vi.resetModules();
  return import('../utils/recaptcha');
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', SITE_KEY);
  clearScripts();
  delete (window as { grecaptcha?: unknown }).grecaptcha;
  Object.defineProperty(w, 'requestIdleCallback', { value: undefined, configurable: true, writable: true });
  Object.defineProperty(w, 'cancelIdleCallback', { value: undefined, configurable: true, writable: true });
  Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
  document.body.className = '';
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  clearScripts();
  delete (window as { grecaptcha?: unknown }).grecaptcha;
  if (originalRIC) Object.defineProperty(w, 'requestIdleCallback', { value: originalRIC, configurable: true, writable: true });
  if (originalCIC) Object.defineProperty(w, 'cancelIdleCallback', { value: originalCIC, configurable: true, writable: true });
  document.body.className = '';
});

describe('getRecaptchaToken — Safari (sem requestIdleCallback)', () => {
  it('sem VITE_RECAPTCHA_SITE_KEY retorna "" (caminho inerte local)', async () => {
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', '');
    const { getRecaptchaToken } = await importRecaptcha();
    await expect(getRecaptchaToken('login')).resolves.toBe('');
    expect(recaptchaScripts()).toHaveLength(0);
  });

  it('com site key: carrega o script e devolve o token de execute', async () => {
    const { getRecaptchaToken } = await importRecaptcha();
    const execute = vi.fn().mockResolvedValue('tok-abc');
    (window as { grecaptcha?: unknown }).grecaptcha = { execute };

    const pending = getRecaptchaToken('login');
    const [script] = recaptchaScripts();
    expect(script).toBeTruthy();
    script.dispatchEvent(new Event('load'));

    await expect(pending).resolves.toBe('tok-abc');
    expect(execute).toHaveBeenCalledWith(SITE_KEY, { action: 'login' });
  });

  it('falha ao carregar o script LANÇA erro claro (antes retornava "" e enviava sem token)', async () => {
    const { getRecaptchaToken, RECAPTCHA_ERROR_MESSAGE } = await importRecaptcha();

    const pending = getRecaptchaToken('login');
    recaptchaScripts()[0].dispatchEvent(new Event('error'));

    await expect(pending).rejects.toThrow(RECAPTCHA_ERROR_MESSAGE);
  });

  it('após falha de carga, uma nova chamada re-injeta o script (retry funciona)', async () => {
    const { getRecaptchaToken } = await importRecaptcha();

    const first = getRecaptchaToken('login');
    recaptchaScripts()[0].dispatchEvent(new Event('error'));
    await expect(first).rejects.toThrow();
    expect(recaptchaScripts()).toHaveLength(0); // removido no onerror

    const execute = vi.fn().mockResolvedValue('tok-retry');
    (window as { grecaptcha?: unknown }).grecaptcha = { execute };

    const second = getRecaptchaToken('login');
    const [retryScript] = recaptchaScripts();
    expect(retryScript).toBeTruthy();
    retryScript.dispatchEvent(new Event('load'));

    await expect(second).resolves.toBe('tok-retry');
  });

  it('grecaptcha.execute rejeitando lança erro claro', async () => {
    const { getRecaptchaToken, RECAPTCHA_ERROR_MESSAGE } = await importRecaptcha();
    (window as { grecaptcha?: unknown }).grecaptcha = {
      execute: vi.fn().mockRejectedValue(new Error('blocked')),
    };

    const pending = getRecaptchaToken('login');
    recaptchaScripts()[0].dispatchEvent(new Event('load'));

    await expect(pending).rejects.toThrow(RECAPTCHA_ERROR_MESSAGE);
  });

  it('token vazio lança erro claro', async () => {
    const { getRecaptchaToken, RECAPTCHA_ERROR_MESSAGE } = await importRecaptcha();
    (window as { grecaptcha?: unknown }).grecaptcha = { execute: vi.fn().mockResolvedValue('') };

    const pending = getRecaptchaToken('login');
    recaptchaScripts()[0].dispatchEvent(new Event('load'));

    await expect(pending).rejects.toThrow(RECAPTCHA_ERROR_MESSAGE);
  });

  it('execute que nunca resolve é interrompido pelo timeout de 10 s (não trava o submit)', async () => {
    vi.useFakeTimers();
    const { getRecaptchaToken, RECAPTCHA_ERROR_MESSAGE } = await importRecaptcha();
    (window as { grecaptcha?: unknown }).grecaptcha = { execute: vi.fn().mockReturnValue(new Promise(() => undefined)) };

    const pending = getRecaptchaToken('login');
    recaptchaScripts()[0].dispatchEvent(new Event('load'));

    const assertion = expect(pending).rejects.toThrow(RECAPTCHA_ERROR_MESSAGE);
    await vi.advanceTimersByTimeAsync(10000);
    await assertion;
  });
});

describe('useRecaptchaBadge — Safari (fallback setTimeout)', () => {
  it('agenda o load do badge via setTimeout(3000) quando não há requestIdleCallback', async () => {
    vi.useFakeTimers();
    const { useRecaptchaBadge } = await importRecaptcha();
    const { renderHook, act } = await import('@testing-library/react');

    renderHook(() => useRecaptchaBadge());
    expect(recaptchaScripts()).toHaveLength(0); // adiado

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(recaptchaScripts()).toHaveLength(1);

    await act(async () => {
      recaptchaScripts()[0].dispatchEvent(new Event('load'));
    });
    expect(document.body.classList.contains(BADGE_CLASS)).toBe(true);
  });

  it('com requestIdleCallback usa a API em vez do setTimeout', async () => {
    const ric = vi.fn();
    Object.defineProperty(w, 'requestIdleCallback', { value: ric, configurable: true, writable: true });
    const { useRecaptchaBadge } = await importRecaptcha();
    const { renderHook } = await import('@testing-library/react');

    renderHook(() => useRecaptchaBadge());
    expect(ric).toHaveBeenCalledTimes(1);
    expect(ric.mock.calls[0][1]).toEqual({ timeout: 5000 });
  });

  it('unmount cancela o idle adiado (badge não aparece depois)', async () => {
    vi.useFakeTimers();
    const { useRecaptchaBadge } = await importRecaptcha();
    const { renderHook, act } = await import('@testing-library/react');

    const { unmount } = renderHook(() => useRecaptchaBadge());
    unmount();
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });
    expect(recaptchaScripts()).toHaveLength(0);
  });

  it('falha na carga do script não adiciona o badge nem deixa rejeição pendurada', async () => {
    vi.useFakeTimers();
    const { useRecaptchaBadge } = await importRecaptcha();
    const { renderHook, act } = await import('@testing-library/react');

    renderHook(() => useRecaptchaBadge());
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    await act(async () => {
      recaptchaScripts()[0].dispatchEvent(new Event('error'));
      await Promise.resolve();
    });
    expect(document.body.classList.contains(BADGE_CLASS)).toBe(false);
  });
});
