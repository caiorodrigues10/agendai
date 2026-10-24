import { test, expect, type Page } from '@playwright/test';

/**
 * Cadastro completo no browser (wizard de 3 etapas) contra o dev server
 * com proxy /api → backend. Cobre: etapa 1 (dados + consentimentos),
 * etapa 2 (segmento + público), etapa 3 (dados do negócio + agenda padrão),
 * POST /api/auth/register (201 + payload), tela de confirmação de e-mail
 * e entrada no painel.
 */
const stamp = Date.now();

function makeCpf(): string {
  const d = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const digit = (len: number) => {
    let s = 0;
    for (let i = 0; i < len; i++) s += d[i] * (len + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  d.push(digit(9));
  d.push(digit(10));
  return d.join('');
}

async function seedStorage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('agendai:cookie-consent-v2', 'essential');
  });
}

// O fluxo real de cadastro exige backend vivo (POST /api/auth/register → 201).
// Sem E2E_BASE_URL o vite preview proxyia /api para :3333 morto — pula o spec
// (mesmo critério dos specs de e2e/master/).
test('cadastra conta nova no /cadastro e entra no painel', async ({ page }) => {
  test.skip(!process.env.E2E_BASE_URL, 'requer backend real (defina E2E_BASE_URL)');
  test.setTimeout(90_000);
  const email = `e2e-reg-${stamp}@example.com`;
  const cpf = makeCpf();

  await seedStorage(page);

  const registerResponse = page.waitForResponse(
    (r) => r.url().includes('/api/auth/register') && r.request().method() === 'POST',
  );

  await page.goto('/cadastro');
  await expect(page.getByRole('heading', { name: 'Comece pelo seu acesso' })).toBeVisible();
  await expect(page.getByText('Etapa 1 de 3')).toBeVisible();

  // Etapa 1 — Seus dados
  await page.getByLabel('Seu nome').fill('João E2E');
  const emailField = page.getByRole('textbox', { name: 'E-mail' });
  await emailField.click();
  await emailField.fill(email);
  await page.getByLabel('CPF').fill(cpf);
  const passwordField = page.getByRole('textbox', { name: 'Senha', exact: true });
  await passwordField.click();
  await passwordField.fill('SenhaForte#123');
  await page.getByRole('checkbox', { name: /li e aceito os termos de uso/i }).check({ force: true });
  await page
    .getByRole('checkbox', { name: /consinto com o tratamento dos meus dados/i })
    .check({ force: true });
  await page.getByRole('button', { name: /^continuar$/i }).click();
  await expect(page.getByRole('heading', { name: 'Qual é o seu negócio?' })).toBeVisible();

  // Etapa 2 — Segmento
  await expect(page.getByText('Etapa 2 de 3')).toBeVisible();
  await page.getByRole('radio', { name: /barbearia/i }).click();
  await expect(page.getByRole('radio', { name: /masculino/i })).toBeChecked();
  await page.getByRole('button', { name: /^continuar$/i }).click();
  await expect(page.getByRole('heading', { name: 'Agora, os dados do negócio' })).toBeVisible();

  // Etapa 3 — Dados do negócio (agenda padrão: Seg–Sáb 09:00–19:00)
  await page.getByLabel('Nome do negócio').fill(`Barbearia E2E ${stamp}`);
  await page.getByLabel('WhatsApp do negócio').fill('11999999999');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByLabel('Endereço').fill('Av. Paulista');
  await page.getByLabel('Número').fill('1000');
  await expect(page.getByText('Aberto 6 dias por semana')).toBeVisible();

  await page.getByRole('button', { name: /criar minha conta/i }).click();

  const response = await registerResponse;
  expect(response.status()).toBe(201);

  const payload = (await response.request().postDataJSON()) as Record<string, unknown>;
  expect(payload).toMatchObject({
    ownerName: 'João E2E',
    email,
    password: 'SenhaForte#123',
    cpf,
    barbershopName: `Barbearia E2E ${stamp}`,
    whatsapp: '11999999999',
    businessSegment: 'BARBERSHOP',
    targetAudience: 'MASCULINO',
    city: 'São Paulo',
    termsVersion: '1.0',
    termsAccepted: true,
    lgpdConsent: true,
    recaptchaToken: '',
  });
  expect(payload.schedule).toHaveLength(7);
  expect(payload).not.toHaveProperty('businessSegmentOther');

  // Pós-submit: tela de confirmação de e-mail, sem redirect imediato
  await expect(page).toHaveURL(/\/cadastro/);
  await expect(page.getByRole('heading', { name: 'Confira seu e-mail' })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  const storedUser = await page.evaluate(() => localStorage.getItem('barber_user'));
  expect(storedUser).toBeTruthy();
  expect(JSON.parse(storedUser as string).role).toBe('owner');
  const cookies = await page.context().cookies();
  expect(cookies.some((c) => c.name === 'refresh_token' && c.httpOnly)).toBe(true);

  // Entra no painel
  await page.getByRole('button', { name: /já confirmei, entrar no painel/i }).click();
  await expect(page).toHaveURL(/\/app\/queue/, { timeout: 15_000 });
});
