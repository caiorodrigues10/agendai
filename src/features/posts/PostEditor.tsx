import React, { useContext, useEffect, useReducer, useState } from 'react';
import { LuLoaderCircle as Loader2 } from 'react-icons/lu';
import { type PostMedia, type PostPaletteDef } from '../../infra/postsApi';
import type { FeedPost } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BarbershopContext } from '../../contexts/BarbershopContext';
import { DesignEditor } from './design/DesignEditor';
import { createDesignState, designReducer } from './designReducer';
import { EditorDialog } from './EditorDialog';
import { EditorFooter, EditorHeader } from './editor/EditorShell';
import { LegacyEditorBody, LegacyTabBar } from './legacy/LegacyEditorBody';
import { MediaPickerOverlay } from './legacy/MediaPickerOverlay';
import { ObjectivePickerDialog } from './legacy/ObjectivePickerDialog';
import { TemplatePickerOverlay } from './legacy/TemplatePickerOverlay';
import { useRestoredDraft, usePersistDraft } from './usePostDraft';
import { usePostFields } from './usePostFields';
import { usePostTemplates, useTemplateSelection } from './usePostTemplates';
import { useLegacyExtras } from './useLegacyExtras';
import { useLegacyPreview } from './useLegacyPreview';
import { useMediaUpload } from './useMediaUpload';
import { useMediaDelete } from './useMediaDelete';
import { useMediaReconcile } from './useMediaReconcile';
import { useDesignCatalog } from './useDesignCatalog';
import { usePostSave } from './usePostSave';
import {
  CAPTION_MAX,
  draftStorageKey,
  editorTitle,
  initialEditorMode,
  initialPreviewUrl,
  needsObjectivePick,
  pickSavedDesign,
  readShopContext,
  templatePhotoMode,
  type EditorMode,
  type EditorTab,
  type TemplateFilter,
} from './postEditorShared';

// ─── Props ────────────────────────────────────────────────────

export interface PostEditorProps {
  post: FeedPost | null;
  barbershopId: string;
  userId: string;
  palettes: PostPaletteDef[];
  mediaLibrary: PostMedia[];
  onClose: () => void;
  onSaved: (status: 'draft' | 'published') => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onMediaUploaded: (m: PostMedia) => void;
  mediaLoading?: boolean;
  mediaError?: boolean;
  onRetryMedia?: () => void;
  onMediaRemoved?: (id: string) => void;
}

// ─── Componente ────────────────────────────────────────────────

/**
 * Editor de publicação.
 *
 * O componente só orquestra: o gerador de designs (v3) vive em `design/` e o
 * editor legado foi dividido em `legacy/` (abas, overlays) + hooks de estado
 * (`usePostFields`, `useLegacyExtras`, `useLegacyPreview`, `useMediaUpload`,
 * `usePostSave`, `usePostDraft`).
 */
