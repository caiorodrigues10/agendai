import type {
  DesignBackground,
  DesignContent,
  DesignFontPair,
  DesignOverrides,
  DesignPromo,
  DesignService,
} from '../../infra/postsApi';

export interface DesignEditorState {
  designKey?: string;
  designVersion?: number;
  designContent: DesignContent;
  designOverrides: DesignOverrides;
}

export type DesignContentTextField =
  | 'businessName'
  | 'headline'
  | 'highlight'
  | 'tagline'
  | 'cta'
  | 'validUntil';

export type DesignContentNullableField =
  | 'whatsapp'
  | 'instagram'
  | 'address'
  | 'photoUrl'
  | 'logoUrl';

export type DesignAction =
  | { type: 'select-design'; designKey: string; designVersion: number }
  | { type: 'set-content-field'; field: DesignContentTextField; value: string }
  | { type: 'set-content-nullable-field'; field: DesignContentNullableField; value: string | null }
  | { type: 'set-content-services'; services: DesignService[] }
  | { type: 'set-content-promo'; promo?: DesignPromo }
  | { type: 'set-content-focal'; focal?: { x: number; y: number } }
  | { type: 'set-colors'; colors: Partial<NonNullable<DesignOverrides['colors']>> }
  | { type: 'set-font-pair'; fontPair?: DesignFontPair }
  | { type: 'set-text-scale'; textScale?: number }
  | { type: 'set-align'; align?: DesignOverrides['align'] }
  | { type: 'set-background'; background?: DesignBackground }
  | { type: 'set-logo'; logo: Partial<NonNullable<DesignOverrides['logo']>> }
  | { type: 'set-contacts'; contacts: Partial<NonNullable<DesignOverrides['contacts']>> }
  | { type: 'set-visible'; id: string; visible: boolean }
  | { type: 'hydrate'; state: DesignEditorState };

export const EMPTY_DESIGN_CONTENT: DesignContent = {};
export const EMPTY_DESIGN_OVERRIDES: DesignOverrides = {};

export function createDesignState(input: {
  designKey?: string;
  designVersion?: number;
  designContent?: DesignContent | null;
  designOverrides?: DesignOverrides | null;
} = {}): DesignEditorState {
  return {
    designKey: input.designKey,
    designVersion: input.designVersion,
    designContent: { ...(input.designContent ?? {}) },
    designOverrides: { ...(input.designOverrides ?? {}) },
  };
}

function setContentField(
  content: DesignContent,
  field: DesignContentTextField | DesignContentNullableField,
  value: string | null,
): DesignContent {
  const next = { ...content };
  // `null` é uma instrução explícita: suprimir o fallback do salão.
  // String vazia significa "não informado" e equivale a ausência.
  if (value === null) {
    next[field] = null;
    return next;
  }
  const normalized = value.trim();
  if (!normalized) delete next[field];
  else next[field] = normalized;
  return next;
}

/** Aplica um bloco parcial em cima de um objeto existente, removendo vazios. */
function assignOrDelete<T extends object>(target: T, field: keyof T, value: unknown): T {
  if (value === undefined || value === '') delete target[field];
  else (target[field] as unknown) = value;
  return target;
}

function applyLogo(
  designOverrides: DesignOverrides,
  patch: Partial<NonNullable<DesignOverrides['logo']>>,
): void {
  const logo = { ...(designOverrides.logo ?? {}) };
  if ('src' in patch) assignOrDelete(logo, 'src', patch.src);
  if ('shape' in patch) assignOrDelete(logo, 'shape', patch.shape);
  if (Object.keys(logo).length) designOverrides.logo = logo;
  else delete designOverrides.logo;
}

function applyContacts(
  designOverrides: DesignOverrides,
  patch: Partial<NonNullable<DesignOverrides['contacts']>>,
): void {
  const contacts = { ...(designOverrides.contacts ?? {}) };
  for (const field of ['whatsapp', 'instagram', 'address'] as const) {
    if (!(field in patch)) continue;
    assignOrDelete(contacts, field, patch[field]);
  }
  if (Object.keys(contacts).length) designOverrides.contacts = contacts;
  else delete designOverrides.contacts;
}

function applyVisible(designOverrides: DesignOverrides, id: string, visible: boolean): void {
  const current = { ...(designOverrides.visible ?? {}) };
  if (visible) delete current[id];
  else current[id] = false;
  if (Object.keys(current).length) designOverrides.visible = current;
  else delete designOverrides.visible;
}

