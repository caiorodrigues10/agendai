import { API_BASE } from './apiClient';

/**
 * Public pages that may be reported, as **literal** route patterns.
 *
 * Privacy rule (non-negotiable): every entry is a static path that exists in
 * `src/app/App.tsx`. There is no slug, id, token, query or fragment here — a
 * literal path carries no identifier, so nothing identifying can leak.
 *
 * Scope: the landing page, the marketing pages and the commercial-intention
 * pages (pricing + the "software para …" landing pages). The logged area
 * (`/app`, `/master`, `/minha-conta`) and the checkout are deliberately out.
 */
export const TRAFFIC_BEACON_LITERAL_ROUTES = [
  // Landing.
  '/',
  // Marketing.
  '/funcionalidades',
  '/ia-preditiva',
  '/agendamento',
  '/dashboard',
  '/sobre',
  '/contato',
  '/privacidade',
  '/termos',
  // Comercial.
  '/planos',
  '/software-para-salao-de-beleza',
  '/sistema-para-salao-de-beleza',
  '/sistema-para-barbearia',
  '/app-para-agendamento-de-salao',
  '/sistema-para-fila-de-barbearia',
  '/sistema-para-manicure',
  '/sistema-para-lash-designer',
  '/crm-para-salao-de-beleza',
  '/controle-financeiro-para-salao',
  '/software-para-escritorio-de-advocacia',
  // Recuperação de senha (página pública de entrada).
  '/esqueci-senha',
] as const;

/**
 * Route families: the concrete slug/token is dropped and only the family
 * pattern is sent, so no identifier ever reaches the beacon.
 */
export type TrafficBeaconRouteFamily = '/s/:slug' | '/agendamento/:token';

export type TrafficBeaconRoute =
  | (typeof TRAFFIC_BEACON_LITERAL_ROUTES)[number]
  | TrafficBeaconRouteFamily;

export interface TrafficBeaconPayload {
  /** A literal route pattern. Never the concrete slug or token from the URL. */
  p: TrafficBeaconRoute;
  /** Only the hostname of document.referrer, when it is a valid URL. */
  r?: string;
}

/**
 * The values that can turn the beacon on are deliberately small and explicit.
 * An unset value is disabled, which keeps the feature off unless it is
 * configured for a production deployment.
 */
const ENABLED_VALUES = new Set(['true', '1', 'on', 'yes']);

/** Hostname labels that clearly identify a non-production/demo environment. */
const NON_PRODUCTION_HOST_LABELS = new Set([
  'demo',
  'dev',
  'development',
  'local',
  'localhost',
  'test',
  'testing',
]);

export interface TrafficBeaconEnvironmentOptions {
  /** Value of VITE_TRAFFIC_BEACON_ENABLED. */
  enabled?: string;
  /** Build mode (Vite's import.meta.env.MODE). */
  mode?: string;
  /** Current browser hostname, without a port. */
  hostname?: string;
  /** navigator.doNotTrack. */
  doNotTrack?: string | null;
  /** window.doNotTrack, when the browser exposes it on window. */
  windowDoNotTrack?: string | null;
  /** navigator.globalPrivacyControl. */
  globalPrivacyControl?: boolean;
}

export interface TrafficBeaconNavigator {
  sendBeacon?: (url: string, data?: BodyInit | null) => boolean;
}

export interface TrafficBeaconSendOptions {
  /** Injectable environment used to keep the decision logic pure/testable. */
  environment?: TrafficBeaconEnvironmentOptions;
  /** Defaults to window.location.pathname. */
  pathname?: string;
  /** Defaults to document.referrer. */
  referrer?: string;
  /** Injectable navigator, primarily for tests and non-browser callers. */
  navigator?: TrafficBeaconNavigator;
  /** Injectable fetch, primarily for tests. */
  fetch?: typeof fetch;
}

const normalized = (value: string | undefined): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const isEnabledValue = (value: string | undefined): boolean =>
  ENABLED_VALUES.has(normalized(value));

const isDoNotTrackEnabled = (value: string | null | undefined): boolean => value === '1';

