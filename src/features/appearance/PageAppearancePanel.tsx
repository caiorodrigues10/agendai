import React, { useCallback, useMemo, useState } from 'react';
import type {
  PageTheme,
  PageThemeInput,
  PageThemeMode,
  PageThemeVariant,
  PageThemeVariantColors,
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
    draft.mode,
    draft.darkColors,
    draft.lightColors,
  ]);
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
        mode: draft.mode ?? 'AUTO',
        darkColors,
        lightColors,
      };
      const saved = await pageThemeApi.update(barbershopId, payload);
      applyTheme(saved);
      onNotify?.('Aparência da página salva!');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível salvar a aparência.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file: File) => {
    setCoverBusy(true);
    try {
      const updated = await pageThemeApi.uploadCover(barbershopId, file);
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
  onCoverUpload: (file: File) => Promise<void>;
  onCoverDelete: () => Promise<void>;
}> = ({ draft, activeColors, variant, onPatch, onColorChange, coverBusy, onCoverUpload, onCoverDelete }) => (
  <div className="space-y-6">
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
        {variant === 'light' && !draft.lightColors ? ' (gerada a partir do accent escuro)' : ''}
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
      disabled={coverBusy}
    />
  </div>
);

/**
 * Painel "Aparência da página" (aba Link Público). Formulário + preview ao vivo.
 * Cores são editadas POR VARIANTE (Claro/Escuro na prévia); o Modo da página
 * (AUTO/LIGHT/DARK) controla a página real. Salvar fica BLOQUEADO enquanto
 * QUALQUER variante tiver par reprovado no contraste WCAG AA (mesma validação
 * do back); sugestões em 1 clique corrigem a variante ativa.
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
  // Variante escolhida livremente na prévia (vigor enquanto o Modo = AUTO).
  // Sem ThemeProvider (testes/isolamento) cai em 'dark' — igual ao visual
  // atual da página pública.
  const [freeVariant, setFreeVariant] = useState<PageThemeVariant>(
    () => themeContext?.resolvedTheme ?? 'dark'
  );

  // Tema salvo mudou (carga inicial, salvar, upload de capa): reseta o rascunho.
  if (prevSaved !== savedTheme) {
    setPrevSaved(savedTheme);
    setDraft(toDraft(savedTheme));
  }

  // Modo forçado (LIGHT/DARK) é DERIVADO no render (sem effect): a prévia
  // acompanha o modo que a página real vai usar.
  const forcedVariant: PageThemeVariant | null =
    draft.mode === 'LIGHT' ? 'light' : draft.mode === 'DARK' ? 'dark' : null;
  const variant = forcedVariant ?? freeVariant;

  const activeColors: PageThemeVariantColors = useMemo(() => {
    if (variant === 'dark') return draft.darkColors;
    return draft.lightColors ?? generateVariantColors(draft.darkColors.accentColor, 'light');
  }, [variant, draft]);

  const otherColors: PageThemeVariantColors = useMemo(() => {
    if (variant === 'dark') {
      return draft.lightColors ?? generateVariantColors(draft.darkColors.accentColor, 'light');
    }
    return draft.darkColors;
  }, [variant, draft]);

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
        ? `A variante ${variant === 'dark' ? 'clara' : 'escura'} tem contraste insuficiente (WCAG AA).`
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
        if (variant === 'dark') {
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
    [variant]
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

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(400px,460px)] xl:grid-cols-[minmax(0,1fr)_minmax(460px,520px)]">
        <AppearanceSettingsColumn
          draft={draft}
          activeColors={activeColors}
          variant={variant}
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
          }}
          shopName={shopName}
          settings={settings}
          slug={barbershopId}
          coverBusy={coverBusy}
          variant={variant}
          onVariantChange={setFreeVariant}
          variantLocked={draft.mode !== 'AUTO'}
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
          setDraft(prev => ({ ...DEFAULT_DRAFT, coverUrl: prev.coverUrl, coverPublicId: prev.coverPublicId }));
          setConfirmRestore(false);
        }}
        onCancel={() => setConfirmRestore(false)}
      />
    </section>
  );
};

export default PageAppearancePanel;
