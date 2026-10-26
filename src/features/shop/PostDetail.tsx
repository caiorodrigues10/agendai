/* eslint-disable jsx-a11y/media-has-caption -- mídia enviada pelo salão não possui trilha de legenda separada */
import React, { useEffect, useState } from 'react';
import {
  LuHeart as Heart,
  LuShare2 as Share2,
  LuX as X,
} from 'react-icons/lu';
import type { PublicSocialPost } from '../../infra/socialApi';
import { SectionError } from '../../components/patterns';
import { Link } from 'react-router-dom';
import { getPublicSiteUrl } from '../../marketing/siteUrl';

export function buildPostShareUrl(salonId: string, postId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/saloes/${encodeURIComponent(salonId)}/posts/${encodeURIComponent(postId)}`;
}

/**
 * Link público do perfil: a rota `/s/salon/:id` é servida pelo backend (fora do
 * prefixo /api) com as meta tags Open Graph e só então redireciona para o app —
 * sem ela o crawler lê o index.html da SPA e não vê prévia nenhuma. O host do
 * frontend precisa reescrever `/s/*` para a API (ver docs/agents/BUSINESS_RULES.md).
 */
export function buildProfileShareUrl(salonId: string): string {
  return `${getPublicSiteUrl()}/s/salon/${encodeURIComponent(salonId)}`;
}

export async function shareUrl(url: string, title?: string): Promise<'shared' | 'copied' | 'cancelled'> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav?.share) {
    try {
      await nav.share({ title: title || 'Agenda Já', url });
      return 'shared';
    } catch (err) {
      if ((err as Error | null)?.name === 'AbortError') return 'cancelled';
    }
  }
  if (!nav?.clipboard?.writeText) throw new Error('Compartilhamento indisponível neste navegador');
  await nav.clipboard.writeText(url);
  return 'copied';
}

function formatDate(value: number | string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function shopInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || 'S'
  );
}

export interface PostDetailProps {
  salonId: string;
  post: PublicSocialPost;
  onLike?: (postId: string) => void | Promise<void>;
  /** Quando presente, renderiza botão de fechar (uso em modal). */
  onClose?: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ salonId, post, onLike, onClose }) => {
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  useEffect(() => {
    setLikes(post.likes);
    try { setLiked(localStorage.getItem(`agendai:liked-post:${salonId}:${post.id}`) === 'true'); } catch { setLiked(false); }
  }, [post.id, post.likes, salonId]);

  const handleLike = async () => {
    if (liked || !onLike) return;
    setLiked(true);
    setLikes(v => v + 1);
    setLikeError(null);
    try {
      await onLike(post.id);
      try { localStorage.setItem(`agendai:liked-post:${salonId}:${post.id}`, 'true'); } catch { /* private storage */ }
    } catch {
      setLiked(false);
      setLikes(v => Math.max(0, v - 1));
      setLikeError('Não foi possível curtir a publicação.');
    }
  };

  const handleShare = async () => {
    try {
      const result = await shareUrl(buildPostShareUrl(salonId, post.id), post.title || undefined);
      setShareFeedback(result === 'copied' ? 'Link copiado!' : null);
      window.setTimeout(() => setShareFeedback(null), 2500);
    } catch {
      setShareFeedback('Não foi possível compartilhar.');
    }
  };

  return (
    <div className="flex flex-col bg-surface" data-testid="post-detail">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="w-9 h-9 rounded-full bg-accent/10 border border-border overflow-hidden flex items-center justify-center shrink-0">
          {post.shopLogoUrl ? (
            <img src={post.shopLogoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-black text-accent">{shopInitials(post.shopName)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link to={`/queue/${encodeURIComponent(salonId)}?tab=profile`} className="text-sm font-bold text-text-primary truncate hover:underline">{post.shopName}</Link>
          <p className="text-[11px] text-text-muted">{formatDate(post.createdAt)}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {(post.imageUrl || post.videoUrl) && (
        <div className="bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
          {post.videoUrl ? (
            <video
              src={post.videoUrl}
              poster={post.imageUrl}
              controls
              preload="metadata"
              className="max-h-[70vh] w-auto max-w-full object-contain"
            />
          ) : (
            <img src={post.imageUrl} alt={post.title || 'Publicação'} className="max-h-[70vh] w-auto max-w-full object-contain" />
          )}
        </div>
      )}

      <div className="px-4 py-3 flex items-center gap-4 border-b border-border">
        <button
          type="button"
          onClick={() => void handleLike()}
          disabled={liked || !onLike}
          aria-label={liked ? 'Publicação curtida' : 'Curtir publicação'}
          aria-pressed={liked}
          className={`flex items-center gap-1.5 text-xs font-bold ${
            liked ? 'text-danger' : 'text-text-secondary hover:text-danger'
          }`}
        >
          <Heart size={18} className={liked ? 'fill-danger' : ''} /> {likes}
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-accent ml-auto"
        >
          <Share2 size={18} />
          <span>{shareFeedback || 'Compartilhar'}</span>
        </button>
      </div>

      {(post.title || post.content) && (
        <div className="px-4 py-3 border-b border-border">
          {post.title && <h2 className="text-sm font-bold text-text-primary">{post.title}</h2>}
          {post.content && (
            <p className="mt-1 break-words text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {post.content}
            </p>
          )}
        </div>
      )}

      {(post.postMode || post.ctaText) && <div className="flex gap-2 border-b border-border px-4 py-3">
        {post.postMode !== 'queue' && <Link to={`/queue/${encodeURIComponent(salonId)}?tab=appointments`} className="flex-1 rounded-xl bg-accent px-3 py-3 text-center text-xs font-bold text-accent-fg">{post.ctaText || 'Agendar'}</Link>}
        {post.postMode !== 'appointments' && <Link to={`/queue/${encodeURIComponent(salonId)}?tab=queue`} className="flex-1 rounded-xl border border-border px-3 py-3 text-center text-xs font-bold text-text-primary">{post.postMode === 'queue' ? post.ctaText || 'Entrar na fila' : 'Entrar na fila'}</Link>}
      </div>}
      {likeError && <div className="px-4 py-3"><SectionError message={likeError} /></div>}
    </div>
  );
};
