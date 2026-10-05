import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import { useNavigate } from 'react-router-dom';
import {
  LuCamera as Camera,
  LuShare2 as Share2,
  LuPlus as Plus,
  LuStar as Star,
  LuTrash2 as Trash2,
} from 'react-icons/lu';
import type { ShopSettings, FeedPost, StaffMember } from '../../types';
import { barbershopApi } from '../../infra/barbershopApi';
import { socialApi, type PublicSocialPost } from '../../infra/socialApi';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { PostDetail, shareUrl, buildProfileShareUrl } from './PostDetail';
import { StoryModal } from './StoryModal';
import { PostTagEditor } from './PostTagEditor';
import { useSalonSocial } from './useSalonSocial';
import {
  ProfileAbout,
  ProfileEmpty,
  ProfileGrid,
  ProfileReviews,
  ProfileSkeleton,
} from './ProfileSections';

interface ShopProfileProps {
  settings: ShopSettings;
  posts: FeedPost[];
  currentUser: StaffMember | null;
  onDeletePost: (id: string) => void | Promise<void>;
  onLikePost: (id: string) => void | Promise<void>;
  audience?: 'public' | 'staff';
  onGoQueue?: () => void;
  onGoAppointments?: () => void;
  onNotify?: (message: string, type: 'success' | 'error') => void;
}
const TABS = ['Publicações', 'Vídeos', 'Marcados', 'Avaliações', 'Sobre'] as const;
type ProfileTab = (typeof TABS)[number];
const actionClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';

function ProfilePostModal({
  post,
  onClose,
  children,
}: {
  post: FeedPost;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', key);
    };
  }, [onClose]);
  return createPortal(
    <FocusLock returnFocus>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-2 sm:p-5">
        <button
          type="button"
          aria-label="Fechar publicação"
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={post.title || 'Publicação do salão'}
          className="relative max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
        >
          {children}
        </div>
      </div>
    </FocusLock>,
    document.body
  );
}

