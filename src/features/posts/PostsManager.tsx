import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuDownload as Download,
  LuLoaderCircle as Loader2,
  LuMegaphone as Megaphone,
  LuTrash2 as Trash2,
} from 'react-icons/lu';
import { ModalShell, PageHeader, Tabs } from '../../components/patterns';
import { Skeleton } from '../../components/patterns/skeletons';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { postsApi, type PostMedia, type PostPaletteDef } from '../../infra/postsApi';
import type { FeedPost } from '../../types';
import { getErrorMessage } from '../../utils/errorMessage';
import { PostEditor } from './PostEditor';
import { PostPreviewBox } from './PostPreviewBox';

type Tab = 'published' | 'scheduled' | 'draft';

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
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Componente principal ─────────────────────────────────────

export const PostsManager: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';
  if (!barbershopId) {
    return (
      <section className="space-y-4">
        <PageHeader title="Posts" />
        <p role="status" className="text-sm text-text-secondary">
          Selecione um salão para gerenciar os posts.
        </p>
      </section>
    );
  }
  return (
    <ShopPostsManager
      key={`${userId}:${barbershopId}`}
      barbershopId={barbershopId}
      userId={userId}
    />
  );
};

// Reinicia o estado e os modais ao mudar de usuário/salão, sem expor dados da seleção anterior.
function ShopPostsManager({ barbershopId, userId }: { barbershopId: string; userId: string }) {
  const [tab, setTab] = useState<Tab>('published');
  const [page, setPage] = useState(1);
  const currentView = useRef({ tab, page });
  const [listTab, setListTab] = useState<Tab>('published');
  useEffect(() => {
    currentView.current = { tab, page };
  }, [tab, page]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [metadataErrors, setMetadataErrors] = useState<string[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const listRequest = useRef(0);
  const metaRequest = useRef(0);
  const audienceRequest = useRef(0);
  const [palettes, setPalettes] = useState<PostPaletteDef[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<PostMedia[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Ação WhatsApp
  const [whatsappPost, setWhatsappPost] = useState<FeedPost | null>(null);
  const [whatsappAudience, setWhatsappAudience] = useState<{
    eligible: number;
    whatsappConnected: boolean;
  } | null>(null);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  // Exclusão
  const [deletingPost, setDeletingPost] = useState<FeedPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Editor
  const [editingPost, setEditingPost] = useState<FeedPost | 'new' | null>(null);
  const [sourcePost, setSourcePost] = useState<FeedPost | null>(null);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
  }, []);

  const loadTab = useCallback(
    async (t: Tab, p: number) => {
      const request = ++listRequest.current;
      setLoadingList(true);
      setListTab(t);
      setListError(null);
      setPosts([]);
      setTotal(0);
      setPage(p);
      try {
        const res = await postsApi.list(barbershopId, { status: t, page: p, limit: 12 });
        if (request !== listRequest.current) return;
        if (!Array.isArray(res.data))
          throw new Error('O servidor retornou uma lista de posts inválida.');
        setPosts(res.data);
        setTotal(res.meta.total);
      } catch (err) {
        if (request !== listRequest.current) return;
        setListError(getErrorMessage(err, 'Não foi possível carregar os posts.'));
      } finally {
        if (request === listRequest.current) setLoadingList(false);
      }
    },
    [barbershopId]
  );

  const loadMeta = useCallback(async () => {
    const request = ++metaRequest.current;
    setLoadingMeta(true);
    const [paletteResult, mediaResult] = await Promise.allSettled([
      postsApi.palettes(),
      postsApi.listMedia(barbershopId),
    ]);
    if (request !== metaRequest.current) return;
    const errors: string[] = [];
    if (paletteResult.status === 'fulfilled') setPalettes(paletteResult.value);
    else
      errors.push(getErrorMessage(paletteResult.reason, 'Não foi possível carregar as paletas.'));
    if (mediaResult.status === 'fulfilled') setMediaLibrary(mediaResult.value);
    else
      errors.push(
        getErrorMessage(mediaResult.reason, 'Não foi possível carregar a biblioteca de imagens.')
      );
    setMetadataErrors(errors);
    setLoadingMeta(false);
  }, [barbershopId]);

  useEffect(() => {
    void loadTab(tab, 1);
    return () => {
      listRequest.current += 1;
    };
  }, [tab, loadTab]);
  useEffect(() => {
    void loadMeta();
    return () => {
      metaRequest.current += 1;
      audienceRequest.current += 1;
    };
  }, [loadMeta]);

  const pageCount = Math.max(1, Math.ceil(total / 12));

  // ── Ações de linha ──────────────────────────────────────────

  const handlePublish = async (post: FeedPost) => {
    const key = `publish-${post.id}`;
    if (actionInFlight) return;
    setActionInFlight(key);
    try {
      await postsApi.publish(post.id);
      showToast('Post publicado no perfil.');
      const view = currentView.current;
      void loadTab(view.tab, view.page);
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
      const view = currentView.current;
      const previousPage = view.tab === tab && view.page === page && posts.length === 1 && page > 1;
      void loadTab(view.tab, previousPage ? page - 1 : view.page);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível excluir.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const loadWhatsappAudience = async (post: FeedPost) => {
    const request = ++audienceRequest.current;
    setWhatsappAudience(null);
    setWhatsappError(null);
    try {
      const audience = await postsApi.whatsappAudience(post.id);
      if (request === audienceRequest.current) setWhatsappAudience(audience);
    } catch (err) {
      if (request === audienceRequest.current)
        setWhatsappError(getErrorMessage(err, 'Não foi possível verificar o público.'));
    }
  };

  const openWhatsappConfirm = (post: FeedPost) => {
    setWhatsappPost(post);
    void loadWhatsappAudience(post);
  };

  const closeWhatsapp = () => {
    audienceRequest.current += 1;
    setWhatsappPost(null);
  };

  const handleCancelSchedule = async (post: FeedPost) => {
    if (actionInFlight) return;
    setActionInFlight(`cancel-${post.id}`);
    try {
      await postsApi.cancelSchedule(post.id);
      showToast('Agendamento cancelado. O post voltou para rascunhos.');
      setTab('draft');
      if (tab === 'draft') void loadTab('draft', 1);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível cancelar o agendamento.'), 'error');
    } finally {
      setActionInFlight(null);
    }
  };

  const handleSendWhatsapp = async () => {
    if (
      !whatsappPost ||
      sendingWhatsapp ||
      !whatsappAudience?.whatsappConnected ||
      whatsappAudience.eligible === 0 ||
      whatsappError
    )
      return;
    setSendingWhatsapp(true);
    setWhatsappError(null);
    try {
      const res = await postsApi.sendWhatsapp(whatsappPost.id);
      showToast(`Enviando para ${res.queued} cliente${res.queued === 1 ? '' : 's'} no WhatsApp.`);
      setWhatsappPost(null);
    } catch (err) {
      setWhatsappError(getErrorMessage(err, 'Não foi possível iniciar o envio.'));
    } finally {
      setSendingWhatsapp(false);
    }
  };

  /** Reutilizar: cria um novo rascunho copiando conteúdo/visual. */
  const handleReuse = (post: FeedPost) => {
    setSourcePost(post);
    setEditingPost('new');
  };
  const openEditor = (post: FeedPost | 'new') => {
    setSourcePost(null);
    setEditingPost(post);
  };

  // ── Render ──────────────────────────────────────────────────

  return (
    <section className="flex flex-col gap-5">
      <PageHeader
        title="Posts"
        description="Crie, agende e publique artes do seu salão."
        actions={
          <button
            type="button"
            onClick={() => openEditor('new')}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-accent px-4 font-bold text-accent-fg hover:bg-accent-hover"
          >
            Criar post
          </button>
        }
      />

      {metadataErrors.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3">
          <div role="alert" className="space-y-1 text-sm text-text-primary">
            {metadataErrors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
          <button
            type="button"
            disabled={loadingMeta}
            onClick={() => void loadMeta()}
            className="mt-1 min-h-11 text-sm font-semibold text-accent disabled:opacity-50"
          >
            {loadingMeta ? 'Carregando biblioteca e paletas…' : 'Recarregar biblioteca e paletas'}
          </button>
        </div>
      )}
      {/* Abas */}
      <Tabs<Tab>
        ariaLabel="Status dos posts"
        value={tab}
        onChange={value => {
          setTab(value);
          setPage(1);
        }}
        items={[
          { id: 'published', label: 'Publicados' },
          { id: 'scheduled', label: 'Agendados' },
          { id: 'draft', label: 'Rascunhos' },
        ]}
      >
        <div className="space-y-4">
          {/* Lista */}
          {loadingList || listTab !== tab ? (
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              aria-busy
              aria-label="Carregando posts"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-3 space-y-2">
                  <Skeleton variant="rounded" width="100%" height="8rem" />
                  <Skeleton width="75%" height="0.875rem" />
                  <Skeleton width="50%" height="0.625rem" />
                </div>
              ))}
            </div>
          ) : listError ? (
            <div className="rounded-xl border border-danger/40 bg-surface p-6 text-center">
              <p role="alert" className="text-sm text-danger">
                {listError}
              </p>
              <button
                type="button"
                onClick={() => void loadTab(tab, page)}
                className="mt-2 min-h-11 rounded-lg border border-border px-3 text-sm font-semibold text-accent"
              >
                Tentar carregar posts novamente
              </button>
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
                {tab === 'draft'
                  ? 'Crie um post e salve como rascunho para continuar depois.'
                  : 'Use “Criar post” para começar.'}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {posts.map(post => {
                const badge = statusBadge(post.status);
                return (
                  <li
                    key={post.id}
                    className="group rounded-xl border border-border bg-surface overflow-hidden"
                  >
                    <div className="relative bg-bg">
                      <PostPreviewBox
                        format={post.format ?? 'square'}
                        previewUrl={post.imageUrl ?? null}
                        className="!rounded-none !border-0"
                      />
                      <span
                        className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="absolute right-2 bottom-2 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {post.format === 'portrait'
                          ? '4:5'
                          : post.format === 'story'
                            ? '9:16'
                            : '1:1'}
                      </span>
                    </div>
                    <div className="p-3 space-y-1.5">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {post.title || 'Sem título'}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {post.status === 'scheduled'
                          ? `Agendado: ${formatDate(post.scheduledFor)}`
                          : post.status === 'published'
                            ? `Publicado: ${formatDate(post.publishedAt)}`
                            : `Editado: ${formatDate(post.createdAt)}`}
                      </p>
                      <PostRowActions
                        post={post}
                        busy={actionInFlight !== null}
                        onEdit={() => openEditor(post)}
                        onReuse={() => handleReuse(post)}
                        onCancelSchedule={() => void handleCancelSchedule(post)}
                        onPublish={() => void handlePublish(post)}
                        onDelete={() => setDeletingPost(post)}
                        onWhatsapp={() => void openWhatsappConfirm(post)}
                        onDownload={() =>
                          post.imageUrl && downloadPostImage(post.imageUrl, `post-${post.id}.png`)
                        }
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
              <span className="text-xs text-text-muted" aria-current="page">
                {page} de {pageCount}
              </span>
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
        </div>
      </Tabs>

      {editingPost && (
        <PostEditor
          key={editingPost === 'new' ? `new:${sourcePost?.id ?? ''}` : editingPost.id}
          sourcePost={sourcePost}
          metadataErrors={metadataErrors}
          metadataLoading={loadingMeta}
          onReloadMetadata={() => void loadMeta()}
          post={editingPost === 'new' ? null : editingPost}
          barbershopId={barbershopId!}
          userId={userId}
          palettes={palettes}
          mediaLibrary={mediaLibrary}
          onClose={() => {
            setEditingPost(null);
            setSourcePost(null);
          }}
          onSaved={newStatus => {
            setEditingPost(null);
            setSourcePost(null);
            setTab(newStatus);
            if (newStatus === tab) void loadTab(newStatus, 1);
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
          error={whatsappError}
          onRetry={() => void loadWhatsappAudience(whatsappPost)}
          onCancel={closeWhatsapp}
          onConfirm={() => void handleSendWhatsapp()}
        />
      )}

      {/* Exclusão */}
      <ConfirmDialog
        open={!!deletingPost}
        title={deletingPost?.status === 'scheduled' ? 'Excluir post agendado' : 'Excluir rascunho'}
        message={
          deletingPost?.status === 'scheduled'
            ? 'O post e seu agendamento serão removidos permanentemente. Deseja continuar?'
            : 'O rascunho será removido permanentemente. Deseja continuar?'
        }
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onCancel={() => setDeletingPost(null)}
        onConfirm={() => void handleDelete()}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}

// ─── Ações por linha ───────────────────────────────────────────

interface RowActionsProps {
  post: FeedPost;
  busy: boolean;
  onEdit: () => void;
  onReuse: () => void;
  onCancelSchedule: () => void;
  onPublish: () => void;
  onDelete: () => void;
  onWhatsapp: () => void;
  onDownload: () => void;
}

const PostRowActions: React.FC<RowActionsProps> = ({
  post,
  busy,
  onEdit,
  onReuse,
  onCancelSchedule,
  onPublish,
  onDelete,
  onWhatsapp,
  onDownload,
}) => {
  if (post.status === 'published') {
    return (
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onWhatsapp}
          disabled={busy}
          title="Enviar pelo WhatsApp"
          className="flex-1 min-h-10 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={busy || !post.imageUrl}
          title="Baixar PNG"
          aria-label="Baixar PNG"
          className="min-h-10 rounded-lg border border-border px-2 text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40"
        >
          <Download size={14} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          title="Editar"
          className="min-h-10 rounded-lg border border-border px-2 text-xs font-semibold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onReuse}
          disabled={busy}
          className="min-h-11 rounded-lg border border-border px-2 text-xs font-semibold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40"
        >
          Reutilizar
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 pt-1">
      <button
        type="button"
        onClick={onEdit}
        disabled={busy}
        className="flex-1 min-h-10 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40"
      >
        Editar
      </button>
      {post.status === 'scheduled' || post.status === 'draft' ? (
        <button
          type="button"
          onClick={onPublish}
          disabled={busy}
          className="flex-1 min-h-10 rounded-lg bg-accent text-xs font-bold text-accent-fg hover:bg-accent-hover disabled:opacity-40"
        >
          Publicar
        </button>
      ) : null}
      {post.status === 'scheduled' && (
        <button
          type="button"
          onClick={onCancelSchedule}
          disabled={busy}
          className="min-h-11 rounded-lg border border-border px-2 text-xs font-semibold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40"
        >
          Cancelar agendamento
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="min-h-10 rounded-lg border border-border px-2 text-text-muted hover:border-danger/40 hover:text-danger disabled:opacity-40"
        aria-label={post.status === 'scheduled' ? 'Excluir post agendado' : 'Excluir rascunho'}
      >
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
  error: string | null;
  onRetry: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ post, audience, sending, error, onRetry, onCancel, onConfirm }) => (
  <ModalShell
    open
    role="alertdialog"
    titleId="wa-title"
    title="Enviar pelo WhatsApp"
    loading={sending}
    onClose={onCancel}
    body={
      <>
        <p className="mt-1 text-sm text-text-secondary">
          A arte de “{post.title || 'Sem título'}” será enviada para os clientes do salão.
        </p>
        {error ? (
          <div className="mt-3">
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
            <button
              type="button"
              onClick={onRetry}
              disabled={sending}
              className="min-h-11 text-sm font-semibold text-accent disabled:opacity-50"
            >
              Tentar verificar clientes novamente
            </button>
          </div>
        ) : audience === null ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-text-muted">
            <Loader2 size={14} className="animate-spin" aria-hidden /> Verificando clientes…
          </p>
        ) : !audience.whatsappConnected ? (
          <p className="mt-2 text-sm text-warning">
            O WhatsApp do salão não está conectado. Conecte nas configurações antes de enviar.
          </p>
        ) : (
          <p className="mt-2 text-sm text-text-secondary">
            <strong className="text-text-primary">{audience.eligible}</strong> cliente
            {audience.eligible === 1 ? '' : 's'} com WhatsApp receberão a mensagem.
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="min-h-11 flex-1 rounded-xl border border-border font-bold text-text-secondary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={sending || !!error || !audience?.whatsappConnected || audience.eligible === 0}
            className="min-h-11 flex-1 rounded-xl bg-accent font-bold text-accent-fg hover:bg-accent-hover disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={16} className="mx-auto animate-spin" aria-hidden />
            ) : (
              'Enviar agora'
            )}
          </button>
        </div>
      </>
    }
  />
);
