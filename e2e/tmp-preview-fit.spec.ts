import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * TEMP (apagar após verificação): mede a rolagem da prévia em alturas
 * 700/800/900/1080 (lg) e < lg — sem screenshots, só geometria.
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

function json(data: unknown) {
  return JSON.stringify({ success: true, data });
}

/** Payload de `GET /api/barbershops/:id/traffic` (copiado do spec real). */
function trafficData(period: string) {
  return {
    success: true,
    data: {
      period: {
        key: period,
        label: period,
        granularity: 'day',
        fromDay: '2026-11-10',
        toDay: '2026-11-16',
        prevFromDay: '2026-11-03',
        prevToDay: '2026-11-09',
        timezone: 'America/Sao_Paulo',
        dataFrom: null,
      },
      generatedAt: '2026-11-16T12:00:00.000Z',
      beaconEnabled: true,
      totals: { visits: 42, visitors: 30, visitorsBasis: 'daily_distinct' },
      prevTotals: { visits: 20, visitors: 12, visitorsBasis: 'daily_distinct' },
      deltaPct: { visits: 50, visitors: 75 },
      series: [
        { bucketStart: '2026-11-15', label: '15/11', visits: 12, visitors: 8, partial: false },
        { bucketStart: '2026-11-16', label: '16/11', visits: 30, visitors: 21, partial: true },
      ],
      sections: [
        { section: 'profile', visits: 20, visitors: 15 },
        { section: 'queue', visits: 12, visitors: 9 },
      ],
      origins: [{ host: 'www.instagram.com', visits: 14 }],
    },
  };
}

async function mockApi(page: Page) {
  await page.route('**/api/**', async route => {
    const p = new URL(route.request().url()).pathname;
    const fulfill = (payload: unknown) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });

    if (p.endsWith('/api/auth/refresh')) return fulfill({ accessToken: 'e2e-token', user: USER });
    if (p.endsWith('/api/auth/me')) return fulfill({ user: USER });
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
    if (p.includes('/page-theme')) return fulfill({ success: true, data: baseTheme });
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
    if (p.includes('/traffic')) {
      const period = new URL(route.request().url()).searchParams.get('period') ?? 'week';
      return fulfill(trafficData(period));
    }
    if (/\/api\/barbershops\/[^/]+$/.test(p)) return fulfill(SHOP);
    if (p.includes('/queue/metrics')) return fulfill({ success: true, data: { completedCount: 0, peopleWaiting: 0 } });
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

async function openPanel(page: Page) {
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

  await mockApi(page);
  await page.goto('/app/link', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('theme-preview')).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(700);
}

interface Metrics {
  viewport: { w: number; h: number };
  mode: string;
  columnOverflowY: string;
  columnScrollable: boolean;
  scrollablesInColumn: string[];
  frameInsideColumn: boolean;
  frameInsideFit: boolean;
  frameRatio: number;
  deviceRatio: number;
  innerScrollable: boolean;
  innerScrollMax: number;
  frameRect: { w: number; h: number; top: number; bottom: number };
  columnRect: { top: number; bottom: number };
}

async function measure(page: Page, mode: 'mobile' | 'desktop'): Promise<Metrics> {
  return page.evaluate(modeSel => {
    const column = document.querySelector('[data-testid="preview-column"]') as HTMLElement;
    const fit = document.querySelector('[data-testid="preview-frame-fit"]') as HTMLElement;
    const frame = document.querySelector('[data-testid="preview-frame"]') as HTMLElement;
    const scroll = document.querySelector('[data-ag-preview-scroll]') as HTMLElement;
    const dev = document.querySelector(`[data-testid="device-${modeSel}"]`) as HTMLElement;
    const cr = column.getBoundingClientRect();
    const fr = frame.getBoundingClientRect();
    const fir = fit.getBoundingClientRect();
    const dr = dev.getBoundingClientRect();
    const scrollablesInColumn = Array.from(column.querySelectorAll<HTMLElement>('*'))
      .filter(el => {
        const oy = getComputedStyle(el).overflowY;
        return (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1;
      })
      .map(el =>
        el.hasAttribute('data-ag-preview-scroll')
          ? 'data-ag-preview-scroll'
          : (el.getAttribute('data-testid') ?? el.tagName)
      );
    const devRatio = dr.height > 0 ? dr.width / dr.height : 0;
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      mode: modeSel,
      columnOverflowY: getComputedStyle(column).overflowY,
      columnScrollable: column.scrollHeight > column.clientHeight + 1,
      scrollablesInColumn,
      frameInsideColumn:
        fr.top >= cr.top - 1 && fr.bottom <= cr.bottom + 1 && fr.left >= cr.left - 1 && fr.right <= cr.right + 1,
      frameInsideFit:
        fr.top >= fir.top - 1 && fr.bottom <= fir.bottom + 1 && fr.left >= fir.left - 1 && fr.right <= fir.right + 1,
      frameRatio: fr.height > 0 ? fr.width / fr.height : 0,
      deviceRatio: devRatio,
      innerScrollable: scroll.scrollHeight > scroll.clientHeight + 1,
      innerScrollMax: scroll.scrollHeight - scroll.clientHeight,
      frameRect: { w: fr.width, h: fr.height, top: fr.top, bottom: fr.bottom },
      columnRect: { top: cr.top, bottom: cr.bottom },
    };
  }, mode);
}

const VIEWPORTS = [
  { w: 1440, h: 700 },
  { w: 1440, h: 800 },
  { w: 1440, h: 900 },
  { w: 1440, h: 1080 },
  { w: 390, h: 844 },
] as const;

test.beforeEach(async (_fixtures, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'medição em desktop-chromium');
});

