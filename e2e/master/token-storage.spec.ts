import { expect } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured, test } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('access token só em memória: nenhum token no storage e sessão sobrevive ao reload', async ({
  page,
  context,
}) => {
  await loginAsMaster(page);
  await page.goto('/master/overview');
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible({ timeout: 30_000 });

  const storage = await page.evaluate(() => ({
    local: JSON.stringify(localStorage),
    session: JSON.stringify(sessionStorage),
  }));

  expect(storage.local).not.toContain('barber_access_token');
  expect(storage.local).not.toContain('barber_refresh_token');
  expect(storage.session).not.toContain('barber_access_token');
  expect(storage.session).not.toContain('barber_refresh_token');

  const refreshCookie = (await context.cookies()).find((cookie) => cookie.name === 'refresh_token');
  expect(refreshCookie, 'cookie HTTP-only de refresh deve existir após o login').toBeTruthy();
  expect(refreshCookie?.httpOnly).toBe(true);

  // A sessão não depende de token em storage: recarrega e segue autenticado
  // graças ao cookie HTTP-only.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible({ timeout: 30_000 });

  const storageAfterReload = await page.evaluate(() => JSON.stringify(localStorage));
  expect(storageAfterReload).not.toContain('barber_access_token');
  expect(storageAfterReload).not.toContain('barber_refresh_token');
});
