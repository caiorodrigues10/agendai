import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

/**
 * Config enxuta p/ suíte de componentes/lógica (projeto 'app'):
 * pool forks com poucos forks, sem paralelismo de arquivos, reporters 'dot',
 * mocks restaurados por teste e coverage/css fora por padrão — roda só sob
 * `--coverage`. O projeto 'storybook' (browser + Playwright) NÃO entra em
 * `npm test` (só via `npm run test:storybook`).
 *
 * Durante o desenvolvimento: `npm run test:changed` / `npm run test:related`
 * (suíte completa só no CI) — ver AGENTS.md.
 *
 * More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    watch: false,
    teardownTimeout: 8_000,
    reporters: ['dot'],
    coverage: { enabled: false },
    projects: [{
      extends: true,
      test: {
        name: 'app',
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/tests/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        pool: 'forks',
        poolOptions: { forks: { maxForks: 2, minForks: 1 } },
        fileParallelism: false,
        maxWorkers: 2,
        isolate: true,
        css: false,
        clearMocks: true,
        restoreMocks: true,
        testTimeout: 15_000,
        hookTimeout: 10_000,
        hangTimeout: 45_000
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        // Grupo separado: roda depois do projeto 'app' (maxWorkers diferentes).
        sequence: { groupOrder: 1 },
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});