function reduceContent(
  state: DesignEditorState,
  action: Extract<DesignAction, { type: `set-content-${string}` }>,
): DesignEditorState {
  switch (action.type) {
    case 'set-content-field':
    case 'set-content-nullable-field':
      return {
        ...state,
        designContent: setContentField(state.designContent, action.field, action.value),
      };
    case 'set-content-services':
      return {
        ...state,
        designContent: {
          ...state.designContent,
          services: action.services.slice(0, 8),
        },
      };
    case 'set-content-promo': {
      const designContent = { ...state.designContent };
      if (!action.promo) delete designContent.promo;
      else designContent.promo = action.promo;
      return { ...state, designContent };
    }
    case 'set-content-focal': {
      const designContent = { ...state.designContent };
      if (!action.focal) delete designContent.focal;
      else designContent.focal = action.focal;
      return { ...state, designContent };
    }
    default:
      return state;
  }
}

function reduceOverrides(
  state: DesignEditorState,
  action: Extract<DesignAction, { type: `set-${string}` }>,
): DesignEditorState {
  const designOverrides = { ...state.designOverrides };
  switch (action.type) {
    case 'set-colors': {
      const colors = { ...(state.designOverrides.colors ?? {}) };
      for (const [field, value] of Object.entries(action.colors)) {
        assignOrDelete(colors, field as keyof typeof colors, value);
      }
      if (Object.keys(colors).length) designOverrides.colors = colors;
      else delete designOverrides.colors;
      break;
    }
    case 'set-font-pair':
      assignOrDelete(designOverrides, 'fontPair', action.fontPair);
      break;
    case 'set-text-scale':
      assignOrDelete(designOverrides, 'textScale', action.textScale);
      break;
    case 'set-align':
      assignOrDelete(designOverrides, 'align', action.align);
      break;
    case 'set-background':
      assignOrDelete(designOverrides, 'background', action.background);
      break;
    case 'set-logo':
      applyLogo(designOverrides, action.logo);
      break;
    case 'set-contacts':
      applyContacts(designOverrides, action.contacts);
      break;
    case 'set-visible':
      applyVisible(designOverrides, action.id, action.visible);
      break;
    default:
      return state;
  }
  return { ...state, designOverrides };
}

// O switch é a tabela de transições do reducer; separar cada ação em callbacks
// tornaria o estado mais difícil de auditar sem reduzir a complexidade real.
export function designReducer(state: DesignEditorState, action: DesignAction): DesignEditorState {
  switch (action.type) {
    case 'select-design':
      // Trocar o estilo nunca apaga o conteúdo nem o estilo já customized.
      return {
        ...state,
        designKey: action.designKey,
        designVersion: action.designVersion,
      };
    case 'set-content-field':
    case 'set-content-nullable-field':
    case 'set-content-services':
    case 'set-content-promo':
    case 'set-content-focal':
      return reduceContent(state, action);
    case 'set-colors':
    case 'set-font-pair':
    case 'set-text-scale':
    case 'set-align':
    case 'set-background':
    case 'set-logo':
    case 'set-contacts':
    case 'set-visible':
      return reduceOverrides(state, action);
    case 'hydrate':
      return {
        ...action.state,
        designContent: { ...action.state.designContent },
        designOverrides: { ...action.state.designOverrides },
      };
    default:
      return state;
  }
}

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const CONTENT_LIMITS = {
  businessName: 120,
  headline: 200,
  highlight: 60,
  tagline: 160,
  cta: 60,
  validUntil: 40,
  whatsapp: 20,
  instagram: 40,
  address: 120,
  photoUrl: 2048,
  logoUrl: 10_000,
  serviceName: 80,
  servicePrice: 1_000_000,
  serviceIcon: 32,
  promoLabel: 40,
  qrData: 300,
} as const;
const DESIGN_OVERRIDES_MAX_BYTES = 8 * 1024;
const FONT_PAIRS: DesignFontPair[] = [
  'montserrat-inter',
  'playfair-poppins',
  'bebas-oswald',
  'dmserif-poppins',
  'anton-barlow',
  'playfair-barlow',
];

function compactText(value: unknown, maxLength = Number.POSITIVE_INFINITY): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return undefined;
  return normalized;
}

function compactPromo(promo: DesignPromo | undefined): DesignPromo | undefined {
  if (!promo) return undefined;
  const result: DesignPromo = { kind: promo.kind };
  const label = compactText(promo.promoLabel, CONTENT_LIMITS.promoLabel);
  const unit = compactText(promo.promoUnit, CONTENT_LIMITS.promoLabel);

  if (promo.kind === 'percent') {
    if (typeof promo.percent !== 'number' || promo.percent < 1 || promo.percent > 99) return undefined;
    result.percent = promo.percent;
  } else if (promo.kind === 'money') {
    if (typeof promo.amount !== 'number' || promo.amount < 0 || promo.amount > 1_000_000) return undefined;
    result.amount = promo.amount;
  } else if (promo.kind === 'from-to') {
    if (
      typeof promo.from !== 'number' || promo.from < 0 || promo.from > 1_000_000 ||
      typeof promo.to !== 'number' || promo.to < 0 || promo.to > 1_000_000
    ) return undefined;
    result.from = promo.from;
    result.to = promo.to;
  } else if (!label) {
    return undefined;
  }

  if (label) result.promoLabel = label;
  if (unit) result.promoUnit = unit;
  return result;
}

