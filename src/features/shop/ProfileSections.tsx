/* eslint-disable jsx-a11y/media-has-caption -- miniatura silenciosa; o player completo é aberto no detalhe */
import {
  LuPlay as Play,
  LuExternalLink as ExternalLink,
  LuHeart as Heart,
  LuMessageCircle as MessageCircle,
} from 'react-icons/lu';
import type { FeedPost, ShopSettings, Service } from '../../types';
import { listSocialLinks } from '../../utils/socialLinks';
import { formatOabRegistration } from '../../utils/oabRegistration';
import { isAdvertisingRestricted } from '../../shared/segments';
import { SocialNetworkIcon } from '../../components/domain/SocialLinks';
import type { ProfilePublicationItem } from './profilePublications';

export function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando conteúdo do perfil"
      className="grid grid-cols-3 gap-1 animate-pulse @min-[768px]:grid-cols-4"
    >
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} className="aspect-[4/5] bg-surface-2 rounded-sm" />
      ))}
    </div>
  );
}
export function ProfileEmpty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
      <p className="font-bold text-text-primary">{title}</p>
      <p className="mt-2 text-sm text-text-muted max-w-sm mx-auto">{text}</p>
    </div>
  );
}
function PublicationStats({ post, onMedia = false }: { post: FeedPost; onMedia?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center gap-2 text-xs font-medium ${onMedia ? 'text-on-media' : 'text-text-secondary'}`}
    >
      <span className="flex items-center gap-1">
        <Heart size={12} aria-hidden />
        {post.likes ?? 0}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle size={12} aria-hidden />
        {post.commentsCount ?? 0}
      </span>
    </span>
  );
}

function metricLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function publicationAccessibleLabel(post: FeedPost, label: string): string {
  const kind = post.videoUrl ? 'vídeo' : 'publicação';
  const likes = metricLabel(post.likes ?? 0, 'curtida', 'curtidas');
  const comments = metricLabel(post.commentsCount ?? 0, 'comentário', 'comentários');
  return `Abrir ${kind}: ${label}. ${likes}, ${comments}.`;
}

function photoAccessibleLabel(photo: Extract<ProfilePublicationItem, { kind: 'photo' }>['photo']): string {
  const timestamp = Date.parse(photo.createdAt);
  if (Number.isNaN(timestamp)) return 'Abrir foto do salão';
  const date = new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return `Abrir foto do salão — ${date}`;
}

function ProfilePostTile({
  post,
  onOpen,
}: {
  post: FeedPost;
  onOpen: (post: FeedPost) => void;
}) {
  const label = post.title || post.content || 'Publicação do salão';
  const hasMedia = Boolean(post.imageUrl || post.videoUrl);

  if (!hasMedia) {
    return (
      <button
        type="button"
        onClick={() => onOpen(post)}
        aria-label={publicationAccessibleLabel(post, label)}
        data-testid="profile-text-post"
        className="group flex aspect-square min-w-0 self-start flex-col gap-2 overflow-hidden rounded-sm bg-surface-2 p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 @min-[640px]:p-4"
      >
        <span className="line-clamp-3 break-words hyphens-auto text-sm font-semibold leading-snug text-text-primary">
          {label}
        </span>
        <span
          className="mt-auto flex items-center justify-end gap-2 border-t border-border pt-2 @min-[640px]:justify-between"
          data-testid="profile-post-footer"
        >
          <span className="hidden min-w-0 truncate text-xs text-text-muted @min-[640px]:inline">
            Publicação
          </span>
          <PublicationStats post={post} />
        </span>
      </button>
    );
  }

  // Célula 4:5 preserva a arte antiga: só 4:5 é cortado; 1:1 e 9:16 aparecem
  // inteiros (contain) sobre o fundo da célula.
  const fit = post.format === 'portrait' ? 'object-cover' : 'object-contain';
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      aria-label={publicationAccessibleLabel(post, label)}
      className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
    >
      {post.imageUrl ? (
        <img
          src={post.imageUrl}
          alt=""
          loading="lazy"
          className={`h-full w-full ${fit} transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
        />
      ) : (
        <video src={post.videoUrl} preload="metadata" muted className={`h-full w-full ${fit}`} />
      )}
      {post.videoUrl && (
        <span className="absolute right-2 top-2 rounded-full bg-media-overlay/60 p-1.5 text-on-media">
          <Play size={16} fill="currentColor" aria-hidden />
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-media-overlay/90 via-media-overlay/60 to-transparent px-2 pb-2 pt-8">
        <span className="line-clamp-2 block break-words text-xs font-semibold leading-snug text-on-media">
          {label}
        </span>
        <span className="mt-1 flex items-center justify-between gap-2">
          <PublicationStats post={post} onMedia />
        </span>
      </span>
    </button>
  );
}

