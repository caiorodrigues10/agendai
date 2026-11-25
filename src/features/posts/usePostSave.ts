import { useState } from 'react';
import { postsApi, type PostTemplateDef } from '../../infra/postsApi';
import { ApiError } from '../../infra/apiClient';
import { clearDraft } from './draftStorage';
import { designContentPayload, designOverridesPayload, type DesignEditorState } from './designReducer';
import { getErrorMessage } from '../../utils/errorMessage';
import type { EditorMode, EditorTab } from './postEditorShared';
import type { FeedPost, PostFormat, PostMode, PriceSplitPayload } from '../../types';
import type { PostType } from './objectives';

type SaveAction = 'draft' | 'publish';

/** Resultado de uma validação que falhou: mensagem + aba a focar (opcional). */
interface ValidationFailure {
  message: string;
  tab?: EditorTab;
}

/** Pré-condições do editor legado antes de publicar/salvar. */
function validateLegacySave(args: {
  action: SaveAction;
  selectedTemplate: PostTemplateDef | undefined;
  templatesLoading: boolean;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  priceSplitPayload: PriceSplitPayload | undefined;
}): ValidationFailure | null {
  const { action, selectedTemplate, templatesLoading, primaryMediaId, secondaryMediaId, priceSplitPayload } = args;
  if (action !== 'draft' && (!selectedTemplate || templatesLoading)) {
    return { message: 'Aguarde o carregamento e selecione um modelo.' };
  }
  if (action !== 'draft' && selectedTemplate && (
    (selectedTemplate.requiredMedia >= 1 && !primaryMediaId) ||
    (selectedTemplate.requiredMedia >= 2 && !secondaryMediaId)
  )) {
    return { message: 'Adicione as fotos exigidas pelo modelo antes de publicar.', tab: 'image' };
  }
  if (action !== 'draft' && priceSplitPayload && !priceSplitPayload.items.length) {
    return { message: 'Adicione ao menos um serviço à lista de preços.', tab: 'content' };
  }
  return null;
}

/** Pré-condições gerais (modo + estilo + legado) antes de enviar. */
function validateSave(args: {
  editorMode: EditorMode;
  designState: DesignEditorState;
  action: SaveAction;
  selectedTemplate: PostTemplateDef | undefined;
  templatesLoading: boolean;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  priceSplitPayload: PriceSplitPayload | undefined;
}): ValidationFailure | null {
  const { editorMode, designState, action, selectedTemplate, templatesLoading, primaryMediaId, secondaryMediaId, priceSplitPayload } = args;
  if (editorMode === 'checking') {
    return { message: 'Aguarde o carregamento dos estilos.' };
  }
  const isDesignSave = editorMode === 'design';
  const isDesignDisabled = editorMode === 'design-disabled';
  if (isDesignSave && (!designState.designKey || !designState.designVersion)) {
    return { message: 'Selecione um estilo antes de salvar.' };
  }
  if (!isDesignSave && !isDesignDisabled) {
    return validateLegacySave({ action, selectedTemplate, templatesLoading, primaryMediaId, secondaryMediaId, priceSplitPayload });
  }
  return null;
}

/**
 * Cria ou atualiza o post conforme o modo e devolve o id salvo.
 * `design` (gerador v3), `design-disabled` (só a legenda muda) e `legacy`
 * seguem contratos diferentes de payload — o backend rejeita campos de
 * design quando o salão não está na allowlist.
 */
