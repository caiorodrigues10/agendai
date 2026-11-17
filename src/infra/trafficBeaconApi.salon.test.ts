/// <reference types="vitest/globals" />
import { authStorage } from './authStorage';
import {
  createSalonTrafficBeaconPayload,
  getSalonTrafficTab,
  getSalonTrafficTarget,
  isValidSalonIdentifier,
  sanitizeSalonTrafficIdentifierType,
  sanitizeSalonTrafficKind,
  sanitizeSalonTrafficTab,
  sendSalonTrafficBeacon,
  sendTrafficBeacon,
  type TrafficBeaconEnvironmentOptions,
} from './trafficBeaconApi';

const productionEnvironment: TrafficBeaconEnvironmentOptions = {
  enabled: 'true',
  mode: 'production',
  hostname: 'app.agendai.com.br',
};

const makeSendBeacon = (result = true) => vi.fn((_url: string, _data?: BodyInit | null) => result);

const makeFetch = (result: Promise<Response> = Promise.resolve({} as Response)) =>
  vi.fn((_input: RequestInfo | URL, _init?: RequestInit) => result);

const readBlob = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

const salonId = '0f9d4a1c-6f6f-4d0e-9d1e-2b7a5c8e1f33';

describe('trafficBeaconApi salon attribution', () => {
  beforeEach(() => {
    // Nenhum teste depende da sessão por acidente: a supressão do dono só
    // entra nos casos dedicados abaixo.
    authStorage.clearUser();
  });

  it('recognizes only public salon page patterns with a valid identifier', () => {
    expect(getSalonTrafficTarget(`/queue/${salonId}`)).toEqual({
      p: '/queue/:id',
      salon: salonId,
      salonType: 'id',
    });
    expect(getSalonTrafficTarget(`/queue/${salonId}/produtos/987`)).toEqual({
      p: '/queue/:id/produtos/:productId',
      salon: salonId,
      salonType: 'id',
    });
    expect(getSalonTrafficTarget(`/s/salon/${salonId}`)).toEqual({
      p: '/s/:slug',
      salon: salonId,
      salonType: 'id',
    });
    expect(getSalonTrafficTarget('/s/meu-salon')).toEqual({
      p: '/s/:slug',
      salon: 'meu-salon',
      salonType: 'slug',
    });

    // Id inválido, rotas logadas, query/fragmento e caminhos extras: nada.
    for (const pathname of [
      '/queue',
      '/queue/',
      '/queue/has space',
      '/queue/..%2Fescape',
      `/queue/${salonId}/extra`,
      `/queue/${salonId}?tab=profile`,
      `/queue/${salonId}#anchor`,
      `/queue/${salonId}/produtos/987?utm=1`,
      '/app/overview',
      '/master/traffic',
      '/login',
      '/s',
      '/s/',
      '/s/salon',
      '/s/salon/',
      '/s/meu-salon/extra',
      '/s/meu-salon?token=secret',
    ]) {
      expect(getSalonTrafficTarget(pathname)).toBeNull();
    }
  });

  it('rejects identifiers outside the charset or size limit', () => {
    expect(isValidSalonIdentifier('abc-123')).toBe(true);
    expect(isValidSalonIdentifier('')).toBe(false);
    expect(isValidSalonIdentifier('has space')).toBe(false);
    expect(isValidSalonIdentifier('a'.repeat(101))).toBe(false);
    expect(isValidSalonIdentifier('a'.repeat(100))).toBe(true);
    expect(isValidSalonIdentifier('../etc/passwd')).toBe(false);
    expect(isValidSalonIdentifier(null)).toBe(false);

    expect(getSalonTrafficTarget(`/queue/${'a'.repeat(101)}`)).toBeNull();
  });

  it('builds a payload with p, salon, salonType, kind, allowlisted tab and referrer only', () => {
    expect(
      createSalonTrafficBeaconPayload(`/queue/${salonId}`, {
        search: '?tab=profile',
        referrer: 'https://www.instagram.com/stories/1?igsh=secret#x',
        kind: 'visit',
      })
    ).toEqual({
      p: '/queue/:id',
      salon: salonId,
      salonType: 'id',
      kind: 'visit',
      tab: 'profile',
      r: 'www.instagram.com',
    });

    // Tab fora da allowlist vira ausente; demais parâmetros nunca são lidos.
    expect(
      createSalonTrafficBeaconPayload(`/queue/${salonId}`, { search: '?tab=secret', kind: 'visit' })
    ).toEqual({ p: '/queue/:id', salon: salonId, salonType: 'id', kind: 'visit' });
    expect(
      createSalonTrafficBeaconPayload(`/queue/${salonId}`, {
        search: '?token=abc&tab=queue',
        kind: 'visit',
      })
    ).toEqual({
      p: '/queue/:id',
      salon: salonId,
      salonType: 'id',
      kind: 'visit',
      tab: 'queue',
    });
    expect(
      createSalonTrafficBeaconPayload(`/queue/${salonId}`, {
        search: '?utm_source=x',
        kind: 'visit',
      })
    ).toEqual({ p: '/queue/:id', salon: salonId, salonType: 'id', kind: 'visit' });

    // O productId concreto nunca entra no payload.
    const productPayload = createSalonTrafficBeaconPayload(
      `/queue/${salonId}/produtos/987654`,
      { search: '?tab=profile', kind: 'visit' }
    );
    expect(productPayload).toEqual({
      p: '/queue/:id/produtos/:productId',
      salon: salonId,
      salonType: 'id',
      kind: 'visit',
      tab: 'profile',
    });
    expect(JSON.stringify(productPayload)).not.toContain('987654');

    expect(createSalonTrafficBeaconPayload('/queue/has space', { kind: 'visit' })).toBeNull();
    expect(createSalonTrafficBeaconPayload('/app/overview', { kind: 'visit' })).toBeNull();
  });

  it('discards any payload whose kind is missing or outside the allowlist', () => {
    // Sem `kind` ou com valor ambíguo não existe ping: nunca uma visita
    // "sem tipo" que o backend teria de adivinhar.
    expect(
      createSalonTrafficBeaconPayload(`/queue/${salonId}`, {} as { kind: never })
    ).toBeNull();
    expect(
      createSalonTrafficBeaconPayload(`/queue/${salonId}`, { kind: 'VIEW' as never })
    ).toBeNull();
    expect(
      createSalonTrafficBeaconPayload(`/queue/${salonId}`, { kind: '' as never })
    ).toBeNull();
    expect(
      createSalonTrafficBeaconPayload(`/queue/${salonId}`, { kind: 42 as never })
    ).toBeNull();

    expect(sanitizeSalonTrafficKind('visit')).toBe('visit');
    expect(sanitizeSalonTrafficKind('tab')).toBe('tab');
    expect(sanitizeSalonTrafficKind('Visit')).toBeUndefined();
    expect(sanitizeSalonTrafficKind('view')).toBeUndefined();
    expect(sanitizeSalonTrafficKind(null)).toBeUndefined();
    expect(sanitizeSalonTrafficKind(undefined)).toBeUndefined();
  });

  it('derives salonType from the identifier shape and validates it', () => {
    expect(getSalonTrafficTarget(`/queue/${salonId}`)?.salonType).toBe('id');
    expect(getSalonTrafficTarget('/s/meu-salon')?.salonType).toBe('slug');
    expect(getSalonTrafficTarget('/s/acme-barbearia')?.salonType).toBe('slug');

    expect(sanitizeSalonTrafficIdentifierType('id')).toBe('id');
    expect(sanitizeSalonTrafficIdentifierType('slug')).toBe('slug');
    expect(sanitizeSalonTrafficIdentifierType('uuid')).toBeUndefined();
    expect(sanitizeSalonTrafficIdentifierType(null)).toBeUndefined();
  });

  it('reads only the allowlisted tab from the query string', () => {
    expect(getSalonTrafficTab('?tab=queue')).toBe('queue');
    expect(getSalonTrafficTab('?tab=appointments')).toBe('appointments');
    expect(getSalonTrafficTab('?tab=profile')).toBe('profile');
    expect(getSalonTrafficTab('?tab=evil')).toBeUndefined();
    expect(getSalonTrafficTab('?other=1')).toBeUndefined();
    expect(getSalonTrafficTab('')).toBeUndefined();
    expect(getSalonTrafficTab(undefined)).toBeUndefined();

    expect(sanitizeSalonTrafficTab('profile')).toBe('profile');
    expect(sanitizeSalonTrafficTab('PROFILE')).toBeUndefined();
    expect(sanitizeSalonTrafficTab(42)).toBeUndefined();
  });
});

