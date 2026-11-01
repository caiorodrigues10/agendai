import { expect } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured, test } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('crm: histórico de execuções lista runs com filtros e paginação', async ({ page }) => {
  await loginAsMaster(page);

  const [runsResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/crm/backfill/runs')),
    page.goto('/master/crm'),
  ]);
  expect(runsResponse.status()).toBe(200);

  await expect(page.getByRole('heading', { level: 1, name: 'CRM' })).toBeVisible();
  await expect(page.getByText('Histórico de execuções')).toBeVisible({ timeout: 15_000 });

  const statusFilter = page.getByRole('combobox', { name: 'Filtrar por status' });
  const [filteredResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('status=FAILED')),
    statusFilter.selectOption('FAILED'),
  ]);
  expect(filteredResponse.status()).toBe(200);

  const scopeFilter = page.getByRole('combobox', { name: 'Filtrar por escopo' });
  const [scopedResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('scope=GLOBAL')),
    scopeFilter.selectOption('GLOBAL'),
  ]);
  expect(scopedResponse.status()).toBe(200);

  await expect(page.getByRole('button', { name: /Reprocessar todos os salões ativos|Reprocessamento em andamento/ })).toBeVisible();
});
