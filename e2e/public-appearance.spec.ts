import { expect, test } from '@playwright/test';

/**
 * E2E visual da página pública (/queue/:id) com tema personalizado.
 * Todos os endpoints da API são mockados — roda sem backend
 * (dev server via `vite preview` no config do Playwright).
 */

const SHOP_ID = '11111111-1111-4111-8111-111111111111';

const customTheme = {
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
  coverUrl: null,
  coverPublicId: null,
  coverOverlay: 40,
};

function mockApi(page: import('@playwright/test').Page, theme: typeof customTheme | null) {
  return page.route('**/api/**', async route => {
    const url = route.request().url();
    const body = url.includes('/page-theme')
      ? { success: true, data: theme }
      : url.includes('/schedule')
        ? []
        : url.includes('/services')
          ? []
          : url.includes('/staff')
            ? []
            : url.includes('/feed')
              ? []
              : url.includes('/queue/metrics')
                ? { success: true, data: { completedCount: 0, peopleWaiting: 0 } }
                : url.includes('/queue')
                  ? { success: true, data: [] }
                  : { success: true, data: { id: SHOP_ID, name: 'Salão Tema', whatsapp: '11999999999', active: true } };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('agendai:cookie-consent', 'accepted'));
});

test('aplica as CSS variables do tema salvo no wrapper da página', async ({ page }) => {
  await mockApi(page, customTheme);
  await page.goto(`/queue/${SHOP_ID}`, { waitUntil: 'domcontentloaded' });

  const wrapper = page.locator('[data-testid="shop-page-theme"]');
  await expect(wrapper).toBeVisible();

  const accent = await wrapper.evaluate(el => getComputedStyle(el).getPropertyValue('--ag-accent').trim());
  const background = await wrapper.evaluate(el => getComputedStyle(el).getPropertyValue('--ag-bg').trim());

  expect(accent).toBe('#2CB58A');
  expect(background).toBe('#0F1110');
  await expect(wrapper).toHaveAttribute('data-radius', 'rounded');
});

test('sem tema salvo renderiza a página no visual padrão (sem wrapper de tema)', async ({ page }) => {
  await mockApi(page, null);
  await page.goto(`/queue/${SHOP_ID}`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('[data-testid="shop-page-theme"]')).toHaveCount(0);
  await expect(page.getByText(/fila|agend/i).first()).toBeVisible();
});

test('a página com tema não tem overflow horizontal', async ({ page }) => {
  await mockApi(page, customTheme);
  await page.goto(`/queue/${SHOP_ID}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-testid="shop-page-theme"]')).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);
});

test('botões herdam o estilo (filled) do tema', async ({ page }) => {
  await mockApi(page, { ...customTheme, buttonStyle: 'outline' });
  await page.goto(`/queue/${SHOP_ID}`, { waitUntil: 'domcontentloaded' });

  const wrapper = page.locator('[data-testid="shop-page-theme"]');
  await expect(wrapper).toHaveAttribute('data-button-style', 'outline');
});
