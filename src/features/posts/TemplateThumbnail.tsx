/* eslint-disable jsx-a11y/no-redundant-roles -- botão de retry usa papel nativo */
import React, { useEffect, useRef, useState } from 'react';
import { LuRefreshCw as RefreshCw } from 'react-icons/lu';
import { postsApi } from '../../infra/postsApi';
import type { PostFormat } from '../../types';

interface TemplateThumbnailProps {
  barbershopId: string;
  templateKey: string;
  format: PostFormat;
  paletteKey: string;
  /** Aplica paleta padrão da marca quando o card não quer variar por paleta. */
  alt: string;
  className?: string;
}

type Status = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Miniatura de modelo: gera a prévia real via postsApi.preview (endpoint
 * autenticado que retorna JSON { imageUrl }) somente quando o card fica
 * visível no viewport. Nunca usa previewUrl do catálogo como <img src>.
 */
export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  barbershopId,
  templateKey,
  format,
  paletteKey,
  alt,
  className = '',
}) => {
  const [status, setStatus] = useState<Status>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const seq = ++seqRef.current;
    setStatus('loading');
    postsApi.preview(barbershopId, { templateKey, format, paletteKey })
      .then(imageUrl => {
        if (seq !== seqRef.current) return;
        setUrl(imageUrl);
        setStatus('loaded');
      })
      .catch(() => {
        if (seq !== seqRef.current) return;
        setStatus('error');
      });
    return () => { seqRef.current += 1; };
  }, [visible, barbershopId, templateKey, format, paletteKey, attempt]);

  const retry = () => {
    seqRef.current += 1; // invalida tentativa anterior
    setStatus('idle');
    setUrl(null);
    setAttempt(value => value + 1);
  };

  return (
    <div ref={rootRef} className={`relative ${format === 'story' ? 'aspect-[9/16]' : format === 'square' ? 'aspect-square' : 'aspect-[4/5]'} w-full overflow-hidden bg-bg ${className}`}>
      {status === 'loaded' && url ? (
        <img src={url} alt={alt} className="h-full w-full object-contain" loading="lazy" />
      ) : status === 'error' ? (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); retry(); }}
          className="relative z-20 flex h-full w-full flex-col items-center justify-center gap-1 text-text-muted hover:text-accent"
          aria-label="Tentar carregar prévia novamente"
        >
          <RefreshCw size={16} aria-hidden />
          <span className="text-[9px] font-semibold">Tentar novamente</span>
        </button>
      ) : (
        <div className="h-full animate-pulse bg-surface-2 p-4">
          <div className="h-2 w-2/3 rounded bg-border" /><div className="my-5 h-1/2 rounded bg-border/50" /><div className="h-3 w-3/4 rounded bg-border" />
          <span className="sr-only">Carregando prévia…</span>
        </div>
      )}
    </div>
  );
};
