import { test, expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * E2E do assistente de importação de planilhas.
 *
 * Requer o stack completo rodando:
 *   - backend em API_URL (default http://127.0.0.1:3333 ou VITE_API_URL do .env)
 *   - frontend preview (webServer do playwright.config) OU E2E_BASE_URL
 *   - um salão com usuário OWNER (PANEL_EMAIL/PANEL_PASSWORD)
 *
 * Só corre explícito: `IMPORT_E2E=1 npm run test:e2e`.
 *
 * O arquivo enviado é uma fixture pequena com dados fictícios
 * (e2e/fixtures/clientes-import.csv e .xlsx) — nada de dado real.
 */
const RUN = process.env.IMPORT_E2E === '1';
const EMAIL = process.env.PANEL_EMAIL ?? '';
const PASSWORD = process.env.PANEL_PASSWORD ?? '';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_CSV = join(HERE, 'fixtures', 'clientes-import.csv');
const FIXTURE_XLSX = join(HERE, 'fixtures', 'clientes-import.xlsx');

test.skip(!RUN, 'Import e2e precisa de IMPORT_E2E=1 + credenciais + stack completo');

/** Login no painel do salão. */
async function login(page: Page): Promise<void> {
  await page.goto('/login');
  const consent = page.getByRole('button', { name: 'Só o necessário' });
  if (await consent.isVisible().catch(() => false)) {
    await consent.click();
  }
  await page.getByLabel(/e-mail/i).fill(EMAIL);
  await page.locator('#login-password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 20_000 });
}

/** Carrega o assistente de importação. */
async function openWizard(page: Page): Promise<void> {
  await page.goto('/app/settings?section=import');
  await expect(page.getByTestId('data-import-wizard')).toBeVisible({ timeout: 20_000 });
}

/** O salão aceita uma importação ativa por vez: cancela as pendentes. */
async function cancelPendingBatches(page: Page): Promise<void> {
  const history = page.getByTestId('import-history');
  await history.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
  const cancelButtons = history.getByRole('button', { name: 'Cancelar' });
  let pending = await cancelButtons.count();
  while (pending > 0) {
    await cancelButtons.first().click();
    await expect(page.getByText(/Importação cancelada/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForTimeout(500);
    pending = await cancelButtons.count();
  }
}

/** Sobe o arquivo, escolhe clientes, valida (dry-run) e confirma. */
async function importFixture(
  page: Page,
  fixture: string,
  options: { updateExisting?: boolean } = {}
): Promise<void> {
  await page.getByTestId('import-file-input').setInputFiles(fixture);
  await expect(page.getByTestId('import-step-target')).toBeVisible({ timeout: 20_000 });

  await page.getByRole('radio', { name: /Clientes/i }).check();
  await page.getByTestId('import-target-continue').click();

  await expect(page.getByTestId('import-step-mapping')).toBeVisible({ timeout: 20_000 });
  if (options.updateExisting === false) {
    await page.getByTestId('import-option-update-existing').uncheck();
  }
  await page.getByTestId('import-mapping-continue').click();

  await expect(page.getByTestId('import-step-review')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('import-valid-count')).toHaveText('3');
  await page.getByTestId('import-review-confirm').click();

  await expect(page.getByTestId('import-step-done')).toBeVisible({ timeout: 20_000 });
}

/** Header de autorização usado pelo app — reaproveitado para consultar a API. */
function trackAuth(page: Page): { header: () => string | undefined } {
  let authorization: string | undefined;
  page.on('request', (request) => {
    const value = request.headers()['authorization'];
    if (value) authorization = value;
  });
  return { header: () => authorization };
}

test.describe('importação de planilhas — upload, dry-run, confirmação e desfazer', () => {
  test('csv: importa sem notificar, não duplica na reimportação e desfaz só o criado', async ({
    page,
    request,
  }) => {
    const auth = trackAuth(page);
    await login(page);
    await openWizard(page);
    await cancelPendingBatches(page);

    // Cliente que já existia antes da importação: o desfazer não pode tocar nele.
    // O telefone é único por execução para o teste poder repetir.
    const stamp = String(Date.now()).slice(-9);
    const preexistingName = `E2E Cliente Anterior ${stamp.slice(-6)}`;
    const preexisting = await request.post('/api/clients', {
      headers: { authorization: auth.header()!, 'content-type': 'application/json' },
      data: { name: preexistingName, whatsapp: `11${stamp}` },
    });
    expect([200, 201]).toContain(preexisting.status());
    const preexistingBody = JSON.parse(await preexisting.text()) as {
      data?: { id?: string };
    };

    await importFixture(page, FIXTURE_CSV);

    // O lote concluiu com 3 clientes importados.
    await expect(page.getByTestId('import-imported-count')).toHaveText('3', {
      timeout: 30_000,
    });

    // Nenhuma mensagem/notificação foi enviada para o cliente importado.
    const header = auth.header();
    expect(header).toBeTruthy();
    const deliveries = await request.get('/api/notifications/deliveries', {
      headers: { authorization: header! },
    });
    expect(deliveries.status()).toBe(200);
    const body = JSON.parse(await deliveries.text()) as { data?: unknown[] };
    expect(Array.isArray(body.data) ? body.data : []).toHaveLength(0);

    // Reimportar o mesmo arquivo não duplica: quem já existe é ignorado
    // (sem "atualizar existentes", o cliente não é tocado).
    await page.getByTestId('import-start-over').click();
    await expect(page.getByTestId('import-step-upload')).toBeVisible();
    await importFixture(page, FIXTURE_CSV, { updateExisting: false });
    await expect(page.getByTestId('import-imported-count')).toHaveText('0', {
      timeout: 30_000,
    });
    await expect(page.getByTestId('import-skipped-count')).toHaveText('3');

    // Desfazer o lote que criou os registros remove só o que ele criou.
    const createdBatch = page
      .getByTestId('import-history')
      .locator('li', { hasText: '3 importado(s)' })
      .first();
    await createdBatch.getByRole('button', { name: 'Desfazer' }).click();
    await expect(page.getByText(/Importação desfeita/i).first()).toBeVisible({
      timeout: 20_000,
    });

    // O que foi importado sumiu; o que já existia continua.
    await page.goto('/app/clients');
    const busca = page.getByPlaceholder('Buscar por nome ou WhatsApp');
    await busca.fill('E2E Ana');
    await expect(page.getByText('E2E Ana Souza')).toHaveCount(0, { timeout: 20_000 });
    await busca.fill(preexistingName);
    await expect(page.getByText(preexistingName)).toHaveCount(1, { timeout: 20_000 });

    // Limpa o cliente criado só para a prova.
    if (preexistingBody.data?.id) {
      await request.delete(`/api/clients/${preexistingBody.data.id}`, {
        headers: { authorization: auth.header()! },
      });
    }
  });

  test('xlsx: importa a mesma planilha em formato Excel', async ({ page }) => {
    await login(page);
    await openWizard(page);
    await cancelPendingBatches(page);

    await importFixture(page, FIXTURE_XLSX);
    await expect(page.getByTestId('import-imported-count')).toHaveText('3', {
      timeout: 30_000,
    });

    // Limpa o que o teste importou.
    await page.getByTestId('import-undo-button').click();
    await expect(page.getByText(/Importação desfeita/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});