import os from 'node:os';
import { expect, test, type Page, type Route } from '@playwright/test';

/**
 * Prova browser-level do beacon privado (`POST /api/ping`).
 *
 * O beacon só liga em build `production` com `VITE_TRAFFIC_BEACON_ENABLED` e
 * NUNCA em host local (`localhost`, `127.0.0.1`, `0.0.0.0` e `::1` são
 * bloqueados pela guarda em `trafficBeaconApi.ts`). O e2e precisa, portanto,
 * de um build com a flag ligada e de uma origem que não seja loopback.
 *
 * Origem: o `vite preview` sobe com `--host 0.0.0.0` e a página é aberta pelo
 * IP privado da máquina, descoberto em tempo de execução (en0/eth0/etc. —
 * nada de IP fixo no teste). Um `Host` de domínio é recusado com 403 pelo
 * preview, então só um IP serve; `169.254.*` (link-local) é descartado.
 *
 * Secure context: `crypto.randomUUID()` (chamado no boot da SPA pelo client-id
 * da fila) só existe em secure context — e produção é HTTPS. A origem de teste
 * é `http://<IP>` (não-loopback), então o spec injeta um shim de UUID v4 no
 * navegador de teste (nada de tocar no app): o beacon em si não usa crypto.
 * A flag `--unsafely-treat-insecure-origin-as-secure` foi testada e está
 * inerte no Chromium 151 usado pelo Playwright.
 *
 * Build: `VITE_TRAFFIC_BEACON_ENABLED=true` é injetado no build do
 * `webServer` pelo step `E2E (chromium)` do CI — mesmo padrão do
 * `VITE_GOOGLE_CLIENT_ID`. Localmente:
 *
 *   VITE_TRAFFIC_BEACON_ENABLED=true npx playwright test e2e/traffic-beacon.spec.ts
 */

const PREVIEW_PORT = 4173;
const CANONICAL_SALON_ID = '0f9d4a1c-6f6f-4d0e-9d1e-2b7a5c8e1f33';

interface CapturedPing {
  url: string;
  contentType: string;
  body: string;
}

/** IPs locais que o navegador consegue alcançar (o preview escuta em 0.0.0.0). */
function candidateIps(): string[] {
  return Object.values(os.networkInterfaces())
    .flatMap(entries => entries ?? [])
    .filter(entry => entry.family === 'IPv4' && !entry.internal)
    .map(entry => entry.address)
    .filter(address => !address.startsWith('169.254.'));
}

/**
 * Escolhe a origem testando cada IP: interface sem rota local (VPN caída,
 * bridge inerte) é pulada em vez de quebrar o teste.
 */
async function resolveAppOrigin(): Promise<string> {
  for (const ip of candidateIps()) {
    try {
      const response = await fetch(`http://${ip}:${PREVIEW_PORT}/`, { method: 'HEAD' });
      if (response.ok) return `http://${ip}:${PREVIEW_PORT}`;
    } catch {
      // Sem rota até este IP — tenta o próximo.
    }
  }

  throw new Error(
    `nenhum IP privado respondeu em :${PREVIEW_PORT} — o preview precisa subir com --host 0.0.0.0`
  );
}

// Sonda uma vez por execução da suíte.
let appOriginPromise: Promise<string> | undefined;
const appOrigin = (): Promise<string> => (appOriginPromise ??= resolveAppOrigin());

async function capturePings(page: Page, sink: CapturedPing[], respond?: (url: string) => unknown): Promise<void> {
  await page.route('**/api/**', async (route: Route) => {
    const request = route.request();
    const url = request.url();
    if (new URL(url).pathname !== '/api/ping') {
      const body = respond ? respond(url) : { success: true, data: null };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      return;
    }

    sink.push({
      url: request.url(),
      contentType: request.headers()['content-type'] ?? '',
      body: request.postDataBuffer()?.toString('utf8') ?? '',
    });
    await route.fulfill({ status: 204 });
  });
}

/**
 * Resposta mínima para a página pública do salão renderizar as abas (mesmo
 * padrão de `e2e/queue-content-mark.spec.ts`): sem ela a página fica no
 * skeleton e a troca de aba não é clicável.
 */
function publicShopResponseBody(url: string): unknown {
  if (url.includes('/schedule')) return [];
  if (url.includes('/services')) return [];
  if (url.includes('/staff')) return [];
  if (url.includes('/feed')) return [];
  if (url.includes('/queue/metrics')) {
    return { success: true, data: { completedCount: 0, peopleWaiting: 0 } };
  }
  if (url.includes('/queue')) return { success: true, data: [] };
  return {
    success: true,
    data: { id: CANONICAL_SALON_ID, name: 'Salão E2E', whatsapp: '11999999999', active: true },
  };
}

