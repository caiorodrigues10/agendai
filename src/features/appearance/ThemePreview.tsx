import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import type { ShopSettings } from '../../types';
import type { ContrastCheck } from '../../shared/pageThemeContrast';
import { useThemeOptional } from '../../contexts/ThemeContext';
import { ContrastStatusPanel } from './panelSections';
import { buildPreviewSettings } from './previewData';
import {
  MockupDevice,
  PREVIEW_DEVICES,
  PreviewScreen,
  type PreviewDeviceMode,
  type PreviewTheme,
} from './previewMockup';

interface ThemePreviewProps {
  theme: PreviewTheme;
  shopName: string;
  /** Settings reais do salão (painel); sem eles cai no fallback de exemplo. */
  settings?: ShopSettings | null;
  /** Id real da barbearia → URL do mockup desktop igual à página pública. */
  slug?: string;
  /** True enquanto envia/remova a capa → skeleton na prévia. */
  coverBusy?: boolean;
  /** Variante de cor da prévia (Claro | Escuro). Sem prop, segue o tema do app. */
  variant?: 'light' | 'dark';
  onVariantChange?: (variant: 'light' | 'dark') => void;
  /** True quando a prévia segue o tema do app (sem override manual nem modo forçado). */
  autoActive?: boolean;
  /** Volta a seguir o tema do app (limpa o override manual). */
  onAuto?: () => void;
  /** Aviso ao lado do seletor quando o Modo da página força o modo. */
  modeNotice?: string | null;
  /** True quando o Modo da página força a variante (toggle bloqueado). */
  variantLocked?: boolean;
  failing: ContrastCheck[];
  /** Pares reprovados na OUTRA variante (bloqueia o Salvar, sem sugestão ativa). */
  otherFailing?: ContrastCheck[];
  dirty: boolean;
  onApplySuggestion: (check: ContrastCheck) => void;
}

const DEVICE_LABEL: Record<PreviewDeviceMode, string> = {
  mobile: 'Mobile',
  desktop: 'Desktop',
};

