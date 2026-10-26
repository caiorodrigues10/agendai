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

describe('ProfileGrid — grade do perfil em 4:5', () => {
  it.each(FORMATS)('card do post %s usa aspect-[4/5] com object-cover', format => {
    render(<ProfileGrid posts={[feedPost(format)]} onOpen={vi.fn()} />);
    const card = screen.getByRole('button');
    expect(card.className).toContain('aspect-[4/5]');
    expect(card.className).not.toContain('aspect-square');
    expect(card.querySelector('img')?.className).toContain('object-cover');
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