describe('trafficBeaconApi salon send guards', () => {
  beforeEach(() => {
    authStorage.clearUser();
  });

  it('sends the salon payload through sendTrafficBeacon as a visit, including the query tab', async () => {
    const sendBeacon = makeSendBeacon();

    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      search: '?tab=profile&utm_source=ads',
      referrer: '',
      navigator: { sendBeacon },
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(await readBlob(sendBeacon.mock.calls[0][1] as Blob));
    expect(payload).toEqual({
      p: '/queue/:id',
      salon: salonId,
      salonType: 'id',
      kind: 'visit',
      tab: 'profile',
    });
    expect(JSON.stringify(payload)).not.toContain('utm_source');

    sendBeacon.mockClear();
    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}/produtos/555`,
      search: '',
      referrer: '',
      navigator: { sendBeacon },
    });

    const productPayload = JSON.parse(await readBlob(sendBeacon.mock.calls[0][1] as Blob));
    expect(productPayload).toEqual({
      p: '/queue/:id/produtos/:productId',
      salon: salonId,
      salonType: 'id',
      kind: 'visit',
    });
    expect(JSON.stringify(productPayload)).not.toContain('555');
  });

  it('never sends the salon payload for logged routes, invalid ids or inline query paths', async () => {
    for (const { pathname, search } of [
      { pathname: '/app/overview', search: '' },
      { pathname: '/master/traffic', search: '' },
      { pathname: `/queue/${salonId}?tab=profile`, search: '' },
      { pathname: `/queue/${salonId}#anchor`, search: '' },
      { pathname: '/queue/has space', search: '' },
      { pathname: '/queue', search: '' },
    ]) {
      const sendBeacon = makeSendBeacon();
      const fetchMock = makeFetch();

      sendTrafficBeacon({
        environment: productionEnvironment,
        pathname,
        search,
        referrer: '',
        navigator: { sendBeacon },
        fetch: fetchMock,
      });

      expect(sendBeacon).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    }

    // Uma query separada (ex.: token de convite) não impede a visita, mas
    // nunca é serializada: só o `tab` allowlistado é lido, se existir.
    const sendBeacon = makeSendBeacon();
    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      search: '?token=secret&tab=queue',
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(await readBlob(sendBeacon.mock.calls[0][1] as Blob));
    expect(payload).toEqual({
      p: '/queue/:id',
      salon: salonId,
      salonType: 'id',
      kind: 'visit',
      tab: 'queue',
    });
    expect(JSON.stringify(payload)).not.toContain('secret');
  });
});

