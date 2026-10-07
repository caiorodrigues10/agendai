import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test as base } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

export const MASTER_EMAIL = process.env.E2E_MASTER_EMAIL ?? '';
export const MASTER_PASSWORD = process.env.E2E_MASTER_PASSWORD ?? '';
export const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? '';
export const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? '';

export const masterConfigured = Boolean(MASTER_EMAIL && MASTER_PASSWORD);
export const ownerConfigured = Boolean(OWNER_EMAIL && OWNER_PASSWORD);

export const MASTER_SKIP =
  'E2E do master: defina E2E_BASE_URL (dev server :3003), E2E_MASTER_EMAIL e E2E_MASTER_PASSWORD';

export const OWNER_SKIP =
  'Acesso negado: defina E2E_OWNER_EMAIL e E2E_OWNER_PASSWORD (usuário OWNER de teste)';

/**
 * `/auth/login` e `/auth/refresh` compartilham rate limit por IP. Com o access
 * token guardado só em memória, todo load de página renova a sessão — ou seja,
 * rotaciona o refresh token — e o estado salvo no início do teste ficaria
 * obsoleto na hora. Por isso o cache é regravado AO FIM de cada teste.
 *
 * Specs que importam `test` deste arquivo recebem a fixture automática abaixo.
 */
const STATE_MAX_AGE_MS = 30 * 60_000;
const RATE_LIMIT_WINDOW_MS = 61_000;
const LOGIN_ATTEMPTS = 2;

const stateBase = (process.env.E2E_BASE_URL ?? 'local').replace(/[^a-z0-9]+/gi, '-');
const MASTER_STATE_FILE = path.join(os.tmpdir(), `agendai-e2e-master-${stateBase}.json`);

export async function acceptCookies(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('agendai:cookie-consent-v2', 'all');
    localStorage.removeItem('agendai:cookie-consent');
  });
}

export async function login(page: Page, email: string, password: string): Promise<void> {
  for (let attempt = 1; attempt <= LOGIN_ATTEMPTS; attempt += 1) {
    await page.goto('/login');
    const form = page.locator('form').filter({ has: page.locator('#login-password') });
    await form.locator('input[type="email"]').fill(email);
    await form.locator('#login-password').fill(password);

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'POST' && res.url().includes('/api/auth/login'),
      ),
      form.getByRole('button', { name: 'Entrar', exact: true }).click(),
    ]);

    if (response.status() !== 429 || attempt === LOGIN_ATTEMPTS) return;
    // Espera a janela de 1 minuto do rate limit virar antes de tentar de novo.
    await page.waitForTimeout(RATE_LIMIT_WINDOW_MS);
  }
}

/** Restaura a sessão master salva; devolve false quando ela não serve mais. */
async function restoreMasterSession(page: Page): Promise<boolean> {
  try {
    const stat = fs.statSync(MASTER_STATE_FILE);
    if (Date.now() - stat.mtimeMs > STATE_MAX_AGE_MS) return false;

    const state = JSON.parse(fs.readFileSync(MASTER_STATE_FILE, 'utf8')) as StorageState;
    const stored = state.origins?.[0]?.localStorage ?? [];
    // Sem usuário em cache não há sessão para restaurar (o app cairia em /login).
    if (!stored.some((item) => item.name === 'barber_user')) return false;

    // A sessão vive em cookie HTTP-only (`refresh_token`, path /api/auth).
    // Sem ele — ou com ele expirado — não há o que restaurar.
    const cookies = state.cookies ?? [];
    const refreshCookie = cookies.find((cookie) => cookie.name === 'refresh_token');
    if (!refreshCookie || refreshCookie.expires * 1000 <= Date.now()) return false;

    await page.context().addCookies(cookies);

    // Comprova a sessão contra o backend: o refresh rotaciona o token a cada
    // navegação, então o cache pode estar um passo atrás. Cookies inválidos são
    // descartados aqui (o teste segue com login novo) em vez de derrubar o app
    // em /login no meio de uma asserção.
    const check = await page.context().request.post('/api/auth/refresh', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    if (!check.ok()) {
      fs.rmSync(MASTER_STATE_FILE, { force: true });
      return false;
    }

    // Usuário em cache é aplicado na próxima navegação: dispensa uma carga
    // extra (e um refresh extra) só para semear o localStorage.
    await page.addInitScript((items) => {
      for (const item of items) localStorage.setItem(item.name, item.value);
    }, stored);
    return true;
  } catch {
    return false;
  }
}

async function saveMasterSession(page: Page): Promise<void> {
  try {
    const state = await page.context().storageState();
    fs.writeFileSync(MASTER_STATE_FILE, JSON.stringify(state));
  } catch {
    // Cache é opcional: falha aqui não pode derrubar o teste.
  }
}

/**
 * Grava o estado ao fim do teste, quando a sessão ativa é do master. Sessões de
 * outro papel (OWNER no `acesso-negado`) ou contextos vazios (spec que só abre
 * `browser.newContext`) são ignorados para não contaminar o cache master.
 *
 * O papel em cache vem cru da API (`admin`), então a comparação é feita pelo
 * e-mail do master, que a suíte já recebe por env.
 */
async function persistMasterSession(context: BrowserContext): Promise<void> {
  try {
    const state = await context.storageState();
    const stored = state.origins?.[0]?.localStorage ?? [];
    const rawUser = stored.find((item) => item.name === 'barber_user')?.value;
    if (!rawUser) return;
    const email = (JSON.parse(rawUser) as { email?: string } | null)?.email?.toLowerCase();
    if (!email || email !== MASTER_EMAIL.toLowerCase()) return;

    const refreshCookie = (state.cookies ?? []).find((cookie) => cookie.name === 'refresh_token');
    if (!refreshCookie || refreshCookie.expires * 1000 <= Date.now()) return;
    fs.writeFileSync(MASTER_STATE_FILE, JSON.stringify(state));
  } catch {
    // Cache é opcional: falha aqui não pode derrubar o teste.
  }
}

/**
 * `test` compartilhado da suíte master: além do `test` padrão do Playwright,
 * mantém o cache de sessão master atualizado depois de cada teste.
 */
export const test = base.extend<{ masterSessionCache: void }>({
  masterSessionCache: [
    async ({ context }, use) => {
      await use();
      await persistMasterSession(context);
    },
    { auto: true },
  ],
});

export async function loginAsMaster(page: Page): Promise<void> {
  if (await restoreMasterSession(page)) return;

  await login(page, MASTER_EMAIL, MASTER_PASSWORD);
  await page.waitForURL(/\/master\//, { timeout: 30_000 });
  await saveMasterSession(page);
}
