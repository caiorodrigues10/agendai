import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { postsApi, type DesignCatalog } from '../../infra/postsApi';
import { ApiError } from '../../infra/apiClient';
import { getErrorMessage } from '../../utils/errorMessage';
import type { PostFormat } from '../../types';
import type { DesignAction } from './designReducer';
import type { EditorMode } from './postEditorShared';

/**
 * Catálogo do gerador (v3): carrega `/api/posts/designs` e decide o `editorMode`.
 *
 * O segmento e as restrições comerciais vêm do servidor. Posts legados
 * continuam no editor antigo. Um 404 significa feature off; erros
 * transitórios mantêm o modo de carregamento e oferecem retry para não
 * transformar uma falha de rede em um post legado por acidente.
 */
export function useDesignCatalog(args: {
  barbershopId: string;
  isEditing: boolean;
  savedDesignKey: string | undefined;
  savedDesignVersion: number | undefined;
  savedFormat: PostFormat | undefined;
  formatTouchedRef: { current: boolean };
  setFormat: Dispatch<SetStateAction<PostFormat>>;
  setEditorMode: Dispatch<SetStateAction<EditorMode>>;
  dispatchDesign: Dispatch<DesignAction>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const {
    barbershopId, isEditing, savedDesignKey, savedDesignVersion, savedFormat,
    formatTouchedRef, setFormat, setEditorMode, dispatchDesign, showToast,
  } = args;

  const [designCatalog, setDesignCatalog] = useState<DesignCatalog | null>(null);
  const [designCatalogError, setDesignCatalogError] = useState<string | null>(null);
  const [designCatalogRetry, setDesignCatalogRetry] = useState(0);

  useEffect(() => {
    if (!barbershopId || (isEditing && savedDesignKey === undefined)) return;
    let cancelled = false;
    postsApi.listDesigns(barbershopId)
      .then(catalog => {
        if (cancelled) return;
        setDesignCatalog(catalog);
        if (!catalog.designs.length) {
          setEditorMode(isEditing && savedDesignKey ? 'design-disabled' : 'legacy');
          return;
        }
        setEditorMode('design');
        if (!formatTouchedRef.current && !savedFormat) setFormat('portrait');
        if (savedDesignKey) {
          const saved = catalog.designs.find(design => design.key === savedDesignKey);
          if (saved && !savedDesignVersion) {
            dispatchDesign({
              type: 'select-design',
              designKey: saved.key,
              designVersion: saved.version,
            });
          } else if (!saved) {
            dispatchDesign({
              type: 'select-design',
              designKey: catalog.designs[0].key,
              designVersion: catalog.designs[0].version,
            });
          }
        } else {
          dispatchDesign({
            type: 'select-design',
            designKey: catalog.designs[0].key,
            designVersion: catalog.designs[0].version,
          });
        }
      })
      .catch(error => {
        if (cancelled) return;
        if (error instanceof ApiError && error.statusCode === 404) {
          setEditorMode(isEditing && savedDesignKey ? 'design-disabled' : 'legacy');
          return;
        }
        const message = getErrorMessage(error, 'Não foi possível carregar os novos estilos.');
        setDesignCatalogError(message);
        setEditorMode('checking');
        showToast(message, 'error');
      });
    return () => { cancelled = true; };
  }, [
    barbershopId,
    isEditing,
    savedDesignKey,
    savedDesignVersion,
    savedFormat,
    showToast,
    designCatalogRetry,
    formatTouchedRef,
    setFormat,
    setEditorMode,
    dispatchDesign,
  ]);

  /** Limpa o catálogo (ex.: feature desligada no meio do caminho). */
  const clearDesignCatalog = () => setDesignCatalog(null);

  /** Retry: limpa o erro atual (UI passa a mostrar o spinner) e recarrega. */
  const retryDesignCatalog = () => {
    setDesignCatalogError(null);
    setDesignCatalogRetry(value => value + 1);
  };

  return { designCatalog, designCatalogError, clearDesignCatalog, retryDesignCatalog };
}
