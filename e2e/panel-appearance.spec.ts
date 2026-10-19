import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * E2E visual do painel Aparência (/app/link): a "Prévia ao vivo" precisa se
 * comportar como a página pública real. Tudo mockado via page.route — roda
 * sem backend (dev server com E2E_BASE_URL ou preview do config).
 *
 * Screenshots: exporte SHOTS_DIR=<dir absoluto> para gravar antes/depois
 * (E2E_SHOTS_ONLY=1 grava só as imagens, sem asserções — usado no estado
 * "antes" via git stash).
 */

const SHOP_ID = '11111111-1111-4111-8111-111111111111';

const USER = {
  id: 'u1',
  name: 'Dono Teste',
  email: 'dono@e2e.test',
  role: 'OWNER',
  barbershopId: SHOP_ID,
  emailVerified: true,
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const SHOP = {
  id: SHOP_ID,
  name: 'Barba Nova',
  whatsapp: '11999999999',
  address: 'Rua das Flores, 123',
  city: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  operationMode: 'HYBRID',
  openingMode: 'SCHEDULE',
  businessSegment: 'BARBERSHOP',
  targetAudience: null,
  manualStatus: 'AUTO',
  active: true,
  logoUrl: null,
  googleReviewUrl: null,
};

const baseTheme = {
  id: 'theme-1',
  barbershopId: SHOP_ID,
  presetKey: 'esmeralda',
  accentColor: '#2CB58A',
  backgroundColor: '#0F1110',
  surfaceColor: '#1B1F1D',
  textColor: '#F2F5F3',
  textMutedColor: '#8B9990',
  radiusStyle: 'rounded',
  buttonStyle: 'filled',
  coverUrl: null as string | null,
  coverPublicId: null as string | null,
  coverOverlay: 40,
};

const COVER_URL = 'https://res.cloudinary.com/demo/image/upload/capa.jpg';

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '390x844', width: 390, height: 844 },
] as const;

const SHOTS_DIR = process.env.SHOTS_DIR ?? null;
const SHOTS_ONLY = process.env.E2E_SHOTS_ONLY === '1';

