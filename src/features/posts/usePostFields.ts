import { useCallback, useRef, useState } from 'react';
import { OBJECTIVES, type ObjectiveId, type PostType } from './objectives';
import { defaultFormatFor, type EditorTab, type LocalDraftPayload } from './postEditorShared';
import type { PostTemplateDef } from '../../infra/postsApi';
import type { FeedPost, PostFormat, PostMode } from '../../types';

/**
 * Campos do post compartilhados entre o gerador de designs (v3) e o editor
 * legado. O formato tem trava manual (`formatTouched`): a escolha do usuário
 * sempre prevalece sobre o default do catálogo.
 */
export function usePostFields(args: {
  draft: LocalDraftPayload | null;
  post: FeedPost | null;
  templates: PostTemplateDef[];
  onTabChange: (tab: EditorTab) => void;
}) {
  const { draft, post, templates, onTabChange } = args;

  const [objectiveId, setObjectiveId] = useState<ObjectiveId | null>(draft?.objectiveId ?? null);
  const [templateKey, setTemplateKey] = useState(draft?.templateKey ?? post?.templateKey ?? 'agenda-aberta');
  const [paletteKey, setPaletteKey] = useState(draft?.paletteKey ?? post?.paletteKey ?? 'brand');
  const [format, setFormat] = useState<PostFormat>(
    draft?.format ?? post?.format ?? defaultFormatFor(draft?.templateKey ?? post?.templateKey ?? 'agenda-aberta')
  );
  /** Formato escolhido à mão no card "Formato" — trava o default automático. */
  const [formatTouched, setFormatTouched] = useState(
    draft?.formatTouched ?? Boolean(post?.format),
  );
  const formatTouchedRef = useRef(formatTouched);
  const [postMode, setPostMode] = useState<PostMode>(draft?.postMode ?? post?.postMode ?? 'both');
  const [type, setType] = useState<PostType>(draft?.type ?? post?.type ?? 'haircut');
  const [title, setTitle] = useState(draft?.title ?? post?.title ?? '');
  const [ctaText, setCtaText] = useState(draft?.ctaText ?? post?.ctaText ?? '');
  const [content, setContent] = useState(draft?.content ?? post?.content ?? '');
  const [primaryMediaId, setPrimaryMediaId] = useState<string | null>(
    draft?.primaryMediaId ?? post?.primaryMediaId ?? null,
  );
  const [secondaryMediaId, setSecondaryMediaId] = useState<string | null>(
    draft?.secondaryMediaId ?? post?.secondaryMediaId ?? null,
  );

  const updateFormat = useCallback((nextFormat: PostFormat, manual = true) => {
    setFormat(nextFormat);
    setFormatTouched(manual);
    formatTouchedRef.current = manual;
  }, []);

  const clearPrimaryMedia = useCallback(() => setPrimaryMediaId(null), []);
  const clearSecondaryMedia = useCallback(() => setSecondaryMediaId(null), []);

  /** Default do formato: `defaultFormat` do catálogo (fonte única) + fallback local. */
  const defaultFormatOf = useCallback(
    (key: string): PostFormat =>
      templates.find(t => t.key === key)?.defaultFormat ?? defaultFormatFor(key),
    [templates],
  );

  /** Troca de modelo: aplica o formato padrão só quando o usuário não escolheu. */
  const applyTemplate = useCallback((key: string) => {
    setTemplateKey(key);
    if (!formatTouched) setFormat(defaultFormatOf(key));
  }, [formatTouched, defaultFormatOf]);

  const pickObjective = useCallback((id: ObjectiveId) => {
    const obj = OBJECTIVES.find(o => o.id === id);
    if (!obj) return;
    setObjectiveId(id);
    applyTemplate(obj.templateKey);
    setType(obj.type);
    onTabChange('content');
  }, [applyTemplate, onTabChange]);

  return {
    objectiveId,
    templateKey,
    paletteKey,
    format,
    formatTouched,
    formatTouchedRef,
    postMode,
    type,
    title,
    ctaText,
    content,
    primaryMediaId,
    secondaryMediaId,
    updateFormat,
    clearPrimaryMedia,
    clearSecondaryMedia,
    applyTemplate,
    pickObjective,
    setObjectiveId,
    setTemplateKey,
    setPaletteKey,
    setFormat,
    setPostMode,
    setType,
    setTitle,
    setCtaText,
    setContent,
    setPrimaryMediaId,
    setSecondaryMediaId,
  };
}
