import { useEffect } from 'react';
import type { PostMedia } from '../../infra/postsApi';

/**
 * Reconciliação da biblioteca: rascunho/post podem guardar um mediaId que já
 * não existe na biblioteca (ex.: foto excluída em outra sessão). Quando a
 * lista está pronta (sem loading/erro), limpa o id órfão e avisa.
 */
export function useMediaReconcile(args: {
  mediaLibrary: PostMedia[];
  mediaLoading: boolean;
  mediaError: boolean;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  clearPrimaryMedia: () => void;
  clearSecondaryMedia: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const {
    mediaLibrary, mediaLoading, mediaError, primaryMediaId, secondaryMediaId,
    clearPrimaryMedia, clearSecondaryMedia, showToast,
  } = args;

  useEffect(() => {
    if (mediaLoading || mediaError) return;
    const orphanPrimary = primaryMediaId && !mediaLibrary.some(m => m.id === primaryMediaId);
    const orphanSecondary = secondaryMediaId && !mediaLibrary.some(m => m.id === secondaryMediaId);
    if (!orphanPrimary && !orphanSecondary) return;
    if (orphanPrimary) clearPrimaryMedia();
    if (orphanSecondary) clearSecondaryMedia();
    showToast('A foto selecionada não está mais disponível.', 'error');
  }, [
    mediaLibrary, mediaLoading, mediaError, primaryMediaId, secondaryMediaId, showToast,
    clearPrimaryMedia, clearSecondaryMedia,
  ]);
}
