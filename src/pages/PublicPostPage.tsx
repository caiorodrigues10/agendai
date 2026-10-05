import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LuArrowLeft as ArrowLeft } from 'react-icons/lu';
import { socialApi, type PublicSocialPost } from '../infra/socialApi';
import { barbershopApi } from '../infra/barbershopApi';
import { PostDetail } from '../features/shop/PostDetail';

type PageState = 'loading' | 'ready' | 'error';

/** Curtida pública: mesmo mecanismo usado em BarbershopContext.likePost. */
async function likePost(post: PublicSocialPost): Promise<void> {
  await barbershopApi.updatePost(post.id, {
    likes: post.likes + 1,
  } as Parameters<typeof barbershopApi.updatePost>[1]);
}

const PublicPostPage: React.FC = () => {
  const { salonId = '', postId = '' } = useParams<{ salonId: string; postId: string }>();
  const [post, setPost] = useState<PublicSocialPost | null>(null);
  const [state, setState] = useState<PageState>('loading');
  const sequence = useRef(0);

  const load = useCallback(async () => {
    const request = ++sequence.current;
    if (!salonId || !postId) {
      setState('error');
      return;
    }
    setState('loading');
    try {
      const data = await socialApi.getPost(salonId, postId);
      if (request !== sequence.current) return;
      setPost(data);
      setState('ready');
    } catch {
      if (request !== sequence.current) return;
      setPost(null);
      setState('error');
    }
  }, [salonId, postId]);

  useEffect(() => {
    void load();
    return () => { sequence.current += 1; };
  }, [load]);

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="mx-auto w-full max-w-xl px-3 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to={`/queue/${encodeURIComponent(salonId)}?tab=profile`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-accent"
          >
            <ArrowLeft size={14} /> Voltar ao perfil
          </Link>
        </div>

        {state === 'loading' && (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border animate-pulse">
              <div className="w-9 h-9 rounded-full bg-border" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-border" />
                <div className="h-2.5 w-16 rounded bg-border" />
              </div>
            </div>
            <div className="aspect-square bg-surface-2 animate-pulse" aria-label="Carregando publicação" />
            <div className="px-4 py-3 space-y-2 animate-pulse">
              <div className="h-3 w-3/4 rounded bg-border" />
              <div className="h-3 w-1/2 rounded bg-border" />
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-sm font-bold text-text-primary">Publicação não encontrada</p>
            <p className="mt-1 text-xs text-text-muted">
              Ela pode ter sido removida ou o link está incorreto.
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-fg hover:bg-accent-hover"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {state === 'ready' && post && (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-lg">
            <PostDetail key={post.id} salonId={salonId} post={post} onLike={() => likePost(post)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPostPage;