const isNonProductionHostname = (hostname: string | undefined): boolean => {
  const value = normalized(hostname).replace(/\.$/, '');
  if (!value) return false;

  // Hostnames normally do not include a port, but accepting one here makes
  // the guard safe for injected test values as well.
  const hasIpv6Colons = value.indexOf(':') !== value.lastIndexOf(':');
  const host = value.startsWith('[') || hasIpv6Colons ? value : value.replace(/:\d+$/, '');
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '[::1]'
  ) {
    return true;
  }

  return host.split(/[.\-_]/).some(label => NON_PRODUCTION_HOST_LABELS.has(label));
};

/**
 * Reads the browser/build signals used by the beacon. Keeping this separate
 * from the pure decision function makes the privacy rules easy to test.
 */
export function getTrafficBeaconEnvironment(): TrafficBeaconEnvironmentOptions {
  const browserNavigator =
    typeof navigator === 'undefined'
      ? undefined
      : (navigator as Navigator & { globalPrivacyControl?: boolean });
  const browserWindow =
    typeof window === 'undefined' ? undefined : (window as Window & { doNotTrack?: string | null });

  return {
    enabled: import.meta.env.VITE_TRAFFIC_BEACON_ENABLED,
    mode: import.meta.env.MODE,
    hostname: browserWindow?.location.hostname,
    doNotTrack: browserNavigator?.doNotTrack ?? null,
    windowDoNotTrack: browserWindow?.doNotTrack ?? null,
    globalPrivacyControl: browserNavigator?.globalPrivacyControl === true,
  };
}

/**
 * Returns whether the beacon is allowed by build, environment, and privacy
 * signals. This function is deliberately pure: callers can inject all
 * environment values and test the decision without touching the network.
 */
export function isTrafficBeaconEnabled(options: TrafficBeaconEnvironmentOptions = {}): boolean {
  if (!isEnabledValue(options.enabled)) return false;

  // Production is the only allowed build mode. This also excludes dev, test,
  // demo, and any other mode that is not explicitly production.
  if (normalized(options.mode) !== 'production') return false;

  if (isNonProductionHostname(options.hostname)) return false;

  // DNT is an opt-out signal on either navigator or window. GPC is an
  // explicit opt-out signal on navigator.
  if (
    isDoNotTrackEnabled(options.doNotTrack) ||
    isDoNotTrackEnabled(options.windowDoNotTrack) ||
    options.globalPrivacyControl === true
  ) {
    return false;
  }

  return true;
}

/** Alias with a decision-oriented name for callers that prefer it. */
export const isTrafficBeaconAllowed = isTrafficBeaconEnabled;

/** Literal public routes, kept in a Set for an exact-path lookup. */
const LITERAL_ROUTE_SET = new Set<string>(TRAFFIC_BEACON_LITERAL_ROUTES);

/**
 * Maps a concrete pathname to one of the literal patterns that may be sent.
 *
 * Only two shapes are allowed:
 *
 * 1. **Literal** — the path matches a public page exactly (landing, marketing
 *    and commercial-intention pages). The literal itself carries no
 *    identifier, so it is safe to send.
 * 2. **Family** — the path has a dynamic segment (`/s/:slug`,
 *    `/agendamento/:token`). The concrete value is dropped and only the
 *    family pattern is returned.
 *
 * Query strings and fragments are ignored even if a caller supplies a
 * combined path by mistake. The logged area (`/app`, `/master`,
 * `/minha-conta`), the checkout and any unknown page return `null`: they are
 * never counted.
 */
