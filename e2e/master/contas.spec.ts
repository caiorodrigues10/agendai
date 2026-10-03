import { expect, test } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('contas: lista salões, filtra via URL e abre o detalhe', async ({ page }) => {
  await loginAsMaster(page);

  const [accountsResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/accounts')),
    page.goto('/master/accounts'),
  ]);
  expect(accountsResponse.status()).toBe(200);

  await expect(page.getByRole('heading', { name: 'Contas dos salões' })).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'Buscar contas' });
  await search.fill('E2E');
  await search.press('Enter');
  await expect(page).toHaveURL(/[?&]q=E2E/);

  const rows = page.locator('button').filter({ hasText: 'criada em' });
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  await rows.first().click();

  await expect(page).toHaveURL(/\/master\/accounts\/[0-9a-f-]{36}/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
