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
    // PW_SCREENSHOTS=on grava um screenshot por passo (evidência de QA manual).
    screenshot: process.env.PW_SCREENSHOTS === 'on' ? 'on' : 'only-on-failure',
    serviceWorkers: 'block',
  },
  webServer: process.env.E2E_BASE_URL ? undefined : {
    // `vite preview` serve o `dist/`: sem um build antes, o e2e roda contra um
    // artefato velho (ou o servidor nem sobe quando `dist/` não existe).
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    // O painel master é validado no viewport desktop (ver e2e/master/).
    {
      name: 'mobile-chromium',
      testIgnore: ['**/master/**'],
      use: { ...devices['Pixel 5'] },
    },
    // ITEM 2 — Safari/iOS: fluxos de login no WebKit real (iPhone 13). Só
    // specs de autenticação; o resto da suíte continua em Chromium.
    // Nota (macOS 14 arm64): o Playwright ≥1.62 usa um WebKit "frozen" que não
    // aceita o setting PushAPIEnabled do core → o projeto falha em newPage nesta
    // combinação; em CI/Ubuntu (WebKit oficial) roda normal. Evidência local:
    // runner isolado Playwright 1.58.2 (ver scripts/measurements/item2-webkit.md).
    {
      name: 'webkit-iphone',
      testMatch: ['**/login-safari.spec.ts'],
      use: { ...devices['iPhone 13'] },
    },
  ],
});
