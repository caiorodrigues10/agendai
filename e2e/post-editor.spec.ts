import { expect, test } from '@playwright/test';
import { mkdtempSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { POST_TEMPLATES } from '../../agendai-back-end/src/modules/posts/services/postTemplates';

// This harness mounts the real editor without adding a public/dev route to the app.
// API fixtures contain no production tokens, customer data or network writes.
let output: string;
test.skip(process.env.POST_EDITOR_QA !== '1', 'Harness isolado: usar POST_EDITOR_QA=1 com E2E_BASE_URL apontando para Vite dev.');
test.beforeAll(() => {
  const backend = path.resolve('../agendai-back-end');
  output = mkdtempSync(path.join(tmpdir(), 'agendai-editor-e2e-'));
  execFileSync(process.execPath, [path.join(backend, 'node_modules/tsx/dist/cli.mjs'), 'scripts/preview-post-editorial.ts', output], { cwd: backend, timeout: 55_000 });
});

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => console.error('EDITOR QA:', error.stack));
  await page.route('**/qa/post-editor', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html>
    <html class="dark"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body><button id="outside">Fora do editor</button><div id="root"></div>
    <script type="module">
      import '/src/index.css';
      import RefreshRuntime from '/@react-refresh';
      RefreshRuntime.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {};
      window.$RefreshSig$ = () => type => type;
      window.__vite_plugin_react_preamble_installed__ = true;
      const React = (await import('/node_modules/.vite/deps/react.js')).default;
      const { createRoot } = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
      const { PostEditor } = await import('/src/features/posts/PostEditor.tsx');
      const root = createRoot(document.getElementById('root'));
      root.render(React.createElement(PostEditor, {
        post: null, barbershopId: '11111111-1111-4111-8111-111111111111', userId: 'qa-staff',
        palettes: [{key: 'brand', label: 'Marca'}, {key: 'clara', label: 'Clara'}], mediaLibrary: [],
        onClose: () => root.unmount(), onSaved: () => {}, showToast: () => {}, onMediaUploaded: () => {}
      }));
    </script></body></html>` }));
  await page.route('**/qa-post-art/**', route => {
    const filename = path.basename(new URL(route.request().url()).pathname);
    if (!/^[a-z-]+-(square|portrait|story)\.png$/.test(filename)) return route.abort();
    return route.fulfill({ contentType: 'image/png', body: readFileSync(path.join(output, filename)) });
  });
  await page.route('**/api/**', route => {
    const url = new URL(route.request().url());
    const data = url.pathname.endsWith('/templates')
      ? POST_TEMPLATES.map(t => ({ ...t, formats: ['square', 'portrait', 'story'], previewUrl: '' }))
      : { imageUrl: `/qa-post-art/${url.searchParams.get('templateKey') || 'agenda-aberta'}-${url.searchParams.get('format') || 'square'}.png` };
    return route.fulfill({ json: { success: true, data } });
  });
  await page.goto('/qa/post-editor');
  await page.getByRole('button', { name: /Divulgar serviço/ }).click({ timeout: 10_000 });
});

test('catálogo real oferece foto opcional e a prévia Story tem dimensões corretas', async ({ page }, info) => {
  await page.getByRole('button', { name: /Selecionar modelo|Serviço em destaque/ }).click();
  await page.getByRole('button', { name: 'Com foto', exact: true }).click();
  await page.getByRole('button', { name: 'Selecionar modelo Editorial com foto', exact: true }).click();
  await page.getByRole('button', { name: 'Imagem', exact: true }).click();
  await expect(page.getByText(/não representa resultados do seu salão/)).toBeVisible();
  await page.getByRole('button', { name: 'Formato', exact: true }).click();
  await page.getByRole('button', { name: /Story.*9:16/ }).click();
  if (info.project.name === 'mobile-chromium') await page.getByText('Ver prévia do post', { exact: true }).click();
  const preview = page.getByAltText('Prévia do post').filter({ visible: true }).first();
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute('src', /editorial-foto-story.png/);
  await expect.poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalWidth / img.naturalHeight)).toBe(9 / 16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  await page.screenshot({ path: info.outputPath('post-editor-story.png'), fullPage: true });
});

test('agendamento funciona no celular e o modal prende/restaura o foco e rolagem', async ({ page }, info) => {
  await page.getByRole('button', { name: 'Agendar publicação' }).click();
  await expect(page.getByLabel('Data e horário da publicação')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agendar', exact: true })).toBeVisible();
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  await page.screenshot({ path: info.outputPath('post-editor-schedule.png'), fullPage: true });
  await page.getByRole('button', { name: 'Publicar agora' }).click();
  await expect(page.getByLabel('Data e horário da publicação')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});
