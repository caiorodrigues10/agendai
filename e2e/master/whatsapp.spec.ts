import { expect } from '@playwright/test';
import { acceptCookies, loginAsMaster, MASTER_SKIP, masterConfigured, test } from './helpers';

test.skip(!masterConfigured, MASTER_SKIP);

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

const TABS = [
  { label: 'Visão geral', heading: /WhatsApp — Visão geral/i },
  { label: 'Salões', heading: /WhatsApp — Salões/i },
  { label: 'Conversas', heading: /WhatsApp — Conversas/i },
  { label: 'Filas', heading: /WhatsApp — Filas/i },
  { label: 'Instâncias', heading: /WhatsApp — Instâncias/i },
  { label: 'Falhas', heading: /WhatsApp — Falhas de envio/i },
  { label: 'Logs assistente', heading: /WhatsApp — Logs do assistente/i },
];

test('whatsapp percorre as 7 abas', async ({ page }) => {
  await loginAsMaster(page);
  await page.goto('/master/whatsapp');

  for (const tab of TABS) {
    await page.getByRole('link', { name: tab.label, exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: tab.heading })).toBeVisible();
  }
});
