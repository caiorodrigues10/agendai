import React, { useRef } from 'react';
import type { ShopSettings } from '../../types';
import { ModalShell } from '../../components/patterns/ModalShell';
import { DeviceToggle, VariantToggle } from './previewControls';
import {
  MockupDevice,
  PREVIEW_DEVICES,
  PreviewScreen,
  type PreviewDeviceMode,
  type PreviewTheme,
} from './previewMockup';
import { useFitScale } from './useFitScale';

export interface PreviewFullscreenModalProps {
  open: boolean;
  onClose: () => void;
  theme: PreviewTheme;
  settings: ShopSettings;
  slug?: string;
  coverBusy?: boolean;
  variant: 'light' | 'dark';
  onVariantChange?: (variant: 'light' | 'dark') => void;
  autoActive?: boolean;
  onAuto?: () => void;
  variantLocked?: boolean;
  mode: PreviewDeviceMode;
  onModeChange: (mode: PreviewDeviceMode) => void;
}

interface PreviewCanvasProps {
  theme: PreviewTheme;
  settings: ShopSettings;
  slug?: string;
  coverBusy?: boolean;
  variant: 'light' | 'dark';
  mode: PreviewDeviceMode;
}

function PreviewCanvas({ theme, settings, slug, coverBusy, variant, mode }: PreviewCanvasProps) {
  const fitRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useFitScale(frameRef, PREVIEW_DEVICES[mode], {
    layerRef,
    measureRef: fitRef,
    // Mobile usa a altura como eixo principal (paisagem); Desktop usa a
    // largura. O eixo oposto continua sendo um limite de segurança para a
    // moldura não ser cortada.
    strategy: mode === 'mobile' ? 'height' : 'width',
  });

  return (
    <div
      ref={fitRef}
      data-testid="preview-modal-fit"
      className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden overscroll-contain"
    >
      <div
        ref={frameRef}
        data-testid="preview-modal-frame"
        className="relative shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-2xl"
      >
        <div
          ref={layerRef}
          data-testid="preview-modal-layer"
          className="absolute left-0 top-0"
          style={{ transformOrigin: 'top left' }}
        >
          <MockupDevice
            mode={mode}
            slug={slug}
            testIdPrefix="preview-modal-mockup"
            screen={
              <PreviewScreen
                mode={mode}
                variant={variant}
                theme={theme}
                settings={settings}
                coverBusy={coverBusy}
                testIdPrefix="preview-modal-content"
                coverTestId="preview-modal-cover"
              />
            }
          />
        </div>
      </div>
    </div>
  );
}

/** Modal de tela cheia com o mesmo estado e o mesmo mockup da prévia-inline. */
export function PreviewFullscreenModal({
  open,
  onClose,
  theme,
  settings,
  slug,
  coverBusy,
  variant,
  onVariantChange,
  autoActive,
  onAuto,
  variantLocked,
  mode,
  onModeChange,
}: PreviewFullscreenModalProps) {
  return (
    <ModalShell
      open={open}
      variant="fullscreen"
      title="Prévia da página"
      titleId="preview-fullscreen-title"
      initialFocus="close-button"
      onClose={onClose}
      actions={
        <div className="flex items-center gap-2">
          <VariantToggle
            variant={variant}
            auto={autoActive}
            onChange={next => onVariantChange?.(next)}
            onAuto={onAuto}
            disabled={variantLocked}
            testIdPrefix="preview-modal"
            showAuto
          />
          <DeviceToggle mode={mode} onChange={onModeChange} testIdPrefix="preview-modal" />
        </div>
      }
      body={
        <div className="flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden overscroll-contain bg-media-overlay/25 p-2 sm:p-4">
          <PreviewCanvas
            theme={theme}
            settings={settings}
            slug={slug}
            coverBusy={coverBusy}
            variant={variant}
            mode={mode}
          />
        </div>
      }
    />
  );
}
