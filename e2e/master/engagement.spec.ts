import { expect, test } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('engajamento: funil, adoção, NPS, suporte e risco de churn', async ({ page }) => {
  await loginAsMaster(page);

  const [summaryResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/engagement/summary')),
    page.goto('/master/engagement'),
  ]);
  expect(summaryResponse.status()).toBe(200);

  await expect(page.getByRole('heading', { level: 1, name: 'Engajamento' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Funil de ativação' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByRole('heading', { name: 'Adoção por recurso' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'NPS' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Suporte e SLA' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Risco de churn' })).toBeVisible();

  await page.getByRole('button', { name: /Atualizar/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Engajamento' })).toBeVisible();
});