async function persistPost(args: {
  isEditing: boolean;
  editorMode: EditorMode;
  barbershopId: string;
  post: FeedPost | null;
  type: PostType;
  postMode: PostMode;
  content: string;
  format: PostFormat;
  title: string;
  ctaText: string;
  templateKey: string;
  paletteKey: string;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  priceSplitPayload: PriceSplitPayload | undefined;
  designState: DesignEditorState;
}): Promise<string | null> {
  const {
    isEditing, editorMode, barbershopId, post, type, postMode, content, format,
    title, ctaText, templateKey, paletteKey, primaryMediaId, secondaryMediaId,
    priceSplitPayload, designState,
  } = args;

  const isDesignSave = editorMode === 'design';
  const isDesignDisabled = editorMode === 'design-disabled';
  const designPayload = isDesignSave ? {
    designKey: designState.designKey!,
    designVersion: designState.designVersion!,
    // Objetos vazios são enviados para que um update limpe o estado
    // anterior; dentro deles, campos vazios nunca aparecem.
    designOverrides: designOverridesPayload(designState) ?? {},
    designContent: designContentPayload(designState) ?? {},
  } : null;

  const targetId = post?.id;
  if (isEditing) {
    if (isDesignDisabled) {
      // Com a feature desligada, uma edição textual não pode ser
      // interpretada como alteração visual (o backend rejeitaria).
      await postsApi.update(targetId!, { content });
    } else if (isDesignSave) {
      await postsApi.update(targetId!, {
        content,
        postMode,
        format,
        primaryMediaId,
        ...designPayload!,
      });
    } else {
      // Sem videoUrl no payload: posts antigos com vídeo preservam o campo
      // (o backend só altera videoUrl quando ele é enviado).
      await postsApi.update(targetId!, {
        title: title || undefined,
        ctaText: ctaText || undefined,
        content,
        postMode, templateKey, format, paletteKey,
        primaryMediaId, secondaryMediaId,
        priceSplit: priceSplitPayload,
      });
    }
    return targetId;
  }

  if (isDesignSave) {
    const created = await postsApi.create({
      barbershopId, type, postMode,
      content: content.trim() ? content : undefined,
      format,
      primaryMediaId,
      status: 'draft',
      ...designPayload!,
    });
    return created.id;
  }

  const created = await postsApi.create({
    barbershopId, type, postMode,
    title: title || undefined,
    ctaText: ctaText || undefined,
    content: content.trim() ? content : undefined,
    templateKey, format, paletteKey,
    primaryMediaId, secondaryMediaId,
    priceSplit: priceSplitPayload,
    status: 'draft',
  });
  return created.id;
}

/**
 * Salvamento/publicação do post.
 */
export function usePostSave(args: {
  barbershopId: string;
  post: FeedPost | null;
  isEditing: boolean;
  userId: string;
  storageKey: string;
  editorMode: EditorMode;
  mediaBusy: boolean;
  designState: DesignEditorState;
  selectedTemplate: PostTemplateDef | undefined;
  templatesLoading: boolean;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  priceSplitPayload: PriceSplitPayload | undefined;
  content: string;
  postMode: PostMode;
  format: PostFormat;
  title: string;
  ctaText: string;
  templateKey: string;
  paletteKey: string;
  type: PostType;
  onSaved: (status: 'draft' | 'published') => void;
  onTabChange: (tab: EditorTab) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const {
    barbershopId, post, isEditing, userId, storageKey, editorMode, mediaBusy,
    designState, selectedTemplate, templatesLoading, primaryMediaId, secondaryMediaId,
    priceSplitPayload, content, postMode, format, title, ctaText, templateKey, paletteKey,
    type, onSaved, onTabChange, showToast,
  } = args;

  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (action: SaveAction) => {
    if (!barbershopId || submitting || mediaBusy) return;

    const failure = validateSave({
      editorMode, designState, action, selectedTemplate, templatesLoading,
      primaryMediaId, secondaryMediaId, priceSplitPayload,
    });
    if (failure) {
      showToast(failure.message, 'error');
      if (failure.tab) onTabChange(failure.tab);
      return;
    }

    setSubmitting(true);
    try {
      const targetId = await persistPost({
        isEditing, editorMode, barbershopId, post, type, postMode, content, format,
        title, ctaText, templateKey, paletteKey, primaryMediaId, secondaryMediaId,
        priceSplitPayload, designState,
      });

      if (action === 'publish') {
        await postsApi.publish(targetId!);
        clearDraft(userId, barbershopId, storageKey);
        onSaved('published');
        showToast('Post publicado no perfil.');
      } else {
        clearDraft(userId, barbershopId, storageKey);
        onSaved('draft');
        showToast('Rascunho salvo.');
      }
    } catch (err) {
      // 404 com código estável = o gerador foi desligado para o salão entre a
      // abertura do editor e o salvamento. O rascunho NÃO é apagado: o
      // usuário continua com o texto e pode tentar de novo.
      if (err instanceof ApiError && err.code === 'DESIGN_V3_DISABLED') {
        showToast(
          'O gerador de designs foi desligado para este salão. Seu rascunho foi mantido.',
          'error',
        );
        return;
      }
      showToast(getErrorMessage(err, 'Não foi possível salvar o post.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleSave };
}
