import { expect } from '@playwright/test';
import {
  acceptCookies,
  login,
  OWNER_EMAIL,
  OWNER_PASSWORD,
  OWNER_SKIP,
  ownerConfigured,
  test,
} from './helpers';

test.skip(!ownerConfigured, OWNER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('usuário OWNER não acessa as rotas do painel master', async ({ page }) => {
  await login(page, OWNER_EMAIL, OWNER_PASSWORD);
  await page.waitForURL(/\/app\//, { timeout: 30_000 });

  await page.goto('/master/overview');
  await expect(page).not.toHaveURL(/\/master\//, { timeout: 15_000 });
});
