import React, { useRef } from 'react';
import FocusLock from 'react-focus-lock';
import { Button } from '../../../components/ui/Button';
import type { PostMedia } from '../../../infra/postsApi';
import { POST_MEDIA_FORMAT_HINT, POST_MEDIA_MAX_BYTES, POST_MEDIA_MIN_SIDE } from '../postMediaValidation';
import { LuImagePlus as ImagePlus, LuImageOff as ImageOff, LuLoaderCircle as Loader2, LuCheck as Check, LuTrash2 as Trash2 } from 'react-icons/lu';

export interface MediaPickerOverlayProps {
  slot: 'primary' | 'secondary';
  mediaLibrary: PostMedia[];
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  mediaLoading: boolean;
  mediaError: boolean;
  uploadingPhoto: boolean;
  uploadProgress: string | null;
  deletingMedia: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRequestDelete: (media: PostMedia) => void;
  onRetryMedia?: () => void;
}

/** Overlay "Escolher foto" do editor legado: biblioteca, upload e exclusão. */
export function MediaPickerOverlay(props: MediaPickerOverlayProps) {
  const {
    slot, mediaLibrary, primaryMediaId, secondaryMediaId, mediaLoading, mediaError,
    uploadingPhoto, uploadProgress, deletingMedia, onClose, onSelect, onUpload,
    onRequestDelete, onRetryMedia,
  } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedId = slot === 'primary' ? primaryMediaId : secondaryMediaId;
  const otherSlotId = slot === 'primary' ? secondaryMediaId : primaryMediaId;

  return (
    <div className="absolute inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar seletor de fotos"
        disabled={uploadingPhoto}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/80 disabled:cursor-wait"
      />
      <FocusLock returnFocus className="relative w-full max-w-lg">
        <div role="dialog" aria-modal="true" aria-labelledby="media-picker-title"
          className="w-full max-w-lg rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h4 id="media-picker-title" className="text-sm font-bold text-text-primary">Escolher foto</h4>
            <button type="button" onClick={onClose} disabled={uploadingPhoto} className="rounded-lg p-1 text-text-muted hover:bg-bg disabled:opacity-40" aria-label="Fechar">
              ✕
            </button>
          </div>
          <div className="max-h-[min(70dvh,28rem)] overflow-y-auto p-4">
            {mediaLoading ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="status" aria-busy="true" aria-label="Carregando fotos">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-xl bg-surface" />
                ))}
              </div>
            ) : mediaError ? (
              <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm font-semibold text-text-secondary">Não foi possível carregar a biblioteca de fotos.</p>
                <Button variant="secondary" size="sm" onClick={() => onRetryMedia?.()}>
                  Tentar novamente
                </Button>
              </div>
            ) : mediaLibrary.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <ImageOff size={28} className="text-text-muted" aria-hidden />
                <p className="text-sm font-bold text-text-primary">Envie a primeira foto do seu salão</p>
                <p className="text-xs text-text-muted">
                  {POST_MEDIA_FORMAT_HINT} · até {Math.round(POST_MEDIA_MAX_BYTES / (1024 * 1024))} MB · mínimo {POST_MEDIA_MIN_SIDE}px
                </p>
                <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="mt-2 gap-1.5">
                  <ImagePlus size={14} aria-hidden /> Enviar foto
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {mediaLibrary.map((m, index) => {
                  const isSelected = selectedId === m.id;
                  const usedInOtherSlot = m.id === otherSlotId;
                  return (
                    <div key={m.id} className="relative">
                      <button
                        type="button"
                        disabled={uploadingPhoto || usedInOtherSlot}
                        aria-label={`Foto ${index + 1}`}
                        aria-pressed={isSelected}
                        title={usedInOtherSlot
                          ? (slot === 'primary' ? 'Já usada na foto secundária' : 'Já usada na foto principal')
                          : undefined}
                        onClick={() => onSelect(m.id)}
                        className={`relative block aspect-square w-full overflow-hidden rounded-xl border-2 disabled:opacity-50 ${
                          isSelected ? 'border-accent' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={m.url}
                          alt={`Foto ${index + 1} da biblioteca`}
                          className="h-full w-full object-cover"
                        />
                        {usedInOtherSlot && (
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white">
                            Em uso
                          </span>
                        )}
                      </button>
                      {isSelected && (
                        <span className="pointer-events-none absolute right-1 top-1 rounded-full bg-accent p-0.5 text-accent-fg">
                          <Check size={11} aria-hidden />
                        </span>
                      )}
                      {!usedInOtherSlot && (
                        <button
                          type="button"
                          disabled={uploadingPhoto || deletingMedia}
                          onClick={() => onRequestDelete(m)}
                          className="absolute bottom-1 right-1 rounded-lg bg-black/60 p-1 text-white transition hover:bg-black/80 disabled:opacity-40"
                          aria-label={`Remover foto ${index + 1} da biblioteca`}
                        >
                          <Trash2 size={12} aria-hidden />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="border-t border-border p-4">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onUpload} />
            <Button variant="primary" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
              className="w-full gap-2 text-xs"
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 size={15} className="animate-spin" aria-hidden /> {uploadProgress ?? 'Enviando foto…'}
                </>
              ) : (
                <>
                  <ImagePlus size={15} aria-hidden /> Enviar nova foto
                </>
              )}
            </Button>
            {uploadingPhoto && (
              <p role="status" className="mt-2 text-center text-[10px] text-text-muted">{uploadProgress ?? 'Enviando foto…'}</p>
            )}
            <p className="mt-2 text-center text-[10px] text-text-muted">
              Para publicar fotos no perfil do salão, use a aba Galeria do perfil.
            </p>
          </div>
        </div>
      </FocusLock>
    </div>
  );
}
