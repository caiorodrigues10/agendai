import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LuCamera as Camera,
  LuShare2 as Share2,
  LuPlus as Plus,
  LuTrash2 as Trash2,
  LuX as X,
} from 'react-icons/lu';
import type { ShopSettings, FeedPost, StaffMember } from '../../types';
import { barbershopApi } from '../../infra/barbershopApi';
import { isSupportedImage } from '../../shared/isSupportedImage';
import { socialApi, type GalleryPhoto, type PublicSocialPost } from '../../infra/socialApi';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useSegmentLabels } from '../../hooks/useSegmentLabels';
import { AUDIENCE_OPTIONS } from '../../shared/segments';
import { getErrorMessage } from '../../utils/errorMessage';
import { listSocialLinks } from '../../utils/socialLinks';
import { SOCIAL_NETWORK_ICONS } from '../../components/domain/SocialLinks';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { PostDetail, shareUrl, buildProfileShareUrl } from './PostDetail';
import { StoryModal } from './StoryModal';
import { PostTagEditor } from './PostTagEditor';
import { useSalonSocial } from './useSalonSocial';
import { ProfileAbout, ProfileEmpty, ProfileGrid, ProfileSkeleton } from './ProfileSections';
import { buildProfilePublicationItems } from './profilePublications';

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
  /** Prévia no painel de aparência: sem fetch de social nem ações destrutivas. */
  previewMode?: boolean;
}
const PROFILE_TABS = ['Publicações', 'Sobre'] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];
type SelectedProfileContent =
  { kind: 'post'; post: FeedPost } | { kind: 'photo'; photo: GalleryPhoto };

/** `fotos` é um link legado: volta sempre para a área unificada Publicações. */
function profileTabFromQuery(value: string | null): ProfileTab {
  const normalized = value?.trim().toLocaleLowerCase('pt-BR');
  return normalized === 'sobre' ? 'Sobre' : 'Publicações';
}

const actionClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-text-primary hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus';
/** Ação principal: usa o destaque somente quando ele é utilizável no tema. */
const activeActionClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-accent-active-border px-4 text-sm font-semibold bg-accent-active-bg text-accent-active-fg hover:bg-accent-action-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus';
/** Ícone-only das redes sociais no cabeçalho (toque ≥ 44px, alvo de 44×44). */
const socialActionClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border px-0 text-text-secondary hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus';

