const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

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
    console.warn('reCAPTCHA error:', err);
    return '';
  }
}
