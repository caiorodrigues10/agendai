import { expect } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured, test } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('whatsapp visão geral carrega', async ({ page }) => {
  await loginAsMaster(page);
  await page.goto('/master/whatsapp');
  await expect(page.getByRole('heading', { name: /WhatsApp/i })).toBeVisible();
});
