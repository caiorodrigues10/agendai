import { API_BASE } from './apiClient';
import { authStorage } from './authStorage';
import type { PublicTab } from '../shared/publicTabs';

type StaticTrafficBeaconRoute =
  | '/'
  | '/funcionalidades'
  | '/ia-preditiva'
  | '/agendamento'
  | '/dashboard'
  | '/sobre'
  | '/contato'
  | '/privacidade'
  | '/termos'
  | '/esqueci-senha'
  | '/planos'
  | '/software-para-salao-de-beleza'
  | '/sistema-para-salao-de-beleza'
  | '/sistema-para-barbearia'
  | '/app-para-agendamento-de-salao'
  | '/sistema-para-fila-de-barbearia'
  | '/sistema-para-manicure'
  | '/sistema-para-lash-designer'
  | '/crm-para-salao-de-beleza'
  | '/controle-financeiro-para-salao'
  | '/software-para-escritorio-de-advocacia';

export type TrafficBeaconRoute = StaticTrafficBeaconRoute | '/s/:slug' | '/agendamento/:token';

const STATIC_TRAFFIC_BEACON_ROUTES: readonly StaticTrafficBeaconRoute[] = [
  '/',
  '/funcionalidades',
  '/ia-preditiva',
  '/agendamento',
  '/dashboard',
  '/sobre',
  '/contato',
  '/privacidade',
  '/termos',
  '/esqueci-senha',
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
];

const isStaticTrafficBeaconRoute = (path: string): path is StaticTrafficBeaconRoute =>
  (STATIC_TRAFFIC_BEACON_ROUTES as readonly string[]).includes(path);

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
  /**
   * Defaults to window.location.search. Only the allowlisted `tab` of a
   * public salon page is ever read from it; the query is never serialized.
   */
  search?: string;
  /** Defaults to document.referrer. */
  referrer?: string;
  /** Injectable navigator, primarily for tests and non-browser callers. */
  navigator?: TrafficBeaconNavigator;
  /** Injectable fetch, primarily for tests. */
  fetch?: typeof fetch;
  /**
   * Ids de salão do usuário já autenticado (dono/equipe). Injetável para
   * testes; por padrão lê `authStorage.getUser()` — só o `barbershopId` da
   * sessão em storage, sem token na rede e sem storage novo. Correspondência
   * por organização/slug não é possível no cliente (ver contrato).
   */
  ownSalonIds?: readonly string[];
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

/**
 * Maps a concrete pathname to one of the allowlisted route patterns that may
 * be sent. A pathname containing a query string or fragment is rejected
 * outright, so neither can be mistaken for a monitored route.
 */
