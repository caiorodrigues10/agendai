/// <reference types="vitest/globals" />
import { API_BASE } from './apiClient';
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

  it('recognizes only the three allowlisted route shapes', () => {
    expect(getTrafficBeaconRoute('/esqueci-senha')).toBe('/esqueci-senha');
    expect(getTrafficBeaconRoute('/s/acme')).toBe('/s/:slug');
    expect(getTrafficBeaconRoute('/agendamento/abc123')).toBe('/agendamento/:token');
    expect(getTrafficBeaconRoute('/master')).toBeNull();
    expect(getTrafficBeaconRoute('/app/overview')).toBeNull();
    expect(getTrafficBeaconRoute('/login')).toBeNull();
    expect(getTrafficBeaconRoute('/checkout')).toBeNull();
    expect(getTrafficBeaconRoute('/reset-password')).toBeNull();
    expect(getTrafficBeaconRoute('/s/')).toBeNull();
    expect(getTrafficBeaconRoute('/s/acme/extra')).toBeNull();
  });
});

describe('trafficBeaconApi payloads', () => {
  it('sends the literal pattern and only the referrer hostname', async () => {
    const sendBeacon = makeSendBeacon();
    const fetchMock = makeFetch();

    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/s/acme',
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
      p: '/s/:slug',
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
      pathname: '/esqueci-senha?token=private-token',
      navigator: { sendBeacon },
    });

    expect(policyDuringBeacon).toBe('no-referrer');
    expect(browserDocument.referrerPolicy).toBe(originalPolicy);
  });

  it('never includes concrete slugs, tokens, queries, or fragments in the payload', async () => {
    const sendBeacon = makeSendBeacon();
    const fetchMock = makeFetch();

    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/s/private-slug?token=private-token#private-fragment',
      referrer: '',
      navigator: { sendBeacon },
      fetch: fetchMock,
    });

    const firstBody = sendBeacon.mock.calls[0][1] as Blob;
    const firstPayload = JSON.parse(await readBlob(firstBody));
    expect(firstPayload).toEqual({ p: '/s/:slug' });
    expect(Object.keys(firstPayload)).toEqual(['p']);
    expect(JSON.stringify(firstPayload)).not.toContain('private-slug');
    expect(JSON.stringify(firstPayload)).not.toContain('private-token');
    expect(JSON.stringify(firstPayload)).not.toContain('private-fragment');

    sendBeacon.mockClear();
    sendTrafficBeacon({
      environment: productionEnvironment,
      pathname: '/agendamento/gerenciar?manageToken=manage-secret',
      referrer: '',
      navigator: { sendBeacon },
      fetch: fetchMock,
    });

    const secondBody = sendBeacon.mock.calls[0][1] as Blob;
    const secondPayload = JSON.parse(await readBlob(secondBody));
    expect(secondPayload).toEqual({ p: '/agendamento/:token' });
    expect(Object.keys(secondPayload)).toEqual(['p']);
    expect(JSON.stringify(secondPayload)).not.toContain('gerenciar');
    expect(JSON.stringify(secondPayload)).not.toContain('manage-secret');
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
