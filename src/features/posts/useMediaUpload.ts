import { useState, type ChangeEvent } from 'react';
import { postsApi, type PostMedia } from '../../infra/postsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { optimizeImageIfNeeded } from './optimizeImage';
import {
  mediaValidationErrorPT,
  POST_MEDIA_MAX_BYTES,
  validatePostMediaFile,
} from './postMediaValidation';

export type MediaSlot = 'primary' | 'secondary';

/**
 * Upload de fotos da biblioteca (editor legado). Mantém o progresso, valida
 * cada arquivo e reporta falhas por arquivo sem abortar os demais.
 */
export function useMediaUpload(args: {
  barbershopId: string;
  target: MediaSlot | null;
  onUploaded: (media: PostMedia) => void;
  onSelectPrimary: (id: string) => void;
  onSelectSecondary: (id: string) => void;
  onClosePicker: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const {
    barbershopId, target, onUploaded, onSelectPrimary, onSelectSecondary,
    onClosePicker, showToast,
  } = args;

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length || !barbershopId || uploadingPhoto) return;
    setUploadingPhoto(true);
    const uploaded: PostMedia[] = [];
    const errors: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        const progressLabel = files.length > 1 ? `${index + 1} de ${files.length}` : null;
        let candidate = file;
        if (file.size > POST_MEDIA_MAX_BYTES) {
          setUploadProgress(progressLabel ? `Otimizando foto ${progressLabel}…` : 'Otimizando foto…');
          candidate = await optimizeImageIfNeeded(file);
        }
        setUploadProgress(progressLabel ? `Enviando ${progressLabel}…` : 'Enviando foto…');
        const validation = await validatePostMediaFile(candidate);
        if (validation.error) {
          const reason = mediaValidationErrorPT(validation.error, validation);
          errors.push(files.length > 1 ? `${file.name}: ${reason}` : reason);
          continue;
        }
        try {
          const media = await postsApi.uploadMedia(barbershopId, candidate, { inGallery: false });
          uploaded.push(media);
          onUploaded(media);
        } catch (err) {
          const reason = getErrorMessage(err, 'Não foi possível enviar a imagem.');
          errors.push(files.length > 1 ? `${file.name}: ${reason}` : reason);
        }
      }
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(null);
    }
    // Auto-seleciona no slot somente quando um único arquivo foi enviado.
    if (uploaded.length === 1 && files.length === 1) {
      if (target === 'primary') onSelectPrimary(uploaded[0].id);
      else if (target === 'secondary') onSelectSecondary(uploaded[0].id);
      onClosePicker();
      showToast('Imagem adicionada à biblioteca.');
    } else if (uploaded.length > 0) {
      showToast(
        uploaded.length === 1
          ? '1 foto enviada à biblioteca. Toque em uma foto para usá-la.'
          : `${uploaded.length} fotos enviadas à biblioteca. Toque em uma foto para usá-la.`
      );
    }
    // Resumo das falhas: continua as demais e lista o que falhou e por quê.
    if (errors.length === 1 && files.length === 1) {
      showToast(errors[0], 'error');
    } else if (errors.length > 0) {
      const listed = errors.slice(0, 3).map((msg, i) => `${i + 1}) ${msg}`).join(' ');
      const extraCount = errors.length - 3;
      showToast(
        `${errors.length} de ${files.length} fotos não foram enviadas. ${listed}${extraCount > 0 ? ` (+${extraCount} mais)` : ''}`,
        'error'
      );
    }
  };

  return { uploadingPhoto, uploadProgress, handleUpload };
}
