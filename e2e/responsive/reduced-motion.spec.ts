import { expect, test } from '@playwright/test';

/**
 * R12 da auditoria: sob `prefers-reduced-motion: reduce`, as páginas com
 * animações GSAP precisam exibir todo o conteúdo imediatamente — sem
 * esconder em `opacity: 0` esperando scroll/animação (antes da correção,
 * o GSAP criava os tweens com `immediateRender` e os alvos abaixo da
 * dobra ficavam invisíveis até o scroll; a correção pula as animações e
 * força os alvos `.opacity-0` à visibilidade).
 */
const PAGINAS = ['/funcionalidades', '/ia-preditiva', '/', '/planos'];

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
          // Exclui o que é oculto por design (ex.: CTA sticky de /planos, que
          // nasce aria-hidden + pointer-events-none e só aparece no scroll —
          // o conteúdo de verdade continua visível na página).
          .filter((el) => !el.closest('[aria-hidden="true"]'))
          .map((el) => `${el.tagName}.${el.className}`.slice(0, 80))
      );

      expect(escondidos).toEqual([]);
    });
  }

  // Item C: `/planos` ganhou animação de @keyframes (só transform) que precisa
  // existir no caminho normal e sumir com prefers-reduced-motion.
  // O "/" teve animação de CSS implementada e revertida: 6 sessões de A/B na
  // mesma build mostraram custo de ~+220 ms de LCP em off@1440 com a animação
  // ligada (2184/2288/2360 vs 2032/2032/2104 sem) — as linhas do H1 ficam,
  // portanto, sem animationName. Se alguém reativar, este teste falha de
  // propósito: refaça a medição antes.
  test('/: as linhas do H1 continuam sem animação de CSS', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForSelector('[data-hero-line]');
    const visiveis = await page.$$eval('[data-hero-line]', els =>
      els.map(el => ({
        animationName: getComputedStyle(el).animationName,
        opacity: getComputedStyle(el).opacity,
      })),
    );
    expect(visiveis).toEqual([
      { animationName: 'none', opacity: '1' },
      { animationName: 'none', opacity: '1' },
      { animationName: 'none', opacity: '1' },
    ]);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduzido = await page.$$eval('[data-hero-line]', els =>
      els.map(el => getComputedStyle(el).animationName),
    );
    expect(reduzido).toEqual(['none', 'none', 'none']);
  });

  test('/planos: o hero anima sem reduce e para com reduce', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/planos', { waitUntil: 'load' });
    await page.waitForSelector('.planos-hero-rise');
    const nomes = await page.$$eval('.planos-hero-rise', els =>
      [...new Set(els.map(el => getComputedStyle(el).animationName))],
    );
    expect(nomes).toEqual(['planos-hero-rise']);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduzido = await page.$$eval('.planos-hero-rise', els =>
      [...new Set(els.map(el => getComputedStyle(el).animationName))],
    );
    expect(reduzido).toEqual(['none']);
  });
});
