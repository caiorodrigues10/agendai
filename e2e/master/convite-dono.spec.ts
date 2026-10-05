import { expect, test } from '@playwright/test';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { acceptCookies, login, loginAsMaster, MASTER_EMAIL, MASTER_SKIP, masterConfigured } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

/**
 * Fluxo completo do convite de dono (Bloco 1 — rodada 4):
 * assistente cria salão+dono+plano, reenvio pelo detalhe, define a senha
 * pela página pública /convite/:token e o dono entra no painel.
 *
 * Obs.: /auth/accept-invite tem rate limit de 5/hora por IP — cada execução
 * consome 1 tentativa. Em caso de 429, aguarde a janela horária.
 */
test('convite do dono: cria salão, reenvia e aceita pelo link público', async ({ page, browser }) => {
  test.setTimeout(120_000);
  const stamp = Date.now();
  const ownerEmail = `e2e.owner.${stamp}@agendai.local`;
  const ownerPassword = 'Convite@123';
  const shopName = `E2E Convite ${stamp}`;

  await loginAsMaster(page);

  // ── Assistente "Novo salão" ─────────────────────────────────────────────
  await page.goto('/master/accounts');
  await page.getByRole('button', { name: 'Novo salão' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Novo salão')).toBeVisible();

  await dialog.getByLabel(/Nome do salão/).fill(shopName);
  await dialog.getByLabel(/^WhatsApp/).fill(`119${String(stamp).slice(-8)}`);
  await dialog.getByRole('button', { name: 'Avançar' }).click();

  await expect(dialog.getByText('2. Endereço e ajustes')).toBeVisible();
  await dialog.getByRole('button', { name: 'Avançar' }).click();

  await expect(dialog.getByText('3. Dono')).toBeVisible();
  await dialog.getByLabel(/Nome do dono/).fill('Dono E2E');
  await dialog.getByLabel(/E-mail do dono/).fill(ownerEmail);
  await dialog.getByRole('button', { name: 'Avançar' }).click();

  await expect(dialog.getByText('4. Plano e trial')).toBeVisible();
  await expect(dialog.getByLabel('Plano')).not.toHaveValue('', { timeout: 15_000 });
  await dialog.getByLabel(/Dias de trial/).fill('45');
  await dialog.getByRole('button', { name: 'Avançar' }).click();

  await expect(dialog.getByText('5. Revisão')).toBeVisible();
  await expect(dialog.getByText(`Dono E2E · ${ownerEmail}`)).toBeVisible();

  const [createRes] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/barbershops') && res.request().method() === 'POST',
    ),
    dialog.getByRole('button', { name: 'Criar salão' }).click(),
  ]);
  expect(createRes.status()).toBe(201);
  const created = await createRes.json();
  const shopId: string = created.data.id;
  expect(created.owner?.email).toBe(ownerEmail);
  expect(created.subscription?.status).toBe('TRIALING');

  await expect(dialog.getByText('Salão criado')).toBeVisible();
  await expect(dialog.getByText('Convite enviado.')).toBeVisible({ timeout: 15_000 });

  // ── Detalhe da conta: convite + reenvio ─────────────────────────────────
  await dialog.getByRole('button', { name: 'Ver detalhes' }).click();
  await page.waitForURL(new RegExp(`/master/accounts/${shopId}`));
  await expect(page.getByText('Convite do dono')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(ownerEmail)).toBeVisible();
  await expect(page.getByText('Pendente', { exact: true })).toBeVisible();

  const [resendRes] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes(`/api/admin/barbershops/${shopId}/resend-invite`),
    ),
    page.getByRole('button', { name: /Reenviar convite/ }).click(),
  ]);
  expect(resendRes.status()).toBe(200);
  await expect(page.getByText(/Convite reenviado/)).toBeVisible({ timeout: 15_000 });

  // ── Página pública do convite (token conhecido, só o hash no banco) ────
  const rawToken = `e2e${stamp}${'0'.repeat(64 - 3 - String(stamp).length)}`;
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const sql = [
    'INSERT INTO "owner_invites" (id, "barbershopId", email, "invitedById", "tokenHash", status, "expiresAt")',
    `SELECT gen_random_uuid(), '${shopId}', '${ownerEmail}',`,
    `(SELECT id FROM users WHERE email='${MASTER_EMAIL}'),`,
    `'${tokenHash}', 'PENDING', now() + interval '1 hour'`,
  ].join(' ');
  execSync(
    `docker exec agendai_db_dev psql -U agendai -d agendai -c "${sql.replace(/"/g, '\\"')}"`,
    { stdio: 'pipe' },
  );

  await page.goto(`/convite/${rawToken}`);
  await expect(page.getByText('Aceitar convite')).toBeVisible();
  await page.getByLabel(/^Nova senha/).fill(ownerPassword);
  await page.getByLabel(/^Confirmar nova senha/).fill(ownerPassword);
  await page.getByRole('button', { name: /Definir senha/ }).click();
  await expect(page.getByText('Senha definida com sucesso!')).toBeVisible({ timeout: 15_000 });

  // ── Dono entra no painel com a senha nova ───────────────────────────────
  // Contexto isolado: a sessão master (localStorage) não deve vazar pro dono.
  const ownerContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();
  await acceptCookies(ownerPage);
  await login(ownerPage, ownerEmail, ownerPassword);
  await ownerPage.waitForURL(/\/app\//, { timeout: 30_000 });
  await ownerContext.close();
});