export const PostEditor: React.FC<PostEditorProps> = ({
  post,
  barbershopId,
  userId,
  palettes,
  mediaLibrary,
  onClose,
  onSaved,
  showToast,
  onMediaUploaded,
  mediaLoading = false,
  mediaError = false,
  onRetryMedia,
  onMediaRemoved,
}) => {
  const isEditing = !!post;
  const storageKey = draftStorageKey(post);

  // Restaura o rascunho local ANTES do primeiro render dos estados, para que o
  // efeito de persistência nunca sobrescreva o rascunho salvo com valores vazios.
  const draft = useRestoredDraft({ userId, barbershopId, isEditing });

  // ── Gerador de designs (v3) ──
  const [editorMode, setEditorMode] = useState<EditorMode>(initialEditorMode(post));
  const [designState, dispatchDesign] = useReducer(designReducer, post, currentPost =>
    createDesignState({
      designKey: currentPost?.designKey ?? draft?.designKey,
      designVersion: currentPost?.designVersion ?? draft?.designVersion,
      designContent: currentPost?.designContent ?? draft?.designContent,
      designOverrides: currentPost?.designOverrides ?? draft?.designOverrides,
    }),
  );
  const { designKey: savedDesignKey, designVersion: savedDesignVersion, format: savedFormat } =
    pickSavedDesign(post, draft);

  // ── Abas e overlays ──
  const [tab, setTab] = useState<EditorTab>('content');
  const [showMediaPicker, setShowMediaPicker] = useState<'primary' | 'secondary' | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>('all');

  // Contexto cru (não o useBarbershop): o editor sobe fora do provider nos
  // testes/Storybook — aqui falta de serviços só esconde o botão de importar.
  const shopContext = useContext(BarbershopContext);
  const { services: shopServices, settings: shopSettings } = readShopContext(shopContext);

  // ── Campos do post (compartilhados entre v3 e legado) ──
  const { templates, templatesLoading } = usePostTemplates({ showToast });
  const fields = usePostFields({ draft, post, templates, onTabChange: setTab });
  const {
    objectiveId, templateKey, paletteKey, format, formatTouched, formatTouchedRef,
    postMode, type, title, ctaText, content, primaryMediaId, secondaryMediaId,
    updateFormat, clearPrimaryMedia, clearSecondaryMedia,
    applyTemplate, pickObjective, setFormat, setPaletteKey, setPostMode,
    setTitle, setCtaText, setContent, setPrimaryMediaId, setSecondaryMediaId,
  } = fields;

  // Catálogo do gerador (v3) + reconciliação da biblioteca + exclusão de foto.
  const {
    designCatalog, designCatalogError, clearDesignCatalog, retryDesignCatalog,
  } = useDesignCatalog({
    barbershopId, isEditing, savedDesignKey, savedDesignVersion, savedFormat,
    formatTouchedRef, setFormat, setEditorMode, dispatchDesign, showToast,
  });

  useMediaReconcile({
    mediaLibrary, mediaLoading, mediaError, primaryMediaId, secondaryMediaId,
    clearPrimaryMedia, clearSecondaryMedia, showToast,
  });

  const { deleteTarget, setDeleteTarget, deletingMedia, handleDeleteMedia } = useMediaDelete({
    primaryMediaId, secondaryMediaId, designState,
    clearBackground: () => dispatchDesign({ type: 'set-background', background: undefined }),
    setPrimaryMediaId, setSecondaryMediaId, onMediaRemoved, showToast,
  });

  const handleDesignFormatChange = (nextFormat: Parameters<typeof updateFormat>[0]) => {
    updateFormat(nextFormat, true);
  };

  const { selectedTemplate, templateGroups, filteredTemplates } = useTemplateSelection({
    templates, templateKey, templateFilter,
  });

  // ── Fluxo legado ──
  const legacy = useLegacyExtras({
    draft, post, barbershopId, templateKey, type, postMode, title, ctaText,
    shopServices, shopSettings, showToast,
  });

  const { previewUrl, previewStale, previewLoading } = useLegacyPreview({
    barbershopId,
    editorMode,
    initialUrl: initialPreviewUrl(post),
    showToast,
    live: {
      templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId,
      postMode, type, priceSplit: legacy.priceSplitPayload,
    },
  });

  const { uploadingPhoto, uploadProgress, handleUpload } = useMediaUpload({
    barbershopId,
    target: showMediaPicker,
    onUploaded: onMediaUploaded,
    onSelectPrimary: setPrimaryMediaId,
    onSelectSecondary: setSecondaryMediaId,
    onClosePicker: () => setShowMediaPicker(null),
    showToast,
  });
  const mediaBusy = uploadingPhoto;

  const { submitting, handleSave } = usePostSave({
    barbershopId, post, isEditing, userId, storageKey, editorMode, mediaBusy,
    designState, selectedTemplate, templatesLoading, primaryMediaId, secondaryMediaId,
    priceSplitPayload: legacy.priceSplitPayload, content, postMode, format, title, ctaText,
    templateKey, paletteKey, type, onSaved, onTabChange: setTab, showToast,
  });

  usePersistDraft({
    userId, barbershopId, storageKey, isEditing,
    fields: {
      objectiveId, templateKey, paletteKey, format, formatTouched, postMode, type,
      title, ctaText, content, primaryMediaId, secondaryMediaId,
      priceItems: legacy.priceItems, businessName: legacy.businessName,
    },
    design: {
      designKey: designState.designKey,
      designVersion: designState.designVersion,
      designContent: designState.designContent,
      designOverrides: designState.designOverrides,
    },
  });

  // Catálogo, reconciliação da biblioteca e exclusão de foto vivem nos hooks
  // `useDesignCatalog`, `useMediaReconcile` e `useMediaDelete` (acima).

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || submitting || mediaBusy) return;
      event.preventDefault();
      if (showMediaPicker) setShowMediaPicker(null);
      else if (showTemplatePicker) setShowTemplatePicker(false);
      else onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose, showMediaPicker, showTemplatePicker, submitting, mediaBusy]);

  // Exclusão de foto: `handleDeleteMedia` vem de `useMediaDelete` (acima).

  const handleSelectTemplate = (key: string) => {
    applyTemplate(key);
    setShowTemplatePicker(false);
  };

  if (needsObjectivePick(objectiveId, isEditing)) {
    return <ObjectivePickerDialog onClose={onClose} onPick={pickObjective} />;
  }

  return (
    <EditorDialog>
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[92dvh] sm:rounded-2xl sm:border sm:border-border">
        <EditorHeader
          title={editorTitle(isEditing)}
          onClose={onClose}
          disabled={submitting || mediaBusy}
        />

        {/* Tab bar — apenas o editor legado usa os quatro passos antigos. */}
        {editorMode === 'legacy' && <LegacyTabBar tab={tab} onChange={setTab} />}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {editorMode === 'design' && designCatalog ? (
            <DesignEditor
              barbershopId={barbershopId}
              catalog={designCatalog}
              state={designState}
              dispatch={dispatchDesign}
              format={format}
              onFormatChange={handleDesignFormatChange}
              shopServices={shopServices}
              mediaLibrary={mediaLibrary}
              primaryMediaId={primaryMediaId}
              onPrimaryMediaChange={setPrimaryMediaId}
              onPrimaryMediaPick={() => setShowMediaPicker('primary')}
              caption={content}
              onCaptionChange={setContent}
              onFeatureDisabled={() => {
                clearDesignCatalog();
                setEditorMode('legacy');
              }}
            />
          ) : editorMode === 'checking' ? (
            <div role={designCatalogError ? 'alert' : 'status'} className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              {designCatalogError ? (
                <>
                  <p className="text-sm font-semibold text-text-secondary">{designCatalogError}</p>
                  <Button variant="secondary" size="sm" onClick={retryDesignCatalog}>
                    Tentar novamente
                  </Button>
                </>
              ) : (
                <span className="flex items-center justify-center gap-2 text-sm text-text-muted">
                  <Loader2 size={16} className="animate-spin" aria-hidden /> Carregando estilos…
                </span>
              )}
            </div>
          ) : null}

          {editorMode === 'design-disabled' && (
            <div className="space-y-4 p-4">
              <div role="alert" className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
                O gerador de designs está indisponível para este post. Você ainda pode editar a legenda e publicar o rascunho, mas a arte não será alterada.
              </div>
              <label className="block text-xs font-bold text-text-secondary" htmlFor="design-disabled-caption">
                Legenda
              </label>
              <textarea
                id="design-disabled-caption"
                rows={5}
                maxLength={CAPTION_MAX}
                value={content}
                onChange={event => setContent(event.target.value)}
                placeholder="Texto que acompanha o post"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
          )}

          {editorMode === 'legacy' && (
            <LegacyEditorBody
              tab={tab}
              format={format}
              previewUrl={previewUrl}
              previewLoading={previewLoading}
              previewStale={previewStale}
              content={{
                title, ctaText, content,
                titleWarningMessage: legacy.titleWarningMessage,
                ctaWarningMessage: legacy.ctaWarningMessage,
                onTitleChange: setTitle,
                onCtaChange: setCtaText,
                onContentChange: setContent,
                postMode,
                onPostModeChange: setPostMode,
                selectedTemplateName: selectedTemplate?.name,
                onOpenTemplatePicker: () => setShowTemplatePicker(true),
                isPriceSplit: legacy.isPriceSplit,
                priceItems: legacy.priceItems,
                priceItemWarnings: legacy.priceItemWarnings,
                businessName: legacy.businessName,
                businessWarningMessage: legacy.businessWarningMessage,
                shopName: shopSettings?.shopName,
                hasShopServices: shopServices.length > 0,
                onUpdatePriceRow: legacy.updatePriceRow,
                onAddPriceRow: legacy.addPriceRow,
                onRemovePriceRow: legacy.removePriceRow,
                onImportPriceServices: legacy.importPriceServices,
                onBusinessNameChange: legacy.setBusinessName,
                tone: legacy.tone,
                onToneChange: legacy.setTone,
                extra: legacy.extra,
                onExtraChange: legacy.setExtra,
                suggestions: legacy.suggestions,
                generatingSuggestions: legacy.generatingSuggestions,
                onGenerate: () => void legacy.handleGenerate(),
                onApplySuggestion: suggestion => {
                  setTitle(suggestion.title || title);
                  setCtaText(suggestion.ctaText || ctaText);
                },
                format,
                previewUrl, previewLoading, previewStale,
              }}
              image={{
                format, previewUrl, previewLoading, previewStale,
                selectedTemplate,
                selectedPhotoMode: templatePhotoMode(selectedTemplate),
                templatesLoading,
                mediaLibrary,
                primaryMediaId,
                secondaryMediaId,
                mediaLoading,
                mediaError,
                mediaBusy,
                onOpenMediaPicker: slot => setShowMediaPicker(slot),
                onClearPrimary: () => setPrimaryMediaId(null),
                onClearSecondary: () => setSecondaryMediaId(null),
                onRetryMedia,
                onShowTemplatesWithPhoto: () => {
                  setTemplateFilter('with-photo');
                  setShowTemplatePicker(true);
                },
              }}
              formatTab={{
                format,
                onFormatChange: next => updateFormat(next, true),
                palettes,
                paletteKey,
                onPaletteChange: setPaletteKey,
                templates,
                templatesLoading,
                templateKey,
                templateGroups,
                onSelectTemplate: handleSelectTemplate,
                previewUrl, previewLoading, previewStale,
              }}
              identity={{
                title, ctaText,
                selectedTemplate,
                format, paletteKey,
                previewUrl, previewLoading, previewStale,
              }}
            />
          )}
        </div>

        <EditorFooter
          submitting={submitting}
          mediaBusy={mediaBusy}
          editorMode={editorMode}
          templatesLoading={templatesLoading}
          onCancel={onClose}
          onSave={action => void handleSave(action)}
        />
      </div>

      {/* Media Picker Overlay */}
      {showMediaPicker && (
        <MediaPickerOverlay
          slot={showMediaPicker}
          mediaLibrary={mediaLibrary}
          primaryMediaId={primaryMediaId}
          secondaryMediaId={secondaryMediaId}
          mediaLoading={mediaLoading}
          mediaError={mediaError}
          uploadingPhoto={uploadingPhoto}
          uploadProgress={uploadProgress}
          deletingMedia={deletingMedia}
          onClose={() => setShowMediaPicker(null)}
          onSelect={id => {
            if (showMediaPicker === 'primary') setPrimaryMediaId(id);
            else setSecondaryMediaId(id);
            setShowMediaPicker(null);
          }}
          onUpload={event => void handleUpload(event)}
          onRequestDelete={setDeleteTarget}
          onRetryMedia={onRetryMedia}
        />
      )}

      {/* Confirmar exclusão de foto da biblioteca */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remover foto"
        message={
          deleteTarget && (deleteTarget.id === primaryMediaId || deleteTarget.id === secondaryMediaId)
            ? 'Esta foto está no slot deste post. Ao removê-la, o slot ficará vazio. A foto sai da biblioteca permanentemente. Continuar?'
            : 'A foto será removida da biblioteca permanentemente. Publicações já publicadas mantêm a imagem gerada. Continuar?'
        }
        confirmLabel="Remover"
        variant="danger"
        loading={deletingMedia}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteMedia()}
      />

      {/* Template Picker Overlay */}
      {showTemplatePicker && (
        <TemplatePickerOverlay
          barbershopId={barbershopId}
          filteredTemplates={filteredTemplates}
          templatesLoading={templatesLoading}
          templateKey={templateKey}
          templateFilter={templateFilter}
          format={format}
          paletteKey={paletteKey}
          onFilterChange={setTemplateFilter}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </EditorDialog>
  );
};
