import { expect, test } from '@playwright/test';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { POST_TEMPLATES } from '../../agendai-back-end/src/modules/posts/services/postTemplates';

// This harness mounts the real editor without adding a public/dev route to the app.
// API fixtures contain no production tokens, customer data or network writes.
let output: string;
let harnessDirectory: string;
let harnessPath: string;
let harnessUrl: string;
const harness = `<!doctype html>
<html class="dark"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body><button id="outside">Fora do editor</button><div id="root"></div>
<script type="module">
  import '/src/index.css';
  import React from 'react';
  import { createRoot } from 'react-dom/client';
  import { PostEditor } from '/src/features/posts/PostEditor.tsx';
  const root = createRoot(document.getElementById('root'));
  const mode = new URLSearchParams(location.search).get('post');
  const id = '22222222-2222-4222-8222-222222222222';
  const post = mode ? { id, type: 'haircut', title: 'Corte original', content: '',
    likes: 0, createdAt: Date.now(), status: mode, templateKey: 'agenda-aberta',
    format: 'square', paletteKey: 'brand', scheduledFor: Date.now() + 86400000 } : null;
  function Harness() {
    const [media, setMedia] = React.useState([]);
    return React.createElement(PostEditor, {
    post, barbershopId: '11111111-1111-4111-8111-111111111111', userId: 'qa-staff',
    palettes: [{key: 'brand', label: 'Marca'}, {key: 'clara', label: 'Clara'}], mediaLibrary: media,
    onClose: () => root.unmount(), onSaved: () => {}, showToast: () => {}, onMediaUploaded: item => setMedia(list => [item, ...list])
    });
  }
  root.render(React.createElement(Harness));
</script></body></html>`;
test.skip(process.env.POST_EDITOR_QA !== '1', 'Harness isolado: usar POST_EDITOR_QA=1 com E2E_BASE_URL apontando para Vite dev.');
test.beforeAll(() => {
  // O HTML passa pela transformação real do Vite (incluindo o preamble React
  // e a resolução de dependências), sem importar arquivos internos de .vite.
  mkdirSync(path.resolve('node_modules/.cache'), { recursive: true });
  harnessDirectory = mkdtempSync(path.resolve('node_modules/.cache/post-editor-qa-'));
  harnessPath = path.join(harnessDirectory, 'index.html');
  harnessUrl = '/' + path.relative(process.cwd(), harnessPath).split(path.sep).join('/');
  writeFileSync(harnessPath, harness);
  const backend = path.resolve('../agendai-back-end');
  output = process.env.POST_EDITOR_QA_ARTIFACTS || mkdtempSync(path.join(tmpdir(), 'agendai-editor-e2e-'));
  if (process.env.POST_EDITOR_QA_ARTIFACTS) return;
  test.setTimeout(120_000);
  execFileSync(process.execPath, [path.join(backend, 'node_modules/tsx/dist/cli.mjs'), 'scripts/preview-post-editorial.ts', output], { cwd: backend, timeout: 110_000 });
});

test.afterAll(() => {
  if (harnessPath) unlinkSync(harnessPath);
  if (harnessDirectory) rmdirSync(harnessDirectory);
});

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => console.error('EDITOR QA:', error.stack));
  await page.route('**/qa-post-art/**', route => {
    const filename = path.basename(new URL(route.request().url()).pathname);
    if (!/^[a-z0-9-]+-(square|portrait|story)\.png$/.test(filename)) return route.abort();
    return route.fulfill({ contentType: 'image/png', body: readFileSync(path.join(output, filename)) });
  });
  await page.route('**/api/**', route => {
    const url = new URL(route.request().url());
    const data = url.pathname.endsWith('/templates')
      ? POST_TEMPLATES.map(t => ({ ...t, formats: ['square', 'portrait', 'story'], previewUrl: '' }))
      : { imageUrl: `/qa-post-art/${url.searchParams.get('templateKey') || 'agenda-aberta'}-${url.searchParams.get('format') || 'square'}.png` };
    return route.fulfill({ json: { success: true, data } });
  });
  await page.goto(harnessUrl, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Divulgar serviço/ }).click({ timeout: 30_000 });
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