for (const vp of VIEWPORTS) {
  test(`fit ${vp.w}x${vp.h}`, async ({ page }) => {    await page.setViewportSize({ width: vp.w, height: vp.h });
    await openPanel(page);

    const mobile = await measure(page, 'mobile');
    console.log(`MOBILE ${vp.w}x${vp.h}: ${JSON.stringify(mobile)}`);
    expect(mobile.frameInsideColumn).toBe(true);
    expect(mobile.frameInsideFit).toBe(true);
    expect(mobile.columnScrollable).toBe(false);
    // único elemento realmente rolável na coluna = tela interna do mockup
    expect(mobile.scrollablesInColumn).toEqual(['data-ag-preview-scroll']);
    expect(mobile.innerScrollable).toBe(true);
    if (vp.w >= 1024) expect(mobile.columnOverflowY).toBe('visible');
    else expect(mobile.columnOverflowY).toBe('visible');
    expect(Math.abs(mobile.frameRatio - 402 / 835) / (402 / 835)).toBeLessThan(0.01);
    expect(Math.abs(mobile.deviceRatio - 402 / 835) / (402 / 835)).toBeLessThan(0.01);

    // roda/trackpad: wheel sobre a moldura rola a tela interna até o fim
    await page.getByTestId('preview-frame').scrollIntoViewIfNeeded();
    const fb = (await page.getByTestId('preview-frame').boundingBox())!;
    await page.mouse.move(
      fb.x + fb.width / 2,
      Math.max(5, Math.min(fb.y + fb.height / 2, vp.h - 5))
    );
    let last = -1;
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(40);
      const st = await page.locator('[data-ag-preview-scroll]').evaluate(el => el.scrollTop);
      if (st === last) break;
      last = st;
    }
    const afterWheel = await page
      .locator('[data-ag-preview-scroll]')
      .evaluate(el => ({ top: el.scrollTop, max: el.scrollHeight - el.clientHeight }));
    console.log(`WHEEL ${vp.w}x${vp.h}: ${JSON.stringify(afterWheel)}`);
    expect(afterWheel.top).toBeGreaterThan(0);
    expect(afterWheel.top).toBeGreaterThanOrEqual(afterWheel.max - 2);

    // teclado: foca a região rolável e End/PageDown chegam ao fim
    await page.locator('[data-ag-preview-scroll]').evaluate(el => (el as HTMLElement).focus());
    await page.keyboard.press('End');
    await page.waitForTimeout(100);
    const afterEnd = await page
      .locator('[data-ag-preview-scroll]')
      .evaluate(el => ({ top: el.scrollTop, max: el.scrollHeight - el.clientHeight }));
    expect(afterEnd.top).toBeGreaterThanOrEqual(afterEnd.max - 2);

    // desktop: mesma regra
    await page.getByTestId('preview-device-desktop').click();
    await page.waitForTimeout(400);
    const desktop = await measure(page, 'desktop');
    console.log(`DESKTOP ${vp.w}x${vp.h}: ${JSON.stringify(desktop)}`);
    expect(desktop.frameInsideColumn).toBe(true);
    expect(desktop.frameInsideFit).toBe(true);
    expect(desktop.columnScrollable).toBe(false);
    expect(desktop.scrollablesInColumn).toEqual(['data-ag-preview-scroll']);
    // moldura com o aspect-ratio do dispositivo (±1%)
    const expected = desktop.mode === 'desktop' ? 1024 / 1100 : 402 / 835;
    expect(Math.abs(desktop.frameRatio - expected) / expected).toBeLessThan(0.01);
    expect(Math.abs(desktop.deviceRatio - expected) / expected).toBeLessThan(0.01);
  });
}

