import { test, expect, type Page } from '@playwright/test';

/**
 * Google Auth — ponta a ponta no build real (sem login real com o Google).
 *
 * Cobre o botão Google (só renderiza com VITE_GOOGLE_CLIENT_ID), o GIS
 * carregado sob demanda, o prompt com mensagem de erro e o 404 do
 * /auth/google chegando à UI com a orientação em PT-BR.
 *
 * GIS e /api/auth/google são stubados por route — nenhum request sai para o
 * Google e nenhum token real é usado. Precisa da chave no BUILD (o Playwright
 * faz o build no webServer, herdando o env do step de e2e do CI):
 *
 *   VITE_GOOGLE_CLIENT_ID=<id-do-build> npx playwright test e2e/google-auth.spec.ts
 *
 * Sem essa env o botão nem aparece → o teste FALHA ruidosamente (não skip).
 */

/** GIS falso: prompt não exibido (mostra o erro de "clique mudo"). */
const GIS_PROMPT_BLOCKED_JS = `
window.google = { accounts: { id: {
  initialize: (opts) => { window.__gisInit = opts; window.__gisCb = opts && opts.callback; },
  prompt: (cb) => {
    window.__gisPrompts = (window.__gisPrompts || 0) + 1;
    cb({ isNotDisplayed: () => true, isSkippedMoment: () => false });
  },
} } };
`;

/** GIS falso: prompt segue adiante (o teste aciona o callback manualmente). */
const GIS_OK_JS = `
window.google = { accounts: { id: {
  initialize: (opts) => { window.__gisInit = opts; window.__gisCb = opts && opts.callback; },
  prompt: (cb) => {
    window.__gisPrompts = (window.__gisPrompts || 0) + 1;
    cb({ isNotDisplayed: () => false, isSkippedMoment: () => false });
  },
} } };
`;

/**
 * Resposta real do backend para o 404 (back: GoogleLoginUseCase monta
 * AppError(message, 404, undefined, "GOOGLE_ACCOUNT_NOT_FOUND") — o código
 * vai em `code`, e app.ts serializa `code` no JSON).
 *
 * Efeito corrigido (item 2): o AuthContext acha `err.code` e dispara o
 * branch de 404 → o usuário vê a orientação em PT-BR, nunca o código cru.
 */
const GOOGLE_404_BODY = {
  success: false,
  message: 'Conta não encontrada. Cadastre-se normalmente com e-mail e senha.',
  code: 'GOOGLE_ACCOUNT_NOT_FOUND',
  correlationId: 'e2e-google-auth',
};

async function stubGis(page: Page, body: string) {
  await page.route('**/accounts.google.com/gsi/client*', route =>
    route.fulfill({ contentType: 'application/javascript', body }),
  );
}

/** Janela com o estado que o GIS stubado grava (evita `any` nos evaluates). */
interface GisStubWindow extends Window {
  __gisInit?: { client_id?: string };
  __gisCb?: (resp: { credential?: string }) => void;
  __gisPrompts?: number;
}

async function stubGoogleLogin(page: Page, status: number, json: unknown) {
  const bodies: Record<string, unknown>[] = [];
  await page.route('**/api/auth/google', async route => {
    bodies.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({ status, json });
  });
  return bodies;
}

async function openConsentFree(page: Page, path: string) {
  // Mesma estratégia de e2e/login-safari.spec.ts: dispensa o banner antes de
  // interagir (ele é fixed e pode cobrir o botão do Google).
  await page.addInitScript(() => {
    try {
      localStorage.setItem('agendai:cookie-consent-v2', 'essential');
    } catch {
      /* modo privado */
    }
  });
  await page.goto(path);
}

function googleScripts(page: Page) {
  return page.locator('script[src*="accounts.google.com"]');
}

test('login: botão Google existe, GIS só carrega no clique e o prompt bloqueado vira erro', async ({
  page,
}) => {
  await stubGis(page, GIS_PROMPT_BLOCKED_JS);
  await openConsentFree(page, '/login');

  const button = page.getByRole('button', { name: /entrar com google/i });
  await expect(button).toBeVisible();
  // Item 1b/2f: nada de GIS no mount (LCP).
  expect(await googleScripts(page).count()).toBe(0);

  await button.click();

  await expect(page.locator('script[src*="accounts.google.com"]')).toHaveCount(1, {
    timeout: 10_000,
  });
  await expect(
    page.getByText('Não foi possível continuar com o Google. Tente novamente.').first(),
  ).toBeVisible({ timeout: 10_000 });
  expect(await page.evaluate(() => (window as unknown as GisStubWindow).__gisPrompts)).toBe(1);
  expect(
    await page.evaluate(() => (window as unknown as GisStubWindow).__gisInit?.client_id),
  ).toBe(process.env.VITE_GOOGLE_CLIENT_ID);
});

// Corrigido (item 2): o 404 do /auth/google chega com `code`, o AuthContext
// dispara o branch e o usuário vê a orientação em PT-BR — o código cru
// GOOGLE_ACCOUNT_NOT_FOUND nunca aparece na tela.
test('login: 404 do /auth/google com `code` mostra a orientação em PT-BR', async ({
  page,
}) => {
  await stubGis(page, GIS_OK_JS);
  const bodies = await stubGoogleLogin(page, 404, GOOGLE_404_BODY);
  await openConsentFree(page, '/login');

  await page.getByRole('button', { name: /entrar com google/i }).click();
  await expect
    .poll(() => page.evaluate(() => Boolean((window as unknown as GisStubWindow).__gisCb)), { timeout: 10_000 })
    .toBe(true);

  await page.evaluate(() => {
    (window as unknown as GisStubWindow).__gisCb?.({ credential: 'e2e.header.payload.signature' });
  });

  expect(bodies).toHaveLength(1);
  expect(bodies[0].idToken).toBe('e2e.header.payload.signature');
  await expect(
    page.getByText('Conta não encontrada. Cadastre-se normalmente com e-mail e senha.').first(),
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('GOOGLE_ACCOUNT_NOT_FOUND')).toHaveCount(0);
});

test('cadastro: botão só na etapa 1 e o callback trava o e-mail no modo Google', async ({
  page,
}) => {
  await stubGis(page, GIS_OK_JS);
  await stubGoogleLogin(page, 404, GOOGLE_404_BODY);
  await openConsentFree(page, '/cadastro');

  const button = page.getByRole('button', { name: /cadastrar com google/i });
  await expect(button).toBeVisible();

  await button.click();
  await expect
    .poll(() => page.evaluate(() => Boolean((window as unknown as GisStubWindow).__gisCb)), { timeout: 10_000 })
    .toBe(true);

  await page.evaluate(() => {
    const payload = btoa(JSON.stringify({ email: 'dono@salao.com', name: 'Dono Teste' }));
    (window as unknown as GisStubWindow).__gisCb?.({ credential: `e2e.${payload}.signature` });
  });

  const email = page.getByPlaceholder('seu@email.com');
  await expect(email).toHaveValue('dono@salao.com');
  // Trava em readOnly (não disabled): o valor fica visível e copiável.
  await expect(email).toHaveAttribute('readonly', '');
  await expect(page.getByRole('button', { name: /usar e-mail e senha/i })).toBeVisible();
});
