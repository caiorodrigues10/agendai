import React, { useCallback, useMemo, useState } from 'react';
import type {
  PageTheme,
  PageThemeInput,
  PageThemeMode,
  PageThemeVariant,
  PageThemeVariantColors,
  UploadCoverOptions,
} from '../../infra/pageThemeApi';
import { pageThemeApi } from '../../infra/pageThemeApi';
import type { ShopSettings } from '../../types';
import { PAGE_THEME_COLOR_FIELDS, PAGE_THEME_DEFAULTS } from '../../shared/pageThemeDefaults';
import {
  evaluateThemeContrast,
  failingContrastChecks,
  generateVariantColors,
  type ContrastCheck,
} from '../../shared/pageThemeContrast';
import { useThemeOptional } from '../../contexts/ThemeContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ColorField } from './ColorField';
import { CoverUploader } from './CoverUploader';
import { ThemePreview } from './ThemePreview';
import { PAGE_MODE_OPTIONS, PanelHeader, PresetPicker, SegmentedOptions } from './panelSections';
import { THEME_PRESETS, type ThemePreset } from './presets';
import { usePageTheme } from './usePageTheme';
import { getErrorMessage } from '../../utils/errorMessage';

interface PageAppearancePanelProps {
  barbershopId: string;
  shopName?: string;
  /** Settings reais do salão → prévia usa nome/endereço/modo verdadeiros. */
  settings?: ShopSettings | null;
  onNotify?: (message: string, type?: 'success' | 'error' | 'bot') => void;
}

/**
 * Rascunho: formato legado (cores planas) + variantes. `darkColors` é sempre
 * materializado e as cores planas espelham a variante escura (formato que o
 * backend mantém para leitores antigos/og-image).
 */
type Draft = Omit<PageThemeInput, 'darkColors'> & {
  darkColors: PageThemeVariantColors;
};

const DEFAULT_DARK: PageThemeVariantColors = {
  accentColor: PAGE_THEME_DEFAULTS.accentColor,
  backgroundColor: PAGE_THEME_DEFAULTS.backgroundColor,
  surfaceColor: PAGE_THEME_DEFAULTS.surfaceColor,
  textColor: PAGE_THEME_DEFAULTS.textColor,
  textMutedColor: PAGE_THEME_DEFAULTS.textMutedColor,
};

const DEFAULT_DRAFT: Draft = {
  ...PAGE_THEME_DEFAULTS,
  coverUrl: null,
  coverPublicId: null,
  coverFocalX: 50,
  coverFocalY: 50,
  coverWidth: null,
  coverHeight: null,
  mode: 'AUTO',
  lightColors: null,
  darkColors: { ...DEFAULT_DARK },
};

const COLOR_FIELDS = [
  ['accentColor', 'Cor de destaque'],
  ['textColor', 'Cor do texto'],
  ['backgroundColor', 'Cor do fundo'],
  ['surfaceColor', 'Cor dos cartões'],
  ['textMutedColor', 'Texto secundário'],
] as const;

type ColorFieldName = (typeof COLOR_FIELDS)[number][0];

const RADIUS_OPTIONS = [
  { value: 'squared', label: 'Reto' },
  { value: 'rounded', label: 'Arredondado' },
  { value: 'pill', label: 'Pill' },
] as const;

const BUTTON_OPTIONS = [
  { value: 'filled', label: 'Preenchido' },
  { value: 'outline', label: 'Contorno' },
] as const;

