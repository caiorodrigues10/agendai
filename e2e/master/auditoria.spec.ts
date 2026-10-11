import { expect } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured, test } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('auditoria filtra pela URL e exporta o CSV', async ({ page }) => {
  await loginAsMaster(page);

  const [auditResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/audit-logs?')),
    page.goto('/master/audit'),
  ]);
  expect(auditResponse.status()).toBe(200);

  await expect(page.getByRole('heading', { name: 'Auditoria' })).toBeVisible();

  await expect(page.getByText('Alertas sensíveis (24h)')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Sessões de acesso')).toBeVisible();

  await page.getByRole('button', { name: 'Detalhes' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Detalhes do registro')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar detalhes' }).click();
  await expect(dialog).not.toBeVisible();

  await page.getByLabel('Busca', { exact: true }).fill('switch');
  await page.getByRole('button', { name: 'Filtrar' }).click();
  await expect(page).toHaveURL(/[?&]q=switch/);
  await expect(page.getByText('Nenhum registro encontrado.')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Exportar CSV/ })).toBeEnabled();

  const downloadPromise = page.waitForEvent('download');
  const exportResponsePromise = page.waitForResponse((res) =>
    res.url().includes('/api/admin/audit-logs/export'),
  );
  await page.getByRole('button', { name: /Exportar CSV/ }).click();

  const exportResponse = await exportResponsePromise;
  expect(exportResponse.status()).toBe(200);

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^auditoria-\d{4}-\d{2}-\d{2}\.csv$/);
});
