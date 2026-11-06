import { expect, test } from '@playwright/test';

// ITEM 4 — métrica de conteúdo útil na aba pública ?tab=appointments.
// Garante que (a) não há texto visível "Carregando..." (antigo LCP da rota)
// e (b) o mark/measure public-content-ready/-usable é emitido quando o
// conteúdo real renderiza.

const SHOP_ID = '11111111-1111-4111-8111-111111111111';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('agendai:cookie-consent', 'accepted'));
  await page.route('**/api/**', async route => {
    const url = route.request().url();
    const body = url.includes('/schedule')
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
                : {
                    success: true,
                    data: { id: SHOP_ID, name: 'Salão E2E', whatsapp: '11999999999', active: true },
                  };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
});

test('fila pública ?tab=appointments emite mark de conteúdo útil e não tem "Carregando..." visível', async ({ page }) => {
  await page.goto(`/queue/${SHOP_ID}?tab=appointments`);

  // Conteúdo real (aba Agenda) visível.
  await expect(page.getByRole('button', { name: 'Agenda', exact: true })).toBeVisible();

  // Sem texto visível "Carregando..." (sr-only é permitido).
  const visibleCarregando = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('p,span,div,button'));
    return nodes
      .filter(
        el =>
          el.childElementCount === 0 &&
          (el.textContent ?? '').trim() === 'Carregando...' &&
          !el.className.toString().includes('sr-only')
      )
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }).length;
  });
  expect(visibleCarregando).toBe(0);

  // Mark/measure de conteúdo útil emitidos e coerentes.
  const marks = await page.evaluate(() => performance.getEntriesByName('public-content-ready').length);
  expect(marks).toBeGreaterThanOrEqual(1);

  const usable = await page.evaluate(() => {
    const entries = performance.getEntriesByName('public-content-usable');
    return entries.length ? Math.round(entries[entries.length - 1].duration) : null;
  });
  expect(usable).not.toBeNull();
  expect(usable!).toBeGreaterThan(0);
});
