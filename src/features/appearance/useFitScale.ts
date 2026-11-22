import { useLayoutEffect, type RefObject } from 'react';

export interface PreviewLogicalSize {
  readonly w: number;
  readonly h: number;
}

export type FitScaleStrategy = 'contain' | 'height' | 'width' | 'responsive';

export interface UseFitScaleOptions {
  /** Elemento que recebe o mockup em tamanho lógico e o transform de escala. */
  layerRef: RefObject<HTMLElement | null>;
  /** Área disponível medida pelo ResizeObserver. Por padrão, o próprio frame. */
  measureRef?: RefObject<HTMLElement | null>;
  /**
   * - `contain`: usa a menor escala que cabe em largura e altura;
   * - `height`/`width`: prefere um eixo e usa o outro como limite de segurança
   *   para nunca cortar a moldura;
   * - `responsive`: na coluna pequena usa a largura; quando o wrapper cresce
   *   verticalmente, passa a conter o mockup em ambos os eixos.
   */
  strategy?: FitScaleStrategy;
  /** Permite adiar a medição enquanto o elemento não está montado. */
  enabled?: boolean;
}

interface FrameInsets {
  readonly borderX: number;
  readonly borderY: number;
  readonly paddingX: number;
  readonly paddingY: number;
  readonly paddingLeft: number;
  readonly paddingTop: number;
}

function cssPixels(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getFrameInsets(container: HTMLElement): FrameInsets {
  const style = getComputedStyle(container);
  const borderLeft = cssPixels(style.borderLeftWidth);
  const borderRight = cssPixels(style.borderRightWidth);
  const borderTop = cssPixels(style.borderTopWidth);
  const borderBottom = cssPixels(style.borderBottomWidth);
  const paddingLeft = cssPixels(style.paddingLeft);
  const paddingRight = cssPixels(style.paddingRight);
  const paddingTop = cssPixels(style.paddingTop);
  const paddingBottom = cssPixels(style.paddingBottom);

  return {
    borderX: borderLeft + borderRight,
    borderY: borderTop + borderBottom,
    paddingX: paddingLeft + paddingRight,
    paddingY: paddingTop + paddingBottom,
    paddingLeft,
    paddingTop,
  };
}

function calculateScale(
  availableWidth: number,
  availableHeight: number,
  logicalWidth: number,
  logicalHeight: number,
  strategy: FitScaleStrategy,
  heightBound: boolean
): number {
  const widthScale = availableWidth >= 10 ? availableWidth / logicalWidth : null;
  const heightScale = availableHeight >= 10 ? availableHeight / logicalHeight : null;

  if (strategy === 'width') {
    // Desktop prioriza a largura. Se a altura não couber, usa a altura como
    // limite para não recortar a moldura nem criar scroll externo.
    const scale = widthScale ?? heightScale ?? 1;
    return heightScale !== null && logicalHeight * scale > availableHeight ? heightScale : scale;
  }

  if (strategy === 'height') {
    // Mobile prioriza a altura (essencial no modo paisagem). A largura é
    // o limite de segurança para a moldura continuar inteira.
    const scale = heightScale ?? widthScale ?? 1;
    return widthScale !== null && logicalWidth * scale > availableWidth ? widthScale : scale;
  }

  if (heightBound) {
    if (widthScale !== null && heightScale !== null) return Math.min(widthScale, heightScale);
    return widthScale ?? heightScale ?? 1;
  }

  return widthScale ?? 1;
}

/**
 * Escala um mockup de tamanho lógico para a maior área disponível.
 *
 * A medição e a escrita acontecem em `useLayoutEffect` + `ResizeObserver`/rAF:
 * nenhum estado é atualizado e, portanto, a escala não causa re-render. O
 * frame recebe as dimensões já escaladas e a camada interna mantém o tamanho
 * lógico com `transform: scale(...)`.
 */
export function useFitScale(
  containerRef: RefObject<HTMLElement | null>,
  logicalSize: PreviewLogicalSize,
  { layerRef, measureRef = containerRef, strategy = 'contain', enabled = true }: UseFitScaleOptions
): void {
  const logicalWidth = logicalSize.w;
  const logicalHeight = logicalSize.h;

  useLayoutEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    const layer = layerRef.current;
    const measure = measureRef.current ?? container;
    if (!container || !layer || !measure) return;

    let rafId = 0;
    const apply = () => {
      rafId = 0;
      const availableWidth = measure.clientWidth;
      const availableHeight = measure.clientHeight;
      const frameInsets = getFrameInsets(container);
      const contentWidth = Math.max(0, availableWidth - frameInsets.borderX - frameInsets.paddingX);
      const contentHeight = Math.max(
        0,
        availableHeight - frameInsets.borderY - frameInsets.paddingY
      );
      const flexGrow = getComputedStyle(measure).flexGrow;
      const heightBound =
        strategy === 'responsive' ? flexGrow !== '0' && flexGrow !== '' : strategy === 'contain';
      const scale = calculateScale(
        contentWidth,
        contentHeight,
        logicalWidth,
        logicalHeight,
        strategy,
        heightBound
      );

      const rawScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
      // Uma única escala, arredondada para baixo, dimensiona a moldura e a
      // camada. Assim o transform nunca ultrapassa a área útil por alguns
      // centésimos de pixel nem diverge do border-box da moldura.
      const safeScale = Math.max(1e-6, Math.floor(rawScale * 1_000_000) / 1_000_000);
      container.style.boxSizing = 'border-box';
      container.style.width = `${Math.max(
        1,
        logicalWidth * safeScale + frameInsets.borderX + frameInsets.paddingX
      )}px`;
      container.style.height = `${Math.max(
        1,
        logicalHeight * safeScale + frameInsets.borderY + frameInsets.paddingY
      )}px`;
      layer.style.width = `${logicalWidth}px`;
      layer.style.height = `${logicalHeight}px`;
      layer.style.transform = `scale(${safeScale})`;
      layer.style.left = `${frameInsets.paddingLeft}px`;
      layer.style.top = `${frameInsets.paddingTop}px`;
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    apply();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(schedule);
    observer.observe(measure);
    observer.observe(container);
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [containerRef, enabled, layerRef, logicalHeight, logicalWidth, measureRef, strategy]);
}
