/* eslint-disable jsx-a11y/media-has-caption -- miniatura silenciosa; o player completo é aberto no detalhe */
import { LuPlay as Play, LuStar as Star, LuMessageCircle as MessageCircle } from 'react-icons/lu';
import type { FeedPost, ShopSettings, Service } from '../../types';
import type { PublicReviewSummary } from '../../infra/reputationApi';

export function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando conteúdo do perfil"
      className="grid grid-cols-3 gap-1 animate-pulse"
    >
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} className="aspect-square bg-surface-2 rounded-sm" />
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
export function ProfileGrid({
  posts,
  onOpen,
}: {
  posts: FeedPost[];
  onOpen: (post: FeedPost) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2" data-testid="profile-post-grid">
      {posts.map(post => (
        <button
          type="button"
          key={post.id}
          onClick={() => onOpen(post)}
          aria-label={`Abrir ${post.videoUrl ? 'vídeo' : 'publicação'}: ${post.title || 'Post do salão'}`}
          className="group relative aspect-square overflow-hidden rounded-sm bg-surface-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : post.videoUrl ? (
            <video
              src={post.videoUrl}
              preload="metadata"
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-3 sm:p-5">
              <p className="line-clamp-4 text-xs sm:text-lg font-bold text-text-primary">
                {post.title || post.content}
              </p>
            </div>
          )}
          {post.videoUrl && (
            <span className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white">
              <Play size={16} fill="currentColor" aria-hidden />
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-5 text-[10px] sm:text-xs text-white">
            <span className="truncate">{post.title || 'Publicação'}</span>
            <span className="flex shrink-0 items-center gap-1">
              <MessageCircle size={12} aria-hidden />
              {post.commentsCount ?? 0}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
export function ProfileReviews({
  summary,
  googleUrl,
}: {
  summary: PublicReviewSummary | null;
  googleUrl?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Avaliações recentes</h2>
        <p className="mt-1 text-sm text-text-muted">
          Depoimentos verificados de quem foi atendido no salão.
        </p>
        {summary?.showAverage && summary.count > 0 && summary.average !== null && (
          <p className="mt-3 text-lg font-bold">
            ★ {summary.average.toFixed(1)}{' '}
            <span className="text-xs font-normal text-text-muted">
              de 5 · {summary.count} avaliações
            </span>
          </p>
        )}
      </div>
      {!summary?.reviews.length && (
        <ProfileEmpty
          title="Ainda sem depoimentos"
          text="As avaliações aparecem após atendimentos concluídos. Nenhuma nota é exibida sem histórico suficiente."
        />
      )}
      {summary?.reviews.map(review => {
        const response =
          typeof review.response === 'string'
            ? review.response
            : review.response?.content || review.response?.message;
        return (
          <article
            key={review.id ?? review.createdAt}
            className="rounded-xl border border-border bg-bg p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold">{review.clientName || 'Cliente'}</h3>
              <span aria-label={`${review.rating} de 5 estrelas`} className="flex text-warning">
                {[0, 1, 2, 3, 4].map(i => (
                  <Star
                    key={i}
                    size={13}
                    aria-hidden
                    className={i < review.rating ? 'fill-current' : 'text-text-muted'}
                  />
                ))}
              </span>
            </div>
            {review.comment && (
              <p className="mt-3 break-words text-sm text-text-secondary">{review.comment}</p>
            )}
            <p className="mt-2 text-xs text-text-muted">
              {new Date(review.createdAt).toLocaleDateString('pt-BR')}
            </p>
            {response && (
              <p className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-text-secondary">
                <strong>Resposta do salão:</strong> {response}
              </p>
            )}
          </article>
        );
      })}
      {googleUrl && (
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-surface-2"
        >
          Ver avaliações no Google ↗
        </a>
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
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <section className="rounded-xl border border-border bg-bg p-4">
        <h2 className="font-bold">Nosso espaço</h2>
        {settings.address && <p className="mt-2 text-sm text-text-secondary">{settings.address}</p>}
        {settings.city && <p className="text-sm text-text-muted">{settings.city}</p>}
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
        {services.length ? (
          services.map(service => (
            <div
              key={service.id}
              className="flex justify-between gap-3 border-b border-border py-3 text-sm"
            >
              <div>
                <p className="font-semibold">{service.name}</p>
                <p className="text-xs text-text-muted">{service.avgTimeMinutes} min</p>
              </div>
              <span className="shrink-0">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  service.price
                )}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-muted">Os serviços cadastrados aparecem aqui.</p>
        )}
      </section>
    </div>
  );
}
