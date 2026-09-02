import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('agendai:cookie-consent', 'accepted'));
  await page.route('**/api/**', route => {
    const isAuth = route.request().url().includes('/api/auth/');
    return route.fulfill({
      status: isAuth ? 401 : 200,
      contentType: 'application/json',
      body: JSON.stringify(isAuth ? { success: false, message: 'Não autenticado' } : { success: true, data: [] }),
    });
  });
});

test('cadastro autônomo apresenta trial e campos essenciais', async ({ page }) => {
  await page.goto('/cadastro');
  await expect(page.getByText(/30 dias|teste grátis|trial/i).first()).toBeVisible();
  await expect(page.getByRole('textbox', { name: /seu nome/i })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /e-mail/i })).toBeVisible();
});

test('páginas públicas críticas não têm overflow horizontal', async ({ page }) => {
  for (const path of ['/', '/cadastro', '/planos']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow, `overflow em ${path}`).toBe(false);
  }
});

test('agendamento público abre sem autenticação', async ({ page }) => {
  const shopId = '11111111-1111-4111-8111-111111111111';
  await page.route('**/api/**', async route => {
    const url = route.request().url();
    const body = url.includes('/schedule') ? []
      : url.includes('/services') ? []
      : url.includes('/staff') ? []
      : url.includes('/feed') ? []
      : url.includes('/queue/metrics') ? { success: true, data: { completedCount: 0, peopleWaiting: 0 } }
      : url.includes('/queue') ? { success: true, data: [] }
      : { success: true, data: { id: shopId, name: 'Salão E2E', whatsapp: '11999999999', active: true } };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto(`/queue/${shopId}?tab=appointments`);
  await expect(page.getByText(/agend|horário/i).first()).toBeVisible();
  await expect(page).not.toHaveURL(/login/);
});
