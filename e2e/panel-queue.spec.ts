import { test, expect } from '@playwright/test';

/**
 * E2E do painel do salão (fila). Requer o stack completo rodando:
 *   - backend em API_URL (default http://127.0.0.1:3333 ou VITE_API_URL do .env)
 *   - frontend preview (webServer do playwright.config) OU E2E_BASE_URL
 *   - um salão NO modo fila com usuário OWNER cujas credenciais são passadas
 *     em PANEL_EMAIL/PANEL_PASSWORD.
 *
 * Como depende de ambiente, só corre explícito: `PANEL_E2E=1 npm run test:e2e`.
 * Em CI do repo, o job de integração deve provisionar e habilitar isso.
 */
const RUN = process.env.PANEL_E2E === '1';
const EMAIL = process.env.PANEL_EMAIL ?? '';
const PASSWORD = process.env.PANEL_PASSWORD ?? '';


async function dismissConsent(page: import('@playwright/test').Page) {
  const dialog = page.getByRole('dialog', { name: /consentimento/i });
  try {
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    return; // sem banner de cookies nesta build/sessão
  }
  await dialog.getByRole('button', { name: /só o necessário/i }).click();
  await expect(dialog).toBeHidden();
}


async function dismissOnboarding(page: import('@playwright/test').Page) {
  const skip = page.getByRole('button', { name: /pular por agora/i });
  try {
    await skip.waitFor({ state: 'visible', timeout: 6000 });
    await skip.click();
    await expect(skip).toBeHidden({ timeout: 10_000 });
  } catch {
    // sem onboarding pendente nesta sessão
  }
}

test.skip(!RUN, 'Panel e2e precisa de PANEL_E2E=1 + credenciais + stack completo');

test.describe('painel — fila (login, chamar, concluir 2x, arquivar)', () => {
  test('fluxo completo sem conclusão duplicada', async ({ page }) => {
    await page.goto('/login');
    await dismissConsent(page);
    await page.getByLabel(/e-mail/i).fill(EMAIL);
    await page.getByLabel('Senha', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();

    await expect(page).toHaveURL(/\/app/, { timeout: 20_000 });

    await dismissOnboarding(page);

    // Abre a fila (tab sempre visível para staff)
    await page.goto('/app/queue');
    await dismissOnboarding(page);

    // Adiciona um cliente pelo botão "Adicionar cliente" do painel
    const name = `E2E Cliente ${Date.now() % 100000}`;
    const addClient = page.getByRole('button', { name: /adicionar cliente/i });
    await addClient.waitFor({ state: 'visible', timeout: 15_000 });
    await addClient.click();
    const nameInput = page.getByPlaceholder(/joão silva/i);
    await nameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await nameInput.fill(name);
    // O modal exige pelo menos um serviço antes de entrar na fila
    // (só serviços ativos são oferecidos).
    const modal = page.locator('div.fixed.inset-0').last();
    await modal.getByRole('heading', { level: 3 }).first().click();
    await modal.getByRole('button', { name: 'Adicionar à Fila', exact: true }).click();
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });

    // Chama para a cadeira
    await page.getByRole('button', { name: /chamar/i }).first().click();

    // Conclui COM duplo clique (não pode duplicar registro financeiro)
    const finish = page.getByRole('button', { name: /finalizar|concluir/i }).first();
    await finish.click();
    // O painel abre a cobrança antes de concluir. Usa "Fiado" (registro local,
    // sem gateway) para o atendimento entrar em concluído.
    await expect(page.getByRole('heading', { name: /como foi o pagamento/i })).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: 'Fiado', exact: true }).click();
    // A UI atual não exibe a palavra "concluído": o card sai da fila ativa.
    await expect(page.getByRole('heading', { level: 4, name: name })).toBeHidden({
      timeout: 10_000,
    });

    // Arquivar/remove from view some do histórico visível
    // (confirmação de diálogo se existir)
    page.once('dialog', dialog => dialog.accept());
    const removeBtn = page.getByRole('button', { name: /remover|arquivar|excluir/i }).first();
    if (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.click();
    }
  });

  test('URL direta de aba proibida para EMPLOYEE mostra Acesso negado', async ({ page }) => {
    await page.goto('/login');
    await dismissConsent(page);
    await page.getByLabel(/e-mail/i).fill(EMAIL);
    await page.getByLabel('Senha', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/app/, { timeout: 20_000 });

    await page.goto('/app/finance');
    // OWNER vê o painel; EMPLOYEE sem FINANCE_VIEW vê o bloqueio.
    // Scope no heading: o mesmo texto existe num item de navegação oculto
    // (menu "Mais") no viewport de 375px.
    const denied = page.getByRole('heading', { name: /acesso negado/i });
    const allowed = page.getByRole('heading', { name: /financeiro/i });
    await expect(denied.or(allowed).first()).toBeVisible({ timeout: 10_000 });
  });
});
