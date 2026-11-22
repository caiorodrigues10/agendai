import type { GalleryPhoto } from '../../infra/socialApi';
import type { FeedPost } from '../../types';

export type ProfilePublicationItem =
  | {
      kind: 'post';
      key: string;
      timestamp: number;
      post: FeedPost;
    }
  | {
      kind: 'photo';
      key: string;
      timestamp: number;
      photo: GalleryPhoto;
    };

/** Posts que podem aparecer no feed público do perfil. */
export function publicProfilePosts(posts: FeedPost[]): FeedPost[] {
  return posts.filter(
    post => (!post.status || post.status === 'published') && post.format !== 'story'
  );
}

function postTimestamp(post: FeedPost): number {
  return post.publishedAt ?? post.createdAt;
}

function photoTimestamp(photo: GalleryPhoto): number {
  const parsed = Date.parse(photo.createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Une o feed e as fotos da galeria em uma única linha do tempo.
 * Uma foto usada por um post já listado não aparece duas vezes: a comparação
 * usa mediaId e, como proteção para URLs diferentes, também a URL.
 */
export function buildProfilePublicationItems(
  posts: FeedPost[],
  photos: GalleryPhoto[]
): ProfilePublicationItem[] {
  const publicPosts = publicProfilePosts(posts);
  const usedMediaIds = new Set<string>();
  const usedUrls = new Set<string>();

  for (const post of publicPosts) {
    if (post.primaryMediaId) usedMediaIds.add(post.primaryMediaId);
    if (post.secondaryMediaId) usedMediaIds.add(post.secondaryMediaId);
    if (post.imageUrl) usedUrls.add(post.imageUrl);
  }

  const items: ProfilePublicationItem[] = publicPosts.map(post => ({
    kind: 'post',
    key: `post:${post.id}`,
    timestamp: postTimestamp(post),
    post,
  }));

  for (const photo of photos) {
    if (usedMediaIds.has(photo.id) || usedUrls.has(photo.url)) continue;
    usedMediaIds.add(photo.id);
    usedUrls.add(photo.url);
    items.push({
      kind: 'photo',
      key: `photo:${photo.id}`,
      timestamp: photoTimestamp(photo),
      photo,
    });
  }

  return items.sort((left, right) => {
    if (right.timestamp !== left.timestamp) return right.timestamp - left.timestamp;
    return left.key.localeCompare(right.key);
  });
}