function toDraft(theme: PageTheme | null): Draft {
  if (!theme) return { ...DEFAULT_DRAFT };
  const darkColors: PageThemeVariantColors = theme.darkColors ?? {
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    surfaceColor: theme.surfaceColor,
    textColor: theme.textColor,
    textMutedColor: theme.textMutedColor,
  };
  return {
    presetKey: theme.presetKey,
    // Cores planas = espelho da variante escura (formato legado).
    ...darkColors,
    radiusStyle: theme.radiusStyle,
    buttonStyle: theme.buttonStyle,
    coverOverlay: theme.coverOverlay,
    coverUrl: theme.coverUrl ?? null,
    coverPublicId: theme.coverPublicId ?? null,
    coverFocalX: theme.coverFocalX ?? 50,
    coverFocalY: theme.coverFocalY ?? 50,
    coverWidth: theme.coverWidth ?? null,
    coverHeight: theme.coverHeight ?? null,
    mode: theme.mode ?? 'AUTO',
    lightColors: theme.lightColors ?? null,
    darkColors,
  };
}

/** Chave só com campos visuais (presetKey é metadado e não conta como dirty). */
function draftKey(draft: Draft): string {
  return JSON.stringify([
    draft.accentColor,
    draft.backgroundColor,
    draft.surfaceColor,
    draft.textColor,
    draft.textMutedColor,
    draft.radiusStyle,
    draft.buttonStyle,
    draft.coverOverlay,
    draft.coverUrl,
    draft.coverPublicId,
    draft.coverFocalX,
    draft.coverFocalY,
    draft.mode,
    draft.darkColors,
    draft.lightColors,
  ]);
}

/** Modo da página persistido → variante forçada da prévia (null = Automático). */
function forcedVariantOf(mode: PageThemeMode | undefined): PageThemeVariant | null {
  if (mode === 'LIGHT') return 'light';
  if (mode === 'DARK') return 'dark';
  return null;
}

/** Aviso ao lado do seletor da prévia quando o Modo da página força o modo. */
function modeForcedNotice(mode: PageThemeMode | undefined): string | null {
  if (mode === 'LIGHT') return 'Esta página sempre aparece no modo claro.';
  if (mode === 'DARK') return 'Esta página sempre aparece no modo escuro.';
  return null;
}

/** Salvar tema + ações de capa (fora do componente para manter o corpo enxuto). */
function usePageThemeActions(options: {
  barbershopId: string;
  draft: Draft;
  canSave: boolean;
  applyTheme: (theme: PageTheme) => void;
  onNotify?: PageAppearancePanelProps['onNotify'];
}) {
  const { barbershopId, draft, canSave, applyTheme, onNotify } = options;
  const [saving, setSaving] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const darkColors = draft.darkColors;
      const lightColors =
        draft.lightColors ?? generateVariantColors(darkColors.accentColor, 'light');
      const matchedPreset = THEME_PRESETS.find(
        p =>
          PAGE_THEME_COLOR_FIELDS.every(field => p.dark[field] === darkColors[field]) &&
          PAGE_THEME_COLOR_FIELDS.every(field => p.light[field] === lightColors[field])
      );
      const payload: PageThemeInput = {
        presetKey: matchedPreset?.key ?? null,
        // Cores planas: espelho legado do darkColors.
        ...darkColors,
        radiusStyle: draft.radiusStyle,
        buttonStyle: draft.buttonStyle,
        coverOverlay: draft.coverOverlay,
        coverFocalX: draft.coverFocalX ?? 50,
        coverFocalY: draft.coverFocalY ?? 50,
        mode: draft.mode ?? 'AUTO',
        darkColors,
        lightColors,
      };
      const saved = await pageThemeApi.update(barbershopId, payload);
      applyTheme(saved);
      onNotify?.('Aparência salva');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível salvar a aparência.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file: File, options?: UploadCoverOptions) => {
    setCoverBusy(true);
    try {
      const updated = await pageThemeApi.uploadCover(barbershopId, file, options);
      applyTheme(updated);
      onNotify?.('Capa enviada com sucesso!');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível enviar a capa.'), 'error');
      throw err;
    } finally {
      setCoverBusy(false);
    }
  };

  const deleteCover = async () => {
    setCoverBusy(true);
    try {
      const updated = await pageThemeApi.deleteCover(barbershopId);
      applyTheme(updated);
      onNotify?.('Capa removida.');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível remover a capa.'), 'error');
      throw err;
    } finally {
      setCoverBusy(false);
    }
  };

  return { saving, coverBusy, save, uploadCover, deleteCover };
}

