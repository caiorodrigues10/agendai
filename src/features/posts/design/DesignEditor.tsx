import React, { lazy, Suspense, useMemo, useState } from 'react';
import {
  LuRectangleHorizontal as RectangleHorizontal,
  LuRectangleVertical as RectangleVertical,
  LuSmartphone as Smartphone,
} from 'react-icons/lu';
import { Button } from '../../../components/ui/Button';
import { Field, FIELD_CONTROL } from '../../../components/ui/Field';
import { SmartSelect } from '../../../components/ui/SmartSelect';
import {
  type DesignCatalog,
  type DesignPreviewResult,
  type PostMedia,
  type PostFormat,
} from '../../../infra/postsApi';
import type { Service } from '../../../types';
import { PostPreviewBox } from '../PostPreviewBox';
import {
  compactDesignContent,
  compactDesignOverrides,
  type DesignAction,
  type DesignContentTextField,
  type DesignEditorState,
} from '../designReducer';
import { DesignStylePicker } from './DesignStylePicker';
import {
  allowsServiceNames,
  supportsCommercialBlock,
} from './panelShared';
import { useDesignPreview } from './useDesignPreview';

const ContentPanel = lazy(() => import('./panels/ContentPanel'));
const ServicesPanel = lazy(() => import('./panels/ServicesPanel'));
const PromotionPanel = lazy(() => import('./panels/PromotionPanel'));
const ColorsPanel = lazy(() => import('./panels/ColorsPanel'));
const FontsPanel = lazy(() => import('./panels/FontsPanel'));
const BackgroundPanel = lazy(() => import('./panels/BackgroundPanel'));
const LogoContactsPanel = lazy(() => import('./panels/LogoContactsPanel'));
const BlocksPanel = lazy(() => import('./panels/BlocksPanel'));

type DesignPanelId =
  | 'content'
  | 'services'
  | 'promotion'
  | 'colors'
  | 'fonts'
  | 'background'
  | 'logo-contacts'
  | 'blocks';

const FORMAT_OPTIONS: { id: PostFormat; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: 'square', label: 'Quadrado', hint: '1:1', icon: <RectangleHorizontal size={16} /> },
  { id: 'portrait', label: 'Retrato', hint: '4:5', icon: <RectangleVertical size={16} /> },
  { id: 'story', label: 'Story', hint: '9:16', icon: <Smartphone size={16} /> },
];

const SUGGESTION_FIELDS: DesignContentTextField[] = [
  'businessName',
  'headline',
  'highlight',
  'tagline',
  'cta',
  'validUntil',
];

interface DesignEditorProps {
  barbershopId: string;
  catalog: DesignCatalog;
  state: DesignEditorState;
  dispatch: React.Dispatch<DesignAction>;
  format: PostFormat;
  onFormatChange: (format: PostFormat) => void;
  shopServices: Service[];
  mediaLibrary: PostMedia[];
  primaryMediaId: string | null;
  onPrimaryMediaChange: (id: string | null) => void;
  onPrimaryMediaPick: () => void;
  caption: string;
  onCaptionChange: (caption: string) => void;
  onFeatureDisabled: () => void;
}

function warningMessage(warning: Record<string, unknown>): string {
  if (typeof warning.message === 'string') return warning.message;
  if (typeof warning.code === 'string') return warning.code;
  return JSON.stringify(warning);
}

interface DesignFormatPickerProps {
  format: PostFormat;
  onFormatChange: (format: PostFormat) => void;
}