export function getTrafficBeaconRoute(pathname: string): TrafficBeaconRoute | null {
  if (typeof pathname !== 'string' || pathname.length === 0) return null;

  const path = pathname.split(/[?#]/, 1)[0];
  if (LITERAL_ROUTE_SET.has(path)) return path as TrafficBeaconRoute;
  // Canonical public share URL (`/s/salon/:id`, served by the backend share
  // route). The concrete id is dropped: only the literal family pattern is
  // returned, so no identifier ever reaches the beacon.
  if (/^\/s\/salon\/[^/]+$/.test(path)) return '/s/:slug';
  if (/^\/s\/[^/]+$/.test(path)) return '/s/:slug';
  if (/^\/agendamento\/[^/]+$/.test(path)) return '/agendamento/:token';

  return null;
}

/** Extracts only a referrer hostname; paths, queries, and fragments are lost. */
export function getReferrerHostname(referrer: string | undefined): string | undefined {
  if (!referrer || !referrer.trim()) return undefined;

  try {
    const hostname = new URL(referrer).hostname;
    return hostname || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Builds the privacy-safe payload. The concrete slug/token is never copied
 * from the URL, and the only optional field is the referrer hostname.
 */
export function createTrafficBeaconPayload(
  pathname: string,
  referrer?: string
): TrafficBeaconPayload | null {
  const p = getTrafficBeaconRoute(pathname);
  if (!p) return null;

  const r = getReferrerHostname(referrer);
  return r ? { p, r } : { p };
}

/** Alias for consumers that prefer a builder-style name. */
export const getTrafficBeaconPayload = createTrafficBeaconPayload;

const currentPathname = (): string | undefined =>
  typeof window === 'undefined' ? undefined : window.location.pathname;

const currentReferrer = (): string => (typeof document === 'undefined' ? '' : document.referrer);

type DocumentWithReferrerPolicy = Document & { referrerPolicy: string };

/** Try the browser beacon transport; false means the caller should fall back. */
function trySendBeacon(
  browserNavigator: TrafficBeaconNavigator | undefined,
  url: string,
  serializedPayload: string
): boolean {
  if (typeof browserNavigator?.sendBeacon !== 'function') return false;

  try {
    const body = new Blob([serializedPayload], { type: 'text/plain' });
    const browserDocument =
      typeof document === 'undefined' ? undefined : (document as DocumentWithReferrerPolicy);
    const previousReferrerPolicy = browserDocument?.referrerPolicy;
    let changedReferrerPolicy = false;

    // sendBeacon has no per-request referrerPolicy. Temporarily selecting
    // no-referrer prevents the browser from adding the current URL (which
    // may contain a query or fragment) to the HTTP Referer header. The
    // request is created synchronously, so the previous policy is restored
    // immediately afterwards.
    if (browserDocument) {
      browserDocument.referrerPolicy = 'no-referrer';
      changedReferrerPolicy = true;
    }

    try {
      return browserNavigator.sendBeacon(url, body);
    } finally {
      if (changedReferrerPolicy && browserDocument) {
        browserDocument.referrerPolicy = previousReferrerPolicy ?? '';
      }
    }
  } catch {
    // Beacon failures are never allowed to affect the page or navigation.
    return false;
  }
}

/** Send the non-blocking keepalive fallback without surfacing any failure. */
function sendKeepaliveFallback(
  fetchImpl: typeof fetch | undefined,
  url: string,
  serializedPayload: string
): void {
  if (!fetchImpl) return;

  try {
    const request = fetchImpl(url, {
      method: 'POST',
      body: serializedPayload,
      headers: { 'Content-Type': 'text/plain' },
      keepalive: true,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
      mode: 'cors',
    });
    // Attach the rejection handler immediately and never await the request.
    void Promise.resolve(request).catch(() => undefined);
  } catch {
    // A failed best-effort telemetry request is intentionally silent.
  }
}

/**
 * Sends one traffic ping without blocking navigation or awaiting the request.
 *
 * sendBeacon is preferred because a text/plain Blob is a simple request and
 * does not trigger a CORS preflight. If it is unavailable or rejects the
 * payload, a keepalive fetch is used as a best-effort fallback. All failures
 * are intentionally swallowed because telemetry must never affect the user.
 */
export function sendTrafficBeacon(options: TrafficBeaconSendOptions = {}): void {
  const environment: TrafficBeaconEnvironmentOptions = {
    ...getTrafficBeaconEnvironment(),
    ...(options.environment ?? {}),
  };
  if (!isTrafficBeaconEnabled(environment)) return;

  const pathname = options.pathname ?? currentPathname();
  if (!pathname) return;

  const payload = createTrafficBeaconPayload(pathname, options.referrer ?? currentReferrer());
  if (!payload) return;

  const url = `${API_BASE}/api/ping`;
  const serializedPayload = JSON.stringify(payload);
  const browserNavigator =
    options.navigator ?? (typeof navigator === 'undefined' ? undefined : navigator);

  if (trySendBeacon(browserNavigator, url, serializedPayload)) return;

  const fetchImpl = options.fetch ?? (typeof fetch === 'undefined' ? undefined : fetch);
  sendKeepaliveFallback(fetchImpl, url, serializedPayload);
}
