import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const salonId = '11111111-1111-4111-8111-111111111111';
const postId = '22222222-2222-4222-8222-222222222222';
const videoId = '33333333-3333-4333-8333-333333333333';
const photo = readFileSync(path.resolve('../agendai-back-end/src/modules/posts/assets/salon-editorial.png'));
const now = Date.now();
const posts = [
  { id: postId, barbershopId: salonId, shopName: 'Studio Aurora', type: 'announcement', title: 'Seu momento de cuidado', content: 'Conheça nosso espaço. Imagem ilustrativa.', imageUrl: '/social-fixtures/salon.png', format: 'portrait', status: 'published', createdAt: now, publishedAt: now, likes: 12, commentsCount: 1 },
  { id: videoId, barbershopId: salonId, shopName: 'Studio Aurora', type: 'haircut', title: 'Bastidores do studio', content: 'Vídeo do salão.', imageUrl: '/social-fixtures/salon.png', videoUrl: '/social-fixtures/reel.mp4', format: 'portrait', status: 'published', createdAt: now, publishedAt: now, likes: 4, commentsCount: 0 },
];

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => console.error('POST-SOCIAL PAGE ERROR:', error.stack));
  await page.addInitScript(() => localStorage.setItem('agendai:cookie-consent-v2', 'essential'));
  await page.route('**/social-fixtures/salon.png', route => route.fulfill({ contentType: 'image/png', body: photo }));
  await page.route('**/social-fixtures/reel.mp4', route => route.fulfill({ contentType: 'video/mp4', body: Buffer.alloc(0) }));
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    const endpoint = url.pathname;
    const method = route.request().method();
    let data: unknown = [];
    let meta: unknown;
    if (endpoint.startsWith('/api/auth/')) return route.fulfill({ status: 401, json: { success: false, message: 'Sem sessão de salão' } });
    if (endpoint === `/api/barbershops/${salonId}`) data = { id: salonId, name: 'Studio Aurora', active: true, whatsapp: '11999999999', address: 'Rua das Flores, 100', city: 'São Paulo', operationMode: 'HYBRID', openingMode: 'MANUAL', manualStatus: 'OPEN', openState: { open: true }, googleReviewUrl: 'https://maps.google.com/' };
    else if (endpoint === '/api/feed') data = posts;
    else if (endpoint.endsWith('/public-products')) data = { products: [], shop: { name: 'Studio Aurora' } };
    else if (endpoint.endsWith('/reviews')) data = { count: 3, average: 4.7, threshold: 3, showAverage: true, reviews: [{ id: 'review-1', clientName: 'Marina', rating: 5, comment: 'Atendimento excelente!', createdAt: new Date(now).toISOString() }] };
    else if (endpoint.endsWith('/stories')) data = [{ ...posts[0], id: '44444444-4444-4444-8444-444444444444', format: 'story' }];
    else if (endpoint.endsWith('/tagged')) data = [];
    else if (endpoint.endsWith('/comments') && method === 'GET') { data = [{ id: 'comment-1', authorName: 'Marina', content: 'Que espaço bonito!', createdAt: new Date(now).toISOString() }]; meta = { page: 1, limit: 20, total: 1 }; }
    else if (endpoint.endsWith('/comments') && method === 'POST') data = { id: 'comment-2', authorId: 'client-1', authorName: 'Ana', content: route.request().postDataJSON().content, createdAt: new Date(now).toISOString() };
    else if (endpoint.endsWith('/request-otp')) data = {};
    else if (endpoint.endsWith('/verify-otp')) data = { accessToken: 'verified-client-session', identity: { id: 'client-1', name: 'Ana', phoneVerified: true } };
    else if (endpoint.endsWith('/portal/me')) data = { id: 'client-1', name: 'Ana', phoneVerified: true };
    else if (endpoint.includes('/salons/') && endpoint.endsWith(`/posts/${videoId}`)) data = posts[1];
    else if (endpoint.includes('/salons/') && endpoint.endsWith(`/posts/${postId}`)) data = posts[0];
    else if (endpoint.endsWith('/queue/metrics')) data = { completedCount: 0, peopleWaiting: 0 };
    await route.fulfill({ json: { success: true, data, ...(meta ? { meta } : {}) } });
  });
});

