import React from 'react';
import { LuLoaderCircle as Loader2, LuMegaphone as Megaphone } from 'react-icons/lu';
import type { PostFormat } from '../../types';

const FORMAT_ASPECT: Record<PostFormat, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  story: 'aspect-[9/16]',
};

const FORMAT_MAX_HEIGHT: Record<PostFormat, string> = {
  square: 'max-h-[480px]',
  portrait: 'max-h-[600px]',
  story: 'max-h-[540px]',
};

interface PostPreviewBoxProps {
  format: PostFormat;
  previewUrl: string | null;
  loading?: boolean;
  stale?: boolean;
  error?: boolean;
  emptyLabel?: string;
  className?: string;
}

export const PostPreviewBox: React.FC<PostPreviewBoxProps> = ({
  format,
  previewUrl,
  loading = false,
  stale = false,
  error = false,
  emptyLabel = 'Aguardando informações…',
  className = '',
}) => {
  const aspectClass = FORMAT_ASPECT[format] ?? FORMAT_ASPECT.square;
  const maxH = FORMAT_MAX_HEIGHT[format] ?? FORMAT_MAX_HEIGHT.square;

  return (
    <div className={`${aspectClass} ${maxH} w-full overflow-hidden rounded-2xl border border-border bg-bg ${className}`}>
      {loading && !previewUrl ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 size={28} className="animate-spin text-accent" aria-hidden />
        </div>
      ) : error && !previewUrl ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-text-muted">
          <Megaphone size={28} aria-hidden />
          <p className="text-xs">Erro ao gerar prévia.</p>
        </div>
      ) : previewUrl ? (
        <div className="relative h-full w-full">
          <img
            src={previewUrl}
            alt="Prévia do post"
            className="h-full w-full object-contain"
          />
          {stale && (
            <span className="absolute right-2 top-2 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning">
              Desatualizada
            </span>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-text-muted">
          <Megaphone size={28} aria-hidden />
          <p className="text-xs">{emptyLabel}</p>
        </div>
      )}
    </div>
  );
};
