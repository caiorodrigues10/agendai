import { expect, test } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('usuários: lista, valida criação e cria + exclui um usuário', async ({ page }) => {
  await loginAsMaster(page);

  const [usersResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/admin/users')),
    page.goto('/master/users'),
  ]);
  expect(usersResponse.status()).toBe(200);

  await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Usuários' })).toBeVisible();

  // A lista já passa de uma página (contas de teste acumuladas), então o
  // usuário do seed é buscado em vez de depender da paginação.
  const search = page.getByLabel('Buscar usuários');
  await search.fill('admin@agendai.local');
  await search.press('Enter');
  await expect(page.getByTestId('users-page').getByText('admin@agendai.local')).toBeVisible({
    timeout: 15_000,
  });

  // Limpa a busca para os próximos passos verem a lista completa.
  await search.fill('');
  await search.press('Enter');
  await expect(page.getByTestId('users-page').getByText('admin@admin.com')).toBeVisible({
    timeout: 15_000,
  });

  // Criação: validação bloqueia formulário vazio.
  await page.getByRole('button', { name: /Novo usuário/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Novo usuário')).toBeVisible();
  await dialog.getByRole('button', { name: 'Criar usuário' }).click();
  await expect(dialog.getByText('Informe o nome.')).toBeVisible();
  await expect(dialog.getByText('E-mail inválido.')).toBeVisible();
  await expect(dialog.getByText('Mínimo de 6 caracteres.', { exact: true })).toBeVisible();

  // Criação válida.
  const email = `e2e.user.${Date.now()}@agendai.local`;
  await dialog.getByLabel('Nome').fill('E2E Usuário');
  await dialog.getByLabel('E-mail').fill(email);
  await dialog.getByLabel(/^Senha/).fill('E2e@12345');
  await dialog.getByLabel('Papel').selectOption('EMPLOYEE');
  const [createResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/api/admin/users') && res.request().method() === 'POST',
    ),
    dialog.getByRole('button', { name: 'Criar usuário' }).click(),
  ]);
  expect(createResponse.status()).toBeLessThan(300);
  await expect(page.getByTestId('users-page').getByText(email)).toBeVisible({ timeout: 15_000 });

  // Exclusão com confirmação.
  await page.getByRole('button', { name: 'Excluir E2E Usuário' }).click();
  const confirm = page.getByRole('alertdialog');
  await expect(confirm).toBeVisible();
  const [deleteResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/api/admin/users/') && res.request().method() === 'DELETE',
    ),
    confirm.getByRole('button', { name: 'Excluir' }).click(),
  ]);
  expect(deleteResponse.status()).toBe(200);
  await expect(page.getByTestId('users-page').getByText(email)).toBeHidden({ timeout: 15_000 });
});
