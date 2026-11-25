import { useEffect, useMemo, useState } from 'react';
import { postsApi, type PostTemplateDef } from '../../infra/postsApi';
import { groupLabel, templatePhotoMode, type TemplateFilter } from './postEditorShared';

export interface TemplateGroup {
  key: string;
  label: string;
}

/**
 * Catálogo de modelos do editor legado (`GET /api/posts/templates` é a fonte
 * única). `postsApi.templates()` nunca recebe `barbershopId`: o catálogo é
 * compartilhado por todos os salões.
 */
export function usePostTemplates(args: {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const { showToast } = args;

  const [templates, setTemplates] = useState<PostTemplateDef[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setTemplatesLoading(true);
    postsApi.templates()
      .then(list => { if (!cancelled) setTemplates(list); })
      .catch(() => { if (!cancelled) showToast('Não foi possível carregar os modelos.', 'error'); })
      .finally(() => { if (!cancelled) setTemplatesLoading(false); });
    return () => { cancelled = true; };
  }, [showToast]);

  return { templates, templatesLoading };
}

/** Derivações do catálogo usadas pelas abas e pelo seletor de modelo. */
export function useTemplateSelection(args: {
  templates: PostTemplateDef[];
  templateKey: string;
  templateFilter: TemplateFilter;
}) {
  const { templates, templateKey, templateFilter } = args;

  const selectedTemplate = useMemo(
    () => templates.find(t => t.key === templateKey),
    [templates, templateKey],
  );

  const templateGroups = useMemo(() => {
    const seen = new Map<string, string>();
    for (const t of templates) {
      const g = t.group ?? 'outros';
      if (!seen.has(g)) seen.set(g, groupLabel(g));
    }
    return Array.from(seen, ([key, label]) => ({ key, label }));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (templateFilter === 'all') return templates;
    return templates.filter(t =>
      templateFilter === 'with-photo' ? templatePhotoMode(t) !== 'none' : templatePhotoMode(t) === 'none'
    );
  }, [templates, templateFilter]);

  return { selectedTemplate, templateGroups, filteredTemplates };
}
