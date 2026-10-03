import { expect, test } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('visão geral carrega dados reais e responde à troca de período', async ({ page }) => {
  await loginAsMaster(page);

  const [overviewResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/overview')),
    page.goto('/master/overview'),
  ]);
  expect(overviewResponse.status()).toBe(200);

  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Período' })).toBeVisible();
  await expect(page.getByText(/não foi possível/i)).toHaveCount(0);

  const periodGroup = page.getByRole('group', { name: 'Período' });
  await periodGroup.getByRole('button', { name: '7 dias' }).click();
  await expect(page).toHaveURL(/period=7d/);
  await expect(periodGroup.getByRole('button', { name: '7 dias' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
