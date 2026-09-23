import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LuMegaphone as Megaphone,
  LuClock3 as Clock3,
  LuTrash2 as Trash2,
  LuLoaderCircle as Loader2,
  LuCalendarDays as CalendarDays,
  LuSparkles as Sparkles,
  LuDownload as Download,
  LuSend as Send,
  LuImagePlus as ImagePlus,
  LuCheck as Check,
  LuChevronRight as ChevronRight,
  LuChevronLeft as ChevronLeft,
  LuPalette as Palette,
  LuX as X,
} from 'react-icons/lu';
import { postsApi, type PostStatus, type PostPaletteDef, type PostMedia } from '../../infra/postsApi';
import { barbershopApi, PostAiSuggestion } from '../../infra/barbershopApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { FeedPost, PostFormat, PostMode } from '../../types';
import { Toast } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Skeleton } from '../ui/Skeleton';
import { PostEditor } from './PostEditor';
import { PostPreviewBox } from './PostPreviewBox';

type PostType = 'haircut' | 'beard' | 'announcement';
type PostTone = 'promocional' | 'informativo' | 'divertido' | null;
type Tab = 'published' | 'scheduled' | 'draft';
type EditorStep = 'goal' | 'content' | 'review';

// ─── Objetivos → templates ─────────────────────────────────────

const OBJECTIVES = [
  {
    id: 'promote-service',
    label: 'Divulgar serviço',
    description: 'Destaque um serviço e seu preço',
    templateKey: 'servico-destaque',
    type: 'haircut' as PostType,
  },
  {
    id: 'fill-slots',
    label: 'Preencher horários',
    description: 'Mostre que ainda há vagas hoje',
    templateKey: 'agenda-aberta',
    type: 'announcement' as PostType,
  },
  {
    id: 'show-result',
    label: 'Mostrar resultado',
    description: 'Transformação ou antes/depois',
    templateKey: 'antes-depois',
    type: 'haircut' as PostType,
  },
  {
    id: 'highlight-staff',
    label: 'Destacar profissional',
    description: 'Apresente quem atende',
    templateKey: 'profissional-destaque',
    type: 'haircut' as PostType,
  },
  {
    id: 'share-review',
    label: 'Compartilhar depoimento',
    description: 'Prova social de clientes',
    templateKey: 'depoimento',
    type: 'announcement' as PostType,
  },
  {
    id: 'announce',
    label: 'Comunicar novidade',
    description: 'Aviso, promoção ou lançamento',
    templateKey: 'novidade',
    type: 'announcement' as PostType,
  },
] as const;

type ObjectiveId = (typeof OBJECTIVES)[number]['id'];

const FORMAT_OPTIONS: { id: PostFormat; label: string; hint: string }[] = [
  { id: 'square', label: 'Quadrado', hint: 'Feed · 1:1' },
  { id: 'portrait', label: 'Retrato', hint: 'Feed · 4:5' },
  { id: 'story', label: 'Story', hint: '9:16' },
];

const MODE_OPTIONS: { id: PostMode; label: string }[] = [
  { id: 'queue', label: 'Fila' },
  { id: 'appointments', label: 'Agenda' },
  { id: 'both', label: 'Fila e Agenda' },
];

const TONE_OPTIONS: { id: NonNullable<PostTone>; label: string }[] = [
  { id: 'promocional', label: 'Promocional' },
  { id: 'informativo', label: 'Informativo' },
  { id: 'divertido', label: 'Descontraído' },
];

// ─── Rascunho local (por usuário + salão + post) ──────────────

const DRAFT_VERSION = 1;

interface LocalDraft {
  version: number;
  savedAt: number;
  objectiveId: ObjectiveId | null;
  templateKey: string;
  paletteKey: string;
  format: PostFormat;
  postMode: PostMode;
  type: PostType;
  title: string;
  ctaText: string;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
}

function draftKey(userId: string, barbershopId: string, postId: string | 'new') {
  return `agendai:post-draft:${userId}:${barbershopId}:${postId}`;
}

