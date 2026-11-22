import type { FeedPost } from '../../types';
import { buildProfilePublicationItems } from './profilePublications';

const post: FeedPost = {
  id: 'post-1',
  barbershopId: 'salon',
  type: 'announcement',
  title: 'Publicação',
  content: 'Publicação',
  imageUrl: 'https://cdn.example.com/post.png',
  primaryMediaId: 'media-post',
  secondaryMediaId: 'media-secondary',
  createdAt: 1_700_000_000_000,
  publishedAt: 1_700_000_000_000,
  status: 'published',
  likes: 0,
};

const photo = {
  id: 'media-post',
  url: 'https://cdn.example.com/post.png',
  mimeType: 'image/png',
  createdAt: '2026-10-20T10:00:00.000Z',
};

describe('buildProfilePublicationItems', () => {
  it('remove foto repetida por mediaId ou URL e mantém a foto avulsa', () => {
    const items = buildProfilePublicationItems(
      [post],
      [
        photo,
        {
          id: 'media-secondary',
          url: 'https://cdn.example.com/secondary.png',
          mimeType: 'image/png',
          createdAt: '2026-10-19T10:00:00.000Z',
        },
        {
          id: 'media-other',
          url: 'https://cdn.example.com/post.png',
          mimeType: 'image/png',
          createdAt: '2026-10-19T10:00:00.000Z',
        },
        {
          id: 'media-orphan',
          url: 'https://cdn.example.com/orphan.png',
          mimeType: 'image/png',
          createdAt: '2026-10-18T10:00:00.000Z',
        },
      ]
    );

    expect(items.map(item => item.key)).toEqual(['photo:media-orphan', 'post:post-1']);
  });

  it('ordena posts e fotos da publicação mais recente para a mais antiga', () => {
    const items = buildProfilePublicationItems(
      [{ ...post, publishedAt: 1_700_000_000_000 }],
      [
        {
          id: 'media-orphan',
          url: 'https://cdn.example.com/orphan.png',
          mimeType: 'image/png',
          createdAt: '2026-10-20T10:00:00.000Z',
        },
      ]
    );

    expect(items.map(item => item.kind)).toEqual(['photo', 'post']);
  });
});