/** Coluna esquerda: modo + paletas + cores (por variante) + cantos/botões + capa. */
const AppearanceSettingsColumn: React.FC<{
  draft: Draft;
  activeColors: PageThemeVariantColors;
  variant: PageThemeVariant;
  onPatch: (partial: Partial<Draft>) => void;
  onColorChange: (field: ColorFieldName, value: string) => void;
  coverBusy: boolean;
  onCoverUpload: (file: File, options?: UploadCoverOptions) => Promise<void>;
  onCoverDelete: () => Promise<void>;
}> = ({ draft, activeColors, variant, onPatch, onColorChange, coverBusy, onCoverUpload, onCoverDelete }) => (
  <div className="min-w-0 space-y-6">
    <SegmentedOptions
      legend="Modo da página"
      options={PAGE_MODE_OPTIONS}
      value={draft.mode ?? 'AUTO'}
      onChange={value => onPatch({ mode: value as PageThemeMode })}
      testIdPrefix="mode"
    />

    <PresetPicker
      selectedKey={draft.presetKey}
      variant={variant}
      onPick={(preset: ThemePreset) =>
        onPatch({
          // Cores planas espelham a variante escura (formato legado).
          ...preset.dark,
          darkColors: preset.dark,
          lightColors: preset.light,
          presetKey: preset.key,
          radiusStyle: preset.radiusStyle,
          buttonStyle: preset.buttonStyle,
        })
      }
    />

    <div>
      <p className="mb-2 text-[11px] text-text-muted" data-testid="editing-variant">
        Editando variante {variant === 'light' ? 'clara' : 'escura'}
        {variant === 'light' && !draft.lightColors ? ' (gerada a partir do accent)' : ''}
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {COLOR_FIELDS.map(([field, label]) => (
          <ColorField
            key={field}
            label={label}
            value={activeColors[field]}
            onChange={value => onColorChange(field, value)}
          />
        ))}
      </div>
    </div>

    <div className="flex min-w-0 flex-col gap-5">
      <SegmentedOptions
        legend="Cantos"
        options={RADIUS_OPTIONS}
        value={draft.radiusStyle}
        onChange={value => onPatch({ radiusStyle: value as Draft['radiusStyle'] })}
        testIdPrefix="radius"
      />
      <SegmentedOptions
        legend="Botões"
        options={BUTTON_OPTIONS}
        value={draft.buttonStyle}
        onChange={value => onPatch({ buttonStyle: value as Draft['buttonStyle'] })}
        testIdPrefix="button"
      />
    </div>

    <CoverUploader
      coverUrl={draft.coverUrl ?? null}
      overlay={draft.coverOverlay}
      onOverlayChange={value => onPatch({ coverOverlay: value })}
      onUpload={onCoverUpload}
      onDelete={onCoverDelete}
      focalX={draft.coverFocalX ?? 50}
      focalY={draft.coverFocalY ?? 50}
      onFocalChange={(x, y) => onPatch({ coverFocalX: x, coverFocalY: y })}
      coverWidth={draft.coverWidth ?? null}
      coverHeight={draft.coverHeight ?? null}
      disabled={coverBusy}
    />
  </div>
);

/**
 * Painel "Aparência da página" (aba Link Público). Formulário + preview ao vivo.
 * A variante em edição (activeMode) segue AUTOMATICAMENTE o tema do app; o
 * seletor da prévia é um override opcional ("Auto" = seguindo o app) e o Modo
 * da página (AUTO/LIGHT/DARK) continua sendo a única configuração persistida.
 * Salvar fica BLOQUEADO enquanto QUALQUER variante tiver par reprovado no
 * contraste WCAG AA (mesma validação do back); sugestões em 1 clique corrigem
 * a variante ativa.
 */
