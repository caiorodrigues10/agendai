import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LuImagePlus as ImagePlus,
  LuImageOff as ImageOff,
  LuTrash2 as Trash2,
  LuLoaderCircle as Loader2,
} from 'react-icons/lu';
import { postsApi, type PostMedia } from '../../infra/postsApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/patterns/skeletons';
import { optimizeImageIfNeeded } from '../posts/optimizeImage';
import {
  POST_MEDIA_MAX_BYTES,
  mediaValidationErrorPT,
  validatePostMediaFile,
} from '../posts/postMediaValidation';

/** Limite de fotos na galeria pública (espelha `GALLERY_MAX_PHOTOS` do backend). */
const GALLERY_MAX_PHOTOS = 30;

interface GalleryPhotoGridProps {
  photos: PostMedia[];
  disabled?: boolean;
  onDelete: (photo: PostMedia) => void;
}

/** Grade da galeria (mais recentes primeiro). */
const GalleryPhotoGrid: React.FC<GalleryPhotoGridProps> = ({ photos, disabled, onDelete }) => (
  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
    {photos.map(photo => (
      <li key={photo.id} className="group relative overflow-hidden rounded-xl border border-border bg-bg">
        <img
          src={photo.url}
          alt="Foto da galeria do perfil"
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
        <button
          type="button"
          onClick={() => onDelete(photo)}
          disabled={disabled}
          className="absolute bottom-1 right-1 rounded-lg bg-black/60 p-1 text-white transition hover:bg-black/80 disabled:opacity-40"
          aria-label="Remover foto da galeria"
        >
          <Trash2 size={12} aria-hidden />
        </button>
      </li>
    ))}
  </ul>
);

/** Estado vazio da galeria (o botão "Enviar fotos" fica no topo da tela). */
const GalleryEmptyState: React.FC = () => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-10 text-center">
    <ImageOff size={28} className="text-text-muted" aria-hidden />
    <p className="text-sm font-bold text-text-primary">Envie a primeira foto do seu salão</p>
    <p className="text-xs text-text-muted">
      As fotos enviadas aqui aparecem na aba Fotos do seu perfil.
    </p>
  </div>
);

/**
 * Área exclusiva do dono para subir as fotos da galeria do perfil (aba "Fotos"
 * do perfil público). O editor de posts é independente: as fotos dele vão com
 * `inGallery: false` e nunca aparecem no perfil.
 */
export const GalleryManager: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [photos, setPhotos] = useState<PostMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostMedia | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const load = useCallback(() => {
    if (!barbershopId) return Promise.resolve();
    // Só a galeria do perfil (inGallery=true), mais recentes primeiro.
    return postsApi.listMedia(barbershopId, { inGallery: true }).then(
      data => {
        setPhotos(data);
        setLoadError(false);
        setLoading(false);
      },
      () => {
        setLoadError(true);
        setLoading(false);
      }
    );
  }, [barbershopId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRetry = () => {
    setLoading(true);
    void load();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length || !barbershopId || uploading) return;
    setUploading(true);
    const uploaded: PostMedia[] = [];
    const errors: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        const label = files.length > 1 ? `${index + 1} de ${files.length}` : null;
        let candidate = file;
        if (file.size > POST_MEDIA_MAX_BYTES) {
          setProgress(label ? `Otimizando foto ${label}…` : 'Otimizando foto…');
          candidate = await optimizeImageIfNeeded(file);
        }
        setProgress(label ? `Enviando ${label}…` : 'Enviando foto…');
        const validation = await validatePostMediaFile(candidate);
        if (validation.error) {
          const reason = mediaValidationErrorPT(validation.error, validation);
          errors.push(files.length > 1 ? `${file.name}: ${reason}` : reason);
          continue;
        }
        try {
          const media = await postsApi.uploadMedia(barbershopId, candidate, { inGallery: true });
          uploaded.push(media);
          setPhotos(prev => [media, ...prev]);
        } catch (err) {
          // Galeria cheia: o back responde 400 com a mensagem do limite.
          const reason = getErrorMessage(err, 'Não foi possível enviar a foto.');
          errors.push(files.length > 1 ? `${file.name}: ${reason}` : reason);
        }
      }
    } finally {
      setUploading(false);
      setProgress(null);
    }
    if (uploaded.length > 0) {
      showToast(
        uploaded.length === 1
          ? 'Foto enviada para a galeria do perfil.'
          : `${uploaded.length} fotos enviadas para a galeria do perfil.`
      );
    }
    // Mensagens repetidas (ex.: galeria cheia em vários arquivos) aparecem uma vez.
    const uniqueErrors = Array.from(new Set(errors));
    if (uniqueErrors.length === 1) {
      showToast(uniqueErrors[0], 'error');
    } else if (uniqueErrors.length > 1) {
      showToast(uniqueErrors.slice(0, 3).map((msg, i) => `${i + 1}) ${msg}`).join(' '), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await postsApi.deleteMedia(deleteTarget.id);
      setPhotos(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('Foto removida da galeria do perfil.');
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível remover a foto.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-lg font-bold text-text-primary">Galeria do perfil</h2>
        <p className="text-xs text-text-muted">
          As fotos enviadas aqui aparecem na aba Fotos do seu perfil.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-text-secondary">
          {photos.length} de {GALLERY_MAX_PHOTOS} fotos
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2 text-xs"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden /> {progress ?? 'Enviando…'}
            </>
          ) : (
            <>
              <ImagePlus size={14} aria-hidden /> Enviar fotos
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={e => void handleUpload(e)}
        />
      </div>

      {uploading && (
        <p role="status" className="text-center text-[11px] text-text-muted">
          {progress ?? 'Enviando foto…'}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4" role="status" aria-busy="true" aria-label="Carregando fotos">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width="100%" height="8rem" />
          ))}
        </div>
      ) : loadError ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-danger/40 bg-danger/10 p-6 text-center">
          <p className="text-sm font-semibold text-danger">Não foi possível carregar a galeria do perfil.</p>
          <Button variant="secondary" size="sm" onClick={handleRetry}>
            Tentar novamente
          </Button>
        </div>
      ) : photos.length === 0 ? (
        <GalleryEmptyState />
      ) : (
        <GalleryPhotoGrid photos={photos} disabled={deleting} onDelete={setDeleteTarget} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remover foto"
        message="A foto será removida da galeria do perfil público. Continuar?"
        confirmLabel="Remover"
        variant="danger"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
};
