import { expect, test } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

const stamp = Date.now();

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('cria chamado pelo botão "Novo chamado" e mostra o diálogo', async ({ page }) => {
  await loginAsMaster(page);

  const title = `[QA] Chamado criado no e2e ${stamp}`;
  await page.goto('/master/tickets');
  await page.getByRole('button', { name: 'Novo chamado' }).click();

  await expect(page).toHaveURL(/\/master\/tickets\/new$/);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Novo chamado')).toBeVisible();

  await dialog.getByLabel('Título').fill(title);
  await dialog.getByLabel('Descrição').fill('Criado pelo teste e2e de criação de chamado.');
  await dialog.getByRole('button', { name: 'Criar chamado' }).click();

  await expect(page).toHaveURL(/\/master\/tickets$/);
  await expect(page.getByText('Chamado criado.')).toBeVisible();
  await expect(dialog).not.toBeVisible();

  const search = page.getByPlaceholder('Buscar por protocolo ou título...');
  await search.fill('[QA]');
  await search.press('Enter');
  await expect(page).toHaveURL(/search=%5BQA%5D/);
  await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });
});

test('cria tarefa pelo botão "Nova tarefa" com prazo e responsável', async ({ page }) => {
  await loginAsMaster(page);

  const title = `[QA] Tarefa criada no e2e ${stamp}`;
  await page.goto('/master/tasks');
  await page.getByRole('button', { name: 'Nova tarefa' }).click();

  await expect(page).toHaveURL(/\/master\/tasks\/new$/);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Nova tarefa')).toBeVisible();

  await dialog.getByLabel('Título').fill(title);
  await dialog.getByLabel('Prazo').fill('2026-12-31');
  await dialog.getByRole('button', { name: 'Criar tarefa' }).click();

  await expect(page).toHaveURL(/\/master\/tasks$/);
  await expect(page.getByText('Tarefa criada.')).toBeVisible();
  await expect(dialog).not.toBeVisible();

  const search = page.getByPlaceholder('Buscar tarefa...');
  await search.fill('[QA]');
  await search.press('Enter');
  await expect(page).toHaveURL(/search=%5BQA%5D/);
  await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });
});

test('valida campos obrigatórios no diálogo de chamado', async ({ page }) => {
  await loginAsMaster(page);

  await page.goto('/master/tickets/new');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Criar chamado' }).click();

  await expect(dialog.getByText('Informe o título.')).toBeVisible();
  await expect(dialog.getByText('Descreva o problema.')).toBeVisible();
  await expect(page).toHaveURL(/\/master\/tickets\/new$/);
});
