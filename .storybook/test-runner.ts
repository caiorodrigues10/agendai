import type { TestRunnerConfig } from '@storybook/test-runner';
import { waitForPageReady } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import path from 'node:path';

/**
 * Regressão visual — baseline da Etapa 2.
 * - Fontes: `waitForPageReady` espera document.fonts.
 * - Relógio/animações: reducedMotion + CSS que zera animações/transições.
 * - Dados: stories são puras (sem HTTP por padrão; MSW bypass).
 * - Viewport fixo 1440x900 (breakpoint do plano).
 * - Limiar 2% p/ tolerar antialiasing entre ambientes.
 *
 * Gerar/atualizar baseline: npm run test:visual -- --updateSnapshot
 */
const customSnapshotsDir = path.join(process.cwd(), 'visual-regression', '__image_snapshots__');

const NO_ANIMATION_CSS = [
  '*,*::before,*::after{',
  'animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;',
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