async function shoot(page: Page, name: string) {
  if (!SHOTS_DIR) return;
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`) });
}

function json(data: unknown) {
  return JSON.stringify({ success: true, data });
}

async function mockApi(page: Page, theme: typeof baseTheme) {
  await page.route('**/api/**', async route => {
    const req = route.request();
    const p = new URL(req.url()).pathname;
    const fulfill = (payload: unknown) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });

    if (p.endsWith('/api/auth/refresh')) {
      return fulfill({ accessToken: 'e2e-token', user: USER });
    }
    if (p.endsWith('/api/auth/me')) {
      return fulfill({ user: USER });
    }
    if (p.includes('/subscriptions/me')) {
      return fulfill({
        success: true,
        data: {
          subscription: { id: 'sub1', status: 'ACTIVE', planHasDashboard: true, planName: 'Pro' },
          trial: null,
          invoices: [],
          plans: [],
        },
      });
    }
    if (p.includes('/page-theme')) {
      return fulfill({ success: true, data: theme });
    }
    if (p.includes('/onboarding')) {
      return fulfill({
        steps: [],
        progress: 100,
        nextStep: null,
        completed: true,
        welcomeSeen: true,
        dismissed: true,
      });
    }
    if (/\/api\/barbershops\/[^/]+$/.test(p)) {
      return fulfill(SHOP);
    }
    if (p.includes('/queue/metrics')) {
      return fulfill({ success: true, data: { completedCount: 0, peopleWaiting: 0 } });
    }
    if (p.includes('/products')) {
      return fulfill({ success: true, data: [], meta: { total: 0, page: 1, limit: 1, totalPages: 0 } });
    }
    if (p.includes('/reviews')) {
      return fulfill({
        success: true,
        data: { average: 4.9, count: 127, threshold: 3, showAverage: true, reviews: [] },
      });
    }
    if (
      p.includes('/services') ||
      p.includes('/staff') ||
      p.includes('/feed') ||
      p.includes('/stories') ||
      p.includes('/tagged') ||
      p.includes('/schedule') ||
      p.includes('/appointments') ||
      p.includes('/availability') ||
      p.includes('/queue') ||
      p.includes('/clients')
    ) {
      return fulfill(json([]));
    }
    return fulfill({ success: true, data: {} });
  });

  const cover = fs.readFileSync(path.resolve(process.cwd(), 'public/screenshots/queue-real.png'));
  await page.route('**/res.cloudinary.com/**', route =>
    route.fulfill({ status: 200, contentType: 'image/png', body: cover })
  );
}

async function openPanel(page: Page, theme: typeof baseTheme) {
  await page.addInitScript(({ shopId }: { shopId: string }) => {
    localStorage.setItem('agendai:cookie-consent-v2', 'all');
    localStorage.setItem('barber_remember_me', 'true');
    localStorage.setItem(
      'barber_user',
      JSON.stringify({
        id: 'u1',
        name: 'Dono Teste',
        email: 'dono@e2e.test',
        role: 'OWNER',
        barbershopId: shopId,
        emailVerified: true,
        active: true,
      })
    );
  }, { shopId: SHOP_ID });

  await mockApi(page, theme);
  await page.goto('/app/link', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('theme-preview')).toBeVisible({ timeout: 20_000 });
  // A coluna nasce abaixo da dobra (PublicLinkPanel acima) — rola até ela;
  // em lg a coluna gruda em top-24 e a moldura inteira fica visível.
  // (timeout curto: no código "antes" esses testids ainda não existem)
  await page.getByTestId('preview-column').scrollIntoViewIfNeeded({ timeout: 1_500 }).catch(() => undefined);
  await page.getByTestId('preview-frame').scrollIntoViewIfNeeded({ timeout: 1_500 }).catch(() => undefined);
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(600);
}

/** Asserções de estrutura da prévia (moldura fixa, escopo do tema, escala, rolagem). */
async function assertPreviewBasics(
  page: Page,
  width: number,
  device: 'mobile' | 'desktop' = 'mobile'
) {
  const frame = page.getByTestId('preview-frame');
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute('role', 'img');
  await expect(frame).toHaveAttribute('aria-label', 'Prévia da página pública');
  // regra 1/5: raio do tema só dentro do mockup — moldura sempre retangular
  expect(await frame.getAttribute('data-radius')).toBeNull();

  const content = page.getByTestId('theme-preview');
  await expect(content).toBeVisible();
  expect(await page.locator('[data-testid="theme-preview"] [inert]').count()).toBeGreaterThan(0);

  const accent = await content.evaluate(el => getComputedStyle(el).getPropertyValue('--ag-accent').trim());
  expect(accent.toUpperCase()).toBe('#2CB58A');
  // regra 5: a moldura fica fora do escopo — herda só o token global do app,
  // nunca as variáveis do rascunho aplicadas dentro do mockup.
  const frameAccent = await frame.evaluate(el => getComputedStyle(el).getPropertyValue('--ag-accent').trim());
  const rootAccent = await page.evaluate(
    () => getComputedStyle(document.documentElement).getPropertyValue('--ag-accent').trim()
  );
  expect(frameAccent.toLowerCase()).toBe(rootAccent.toLowerCase());
  expect(await frame.getAttribute('style') ?? '').not.toContain('--ag-');

  // regra 6: coluna sticky em telas grandes
  if (width >= 1024) {
    const position = await page.getByTestId('preview-column').evaluate(el => getComputedStyle(el).position);
    expect(position).toBe('sticky');
    const column = await page.getByTestId('preview-column').boundingBox();
    expect(column).not.toBeNull();
    expect(column!.width).toBeGreaterThanOrEqual(360);
    expect(column!.x + column!.width).toBeLessThanOrEqual(width + 1);
  } else {
    await expect(page.getByTestId('preview-collapse')).toBeVisible();
  }

  // mockup escalado cabe na moldura (regra 2)
  const fb = await frame.boundingBox();
  const dev = page.getByTestId(`device-${device}`);
  await expect(dev).toBeVisible();
  const db = await dev.boundingBox();
  expect(fb).not.toBeNull();
  expect(db).not.toBeNull();
  expect(db!.width).toBeLessThanOrEqual(fb!.width + 1);
  expect(db!.height).toBeLessThanOrEqual(fb!.height + 1);

  // regra 10: rolagem por wheel funciona mesmo com o conteúdo inert
  // (reancora a moldura: focar o campo do formulário rola a página p/ fora)
  await frame.scrollIntoViewIfNeeded();
  const fb2 = await frame.boundingBox();
  await page.mouse.move(fb2!.x + fb2!.width / 2, fb2!.y + fb2!.height / 2);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(300);
  const scrolled = await page.locator('[data-ag-preview-scroll]').evaluate(el => el.scrollTop);
  expect(scrolled).toBeGreaterThan(0);
  await page.locator('[data-ag-preview-scroll]').evaluate(el => {
    el.scrollTop = 0;
  });
}

test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'prévia validada em desktop-chromium');
});

for (const vp of VIEWPORTS) {
  test(`01 prévia padrão ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await openPanel(page, baseTheme);
    if (!SHOTS_ONLY) {
      await assertPreviewBasics(page, vp.width);
      await expect(page.getByText('Barba Nova').first()).toBeVisible();
    }
    await shoot(page, `01-padrao-${vp.name}`);
  });

  test(`02 mockup desktop ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await openPanel(page, baseTheme);
    await page
      .getByTestId('preview-device-desktop')
      .click({ timeout: 3_000 })
      .catch(() => undefined);
    await page.waitForTimeout(400);
    if (!SHOTS_ONLY) {
      await assertPreviewBasics(page, vp.width, 'desktop');
      await expect(page.getByTestId('device-desktop')).toBeVisible();
      await expect(page.getByText('agendaja.com/queue/seu-salao')).toBeVisible();
      await expect(page.getByTestId('device-mobile')).toHaveCount(0);
      const fb = await page.getByTestId('preview-frame').boundingBox();
      const db = await page.getByTestId('device-desktop').boundingBox();
      expect(fb && db && Math.abs(db.width / db.height - 1200 / 750)).toBeLessThan(0.08);
    }
    await shoot(page, `02-desktop-${vp.name}`);
  });

  test(`03 capa com overlay ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await openPanel(page, { ...baseTheme, coverUrl: COVER_URL, coverOverlay: 60 });
    await page.waitForTimeout(500);
    if (!SHOTS_ONLY) {
      await expect(page.getByTestId('preview-cover')).toBeVisible();
      const img = page.locator('[data-testid="preview-cover"] img');
      await expect(img).toBeVisible();
      await expect(img).toHaveAttribute('src', /res\.cloudinary\.com/);
      const overlay = page
        .locator('[data-testid="preview-cover"] > div[aria-hidden="true"]')
        .first();
      await expect(overlay).toHaveCSS('opacity', '0.6');
      await assertPreviewBasics(page, vp.width);
    }
    await shoot(page, `03-capa-${vp.name}`);
  });

  test(`04 avisos de contraste e alterações não salvas ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await openPanel(page, baseTheme);
    // texto igual ao fundo → par reprovado no WCAG AA + estado sujo
    await page.getByLabel('Cor do texto (hex)').fill('#0F1110');
    await page.waitForTimeout(400);
    if (!SHOTS_ONLY) {
      await expect(page.getByTestId('contrast-status')).toContainText('Contraste insuficiente');
      await expect(page.getByTestId('dirty-warning')).toContainText('Alterações não salvas');
      await expect(page.getByTestId('save-theme')).toBeDisabled();
      // avisos ABAIXO da moldura (regra 8)
      const frame = page.getByTestId('preview-frame');
      const status = page.getByTestId('contrast-status');
      const fb = await frame.boundingBox();
      const sb = await status.boundingBox();
      expect(fb && sb && sb.y >= fb.y + fb.height - 1).toBe(true);
      await assertPreviewBasics(page, vp.width);
    }
    await shoot(page, `04-avisos-${vp.name}`);
  });

  test(`05 página pública real (referência) ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.addInitScript(() => localStorage.setItem('agendai:cookie-consent-v2', 'all'));
    await mockApi(page, baseTheme);
    await page.goto(`/queue/${SHOP_ID}?tab=profile`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Barba Nova').first()).toBeVisible({ timeout: 20_000 });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.waitForTimeout(500);
    if (!SHOTS_ONLY) {
      expect(await page.getByTestId('preview-frame').count()).toBe(0);
    }
    await shoot(page, `05-publica-real-${vp.name}`);
  });
}