function DesignFormatPicker({ format, onFormatChange }: DesignFormatPickerProps) {
  return (
    <section aria-label="Formato da arte" className="space-y-2">
      <h3 className="text-sm font-bold text-text-primary">Formato</h3>
      <div className="grid grid-cols-3 gap-2">
        {FORMAT_OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => onFormatChange(option.id)}
            aria-pressed={format === option.id}
            className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition ${
              format === option.id
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-muted hover:border-text-muted'
            }`}
          >
            {option.icon}
            <span className="text-xs font-bold">{option.label}</span>
            <span className="text-2xs text-text-muted">{option.hint}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

interface DesignPreviewDetailsProps {
  format: PostFormat;
  preview: DesignPreviewResult | null;
  loading: boolean;
  stale: boolean;
  error: string | null;
  errorFeatureOff: boolean;
  onRetry: () => void;
  suggestions: Record<string, string>;
  dispatch: React.Dispatch<DesignAction>;
  onFeatureDisabled: () => void;
}

function DesignPreviewDetails({
  format,
  preview,
  loading,
  stale,
  error,
  errorFeatureOff,
  onRetry,
  suggestions,
  dispatch,
  onFeatureDisabled,
}: DesignPreviewDetailsProps) {
  return (
    <>
      <PostPreviewBox
        format={format}
        previewUrl={preview?.imageUrl ?? null}
        loading={loading}
        stale={stale}
      />
      {error ? (
        // Só um 404 (feature desligada) muda de editor; falhas transitórias
        // oferecem retry e mantêm o rascunho de design intacto.
        <button
          type="button"
          onClick={errorFeatureOff ? onFeatureDisabled : onRetry}
          className="w-full rounded-xl border border-warning/40 bg-warning/10 p-3 text-left text-xs text-warning"
        >
          {error}
          {!errorFeatureOff ? ' Toque para tentar novamente.' : ''}
        </button>
      ) : null}
      {preview?.warnings?.length ? (
        <div role="status" className="space-y-2">
          {preview.warnings.map((warning, index) => (
            <p key={`${warning.code ?? 'warning'}-${index}`} className="rounded-lg bg-warning/10 p-2 text-xs text-warning">
              {warningMessage(warning)}
            </p>
          ))}
        </div>
      ) : null}
      {suggestions && Object.keys(suggestions).length ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-muted">Sugestões do servidor</p>
          {Object.entries(suggestions).map(([field, suggestion]) => {
            const contentField = SUGGESTION_FIELDS.includes(field as DesignContentTextField)
              ? field as DesignContentTextField
              : null;
            if (!contentField) return null;
            return (
              <button
                key={field}
                type="button"
                onClick={() => dispatch({
                  type: 'set-content-field',
                  field: contentField,
                  value: suggestion,
                })}
                className="w-full rounded-lg border border-border bg-surface p-2 text-left text-xs text-text-secondary hover:border-accent/50"
              >
                {field}: {suggestion}
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

interface DesignPanelNavProps {
  activePanel: DesignPanelId;
  effectivePanel: DesignPanelId;
  showServices: boolean;
  showPromotion: boolean;
  onSelect: (panel: DesignPanelId) => void;
}

function DesignPanelNav({
  activePanel,
  effectivePanel,
  showServices,
  showPromotion,
  onSelect,
}: DesignPanelNavProps) {
  const tabs: [DesignPanelId, string][] = [
    ['content', 'Conteúdo'],
    ...(showServices ? [['services', 'Serviços'] as [DesignPanelId, string]] : []),
    ...(showPromotion ? [['promotion', 'Promoção'] as [DesignPanelId, string]] : []),
    ['colors', 'Cores'],
    ['fonts', 'Fontes'],
    ['background', 'Fundo'],
    ['logo-contacts', 'Logo/Contatos'],
    ['blocks', 'Blocos'],
  ];
  return (
    <nav aria-label="Painéis do design" className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          aria-current={effectivePanel === id ? 'page' : undefined}
          className={`min-h-11 shrink-0 border-b-2 px-3 text-xs font-bold transition ${
            id === activePanel
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:border-text-secondary'
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

interface DesignMediaCaptionProps {
  mediaOptions: { value: string; label: string }[];
  primaryMediaId: string | null;
  onPrimaryMediaChange: (id: string | null) => void;
  onPrimaryMediaPick: () => void;
  caption: string;
  onCaptionChange: (caption: string) => void;
}

function DesignMediaCaption({
  mediaOptions,
  primaryMediaId,
  onPrimaryMediaChange,
  onPrimaryMediaPick,
  caption,
  onCaptionChange,
}: DesignMediaCaptionProps) {
  return (
    <section aria-label="Foto e legenda" className="space-y-4 border-t border-border pt-4">
      <SmartSelect
        label="Foto do post"
        value={primaryMediaId}
        options={mediaOptions}
        placeholder="Usar foto do segmento"
        emptyMessage="Nenhuma foto na biblioteca"
        onChange={value => onPrimaryMediaChange(value)}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={onPrimaryMediaPick}
        className="w-full"
      >
        Escolher foto da biblioteca
      </Button>
      <Field label="Legenda" hint="Texto que acompanha o post; não faz parte da arte.">
        <textarea
          rows={4}
          maxLength={5000}
          value={caption}
          onChange={event => onCaptionChange(event.target.value)}
          placeholder="Texto que acompanha o post (opcional)"
          className={FIELD_CONTROL}
        />
      </Field>
    </section>
  );
}

export function DesignEditor({
  barbershopId,
  catalog,
  state,
  dispatch,
  format,
  onFormatChange,
  shopServices,
  mediaLibrary,
  primaryMediaId,
  onPrimaryMediaChange,
  onPrimaryMediaPick,
  caption,
  onCaptionChange,
  onFeatureDisabled,
}: DesignEditorProps) {
  const [activePanel, setActivePanel] = useState<DesignPanelId>('content');
  const selectedDesign = catalog.designs.find(design => design.key === state.designKey);
  const showServices = selectedDesign ? allowsServiceNames(selectedDesign) : false;
  const showPromotion = selectedDesign
    ? supportsCommercialBlock(selectedDesign, 'promo') ||
      supportsCommercialBlock(selectedDesign, 'validity')
    : false;
  const availablePanels = useMemo<DesignPanelId[]>(() => [
    'content',
    ...(showServices ? ['services' as const] : []),
    ...(showPromotion ? ['promotion' as const] : []),
    'colors',
    'fonts',
    'background',
    'logo-contacts',
    'blocks',
  ], [showPromotion, showServices]);
  const effectivePanel = availablePanels.includes(activePanel) ? activePanel : 'content';

  const previewPayload = useMemo(() => {
    if (!state.designKey || !state.designVersion) return null;
    const content = compactDesignContent(state.designContent);
    const overrides = compactDesignOverrides(state.designOverrides);
    const selectedMedia = mediaLibrary.find(media => media.id === primaryMediaId);
    const photoUrl = selectedMedia?.url ?? state.designContent.photoUrl;
    const data = {
      ...(content ?? {}),
      ...(photoUrl ? { photoUrl } : {}),
    };
    return {
      barbershopId,
      designKey: state.designKey,
      designVersion: state.designVersion,
      format,
      ...(overrides ? { overrides } : {}),
      ...(Object.keys(data).length ? { data } : {}),
    };
  }, [
    barbershopId,
    format,
    mediaLibrary,
    primaryMediaId,
    state.designContent,
    state.designKey,
    state.designOverrides,
    state.designVersion,
  ]);

  const { preview, loading, error, errorFeatureOff, retry, stale } = useDesignPreview(previewPayload);

  const panelProps = selectedDesign
    ? { state, dispatch, design: selectedDesign }
    : null;

  const renderPanel = () => {
    if (!panelProps) return null;
    switch (effectivePanel) {
      case 'content':
        return <ContentPanel {...panelProps} />;
      case 'services':
        return <ServicesPanel {...panelProps} shopServices={shopServices} icons={catalog.icons} />;
      case 'promotion':
        return <PromotionPanel key={`${state.designKey}:${state.designVersion}`} {...panelProps} />;
      case 'colors':
        return <ColorsPanel {...panelProps} />;
      case 'fonts':
        return <FontsPanel {...panelProps} />;
      case 'background':
        return <BackgroundPanel {...panelProps} mediaLibrary={mediaLibrary} />;
      case 'logo-contacts':
        return <LogoContactsPanel {...panelProps} />;
      case 'blocks':
        return <BlocksPanel {...panelProps} />;
    }
  };

  const mediaOptions = mediaLibrary.map(media => ({
    value: media.id,
    label: `Foto ${mediaLibrary.indexOf(media) + 1}`,
  }));

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <DesignStylePicker
          designs={catalog.designs}
          selectedKey={state.designKey}
          dispatch={dispatch}
        />

        <DesignFormatPicker format={format} onFormatChange={onFormatChange} />

        <DesignPanelNav
          activePanel={activePanel}
          effectivePanel={effectivePanel}
          showServices={showServices}
          showPromotion={showPromotion}
          onSelect={setActivePanel}
        />

        <Suspense fallback={<div role="status" className="p-4 text-sm text-text-muted">Carregando painel…</div>}>
          {renderPanel()}
        </Suspense>

        <DesignMediaCaption
          mediaOptions={mediaOptions}
          primaryMediaId={primaryMediaId}
          onPrimaryMediaChange={onPrimaryMediaChange}
          onPrimaryMediaPick={onPrimaryMediaPick}
          caption={caption}
          onCaptionChange={onCaptionChange}
        />
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-0 space-y-3">
          <DesignPreviewDetails
            format={format}
            preview={preview}
            loading={loading}
            stale={stale}
            error={error}
            errorFeatureOff={errorFeatureOff}
            onRetry={retry}
            suggestions={preview?.suggestions ?? {}}
            dispatch={dispatch}
            onFeatureDisabled={onFeatureDisabled}
          />
        </div>
      </div>

      <details className="border-b border-border p-4 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-accent">Ver prévia do post</summary>
        <div className="mt-4 space-y-3">
          <DesignPreviewDetails
            format={format}
            preview={preview}
            loading={loading}
            stale={stale}
            error={error}
            errorFeatureOff={errorFeatureOff}
            onRetry={retry}
            suggestions={preview?.suggestions ?? {}}
            dispatch={dispatch}
            onFeatureDisabled={onFeatureDisabled}
          />
        </div>
      </details>
    </div>
  );
}
