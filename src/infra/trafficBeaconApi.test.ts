/// <reference types="vitest/globals" />
import { API_BASE } from './apiClient';
import { COMMERCIAL_PAGES } from '../marketing/commercialPages';
import {
  createTrafficBeaconPayload,
  getTrafficBeaconRoute,
  isTrafficBeaconEnabled,
  sendTrafficBeacon,
  type TrafficBeaconEnvironmentOptions,
} from './trafficBeaconApi';

const productionEnvironment: TrafficBeaconEnvironmentOptions = {
  enabled: 'true',
  mode: 'production',
  hostname: 'app.agendai.com.br',
};

const beaconUrl = `${API_BASE}/api/ping`;

type DocumentWithReferrerPolicy = Document & { referrerPolicy: string };

const makeSendBeacon = (result = true) => vi.fn((_url: string, _data?: BodyInit | null) => result);

const makeFetch = (result: Promise<Response> = Promise.resolve({} as Response)) =>
  vi.fn((_input: RequestInfo | URL, _init?: RequestInit) => result);

const readBlob = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read Blob'));
    reader.readAsText(blob);
  });

describe('trafficBeaconApi', () => {
  it('is disabled by default and sends nothing when the flag is not explicitly enabled', () => {
    expect(isTrafficBeaconEnabled()).toBe(false);
    expect(isTrafficBeaconEnabled({ mode: 'production' })).toBe(false);
    expect(isTrafficBeaconEnabled({ ...productionEnvironment, enabled: 'false' })).toBe(false);
    expect(isTrafficBeaconEnabled({ ...productionEnvironment, enabled: 'anything-else' })).toBe(
      false
    );

    const sendBeacon = makeSendBeacon();
    const fetchMock = makeFetch();
    sendTrafficBeacon({
      environment: { ...productionEnvironment, enabled: 'false' },
      pathname: '/esqueci-senha',
      navigator: { sendBeacon },
      fetch: fetchMock,
    });

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not send in dev, test, demo, or development modes', () => {
    for (const mode of ['dev', 'test', 'demo', 'development']) {
      const sendBeacon = makeSendBeacon();
      const fetchMock = makeFetch();

      sendTrafficBeacon({
        environment: { ...productionEnvironment, mode },
        pathname: '/esqueci-senha',
        navigator: { sendBeacon },
        fetch: fetchMock,
      });

      expect(sendBeacon).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    }
  });

  it('does not send on demo, local, test, or development hostnames', () => {
    for (const hostname of [
      'demo.agendai.com',
      'localhost',
      '127.0.0.1',
      '::1',
      'app.local',
      'test.agendai.com',
      'development.agendai.com',
    ]) {
      const sendBeacon = makeSendBeacon();
      const fetchMock = makeFetch();

      sendTrafficBeacon({
        environment: { ...productionEnvironment, hostname },
        pathname: '/esqueci-senha',
        navigator: { sendBeacon },
        fetch: fetchMock,
      });

      expect(sendBeacon).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    }
  });

  it('does not send when DNT or GPC is enabled', () => {
    const privacyEnvironments: TrafficBeaconEnvironmentOptions[] = [
      { ...productionEnvironment, doNotTrack: '1' },
      { ...productionEnvironment, windowDoNotTrack: '1' },
      { ...productionEnvironment, globalPrivacyControl: true },
    ];

    for (const environment of privacyEnvironments) {
      const sendBeacon = makeSendBeacon();
      const fetchMock = makeFetch();

      sendTrafficBeacon({
        environment,
        pathname: '/esqueci-senha',
        navigator: { sendBeacon },
        fetch: fetchMock,
      });

      expect(sendBeacon).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    }
  });

  it('recognizes only the allowlisted public marketing route patterns', () => {
    const staticRoutes = [
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
    ] as const;

    for (const route of staticRoutes) {
      expect(getTrafficBeaconRoute(route)).toBe(route);
    }

    expect(getTrafficBeaconRoute('/s/acme')).toBe('/s/:slug');
    expect(getTrafficBeaconRoute('/agendamento/abc123')).toBe('/agendamento/:token');

    for (const pathname of [
      '/master',
      '/master/overview',
      '/app',
      '/app/overview',
      '/login',
      '/cadastro',
      '/checkout',
      '/reset-password',
      '/queue',
      '/agendamento/gerenciar',
      '/rota-desconhecida',
      '/funcionalidades/extra',
      '/s/',
      '/s/acme/extra',
    ]) {
      expect(getTrafficBeaconRoute(pathname)).toBeNull();
    }
  });

  it('keeps every commercial intent route in the allowlist', () => {
    for (const page of COMMERCIAL_PAGES) {
      expect(getTrafficBeaconRoute(page.path)).toBe(page.path);
    }
  });

  it('rejects monitored route candidates that contain a query string or fragment', () => {
    expect(getTrafficBeaconRoute('/?utm_source=test')).toBeNull();
    expect(getTrafficBeaconRoute('/funcionalidades?origem=ads')).toBeNull();
    expect(getTrafficBeaconRoute('/agendamento/abc123?token=secret')).toBeNull();
    expect(getTrafficBeaconRoute('/s/acme#fragment')).toBeNull();
    expect(getTrafficBeaconRoute('/sobre#contato')).toBeNull();
  });

  it('maps the canonical public share URL to the literal pattern without the id', () => {
    const canonicalId = '0f9d4a1c-6f6f-4d0e-9d1e-2b7a5c8e1f33';

    expect(getTrafficBeaconRoute(`/s/salon/${canonicalId}`)).toBe('/s/:slug');
    expect(getTrafficBeaconRoute(`/s/salon/${canonicalId}?token=secret#frag`)).toBeNull();
    expect(getTrafficBeaconRoute('/s/salon/acme')).toBe('/s/:slug');
    expect(getTrafficBeaconRoute('/s/salon/')).toBeNull();
    // `/s/salon` sem id continua caindo na regra genérica de um segmento
    // (idêntico a `/s/acme` acima): sem um segmento a mais não há como
    // distingui-lo de um slug qualquer, e nenhum identificador é enviado.
    expect(getTrafficBeaconRoute('/s/salon')).toBe('/s/:slug');
    expect(getTrafficBeaconRoute(`/s/salon/${canonicalId}/extra`)).toBeNull();
    expect(getTrafficBeaconRoute(`/s/salon/${canonicalId}/../..`)).toBeNull();
  });
});

