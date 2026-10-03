/* eslint-disable jsx-a11y/media-has-caption -- mídia enviada pelo salão não possui trilha de legenda separada */
import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import {
  LuX as X,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
} from 'react-icons/lu';
import type { FeedPost } from '../../types';

function formatStoryTime(createdAt: number): string {
  const diffMs = Date.now() - createdAt;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return 'agora há pouco';
  if (hours < 24) return `${hours}h atrás`;
  return new Date(createdAt).toLocaleDateString('pt-BR');
}

export interface StoryModalProps {
  stories: FeedPost[];
  index: number;
  shopName: string;
  shopLogoUrl?: string;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

/** Visualizador de stories/destaques: sem autoplay, navegação prev/next. */
export const StoryModal: React.FC<StoryModalProps> = ({
  stories,
  index,
  shopName,
  shopLogoUrl,
  onNavigate,
  onClose,
}) => {
  const story = stories[index];
  const hasPrev = index > 0;
  const hasNext = index < stories.length - 1;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1);
    },
    [index, hasPrev, hasNext, onNavigate, onClose]
  );

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); document.body.style.overflow = overflow; };
  }, [handleKey]);

  if (!story) return null;

  return createPortal(
    <FocusLock returnFocus>
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Story"
    >
      <button type="button" aria-label="Fechar visualizador de stories" className="absolute inset-0 cursor-default" onClick={onClose} />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
        aria-label="Fechar story"
      >
        <X size={22} />
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
          className="absolute left-2 sm:left-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Story anterior"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onNavigate(index + 1);
          }}
          className="absolute right-2 sm:right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Próximo story"
        >
          <ChevronRight size={22} />
        </button>
      )}

      <div
        className="relative w-full max-w-sm"
      >
        <div className="flex gap-1 mb-2" aria-hidden>
          {stories.map((s, i) => (
            <span
              key={s.id}
              className={`h-0.5 flex-1 rounded-full ${i === index ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 overflow-hidden flex items-center justify-center border border-white/30">
            {shopLogoUrl ? (
              <img src={shopLogoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-black text-white">{shopName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <p className="text-xs font-bold text-white truncate">{shopName}</p>
          <span className="text-[11px] text-white/60">{formatStoryTime(story.publishedAt ?? story.createdAt)}</span>
        </div>

        <div className="rounded-2xl overflow-hidden bg-black border border-white/10 max-h-[75vh] flex items-center justify-center">
          {story.videoUrl ? (
            <video src={story.videoUrl} poster={story.imageUrl} controls preload="metadata" className="max-h-[75vh] w-auto max-w-full object-contain" />
          ) : story.imageUrl ? (
            <img
              src={story.imageUrl}
              alt={story.title || 'Story'}
              className="max-h-[75vh] w-auto max-w-full object-contain"
            />
          ) : (
            <div className="p-8 text-sm text-white/80">{story.content}</div>
          )}
        </div>

        {story.content && (story.imageUrl || story.videoUrl) && (
          <p className="mt-2 text-xs text-white/80 leading-relaxed line-clamp-2">{story.content}</p>
        )}
      </div>
    </div>
    </FocusLock>, document.body
  );
};
