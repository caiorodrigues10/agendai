import React from 'react';
import type { PreviewDeviceMode } from './previewMockup';

const DEVICE_LABEL: Record<PreviewDeviceMode, string> = {
  mobile: 'Mobile',
  desktop: 'Desktop',
};

export interface VariantToggleProps {
  variant: 'light' | 'dark';
  auto?: boolean;
  onChange: (variant: 'light' | 'dark') => void;
  onAuto?: () => void;
  disabled?: boolean;
  /** Prefixo dos testids; o modal usa `preview-modal` para não duplicar. */
  testIdPrefix?: string;
  /** Exibe Auto mesmo quando o chamador não fornece `onAuto`. */
  showAuto?: boolean;
}

/** Auto | Claro | Escuro no topo da prévia (Auto = seguindo o tema do app). */
export function VariantToggle({
  variant,
  auto,
  onChange,
  onAuto,
  disabled = false,
  testIdPrefix = 'preview',
  showAuto,
}: VariantToggleProps) {
  const options = [
    ...((showAuto ?? Boolean(onAuto)) ? [{ key: 'auto', label: 'Auto' }] : []),
    { key: 'light', label: 'Claro' },
    { key: 'dark', label: 'Escuro' },
  ] as const;
  const activeKey: string = auto ? 'auto' : variant;
  return (
    <div
      className="flex shrink-0 rounded-lg border border-border bg-surface-2 p-0.5"
      role="group"
      aria-label="Tema da prévia"
      title={
        disabled
          ? 'Variante definida pelo Modo da página'
          : auto
            ? 'Seguindo o tema do app'
            : undefined
      }
    >
      {options.map(option => (
        <button
          key={option.key}
          type="button"
          aria-pressed={activeKey === option.key}
          data-testid={`${testIdPrefix}-variant-${option.key}`}
          disabled={disabled || (option.key === 'auto' && !onAuto)}
          onClick={() =>
            option.key === 'auto' ? onAuto?.() : onChange(option.key === 'light' ? 'light' : 'dark')
          }
          className={`min-h-11 min-w-11 rounded-md px-2.5 py-1 text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
            activeKey === option.key
              ? 'bg-accent text-accent-fg'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export interface DeviceToggleProps {
  mode: PreviewDeviceMode;
  onChange: (mode: PreviewDeviceMode) => void;
  /** Prefixo dos testids; o modal usa `preview-modal` para não duplicar. */
  testIdPrefix?: string;
}

/** Toggle Mobile | Desktop no topo da prévia. */
export function DeviceToggle({ mode, onChange, testIdPrefix = 'preview' }: DeviceToggleProps) {
  return (
    <div
      className="flex shrink-0 rounded-lg border border-border bg-surface-2 p-0.5"
      role="group"
      aria-label="Dispositivo da prévia"
    >
      {(['mobile', 'desktop'] as const).map(device => (
        <button
          key={device}
          type="button"
          aria-pressed={mode === device}
          data-testid={`${testIdPrefix}-device-${device}`}
          onClick={() => onChange(device)}
          className={`min-h-11 min-w-11 rounded-md px-2.5 py-1 text-[11px] font-bold ${
            mode === device ? 'bg-accent text-accent-fg' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {DEVICE_LABEL[device]}
        </button>
      ))}
    </div>
  );
}
