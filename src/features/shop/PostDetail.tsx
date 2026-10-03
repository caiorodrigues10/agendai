/* eslint-disable jsx-a11y/media-has-caption -- mídia enviada pelo salão não possui trilha de legenda separada */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LuHeart as Heart,
  LuMessageCircle as MessageCircle,
  LuShare2 as Share2,
  LuLoaderCircle as Loader2,
  LuTrash2 as Trash2,
  LuX as X,
  LuSend as Send,
  LuPhone as Phone,
  LuChevronLeft as ChevronLeft,
} from 'react-icons/lu';
import { socialApi, type PostComment, type PublicSocialPost } from '../../infra/socialApi';
import { clientPortalApi } from '../../infra/clientPortalApi';
import { authStorage } from '../../infra/authStorage';
import { getErrorMessage } from '../../utils/errorMessage';
import { ApiError } from '../../infra/apiClient';
import { Link } from 'react-router-dom';

export function buildPostShareUrl(salonId: string, postId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/saloes/${encodeURIComponent(salonId)}/posts/${encodeURIComponent(postId)}`;
}

export function buildProfileShareUrl(salonId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/queue/${encodeURIComponent(salonId)}?tab=profile`;
}

export async function shareUrl(url: string, title?: string): Promise<'shared' | 'copied' | 'cancelled'> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav?.share) {
    try {
      await nav.share({ title: title || 'Agende Já', url });
      return 'shared';
    } catch (err) {
      if ((err as Error | null)?.name === 'AbortError') return 'cancelled';
    }
  }
  if (!nav?.clipboard?.writeText) throw new Error('Compartilhamento indisponível neste navegador');
  await nav.clipboard.writeText(url);
  return 'copied';
}

function formatDate(value: string | number): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function currentStaffCanModerate(salonId: string): boolean {
  const user = authStorage.getUser() as { role?: string; barbershopId?: string } | null;
  return Boolean(authStorage.getAccessToken()) && (user?.role === 'MASTER_ADMIN' || (user?.role === 'OWNER' && user.barbershopId === salonId));
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

type LoginStep = 'phone' | 'code';

/** Login inline por OTP do portal do cliente (sem criar conta de salão). */
const InlineClientLogin: React.FC<{ salonId: string; onSuccess: (identityId?: string) => void }> = ({ salonId, onSuccess }) => {
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Informe um celular válido com DDD.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await clientPortalApi.requestCode(digits, name.trim() || undefined, salonId);
      setStep('code');
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível enviar o código.'));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Informe o código recebido.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const digits = phone.replace(/\D/g, '');
      const data = await clientPortalApi.verifyCode(digits, code.trim());
      if (data?.accessToken) {
        onSuccess(data.identity?.id);
      } else {
        setError('Código inválido ou expirado.');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Código inválido ou expirado.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-bg p-4 space-y-3" data-testid="comment-login">
      <p className="text-xs text-text-secondary">
        Para comentar, identifique-se com seu celular. Você recebe um código por WhatsApp, sem
        precisar criar conta de salão.
      </p>
      {step === 'phone' ? (
        <>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(11) 98765-4321"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            aria-label="Celular"
          />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome (opcional)"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            aria-label="Nome"
          />
          <button
            type="button"
            onClick={() => void request()}
            disabled={loading}
            className="w-full rounded-lg bg-accent text-accent-fg text-sm font-bold py-2.5 flex items-center justify-center gap-2 hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
            Receber código
          </button>
        </>
      ) : (
        <>
          <p className="text-[11px] text-text-muted">
            Enviamos um código para <strong>{phone}</strong>.
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Código"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary tracking-widest text-center"
            aria-label="Código de verificação"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="px-3 py-2.5 rounded-lg border border-border text-xs font-bold text-text-secondary flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Voltar
            </button>
            <button
              type="button"
              onClick={() => void verify()}
              disabled={loading}
              className="flex-1 rounded-lg bg-accent text-accent-fg text-sm font-bold py-2.5 flex items-center justify-center gap-2 hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Confirmar e comentar
            </button>
          </div>
        </>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};

const CommentSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse" aria-hidden>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="space-y-1.5">
        <div className="h-3 w-24 rounded bg-border" />
        <div className="h-3 w-full rounded bg-border" />
      </div>
    ))}
  </div>
);