export function getTrafficBeaconRoute(pathname: string): TrafficBeaconRoute | null {
  if (typeof pathname !== 'string' || pathname.length === 0) return null;
  if (pathname.includes('?') || pathname.includes('#')) return null;

  if (isStaticTrafficBeaconRoute(pathname)) return pathname;
  // Canonical public share URL (`/s/salon/:id`, served by the backend share
  // route). The concrete id is dropped: only the literal family pattern is
  // returned, so no identifier ever reaches the beacon.
  if (/^\/s\/salon\/[^/]+$/.test(pathname)) return '/s/:slug';
  if (/^\/s\/[^/]+$/.test(pathname)) return '/s/:slug';
  // `/agendamento/gerenciar` is a public customer flow, not the token route,
  // and is intentionally outside the monitored marketing pages.
  if (pathname === '/agendamento/gerenciar') return null;
  if (/^\/agendamento\/[^/]+$/.test(pathname)) return '/agendamento/:token';

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
 * Segundo caminho do beacon: páginas públicas de um salão, com atribuição ao
 * salão. O id/slug público do salão já está na URL compartilhada, por isso é
 * enviado; o visitante continua anônimo (nada de cookie, localStorage,
 * fingerprint, IP, user agent ou identificador persistente).
 */

/** Padrões de rota das páginas públicas de um salão. */
export type SalonTrafficBeaconRoute = '/queue/:id' | '/queue/:id/produtos/:productId' | '/s/:slug';

/** Abas da página pública (`src/shared/publicTabs.ts`). */
export type SalonTrafficTab = PublicTab;

/** Allowlist fixa de abas: qualquer outro valor é descartado (vira ausente). */
const SALON_TRAFFIC_TABS: readonly SalonTrafficTab[] = ['queue', 'appointments', 'profile'];

/**
 * `kind` do ping de salão: `visit` = entrada/carregamento da página pública
 * (exatamente uma vez); `tab` = troca de aba posterior. Sem esta distinção o
 * backend não separa "primeira visita" de "visualização de aba".
 */
export type SalonTrafficBeaconKind = 'visit' | 'tab';

/** Allowlist fixa de `kind`: qualquer outro valor descarta o ping inteiro. */
const SALON_TRAFFIC_KINDS: readonly SalonTrafficBeaconKind[] = ['visit', 'tab'];

/** Valida um valor cru de `kind` contra a allowlist fixa. */
export function sanitizeSalonTrafficKind(value: unknown): SalonTrafficBeaconKind | undefined {
  if (typeof value !== 'string') return undefined;
  return (SALON_TRAFFIC_KINDS as readonly string[]).includes(value)
    ? (value as SalonTrafficBeaconKind)
    : undefined;
}

/**
 * Tipo do identificador público em `salon`: `id` = UUID do barbershop,
 * `slug` = slug público (organização). O frontend conhece a forma do valor
 * que ele mesmo leu da URL, então informa ao backend em vez de deixá-lo
 * adivinhar.
 */
export type SalonTrafficIdentifierType = 'id' | 'slug';

/** Allowlist fixa de `salonType`. */
const SALON_TRAFFIC_IDENTIFIER_TYPES: readonly SalonTrafficIdentifierType[] = ['id', 'slug'];

/** UUID canônico (v4) do barbershop — `prisma @default(uuid())`. */
const SALON_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida um valor cru de `salonType` contra a allowlist fixa. */
export function sanitizeSalonTrafficIdentifierType(
  value: unknown
): SalonTrafficIdentifierType | undefined {
  if (typeof value !== 'string') return undefined;
  return (SALON_TRAFFIC_IDENTIFIER_TYPES as readonly string[]).includes(value)
    ? (value as SalonTrafficIdentifierType)
    : undefined;
}

/**
 * Heurística de forma (a única leitura possível no cliente, sem rede):
 * UUID → `id`; qualquer outro valor válido (slug `a-z0-9` com hífen) → `slug`.
 */
function detectSalonIdentifierType(value: string): SalonTrafficIdentifierType {
  return SALON_UUID_PATTERN.test(value) ? 'id' : 'slug';
}

/**
 * Identificador público do salão: UUID do barbershop (`prisma` `@default(uuid())`)
 * ou slug público (`a-z0-9` com hífen, máx. 100 — ver `organizationSchema`).
 * Charset e tamanho limitam o que pode sair; qualquer outro valor não é enviado.
 */
export const SALON_IDENTIFIER_MAX_LENGTH = 100;
const SALON_IDENTIFIER_PATTERN = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

export function isValidSalonIdentifier(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= SALON_IDENTIFIER_MAX_LENGTH &&
    SALON_IDENTIFIER_PATTERN.test(value)
  );
}

/** Valida um valor cru de aba contra a allowlist fixa. */
export function sanitizeSalonTrafficTab(value: unknown): SalonTrafficTab | undefined {
  if (typeof value !== 'string') return undefined;
  return (SALON_TRAFFIC_TABS as readonly string[]).includes(value)
    ? (value as SalonTrafficTab)
    : undefined;
}

/**
 * Lê somente o parâmetro `tab` da query. Os demais parâmetros (token, e-mail,
 * utm…) nunca são lidos nem serializados; um valor fora da allowlist vira
 * ausente.
 */
export function getSalonTrafficTab(search: string | undefined): SalonTrafficTab | undefined {
  if (typeof search !== 'string' || search.length === 0) return undefined;
  return sanitizeSalonTrafficTab(new URLSearchParams(search).get('tab') ?? undefined);
}

export interface SalonTrafficBeaconPayload {
  /** Literal route pattern of the public salon page. */
  p: SalonTrafficBeaconRoute;
  /** Public salon id/slug — already present in the shared public URL. */
  salon: string;
  /** Forma do identificador acima: UUID do barbershop (`id`) ou slug (`slug`). */
  salonType: SalonTrafficIdentifierType;
  /** `visit` = entrada na página; `tab` = troca de aba posterior. Obrigatório. */
  kind: SalonTrafficBeaconKind;
  /** Visible tab, only when it comes from the fixed allowlist. */
  tab?: SalonTrafficTab;
  /** Only the hostname of document.referrer, when it is a valid URL. */
  r?: string;
}

