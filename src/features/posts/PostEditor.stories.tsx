import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fn, userEvent, within } from 'storybook/test';
import { PostEditor } from './PostEditor';
import type { PostMedia, PostPaletteDef, PostTemplateDef } from '../../infra/postsApi';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

/** Thumbnail/preview embutido no próprio story: nada de URL externa no snapshot. */
const svg = (bg: string, accent = '#2cb58a') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720"><rect width="720" height="720" fill="${bg}"/><circle cx="360" cy="300" r="150" fill="${accent}" opacity="0.55"/><rect x="140" y="500" width="440" height="90" rx="20" fill="#0f1110" opacity="0.6"/></svg>`
  )}`;

const templates: PostTemplateDef[] = [
  { key: 'servico-destaque', name: 'Serviço em destaque', description: 'Destaque um serviço e seu preço', requiredMedia: 0, formats: ['square', 'portrait'], previewUrl: svg('#16352a'), group: 'ofertas', photoMode: 'optional', stockImageKey: 'salon' },
  { key: 'agenda-aberta', name: 'Agenda aberta', description: 'Mostre que ainda há vagas', requiredMedia: 0, formats: ['square', 'story'], previewUrl: svg('#1b2a3d', '#60a5fa'), group: 'agenda', photoMode: 'none' },
  { key: 'antes-depois', name: 'Antes e depois', description: 'Antes e depois do cliente', requiredMedia: 2, formats: ['square'], previewUrl: svg('#2b1f3d', '#c084fc'), group: 'resultados', photoMode: 'required' },
  { key: 'profissional-destaque', name: 'Profissional em destaque', description: 'Apresente sua equipe', requiredMedia: 1, formats: ['square', 'portrait'], previewUrl: svg('#3d2b1f', '#f59e0b'), group: 'equipe', photoMode: 'optional', stockImageKey: 'barber' },
  { key: 'depoimento', name: 'Depoimento', description: 'Experiência de clientes', requiredMedia: 0, formats: ['square'], previewUrl: svg('#3d1f2b', '#f472b6'), group: 'prova', photoMode: 'none' },
  { key: 'novidade', name: 'Novidade', description: 'Aviso, promoção ou lançamento', requiredMedia: 0, formats: ['square', 'story'], previewUrl: svg('#2a3d1b', '#a3e635'), group: 'avisos', photoMode: 'none' },
];

const palettes: PostPaletteDef[] = [
  { key: 'verde-escuro', label: 'Verde escuro' },
  { key: 'azul-frio', label: 'Azul frio' },
  { key: 'grafite', label: 'Grafite' },
  { key: 'areia', label: 'Areia' },
];

const mediaLibrary: PostMedia[] = [
  { id: 'm-1', url: svg('#14261c'), mimeType: 'image/svg+xml', size: 2048, createdAt: '2026-09-20T12:00:00.000Z' },
  { id: 'm-2', url: svg('#1c2233', '#60a5fa'), mimeType: 'image/svg+xml', size: 2048, createdAt: '2026-09-24T12:00:00.000Z' },
];

const mswHandlers = [
  http.get('/api/posts/templates', () => json(templates)),
  http.get('/api/posts/preview', () => json({ imageUrl: svg('#101a16') })),
  http.get('/api/posts/palettes', () => json(palettes)),
];

const meta = {
  title: 'Posts/PostEditor',
  component: PostEditor,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
  args: {
    post: null,
    barbershopId: 'shop-1',
    palettes,
    mediaLibrary,
    onClose: fn(),
    onSaved: fn(),
    showToast: fn(),
    onMediaUploaded: fn(),
  },
} satisfies Meta<typeof PostEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * O editor só monta depois do "gate" de objetivos. O rascunho local
 * (`draftStorage`, por usuário) guardaria o objetivo entre stories, então cada
 * story usa um `userId` próprio para não herdar estado da anterior.
 */
const enterEditor = async () => {
  const canvas = within(document.body);
  await userEvent.click(await canvas.findByText('Divulgar serviço', {}, { timeout: 10000 }));
};

const openTab = async (label: string, waitFor: string) => {
  const canvas = within(document.body);
  await userEvent.click(canvas.getByRole('button', { name: label }));
  await canvas.findByText(waitFor, {}, { timeout: 10000 });
};

export const Objectives: Story = {
  args: { userId: 'usr-objectives' },
};

export const Conteudo: Story = {
  args: { userId: 'usr-conteudo' },
  play: async () => {
    await enterEditor();
    const canvas = within(document.body);
    await canvas.findByLabelText('Título', {}, { timeout: 10000 });
    await canvas.findByRole('img', { name: 'Prévia do post' }, { timeout: 10000 });
  },
};

export const Imagem: Story = {
  args: { userId: 'usr-imagem' },
  play: async () => {
    await enterEditor();
    await openTab('Imagem', 'Foto principal');
    await within(document.body).findByRole('img', { name: 'Prévia do post' }, { timeout: 10000 });
  },
};

export const Formato: Story = {
  args: { userId: 'usr-formato' },
  play: async () => {
    await enterEditor();
    await openTab('Formato', 'Quadrado');
    await within(document.body).findByRole('img', { name: 'Prévia do post' }, { timeout: 10000 });
  },
};

export const Identidade: Story = {
  args: { userId: 'usr-identidade' },
  play: async () => {
    await enterEditor();
    await openTab('Identidade', 'Baixar PNG');
    await within(document.body).findByRole('img', { name: 'Prévia do post' }, { timeout: 10000 });
  },
};
