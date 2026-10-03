import { defineConfig, devices } from '@playwright/test';

// Specs de e2e/master/ fazem login real (seed) contra o dev server com proxy
// /api → backend. Sem essas envs (CI, `npm run test:e2e` puro) elas são
// ignoradas para manter o pipeline verde.
const masterE2eEnabled = Boolean(
  process.env.E2E_BASE_URL &&
    process.env.E2E_MASTER_EMAIL &&
    process.env.E2E_MASTER_PASSWORD,
);

export default defineConfig({
  testDir: './e2e',
  testIgnore: masterE2eEnabled ? [] : ['**/master/**'],
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
  },
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    // O painel master é validado no viewport desktop (ver e2e/master/).
    {
      name: 'mobile-chromium',
      testIgnore: ['**/master/**'],
      use: { ...devices['Pixel 5'] },
    },
  ],
});
