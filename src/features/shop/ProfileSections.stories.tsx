import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ProfileGrid } from './ProfileSections';
import type { FeedPost } from '../../types';

/** Opção B: célula 4:5 fixa; cover só no 4:5, contain em 1:1 e 9:16. */
const FIT: Record<FeedPost['format'], string> = {
  square: 'object-contain',
  portrait: 'object-cover',
  story: 'object-contain',
};

/**
 * Arte determinística (SVG data URL, sem rede) nas proporções do formato, com
 * marcas de borda: no contain as 4 marcas ficam visíveis; no cover a lateral
 * (1:1) ou o topo/base (9:16) é que sai.
 */
function art(format: FeedPost['format']): string {
  const [w, h] = format === 'square' ? [1080, 1080] : format === 'portrait' ? [1080, 1350] : [1080, 1920];
  const label = format === 'square' ? '1:1' : format === 'portrait' ? '4:5' : '9:16';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w / 2}" cy="${h / 2}" r="${Math.round(Math.min(w, h) * 0.3)}" fill="#0f172a" fill-opacity="0.72"/>
  <text x="${w / 2}" y="${h / 2 + 30}" font-family="sans-serif" font-size="${Math.round(Math.min(w, h) * 0.16)}" font-weight="700" fill="#f8fafc" text-anchor="middle">${label}</text>
  <text x="${w / 2}" y="${Math.round(h * 0.07)}" font-family="sans-serif" font-size="${Math.round(w * 0.055)}" fill="#e2e8f0" text-anchor="middle">TOPO</text>
  <text x="${w / 2}" y="${h - Math.round(h * 0.035)}" font-family="sans-serif" font-size="${Math.round(w * 0.055)}" fill="#e2e8f0" text-anchor="middle">BASE</text>
  <text x="${Math.round(w * 0.03)}" y="${h / 2}" font-family="sans-serif" font-size="${Math.round(h * 0.05)}" fill="#e2e8f0">ESQ</text>
  <text x="${w - Math.round(w * 0.16)}" y="${h / 2}" font-family="sans-serif" font-size="${Math.round(h * 0.05)}" fill="#e2e8f0">DIR</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const post = (format: FeedPost['format']): FeedPost => ({
  id: `post-${format}`,
  type: 'announcement',
  title: `Post ${format}`,
  content: 'Conteúdo da publicação',
  imageUrl: art(format),
  createdAt: Date.parse('2026-09-28T10:00:00.000Z'),
  likes: 3,
  status: 'published',
  format,
});

const meta = {
  title: 'Loja/ProfileGrid',
  component: ProfileGrid,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div style={{ width: 1100, padding: 48 }}>
        <Story />
      </div>
    ),
  ],
  args: { posts: [post('square')], onOpen: () => undefined },
} satisfies Meta<typeof ProfileGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

async function expectGridCard(canvasElement: HTMLElement, format: FeedPost['format']) {
  const card = within(canvasElement).getByRole('button');
  expect(card.className).toContain('aspect-[4/5]');
  expect(card.className).toContain('bg-surface-2');
  expect(card.className).not.toContain('aspect-square');
  expect(card.querySelector('img')?.className ?? '').toContain(FIT[format]);
  return card;
}

/** 1:1 — aparece inteira (contain) dentro da célula 4:5. */
export const Quadrado1x1: Story = {
  args: { posts: [post('square')] },
  play: async ({ canvasElement }) => {
    await expectGridCard(canvasElement, 'square');
  },
};

/** 4:5 — único formato cortado (cover), sem barras. */
export const Retrato4x5: Story = {
  args: { posts: [post('portrait')] },
  play: async ({ canvasElement }) => {
    await expectGridCard(canvasElement, 'portrait');
  },
};

/** 9:16 — aparece inteiro (contain), barras laterais no fundo da célula. */
export const Story9x16: Story = {
  args: { posts: [post('story')] },
  play: async ({ canvasElement }) => {
    await expectGridCard(canvasElement, 'story');
  },
};

export const ListaMista: Story = {
  args: { posts: [post('square'), post('portrait'), post('story')] },
  play: async ({ canvasElement }) => {
    const cards = within(canvasElement).getAllByRole('button');
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(card.className).toContain('aspect-[4/5]');
      expect(card.className).toContain('bg-surface-2');
    }
    const fits = cards.map(c => (c.querySelector('img')?.className ?? '').includes('object-cover'));
    expect(fits.filter(Boolean)).toHaveLength(1);
    expect(fits.filter(v => !v)).toHaveLength(2);
  },
};