export const ShopProfile: React.FC<ShopProfileProps> = ({
  settings,
  posts,
  currentUser,
  onDeletePost,
  onLikePost,
  audience = 'public',
  onGoQueue,
  onGoAppointments,
  onNotify,
}) => {
  const navigate = useNavigate();
  const { services, isShopOpen, getTodayScheduleDisplay } = useBarbershop();
  const { barbershopId } = useBarbershopFilters();
  const isPublic = audience === 'public';
  const ownsSalon =
    currentUser?.role === 'MASTER_ADMIN' || currentUser?.barbershopId === barbershopId;
  const canCompose =
    !isPublic &&
    ownsSalon &&
    Boolean(currentUser && ['OWNER', 'EMPLOYEE', 'MASTER_ADMIN'].includes(currentUser.role));
  const canModerate = canCompose && currentUser?.role !== 'EMPLOYEE';
  const social = useSalonSocial(barbershopId, canModerate);
  const [tab, setTab] = useState<ProfileTab>('Publicações');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [logoBusy, setLogoBusy] = useState(false);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [deletePost, setDeletePost] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<FeedPost | null>(null);
  const [detail, setDetail] = useState<PublicSocialPost | null>(null);
  const [detailError, setDetailError] = useState(false);
  const [detailVersion, setDetailVersion] = useState(0);
  const [tagBusy, setTagBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    if (onNotify) onNotify(message, type);
    else setToast({ message, type });
  };
  const publicPosts = useMemo(
    () =>
      posts.filter(
        post => (!post.status || post.status === 'published') && post.format !== 'story'
      ),
    [posts]
  );
  const videos = publicPosts.filter(post => Boolean(post.videoUrl));
  const [storyNow, setStoryNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setStoryNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const stories = social.stories.data.filter(
    post => storyNow - (post.publishedAt ?? post.createdAt) < 24 * 60 * 60 * 1000
  );
  const rating = social.reviews.data;
  const initials = settings.shopName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
  const phone = settings.whatsapp.replace(/\D/g, '');
  const whatsapp =
    phone.length >= 10
      ? `https://wa.me/${phone.startsWith('55') && phone.length > 11 ? phone : `55${phone}`}`
      : null;

  useEffect(() => {
    setLogoUrl(settings.logoUrl);
  }, [settings.logoUrl]);
  useEffect(() => {
    setSelected(null);
    setStoryIndex(null);
    setTab('Publicações');
  }, [barbershopId]);
  useEffect(() => {
    if (!selected || !barbershopId) {
      setDetail(null);
      return;
    }
    let active = true;
    setDetail(null);
    setDetailError(false);
    void socialApi
      .getPost(selected.barbershopId || barbershopId, selected.id)
      .then(post => {
        if (active) setDetail(post);
      })
      .catch(() => {
        if (active) setDetailError(true);
      });
    return () => {
      active = false;
    };
  }, [selected, barbershopId, detailVersion]);

  const go = (destination: 'queue' | 'appointments') => {
    const handler = destination === 'queue' ? onGoQueue : onGoAppointments;
    if (handler) handler();
    else if (barbershopId)
      navigate(`/queue/${encodeURIComponent(barbershopId)}?tab=${destination}`);
  };
  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !barbershopId || logoBusy) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      notify('Envie uma imagem JPG, PNG ou WebP de até 5 MB.', 'error');
      return;
    }
    setLogoBusy(true);
    try {
      const result = await barbershopApi.uploadLogoDirect(barbershopId, file);
      setLogoUrl(result.logoUrl);
      notify('Logo atualizada.');
    } catch (err) {
      notify(getErrorMessage(err, 'Não foi possível atualizar a logo.'), 'error');
    } finally {
      setLogoBusy(false);
    }
  };
  const deleteLogo = async () => {
    if (!barbershopId || logoBusy) return;
    setLogoBusy(true);
    try {
      await barbershopApi.deleteLogo(barbershopId);
      setLogoUrl(undefined);
      setRemoveLogo(false);
      notify('Logo removida.');
    } catch (err) {
      notify(getErrorMessage(err, 'Não foi possível remover a logo.'), 'error');
    } finally {
      setLogoBusy(false);
    }
  };
  const removePost = async () => {
    if (!deletePost || deleting) return;
    setDeleting(true);
    try {
      await onDeletePost(deletePost);
      setDeletePost(null);
      setSelected(null);
      notify('Publicação excluída.');
    } catch (err) {
      notify(getErrorMessage(err, 'Não foi possível excluir a publicação.'), 'error');
    } finally {
      setDeleting(false);
    }
  };
  const moderate = async (id: string, approve: boolean) => {
    if (!barbershopId || tagBusy) return;
    setTagBusy(id);
    try {
      await socialApi.moderateTag(barbershopId, id, approve);
      social.pending.reload();
      social.tagged.reload();
      notify(approve ? 'Marcação aprovada.' : 'Marcação recusada.');
    } catch (err) {
      notify(getErrorMessage(err, 'Não foi possível atualizar a marcação.'), 'error');
    } finally {
      setTagBusy(null);
    }
  };
  const share = async () => {
    if (!barbershopId) return;
    try {
      const result = await shareUrl(buildProfileShareUrl(barbershopId), settings.shopName);
      if (result === 'copied') notify('Link do perfil copiado!');
    } catch {
      notify('Não foi possível compartilhar o perfil.', 'error');
    }
  };

  const tabResource =
    tab === 'Marcados' ? social.tagged : tab === 'Avaliações' ? social.reviews : null;
  return (
    <div className="pb-16 space-y-4" data-testid="salon-social-profile">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-7">
            <div
              className={`relative shrink-0 rounded-full p-1 ${stories.length ? 'bg-gradient-to-tr from-accent to-support' : 'bg-border'}`}
            >
              <button
                type="button"
                onClick={() => {
                  if (stories.length) setStoryIndex(0);
                }}
                disabled={!stories.length}
                aria-label={stories.length ? 'Ver stories do salão' : 'Logo do salão'}
                className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-bg text-xl sm:text-3xl font-bold text-text-primary disabled:opacity-100"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials || 'S'
                )}
              </button>
              {canModerate && (
                <button
                  type="button"
                  aria-label="Alterar logo"
                  disabled={logoBusy}
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex min-h-10 min-w-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary"
                >
                  <Camera size={17} />
                </button>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-lg sm:text-2xl font-bold tracking-tight">
                {settings.shopName}
              </h1>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:flex sm:gap-7">
                <div>
                  <strong className="text-base sm:text-lg">{publicPosts.length}</strong>
                  <p className="text-[11px] sm:text-xs text-text-muted">publicações</p>
                </div>
                <div>
                  <strong className="text-base sm:text-lg">{videos.length}</strong>
                  <p className="text-[11px] sm:text-xs text-text-muted">vídeos</p>
                </div>
                {rating?.showAverage && rating.average !== null && rating.count > 0 && (
                  <button
                    type="button"
                    onClick={() => setTab('Avaliações')}
                    className="text-left col-span-2"
                  >
                    <strong className="flex items-center gap-1 text-base sm:text-lg">
                      <Star size={14} className="text-warning fill-warning" />
                      {rating.average.toFixed(1)}
                    </strong>
                    <p className="text-[11px] sm:text-xs text-text-muted">
                      {rating.count} avaliações
                    </p>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold text-text-secondary">
              Beleza, cuidado e experiências
            </p>
            {settings.address && (
              <p className="text-sm text-text-secondary">
                {settings.address}
                {settings.city ? ` · ${settings.city}` : ''}
              </p>
            )}
            <p className="text-xs text-text-muted">
              <span className={isShopOpen() ? 'text-success font-semibold' : ''}>
                {isShopOpen() ? 'Aberto agora' : 'Fechado agora'}
              </span>
              {getTodayScheduleDisplay() ? ` · ${getTodayScheduleDisplay()}` : ''}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {isPublic && settings.operationMode !== 'APPOINTMENTS_ONLY' && (
              <button
                type="button"
                onClick={() => go('queue')}
                className={`${actionClass} bg-accent text-accent-fg hover:bg-accent-hover`}
              >
                Entrar na fila
              </button>
            )}
            {isPublic && settings.operationMode !== 'QUEUE_ONLY' && (
              <button type="button" onClick={() => go('appointments')} className={actionClass}>
                Agendar
              </button>
            )}
            {canCompose && (
              <button
                type="button"
                onClick={() => navigate('/app/posts')}
                className={`${actionClass} bg-accent text-accent-fg hover:bg-accent-hover`}
              >
                <Plus size={16} />
                Criar publicação
              </button>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={actionClass}>
                WhatsApp ↗
              </a>
            )}
            <button
              type="button"
              aria-label="Compartilhar perfil"
              onClick={() => void share()}
              className={actionClass}
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          </div>
          {canModerate && (
            <div className="mt-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={event => void uploadLogo(event)}
                className="hidden"
              />
              {logoBusy && (
                <p role="status" className="text-xs text-text-muted">
                  Atualizando logo…
                </p>
              )}
              {logoUrl && (
                <button
                  type="button"
                  disabled={logoBusy}
                  onClick={() => setRemoveLogo(true)}
                  className="min-h-11 text-xs text-text-muted hover:text-danger"
                >
                  Remover logo
                </button>
              )}
            </div>
          )}
        </div>
        {social.stories.loading ? (
          <div className="flex gap-3 px-4 pb-4 animate-pulse" aria-label="Carregando stories">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-16 w-16 rounded-full bg-surface-2" />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto px-4 pb-5 sm:px-6">
            {stories.map((story, index) => (
              <button
                type="button"
                key={story.id}
                onClick={() => setStoryIndex(index)}
                className="w-16 shrink-0 text-center"
                aria-label={`Ver story: ${story.title || index + 1}`}
              >
                <span className="block rounded-full bg-gradient-to-tr from-accent to-support p-0.5">
                  <span className="flex h-[60px] w-[60px] overflow-hidden rounded-full border-2 border-surface bg-bg">
                    {story.imageUrl ? (
                      <img src={story.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="m-auto text-xl text-accent">▶</span>
                    )}
                  </span>
                </span>
                <span className="mt-1 block truncate text-[10px] text-text-secondary">
                  {story.title || 'Story'}
                </span>
              </button>
            ))}
          </div>
        ) : social.stories.error ? (
          <button
            type="button"
            onClick={social.stories.reload}
            className="m-4 text-xs text-text-muted"
          >
            Stories indisponíveis · tentar novamente
          </button>
        ) : null}
        <div
          role="tablist"
          aria-label="Conteúdo do perfil"
          className="flex overflow-x-auto border-t border-border px-2 sm:px-4"
        >
          {TABS.map(item => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === item}
              aria-controls="salon-profile-content"
              id={`salon-tab-${item}`}
              key={item}
              onClick={() => setTab(item)}
              className={`min-h-12 shrink-0 border-t-2 px-3 sm:px-5 text-xs sm:text-sm font-semibold ${tab === item ? 'border-accent text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <section
        id="salon-profile-content"
        role="tabpanel"
        aria-labelledby={`salon-tab-${tab}`}
        className="rounded-2xl border border-border bg-surface p-2 sm:p-4"
      >
        {tabResource?.loading ? (
          <ProfileSkeleton />
        ) : tabResource?.error ? (
          <div className="py-10 text-center">
            <p className="text-sm text-text-muted">Não foi possível carregar este conteúdo.</p>
            <button type="button" onClick={tabResource.reload} className={`${actionClass} mt-3`}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {tab === 'Publicações' &&
              (publicPosts.length ? (
                <ProfileGrid posts={publicPosts} onOpen={setSelected} />
              ) : (
                <ProfileEmpty
                  title="O próximo post começa aqui"
                  text={
                    canCompose
                      ? 'Crie uma publicação para apresentar seu salão aos clientes.'
                      : 'As fotos e novidades do salão vão aparecer aqui.'
                  }
                />
              ))}
            {tab === 'Vídeos' &&
              (videos.length ? (
                <ProfileGrid posts={videos} onOpen={setSelected} />
              ) : (
                <ProfileEmpty
                  title="Ainda sem vídeos"
                  text="Conheça o salão em movimento: bastidores e novidades aparecem nesta aba."
                />
              ))}
            {tab === 'Marcados' && (
              <div className="space-y-4">
                {canModerate && social.pending.loading && <ProfileSkeleton />}
                {canModerate && social.pending.error && (
                  <button type="button" onClick={social.pending.reload} className={actionClass}>
                    Tentar carregar marcações pendentes
                  </button>
                )}
                {canModerate && social.pending.data.length > 0 && (
                  <section className="rounded-xl border border-border p-3">
                    <h2 className="mb-3 text-sm font-bold">Aguardando sua aprovação</h2>
                    {social.pending.data.map(tag => (
                      <div
                        key={tag.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2"
                      >
                        <button
                          type="button"
                          className="text-left text-sm"
                          onClick={() => setSelected(tag.post)}
                        >
                          {tag.post.shopName} · {tag.post.title || 'Publicação'}
                        </button>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={Boolean(tagBusy)}
                            onClick={() => void moderate(tag.id, true)}
                            className={actionClass}
                          >
                            Aprovar
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(tagBusy)}
                            onClick={() => void moderate(tag.id, false)}
                            className={actionClass}
                          >
                            Recusar
                          </button>
                        </div>
                      </div>
                    ))}
                  </section>
                )}
                {social.tagged.data.length ? (
                  <ProfileGrid
                    posts={social.tagged.data.map(tag => tag.post)}
                    onOpen={setSelected}
                  />
                ) : (
                  <ProfileEmpty
                    title="Marcados por outros salões"
                    text="Publicações em que o salão foi marcado aparecem aqui após sua aprovação."
                  />
                )}
              </div>
            )}
            {tab === 'Avaliações' && (
              <div className="p-2">
                <ProfileReviews summary={rating} googleUrl={settings.googleReviewUrl} />
              </div>
            )}
            {tab === 'Sobre' && (
              <div className="p-2">
                <ProfileAbout settings={settings} services={services} />
              </div>
            )}
          </>
        )}
      </section>
      {selected && (
        <ProfilePostModal post={selected} onClose={() => setSelected(null)}>
          {detail ? (
            <>
              <PostDetail
                key={detail.id}
                salonId={detail.barbershopId || barbershopId || ''}
                post={detail}
                onClose={() => setSelected(null)}
                onLike={async id => {
                  if (detail.barbershopId === barbershopId) await onLikePost(id);
                  else
                    await barbershopApi.updatePost(id, { likes: 1 } as Parameters<
                      typeof barbershopApi.updatePost
                    >[1]);
                }}
              />
              {canCompose && detail.barbershopId === barbershopId && (
                <>
                  <div className="border-t border-border px-4 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(null);
                        setDeletePost(detail.id);
                      }}
                      className="inline-flex min-h-11 items-center gap-2 text-xs text-danger"
                    >
                      <Trash2 size={14} />
                      Excluir publicação
                    </button>
                  </div>
                  <PostTagEditor key={detail.id} salonId={barbershopId || ''} postId={detail.id} />
                </>
              )}
            </>
          ) : detailError ? (
            <div className="p-8 text-center">
              <p>Não foi possível abrir a publicação.</p>
              <button
                type="button"
                className={`${actionClass} mt-3`}
                onClick={() => setDetailVersion(v => v + 1)}
              >
                Tentar novamente
              </button>
              <button
                type="button"
                className={`${actionClass} mt-3 ml-2`}
                onClick={() => setSelected(null)}
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="p-4">
              <ProfileSkeleton />
            </div>
          )}
        </ProfilePostModal>
      )}
      {storyIndex !== null && stories[storyIndex] && (
        <StoryModal
          stories={stories}
          index={storyIndex}
          shopName={settings.shopName}
          shopLogoUrl={logoUrl}
          onNavigate={setStoryIndex}
          onClose={() => setStoryIndex(null)}
        />
      )}
      <ConfirmDialog
        open={removeLogo}
        title="Remover logo"
        message="Remover a logo do perfil do salão?"
        confirmLabel="Remover"
        variant="danger"
        loading={logoBusy}
        onConfirm={() => void deleteLogo()}
        onCancel={() => setRemoveLogo(false)}
      />
      <ConfirmDialog
        open={Boolean(deletePost)}
        title="Excluir publicação"
        message="A publicação, seus comentários e marcações serão removidos. Continuar?"
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={() => void removePost()}
        onCancel={() => setDeletePost(null)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