describe('trafficBeaconApi payloads', () => {
  it('sends the literal pattern and only the referrer hostname', async () => {
    const sendBeacon = makeSendBeacon();
    const fetchMock = makeFetch();

    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/planos',
      referrer: 'https://referrer.example/path?private=secret#fragment',
      navigator: { sendBeacon },
      fetch: fetchMock,
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe(beaconUrl);
    const body = sendBeacon.mock.calls[0][1];
    expect(body).toBeInstanceOf(Blob);
    expect((body as Blob).type).toBe('text/plain');
    expect(JSON.parse(await readBlob(body as Blob))).toEqual({
      p: '/planos',
      r: 'referrer.example',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('prevents the browser Referer header from carrying the current URL and restores the policy', () => {
    const browserDocument = document as DocumentWithReferrerPolicy;
    const originalPolicy = browserDocument.referrerPolicy;
    let policyDuringBeacon = '';
    const sendBeacon = vi.fn(() => {
      policyDuringBeacon = browserDocument.referrerPolicy;
      return true;
    });

    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/esqueci-senha',
      navigator: { sendBeacon },
    });

    expect(policyDuringBeacon).toBe('no-referrer');
    expect(browserDocument.referrerPolicy).toBe(originalPolicy);
  });

  it('uses the canonical share pattern with the public salon id and rejects query/fragment paths', async () => {
    const canonicalId = '0f9d4a1c-6f6f-4d0e-9d1e-2b7a5c8e1f33';
    const sendBeacon = makeSendBeacon();

    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/s/salon/${canonicalId}`,
      referrer: '',
      navigator: { sendBeacon },
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe(beaconUrl);
    const body = sendBeacon.mock.calls[0][1] as Blob;
    const payload = JSON.parse(await readBlob(body));
    // O id/slug público do salão é permitido (já está na URL compartilhada);
    // `salonType`/`kind` dizem ao backend a forma do id e o tipo do evento.
    expect(payload).toEqual({
      p: '/s/:slug',
      salon: canonicalId,
      salonType: 'id',
      kind: 'visit',
    });
    expect(Object.keys(payload).sort()).toEqual(['kind', 'p', 'salon', 'salonType']);

    sendBeacon.mockClear();
    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: `/s/salon/${canonicalId}?tab=profile&token=secret#anchor`,
      referrer: '',
      navigator: { sendBeacon },
    });

    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it('never includes tokens, queries or fragments in any payload', async () => {
    const sendBeacon = makeSendBeacon();
    const fetchMock = makeFetch();

    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/agendamento/private-token',
      referrer: '',
      navigator: { sendBeacon },
      fetch: fetchMock,
    });

    const secondBody = sendBeacon.mock.calls[0][1] as Blob;
    const secondPayload = JSON.parse(await readBlob(secondBody));
    expect(secondPayload).toEqual({ p: '/agendamento/:token' });
    expect(Object.keys(secondPayload)).toEqual(['p']);
    expect(JSON.stringify(secondPayload)).not.toContain('private-token');

    sendBeacon.mockClear();
    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/s/private-slug?token=private-token#private-fragment',
      referrer: '',
      navigator: { sendBeacon },
      fetch: fetchMock,
    });

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});


