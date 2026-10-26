/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileGrid, ProfileSkeleton } from './ProfileSections';
import { PostDetail } from './PostDetail';
import type { FeedPost } from '../../types';
import type { PublicSocialPost } from '../../infra/socialApi';

const FORMATS = ['square', 'portrait', 'story'] as const;

function feedPost(format: FeedPost['format']): FeedPost {
  return {
    id: `post-${format}`,
    barbershopId: 'salon',
    type: 'announcement',
    title: `Post ${format}`,
    content: 'Conteúdo',
    imageUrl: `/arte-${format}.png`,
    createdAt: Date.now(),
    likes: 0,
    status: 'published',
    format,
  };
}

function detailPost(format: FeedPost['format']): PublicSocialPost {
  return { ...feedPost(format), shopName: 'Studio Teste' };
}

/** Opção B: célula 4:5 fixa; cover só no 4:5, contain em 1:1 e 9:16. */
const FIT: Record<FeedPost['format'], string> = {
  square: 'object-contain',
  portrait: 'object-cover',
  story: 'object-contain',
};

describe('ProfileGrid — grade 4:5 sem cortar arte antiga', () => {
  it.each(FORMATS)('%s: célula 4:5 com fundo e o fit do formato', format => {
    render(<ProfileGrid posts={[feedPost(format)]} onOpen={vi.fn()} />);
    const card = screen.getByRole('button');
    expect(card.className).toContain('aspect-[4/5]');
    expect(card.className).toContain('bg-surface-2');
    expect(card.className).not.toContain('aspect-square');

    const img = card.querySelector('img');
    expect(img?.className).toContain(FIT[format]);
    if (format === 'portrait') expect(img?.className).not.toContain('object-contain');
    else expect(img?.className).not.toContain('object-cover');
  });

  it('grade mista mantém a célula 4:5 para os 3 formatos', () => {
    render(<ProfileGrid posts={FORMATS.map(feedPost)} onOpen={vi.fn()} />);
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(3);
    for (const card of cards) expect(card.className).toContain('aspect-[4/5]');
    expect(cards.filter(c => (c.querySelector('img')?.className ?? '').includes('object-cover'))).toHaveLength(1);
    expect(cards.filter(c => (c.querySelector('img')?.className ?? '').includes('object-contain'))).toHaveLength(2);
  });

  it('vídeo também respeita o fit do formato (sem corte em 1:1/9:16)', () => {
    const video: FeedPost = { ...feedPost('story'), imageUrl: undefined, videoUrl: '/clip.mp4' };
    render(<ProfileGrid posts={[video]} onOpen={vi.fn()} />);
    expect(screen.getByRole('button').querySelector('video')?.className).toContain('object-contain');
  });

  it('esqueleto de carregamento acompanha o 4:5 da grade', () => {
    const { container } = render(<ProfileSkeleton />);
    expect(container.querySelectorAll('[class*="aspect-[4/5]"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[class*="aspect-square"]').length).toBe(0);
  });
});

describe('PostDetail — detalhe mostra a arte inteira', () => {
  it.each(FORMATS)('post %s é exibido com object-contain (sem corte)', format => {
    render(
      <MemoryRouter>
        <PostDetail salonId="salon" post={detailPost(format)} />
      </MemoryRouter>
    );
    const img = screen.getByAltText(`Post ${format}`);
    expect(img.className).toContain('object-contain');
    expect(img.className).toContain('max-h-[70vh]');
    expect(img.className).not.toContain('object-cover');
  });
});
