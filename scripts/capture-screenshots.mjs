import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3003';
const OUT = process.env.OUT_DIR || path.resolve('.screenshots-tmp');
const SHOP = 'd0000000-0000-4000-8000-000000000001';
const EMAIL = process.env.CAPTURE_EMAIL || 'demo.owner@agendai.local';
const PASS = process.env.CAPTURE_PASS || 'admin123';

const DESKTOP = { width: 1400, height: 900 };
const MOBILE = { width: 390, height: 844 };

fs.mkdirSync(OUT, { recursive: true });

async function makeContext(browser, { theme = 'dark', viewport = DESKTOP, mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: theme,
  });
  await ctx.addInitScript((t) => {
    localStorage.setItem('agendai:cookie-consent', 'accepted');
    localStorage.setItem('agendai:theme', t);
  }, theme);
  return ctx;
}

async function dismissCookies(page) {
  const accept = page.getByRole('button', { name: /aceitar todos/i }).first();
  if (await accept.count().catch(() => 0)) {
    await accept.click().catch(() => {});
  }
}

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file });
  console.log(`[shot] ${file}`);
  return file;
}

const browser = await chromium.launch();

try {
  // 1) Login page (dark)
  {
    const ctx = await makeContext(browser, { theme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await dismissCookies(page);
    await page.waitForTimeout(800);
    await shot(page, 'login-dark.png');
    await ctx.close();
  }

  // 2) Login flow -> staff pages (queue dark also replaces public/screenshots/queue-real.png)
  async function captureStaffPage(theme, tab, outFile, { mainFile = null, viewport = DESKTOP } = {}) {
    const ctx = await makeContext(browser, { theme, viewport });
    const page = await ctx.newPage();
    page.on('response', (r) => {
      if (r.url().includes('/api/auth/') && r.request().method() !== 'GET') {
        console.log(`[auth] ${r.request().method()} ${r.url()} -> ${r.status()}`);
      }
    });
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await dismissCookies(page);

    const emailSel = 'input[placeholder="seu@email.com"]';
    const passSel = 'input[type="password"]';
    try {
      await page.waitForSelector(emailSel, { timeout: 15000 });
    } catch {
      const alt = page.getByRole('button', { name: /e-?mail/i }).first();
      if (await alt.count()) {
        await alt.click();
        await page.waitForSelector(emailSel, { timeout: 10000 });
      } else throw new Error('form de login não encontrado');
    }
    await page.fill(emailSel, EMAIL);
    await page.fill(passSel, PASS);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/app\//, { timeout: 25000 });
    await page.goto(`${BASE}/app/${tab}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const skip = page.getByText(/pular por agora/i).first();
    if (await skip.count().catch(() => 0)) {
      console.log('[staff] pulando onboarding');
      await skip.click().catch(() => {});
      await page.waitForTimeout(1500);
    }
    await page.goto(`${BASE}/app/${tab}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    if (tab === 'queue') {
      const hasData = await page.getByText(/Cliente Demo/).first().isVisible().catch(() => false);
      console.log(`[staff ${tab} ${theme}] dados visíveis: ${hasData}`);
    }
    await shot(page, outFile);
    if (mainFile) {
      const main = path.resolve(`public/screenshots/${mainFile}`);
      await page.screenshot({ path: main });
      console.log(`[shot] ${main} (atualizado)`);
    }
    await ctx.close();
  }

  await captureStaffPage('dark', 'queue', 'staff-queue-dark.png', { mainFile: 'queue-real.png' });
  await captureStaffPage('light', 'queue', 'staff-queue-light.png');
  await captureStaffPage('dark', 'appointments', 'appointments-real.png', {
    mainFile: 'appointments-real.png',
    viewport: { width: 1400, height: 1001 },
  });
  await captureStaffPage('dark', 'reports', 'reports-real.png', { mainFile: 'reports-real.png' });

  // 3) Public queue
  {
    const ctx = await makeContext(browser, { theme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/queue/${SHOP}`, { waitUntil: 'networkidle' });
    await dismissCookies(page);
    await page.waitForTimeout(2000);
    await shot(page, 'public-queue-dark.png');
    await ctx.close();
  }

  // 4) Landing desktop dark/light
  for (const theme of ['dark', 'light']) {
    const ctx = await makeContext(browser, { theme });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await dismissCookies(page);
    await page.waitForTimeout(1200);
    await shot(page, `landing-desktop-${theme}.png`);
    await ctx.close();
  }

  // 5) Landing mobile dark/light
  for (const theme of ['dark', 'light']) {
    const ctx = await makeContext(browser, { theme, viewport: MOBILE, mobile: true });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await dismissCookies(page);
    await page.waitForTimeout(1200);
    await shot(page, `landing-mobile-${theme}.png`);
    await ctx.close();
  }

  console.log('OK');
} catch (err) {
  console.error('FALHA:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
