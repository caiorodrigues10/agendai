import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ProfileGrid } from './ProfileSections';
import type { FeedPost } from '../../types';

const post = (format: FeedPost['format']): FeedPost => ({
  id: `post-${format}`,
  type: 'announcement',
  title: `Post ${format}`,
  content: 'Conteúdo da publicação',
  imageUrl: `https://cdn.example.com/arte-${format}.png`,
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
  args: { posts: [post('square')], onOpen: () => undefined },
} satisfies Meta<typeof ProfileGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A grade é sempre 4:5 (1 coluna da grade do perfil) e recorta via object-cover. */
async function expectGridCard(canvasElement: HTMLElement) {
  const card = within(canvasElement).getByRole('button');
  expect(card.className).toContain('aspect-[4/5]');
  expect(card.className).not.toContain('aspect-square');
  expect(card.querySelector('img')?.className ?? '').toContain('object-cover');
  return card;
}

export const Quadrado1x1: Story = {
  args: { posts: [post('square')] },
  play: async ({ canvasElement }) => {
    await expectGridCard(canvasElement);
  },
};

export const Retrato4x5: Story = {
  args: { posts: [post('portrait')] },
  play: async ({ canvasElement }) => {
    await expectGridCard(canvasElement);
  },
};

export const Story9x16: Story = {
  args: { posts: [post('story')] },
  play: async ({ canvasElement }) => {
    await expectGridCard(canvasElement);
  },
};

export const ListaMista: Story = {
  args: { posts: [post('square'), post('portrait'), post('story')] },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).getAllByRole('button')).toHaveLength(3);
    for (const card of within(canvasElement).getAllByRole('button')) {
      expect(card.className).toContain('aspect-[4/5]');
      expect(card.querySelector('img')?.className ?? '').toContain('object-cover');
    }
  },
};
