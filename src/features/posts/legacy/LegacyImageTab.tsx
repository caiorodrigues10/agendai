import React from 'react';
import { Button } from '../../../components/ui/Button';
import { PostPreviewBox } from '../PostPreviewBox';
import type { PostFormat, PostMedia } from '../../../infra/postsApi';
import type { PostTemplateDef } from '../../../infra/postsApi';
import { LuImagePlus as ImagePlus, LuTrash2 as Trash2, LuLoaderCircle as Loader2 } from 'react-icons/lu';

export interface LegacyImageTabProps {
  format: PostFormat;
  previewUrl: string | null;
  previewLoading: boolean;
  previewStale: boolean;
  selectedTemplate: PostTemplateDef | undefined;
  selectedPhotoMode: 'none' | 'optional' | 'required';
  templatesLoading: boolean;
  mediaLibrary: PostMedia[];
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  mediaLoading: boolean;
  mediaError: boolean;
  mediaBusy: boolean;
  onOpenMediaPicker: (slot: 'primary' | 'secondary') => void;
  onClearPrimary: () => void;
  onClearSecondary: () => void;
  onRetryMedia?: () => void;
  onShowTemplatesWithPhoto: () => void;
}

/** Aba "Imagem" do editor legado: slots de foto, exigência do modelo e preview. */
export function LegacyImageTab(props: LegacyImageTabProps) {
  const {
    format, previewUrl, previewLoading, previewStale, selectedTemplate, selectedPhotoMode,
    templatesLoading, mediaLibrary, primaryMediaId, secondaryMediaId, mediaLoading, mediaError,
    mediaBusy, onOpenMediaPicker, onClearPrimary, onClearSecondary, onRetryMedia,
    onShowTemplatesWithPhoto,
  } = props;

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <p className="text-xs font-bold text-text-secondary">Foto do post</p>
        {mediaError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3">
            <p className="text-xs font-semibold text-danger">Não foi possível carregar a biblioteca de fotos.</p>
            <Button variant="secondary" size="sm" onClick={() => onRetryMedia?.()} disabled={mediaLoading}>
              Tentar novamente
            </Button>
          </div>
        )}
        {selectedPhotoMode !== 'none' && (
          <div className="flex flex-wrap gap-3">
            {(['primary', 'secondary'] as const).map(slot => {
              if (slot === 'secondary' && (selectedTemplate?.requiredMedia ?? 0) < 2) return null;
              const mediaId = slot === 'primary' ? primaryMediaId : secondaryMediaId;
              const media = mediaLibrary.find(m => m.id === mediaId);
              const required = selectedPhotoMode === 'required' && (selectedTemplate?.requiredMedia ?? 0) >= (slot === 'primary' ? 1 : 2);
              if (mediaLoading && mediaId && !media) {
                return (
                  <div key={slot} aria-busy="true" aria-label="Carregando foto" className="flex h-36 w-40 animate-pulse flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-bg p-2">
                    <div className="h-20 w-full rounded bg-surface" />
                    <span className="text-[10px] text-text-muted">Carregando…</span>
                  </div>
                );
              }
              return (
                <button key={slot} type="button"
                  aria-label={slot === 'primary' ? 'Foto principal' : 'Foto secundária'}
                  onClick={() => onOpenMediaPicker(slot)}
                  className={`relative flex h-36 w-40 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed ${
                    media ? 'border-accent bg-accent/5' : required ? 'border-warning bg-warning/5' : 'border-border bg-bg'
                  } p-2 text-center transition hover:border-accent/50`}
                >
                  {media ? (
                    <>
                      <img src={media.url} alt="" className="h-20 w-full rounded object-cover" />
                      <span className="text-2xs font-semibold text-accent">Trocar foto</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={22} className="text-text-muted" aria-hidden />
                      <span className="text-2xs text-text-muted">
                        {slot === 'primary' ? 'Foto principal' : 'Foto secundária'}
                      </span>
                      {required
                        ? <span className="text-2xs font-bold text-warning">Requerida</span>
                        : <span className="text-2xs text-text-muted">Opcional</span>}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {(primaryMediaId || secondaryMediaId) && (
          <div className="flex flex-wrap gap-2">
            {primaryMediaId && (
              <Button variant="secondary" size="sm" onClick={onClearPrimary} disabled={mediaBusy}
                className="gap-1.5"
              >
                <Trash2 size={13} aria-hidden /> Remover foto principal
              </Button>
            )}
            {secondaryMediaId && (
              <Button variant="secondary" size="sm" onClick={onClearSecondary} disabled={mediaBusy}
                className="gap-1.5"
              >
                <Trash2 size={13} aria-hidden /> Remover foto secundária
              </Button>
            )}
          </div>
        )}
        {selectedPhotoMode === 'none' && (
          templatesLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg/50 p-4 text-xs text-text-muted">
              <Loader2 size={14} className="animate-spin" aria-hidden /> Carregando modelos…
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-bg/50 p-4">
              <p className="text-sm font-bold text-text-primary">Este modelo não usa foto</p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                A arte é composta apenas com tipografia e identidade do salão. Se preferir usar
                uma foto sua, troque por um modelo com foto.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={onShowTemplatesWithPhoto}
                className="mt-3 gap-1.5"
              >
                Ver modelos com foto
              </Button>
            </div>
          )
        )}
        {selectedPhotoMode === 'required' && (
          <p className="text-2xs text-text-muted">
            Este modelo requer {(selectedTemplate?.requiredMedia ?? 1)} foto(s) do seu salão.
          </p>
        )}
        {selectedPhotoMode === 'optional' && (
          selectedTemplate?.stockImageKey ? (
            <p className="text-2xs leading-relaxed text-text-muted">
              Foto opcional: envie uma imagem do seu salão ou deixe em branco para usarmos uma
              imagem ilustrativa gerada automaticamente. A imagem ilustrativa é apenas decorativa
              e <strong>não representa resultados do seu salão</strong>.
            </p>
          ) : (
            <p className="text-2xs leading-relaxed text-text-muted">
              Este modelo funciona com tipografia, sem foto. Se preferir, você pode enviar uma
              imagem do seu salão para compor a arte.
            </p>
          )
        )}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-0">
          <PostPreviewBox
            format={format}
            previewUrl={previewUrl}
            loading={previewLoading}
            stale={previewStale}
          />
        </div>
      </div>
    </div>
  );
}
