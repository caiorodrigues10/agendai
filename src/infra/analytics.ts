import { cookieConsentStorage } from '../utils/cookieConsentStorage';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; callMethod?: (...args: unknown[]) => void };
    _fbq?: Window['fbq'];
  }
}

type TrackParams = Record<string, string | number | boolean | undefined>;
type MetaPixelFunction = NonNullable<Window['fbq']>;

function measurementId() {
  return import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || '';
}

function metaPixelId() {
  return import.meta.env.VITE_META_PIXEL_ID?.trim() || '';
}

function googleAdsId() {
  return import.meta.env.VITE_GOOGLE_ADS_ID?.trim() || '';
}

function adsSignupLabel() {
  return import.meta.env.VITE_GOOGLE_ADS_SIGNUP_LABEL?.trim() || '';
}

function adsPurchaseLabel() {
  return import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL?.trim() || '';
}

let initialized = false;

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initGtag() {
  const ga = measurementId();
  const ads = googleAdsId();
  if (!ga && !ads) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  window.gtag('js', new Date());
  if (ga) window.gtag('config', ga, { anonymize_ip: true, send_page_view: false });
  if (ads) window.gtag('config', ads, { send_page_view: false });

  loadScript(`https://www.googletagmanager.com/gtag/js?id=${ga || ads}`, 'agendai-gtag');
}

function initMetaPixel() {
  const pixelId = metaPixelId();
  if (!pixelId || window.fbq) return;

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      (fbq.queue = fbq.queue || []).push(args);
    }
  }) as MetaPixelFunction;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';
  window.fbq = fbq;
  window._fbq = fbq;
  loadScript('https://connect.facebook.net/en_US/fbevents.js', 'agendai-fbpixel');
  window.fbq('init', pixelId);
}

export function initAnalytics(): void {
  if (initialized || !cookieConsentStorage.allowsAnalytics()) return;
  if (typeof window === 'undefined') return;
  initGtag();
  initMetaPixel();
  initialized = true;
}

/**
 * Remove o parâmetro `token` de um path/URL relativa antes de enviar ao
 * analytics — defesa em profundidade: o entrypoint já tira o ?token= da URL
 * antes de qualquer init, mas o page_path nunca deve carregar o valor.
 */
function stripTokenParam(path: string): string {
  if (!path.includes('token=')) return path;
  const qIndex = path.indexOf('?');
  if (qIndex === -1) return path;
  const pathname = path.slice(0, qIndex);
  const params = new URLSearchParams(path.slice(qIndex + 1));
  params.delete('token');
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function trackPageView(path: string, title?: string): void {
  if (!cookieConsentStorage.allowsAnalytics()) return;
  initAnalytics();
  window.gtag?.('event', 'page_view', { page_path: stripTokenParam(path), page_title: title });
  window.fbq?.('track', 'PageView');
}

export function trackEvent(name: string, params: TrackParams = {}): void {
  if (!cookieConsentStorage.allowsAnalytics()) return;
  initAnalytics();
  window.gtag?.('event', name, params);
}

export function trackSignUp(): void {
  trackEvent('sign_up', { method: 'email' });
  window.fbq?.('track', 'CompleteRegistration');
  const ads = googleAdsId();
  const label = adsSignupLabel();
  if (ads && label) {
    window.gtag?.('event', 'conversion', { send_to: `${ads}/${label}` });
  }
}

export function trackBeginCheckout(value?: number): void {
  trackEvent('begin_checkout', { currency: 'BRL', value });
  window.fbq?.('track', 'InitiateCheckout', { currency: 'BRL', value });
}

export function trackPurchase(value?: number, transactionId?: string): void {
  trackEvent('purchase', { currency: 'BRL', value, transaction_id: transactionId });
  window.fbq?.('track', 'Purchase', { currency: 'BRL', value });
  const ads = googleAdsId();
  const label = adsPurchaseLabel();
  if (ads && label) {
    window.gtag?.('event', 'conversion', { send_to: `${ads}/${label}`, value, currency: 'BRL', transaction_id: transactionId });
  }
}
