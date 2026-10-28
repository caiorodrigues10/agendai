import { expect, test } from '@playwright/test';
import { TAB_GROUPS, MOBILE_PRIMARY_TAB_IDS } from '../src/config/tabRegistry';

const shopId = '11111111-1111-4111-8111-111111111111';
const owner = {
  id: 'owner-ux',
  name: 'Responsável de teste',
  email: 'ux@example.test',
  role: 'OWNER',
  barbershopId: shopId,
  emailVerified: true,
};

// Tests actual SPA routes. Unspecified API operations deliberately fail: this
// verifies navigation/error recovery, not successful backend business operations.
test('todos os menus do proprietário abrem e a navegação continua disponível com falhas de API', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(user => {
    localStorage.setItem('barber_user', JSON.stringify(user));
    localStorage.setItem('barber_remember_me', 'true');
    localStorage.setItem('agendai:cookie-consent-v2', 'essential');
  }, owner);
  await page.route('**/api/**', async route => {
    const endpoint = new URL(route.request().url()).pathname;
    if (endpoint === '/api/auth/refresh')
      return route.fulfill({ json: { accessToken: 'local-ux-fixture', user: owner } });
    if (endpoint === '/api/auth/me') return route.fulfill({ json: { user: owner } });
    let data: unknown;
    if (endpoint === `/api/barbershops/${shopId}`)
      data = {
        id: shopId,
        name: 'Salão UX',
        active: true,
        whatsapp: '11999999999',
        operationMode: 'HYBRID',
        openingMode: 'MANUAL',
        manualStatus: 'OPEN',
        openState: { open: true, queueClosed: false },
      };
    else if (endpoint.endsWith('/onboarding'))
      data = {
        steps: [],
        progress: 0,
        nextStep: null,
        completed: false,
        welcomeSeen: true,
        dismissed: true,
      };
    else if (endpoint.endsWith('/schedule'))
      data = Array.from({ length: 7 }, (_, dayOfWeek) => ({
        dayOfWeek,
        isOpen: true,
        openTime: '09:00',
        closeTime: '18:00',
      }));
    else if (endpoint === '/api/subscriptions/me')
      data = {
        subscription: {
          id: 'sub-ux',
          status: 'ACTIVE',
          planHasDashboard: true,
          planName: 'Pro',
          planPrice: 29,
          invoices: [],
          latestInvoice: null,
        },
        invoices: [],
      };
    else if (
      ['/api/services', '/api/users', '/api/feed', '/api/queue', '/api/appointments'].includes(
        endpoint
      )
    )
      data = [];
    else if (endpoint.endsWith('/staff')) data = [];
    else if (endpoint.endsWith('/queue/metrics')) data = { completedCount: 0, peopleWaiting: 0 };
    else
      return route.fulfill({
        status: 503,
        json: { success: false, message: 'Indisponibilidade simulada para revisão de UX' },
      });
    return route.fulfill({ json: { success: true, data } });
  });
  await page.goto('/app/overview');
  const mobile = Boolean(testInfo.project.use.isMobile);
  const nav = page.getByRole('navigation', {
    name: mobile ? 'Navegação compacta do painel' : 'Navegação do painel',
    exact: true,
  });
  await expect(nav).toBeVisible({ timeout: 45_000 });
  for (const item of TAB_GROUPS.flatMap(group => group.tabs)) {
    await test.step(item.label, async () => {
      let container = nav;
      if (mobile && !MOBILE_PRIMARY_TAB_IDS.includes(item.id as never)) {
        await nav.getByRole('button', { name: 'Mais', exact: true }).click();
        container = page.getByRole('dialog', { name: 'Mais opções' });
      }
      await container.getByRole('button', { name: item.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/app/${item.id}(?:\\?|$)`));
      await expect(nav).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: /Algo deu errado|Ocorreu um erro inesperado/ })
      ).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        item.label
      ).toBe(false);
    });
  }
  expect(errors).toEqual([]);
  await page.goBack();
  await expect(page).toHaveURL(/\/app\/subscription/);
});