function compactServices(services: DesignService[] | undefined): DesignService[] | undefined {
  if (!services) return undefined;
  const compacted = services
    .map(service => {
      const name = compactText(service.name, CONTENT_LIMITS.serviceName);
      if (!name) return undefined;
      const result: DesignService = { name };
      if (
        typeof service.price === 'number' &&
        Number.isFinite(service.price) &&
        service.price >= 0 &&
        service.price <= CONTENT_LIMITS.servicePrice
      ) {
        result.price = service.price;
      }
      const icon = compactText(service.icon, CONTENT_LIMITS.serviceIcon);
      if (icon) result.icon = icon;
      return result;
    })
    .filter((service): service is DesignService => Boolean(service))
    .slice(0, 8);
  return compacted.length ? compacted : undefined;
}

/** Conteúdo limpo: strings vazias e blocos sem dado não entram no payload. */
export function compactDesignContent(content: DesignContent): DesignContent | undefined {
  const result: DesignContent = {};
  for (const field of ['businessName', 'headline', 'highlight', 'tagline', 'cta', 'validUntil'] as const) {
    const value = compactText(content[field], CONTENT_LIMITS[field]);
    if (value) result[field] = value;
  }
  for (const field of ['whatsapp', 'instagram', 'address', 'photoUrl', 'logoUrl'] as const) {
    const value = content[field];
    // Ausência e string vazia não são enviadas; `null` suprime o fallback.
    if (value === null) result[field] = null;
    else {
      const compact = compactText(value, CONTENT_LIMITS[field]);
      if (compact) result[field] = compact;
    }
  }
  if (
    content.focal &&
    Number.isFinite(content.focal.x) && content.focal.x >= 0 && content.focal.x <= 1 &&
    Number.isFinite(content.focal.y) && content.focal.y >= 0 && content.focal.y <= 1
  ) {
    result.focal = { x: content.focal.x, y: content.focal.y };
  }
  const services = compactServices(content.services);
  if (services) result.services = services;
  const promo = compactPromo(content.promo);
  if (promo) result.promo = promo;
  return Object.keys(result).length ? result : undefined;
}

type DesignGradientBackground = Extract<DesignBackground, { kind: 'gradient' }>;
type DesignPhotoBackground = Extract<DesignBackground, { kind: 'photo' }>;

function compactGradientBackground(background: DesignGradientBackground): DesignBackground | undefined {
  const stops = Array.isArray(background.stops)
    ? background.stops
      .filter(stop => HEX_COLOR.test(stop.color) && stop.at >= 0 && stop.at <= 1)
      .slice(0, 3)
      // Reconstrói cada stop para não carregar chaves de dados hidratados.
      .map(stop => ({ color: stop.color, at: stop.at }))
    : [];
  if (stops.length < 2) return undefined;
  const angle = typeof background.angle === 'number' && background.angle >= 0 && background.angle <= 360
    ? background.angle
    : undefined;
  return { kind: 'gradient', stops, ...(angle === undefined ? {} : { angle }) };
}

function compactPhotoBackground(background: DesignPhotoBackground): DesignBackground | undefined {
  const url = compactText(background.url, 2048);
  if (!url) return undefined;
  const focal = background.focal &&
    background.focal.x >= 0 && background.focal.x <= 1 &&
    background.focal.y >= 0 && background.focal.y <= 1
    ? { x: background.focal.x, y: background.focal.y }
    : undefined;
  const overlay = typeof background.overlay === 'number' && background.overlay >= 0 && background.overlay <= 80
    ? background.overlay
    : undefined;
  return {
    kind: 'photo',
    url,
    ...(focal ? { focal } : {}),
    ...(overlay === undefined ? {} : { overlay }),
  };
}

function compactBackground(background: DesignBackground | undefined): DesignBackground | undefined {
  if (!background) return undefined;
  if (background.kind === 'color') {
    // Reconstrói em vez de repassar o estado: um objeto color herdado de
    // outro tipo (ou de dados hidratados legados) levaria stops/url para o
    // payload strict do servidor.
    return HEX_COLOR.test(background.color) ? { kind: 'color', color: background.color } : undefined;
  }
  if (background.kind === 'gradient') return compactGradientBackground(background);
  return compactPhotoBackground(background);
}