export interface SalonTrafficTarget {
  p: SalonTrafficBeaconRoute;
  salon: string;
  salonType: SalonTrafficIdentifierType;
}

/**
 * Maps a pathname to a public salon page. A pathname containing a query string
 * or fragment is rejected outright. The concrete product id is never part of
 * the result: only the literal family pattern is returned.
 */
export function getSalonTrafficTarget(pathname: string): SalonTrafficTarget | null {
  if (typeof pathname !== 'string' || pathname.length === 0) return null;
  if (pathname.includes('?') || pathname.includes('#')) return null;

  // Vitrine de produto: só o padrão literal e o id do salão (nunca o productId).
  const product = /^\/queue\/([^/]+)\/produtos\/([^/]+)$/.exec(pathname);
  if (product) {
    return isValidSalonIdentifier(product[1])
      ? {
          p: '/queue/:id/produtos/:productId',
          salon: product[1],
          salonType: detectSalonIdentifierType(product[1]),
        }
      : null;
  }

  const shop = /^\/queue\/([^/]+)$/.exec(pathname);
  if (shop) {
    return isValidSalonIdentifier(shop[1])
      ? { p: '/queue/:id', salon: shop[1], salonType: detectSalonIdentifierType(shop[1]) }
      : null;
  }

  // Link canônico de compartilhamento (`/s/salon/:id`), servido pelo backend.
  const canonical = /^\/s\/salon\/([^/]+)$/.exec(pathname);
  if (canonical) {
    return isValidSalonIdentifier(canonical[1])
      ? { p: '/s/:slug', salon: canonical[1], salonType: detectSalonIdentifierType(canonical[1]) }
      : null;
  }

  // `/s/salon` sem id não é página de salão (cai no beacon global, sem salão).
  const share = /^\/s\/([^/]+)$/.exec(pathname);
  if (share) {
    if (share[1] === 'salon') return null;
    return isValidSalonIdentifier(share[1])
      ? { p: '/s/:slug', salon: share[1], salonType: detectSalonIdentifierType(share[1]) }
      : null;
  }

  return null;
}

export interface SalonTrafficBeaconOptions {
  /** `location.search` — só o `tab` allowlistado é lido daqui. */
  search?: string;
  referrer?: string;
  /** Tab já conhecida pela página; prevalece sobre a query. */
  tab?: SalonTrafficTab | null;
  /**
   * Obrigatório: allowlist `visit`/`tab`. Um valor ausente ou fora da
   * allowlist descarta o payload inteiro — um ping sem `kind` é ambíguo e
   * nunca sai do frontend.
   */
  kind: SalonTrafficBeaconKind;
}

/**
 * Builds the privacy-safe salon payload. Only the literal pattern, the public
 * salon id/slug, its type, the event kind, the allowlisted tab and the
 * referrer hostname can be present.
 */
