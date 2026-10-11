import { expect } from '@playwright/test';
import {
  acceptCookies,
  login,
  masterConfigured,
  MASTER_EMAIL,
  MASTER_PASSWORD,
  MASTER_SKIP,
  test,
} from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test('admin encerra a sessão de outro dispositivo e o acesso cai na hora', async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  try {
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();
    await acceptCookies(pageA);
    await acceptCookies(pageB);

    await login(pageA, MASTER_EMAIL, MASTER_PASSWORD);
    await pageA.waitForURL(/\/master\//, { timeout: 30_000 });

    await login(pageB, MASTER_EMAIL, MASTER_PASSWORD);
    await pageB.waitForURL(/\/master\//, { timeout: 30_000 });

    await pageA.goto('/master/audit');
    await expect(pageA.getByText('Sessões de acesso')).toBeVisible({ timeout: 15_000 });

    const rows = pageA.getByTestId('audit-sessions-list').locator('li');
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });

    // Sessões de outros aparelhos (exclui a atual, com selo "Você", e resíduos de cURL).
    const otherSession = () =>
      rows.filter({ hasNotText: 'Você' }).filter({ hasNotText: 'cURL' }).first();

    await expect(otherSession()).toContainText('Ativa', { timeout: 15_000 });
    await otherSession().getByRole('button', { name: 'Encerrar' }).click();

    const dialog = pageA.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await dialog
      .getByPlaceholder('Por que esta ação está sendo executada?')
      .fill('Encerramento de teste E2E');
    await dialog.getByRole('button', { name: 'Encerrar sessão' }).click();

    await expect(dialog).not.toBeVisible({ timeout: 15_000 });
    await expect(otherSession()).toContainText('Encerrada', { timeout: 15_000 });

    await pageB.reload();
    await expect(pageB).toHaveURL(/\/login/, { timeout: 30_000 });
  } finally {
    await ctxA.close();
    await ctxB.close();
  }
});