function readLocalDraft(userId: string, barbershopId: string, postId: string | 'new'): LocalDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(userId, barbershopId, postId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalDraft;
    return parsed.version === DRAFT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalDraft(userId: string, barbershopId: string, postId: string | 'new', data: Omit<LocalDraft, 'version' | 'savedAt'>) {
  try {
    localStorage.setItem(
      draftKey(userId, barbershopId, postId),
      JSON.stringify({ version: DRAFT_VERSION, savedAt: Date.now(), ...data })
    );
  } catch { /* storage full — ignore */ }
}

function clearLocalDraft(userId: string, barbershopId: string, postId: string | 'new') {
  try {
    localStorage.removeItem(draftKey(userId, barbershopId, postId));
  } catch { /* noop */ }
}

// ─── Utilitários ───────────────────────────────────────────────

function downloadPostImage(imageUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function statusBadge(status?: FeedPost['status']) {
  switch (status) {
    case 'published':
      return { label: 'Publicado', className: 'bg-success/15 text-success' };
    case 'scheduled':
      return { label: 'Agendado', className: 'bg-warning/15 text-warning' };
    default:
      return { label: 'Rascunho', className: 'bg-bg text-text-muted' };
  }
}

function formatDate(ts?: number | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Componente principal ─────────────────────────────────────

export const PostsManager: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';

  const [tab, setTab] = useState<Tab>('published');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [palettes, setPalettes] = useState<PostPaletteDef[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<PostMedia[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Ação WhatsApp
  const [whatsappPost, setWhatsappPost] = useState<FeedPost | null>(null);
  const [whatsappAudience, setWhatsappAudience] = useState<{ eligible: number; whatsappConnected: boolean } | null>(null);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  // Exclusão
  const [deletingPost, setDeletingPost] = useState<FeedPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Editor
  const [editingPost, setEditingPost] = useState<FeedPost | 'new' | null>(null);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
  }, []);

  const loadTab = useCallback(async (t: Tab, p: number) => {
    if (!barbershopId) return;
    setLoadingList(true);
    try {
      const res = await postsApi.list(barbershopId, { status: t, page: p, limit: 12 });
      setPosts(res.data);
      setTotal(res.meta.total);
      setPage(p);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível carregar os posts.'), 'error');
    } finally {
      setLoadingList(false);
    }
  }, [barbershopId, showToast]);

  const loadMeta = useCallback(async () => {
    if (!barbershopId) return;
    try {
      const [pl, md] = await Promise.all([
        postsApi.palettes(),
        postsApi.listMedia(barbershopId),
      ]);
      setPalettes(pl);
      setMediaLibrary(md);
    } catch { /* não bloqueia */ }
  }, [barbershopId]);

  useEffect(() => { void loadTab(tab, 1); }, [tab, loadTab]);
  useEffect(() => { void loadMeta(); }, [loadMeta]);

  const pageCount = Math.max(1, Math.ceil(total / 12));

  // ── Ações de linha ──────────────────────────────────────────

  const handlePublish = async (post: FeedPost) => {
    const key = `publish-${post.id}`;
    if (actionInFlight) return;
    setActionInFlight(key);
    try {
      await postsApi.publish(post.id);
      showToast('Post publicado no perfil.');
      void loadTab(tab, page);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível publicar.'), 'error');
    } finally {
      setActionInFlight(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingPost || deleting) return;
    setDeleting(true);
    try {
      await postsApi.remove(deletingPost.id);
      setDeletingPost(null);
      showToast('Rascunho removido.');
      void loadTab(tab, page);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível excluir.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openWhatsappConfirm = async (post: FeedPost) => {
    setWhatsappPost(post);
    setWhatsappAudience(null);
    try {
      const aud = await postsApi.whatsappAudience(post.id);
      setWhatsappAudience(aud);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível verificar o público.'), 'error');
    }
  };

  const handleSendWhatsapp = async () => {
    if (!whatsappPost || sendingWhatsapp) return;
    setSendingWhatsapp(true);
    try {
      const res = await postsApi.sendWhatsapp(whatsappPost.id);
      showToast(`Enviando para ${res.queued} cliente${res.queued === 1 ? '' : 's'} no WhatsApp.`);
      setWhatsappPost(null);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível iniciar o envio.'), 'error');
    } finally {
      setSendingWhatsapp(false);
    }
  };

  /** Reutilizar: cria um novo rascunho copiando conteúdo/visual. */
  const handleReuse = (post: FeedPost) => {
    setEditingPost(post);
  };

  // ── Render ──────────────────────────────────────────────────

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Megaphone size={20} className="text-accent" aria-hidden /> Posts
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Crie, agende e publique artes do seu salão.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditingPost('new')}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-accent px-4 font-bold text-accent-fg hover:bg-accent-hover"
        >
          <Sparkles size={16} aria-hidden /> Criar post
        </button>
      </header>

      {/* Abas */}
      <div role="tablist" aria-label="Status dos posts" className="flex gap-1 rounded-xl border border-border bg-surface p-1">
        {(['published', 'scheduled', 'draft'] as const).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            type="button"
            onClick={() => { setTab(t); setPage(1); }}
            className={`flex-1 min-h-11 rounded-lg px-3 text-sm font-semibold transition ${
              tab === t ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t === 'published' ? 'Publicados' : t === 'scheduled' ? 'Agendados' : 'Rascunhos'}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loadingList ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-busy aria-label="Carregando posts">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-3 space-y-2">
              <Skeleton variant="rounded" width="100%" height="8rem" />
              <Skeleton width="75%" height="0.875rem" />
              <Skeleton width="50%" height="0.625rem" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <Megaphone size={28} className="mx-auto text-text-muted" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-text-secondary">
            {tab === 'published' && 'Nenhum post publicado ainda.'}
            {tab === 'scheduled' && 'Nenhum post agendado.'}
            {tab === 'draft' && 'Nenhum rascunho salvo.'}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {tab === 'draft' ? 'Crie um post e salve como rascunho para continuar depois.' : 'Use “Criar post” para começar.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {posts.map(post => {
            const badge = statusBadge(post.status);
            return (
              <li key={post.id} className="group rounded-xl border border-border bg-surface overflow-hidden">
                <div className="relative bg-bg">
                  <PostPreviewBox
                    format={(post.format as any) ?? 'square'}
                    previewUrl={post.imageUrl ?? null}
                    className="!rounded-none !border-0"
                  />
                  <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="absolute right-2 bottom-2 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {post.format === 'portrait' ? '4:5' : post.format === 'story' ? '9:16' : '1:1'}
                  </span>
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="truncate text-sm font-semibold text-text-primary">{post.title || 'Sem título'}</p>
                  <p className="text-[11px] text-text-muted">
                    {post.status === 'scheduled' ? `Agendado: ${formatDate(post.scheduledFor)}`
                      : post.status === 'published' ? `Publicado: ${formatDate(post.publishedAt)}`
                      : `Editado: ${formatDate(post.createdAt)}`}
                  </p>
                  <PostRowActions
                    post={post}
                    busy={actionInFlight !== null}
                    onEdit={() => setEditingPost(post)}
                    onReuse={() => handleReuse(post)}
                    onPublish={() => void handlePublish(post)}
                    onDelete={() => setDeletingPost(post)}
                    onWhatsapp={() => void openWhatsappConfirm(post)}
                    onDownload={() => post.imageUrl && downloadPostImage(post.imageUrl, `post-${post.id}.png`)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Paginação */}
      {pageCount > 1 && (
        <nav aria-label="Paginação de posts" className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => void loadTab(tab, page - 1)}
            className="flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold text-text-secondary disabled:opacity-40"
          >
            <ChevronLeft size={15} aria-hidden /> Anterior
          </button>
          <span className="text-xs text-text-muted" aria-current="page">{page} de {pageCount}</span>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => void loadTab(tab, page + 1)}
            className="flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold text-text-secondary disabled:opacity-40"
          >
            Próxima <ChevronRight size={15} aria-hidden />
          </button>
        </nav>
      )}

      {/* Editor */}
      {editingPost && (
        <PostEditor
          post={editingPost === 'new' ? null : editingPost}
          barbershopId={barbershopId!}
          userId={userId}
          palettes={palettes}
          mediaLibrary={mediaLibrary}
          onClose={() => setEditingPost(null)}
          onSaved={(newStatus) => {
            setEditingPost(null);
            setTab(newStatus);
            void loadTab(newStatus, 1);
          }}
          showToast={showToast}
          onMediaUploaded={m => setMediaLibrary(prev => [m, ...prev])}
        />
      )}

      {/* Confirmação WhatsApp */}
      {whatsappPost && (
        <WhatsAppConfirm
          post={whatsappPost}
          audience={whatsappAudience}
          sending={sendingWhatsapp}
          onCancel={() => setWhatsappPost(null)}
          onConfirm={() => void handleSendWhatsapp()}
        />
      )}

      {/* Exclusão */}
      <ConfirmDialog
        open={!!deletingPost}
        title="Excluir rascunho"
        message="O rascunho será removido permanentemente. Deseja continuar?"
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onCancel={() => setDeletingPost(null)}
        onConfirm={() => void handleDelete()}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
};

// ─── Ações por linha ───────────────────────────────────────────

interface RowActionsProps {
  post: FeedPost;
  busy: boolean;
  onEdit: () => void;
  onReuse: () => void;
  onPublish: () => void;
  onDelete: () => void;
  onWhatsapp: () => void;
  onDownload: () => void;
}

const PostRowActions: React.FC<RowActionsProps> = ({
  post, busy, onEdit, onReuse, onPublish, onDelete, onWhatsapp, onDownload,
}) => {
  if (post.status === 'published') {
    return (
      <div className="flex gap-1 pt-1">
        <button type="button" onClick={onWhatsapp} disabled={busy} title="Enviar pelo WhatsApp"
          className="flex-1 min-h-10 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40">
          WhatsApp
        </button>
        <button type="button" onClick={onDownload} disabled={busy} title="Baixar PNG"
          className="min-h-10 rounded-lg border border-border px-2 text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40">
          <Download size={14} aria-hidden />
        </button>
        <button type="button" onClick={onEdit} disabled={busy} title="Editar"
          className="min-h-10 rounded-lg border border-border px-2 text-xs font-semibold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40">
          Editar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1 pt-1">
      <button type="button" onClick={onEdit} disabled={busy}
        className="flex-1 min-h-10 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40">
        Editar
      </button>
      {post.status === 'scheduled' || post.status === 'draft' ? (
        <button type="button" onClick={onPublish} disabled={busy}
          className="flex-1 min-h-10 rounded-lg bg-accent text-xs font-bold text-accent-fg hover:bg-accent-hover disabled:opacity-40">
          Publicar
        </button>
      ) : null}
      <button type="button" onClick={onDelete} disabled={busy}
        className="min-h-10 rounded-lg border border-border px-2 text-text-muted hover:border-danger/40 hover:text-danger disabled:opacity-40"
        aria-label="Excluir rascunho">
        <Trash2 size={14} aria-hidden />
      </button>
    </div>
  );
};

// ─── Confirmação WhatsApp ─────────────────────────────────────

const WhatsAppConfirm: React.FC<{
  post: FeedPost;
  audience: { eligible: number; whatsappConnected: boolean } | null;
  sending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ post, audience, sending, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-4 sm:items-center">
    <div role="alertdialog" aria-modal="true" aria-labelledby="wa-title"
      className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-accent/15 p-2 text-accent"><Send size={18} aria-hidden /></div>
        <div className="min-w-0 flex-1">
          <h3 id="wa-title" className="font-bold text-text-primary">Enviar pelo WhatsApp</h3>
          <p className="mt-1 text-sm text-text-secondary">
            A arte de “{post.title || 'Sem título'}” será enviada para os clientes do salão.
          </p>
          {audience === null ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-text-muted">
              <Loader2 size={14} className="animate-spin" aria-hidden /> Verificando clientes…
            </p>
          ) : !audience.whatsappConnected ? (
            <p className="mt-2 text-sm text-warning">
              O WhatsApp do salão não está conectado. Conecte nas configurações antes de enviar.
            </p>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">
              <strong className="text-text-primary">{audience.eligible}</strong> cliente{audience.eligible === 1 ? '' : 's'} com
              WhatsApp receberão a mensagem.
            </p>
          )}
        </div>
        <button type="button" onClick={onCancel} className="rounded-lg p-1 text-text-muted hover:bg-bg" aria-label="Fechar">
          <X size={16} />
        </button>
      </div>
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={onCancel} disabled={sending}
          className="min-h-11 flex-1 rounded-xl border border-border font-bold text-text-secondary disabled:opacity-50">
          Cancelar
        </button>
        <button type="button" onClick={onConfirm}
          disabled={sending || !audience?.whatsappConnected || audience.eligible === 0}
          className="min-h-11 flex-1 rounded-xl bg-accent font-bold text-accent-fg hover:bg-accent-hover disabled:opacity-50">
          {sending ? <Loader2 size={16} className="mx-auto animate-spin" aria-hidden /> : 'Enviar agora'}
        </button>
      </div>
    </div>
  </div>
);
