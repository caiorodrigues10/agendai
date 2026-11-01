import { expect } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured, test } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('segmentos: catálogo mostra módulos, features e contagem de salões', async ({ page }) => {
  await loginAsMaster(page);

  const [segmentsResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/segments')),
    page.goto('/master/segments'),
  ]);
  expect(segmentsResponse.status()).toBe(200);

  await expect(page.getByRole('heading', { level: 1, name: /Segmentos/ })).toBeVisible();
  await expect(page.getByText(/segmentos · .*salão\(ões\)/)).toBeVisible({ timeout: 15_000 });

  const search = page.getByRole('searchbox', { name: 'Buscar segmento' });
  await search.fill('barbearia');
  await expect(page.getByText(/Módulos visíveis:/).first()).toBeVisible();

  await search.fill('segmento-inexistente-e2e');
  await expect(page.getByText('Nenhum segmento encontrado')).toBeVisible();
});

test('segmentos: detalhe da conta exibe o card e o detalhe financeiro', async ({ page }) => {
  await loginAsMaster(page);

  const [accountsResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/accounts')),
    page.goto('/master/accounts'),
  ]);
  expect(accountsResponse.status()).toBe(200);

  const rows = page.locator('button').filter({ hasText: 'criada em' });
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  await rows.first().click();

  await expect(page).toHaveURL(/\/master\/accounts\/[0-9a-f-]{36}/);
  await expect(page.getByText('Segmento atual')).toBeVisible({ timeout: 15_000 });

  const [financialResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/financial/barbershops/')),
    page.getByRole('button', { name: /Ver detalhe financeiro do salão/ }).click(),
  ]);
  expect(financialResponse.status()).toBe(200);

  await expect(page.getByRole('button', { name: /Exportar CSV/ })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Faturas')).toBeVisible();
});