test('link direto permite comentar via OTP sem conta de salão', async ({ page }) => {
  await page.goto(`/saloes/${salonId}/posts/${postId}`);
  await expect(page.getByText('Que espaço bonito!')).toBeVisible();
  await page.getByRole('textbox', { name: 'Celular', exact: true }).fill('11987654321');
  await page.getByRole('button', { name: 'Receber código' }).click();
  await page.getByRole('textbox', { name: 'Código de verificação' }).fill('123456');
  await page.getByRole('button', { name: 'Confirmar e comentar' }).click();
  await page.getByRole('textbox', { name: 'Adicionar comentário' }).fill('Quero conhecer!');
  await page.getByRole('button', { name: 'Enviar comentário' }).click();
  await expect(page.getByText('Quero conhecer!')).toBeVisible();
  await page.getByRole('button', { name: 'Excluir comentário de Ana' }).click();
  await expect(page.getByText('Quero conhecer!')).not.toBeVisible();
  await expect(page).not.toHaveURL(/login/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
});

test('compartilhamento copia um link permanente para o post', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (value: string) => { localStorage.setItem('qa:shared-post', value); } }, configurable: true });
  });
  await page.goto(`/saloes/${salonId}/posts/${postId}`);
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Link copiado!' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('qa:shared-post'))).toBe(`${new URL(page.url()).origin}/saloes/${salonId}/posts/${postId}`);
});

test('publicação com vídeo usa player mesmo quando existe uma capa', async ({ page }) => {
  await page.goto(`/saloes/${salonId}/posts/${videoId}`);
  const video = page.getByTestId('post-detail').locator('video');
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).not.toHaveAttribute('autoplay');
});

test('perfil mostra grade, abas sociais, stories e avaliações verificadas', async ({ page }, testInfo) => {
  await page.goto(`/queue/${salonId}?tab=profile`);
  await expect(page.getByRole('heading', { name: 'Studio Aurora' }).first()).toBeVisible({ timeout: 15_000 });
  for (const name of ['Publicações', 'Vídeos', 'Marcados', 'Avaliações', 'Sobre']) {
    await expect(page.getByRole('button', { name: new RegExp(name) }).or(page.getByRole('tab', { name: new RegExp(name) })).first()).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('salon-profile.png'), fullPage: true });
  await page.getByRole('button', { name: /Avaliações/ }).or(page.getByRole('tab', { name: /Avaliações/ })).first().click();
  await expect(page.getByText('Atendimento excelente!')).toBeVisible();
  await page.getByRole('tab', { name: 'Vídeos', exact: true }).click();
  await page.getByRole('button', { name: 'Abrir vídeo: Bastidores do studio' }).click();
  await expect(page.getByRole('dialog').locator('video')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Ver stories do salão' }).click();
  await expect(page.getByRole('dialog', { name: 'Story', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar story', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('perfil sem avaliações não mostra nota zero', async ({ page }) => {
  await page.route('**/reviews?*', route => route.fulfill({ json: { success: true, data: { average: null, count: 0, threshold: 3, showAverage: false, reviews: [] } } }));
  await page.goto(`/queue/${salonId}?tab=profile`);
  const profile = page.getByTestId('salon-social-profile');
  await expect(profile).toBeVisible({ timeout: 15_000 });
  await profile.getByRole('tab', { name: 'Avaliações', exact: true }).click();
  await expect(page.getByText('Ainda sem depoimentos')).toBeVisible();
  await expect(profile.getByText('0.0', { exact: true })).toHaveCount(0);
});