export interface PostDetailProps {
  salonId: string;
  post: PublicSocialPost;
  onLike?: (postId: string) => void | Promise<void>;
  /** Quando presente, renderiza botão de fechar (uso em modal). */
  onClose?: () => void;
  onDeletedComment?: (postId: string) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  salonId,
  post,
  onLike,
  onClose,
  onDeletedComment,
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsMeta, setCommentsMeta] = useState({ page: 1, total: 0 });
  const [commentsState, setCommentsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [canComment, setCanComment] = useState(() => socialApi.canComment());
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(() => authStorage.getAccessToken() ? authStorage.getUser()?.id ?? null : null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestSeq = useRef(0);
  const canModerate = currentStaffCanModerate(salonId);

  useEffect(() => {
    if (authStorage.getAccessToken() || !canComment) return;
    let active = true;
    void clientPortalApi.getMe().then(identity => { if (active) setViewerId(identity.id); }).catch(() => { if (active) setCanComment(false); });
    return () => { active = false; };
  }, [canComment]);

  useEffect(() => {
    setLikes(post.likes);
    try { setLiked(localStorage.getItem(`agendai:liked-post:${salonId}:${post.id}`) === 'true'); } catch { setLiked(false); }
  }, [post.id, post.likes, salonId]);

  const loadComments = useCallback(
    async (page: number, append: boolean) => {
      const seq = ++requestSeq.current;
      if (page === 1) setCommentsState('loading');
      else setLoadingMore(true);
      try {
        const res = await socialApi.comments(salonId, post.id, page);
        if (seq !== requestSeq.current) return;
        setComments(prev => append ? Array.from(new Map([...prev, ...res.data].map(comment => [comment.id, comment])).values()) : res.data);
        setCommentsMeta({ page: res.meta.page, total: res.meta.total });
        setCommentsState('ready');
      } catch {
        if (seq !== requestSeq.current) return;
        if (!append) setCommentsState('error');
        else setFormError('Não foi possível carregar mais comentários. Tente novamente.');
      } finally {
        if (seq === requestSeq.current) setLoadingMore(false);
      }
    },
    [salonId, post.id]
  );

  useEffect(() => {
    setComments([]);
    setDraft('');
    setFormError(null);
    void loadComments(1, false);
    return () => { requestSeq.current += 1; };
  }, [loadComments]);

  const handleLike = async () => {
    if (liked || !onLike) return;
    setLiked(true);
    setLikes(v => v + 1);
    try {
      await onLike(post.id);
      try { localStorage.setItem(`agendai:liked-post:${salonId}:${post.id}`, 'true'); } catch { /* private storage */ }
    } catch {
      setLiked(false);
      setLikes(v => Math.max(0, v - 1));
      setFormError('Não foi possível curtir a publicação.');
    }
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setFormError(null);
    try {
      const created = await socialApi.comment(salonId, post.id, content);
      setComments(prev => [...prev, created]);
      setCommentsMeta(m => ({ ...m, total: m.total + 1 }));
      setDraft('');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) setCanComment(false);
      setFormError(getErrorMessage(err, 'Não foi possível publicar o comentário.'));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (deletingId) return;
    setDeletingId(commentId);
    try {
      await socialApi.deleteComment(salonId, post.id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentsMeta(m => ({ ...m, total: Math.max(0, m.total - 1) }));
      onDeletedComment?.(post.id);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Não foi possível excluir o comentário.'));
    } finally { setDeletingId(null); }
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

  const commentTotal = commentsState === 'ready' ? commentsMeta.total : post.commentsCount ?? 0;

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
        <span className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
          <MessageCircle size={18} /> {commentTotal}
        </span>
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
      <div className="px-4 py-3 space-y-3">
        {commentsState === 'loading' && <CommentSkeleton />}
        {commentsState === 'error' && (
          <div className="text-center py-4">
            <p className="text-xs text-text-muted">Não foi possível carregar os comentários.</p>
            <button
              type="button"
              onClick={() => void loadComments(1, false)}
              className="mt-2 text-xs font-bold text-accent hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {commentsState === 'ready' && comments.length === 0 && (
          <p className="text-xs text-text-muted text-center py-2">
            Seja a primeira pessoa a comentar.
          </p>
        )}
        {commentsState === 'ready' &&
          comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-2 group">
              <div className="min-w-0 flex-1">
                <p className="text-xs">
                  <span className="font-bold text-text-primary">{comment.authorName}</span>{' '}
                  <span className="text-[10px] text-text-muted">{formatDate(comment.createdAt)}</span>
                </p>
                <p className="break-words text-sm text-text-secondary leading-relaxed">{comment.content}</p>
              </div>
              {(canModerate || comment.authorId === viewerId) && (
                <button
                  type="button"
                  onClick={() => void handleDeleteComment(comment.id)}
                  disabled={Boolean(deletingId)}
                  className="min-h-11 min-w-11 flex items-center justify-center text-text-muted hover:text-danger disabled:opacity-50"
                  aria-label={`Excluir comentário de ${comment.authorName}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        {comments.length < commentTotal && commentsState === 'ready' && (
          <button
            type="button"
            onClick={() => void loadComments(commentsMeta.page + 1, true)}
            disabled={loadingMore}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
          >
            {loadingMore && <Loader2 size={12} className="animate-spin" />}
            Ver mais comentários
          </button>
        )}

        {canComment ? (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') void handleSend();
              }}
              placeholder="Adicione um comentário…"
              maxLength={500}
              className="flex-1 rounded-full border border-border bg-bg px-4 py-2 text-sm text-text-primary"
              aria-label="Adicionar comentário"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={sending || !draft.trim()}
              className="p-2.5 rounded-full bg-accent text-accent-fg disabled:opacity-50"
              aria-label="Enviar comentário"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        ) : (
          <InlineClientLogin salonId={salonId} onSuccess={identityId => { setViewerId(identityId ?? null); setCanComment(true); }} />
        )}
        {formError && <p role="alert" className="text-xs text-danger">{formError}</p>}
      </div>
    </div>
  );
};
