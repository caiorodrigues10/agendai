import { expect, test } from '@playwright/test';

/**
 * R12 da auditoria: sob `prefers-reduced-motion: reduce`, as páginas com
 * animações GSAP precisam exibir todo o conteúdo imediatamente — sem
 * esconder em `opacity: 0` esperando scroll/animação (antes da correção,
 * o GSAP criava os tweens com `immediateRender` e os alvos abaixo da
 * dobra ficavam invisíveis até o scroll; a correção pula as animações e
 * força os alvos `.opacity-0` à visibilidade).
 */
const PAGINAS = ['/funcionalidades', '/ia-preditiva'];

test.describe('Movimento reduzido (R12)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  for (const path of PAGINAS) {
    test(`${path}: conteúdo com opacity-0 fica visível sem rolar`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'load' });
      await page.waitForTimeout(800);

      const escondidos = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.opacity-0')]
          .filter((el) => Number.parseFloat(getComputedStyle(el).opacity) < 1)
          .map((el) => `${el.tagName}.${el.className}`.slice(0, 80))
      );

      expect(escondidos).toEqual([]);
    });
  }
});
