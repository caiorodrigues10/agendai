import React from 'react';
import { LuRotateCcw, LuSave } from 'react-icons/lu';
import type { ContrastCheck } from '../../shared/pageThemeContrast';
import { THEME_PRESETS, type ThemePreset } from './presets';

/** Cabeçalho do painel: título + Restaurar padrão + Salvar. */
export const PanelHeader: React.FC<{
  saving: boolean;
  canSave: boolean;
  onRestore: () => void;
  onSave: () => void;
}> = ({ saving, canSave, onRestore, onSave }) => (
  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 id="appearance-title" className="text-lg font-bold text-text-primary">
        Aparência da página
      </h2>
      <p className="text-sm text-text-muted">Personalize cores, capa e cantos do link público do salão.</p>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onRestore}
        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-bold text-text-secondary hover:bg-surface-2"
        data-testid="restore-defaults"
      >
        <LuRotateCcw size={16} /> Restaurar padrão
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg hover:bg-accent-hover disabled:opacity-50"
        data-testid="save-theme"
      >
        <LuSave size={16} /> {saving ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  </div>
);

/** Paletas prontas (swatch + rótulo). */
export const PresetPicker: React.FC<{
  onPick: (preset: ThemePreset) => void;
}> = ({ onPick }) => (
  <div>
    <h3 className="mb-2 text-sm font-bold text-text-primary">Paletas prontas</h3>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Paletas prontas">
      {THEME_PRESETS.map(preset => (
        <button
          key={preset.key}
          type="button"
          onClick={() => onPick(preset)}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold text-text-secondary hover:border-accent"
          data-testid={`preset-${preset.key}`}
        >
          <span className="flex">
            <span
              className="h-4 w-4 rounded-l-full border border-black/10"
              style={{ backgroundColor: preset.colors.backgroundColor }}
            />
            <span
              className="h-4 w-4 border-y border-black/10"
              style={{ backgroundColor: preset.colors.surfaceColor }}
            />
            <span
              className="h-4 w-4 rounded-r-full border border-black/10"
              style={{ backgroundColor: preset.colors.accentColor }}
            />
          </span>
          {preset.label}
        </button>
      ))}
    </div>
  </div>
);

/** Controle segmentado (cantos / estilo de botão). */
export const SegmentedOptions: React.FC<{
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  testIdPrefix: string;
}> = ({ legend, options, value, onChange, testIdPrefix }) => (
  <fieldset>
    <legend className="mb-1.5 text-sm font-medium text-text-secondary">{legend}</legend>
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`flex-1 rounded-xl border px-2 py-2 text-xs font-bold ${
            value === opt.value ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary'
          }`}
          data-testid={`${testIdPrefix}-${opt.value}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </fieldset>
);

/** Status de contraste WCAG AA (aria-live) + sugestões em 1 clique. */
export const ContrastStatusPanel: React.FC<{
  failing: ContrastCheck[];
  dirty: boolean;
  onApplySuggestion: (check: ContrastCheck) => void;
}> = ({ failing, dirty, onApplySuggestion }) => (
  <div aria-live="polite" data-testid="contrast-status">
    {failing.length > 0 ? (
      <div className="rounded-xl border border-danger/40 bg-danger/5 p-3">
        <p className="mb-2 text-xs font-bold text-danger">
          Contraste insuficiente (WCAG AA) — corrija para salvar:
        </p>
        <ul className="space-y-2">
          {failing.map(check => (
            <li key={check.key} className="text-[11px] text-text-secondary">
              <span className="font-bold">
                {check.leftLabel} × {check.rightLabel}:{' '}
              </span>
              {check.ratio}:1 (mínimo {check.minRatio}:1)
              {check.suggestion && (
                <button
                  type="button"
                  onClick={() => onApplySuggestion(check)}
                  className="ml-1.5 rounded-lg border border-border px-1.5 py-0.5 font-bold text-accent hover:bg-accent/10"
                  data-testid={`suggestion-${check.key}`}
                >
                  Usar {check.suggestion.value}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p className="rounded-xl border border-success/30 bg-success/5 p-3 text-[11px] font-bold text-success">
        Contraste aprovado (WCAG AA).
      </p>
    )}
    {dirty && (
      <p className="mt-2 text-[11px] font-medium text-warning" data-testid="dirty-warning">
        Alterações não salvas.
      </p>
    )}
  </div>
);
