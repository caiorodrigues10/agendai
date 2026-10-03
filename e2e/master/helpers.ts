import type { Page } from '@playwright/test';

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

export async function acceptCookies(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('agendai:cookie-consent-v2', 'all');
    localStorage.removeItem('agendai:cookie-consent');
  });
}

export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  const form = page.locator('form').filter({ has: page.locator('#login-password') });
  await form.locator('input[type="email"]').fill(email);
  await form.locator('#login-password').fill(password);
  await form.getByRole('button', { name: 'Entrar', exact: true }).click();
}

export async function loginAsMaster(page: Page): Promise<void> {
  await login(page, MASTER_EMAIL, MASTER_PASSWORD);
  await page.waitForURL(/\/master\//, { timeout: 30_000 });
}
