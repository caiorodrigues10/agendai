import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { PostTemplateDef } from '../src/infra/postsApi';

// Real React editor + real renderer output; all HTTP writes are isolated fixtures.
test.skip(process.env.POST_EDITOR_QA !== '1', 'Use POST_EDITOR_QA=1 e POST_EDITOR_ARTIFACTS com as artes renderizadas.');
let templates: PostTemplateDef[];
const payloads: Record<string, unknown>[] = [];
const publishedIds: string[] = [];
test.beforeAll(() => {
  templates = (JSON.parse(readFileSync(path.join(process.env.POST_EDITOR_ARTIFACTS!, 'catalog.json'), 'utf8')) as PostTemplateDef[]).filter(template => template.businessCategory === 'advocacia');
});
test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => console.error('LEGAL QA:', error.message));
  page.on('console', message => { if (message.type() === 'error') console.error('CONSOLE:', message.text()); });
  page.on('requestfailed', request => console.error('REQUEST:', request.url(), request.failure()?.errorText));
  payloads.length = 0;
  publishedIds.length = 0;
  await page.route('**/qa/post-legal', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html>
    <html class="dark"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div>
    <script type="module">
      import '/src/index.css';
      import RefreshRuntime from '/@react-refresh';
      RefreshRuntime.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => type => type;
      window.__vite_plugin_react_preamble_installed__ = true;
      const React = (await import('/node_modules/.vite/deps/react.js')).default;
      const { createRoot } = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
      const { PostEditor } = await import('/src/features/posts/PostEditor.tsx');
      const root = createRoot(document.getElementById('root'));
      root.render(React.createElement(PostEditor, { post: null, barbershopId: '11111111-1111-4111-8111-111111111111', userId: 'qa-law', palettes: [{key:'brand',label:'Marca'},{key:'clara',label:'Clara'}], mediaLibrary: [], onClose:()=>root.unmount(), onSaved:()=>{}, showToast:()=>{}, onMediaUploaded:()=>{} }));
    </script></body></html>` }));
  await page.route('**/qa-post-art/**', route => {
    const file = path.basename(new URL(route.request().url()).pathname);
    if (!/^advocacia-[a-z-]+-(square|portrait|story)\.png$/.test(file)) return route.abort();
    return route.fulfill({ contentType: 'image/png', body: readFileSync(path.join(process.env.POST_EDITOR_ARTIFACTS!, file)) });
  });
  await page.route('**/api/**', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === 'POST' && url.pathname === '/api/posts') {
      payloads.push(request.postDataJSON());
      return route.fulfill({ json: { success: true, data: { id: 'law-draft', status: 'draft' } } });
    }
    if (request.method() === 'POST' && url.pathname === '/api/posts/law-draft/publish') {
      publishedIds.push('law-draft');
      return route.fulfill({ json: { success: true, data: { id: 'law-draft', status: 'published' } } });
    }
    const data = url.pathname.endsWith('/templates') ? templates : { imageUrl: '/qa-post-art/' + (url.searchParams.get('templateKey') || 'advocacia-cartao') + '-' + (url.searchParams.get('format') || 'square') + '.png' };
    return route.fulfill({ json: { success: true, data } });
  });
  await page.goto('/qa/post-legal');
  // O primeiro acesso compila os módulos do editor no servidor Vite.
  await expect(page.getByRole('dialog', { name: 'Editor de publicação' })).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: /Identidade do escritório/ }).click();
});

test('quatro blocos, campos editoriais e contatos chegam ao rascunho sem campos de preço ou fila', async ({ page }, info) => {
  await expect(page.getByRole('radio', { name: 'Fila', exact: true })).toHaveCount(0);
  await expect(page.getByText('Serviços e preços', { exact: true })).toHaveCount(0);
  await page.getByLabel('Nome profissional ou do escritório').fill('Bruno Azevedo');
  await page.getByLabel('Inscrição na OAB').fill('OAB/UF 00000');
  await page.getByLabel('Seção (opcional)').fill('Informação jurídica');
  await page.getByLabel('Texto principal (opcional)').fill('Atendimento jurídico com organização e clareza.');
  await page.getByLabel('Destaque (opcional)').fill('Atendimento com horário marcado');
  for (let index = 0; index < 4; index += 1) {
    if (index > 0) await page.getByRole('button', { name: 'Adicionar destaque', exact: true }).click();
    await page.getByLabel('Destaque do escritório', { exact: true }).nth(index).fill(`Destaque ${index + 1}`);
    await page.getByLabel('Descrição do destaque', { exact: true }).nth(index).fill(`Explicação ${index + 1}`);
  }
  await expect(page.getByRole('button', { name: 'Adicionar destaque', exact: true })).toHaveCount(0);
  await page.getByLabel('Contato na imagem').fill('(00) 00000-0000');
  await page.getByRole('button', { name: 'Rascunho', exact: true }).click();
  await expect.poll(() => payloads.length).toBe(1);
  expect(payloads[0]).toMatchObject({ templateKey: 'advocacia-cartao', postMode: 'appointments', type: 'announcement', designOptions: { legalPost: {
    professionalName: 'Bruno Azevedo', registration: 'OAB/UF 00000', contact: '(00) 00000-0000',
    eyebrow: 'Informação jurídica', summary: 'Atendimento jurídico com organização e clareza.', highlight: 'Atendimento com horário marcado',
    areas: Array.from({ length: 4 }, (_, index) => ({ title: `Destaque ${index + 1}`, description: `Explicação ${index + 1}` })),
  } } });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  await page.screenshot({ path: info.outputPath('advocacia-editor.png'), fullPage: true });
});

test('dez modelos e Story preservam a arte completa no desktop e no celular', async ({ page }, info) => {
  await page.getByRole('button', { name: templates.find(template => template.key === 'advocacia-cartao')!.name, exact: true }).click();
  await expect(page.getByRole('button', { name: /^Selecionar modelo / })).toHaveCount(10);
  await page.getByRole('button', { name: 'Selecionar modelo ' + templates.find(template => template.key === 'advocacia-contratos')!.name, exact: true }).click();
  await page.getByRole('button', { name: 'Formato', exact: true }).click();
  await page.getByRole('button', { name: /Story.*9:16/ }).click();
  if (info.project.name === 'mobile-chromium') await page.getByText('Ver prévia do post', { exact: true }).click();
  const preview = page.getByAltText('Prévia do post').filter({ visible: true }).first();
  await expect(preview).toHaveAttribute('src', /advocacia-contratos-story.png/);
  await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.naturalWidth / image.naturalHeight)).toBe(9 / 16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  const imageBounds = await preview.boundingBox();
  const footerBounds = await page.getByRole('button', { name: 'Rascunho', exact: true }).boundingBox();
  expect(imageBounds!.y + imageBounds!.height).toBeLessThan(footerBounds!.y);
  await page.screenshot({ path: info.outputPath('advocacia-story.png'), fullPage: true });
});

test('pergunta exige resposta e publica sem blocos de apoio após corrigir o campo', async ({ page }) => {
  await page.getByRole('button', { name: templates.find(template => template.key === 'advocacia-cartao')!.name, exact: true }).click();
  await page.getByRole('button', { name: 'Selecionar modelo Pergunta e resposta', exact: true }).click();
  await page.getByLabel('Nome profissional ou do escritório').fill('Bruno Azevedo');
  await page.getByLabel('Inscrição na OAB').fill('OAB/UF 00000');
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(page.getByText('Escreva a resposta no texto principal ou no destaque.')).toBeVisible();
  await expect(page.getByLabel(/^Resposta à pergunta/)).toBeFocused();
  expect(payloads).toHaveLength(0);
  expect(publishedIds).toHaveLength(0);
  await page.getByLabel(/^Resposta à pergunta/).fill('Anexos e aditivos ajudam a entender o que foi combinado.');
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect.poll(() => publishedIds.length).toBe(1);
  expect(payloads[0]).toMatchObject({ templateKey: 'advocacia-trabalhista', designOptions: { legalPost: { areas: [], summary: 'Anexos e aditivos ajudam a entender o que foi combinado.' } } });
});

test('comunicado exige data e mantém o formulário disponível para corrigir', async ({ page }) => {
  await page.getByRole('button', { name: templates.find(template => template.key === 'advocacia-cartao')!.name, exact: true }).click();
  await page.getByRole('button', { name: 'Selecionar modelo Aviso com data', exact: true }).click();
  await page.getByLabel('Nome profissional ou do escritório').fill('Bruno Azevedo');
  await page.getByLabel('Inscrição na OAB').fill('OAB/UF 00000');
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(page.getByText('Informe a data ou o período do aviso.')).toBeVisible();
  await expect(page.getByLabel(/^Data ou período/)).toBeFocused();
  expect(payloads).toHaveLength(0);
  await page.getByLabel(/^Data ou período/).fill('23 NOV');
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect.poll(() => publishedIds.length).toBe(1);
  expect(payloads[0]).toMatchObject({ templateKey: 'advocacia-comunicado', designOptions: { legalPost: { areas: [], highlight: '23 NOV' } } });
});
