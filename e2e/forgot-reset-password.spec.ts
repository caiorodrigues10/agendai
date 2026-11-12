import { test, expect, type Page, type Route } from '@playwright/test';

/**
 * E2E do fluxo "esqueci a senha" / "redefinir senha" com a API SIMULADA.
 *
 * Nenhum e-mail é enviado e nenhum backend real é necessário: as duas rotas
 * /api/auth/* são interceptadas. O token usado aqui é fictício (64 hex).
 *
 * Também cobre a não-vazamento do `?token=`: a URL é limpa antes de qualquer
 * init de analytics, então nenhuma requisição/referer/page_path de terceiro
 * carrega o token.
 */

const TOKEN = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
const EMAIL = 'e2e-reset@example.com';

/**
 * reCAPTCHA v3 stubado (mesma estratégia do e2e/login-safari.spec.ts): o
 * script real do Google não é determinístico no WebKit do CI e pode estourar o
 * timeout de 10s do `getRecaptchaToken` — o formulário mostraria o erro de
 * antiabuso em vez do resultado esperado.
 */
const RECAPTCHA_OK_JS =
  "window.grecaptcha = { execute: async (key, opts) => 'tok-e2e-' + (opts && opts.action) };";

async function stubRecaptcha(page: Page) {
  await page.route('**/recaptcha/api.js*', route =>
    route.fulfill({ contentType: 'application/javascript', body: RECAPTCHA_OK_JS }),
  );
}

async function mockForgot(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockReset(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function dismissConsent(page: Page) {
  const consent = page.getByRole('button', { name: 'Só o necessário' });
  if (await consent.isVisible().catch(() => false)) await consent.click();
}

/** Consentimento 'all' + stub do gtag para capturar o que sairia pro Google. */
async function armAnalyticsCapture(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('agendai:cookie-consent-v2', 'all');
    } catch {
      /* modo privado */
    }
    const w = window as unknown as { __gtagCalls?: unknown[]; gtag?: unknown };
    w.__gtagCalls = [];
    w.gtag = function gtag(...args: unknown[]) {
      (w.__gtagCalls ??= []).push(args);
    };
  });
}

function trackRequests(page: Page) {
  const urls: string[] = [];
  const referers: { url: string; referer: string }[] = [];
  page.on('request', (request) => {
    urls.push(request.url());
    const referer = request.headers()['referer'];
    if (referer) referers.push({ url: request.url(), referer });
  });
  return { urls, referers };
}

test.describe('esqueci-senha', () => {
  test('pedido ok → mensagem de "e-mail enviado"', async ({ page }) => {
    await page.route('**/api/auth/forgot-password', (route) =>
      mockForgot(route, 200, {
        success: true,
        message: 'Se o e-mail existir, você receberá um link de redefinição.',
      }),
    );

    await stubRecaptcha(page);
    await page.goto('/esqueci-senha');
    await dismissConsent(page);
    await page.getByLabel(/e-mail/i).fill(EMAIL);
    await page.getByRole('button', { name: /enviar instruções/i }).click();

    await expect(page.getByText(/verifique sua caixa de entrada/i)).toBeVisible();
    await expect(page.getByText(EMAIL)).toBeVisible();
  });

  test('429 → mostra o erro e NÃO a tela de "e-mail enviado"', async ({ page }) => {
    await page.route('**/api/auth/forgot-password', (route) =>
      mockForgot(route, 429, {
        success: false,
        message: 'Muitas solicitações. Tente novamente em 1 hora.',
      }),
    );

    await stubRecaptcha(page);
    await page.goto('/esqueci-senha');
    await dismissConsent(page);
    await page.getByLabel(/e-mail/i).fill(EMAIL);
    await page.getByRole('button', { name: /enviar instruções/i }).click();

    await expect(page.getByRole('alert')).toContainText(/muitas solicitações/i);
    await expect(page.getByText(/verifique sua caixa de entrada/i)).toHaveCount(0);
  });

  test('503 → mostra o erro e NÃO a tela de "e-mail enviado"', async ({ page }) => {
    await page.route('**/api/auth/forgot-password', (route) =>
      mockForgot(route, 503, {
        success: false,
        message: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
        code: 'RATE_LIMIT_UNAVAILABLE',
      }),
    );

    await stubRecaptcha(page);
    await page.goto('/esqueci-senha');
    await dismissConsent(page);
    await page.getByLabel(/e-mail/i).fill(EMAIL);
    await page.getByRole('button', { name: /enviar instruções/i }).click();

    await expect(page.getByRole('alert')).toContainText(/indisponível/i);
    await expect(page.getByText(/verifique sua caixa de entrada/i)).toHaveCount(0);
  });

  test('320px: link "Esqueci minha senha" do login funciona', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 780 });
    await page.goto('/login');
    await dismissConsent(page);

    const link = page.getByRole('button', { name: /esqueci minha senha/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/esqueci-senha/);
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
  });
});

