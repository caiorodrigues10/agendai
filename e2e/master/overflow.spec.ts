import { expect, test } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

const PAGES = [
  { path: '/master/audit', heading: 'Auditoria' },
  { path: '/master/operations', heading: 'Operação' },
];

test('audit e operations não estouram a rolagem horizontal em 390px', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await acceptCookies(page);
    await loginAsMaster(page);

    for (const target of PAGES) {
      await page.goto(target.path);
      await expect(page.getByRole('heading', { name: target.heading })).toBeVisible({
        timeout: 15_000,
      });
      await page.waitForTimeout(500);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${target.path} rola ${overflow}px na horizontal em 390px`).toBeLessThanOrEqual(1);

      const wideElement = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        const nodes = Array.from(document.querySelectorAll<HTMLElement>('body *'));
        const offender = nodes.find((node) => {
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.right > limit + 1;
        });
        if (!offender) return null;
        return {
          tag: offender.tagName.toLowerCase(),
          className: offender.className?.toString().slice(0, 120) ?? '',
          right: Math.round(offender.getBoundingClientRect().right),
          text: (offender.textContent ?? '').trim().slice(0, 80),
        };
      });
      expect(wideElement, `${target.path} tem elemento além da viewport`).toBeNull();
    }
  } finally {
    await context.close();
  }
});