export function ProfileGrid({
  items,
  onOpenPost,
  onOpenPhoto,
}: {
  items: ProfilePublicationItem[];
  onOpenPost: (post: FeedPost) => void;
  onOpenPhoto: (photo: Extract<ProfilePublicationItem, { kind: 'photo' }>['photo']) => void;
}) {
  return (
    <div
      className="grid grid-cols-3 items-start gap-1 @min-[640px]:gap-2 @min-[768px]:grid-cols-4"
      data-testid="profile-post-grid"
    >
      {items.map(item =>
        item.kind === 'post' ? (
          <ProfilePostTile key={item.key} post={item.post} onOpen={onOpenPost} />
        ) : (
          <button
            type="button"
            key={item.key}
            onClick={() => onOpenPhoto(item.photo)}
            aria-label={photoAccessibleLabel(item.photo)}
            className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
          >
            <img
              src={item.photo.url}
              alt="Foto do salão"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </button>
        )
      )}
    </div>
  );
}
export function ProfileAbout({
  settings,
  services,
}: {
  settings: ShopSettings;
  services: Service[];
}) {
  const socialEntries = listSocialLinks(settings.socialLinks);
  // Serviço interno (audiência, diligência, despacho) não aparece no perfil:
  // o cliente agenda só o que é público.
  const publicServices = services.filter(service => service.publicBookable !== false);
  const practiceAreas = settings.practiceAreas ?? [];
  // Segmento com restrição de publicidade (ex.: advocacia): não divulga
  // valores no perfil público.
  const hidePrices = isAdvertisingRestricted(settings.businessSegment);
  const oabLabel = formatOabRegistration(settings.oabRegistration);
  return (
    <div className="grid gap-5 @min-[640px]:grid-cols-2">
      <section className="rounded-xl border border-border bg-bg p-4">
        <h2 className="font-bold">Nosso espaço</h2>
        {settings.address && <p className="mt-2 text-sm text-text-secondary">{settings.address}</p>}
        {settings.city && <p className="text-sm text-text-muted">{settings.city}</p>}
        {oabLabel && (
          <p className="mt-2 text-sm font-semibold text-text-secondary">{oabLabel}</p>
        )}
        {practiceAreas.length > 0 && (
          <>
            <h3 className="mt-5 mb-2 text-sm font-bold">Áreas de atuação</h3>
            <ul className="flex flex-wrap gap-1.5">
              {practiceAreas.map(area => (
                <li
                  key={area}
                  className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-text-secondary"
                >
                  {area}
                </li>
              ))}
            </ul>
          </>
        )}
        <h3 className="mt-5 mb-3 text-sm font-bold">Horários</h3>
        {settings.schedule.length ? (
          settings.schedule.map((day, i) => (
            <div
              key={day.dayName}
              className={`flex justify-between gap-3 rounded-lg px-2 py-2 text-xs ${i === new Date().getDay() ? 'bg-accent/10' : ''}`}
            >
              <span>{day.dayName}</span>
              <span>{day.isOpen ? `${day.openTime} – ${day.closeTime}` : 'Fechado'}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-muted">Consulte os horários com o salão.</p>
        )}
      </section>
      <section className="rounded-xl border border-border bg-bg p-4">
        <h2 className="mb-3 font-bold">Serviços</h2>
        {publicServices.length ? (
          publicServices.map(service => (
            <div
              key={service.id}
              className="flex justify-between gap-3 border-b border-border py-3 text-sm"
            >
              <div>
                <p className="font-semibold">{service.name}</p>
                <p className="text-xs text-text-muted">{service.avgTimeMinutes} min</p>
              </div>
              {!hidePrices && (
                <span className="shrink-0">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    service.price
                  )}
                </span>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-text-muted">Os serviços cadastrados aparecem aqui.</p>
        )}
      </section>
      {socialEntries.length > 0 && (
        <section className="rounded-xl border border-border bg-bg p-4">
          <h2 className="mb-3 font-bold">Redes sociais</h2>
          <ul className="space-y-1">
            {socialEntries.map(entry => (
              <li key={entry.id}>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${entry.label} de ${settings.shopName}`}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                  <SocialNetworkIcon network={entry.id} size={16} className="text-text-muted" />
                  <span className="font-medium">{entry.label}</span>
                  <ExternalLink size={14} className="ml-auto text-text-muted" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