type DesignColors = NonNullable<DesignOverrides['colors']>;
type DesignLogo = NonNullable<DesignOverrides['logo']>;
type DesignContacts = NonNullable<DesignOverrides['contacts']>;
type DesignNudge = NonNullable<DesignOverrides['nudge']>;

function compactColors(colors: DesignColors | undefined): DesignColors | undefined {
  if (!colors) return undefined;
  const compacted: DesignColors = {};
  for (const field of ['bg', 'panel', 'accent', 'text'] as const) {
    const value = compactText(colors[field]);
    if (value && HEX_COLOR.test(value)) compacted[field] = value.toUpperCase();
  }
  return Object.keys(compacted).length ? compacted : undefined;
}

function compactLogo(logo: DesignLogo | undefined): DesignLogo | undefined {
  if (!logo) return undefined;
  const compacted: DesignLogo = {};
  if (logo.src === null) compacted.src = null;
  else {
    const src = compactText(logo.src, CONTENT_LIMITS.logoUrl);
    if (src) compacted.src = src;
  }
  if (logo.shape && ['round', 'square', 'none'].includes(logo.shape)) {
    compacted.shape = logo.shape;
  }
  return Object.keys(compacted).length ? compacted : undefined;
}

function compactContacts(contacts: DesignContacts | undefined): DesignContacts | undefined {
  if (!contacts) return undefined;
  const compacted: DesignContacts = {};
  for (const field of ['whatsapp', 'instagram', 'address'] as const) {
    const value = contacts[field];
    if (value === null) compacted[field] = null;
    else {
      const compact = compactText(value, CONTENT_LIMITS[field]);
      if (compact) compacted[field] = compact;
    }
  }
  return Object.keys(compacted).length ? compacted : undefined;
}

function compactNudge(nudge: DesignNudge | undefined): DesignNudge | undefined {
  if (!nudge) return undefined;
  const compacted = Object.fromEntries(
    Object.entries(nudge).filter(([id, value]) =>
      id.length >= 1 && id.length <= 64 &&
      value.dx >= -600 && value.dx <= 600 &&
      value.dy >= -600 && value.dy <= 600 &&
      value.scale >= 0.5 && value.scale <= 2
    ),
  );
  return Object.keys(compacted).length ? compacted : undefined;
}

/** Blocos de override compactados, cada um já validado pelo seu limite. */
function compactVisible(visible: DesignOverrides['visible']): DesignOverrides['visible'] | undefined {
  if (!visible) return undefined;
  const compacted = Object.fromEntries(
    Object.entries(visible).filter(([id, value]) =>
      id.length >= 1 && id.length <= 64 && value === false,
    ),
  );
  return Object.keys(compacted).length ? compacted : undefined;
}

function compactQr(qr: DesignOverrides['qr']): DesignOverrides['qr'] | undefined {
  const data = compactText(qr?.data, CONTENT_LIMITS.qrData);
  if (!data) return undefined;
  return {
    data,
    ...(qr?.enabled === undefined ? {} : { enabled: qr.enabled }),
  };
}

/** Overrides limpos e compatíveis com o schema strict do servidor. */
export function compactDesignOverrides(overrides: DesignOverrides): DesignOverrides | undefined {
  const result: DesignOverrides = {};
  const colors = compactColors(overrides.colors);
  if (colors) result.colors = colors;
  if (overrides.fontPair && FONT_PAIRS.includes(overrides.fontPair)) result.fontPair = overrides.fontPair;
  if (typeof overrides.textScale === 'number' && overrides.textScale >= 0.6 && overrides.textScale <= 1.6) {
    result.textScale = overrides.textScale;
  }
  if (overrides.align && ['left', 'center', 'right'].includes(overrides.align)) result.align = overrides.align;
  const visible = compactVisible(overrides.visible);
  if (visible) result.visible = visible;
  const background = compactBackground(overrides.background);
  if (background) result.background = background;
  const logo = compactLogo(overrides.logo);
  if (logo) result.logo = logo;
  const contacts = compactContacts(overrides.contacts);
  if (contacts) result.contacts = contacts;
  const qr = compactQr(overrides.qr);
  if (qr) result.qr = qr;
  const nudge = compactNudge(overrides.nudge);
  if (nudge) result.nudge = nudge;
  if (!Object.keys(result).length) return undefined;
  if (new TextEncoder().encode(JSON.stringify(result)).length > DESIGN_OVERRIDES_MAX_BYTES) {
    return undefined;
  }
  return result;
}

export function designContentPayload(state: DesignEditorState): DesignContent | undefined {
  return compactDesignContent(state.designContent);
}

export function designOverridesPayload(state: DesignEditorState): DesignOverrides | undefined {
  return compactDesignOverrides(state.designOverrides);
}
