import { expect, test } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('faturamento: aba análises mostra insights e oferece extrato CSV', async ({ page }) => {
  await loginAsMaster(page);

  await page.goto('/master/billing');
  await expect(page.getByRole('heading', { level: 1, name: 'Faturamento' })).toBeVisible();

  const [insightsResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/billing/insights')),
    page.getByRole('button', { name: /Análises/ }).click(),
  ]);
  expect(insightsResponse.status()).toBe(200);

  await expect(page.getByText('Análises financeiras')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Inadimplência por faixa')).toBeVisible();
  await expect(page.getByText('Coortes de assinaturas')).toBeVisible();
  await expect(page.getByText('Economia unitária')).toBeVisible();
  await expect(page.getByText('Previsão de recebimento')).toBeVisible();

  const [csvResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/billing/statement.csv')),
    page.getByRole('button', { name: /Extrato CSV/ }).click(),
  ]);
  expect(csvResponse.status()).toBe(200);
  expect(csvResponse.headers()['content-type']).toContain('text/csv');
});
