import { useCallback, useEffect, useRef, useState } from 'react';
import { postsApi } from '../../infra/postsApi';
import type { LegacyPreviewState } from './postEditorShared';
import type { EditorMode } from './postEditorShared';

const PREVIEW_DEBOUNCE_MS = 500;

/**
 * Prévia do editor legado (`GET /api/posts/preview`).
 *
 * Debounce de 500 ms + `AbortController` para cancelar requisições obsoletas e
 * um contador de sequência que descarta respostas fora de ordem (uma resposta
 * antiga nunca sobrescreve um estado mais novo).
 */
export function useLegacyPreview(args: {
  barbershopId: string;
  editorMode: EditorMode;
  initialUrl: string | null;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  live: LegacyPreviewState;
}) {
  const { barbershopId, editorMode, initialUrl, showToast } = args;
  const {
    templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId,
    postMode, type, priceSplit,
  } = args.live;

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [previewStale, setPreviewStale] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);
  const previewSeqRef = useRef(0);
  const liveRef = useRef<LegacyPreviewState>({
    templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId,
    postMode, type, priceSplit: undefined,
  });

  const triggerPreview = useCallback(() => {
    if (!barbershopId || editorMode !== 'legacy') return;
    setPreviewStale(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    previewAbortRef.current?.abort();
    const controller = new AbortController();
    previewAbortRef.current = controller;
    debounceRef.current = setTimeout(async () => {
      const snap = liveRef.current;
      const seq = ++previewSeqRef.current;
      setPreviewLoading(true);
      try {
        const url = await postsApi.preview(barbershopId, {
          postMode: snap.postMode,
          type: snap.type,
          title: snap.title || undefined,
          ctaText: snap.ctaText || undefined,
          templateKey: snap.templateKey,
          format: snap.format,
          paletteKey: snap.paletteKey,
          primaryMediaId: snap.primaryMediaId,
          secondaryMediaId: snap.secondaryMediaId,
          priceSplit: snap.priceSplit,
          signal: controller.signal,
        });
        const cur = liveRef.current;
        // Ignora respostas fora de ordem e qualquer mudança de estado posterior,
        // incluindo postMode/type.
        if (
          seq !== previewSeqRef.current ||
          cur.templateKey !== snap.templateKey ||
          cur.paletteKey !== snap.paletteKey ||
          cur.format !== snap.format ||
          cur.title !== snap.title ||
          cur.ctaText !== snap.ctaText ||
          cur.primaryMediaId !== snap.primaryMediaId ||
          cur.secondaryMediaId !== snap.secondaryMediaId ||
          cur.postMode !== snap.postMode ||
          cur.type !== snap.type ||
          cur.priceSplit !== snap.priceSplit
        ) {
          return;
        }
        setPreviewUrl(url);
        setPreviewStale(false);
      } catch (error) {
        if (
          seq !== previewSeqRef.current ||
          controller.signal.aborted ||
          (error instanceof Error && error.name === 'AbortError')
        ) return;
        showToast('Não foi possível gerar a prévia.', 'error');
        setPreviewStale(true);
      } finally {
        if (seq === previewSeqRef.current) setPreviewLoading(false);
      }
    }, PREVIEW_DEBOUNCE_MS);
  }, [barbershopId, editorMode, showToast]);

  useEffect(() => {
    liveRef.current = {
      templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId,
      postMode, type, priceSplit,
    };
    triggerPreview();
  }, [
    templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId,
    postMode, type, priceSplit, triggerPreview,
  ]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    previewAbortRef.current?.abort();
    // Invalida qualquer preview em voo ao desmontar.
    previewSeqRef.current += 1;
  }, []);

  return { previewUrl, previewStale, previewLoading };
}