test('debug wheel exato do spec real 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPanel(page);
  const frame = page.getByTestId('preview-frame');
  await frame.scrollIntoViewIfNeeded();
  const fb = (await frame.boundingBox())!;
  const cx = fb.x + fb.width / 2;
  const cy = fb.y + fb.height / 2;
  await page.mouse.move(cx, cy);
  const hit = await page.evaluate(
    ([x, y]) => {
      const el = document.elementFromPoint(x, y);
      const path: string[] = [];
      let cur: Element | null = el;
      while (cur && path.length < 8) {
        path.push(
          `${cur.tagName.toLowerCase()}${cur.hasAttribute('data-testid') ? `[${cur.getAttribute('data-testid')}]` : ''}${
            cur.hasAttribute('data-ag-preview-scroll') ? '[scroll]' : ''
          }${(cur as HTMLElement).inert ? '[INERT]' : ''}`
        );
        cur = cur.parentElement;
      }
      const scroll = document.querySelector('[data-ag-preview-scroll]') as HTMLElement;
      return { path, scrollable: scroll.scrollHeight > scroll.clientHeight, max: scroll.scrollHeight - scroll.clientHeight, top: scroll.scrollTop, inertHit: (el as HTMLElement | null)?.closest('[inert]') !== null };
    },
    [cx, cy]
  );
  console.log(`HIT: ${JSON.stringify(hit)} fb=${JSON.stringify(fb)}`);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(300);
  const st = await page.locator('[data-ag-preview-scroll]').evaluate(el => el.scrollTop);
  console.log(`AFTER WHEEL: ${st}`);
});

test('debug 04 exato 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPanel(page);
  await page.getByLabel('Cor do texto (hex)').fill('#0F1110');
  await page.waitForTimeout(400);
  const frame = page.getByTestId('preview-frame');
  await frame.scrollIntoViewIfNeeded();
  const fb = (await frame.boundingBox())!;
  const cx = fb.x + fb.width / 2;
  const cy = fb.y + fb.height / 2;
  const hit = await page.evaluate(
    ([x, y]) => {
      const el = document.elementFromPoint(x, y);
      const scroll = document.querySelector('[data-ag-preview-scroll]') as HTMLElement;
      const column = document.querySelector('[data-testid="preview-column"]') as HTMLElement;
      const fit = document.querySelector('[data-testid="preview-frame-fit"]') as HTMLElement;
      return {
        hit: el ? `${el.tagName}[${el.getAttribute('data-testid') ?? ''}]` : null,
        cy: y, vh: window.innerHeight,
        scrollMax: scroll.scrollHeight - scroll.clientHeight,
        columnH: column.clientHeight,
        fitH: fit.clientHeight,
        frameW: (document.querySelector('[data-testid="preview-frame"]') as HTMLElement).getBoundingClientRect().width,
        docScrollY: window.scrollY,
      };
    },
    [cx, cy]
  );
  console.log(`HIT04: ${JSON.stringify(hit)} fb=${JSON.stringify(fb)}`);
  await page.mouse.move(cx, cy);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(300);
  const st = await page.locator('[data-ag-preview-scroll]').evaluate(el => el.scrollTop);
  console.log(`AFTER04: ${st}`);
});

test('debug 04 path 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPanel(page);
  await page.getByLabel('Cor do texto (hex)').fill('#0F1110');
  await page.waitForTimeout(400);
  const frame = page.getByTestId('preview-frame');
  await frame.scrollIntoViewIfNeeded();
  const fb = (await frame.boundingBox())!;
  const cx = fb.x + fb.width / 2;
  const cy = fb.y + fb.height / 2;
  const info = await page.evaluate(
    ([x, y]) => {
      const el = document.elementFromPoint(x, y);
      const path: string[] = [];
      let cur: Element | null = el;
      while (cur && path.length < 10) {
        const cls = typeof cur.className === 'string' ? cur.className.slice(0, 70) : '';
        path.push(`${cur.tagName.toLowerCase()}${cur.getAttribute('data-testid') ? '[' + cur.getAttribute('data-testid') + ']' : ''} .${cls}${(cur as HTMLElement).inert ? ' [INERT]' : ''}`);
        cur = cur.parentElement;
      }
      return { path, html: el?.outerHTML.slice(0, 200) ?? null };
    },
    [cx, cy]
  );
  console.log(`PATH04: ${JSON.stringify(info, null, 1)}`);
});
