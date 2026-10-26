/* eslint-disable jsx-a11y/media-has-caption -- miniatura silenciosa; o player completo é aberto no detalhe */
import { LuPlay as Play } from 'react-icons/lu';
import type { FeedPost, ShopSettings, Service } from '../../types';

export function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando conteúdo do perfil"
      className="grid grid-cols-3 gap-1 animate-pulse"
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
export function ProfileGrid({
  posts,
  onOpen,
}: {
  posts: FeedPost[];
  onOpen: (post: FeedPost) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2" data-testid="profile-post-grid">
      {posts.map(post => {
        // Célula 4:5 fixa; só a arte 4:5 pode ser cortada (cover). 1:1 e 9:16
        // aparecem inteiras (contain) sobre o fundo da célula — nada de corte.
        const fit = post.format === 'portrait' ? 'object-cover' : 'object-contain';
        return (
          <button
            type="button"
            key={post.id}
            onClick={() => onOpen(post)}
            aria-label={`Abrir ${post.videoUrl ? 'vídeo' : 'publicação'}: ${post.title || 'Post do salão'}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt=""
                loading="lazy"
                className={`h-full w-full ${fit} transition-transform duration-300 group-hover:scale-105`}
              />
            ) : post.videoUrl ? (
              <video
                src={post.videoUrl}
                preload="metadata"
                muted
                className={`h-full w-full ${fit}`}
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
            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-5 text-[10px] sm:text-xs text-white">
              {post.title || 'Publicação'}
            </span>
          </button>
        );
      })}
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