export function createSalonTrafficBeaconPayload(
  pathname: string,
  options: SalonTrafficBeaconOptions
): SalonTrafficBeaconPayload | null {
  const target = getSalonTrafficTarget(pathname);
  if (!target) return null;

  const kind = sanitizeSalonTrafficKind(options.kind);
  if (!kind) return null;

  const tab =
    options.tab === undefined || options.tab === null
      ? getSalonTrafficTab(options.search)
      : sanitizeSalonTrafficTab(options.tab);

  const r = getReferrerHostname(options.referrer);
  const payload: SalonTrafficBeaconPayload = {
    p: target.p,
    salon: target.salon,
    salonType: target.salonType,
    kind,
  };
  if (tab) payload.tab = tab;
  if (r) payload.r = r;
  return payload;
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

/** Serializes and dispatches an already-built payload (never throws). */
function dispatchTrafficBeacon(
  payload: TrafficBeaconPayload | SalonTrafficBeaconPayload,
  options: TrafficBeaconSendOptions
): void {
  const url = `${API_BASE}/api/ping`;
  const serializedPayload = JSON.stringify(payload);
  const browserNavigator =
    options.navigator ?? (typeof navigator === 'undefined' ? undefined : navigator);

  if (trySendBeacon(browserNavigator, url, serializedPayload)) return;

  const fetchImpl = options.fetch ?? (typeof fetch === 'undefined' ? undefined : fetch);
  sendKeepaliveFallback(fetchImpl, url, serializedPayload);
}

function resolveEnvironment(options: TrafficBeaconSendOptions): TrafficBeaconEnvironmentOptions {
  return { ...getTrafficBeaconEnvironment(), ...(options.environment ?? {}) };
}

/**
 * Ids de salão da sessão autenticada (dono/equipe). Só o `barbershopId`
 * já persistido pelo fluxo de auth é lido — nunca token, nunca rede, nunca
 * storage novo. Em dúvida sobre a pertinência, a resposta é "não é meu":
 * apenas uma correspondência clara de id suprime o ping.
 */
function resolveOwnSalonIds(options: TrafficBeaconSendOptions): readonly string[] {
  if (Array.isArray(options.ownSalonIds)) return options.ownSalonIds;

  try {
    const user = authStorage.getUser() as { barbershopId?: unknown } | null;
    return user && typeof user.barbershopId === 'string' && user.barbershopId.length > 0
      ? [user.barbershopId]
      : [];
  } catch {
    return [];
  }
}

/**
 * Visita do próprio dono/equipe autenticados não é visita de visitante:
 * suprime o ping de salão apenas em correspondência clara de id. O beacon
 * global (marketing) não tem `salon` e nunca passa por aqui.
 */
function isOwnSalonPing(salon: string, options: TrafficBeaconSendOptions): boolean {
  return resolveOwnSalonIds(options).some(ownId => ownId === salon);
}

/**
 * Sends one traffic ping without blocking navigation or awaiting the request.
 *
 * Public salon pages (`/queue/:id`, `/queue/:id/produtos/:productId`,
 * `/s/:slug`) are attributed to the salon through the second payload path;
 * every other monitored route keeps the original pattern-only payload.
 *
 * sendBeacon is preferred because a text/plain Blob is a simple request and
 * does not trigger a CORS preflight. If it is unavailable or rejects the
 * payload, a keepalive fetch is used as a best-effort fallback. All failures
 * are intentionally swallowed because telemetry must never affect the user.
 */
export function sendTrafficBeacon(options: TrafficBeaconSendOptions = {}): void {
  if (!isTrafficBeaconEnabled(resolveEnvironment(options))) return;

  const pathname = options.pathname ?? currentPathname();
  if (!pathname) return;

  const referrer = options.referrer ?? currentReferrer();

  // Páginas públicas de salão entram pela rota de atribuição. Nesta rota a
  // entrada é sempre uma `visit` (a página pública reporta as `tab`).
  const salonPayload = createSalonTrafficBeaconPayload(pathname, {
    search: options.search,
    referrer,
    kind: 'visit',
  });
  if (salonPayload) {
    if (isOwnSalonPing(salonPayload.salon, options)) return;
    dispatchTrafficBeacon(salonPayload, options);
    return;
  }

  const payload = createTrafficBeaconPayload(pathname, referrer);
  if (!payload) return;

  dispatchTrafficBeacon(payload, options);
}

export interface SalonTrafficBeaconSendOptions extends TrafficBeaconSendOptions {
  /** Tab visible on the public page; overrides the value read from `search`. */
  tab?: SalonTrafficTab | null;
  /**
   * Allowlist `visit`/`tab`. Valor ausente/inválido → nenhum ping (um payload
   * ambíguo nunca sai). `visit` = entrada na página; `tab` = troca de aba.
   */
  kind: SalonTrafficBeaconKind;
}

/**
 * Sends one ping for a public salon page, attributed to that salon. Used by
 * the public page: the first report of a page load is a `visit` (with the
 * resolved initial tab), later tab changes are `tab` views — never a new
 * visit, and never with a visitor identifier.
 *
 * The build/environment/privacy guards (production only, demo/dev/test/
 * localhost hosts, DNT, GPC) are exactly the same as the global beacon, and
 * the ping is also suppressed when the URL is the salon of the authenticated
 * session (owner/team — a clear id match only).
 */
export function sendSalonTrafficBeacon(options: SalonTrafficBeaconSendOptions): void {
  if (!isTrafficBeaconEnabled(resolveEnvironment(options))) return;

  const pathname = options.pathname ?? currentPathname();
  if (!pathname) return;

  const payload = createSalonTrafficBeaconPayload(pathname, {
    search: options.search,
    referrer: options.referrer ?? currentReferrer(),
    tab: options.tab,
    kind: options.kind,
  });
  if (!payload) return;
  if (isOwnSalonPing(payload.salon, options)) return;

  dispatchTrafficBeacon(payload, options);
}
