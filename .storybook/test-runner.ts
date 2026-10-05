import type { TestRunnerConfig } from '@storybook/test-runner';
import { waitForPageReady } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import path from 'node:path';

/**
 * Regressão visual — baseline da Etapa 2.
 * - Fontes: `waitForPageReady` espera document.fonts.
 * - Relógio/animações: reducedMotion + CSS que zera animações/transições.
 * - Dados: stories com HTTP usam MSW (`public/mockServiceWorker.js` é servido
 *   pelo build estático; o Vitest resolve o mesmo arquivo via plugin próprio).
 * - Viewport fixo 1440x900 (breakpoint do plano).
 * - Limiar 2% p/ tolerar antialiasing entre ambientes.
 *
 * Gerar/atualizar baseline: npm run test:visual -- --updateSnapshot
 */
const customSnapshotsDir = path.join(process.cwd(), 'visual-regression', '__image_snapshots__');

// `animation-duration` precisa ser 0.01ms (não 0s): com 0s o Chromium calcula
// o keyframe 0 (`from`/opacity:0) e nunca entra na after-phase do fill
// `forwards` — stories com `animate-fade-in` ficariam invisíveis no screenshot.
// O mesmo valor já é aplicado por `src/styles/base.css` no media reduced-motion.
const NO_ANIMATION_CSS = [
  '*,*::before,*::after{',
  'animation-duration:0.01ms!important;animation-delay:0s!important;animation-iteration-count:1!important;',
  'transition:none!important;caret-color:transparent!important;scrollbar-width:none!important;',
  '}',
  'html{scroll-behavior:auto!important}',
].join('');

declare const expect: {
  extend: (m: Record<string, unknown>) => void;
  (actual: unknown): {
    toMatchImageSnapshot: (opts: Record<string, unknown>) => void;
  };
};

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async preVisit(page) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  },
  async postVisit(page, context) {
    await waitForPageReady(page);
    // `networkidle` pode resolver antes de o story montar (bundle pesado /
    // efeito assíncrono): sem isto o screenshot sai vazio. Espera
    // #storybook-root ter filho + 2 frames antes de capturar.
    await page
      .waitForFunction(
        () => {
          const root = document.querySelector('#storybook-root');
          return !!root && root.childElementCount > 0;
        },
        undefined,
        { timeout: 5000 }
      )
      .catch(() => undefined);
    await page.evaluate(
      () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    );
    await page.addStyleTag({ content: NO_ANIMATION_CSS });
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir,
      customSnapshotIdentifier: context.id,
      failureThreshold: 0.02,
      failureThresholdType: 'percent',
    });
  },
};

export default config;
