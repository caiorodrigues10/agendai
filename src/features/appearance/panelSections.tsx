import React from 'react';
import { LuCheck, LuCircleCheck, LuLoaderCircle, LuRotateCcw, LuSave, LuTriangleAlert } from 'react-icons/lu';
import type { ContrastCheck } from '../../shared/pageThemeContrast';
import { THEME_PRESETS, type ThemePreset } from './presets';

/** Cabeçalho do painel: título + Restaurar padrão + Salvar. */
export const PanelHeader: React.FC<{
  saving: boolean;
  canSave: boolean;
  /** Motivo exibido no `title` quando o Salvar está desabilitado. */
  disabledReason?: string;
  onRestore: () => void;
  onSave: () => void;
  }> = ({ saving, canSave, disabledReason, onRestore, onSave }) => (
    <div
      data-testid="appearance-action-bar"
      className="sticky top-[var(--app-header-h,67px)] z-30 -mx-4 mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:-mx-6 sm:px-6"
    >
    <div>
      <h2 id="appearance-title" className="text-lg font-bold text-text-primary">
        Aparência da página
      </h2>
      <p className="hidden text-sm text-text-muted sm:block">
        Personalize cores, capa e cantos do link público do salão.
      </p>
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
        title={disabledReason}
        className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="save-theme"
      >
        {saving ? (
          <LuLoaderCircle size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <LuSave size={16} />
        )}
        {saving ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  </div>
);

/** Paletas prontas (swatch + rótulo). As bolinhas refletem a variante em edição (Auto segue o tema do app). */
export const PresetPicker: React.FC<{
  onPick: (preset: ThemePreset) => void;
  selectedKey?: string | null;
  /** Variante da prévia/modo em edição — chip mostra `preset[variant]`. */
  variant: 'light' | 'dark';
}> = ({ onPick, selectedKey, variant }) => (
  <div>
    <h3 className="mb-2 text-sm font-bold text-text-primary">Paletas prontas</h3>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Paletas prontas">
      {THEME_PRESETS.map(preset => {
        const selected = preset.key === selectedKey;
        const colors = preset[variant];
        const dot = 'h-4 w-4 rounded-full ring-1 ring-black/15 dark:ring-white/20';
        return (
          <button
            key={preset.key}
            type="button"
            onClick={() => onPick(preset)}
            aria-pressed={selected}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
              selected
                ? 'border-accent bg-accent/10 text-accent ring-1 ring-accent'
                : 'border-border text-text-secondary hover:border-border-strong hover:bg-surface-2'
            }`}
            data-testid={`preset-${preset.key}`}
          >
            <span className="flex" aria-hidden="true">
              <span className={dot} style={{ backgroundColor: colors.backgroundColor }} />
              <span className={`${dot} -ml-1.5`} style={{ backgroundColor: colors.surfaceColor }} />
              <span className={`${dot} -ml-1.5`} style={{ backgroundColor: colors.accentColor }} />
            </span>
            {preset.label}
            {selected && <LuCheck size={13} className="shrink-0" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  </div>
);

/** Modo da página (semântica igual ao backend: AUTO segue o sistema). */
export const PAGE_MODE_OPTIONS = [
  { value: 'AUTO', label: 'Automático' },
  { value: 'LIGHT', label: 'Sempre claro' },
  { value: 'DARK', label: 'Sempre escuro' },
] as const;

/**
 * Controle segmentado (modo / cantos / estilo de botão) em `role="radiogroup"`:
 * grid de colunas iguais com largura total, altura única `h-11`, texto de uma
 * linha (`whitespace-nowrap`, sem `truncate` — nunca corta "Sempre escuro").
 * Usa container query: empilha em `grid-cols-1` enquanto o container não cabe
 * (form estreito/`lg`), e vira 2/3 colunas a partir de 448px (`@md`). Navegação
 * por setas move foco e seleção.
 */
export const SegmentedOptions: React.FC<{
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  testIdPrefix: string;
}> = ({ legend, options, value, onChange, testIdPrefix }) => {
  const move = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const deltas: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    const current = Math.max(0, options.findIndex(opt => opt.value === value));
    const nextIndex = (current + delta + options.length) % options.length;
    onChange(options[nextIndex].value);
    const group = event.currentTarget;
    group.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
  };
  return (
    <fieldset className="@container min-w-0">
      <legend className="mb-1.5 text-sm font-medium text-text-secondary">{legend}</legend>
      <div
        role="radiogroup"
        aria-label={legend}
        tabIndex={-1}
        onKeyDown={move}
        className={`grid w-full grid-cols-1 gap-2 ${options.length <= 2 ? '@md:grid-cols-2' : '@md:grid-cols-3'}`}
      >
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            tabIndex={value === opt.value ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={`h-11 min-w-0 whitespace-nowrap rounded-xl border px-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:z-10 ${
              value === opt.value
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-surface text-text-secondary hover:border-border-strong hover:bg-surface-2'
            }`}
            data-testid={`${testIdPrefix}-${opt.value}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
};

/** Status de contraste WCAG AA (aria-live) + sugestões em 1 clique. Fica ABAIXO da moldura da prévia. */
export const ContrastStatusPanel: React.FC<{
  failing: ContrastCheck[];
  dirty: boolean;
  onApplySuggestion: (check: ContrastCheck) => void;
}> = ({ failing, dirty, onApplySuggestion }) => (
  <div aria-live="polite" data-testid="contrast-status" className="space-y-2">
    {failing.length > 0 ? (
      <div className="rounded-xl border border-danger/40 bg-danger/10 p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-danger">
          <LuTriangleAlert size={14} className="shrink-0" aria-hidden="true" />
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
      <p className="flex items-center gap-1.5 rounded-xl border border-success/40 bg-success/10 p-3 text-[11px] font-bold text-success">
        <LuCircleCheck size={14} className="shrink-0" aria-hidden="true" />
        Contraste aprovado (WCAG AA).
      </p>
    )}
    {dirty && (
      <p
        className="flex items-center gap-1.5 rounded-xl border border-warning/40 bg-warning/10 p-3 text-[11px] font-bold text-warning"
        data-testid="dirty-warning"
      >
        <LuTriangleAlert size={13} className="shrink-0" aria-hidden="true" />
        Alterações não salvas.
      </p>
    )}
  </div>
);
