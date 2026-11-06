import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';

/**
 * Item P1 — precache contido (≤ 3.185.427 B, baseline R7) e shell offline.
 *
 * Três garantias:
 *   1. gate estático: a soma dos arquivos do `precacheAndRoute` de `dist/sw.js`
 *      não estoura o limite da rodada (mesmo papel do gate de chunks >500 kB);
 *   2. após a primeira visita, TODAS as rotas públicas abram offline — inclusive
 *      as carregadas por lazy() (sem elas no precache a rota cai no
 *      ErrorBoundary; foi a falha que motivou fechar o fechamento inteiro);
 *   3. chunks fora do precache (painel etc.) entram no cache de runtime
 *      (`StaleWhileRevalidate` de /assets/) e passam a abrir offline.
 */

const PRECACHE_LIMIT = 3_185_427;

const PUBLIC_ROUTES = [
  '/',
  '/funcionalidades',
  '/ia-preditiva',
  '/agendamento',
  '/sobre',
  '/contato',
  '/privacidade',
  '/termos',
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/planos',
  '/queue',
  '/sistema-para-barbearia',
];

/** Espera o SW instalar (precache completo) e assumir o controle da página. */
async function waitForServiceWorker(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        });
      });
    }
    const names = await caches.keys();
    const entries = (
      await Promise.all(names.map((name) => caches.open(name).then((cache) => cache.keys())))
    ).flat();
    if (entries.length < 50) {
      throw new Error(`precache incompleto após ativação (${entries.length} entradas)`);
    }
  });
}

/** Escolhe um chunk real que NÃO está no precache (painel autenticado). */
function findRuntimeChunk(): string {
  const sw = fs.readFileSync('dist/sw.js', 'utf8');
  const match = sw.match(/precacheAndRoute\(\[(.*?)\]/s);
  const preclosed = new Set(
    [...(match?.[1] ?? '').matchAll(/url:\s*"([^"]+)"/g)].map(m => m[1]),
  );
  const chunk = fs
    .readdirSync(path.resolve('dist/assets'))
    .filter(f => f.endsWith('.js'))
    .map(f => `assets/${f}`)
    .filter(f => !preclosed.has(f))
    .sort()[0];
  if (!chunk) throw new Error('nenhum chunk fora do precache encontrado em dist/assets');
  return `/${chunk}`;
}

test.describe('PWA offline (item P1)', () => {
  test.use({ serviceWorkers: 'allow' });
  test.setTimeout(240_000);

  test('gate — precache do dist/sw.js fica em 3.185.427 B ou menos', () => {
    test.skip(!fs.existsSync('dist/sw.js'), 'dist indisponível (preview reutilizado sem build)');

    const output = execFileSync(
      'node',
      ['scripts/precache-report.mjs', `--limit=${PRECACHE_LIMIT}`],
      { encoding: 'utf8' },
    );
    expect(output).toContain('OK:');
  });

  test('todas as rotas públicas abrem offline e a API falha sem quebrar', async ({
    page,
    context,
  }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 45_000 });
    await waitForServiceWorker(page);

    await context.setOffline(true);

    // Controle: o offline precisa de fato alcançar o SW (senão este teste
    // passaria por acaso). /api/ é NetworkOnly, então a chamada deve falhar.
    const api = await page
      .evaluate(() => fetch('/api/plans').then(() => 'ok').catch(() => 'erro'))
      .catch(() => 'erro');
    expect(api).toBe('erro');

    for (const route of PUBLIC_ROUTES) {
      await page.goto(route, { waitUntil: 'load', timeout: 30_000 });
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
    }

    // /planos: shell precached + API NetworkOnly → banner de erro amigável.
    await page.goto('/planos', { waitUntil: 'load', timeout: 30_000 });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Não foi possível conectar ao servidor/)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('chunk fora do precache vira acesso offline via cache de runtime', async ({
    page,
    context,
  }) => {
    const chunk = findRuntimeChunk();

    await page.goto('/', { waitUntil: 'load', timeout: 45_000 });
    await waitForServiceWorker(page);

    // Busca pelo SW (página controlada): StaleWhileRevalidate guarda a resposta.
    const online = await page.evaluate(url => fetch(url).then(r => r.ok).catch(() => false), chunk);
    expect(online).toBe(true);
    await page.waitForTimeout(1000);

    await context.setOffline(true);
    const offline = await page.evaluate(url =>
      fetch(url)
        .then(r => r.text())
        .then(t => (t.length > 0 ? 'ok' : 'vazio'))
        .catch(() => 'erro'),
      chunk,
    );
    expect(offline).toBe('ok');
  });
});