describe('trafficBeaconApi salon kind guards', () => {
  beforeEach(() => {
    authStorage.clearUser();
  });

  it('applies every environment guard to the salon payload', () => {
    const environments: TrafficBeaconEnvironmentOptions[] = [
      { ...productionEnvironment, enabled: 'false' },
      { ...productionEnvironment, mode: 'test' },
      { ...productionEnvironment, hostname: 'localhost' },
      { ...productionEnvironment, doNotTrack: '1' },
      { ...productionEnvironment, globalPrivacyControl: true },
    ];

    for (const environment of environments) {
      const sendBeacon = makeSendBeacon();
      const fetchMock = makeFetch();

      sendTrafficBeacon({
        environment,
        pathname: `/queue/${salonId}`,
        navigator: { sendBeacon },
        fetch: fetchMock,
      });
      expect(sendBeacon).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();

      sendSalonTrafficBeacon({
        environment,
        pathname: `/queue/${salonId}`,
        tab: 'queue',
        kind: 'visit',
        navigator: { sendBeacon },
        fetch: fetchMock,
      });
      expect(sendBeacon).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    }
  });

  it('sendSalonTrafficBeacon sends only for public salon pages, with an explicit kind', async () => {
    const sendBeacon = makeSendBeacon();

    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'appointments',
      kind: 'tab',
      referrer: '',
      navigator: { sendBeacon },
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(await readBlob(sendBeacon.mock.calls[0][1] as Blob));
    expect(payload).toEqual({
      p: '/queue/:id',
      salon: salonId,
      salonType: 'id',
      kind: 'tab',
      tab: 'appointments',
    });

    sendBeacon.mockClear();
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/planos',
      tab: 'queue',
      kind: 'visit',
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).not.toHaveBeenCalled();

    // Tab fora da allowlist é descartada, não enviada.
    sendBeacon.mockClear();
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'hacked' as never,
      kind: 'visit',
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const sanitized = JSON.parse(await readBlob(sendBeacon.mock.calls[0][1] as Blob));
    expect(sanitized).toEqual({
      p: '/queue/:id',
      salon: salonId,
      salonType: 'id',
      kind: 'visit',
    });

    // `kind` inválido/ausente: nenhum ping — payload ambíguo nunca sai.
    sendBeacon.mockClear();
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'queue',
      kind: 'hacked' as never,
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});

describe('trafficBeaconApi own-session suppression', () => {
  beforeEach(() => {
    authStorage.clearUser();
  });

  it('suppresses the salon ping when the session belongs to the visited salon', async () => {
    // Dono/equipe logados no próprio salão (id claro): não é visitante.
    const sendBeacon = makeSendBeacon();
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'queue',
      kind: 'visit',
      ownSalonIds: [salonId],
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).not.toHaveBeenCalled();

    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/s/salon/${salonId}`,
      referrer: '',
      ownSalonIds: [salonId],
      navigator: { sendBeacon },
    });
    expect(sendBeacon).not.toHaveBeenCalled();

    // Usuário logado de OUTRO salão continua sendo visitante: envia.
    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      referrer: '',
      ownSalonIds: ['11111111-1111-4111-8111-111111111111'],
      navigator: { sendBeacon },
    });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(await readBlob(sendBeacon.mock.calls[0][1] as Blob));
    expect(payload.kind).toBe('visit');

    // Sem sessão (array vazio explícito ou storage limpo): envia.
    sendBeacon.mockClear();
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'queue',
      kind: 'visit',
      ownSalonIds: [],
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).toHaveBeenCalledTimes(1);

    // Sessão do dono no storage (authStorage) também suprime, sem injeção.
    sendBeacon.mockClear();
    authStorage.setUser(
      { id: 'u1', name: 'Dono', email: 'dono@x.com', role: 'OWNER', barbershopId: salonId },
      true
    );
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'queue',
      kind: 'visit',
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).not.toHaveBeenCalled();

    // O beacon global (marketing, sem `salon`) nunca é afetado pela supressão.
    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/planos',
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const globalPayload = JSON.parse(await readBlob(sendBeacon.mock.calls[0][1] as Blob));
    expect(globalPayload).toEqual({ p: '/planos' });

    authStorage.clearUser();
    sendBeacon.mockClear();
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'queue',
      kind: 'visit',
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('sends for a logged user of another salon and for anonymous visitors', async () => {
    const sendBeacon = makeSendBeacon();

    // Visitante anônimo (storage limpo): envia.
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'queue',
      kind: 'visit',
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).toHaveBeenCalledTimes(1);

    // Usuário logado de OUTRO salão: correspondência não é clara → envia.
    sendBeacon.mockClear();
    authStorage.setUser(
      {
        id: 'u2',
        name: 'Outro',
        email: 'outro@x.com',
        role: 'EMPLOYEE',
        barbershopId: '22222222-2222-4222-8222-222222222222',
      },
      true
    );
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'queue',
      kind: 'visit',
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).toHaveBeenCalledTimes(1);

    // Usuário logado SEM barbershopId (ex.: master): não há correspondência
    // clara → envia.
    sendBeacon.mockClear();
    authStorage.setUser(
      { id: 'u3', name: 'Master', email: 'm@x.com', role: 'MASTER_ADMIN' },
      true
    );
    sendSalonTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/queue/${salonId}`,
      tab: 'queue',
      kind: 'visit',
      referrer: '',
      navigator: { sendBeacon },
    });
    expect(sendBeacon).toHaveBeenCalledTimes(1);

    authStorage.clearUser();
  });
});
