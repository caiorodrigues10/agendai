import { test, expect, type Page } from '@playwright/test';

/**
 * ITEM 1 — login em Safari/WebKit (sem `requestIdleCallback`):
 * 1) submit completo obtém o token e envia no corpo do POST /api/auth/login;
 * 2) script do reCAPTCHA bloqueado → erro claro, sem envio, e retry reinjeta o script;
 * 3) script do GIS bloqueado → erro no clique, e o clique seguinte carrega e executa o prompt.
 *
 * Roda com `VITE_RECAPTCHA_SITE_KEY` no build (chave de teste do Google) e com
 * `requestIdleCallback` removido ANTES de qualquer script (estado do WebKit).
 */

const RECAPTCHA_BLOCKED_MSG = 'Não foi possível validar a proteção antiabuso. Tente novamente.';

// Precisa da chave de teste do Google no BUILD (o e2e hermético serve o api.js
// por route stub). Sem ela o getRecaptchaToken é inerte e os testes não provam
// nada — igual a e2e/master/, que só roda com E2E_MASTER_*.
test.skip(
  !process.env.VITE_RECAPTCHA_SITE_KEY,
  'build sem VITE_RECAPTCHA_SITE_KEY (chave de teste do Google)',
);

const RECAPTCHA_OK_JS =
  "window.grecaptcha = { execute: async (key, opts) => 'tok-e2e-' + (opts && opts.action) };";

const GIS_OK_JS = `
window.google = { accounts: { id: {
  initialize: () => {},
  prompt: (cb) => {
    window.__gisPromptCalls = (window.__gisPromptCalls || 0) + 1;
    cb({ isNotDisplayed: () => true, isSkippedMoment: () => false });
  },
} } };
`;

/** Simula WebKit: remove a API de idle antes de qualquer script da página. */
const disableIdleApi = () => {
  Object.defineProperty(window, 'requestIdleCallback', { value: undefined, configurable: true, writable: true });
  Object.defineProperty(window, 'cancelIdleCallback', { value: undefined, configurable: true, writable: true });
};

async function stubLoginCapture(page: Page) {
  const bodies: Array<Record<string, unknown>> = [];
  await page.route('**/api/auth/login', async route => {
    bodies.push(JSON.parse(route.request().postData() || '{}'));
    // Shape real do backend: { user, accessToken } no top level (sem envelope).
    await route.fulfill({
      json: {
        user: { id: 'u-e2e', name: 'Dono Teste', email: 'dono@salao.com', role: 'OWNER' },
        accessToken: 'at-e2e',
      },
    });
  });
  return bodies;
}

async function dismissConsent(page: Page) {
  const dialog = page.getByRole('dialog', { name: /consentimento de cookies/i });
  try {
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    return; // sem banner de cookies nesta build/sessão
  }
  await dialog.getByRole('button', { name: /só o necessário/i }).click();
  await expect(dialog).toBeHidden();
}

async function fillLoginForm(page: Page) {
  await page.goto('/login');
  await dismissConsent(page);
  await page.getByPlaceholder('seu@email.com').fill('dono@salao.com');
  await page.getByPlaceholder('••••••••').fill('senha-forte-123');
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(disableIdleApi);
});

test('sem requestIdleCallback: login com reCAPTCHA envia o token no corpo e navega', async ({ page }) => {
  await page.route('**/recaptcha/api.js*', route =>
    route.fulfill({ contentType: 'application/javascript', body: RECAPTCHA_OK_JS }),
  );
  const bodies = await stubLoginCapture(page);

  await fillLoginForm(page);
  await page.getByRole('button', { name: /^entrar$/i }).click();

  await page.waitForURL(/\/app\//, { timeout: 15000 });
  expect(bodies.length).toBeGreaterThan(0);
  expect(bodies[0].email).toBe('dono@salao.com');
  expect(bodies[0].recaptchaToken).toBe('tok-e2e-login');
  expect(bodies[0].password).toBe('senha-forte-123');

  // Badge do reCAPTCHA: sem rIC, o fallback por setTimeout ainda agenda o load.
  await expect(page.locator('body')).toHaveClass(/recaptcha-visible/, { timeout: 9000 });
});

test('api.js bloqueado: erro claro, sem envio, e o retry reinjeta o script', async ({ page }) => {
  let blocked = true;
  await page.route('**/recaptcha/api.js*', async route => {
    if (blocked) return route.abort();
    return route.fulfill({ contentType: 'application/javascript', body: RECAPTCHA_OK_JS });
  });
  const bodies = await stubLoginCapture(page);

  await fillLoginForm(page);
  await page.getByRole('button', { name: /^entrar$/i }).click();

  await expect(page.getByText(RECAPTCHA_BLOCKED_MSG)).toBeVisible({ timeout: 10000 });
  expect(bodies).toHaveLength(0); // nada enviado sem token

  blocked = false;
  await page.getByRole('button', { name: /^entrar$/i }).click();

  await page.waitForURL(/\/app\//, { timeout: 15000 });
  expect(bodies[0].recaptchaToken).toBe('tok-e2e-login');
});

test('GIS bloqueado: erro no 1º clique e o clique seguinte carrega o script e executa o prompt', async ({ page }) => {
  let blocked = true;
  await page.route('https://accounts.google.com/gsi/client*', async route => {
    if (blocked) return route.abort();
    return route.fulfill({ contentType: 'application/javascript', body: GIS_OK_JS });
  });

  await page.goto('/login');
  await dismissConsent(page);
  const googleBtn = page.getByRole('button', { name: /entrar com google/i });

  await googleBtn.click();
  await expect(page.getByText('Falha ao carregar script do Google.')).toBeVisible({ timeout: 10000 });

  blocked = false;
  await googleBtn.click();
  // prompt() rodou e reportou "não exibido" → mensagem muda = script recarregou.
  await expect(page.getByText('Não foi possível continuar com o Google. Tente novamente.')).toBeVisible({
    timeout: 10000,
  });
  const promptCalls = await page.evaluate(() => (window as unknown as { __gisPromptCalls?: number }).__gisPromptCalls ?? 0);
  expect(promptCalls).toBeGreaterThan(0);
});
