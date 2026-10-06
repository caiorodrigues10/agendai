import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
 * `/auth/login` tem rate limit de 10/min por IP. A suíte inteira loga mais
 * que isso se cada spec fizer um login, então a sessão master é reaproveitada
 * entre specs (e o login a sério vira exceção).
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
    if (stored.length === 0) return false;

    await page.goto('/');
    await page.evaluate((items) => {
      for (const item of items) localStorage.setItem(item.name, item.value);
    }, stored);

    const valid = await page.evaluate(async () => {
      const token = localStorage.getItem('barber_access_token');
      if (!token) return false;
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      return res.ok;
    });

    if (!valid) {
      await page.evaluate(() => localStorage.clear());
      return false;
    }
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

export async function loginAsMaster(page: Page): Promise<void> {
  if (await restoreMasterSession(page)) return;

  await login(page, MASTER_EMAIL, MASTER_PASSWORD);
  await page.waitForURL(/\/master\//, { timeout: 30_000 });
  await saveMasterSession(page);
}
