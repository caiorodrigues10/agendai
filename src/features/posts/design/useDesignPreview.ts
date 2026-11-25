import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../infra/apiClient';
import { postsApi, type DesignPreviewResult, type PreviewDesignPayload } from '../../../infra/postsApi';

export const DESIGN_PREVIEW_DEBOUNCE_MS = 280;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError' ||
    error instanceof Error && error.name === 'AbortError';
}

export function useDesignPreview(payload: PreviewDesignPayload | null) {
  const [previewState, setPreviewState] = useState<DesignPreviewResult | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  /** Um 404 significa que a feature foi desligada; outros erros são transitórios. */
  const [errorFeatureOffState, setErrorFeatureOff] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sequenceRef = useRef(0);
  /**
   * Payload da requisição já disparada. Enquanto o payload atual é diferente
   * dele, a prévia visível está "pendente" (debounce em curso). É estado (e
   * não ref) porque o valor é lido durante o render; a atualização acontece
   * dentro do timer, fora do corpo síncrono do efeito.
   */
  const [dispatchedPayload, setDispatchedPayload] = useState<PreviewDesignPayload | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    abortRef.current = null;
    const sequence = ++sequenceRef.current;

    // A última prévia continua visível enquanto a nova é gerada. O consumidor
    // a marca como "desatualizada" até a resposta nova substituir a imagem.
    if (!payload) {
      // Reset adiado (fora do corpo síncrono do efeito): evita render em
      // cascata e mantém o rascunho de design intacto.
      timerRef.current = setTimeout(() => {
        if (sequence !== sequenceRef.current) return;
        setDispatchedPayload(null);
        setPreviewState(null);
        setLoadingState(false);
        setErrorState(null);
        setErrorFeatureOff(false);
      }, 0);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    timerRef.current = setTimeout(async () => {
      setDispatchedPayload(payload);
      setErrorState(null);
      setErrorFeatureOff(false);
      setLoadingState(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const result = await postsApi.previewDesign(payload, controller.signal);
        if (sequence !== sequenceRef.current || controller.signal.aborted) return;
        setPreviewState(result);
      } catch (caught) {
        if (isAbortError(caught) || sequence !== sequenceRef.current) return;
        setErrorState(caught instanceof Error ? caught.message : 'Não foi possível gerar a prévia.');
        setErrorFeatureOff(caught instanceof ApiError && caught.statusCode === 404);
      } finally {
        if (sequence === sequenceRef.current) setLoadingState(false);
      }
    }, DESIGN_PREVIEW_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [payload, reloadTick]);

  // Sem payload não há prévia: o valor exposto é derivado, não sincronizado.
  const preview = payload === null ? null : previewState;
  const loading = payload === null ? false : loadingState;
  const error = payload === null ? null : errorState;
  const errorFeatureOff = payload === null ? false : errorFeatureOffState;
  const pending = payload !== null && dispatchedPayload !== payload;

  /** Repete a última prévia após um erro transitório. */
  const retry = () => setReloadTick(tick => tick + 1);

  return {
    preview,
    loading,
    error,
    errorFeatureOff,
    retry,
    stale: Boolean(preview) && (pending || loading || Boolean(error)),
  };
}