test.describe('reset-password', () => {
  test('token ausente → tela de "Link inválido"', async ({ page }) => {
    await page.goto('/reset-password');
    await dismissConsent(page);

    await expect(page.getByText(/link inválido/i)).toBeVisible();
    await page.getByRole('button', { name: /solicitar novo link/i }).click();
    await expect(page).toHaveURL(/\/esqueci-senha/);
  });

  for (const [label, message] of [
    ['inválido', 'Token inválido ou expirado'],
    ['expirado', 'Token expirado. Solicite uma nova redefinição.'],
    ['já usado', 'Token já utilizado'],
  ] as const) {
    test(`token ${label} → mensagem do back no formulário`, async ({ page }) => {
      await page.route('**/api/auth/reset-password', (route) =>
        mockReset(route, 400, { success: false, message }),
      );

      await page.goto(`/reset-password?token=${TOKEN}`);
      await dismissConsent(page);
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha456');
      await page.getByLabel('Confirmar nova senha').fill('NovaSenha456');
      await page.getByRole('button', { name: /redefinir senha/i }).click();

      await expect(page.getByRole('alert')).toContainText(message);
    });
  }

  test('senhas diferentes → envio desabilitado', async ({ page }) => {
    await page.goto(`/reset-password?token=${TOKEN}`);
    await dismissConsent(page);
    await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha456');
    await page.getByLabel('Confirmar nova senha').fill('OutraSenha789');

    await expect(page.getByText(/as senhas não coincidem/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /redefinir senha/i })).toBeDisabled();
  });

  test('sucesso → avisa e redireciona para /login em 3s', async ({ page }) => {
    await page.route('**/api/auth/reset-password', (route) =>
      mockReset(route, 200, { success: true, message: 'Senha redefinida com sucesso' }),
    );

    await page.goto(`/reset-password?token=${TOKEN}`);
    await dismissConsent(page);
    await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha456');
    await page.getByLabel('Confirmar nova senha').fill('NovaSenha456');
    await page.getByRole('button', { name: /redefinir senha/i }).click();

    await expect(page.getByText(/senha alterada com sucesso/i)).toBeVisible();
    await expect(page.getByText(/redirecionado para a tela de login/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/, { timeout: 8000 });
  });

  test('token na URL: URL limpa, sem vazamento para terceiros e page_path sem token', async ({ page }) => {
    await armAnalyticsCapture(page);
    const { urls, referers } = trackRequests(page);

    await page.goto(`/reset-password?token=${TOKEN}`);
    await dismissConsent(page);
    await page.waitForLoadState('networkidle');

    // 1) A URL do documento é limpa antes de qualquer init de analytics.
    expect(page.url()).not.toContain('token=');
    expect(page.url()).not.toContain(TOKEN);

    const sameOrigin = new URL(page.url()).origin;
    const isThirdParty = (u: string) => {
      try {
        return new URL(u).origin !== sameOrigin;
      } catch {
        return false;
      }
    };

    // 2) Nenhuma requisição a TERCEIROS leva o token na URL.
    const thirdPartyWithToken = urls.filter((u) => u.includes(TOKEN) && isThirdParty(u));
    expect(thirdPartyWithToken).toEqual([]);

    // 3) Nenhuma requisição a TERCEIROS declara Referer com o token.
    const thirdPartyRefererWithToken = referers.filter(
      (r) => isThirdParty(r.url) && r.referer.includes(TOKEN),
    );
    expect(thirdPartyRefererWithToken).toEqual([]);

    // 4) Requisições MESMA ORIGEM (assets carregados antes do JS entrar em
    //    execução) podem herdar o Referer completo com o token — comportamento
    //    do navegador, registrado apenas como evidência.
    const sameOriginRefererWithToken = referers.filter(
      (r) => !isThirdParty(r.url) && r.referer.includes(TOKEN),
    );
    console.warn(
      `[referer] mesma-origem com token=${sameOriginRefererWithToken.length}, terceiros com token=0`,
    );

    // 5) O page_view do gtag nunca carrega o token no page_path.
    const gtagCalls = (await page.evaluate(
      () => (window as unknown as { __gtagCalls?: unknown[] }).__gtagCalls ?? [],
    )) as unknown[][];
    const pageViews = gtagCalls.filter(
      (c) => Array.isArray(c) && c[1] === 'page_view',
    );
    expect(pageViews.length).toBeGreaterThan(0);
    for (const call of pageViews) {
      const params = call[2] as { page_path?: string };
      const pagePath = params.page_path ?? '';
      expect(pagePath).not.toContain('token=');
      expect(pagePath).not.toContain(TOKEN);
    }
  });

  test('320px: formulário de reset cabe na viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 780 });
    await page.goto(`/reset-password?token=${TOKEN}`);
    await dismissConsent(page);

    await expect(page.getByLabel('Nova senha', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirmar nova senha')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe('webkit-iphone', () => {
  test.skip(({ browserName }) => browserName !== 'webkit', 'só WebKit');

  test('fluxo completo de reset em WebKit', async ({ page }) => {
    await page.route('**/api/auth/reset-password', (route) =>
      mockReset(route, 200, { success: true, message: 'Senha redefinida com sucesso' }),
    );

    await page.goto(`/reset-password?token=${TOKEN}`);
    await dismissConsent(page);
    await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha456');
    await page.getByLabel('Confirmar nova senha').fill('NovaSenha456');
    await page.getByRole('button', { name: /redefinir senha/i }).click();
    await expect(page.getByText(/senha alterada com sucesso/i)).toBeVisible();
  });
});