describe('trafficBeaconApi transport and exclusions', () => {
  it('falls back to a keepalive text/plain fetch when sendBeacon is false or absent', () => {
    const sendBeacon = makeSendBeacon(false);
    const fetchMock = makeFetch();

    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/esqueci-senha',
      navigator: { sendBeacon },
      fetch: fetchMock,
    });

    expect(fetchMock).toHaveBeenCalledWith(beaconUrl, {
      method: 'POST',
      body: JSON.stringify({ p: '/esqueci-senha' }),
      headers: { 'Content-Type': 'text/plain' },
      keepalive: true,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
      mode: 'cors',
    });

    fetchMock.mockClear();
    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/esqueci-senha',
      navigator: {},
      fetch: fetchMock,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(beaconUrl);
  });

  it('swallows beacon and fetch failures silently', async () => {
    const sendBeacon = vi.fn(() => {
      throw new Error('beacon failed');
    });
    const fetchMock = makeFetch(Promise.reject(new Error('network failed')));

    expect(() =>
      sendTrafficBeacon({
        environment: productionEnvironment,
        pathname: '/esqueci-senha',
        navigator: { sendBeacon },
        fetch: fetchMock,
      })
    ).not.toThrow();

    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const throwingFetch = vi.fn(() => {
      throw new Error('fetch failed synchronously');
    });
    expect(() =>
      sendTrafficBeacon({
        environment: productionEnvironment,
        pathname: '/esqueci-senha',
        navigator: {},
        fetch: throwingFetch,
      })
    ).not.toThrow();
  });

  it('does not send for internal or sensitive/non-allowlisted paths', () => {
    for (const pathname of [
      '/master',
      '/master/accounts/123',
      '/app',
      '/app/overview',
      '/login',
      '/cadastro',
      '/checkout',
      '/reset-password',
      '/queue',
      '/bloqueado',
      '/s',
      '/s/',
    ]) {
      const sendBeacon = makeSendBeacon();
      const fetchMock = makeFetch();

      sendTrafficBeacon({
        environment: productionEnvironment,
        pathname,
        navigator: { sendBeacon },
        fetch: fetchMock,
      });

      expect(sendBeacon).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    }
  });

  it('omits an invalid or empty referrer', () => {
    expect(createTrafficBeaconPayload('/esqueci-senha', '')).toEqual({
      p: '/esqueci-senha',
    });
    expect(createTrafficBeaconPayload('/esqueci-senha', 'not a URL')).toEqual({
      p: '/esqueci-senha',
    });
  });
});