test('coleções oferecem dez artes por segmento com prévias reais', async ({ page }, info) => {
  await page.getByRole('button', { name: 'Formato', exact: true }).click();
  for (const [category, label] of [['barbearia', 'Barbearias'], ['salao', 'Salões'], ['beleza', 'Beleza e estética']]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByRole('button', { name: /Selecionar modelo/ })).toHaveCount(10);
    const template = POST_TEMPLATES.find(item => item.key === `${category}-colecao-1`)!;
    await page.getByRole('button', { name: `Selecionar modelo ${template.name}`, exact: true }).click();
    if (info.project.name === 'mobile-chromium') await page.getByText('Ver prévia do post', { exact: true }).click();
    const image = page.getByAltText('Prévia do post').filter({ visible: true }).first();
    await expect(image).toHaveAttribute('src', new RegExp(`${category}-colecao-1-square.png`));
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1080);
    await page.screenshot({ path: info.outputPath(`colecao-${category}.png`), fullPage: true });
    if (info.project.name === 'mobile-chromium') await page.getByText('Ver prévia do post', { exact: true }).click();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
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


test('modelos podem ser comparados por categoria com miniaturas reais', async ({ page }, info) => {
  await page.getByRole('button', { name: 'Formato', exact: true }).click();
  await page.getByRole('button', { name: 'Ofertas', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Selecionar modelo Novidade', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Selecionar modelo Agenda aberta', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Selecionar modelo Serviço em destaque', exact: true }).scrollIntoViewIfNeeded();
  const thumbnail = page.getByAltText('Prévia do modelo Serviço em destaque');
  await expect.poll(() => thumbnail.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1080);
  await page.screenshot({ path: info.outputPath('post-editor-categorias.png'), fullPage: true });
  await page.getByRole('button', { name: 'Selecionar modelo Novidade', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Selecionar modelo Novidade', exact: true })).toHaveAttribute('aria-pressed', 'true');
  if (info.project.name === 'mobile-chromium') await page.getByText('Ver prévia do post', { exact: true }).click();
  const preview = page.getByAltText('Prévia do post').filter({ visible: true }).first();
  await expect(preview).toHaveAttribute('src', /novidade-square.png/);
});

test('falha da prévia aparece no modal e a nova tentativa atualiza a arte', async ({ page }, info) => {
  let fail = true;
  await page.route('**/api/posts/preview?*', route => {
    if (fail) return route.fulfill({ status: 503, json: { success: false, message: 'Render temporariamente indisponível' } });
    return route.fulfill({ json: { success: true, data: { imageUrl: '/qa-post-art/servico-destaque-square.png' } } });
  });
  await page.getByLabel('Título', { exact: true }).fill('Prévia de teste');
  if (info.project.name === 'mobile-chromium') await page.getByText('Ver prévia do post', { exact: true }).click();
  const alert = page.getByRole('alert').filter({ visible: true }).first();
  await expect(alert).toHaveText('Render temporariamente indisponível');
  await page.screenshot({ path: info.outputPath('post-editor-erro-recuperavel.png'), fullPage: true });
  fail = false;
  await page.getByRole('button', { name: 'Tentar prévia novamente', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByAltText('Prévia do post').filter({ visible: true }).first()).toHaveAttribute('src', /servico-destaque-square.png/);
  await expect(alert).toHaveCount(0);
});

test('gera sugestão, aplica conteúdo e publica sem duplicar o rascunho ao retentar', async ({ page }) => {
  let created = 0;
  let attempts = 0;
  const id = '22222222-2222-4222-8222-222222222222';
  await page.route('**/api/posts/generate', route => route.fulfill({ json: { success: true, data: { suggestions: [{ title: 'Corte da semana', ctaText: 'Reserve seu horário' }], source: 'template' } } }));
  await page.route('**/api/posts', route => {
    created++;
    return route.fulfill({ status: 201, json: { success: true, data: { id } } });
  });
  await page.route(`**/api/posts/${id}`, route => route.fulfill({ json: { success: true, data: { id } } }));
  await page.route(`**/api/posts/${id}/publish`, route => {
    attempts++;
    return route.fulfill(attempts === 1 ? { status: 503, json: { success: false, message: 'Publicação indisponível agora' } } : { json: { success: true, data: { id, status: 'published' } } });
  });
  await page.getByText('Sugestões por IA', { exact: true }).click();
  await page.getByRole('button', { name: 'Gerar sugestões', exact: true }).click();
  await page.getByRole('button', { name: /Corte da semana/ }).click();
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Corte da semana');
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Publicação indisponível agora');
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect.poll(() => attempts).toBe(2);
  expect(created).toBe(1);
});


test('editar um publicado salva sem tentar publicar novamente', async ({ page }) => {
  let edits = 0;
  let publishAttempts = 0;
  const id = '22222222-2222-4222-8222-222222222222';
  await page.route(`**/api/posts/${id}`, route => { edits++; return route.fulfill({ json: { success: true, data: { id, status: 'published' } } }); });
  await page.route(`**/api/posts/${id}/publish`, route => { publishAttempts++; return route.fulfill({ status: 409, json: { success: false, message: 'Já publicado' } }); });
  await page.goto(harnessUrl + '?post=published');
  await page.getByLabel('Título', { exact: true }).fill('Corte atualizado');
  await expect(page.getByRole('button', { name: 'Rascunho', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect.poll(() => edits).toBe(1);
  expect(publishAttempts).toBe(0);
});

test('salvar um agendado como rascunho cancela seu agendamento', async ({ page }) => {
  let cancelled = false;
  const id = '22222222-2222-4222-8222-222222222222';
  await page.route(`**/api/posts/${id}`, route => route.fulfill({ json: { success: true, data: { id } } }));
  await page.route(`**/api/posts/${id}/cancel-schedule`, route => { cancelled = true; return route.fulfill({ json: { success: true, data: { id, status: 'draft' } } }); });
  await page.goto(harnessUrl + '?post=scheduled');
  await expect(page.getByLabel('Data e horário da publicação')).not.toBeEmpty();
  await page.getByRole('button', { name: 'Rascunho', exact: true }).click();
  await expect.poll(() => cancelled).toBe(true);
});


test('erro de upload aparece no seletor e foto pode ser enviada e removida', async ({ page }) => {
  let fail = true;
  const id = '33333333-3333-4333-8333-333333333333';
  await page.route('**/api/posts/media/11111111-1111-4111-8111-111111111111', route => route.fulfill(fail
    ? { status: 503, json: { success: false, message: 'Armazenamento indisponível' } }
    : { status: 201, json: { success: true, data: { id, url: '/qa-post-art/servico-destaque-square.png', mimeType: 'image/png', size: 1024, createdAt: new Date().toISOString() } } }));
  await page.getByRole('button', { name: 'Imagem', exact: true }).click();
  await page.getByRole('button', { name: /Foto principal/ }).click();
  const input = page.locator('input[type="file"][accept="image/jpeg,image/png,image/webp"]');
  const file = { name: 'foto.png', mimeType: 'image/png', buffer: readFileSync(path.join(output, 'servico-destaque-square.png')) };
  await input.setInputFiles(file);
  await expect(page.getByRole('alert')).toHaveText('Armazenamento indisponível');
  fail = false;
  await input.setInputFiles(file);
  await expect(page.getByRole('button', { name: 'Trocar foto', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remover foto principal', exact: true }).click();
  await expect(page.getByRole('button', { name: /Foto principal/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Trocar foto', exact: true })).toHaveCount(0);
});
