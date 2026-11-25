import { useState } from 'react';
import { postsApi, type PostMedia } from '../../infra/postsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import type { DesignEditorState } from './designReducer';

/**
 * Exclusão da foto da biblioteca. Se o id estiver em uso neste
 * rascunho/edição, limpa o slot. O back bloqueia (409) fotos usadas em outros
 * posts não publicados; em posts publicados a arte já materializada permanece.
 */
export function useMediaDelete(args: {
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  designState: DesignEditorState;
  clearBackground: () => void;
  setPrimaryMediaId: (id: string | null) => void;
  setSecondaryMediaId: (id: string | null) => void;
  onMediaRemoved?: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const {
    primaryMediaId, secondaryMediaId, designState, clearBackground,
    setPrimaryMediaId, setSecondaryMediaId, onMediaRemoved, showToast,
  } = args;

  const [deleteTarget, setDeleteTarget] = useState<PostMedia | null>(null);
  const [deletingMedia, setDeletingMedia] = useState(false);

  const handleDeleteMedia = async () => {
    if (!deleteTarget || deletingMedia) return;
    setDeletingMedia(true);
    try {
      await postsApi.deleteMedia(deleteTarget.id);
      if (primaryMediaId === deleteTarget.id) setPrimaryMediaId(null);
      if (secondaryMediaId === deleteTarget.id) setSecondaryMediaId(null);
      if (
        designState.designOverrides.background?.kind === 'photo' &&
        designState.designOverrides.background.url === deleteTarget.url
      ) {
        clearBackground();
      }
      onMediaRemoved?.(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Foto removida da biblioteca.');
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível remover a foto.'), 'error');
    } finally {
      setDeletingMedia(false);
    }
  };

  return { deleteTarget, setDeleteTarget, deletingMedia, handleDeleteMedia };
}
