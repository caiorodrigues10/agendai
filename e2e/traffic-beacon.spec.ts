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

async function capturePings(page: Page, sink: CapturedPing[]): Promise<void> {
  await page.route('**/api/**', async (route: Route) => {
    const request = route.request();
    if (new URL(request.url()).pathname !== '/api/ping') {
      await route.fulfill({ json: { success: true, data: null } });
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
  test('envia POST /api/ping text/plain com o padrão da URL canônica, sem id, query ou fragmento', async ({
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

    expect(JSON.parse(ping.body)).toEqual({ p: '/s/:slug' });
    expect(ping.body).not.toContain(CANONICAL_SALON_ID);
    expect(ping.body).not.toContain('secret');
    expect(ping.body).not.toContain('profile');

    // Uma única emissão por navegação (sem duplicar no StrictMode).
    await page.waitForTimeout(500);
    expect(pings).toHaveLength(1);
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
    expect(JSON.parse(pings[0].body)).toEqual({ p: '/s/:slug' });
    expect(pings[0].body).not.toContain('acme-barbearia');

    await page.goto(`${origin}/esqueci-senha?token=reset-secret#frag`);
    await expect.poll(() => pings.length, { timeout: 10_000 }).toBe(2);
    expect(JSON.parse(pings[1].body)).toEqual({ p: '/esqueci-senha' });
    expect(pings[1].body).not.toContain('reset-secret');
    expect(new URL(pings[1].url).search).toBe('');
  });

  test('conta as páginas públicas literais do site, sem query nem fragmento', async ({ page }) => {
    const pings: CapturedPing[] = [];
    await preparePage(page);
    await capturePings(page, pings);

    const origin = await appOrigin();
    const routes = ['/', '/funcionalidades', '/app-para-agendamento-de-salao', '/planos'];

    for (const [index, route] of routes.entries()) {
      await page.goto(`${origin}${route}?origem=ads#topo`);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
      await expect.poll(() => pings.length, { timeout: 10_000 }).toBe(index + 1);

      const ping = pings[index];
      expect(JSON.parse(ping.body)).toEqual({ p: route });
      expect(ping.body).not.toContain('origem=ads');
      expect(new URL(ping.url).search).toBe('');
    }
  });

  test('não emite beacon para rotas fora da lista monitorada', async ({ page }) => {
    const pings: CapturedPing[] = [];
    await preparePage(page);
    await capturePings(page, pings);

    const origin = await appOrigin();
    // Rotas de acesso e telas que não existem na lista pública: nada é enviado.
    for (const route of ['/login', '/reset-password']) {
      await page.goto(`${origin}${route}`);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
    }

    await expectNoPing(page, pings);
  });

  test('respeita Do Not Track: nenhum beacon com DNT ativo', async ({ page }) => {
    const pings: CapturedPing[] = [];
    await preparePage(page, { doNotTrack: '1' });
    await capturePings(page, pings);

    await page.goto(`${await appOrigin()}/esqueci-senha`);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });

    await expectNoPing(page, pings);
  });
});
