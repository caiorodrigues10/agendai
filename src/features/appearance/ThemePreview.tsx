import React, { useMemo, useRef, useState } from 'react';
import { LuMaximize2, LuTriangleAlert } from 'react-icons/lu';
import type { ShopSettings } from '../../types';
import type { ContrastCheck } from '../../shared/pageThemeContrast';
import { useThemeOptional } from '../../contexts/ThemeContext';
import { ContrastStatusPanel } from './panelSections';
import { buildPreviewSettings } from './previewData';
import { DeviceToggle, VariantToggle } from './previewControls';
import { PreviewFullscreenModal } from './PreviewFullscreenModal';
import {
  MockupDevice,
  PREVIEW_DEVICES,
  PreviewScreen,
  type PreviewDeviceMode,
  type PreviewTheme,
} from './previewMockup';
import { useFitScale } from './useFitScale';

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
  /** Avisos não bloqueantes do destaque na variante ativa. */
  warnings?: ContrastCheck[];
  /** Pares reprovados na OUTRA variante (bloqueia o Salvar, sem sugestão ativa). */
  otherFailing?: ContrastCheck[];
  /** Avisos não bloqueantes do destaque na outra variante. */
  otherWarnings?: ContrastCheck[];
  dirty: boolean;
  onApplySuggestion: (check: ContrastCheck) => void;
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
  warnings = [],
  otherFailing,
  otherWarnings = [],
  dirty,
  onApplySuggestion,
}) => {
  const [mode, setMode] = useState<PreviewDeviceMode>('mobile');
  const [open, setOpen] = useState(true);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  // Modo ativo vem TODO do editor (controlado); sem prop (uso isolado/testes)
  // segue o tema do app — nunca estado guardado que deixe de reagir à troca.
  const themeCtx = useThemeOptional();
  const activeVariant = variant ?? themeCtx?.resolvedTheme ?? 'dark';
  const handleVariantChange = (next: 'light' | 'dark') => onVariantChange?.(next);
  const frameRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const previewSettings = useMemo(
    () => buildPreviewSettings(settings, shopName),
    [settings, shopName]
  );

  // A mesma lógica de escala serve à prévia inline e ao modal. O hook mede a
  // área, agenda via rAF e escreve apenas no estilo: trocar o dispositivo ou
  // redimensionar a janela não causa re-render nem pisca.
  useFitScale(frameRef, PREVIEW_DEVICES[mode], {
    layerRef,
    measureRef: fitRef,
    strategy: 'responsive',
    enabled: open,
  });

  const closeFullscreen = () => setFullscreenOpen(false);

  // Abaixo de lg a coluna é auto-altura (a PÁGINA rola até a moldura —
  // nunca scroll duplo) e em lg a altura é fixa: o wrapper da moldura
  // ocupa o resto (flex-1) e a moldura é dimensionada para caber.
  return (
    <div
      data-testid="preview-column"
      className="order-first flex flex-col gap-3 self-start lg:order-none lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)]"
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
          <button
            type="button"
            aria-label="Abrir prévia em tela cheia"
            aria-haspopup="dialog"
            aria-expanded={fullscreenOpen}
            data-testid="preview-fullscreen"
            onClick={() => setFullscreenOpen(true)}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <LuMaximize2 size={16} aria-hidden="true" />
          </button>
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
        className="flex min-h-11 items-center justify-between rounded-xl border border-border px-3 py-2 text-xs font-bold text-text-secondary hover:bg-surface-2 lg:hidden"
      >
        {open ? 'Ocultar prévia' : 'Mostrar prévia'}
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          ref={fitRef}
          data-testid="preview-frame-fit"
          className="mx-auto flex min-h-0 w-full max-w-[360px] items-center justify-center lg:max-w-none lg:flex-1"
        >
          <div
            ref={frameRef}
            data-testid="preview-frame"
            role="img"
            aria-label="Prévia da página pública"
            className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-card"
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
        </div>
      )}

      <ContrastStatusPanel
        failing={failing}
        warnings={warnings}
        dirty={dirty}
        onApplySuggestion={onApplySuggestion}
      />
      {(otherFailing?.length ?? 0) > 0 && (
        <p
          className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-[11px] font-bold text-danger"
          data-testid="contrast-other-variant"
        >
          Variante {activeVariant === 'dark' ? 'clara' : 'escura'}: contraste insuficiente (WCAG AA)
          — corrija para habilitar o Salvar.
        </p>
      )}
      {otherWarnings.length > 0 && (
        <p
          className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-[11px] font-bold text-warning"
          data-testid="contrast-other-variant-warning"
        >
          Variante {activeVariant === 'dark' ? 'clara' : 'escura'}: a cor de destaque tem pouco
          contraste. A página usará o fallback legível; o salvamento permanece disponível.
        </p>
      )}

      <PreviewFullscreenModal
        open={fullscreenOpen}
        onClose={closeFullscreen}
        theme={theme}
        settings={previewSettings}
        slug={slug}
        coverBusy={coverBusy}
        variant={activeVariant}
        onVariantChange={handleVariantChange}
        autoActive={autoActive}
        onAuto={onAuto}
        variantLocked={variantLocked}
        mode={mode}
        onModeChange={setMode}
      />
    </div>
  );
};

export default ThemePreview;