export const PageAppearancePanel: React.FC<PageAppearancePanelProps> = ({
  barbershopId,
  shopName = 'Seu salão',
  settings,
  onNotify,
}) => {
  const { theme: savedTheme, loading, applyTheme } = usePageTheme(barbershopId);
  const themeContext = useThemeOptional();
  const [draft, setDraft] = useState<Draft>(() => toDraft(savedTheme));
  const [prevSaved, setPrevSaved] = useState(savedTheme);
  const [confirmRestore, setConfirmRestore] = useState(false);
  // Tema do app (ThemeContext, já resolvido) — fonte única do modo automático.
  // Sem ThemeProvider (testes/isolamento) cai em 'dark' — igual ao visual
  // atual da página pública.
  const appTheme: PageThemeVariant = themeContext?.resolvedTheme ?? 'dark';
  // Override manual do editor (só conferência, NUNCA persistido): null =
  // seguir o tema do app. Zerado quando o tema do app ou o Modo muda (ver
  // ajuste de render logo abaixo).
  const [previewOverride, setPreviewOverride] = useState<PageThemeVariant | null>(null);

  // Tema salvo mudou (carga inicial, salvar, upload de capa): reseta o rascunho.
  if (prevSaved !== savedTheme) {
    setPrevSaved(savedTheme);
    setDraft(toDraft(savedTheme));
  }

  // Modo da página (config persistida) força a variante da prévia.
  const pageModeForced = forcedVariantOf(draft.mode);

  // Ajuste durante o render (padrão React de estado derivado, sem effect):
  // trocar o tema do app (lua/sol) ou o Modo da página zera o override
  // manual para TUDO seguir o automático — valores digitados no rascunho
  // de cores não são tocados.
  const [prevFollow, setPrevFollow] = useState<readonly [PageThemeVariant, PageThemeVariant | null]>(
    [appTheme, pageModeForced]
  );
  if (prevFollow[0] !== appTheme || prevFollow[1] !== pageModeForced) {
    setPrevFollow([appTheme, pageModeForced]);
    setPreviewOverride(null);
  }

  // ÚNICA variante usada por prévia, chips, campos de cor, rótulo e validações.
  const activeMode: PageThemeVariant = previewOverride ?? pageModeForced ?? appTheme;

  const activeColors: PageThemeVariantColors = useMemo(() => {
    if (activeMode === 'dark') return draft.darkColors;
    return draft.lightColors ?? generateVariantColors(draft.darkColors.accentColor, 'light');
  }, [activeMode, draft]);

  const otherColors: PageThemeVariantColors = useMemo(() => {
    if (activeMode === 'dark') {
      return draft.lightColors ?? generateVariantColors(draft.darkColors.accentColor, 'light');
    }
    return draft.darkColors;
  }, [activeMode, draft]);

  const failing = useMemo(
    () => failingContrastChecks(evaluateThemeContrast(activeColors)),
    [activeColors]
  );
  const failingOther = useMemo(
    () => failingContrastChecks(evaluateThemeContrast(otherColors)),
    [otherColors]
  );
  const hasContrastIssues = failing.length > 0 || failingOther.length > 0;
  const dirty = draftKey(draft) !== draftKey(toDraft(savedTheme));

  const { saving, coverBusy, save, uploadCover, deleteCover } = usePageThemeActions({
    barbershopId,
    draft,
    canSave: !hasContrastIssues && dirty,
    applyTheme,
    onNotify,
  });

  const disabledReason = saving
    ? 'Salvando as alterações…'
    : failing.length > 0
      ? 'Corrija o contraste insuficiente (WCAG AA) para salvar.'
        : failingOther.length > 0
          ? `A variante ${activeMode === 'dark' ? 'clara' : 'escura'} tem contraste insuficiente (WCAG AA).`
        : !dirty
          ? 'Nenhuma alteração para salvar.'
          : undefined;

  const patch = useCallback((partial: Partial<Draft>) => {
    setDraft(prev => ({ ...prev, ...partial }));
  }, []);

  /** Edição de cor: aplicada na variante ativa; a plana espelha o escuro. */
  const patchActiveColor = useCallback(
    (field: ColorFieldName, value: string) => {
      setDraft(prev => {
        if (activeMode === 'dark') {
          const darkColors = { ...prev.darkColors, [field]: value };
          return { ...prev, darkColors, [field]: value };
        }
        const lightColors = {
          ...(prev.lightColors ?? generateVariantColors(prev.darkColors.accentColor, 'light')),
          [field]: value,
        };
        return { ...prev, lightColors };
      });
    },
    [activeMode]
  );

  const applySuggestion = (check: ContrastCheck) => {
    if (check.suggestion) patchActiveColor(check.suggestion.field, check.suggestion.value);
  };

  if (loading) {
    return (
      <section aria-busy="true" className="animate-pulse rounded-2xl border border-border bg-surface p-6">
        <div className="h-4 w-48 rounded bg-surface-2" />
        <div className="mt-4 h-64 rounded-xl bg-surface-2" />
      </section>
    );
  }

  return (
    <section
      aria-labelledby="appearance-title"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-6"
    >
      <PanelHeader
        saving={saving}
        canSave={!hasContrastIssues && dirty && !saving}
        disabledReason={disabledReason}
        onRestore={() => setConfirmRestore(true)}
        onSave={() => void save()}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(400px,460px)] xl:grid-cols-[minmax(0,1fr)_minmax(460px,520px)]">
        <AppearanceSettingsColumn
          draft={draft}
          activeColors={activeColors}
          variant={activeMode}
          onPatch={patch}
          onColorChange={patchActiveColor}
          coverBusy={coverBusy}
          onCoverUpload={uploadCover}
          onCoverDelete={deleteCover}
        />

        <ThemePreview
          theme={{
            ...activeColors,
            radiusStyle: draft.radiusStyle,
            buttonStyle: draft.buttonStyle,
            coverOverlay: draft.coverOverlay,
            coverUrl: draft.coverUrl,
            coverFocalX: draft.coverFocalX,
            coverFocalY: draft.coverFocalY,
            coverWidth: draft.coverWidth,
            coverHeight: draft.coverHeight,
          }}
          shopName={shopName}
          settings={settings}
          slug={barbershopId}
          coverBusy={coverBusy}
          variant={activeMode}
          onVariantChange={next => setPreviewOverride(next)}
          variantLocked={pageModeForced !== null}
          autoActive={previewOverride === null && pageModeForced === null}
          onAuto={() => setPreviewOverride(null)}
          modeNotice={modeForcedNotice(draft.mode)}
          failing={failing}
          otherFailing={failingOther}
          dirty={dirty}
          onApplySuggestion={applySuggestion}
        />
      </div>

      <ConfirmDialog
        open={confirmRestore}
        title="Restaurar aparência padrão?"
        message="Cores, cantos e botões voltam ao visual padrão do Agenda Já. A capa enviada é mantida."
        confirmLabel="Restaurar"
        onConfirm={() => {
          setDraft(prev => ({
            ...DEFAULT_DRAFT,
            coverUrl: prev.coverUrl,
            coverPublicId: prev.coverPublicId,
            // Restaurar padrão zera o enquadramento junto com as cores.
            coverFocalX: 50,
            coverFocalY: 50,
            coverWidth: prev.coverWidth ?? null,
            coverHeight: prev.coverHeight ?? null,
          }));
          setConfirmRestore(false);
        }}
        onCancel={() => setConfirmRestore(false)}
      />
    </section>
  );
};

export default PageAppearancePanel;
