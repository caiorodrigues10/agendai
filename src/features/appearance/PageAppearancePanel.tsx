import React, { useCallback, useMemo, useState } from 'react';
import type { PageThemeInput } from '../../infra/pageThemeApi';
import { pageThemeApi } from '../../infra/pageThemeApi';
import { PAGE_THEME_DEFAULTS } from '../../shared/pageThemeDefaults';
import {
  evaluateThemeContrast,
  failingContrastChecks,
  type ContrastCheck,
} from '../../shared/pageThemeContrast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ColorField } from './ColorField';
import { CoverUploader } from './CoverUploader';
import { ThemePreview } from './ThemePreview';
import { ContrastStatusPanel, PanelHeader, PresetPicker, SegmentedOptions } from './panelSections';
import { THEME_PRESETS } from './presets';
import { usePageTheme } from './usePageTheme';
import { getErrorMessage } from '../../utils/errorMessage';

interface PageAppearancePanelProps {
  barbershopId: string;
  shopName?: string;
  onNotify?: (message: string, type?: 'success' | 'error' | 'bot') => void;
}

type Draft = PageThemeInput;

const DEFAULT_DRAFT: Draft = { ...PAGE_THEME_DEFAULTS, coverUrl: null, coverPublicId: null };

const COLOR_FIELDS = [
  ['accentColor', 'Cor de destaque'],
  ['textColor', 'Cor do texto'],
  ['backgroundColor', 'Cor do fundo'],
  ['surfaceColor', 'Cor dos cartões'],
  ['textMutedColor', 'Texto secundário'],
] as const;

const RADIUS_OPTIONS = [
  { value: 'squared', label: 'Reto' },
  { value: 'rounded', label: 'Arredondado' },
  { value: 'pill', label: 'Bem arredondado' },
] as const;

const BUTTON_OPTIONS = [
  { value: 'filled', label: 'Preenchido' },
  { value: 'outline', label: 'Contorno' },
] as const;

function toDraft(theme: PageThemeInput | null): Draft {
  if (!theme) return { ...DEFAULT_DRAFT };
  return {
    presetKey: theme.presetKey,
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    surfaceColor: theme.surfaceColor,
    textColor: theme.textColor,
    textMutedColor: theme.textMutedColor,
    radiusStyle: theme.radiusStyle,
    buttonStyle: theme.buttonStyle,
    coverOverlay: theme.coverOverlay,
    coverUrl: theme.coverUrl ?? null,
    coverPublicId: theme.coverPublicId ?? null,
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
  ]);
}

/**
 * Painel "Aparência da página" (aba Link Público). Formulário + preview ao vivo.
 * Salvar fica BLOQUEADO enquanto houver par de cores reprovado no contraste
 * WCAG AA (mesma validação do back); sugestões claras/escuras em 1 clique.
 */
export const PageAppearancePanel: React.FC<PageAppearancePanelProps> = ({
  barbershopId,
  shopName = 'Seu salão',
  onNotify,
}) => {
  const { theme: savedTheme, loading, applyTheme } = usePageTheme(barbershopId);
  const [draft, setDraft] = useState<Draft>(() => toDraft(savedTheme));
  const [prevSaved, setPrevSaved] = useState(savedTheme);
  const [saving, setSaving] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  // Tema salvo mudou (carga inicial, salvar, upload de capa): reseta o rascunho.
  if (prevSaved !== savedTheme) {
    setPrevSaved(savedTheme);
    setDraft(toDraft(savedTheme));
  }

  const failing = useMemo(() => failingContrastChecks(evaluateThemeContrast(draft)), [draft]);
  const dirty = draftKey(draft) !== draftKey(toDraft(savedTheme));

  const patch = useCallback((partial: Partial<Draft>) => {
    setDraft(prev => ({ ...prev, ...partial }));
  }, []);

  const applySuggestion = (check: ContrastCheck) => {
    if (check.suggestion) patch({ [check.suggestion.field]: check.suggestion.value });
  };

  const save = async () => {
    if (failing.length > 0 || saving) return;
    setSaving(true);
    try {
      const matchedPreset = THEME_PRESETS.find(p =>
        (['accentColor', 'backgroundColor', 'surfaceColor', 'textColor', 'textMutedColor'] as const).every(
          field => p.colors[field] === draft[field]
        )
      );
      const payload: PageThemeInput = {
        presetKey: matchedPreset?.key ?? null,
        accentColor: draft.accentColor,
        backgroundColor: draft.backgroundColor,
        surfaceColor: draft.surfaceColor,
        textColor: draft.textColor,
        textMutedColor: draft.textMutedColor,
        radiusStyle: draft.radiusStyle,
        buttonStyle: draft.buttonStyle,
        coverOverlay: draft.coverOverlay,
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
        canSave={failing.length === 0 && dirty && !saving}
        onRestore={() => setConfirmRestore(true)}
        onSave={() => void save()}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <PresetPicker
            onPick={preset =>
              setDraft(prev => ({
                ...prev,
                ...preset.colors,
                presetKey: preset.key,
                radiusStyle: preset.radiusStyle,
                buttonStyle: preset.buttonStyle,
              }))
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {COLOR_FIELDS.map(([field, label]) => (
              <ColorField
                key={field}
                label={label}
                value={draft[field]}
                onChange={v => patch({ [field]: v })}
              />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SegmentedOptions
              legend="Cantos"
              options={RADIUS_OPTIONS}
              value={draft.radiusStyle}
              onChange={v => patch({ radiusStyle: v as Draft['radiusStyle'] })}
              testIdPrefix="radius"
            />
            <SegmentedOptions
              legend="Botões"
              options={BUTTON_OPTIONS}
              value={draft.buttonStyle}
              onChange={v => patch({ buttonStyle: v as Draft['buttonStyle'] })}
              testIdPrefix="button"
            />
          </div>

          <CoverUploader
            coverUrl={draft.coverUrl ?? null}
            overlay={draft.coverOverlay}
            onOverlayChange={v => patch({ coverOverlay: v })}
            onUpload={uploadCover}
            onDelete={deleteCover}
            disabled={coverBusy}
          />
        </div>

        <div className="space-y-3">
          <div className="lg:sticky lg:top-4">
            <h3 className="mb-2 text-sm font-bold text-text-primary">Prévia ao vivo</h3>
            <ThemePreview theme={draft} shopName={shopName} />
          </div>
          <ContrastStatusPanel failing={failing} dirty={dirty} onApplySuggestion={applySuggestion} />
        </div>
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