function ProfilePostModal({
  label,
  closeLabel,
  onClose,
  children,
}: {
  label: string;
  closeLabel: string;
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
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-media-overlay/80 p-2 sm:p-5">
        <button
          type="button"
          aria-label={`${closeLabel} ao clicar fora`}
          tabIndex={-1}
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="relative max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-3 top-3 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-surface/90 text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            <X size={20} aria-hidden />
          </button>
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
  previewMode = false,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const social = useSalonSocial(previewMode ? null : barbershopId);
  // Vocabulário do segmento (o provider já carregou o salão; o override cobre
  // os testes/story que passam settings explícito sem provider).
  const { labels, config } = useSegmentLabels(settings.businessSegment ?? null);
  const audienceValue = config.targetAudience.applies ? (settings.targetAudience ?? null) : null;
  const audienceLabel = AUDIENCE_OPTIONS.find(option => option.value === audienceValue)?.label;
  const [tab, setTab] = useState<ProfileTab>(() =>
    profileTabFromQuery(searchParams.get('profileTab') ?? searchParams.get('tab'))
  );
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [logoBusy, setLogoBusy] = useState(false);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [deletePost, setDeletePost] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<SelectedProfileContent | null>(null);
  const [detail, setDetail] = useState<PublicSocialPost | null>(null);
  const [detailError, setDetailError] = useState(false);
  const [detailVersion, setDetailVersion] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);
  // Fade da borda direita só quando as abas realmente transbordam.
  useEffect(() => {
    const list = tablistRef.current;
    if (!list) return;
    const check = () => setTabsOverflow(list.scrollWidth > list.clientWidth + 1);
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(check);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);
  // Aba ativa sempre visível na faixa rolável: scroll manual por offsetLeft
  // (layout px, imune ao transform scale da prévia; scrollIntoView também
  // rolagaria os ancestrores do mockup).
  useEffect(() => {
    const list = tablistRef.current;
    const active = list?.querySelector<HTMLElement>('[data-tab-active="true"]');
    if (!list || !active) return;
    const left = active.offsetLeft - list.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
    // optional call: jsdom não implementa Element.scrollTo (testes).
    list.scrollTo?.({ left: Math.max(0, left) });
  }, [tab]);
  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    if (onNotify) onNotify(message, type);
    else setToast({ message, type });
  };
  const publicationItems = useMemo(
    () => buildProfilePublicationItems(posts, social.gallery.data),
    [posts, social.gallery.data]
  );
  const [storyNow, setStoryNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setStoryNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const stories = social.stories.data.filter(
    post => storyNow - (post.publishedAt ?? post.createdAt) < 24 * 60 * 60 * 1000
  );
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
  // Redes com link válido: só essas viram ícone no cabeçalho e na aba Sobre.
  const socialEntries = useMemo(
    () => listSocialLinks(settings.socialLinks),
    [settings.socialLinks]
  );

  useEffect(() => {
    setLogoUrl(settings.logoUrl);
  }, [settings.logoUrl]);
  useEffect(() => {
    setSelected(null);
    setStoryIndex(null);
    setTab('Publicações');
  }, [barbershopId]);
  const selectedPost = selected?.kind === 'post' ? selected.post : null;
  useEffect(() => {
    if (!selectedPost || !barbershopId) {
      setDetail(null);
      return;
    }
    let active = true;
    setDetail(null);
    setDetailError(false);
    void socialApi
      .getPost(selectedPost.barbershopId || barbershopId, selectedPost.id)
      .then(post => {
        if (active) setDetail(post);
      })
      .catch(() => {
        if (active) setDetailError(true);
      });
    return () => {
      active = false;
    };
  }, [selectedPost, barbershopId, detailVersion]);

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
    if (!(await isSupportedImage(file))) {
      notify('Envie uma imagem JPG, PNG ou WebP.', 'error');
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
  const share = async () => {
    if (previewMode || !barbershopId) return;
    try {
      const result = await shareUrl(buildProfileShareUrl(barbershopId), settings.shopName);
      if (result === 'copied') notify('Link do perfil copiado!');
    } catch {
      notify('Não foi possível compartilhar o perfil.', 'error');
    }
  };

  return (
    <div className="pb-16 space-y-4" data-testid="salon-social-profile">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="p-4 @min-[640px]:p-6">
          <div className="flex items-center gap-4 @min-[640px]:gap-7">
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
                className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-bg text-xl font-bold text-text-primary disabled:opacity-100 @min-[640px]:h-28 @min-[640px]:w-28 @min-[640px]:text-3xl"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setLogoUrl(undefined)}
                  />
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
              <h1 className="break-words text-lg font-bold tracking-tight @min-[640px]:text-2xl">
                {settings.shopName}
              </h1>
              <p className="mt-0.5 text-sm text-text-muted">
                {labels.segmentLabel}
                {audienceLabel ? ` · ${audienceLabel}` : ''}
              </p>
              <div className="mt-3 min-w-0">
                <strong className="block text-sm font-semibold">{publicationItems.length}</strong>
                <p className="truncate text-xs leading-tight text-text-muted">publicações</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm font-semibold text-text-secondary">
              Beleza, cuidado e experiências
            </p>
            {settings.address && (
              <p className="text-sm text-text-secondary">
                {settings.address}
                {settings.city ? ` · ${settings.city}` : ''}
              </p>
            )}
            <p className="text-sm text-text-muted">
              <span className={isShopOpen() ? 'text-success font-semibold' : ''}>
                {isShopOpen() ? 'Aberto agora' : 'Fechado agora'}
              </span>
              {getTodayScheduleDisplay() ? ` · ${getTodayScheduleDisplay()}` : ''}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {isPublic && settings.operationMode !== 'APPOINTMENTS_ONLY' && (
              <button type="button" onClick={() => go('queue')} className={activeActionClass}>
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
                className={activeActionClass}
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
              <span className="hidden @min-[640px]:inline">Compartilhar</span>
            </button>
            {socialEntries.map(entry => {
              const Icon = SOCIAL_NETWORK_ICONS[entry.id];
              return (
                <a
                  key={entry.id}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${entry.label} de ${settings.shopName}`}
                  title={entry.label}
                  className={socialActionClass}
                >
                  <Icon size={16} aria-hidden />
                </a>
              );
            })}
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
          <div className="flex gap-4 overflow-x-auto px-4 pb-5 @min-[640px]:px-6">
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
                <span className="mt-1 block truncate text-2xs text-text-secondary">
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
        {/* Faixa de abas: rolagem horizontal com snap + fade na borda direita
            indicando overflow (nunca corta uma aba sem aviso). */}
        <div className="relative border-t border-border">
          <div
            ref={tablistRef}
            role="tablist"
            aria-label="Conteúdo do perfil"
            className="flex snap-x snap-mandatory overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden @min-[640px]:px-4"
          >
            {PROFILE_TABS.map(item => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === item}
                aria-controls="salon-profile-content"
                id={`salon-tab-${item}`}
                key={item}
                data-tab-active={tab === item}
                onClick={() => setTab(item)}
                className={`min-h-12 shrink-0 snap-start border-t-2 px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${tab === item ? '!border-accent-active-border bg-accent-active-bg text-accent-active-fg' : 'border-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent ${tabsOverflow ? '' : 'hidden'}`}
            aria-hidden="true"
          />
        </div>
      </section>
      <section
        id="salon-profile-content"
        role="tabpanel"
        aria-labelledby={`salon-tab-${tab}`}
        className="rounded-2xl border border-border bg-surface p-2 @min-[640px]:p-4"
      >
        {tab === 'Publicações' &&
          (social.gallery.loading ? (
            <div
              className="grid grid-cols-3 gap-1 @min-[640px]:gap-2 @min-[768px]:grid-cols-4"
              aria-busy="true"
              aria-label="Carregando publicações"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-bg" />
              ))}
            </div>
          ) : social.gallery.error ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-xl border border-danger/40 bg-danger/10 px-5 py-10 text-center"
            >
              <p className="text-sm font-semibold text-danger">
                Não foi possível carregar as publicações
              </p>
              <button
                type="button"
                onClick={social.gallery.reload}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
              >
                Tentar novamente
              </button>
            </div>
          ) : publicationItems.length ? (
            <ProfileGrid
              items={publicationItems}
              onOpenPost={post => setSelected({ kind: 'post', post })}
              onOpenPhoto={photo => setSelected({ kind: 'photo', photo })}
            />
          ) : (
            <ProfileEmpty
              title={canCompose ? 'O próximo post começa aqui' : 'Ainda não há publicações'}
              text={
                canCompose
                  ? 'Crie uma publicação ou envie fotos para apresentar seu salão aos clientes.'
                  : 'Novidades e fotos do salão vão aparecer aqui.'
              }
            />
          ))}
        {tab === 'Sobre' && (
          <div className="p-2">
            <ProfileAbout settings={settings} services={services} />
          </div>
        )}
      </section>
      {selected && (
        <ProfilePostModal
          label={
            selected.kind === 'post'
              ? selected.post.title || 'Publicação do salão'
              : 'Foto do salão'
          }
          closeLabel={selected.kind === 'post' ? 'Fechar publicação' : 'Fechar foto'}
          onClose={() => setSelected(null)}
        >
          {selected.kind === 'photo' ? (
            <div className="relative p-2" data-testid="profile-photo-lightbox">
              <img
                src={selected.photo.url}
                alt="Foto do salão"
                className="max-h-[82dvh] w-full rounded-xl object-contain"
              />
            </div>
          ) : detail ? (
            <>
              <PostDetail
                key={detail.id}
                salonId={detail.barbershopId || barbershopId || ''}
                post={detail}
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
