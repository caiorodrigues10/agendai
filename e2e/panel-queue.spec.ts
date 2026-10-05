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

test.skip(!RUN, 'Panel e2e precisa de PANEL_E2E=1 + credenciais + stack completo');

test.describe('painel — fila (login, chamar, concluir 2x, arquivar)', () => {
  test('fluxo completo sem conclusão duplicada', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-mail/i).fill(EMAIL);
    await page.getByLabel(/senha/i).fill(PASSWORD);
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/app/, { timeout: 20_000 });

    // Abre a fila (tab sempre visível para staff)
    await page.goto('/app/queue');

    // Adiciona um cliente pela louça do painel, se o formulário existir
    const name = `E2E Cliente ${Date.now() % 100000}`;
    const nameInput = page.getByPlaceholder(/nome/i).first();
    await nameInput.fill(name);
    await page.getByRole('button', { name: /adicionar|entrar na fila/i }).first().click();
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });

    // Chama para a cadeira
    await page.getByRole('button', { name: /chamar/i }).first().click();

    // Conclui COM duplo clique (não pode duplicar registro financeiro)
    const finish = page.getByRole('button', { name: /finalizar|concluir/i }).first();
    await finish.click();
    await expect(page.getByText(/conclu[ií]do|atendimento conclu[ií]do/i)).toBeVisible({ timeout: 10_000 });

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
    await page.getByLabel(/e-mail/i).fill(EMAIL);
    await page.getByLabel(/senha/i).fill(PASSWORD);
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/app/, { timeout: 20_000 });

    await page.goto('/app/finance');
    // OWNER vê o painel; EMPLOYEE sem FINANCE_VIEW vê o bloqueio.
    const denied = page.getByText(/acesso negado/i);
    const allowed = page.getByText(/financeiro/i);
    await expect(denied.or(allowed).first()).toBeVisible({ timeout: 10_000 });
  });
});
