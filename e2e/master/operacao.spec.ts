import { expect, test } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('operação mostra saúde de serviços e notificações', async ({ page }) => {
  await loginAsMaster(page);

  const [healthResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/operations/health')),
    page.goto('/master/operations'),
  ]);
  expect(healthResponse.status()).toBe(200);

  await expect(page.getByRole('heading', { name: 'Operação' })).toBeVisible();
  await expect(page.getByText('Saúde das notificações')).toBeVisible();
  await expect(page.getByText(/não foi possível/i)).toHaveCount(0);
});
