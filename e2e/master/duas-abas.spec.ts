import { expect } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured, test } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('duas abas recarregando ao mesmo tempo: nenhuma é deslogada', async ({ page, context }) => {
  await loginAsMaster(page);
  await page.goto('/master/overview');
  const headingA = page.getByRole('heading', { name: 'Visão geral' });
  await expect(headingA).toBeVisible({ timeout: 30_000 });

  const tabB = await context.newPage();
  await acceptCookies(tabB);
  await tabB.goto('/master/overview');
  const headingB = tabB.getByRole('heading', { name: 'Visão geral' });
  await expect(headingB).toBeVisible({ timeout: 30_000 });

  // Recarga simultânea: as duas abas renovam a sessão a partir do MESMO
  // cookie. A corrida é absorvida pela janela de reuso do backend — se a
  // rotação de uma aba invalidasse a outra, uma delas cairia no /login.
  await Promise.all([page.reload(), tabB.reload()]);

  await expect(headingA).toBeVisible({ timeout: 30_000 });
  await expect(headingB).toBeVisible({ timeout: 30_000 });
  expect(page.url()).toContain('/master/');
  expect(tabB.url()).toContain('/master/');

  // Nenhuma aba foi deslogada e a sessão continua viva para a próxima carga.
  const refresh = (await context.cookies()).find((cookie) => cookie.name === 'refresh_token');
  expect(refresh, 'cookie de sessão deve continuar presente').toBeTruthy();
  expect((refresh?.expires ?? 0) * 1000).toBeGreaterThan(Date.now());

  await tabB.close();
});