/** Auto | Claro | Escuro no topo da prévia (Auto = seguindo o tema do app). */
function VariantToggle({
  variant,
  auto,
  onChange,
  onAuto,
  disabled = false,
}: {
  variant: 'light' | 'dark';
  auto?: boolean;
  onChange: (variant: 'light' | 'dark') => void;
  onAuto?: () => void;
  disabled?: boolean;
}) {
  const options = [
    ...(onAuto ? [{ key: 'auto', label: 'Auto' }] : []),
    { key: 'light', label: 'Claro' },
    { key: 'dark', label: 'Escuro' },
  ] as const;
  const activeKey: string = auto ? 'auto' : variant;
  return (
    <div
      className="flex rounded-lg border border-border bg-surface-2 p-0.5"
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
          data-testid={`preview-variant-${option.key}`}
          disabled={disabled}
          onClick={() =>
            option.key === 'auto' ? onAuto?.() : onChange(option.key === 'light' ? 'light' : 'dark')
          }
          className={`rounded-md px-2.5 py-1 text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
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

/** Toggle Mobile | Desktop no topo da prévia. */
function DeviceToggle({
  mode,
  onChange,
}: {
  mode: PreviewDeviceMode;
  onChange: (mode: PreviewDeviceMode) => void;
}) {
  return (
    <div
      className="flex rounded-lg border border-border bg-surface-2 p-0.5"
      role="group"
      aria-label="Dispositivo da prévia"
    >
      {(['mobile', 'desktop'] as const).map(device => (
        <button
          key={device}
          type="button"
          aria-pressed={mode === device}
          data-testid={`preview-device-${device}`}
          onClick={() => onChange(device)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
            mode === device
              ? 'bg-accent text-accent-fg'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {DEVICE_LABEL[device]}
        </button>
      ))}
    </div>
  );
}

/**
 * Prévia ao vivo do tema (coluna sticky ao lado do formulário).
 *
 * - Moldura fixa: retângulo `rounded-2xl` constante, borda e sombra — NUNCA
 *   herda o raio do tema (o tema só vale dentro do mockup).
 * - Mockup mobile (390×823 lógicos) / desktop (1024×1100 lógicos) com o
 *   conteúdo renderizado em tamanho real e escalado via `transform: scale()`
 *   pela largura/altura disponíveis (medidas com ResizeObserver).
 * - Rolagem interna do mockup fica fora do `inert` (inert bloqueia wheel).
 * - Abaixo da moldura: selo de contraste WCAG AA + "Alterações não salvas".
 */
export const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  shopName,
  settings,
  slug,
  coverBusy,
  variant,
  onVariantChange,
  autoActive,
  onAuto,
  modeNotice,
  variantLocked,
  failing,
  otherFailing,
  dirty,
  onApplySuggestion,
}) => {
  const [mode, setMode] = useState<PreviewDeviceMode>('mobile');
  const [open, setOpen] = useState(true);
  // Modo ativo vem TODO do editor (controlado); sem prop (uso isolado/testes)
  // segue o tema do app — nunca estado guardado que deixe de reagir à troca.
  const themeCtx = useThemeOptional();
  const activeVariant = variant ?? themeCtx?.resolvedTheme ?? 'dark';
  const handleVariantChange = (next: 'light' | 'dark') => onVariantChange?.(next);
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const previewSettings = useMemo(() => buildPreviewSettings(settings, shopName), [settings, shopName]);

  // Escala antes do paint (useLayoutEffect) → trocar Mobile/Desktop não pisca.
  // O frame tem o MESMO aspect-ratio do dispositivo, então a escala é sempre
  // largura-driven (sem barras pretas nem sobra). ResizeObserver agendado via
  // rAF (sem loop de re-render: escrevemos só no estilo da camada) e com
  // cancelamento no unmount.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const layer = layerRef.current;
    if (!frame || !layer) return;
    const logical = PREVIEW_DEVICES[mode];
    let rafId = 0;
    const apply = () => {
      rafId = 0;
      const { width } = frame.getBoundingClientRect();
      if (width < 10) {
        layer.style.transform = 'scale(1)';
        return;
      }
      const scale = width / logical.w;
      layer.style.width = `${logical.w}px`;
      layer.style.height = `${logical.h}px`;
      layer.style.transform = `scale(${scale})`;
      layer.style.left = '0px';
      layer.style.top = '0px';
    };
    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(apply);
    };
    apply();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(schedule);
    observer.observe(frame);
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mode, open]);

  return (
    <div
      data-testid="preview-column"
      className="order-first flex max-h-[calc(100vh-8rem)] flex-col gap-3 self-start overflow-y-auto lg:order-none lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-text-primary">Prévia ao vivo</h3>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <VariantToggle
            variant={activeVariant}
            auto={autoActive}
            onChange={handleVariantChange}
            onAuto={onAuto}
            disabled={variantLocked}
          />
          <DeviceToggle mode={mode} onChange={setMode} />
          {modeNotice && (
            <p
              className="flex basis-full items-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-[11px] font-bold text-warning"
              data-testid="mode-notice"
            >
              <LuTriangleAlert size={13} className="shrink-0" aria-hidden="true" />
              {modeNotice}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-expanded={open}
        data-testid="preview-collapse"
        onClick={() => setOpen(value => !value)}
        className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-xs font-bold text-text-secondary hover:bg-surface-2 lg:hidden"
      >
        {open ? 'Ocultar prévia' : 'Mostrar prévia'}
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          ref={frameRef}
          data-testid="preview-frame"
          role="img"
          aria-label="Prévia da página pública"
          className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-card lg:max-w-none"
          style={{ aspectRatio: `${PREVIEW_DEVICES[mode].w} / ${PREVIEW_DEVICES[mode].h}` }}
        >
          <div
            ref={layerRef}
            className="absolute left-0 top-0"
            style={{ transformOrigin: 'top left' }}
          >
            <MockupDevice
              mode={mode}
              slug={slug}
              screen={
                <PreviewScreen
                  mode={mode}
                  variant={activeVariant}
                  theme={theme}
                  settings={previewSettings}
                  coverBusy={coverBusy}
                />
              }
            />
          </div>
        </div>
      )}

      <ContrastStatusPanel failing={failing} dirty={dirty} onApplySuggestion={onApplySuggestion} />
      {(otherFailing?.length ?? 0) > 0 && (
        <p
          className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-[11px] font-bold text-danger"
          data-testid="contrast-other-variant"
        >
          Variante {activeVariant === 'dark' ? 'clara' : 'escura'}: contraste insuficiente
          (WCAG AA) — corrija para habilitar o Salvar.
        </p>
      )}
    </div>
  );
};

export default ThemePreview;