/**
 * Deixa a página nas condições do teste, antes de qualquer script do app:
 *
 * 1. `crypto.randomUUID` só existe em contexto seguro (HTTPS/loopback) e um
 *    host não-loopback é justamente o que a guarda do beacon exige — sem este
 *    adaptador o app quebra no mount (`readClientId` em
 *    `src/utils/clientIdStorage.ts`) e o listener nem nasce. É um detalhe de
 *    ambiente: nenhum comportamento do beacon é falsificado aqui.
 * 2. Sinais de privacidade fixados para o caso testado (DNT/GPC ligados ou não).
 */
async function preparePage(
  page: Page,
  signals: { doNotTrack?: string | null; globalPrivacyControl?: boolean } = {}
): Promise<void> {
  await page.addInitScript(value => {
    // Consentimento do cookie banner: ambiente do teste, não do beacon.
    localStorage.setItem('agendai:cookie-consent', 'accepted');

    // `Crypto.prototype` já declara `randomUUID` com o tipo do template UUID;
    // o adaptador devolve `string`, então o objeto é tipado como `{ ... }`.
    const proto: { randomUUID?: unknown } = Crypto.prototype;
    if (typeof proto.randomUUID !== 'function') {
      proto.randomUUID = () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
          const byte = crypto.getRandomValues(new Uint8Array(1))[0];
          const next = char === 'x' ? byte % 16 : (byte & 0x3) | 0x8;
          return next.toString(16);
        });
    }

    Object.defineProperty(navigator, 'doNotTrack', {
      configurable: true,
      get: () => value.doNotTrack ?? null,
    });
    Object.defineProperty(window, 'doNotTrack', {
      configurable: true,
      get: () => value.doNotTrack ?? null,
    });
    Object.defineProperty(navigator, 'globalPrivacyControl', {
      configurable: true,
      get: () => value.globalPrivacyControl ?? false,
    });
  }, signals);
}

async function expectNoPing(page: Page, sink: CapturedPing[]): Promise<void> {
  await page.waitForTimeout(750);
  expect(sink).toHaveLength(0);
}

