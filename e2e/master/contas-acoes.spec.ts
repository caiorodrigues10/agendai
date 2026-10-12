import { expect } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured, test } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

const REASON = 'fluxo e2e de acoes de controle';

async function confirmAction(page, label: string) {
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder(/Por que esta ação/).fill(REASON);
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/api/admin/accounts/') && res.request().method() === 'POST',
    ),
    dialog.getByRole('button', { name: label }).click(),
  ]);
  expect(response.status()).toBe(200);
}

test('ações de controle: suspende, reativa e entra em visão temporária', async ({ page }) => {
  await loginAsMaster(page);
  await page.goto('/master/accounts');

  const rows = page.locator('button').filter({ hasText: 'criada em' });
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  await rows.first().click();
  await expect(page).toHaveURL(/\/master\/accounts\/[0-9a-f-]{36}/);
  const accountUrl = page.url();

  await expect(page.getByText('Ações de controle')).toBeVisible();

  // Alterna o estado atual e restaura em seguida (mesma linha da lista).
  const isActive = await page.getByText('Ativa', { exact: true }).first().isVisible();
  if (isActive) {
    await page.getByRole('button', { name: /Suspender/ }).click();
    await confirmAction(page, 'Suspender');
    await expect(page.getByText('Ação executada com sucesso.')).toBeVisible();
    await expect(page.getByText('Inativa', { exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: /Reativar/ }).click();
    await confirmAction(page, 'Reativar');
  } else {
    await page.getByRole('button', { name: /Reativar/ }).click();
    await confirmAction(page, 'Reativar');
    await expect(page.getByText('Ação executada com sucesso.')).toBeVisible();

    await page.getByRole('button', { name: /Suspender/ }).click();
    await confirmAction(page, 'Suspender');
  }
  await expect(page.getByText('Ação executada com sucesso.')).toBeVisible();
  await expect(page.getByText('Ativa', { exact: true }).first()).toBeVisible();

  // Visão temporária (impersonation somente-leitura de 30min).
  await page.getByRole('button', { name: /Entrar agora/ }).click();
  const dialog = page.getByRole('alertdialog');
  await dialog.getByPlaceholder(/Por que esta ação/).fill('conferir painel do dono via e2e');
  const [impersonateResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/impersonate')),
    dialog.getByRole('button', { name: 'Entrar agora' }).click(),
  ]);
  expect(impersonateResponse.status()).toBe(200);

  await page.waitForURL(/\/app\/overview/, { timeout: 15_000 });
  const banner = page.getByRole('status');
  await expect(banner).toContainText('Visão temporária somente-leitura');
  await expect(banner).toContainText('expira em');

  await banner.getByRole('button', { name: 'Encerrar' }).click();
  await page.waitForURL(new RegExp(accountUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByText('Ações de controle')).toBeVisible();
});

test('sair pela header durante a visão temporária volta ao painel do master', async ({ page }) => {
  await loginAsMaster(page);
  await page.goto('/master/accounts');

  const rows = page.locator('button').filter({ hasText: 'criada em' });
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  await rows.first().click();
  await expect(page).toHaveURL(/\/master\/accounts\/[0-9a-f-]{36}/);
  const accountUrl = page.url();

  await page.getByRole('button', { name: /Entrar agora/ }).click();
  const dialog = page.getByRole('alertdialog');
  await dialog.getByPlaceholder(/Por que esta ação/).fill('sair pela header via e2e');
  const [impersonateResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/impersonate')),
    dialog.getByRole('button', { name: 'Entrar agora' }).click(),
  ]);
  expect(impersonateResponse.status()).toBe(200);

  await page.waitForURL(/\/app\/overview/, { timeout: 15_000 });
  await expect(page.getByRole('status')).toContainText('Visão temporária somente-leitura');

  // "Sair" encerra só a visão temporária: a sessão do master continua viva,
  // então o destino é o painel do master (e não a landing pública).
  await page.getByRole('button', { name: 'Sair' }).click();
  await page.waitForURL(new RegExp(accountUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), {
    timeout: 15_000,
  });
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByText('Ações de controle')).toBeVisible();
});