test.describe('beacon privado de tráfego', () => {
  test('envia POST /api/ping text/plain com o padrão canônico e o id público do salão, sem token ou fragmento', async ({
    page,
  }) => {
    const pings: CapturedPing[] = [];
    await preparePage(page);
    await capturePings(page, pings);

    await page.goto(
      `${await appOrigin()}/s/salon/${CANONICAL_SALON_ID}?tab=profile&token=secret#anchor`
    );
    await expect.poll(() => pings.length, { timeout: 10_000 }).toBe(1);

    const [ping] = pings;
    const url = new URL(ping.url);
    expect(url.pathname).toBe('/api/ping');
    expect(url.search).toBe('');
    expect(url.hash).toBe('');
    expect(ping.contentType).toMatch(/^text\/plain/);

    // Só campos permitidos: padrão literal, id público do salão (já está na
    // URL compartilhada), o tipo do identificador, o tipo do evento e a aba
    // da allowlist. Nunca token, query ou fragmento.
    const payload = JSON.parse(ping.body);
    expect(payload).toEqual({
      p: '/s/:slug',
      salon: CANONICAL_SALON_ID,
      salonType: 'id',
      kind: 'visit',
      tab: 'profile',
    });
    expect(Object.keys(payload).sort()).toEqual(['kind', 'p', 'salon', 'salonType', 'tab']);
    expect(ping.body).not.toContain('secret');
    expect(ping.body).not.toContain('anchor');

    // Uma única emissão por navegação (sem duplicar no StrictMode).
    await page.waitForTimeout(500);
    expect(pings).toHaveLength(1);
  });

  test('atribui /queue/:id ao salão: 1 ping visit por entrada, 1 ping tab por troca de aba', async ({
    page,
  }) => {
    const pings: CapturedPing[] = [];
    await preparePage(page);
    await capturePings(page, pings, publicShopResponseBody);

    const origin = await appOrigin();

    // Rota da fila: uma entrada = exatamente 1 ping `visit` (a página reporta
    // a própria visita; o listener global não emite para /queue/:id).
    await page.goto(`${origin}/queue/${CANONICAL_SALON_ID}`);
    await expect.poll(() => pings.length, { timeout: 15_000 }).toBe(1);

    const visitPing = JSON.parse(pings[0].body);
    expect(visitPing).toEqual({
      p: '/queue/:id',
      salon: CANONICAL_SALON_ID,
      salonType: 'id',
      kind: 'visit',
      tab: 'queue',
    });
    expect(Object.keys(visitPing).sort()).toEqual(['kind', 'p', 'salon', 'salonType', 'tab']);
    expect(pings[0].body).not.toContain('token');
    expect(new URL(pings[0].url).search).toBe('');

    // Troca de aba (sem navegação): 1 ping `tab`, nunca uma nova visita.
    await page.getByRole('tab', { name: 'Agenda', exact: true }).click();
    await expect.poll(() => pings.length, { timeout: 10_000 }).toBe(2);
    const tabPagePing = JSON.parse(pings[1].body);
    expect(tabPagePing).toEqual({
      p: '/queue/:id',
      salon: CANONICAL_SALON_ID,
      salonType: 'id',
      kind: 'tab',
      tab: 'appointments',
    });
    await page.waitForTimeout(500);
    expect(pings).toHaveLength(2);

    // Deep link com aba: um único ping `visit`, com a aba já resolvida.
    const deepLinkIndex = pings.length;
    await page.goto(`${origin}/queue/${CANONICAL_SALON_ID}?tab=profile&utm_source=ads`);
    await expect
      .poll(() => pings.length, { timeout: 15_000 })
      .toBe(deepLinkIndex + 1);
    const deepLinkPing = JSON.parse(pings[deepLinkIndex].body);
    expect(deepLinkPing).toEqual({
      p: '/queue/:id',
      salon: CANONICAL_SALON_ID,
      salonType: 'id',
      kind: 'visit',
      tab: 'profile',
    });
    expect(pings[deepLinkIndex].body).not.toContain('utm_source');

    // Vitrine de produto: 1 ping `visit` com o padrão literal + salão —
    // nunca o productId e sem tab.
    const productIndex = pings.length;
    const productId = '98765432-1234-4321-8765-432109876543';
    await page.goto(`${origin}/queue/${CANONICAL_SALON_ID}/produtos/${productId}`);
    await expect
      .poll(() => pings.length, { timeout: 15_000 })
      .toBe(productIndex + 1);
    const productPing = JSON.parse(pings[productIndex].body);
    expect(productPing).toEqual({
      p: '/queue/:id/produtos/:productId',
      salon: CANONICAL_SALON_ID,
      salonType: 'id',
      kind: 'visit',
    });
    expect(pings[productIndex].body).not.toContain(productId);
    expect(Object.keys(productPing).sort()).toEqual(['kind', 'p', 'salon', 'salonType']);
  });

  test('aceita um slug simples e a rota de esqueci-senha, sempre sem valores dinâmicos', async ({
    page,
  }) => {
    const pings: CapturedPing[] = [];
    await preparePage(page);
    await capturePings(page, pings);

    const origin = await appOrigin();
    await page.goto(`${origin}/s/acme-barbearia`);
    await expect.poll(() => pings.length, { timeout: 10_000 }).toBe(1);
    expect(JSON.parse(pings[0].body)).toEqual({
      p: '/s/:slug',
      salon: 'acme-barbearia',
      salonType: 'slug',
      kind: 'visit',
    });

    await page.goto(`${origin}/esqueci-senha?token=reset-secret#frag`);
    await expect.poll(() => pings.length, { timeout: 10_000 }).toBe(2);
    expect(JSON.parse(pings[1].body)).toEqual({ p: '/esqueci-senha' });
    expect(pings[1].body).not.toContain('reset-secret');
    expect(new URL(pings[1].url).search).toBe('');
  });

  test('emite nas páginas públicas monitoradas e não emite em rotas fora da allowlist', async ({
    page,
  }) => {
    const pings: CapturedPing[] = [];
    await preparePage(page);
    await capturePings(page, pings);

    const origin = await appOrigin();
    for (const route of ['/', '/agendamento', '/app-para-agendamento-de-salao']) {
      await page.goto(`${origin}${route}`);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
      await expect.poll(() => pings.length, { timeout: 10_000 }).toBeGreaterThan(0);
    }

    expect(pings.map(ping => JSON.parse(ping.body).p)).toEqual([
      '/',
      '/agendamento',
      '/app-para-agendamento-de-salao',
    ]);

    const pingCountBeforeExcludedRoutes = pings.length;
    for (const route of ['/login', '/reset-password', '/master/overview']) {
      await page.goto(`${origin}${route}`);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
    }

    await page.waitForTimeout(750);
    expect(pings).toHaveLength(pingCountBeforeExcludedRoutes);
  });

  test('respeita Do Not Track: nenhum beacon com DNT ativo', async ({ page }) => {
    const pings: CapturedPing[] = [];
    await preparePage(page, { doNotTrack: '1' });
    await capturePings(page, pings);

    const origin = await appOrigin();
    await page.goto(`${origin}/esqueci-senha`);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });

    // A atribuição de salão obedece às mesmas guardas do beacon global.
    await page.goto(`${origin}/queue/${CANONICAL_SALON_ID}?tab=profile`);
    await page.waitForTimeout(500);

    await expectNoPing(page, pings);
  });
});
