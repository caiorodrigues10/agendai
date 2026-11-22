/// <reference types="vitest/globals" />
import React, { useLayoutEffect, useRef } from 'react';
import { render, screen } from '@testing-library/react';
import { useFitScale, type FitScaleStrategy } from './useFitScale';

interface ScaleProbeProps {
  width: number;
  height: number;
  logicalWidth: number;
  logicalHeight: number;
  strategy: FitScaleStrategy;
  borderWidth?: number;
  padding?: number;
}

function ScaleProbe({
  width,
  height,
  logicalWidth,
  logicalHeight,
  strategy,
  borderWidth = 0,
  padding = 0,
}: ScaleProbeProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // jsdom não calcula layout; exponha as dimensões antes do effect do hook.
  useLayoutEffect(() => {
    Object.defineProperty(measureRef.current!, 'clientWidth', {
      configurable: true,
      value: width,
    });
    Object.defineProperty(measureRef.current!, 'clientHeight', {
      configurable: true,
      value: height,
    });
  }, [height, width]);

  useFitScale(
    frameRef,
    { w: logicalWidth, h: logicalHeight },
    {
      layerRef,
      measureRef,
      strategy,
    }
  );

  return (
    <div ref={measureRef} data-testid="measure">
      <div
        ref={frameRef}
        data-testid="frame"
        style={{
          ...(borderWidth ? { border: `${borderWidth}px solid currentColor` } : {}),
          ...(padding ? { padding: `${padding}px` } : {}),
        }}
      >
        <div ref={layerRef} data-testid="layer" />
      </div>
    </div>
  );
}

describe('useFitScale', () => {
  it('usa a altura como eixo principal do mockup mobile em paisagem', () => {
    render(
      <ScaleProbe
        width={844}
        height={390}
        logicalWidth={402}
        logicalHeight={835}
        strategy="height"
      />
    );

    const frame = screen.getByTestId('frame');
    expect(Number.parseFloat(frame.style.width)).toBeCloseTo(187.7605);
    expect(Number.parseFloat(frame.style.height)).toBeCloseTo(390);
    expect(screen.getByTestId('layer').style.transform).toMatch(/^scale\(/);
  });

  it('usa a largura como eixo principal do mockup desktop', () => {
    render(
      <ScaleProbe
        width={390}
        height={800}
        logicalWidth={1024}
        logicalHeight={1100}
        strategy="width"
      />
    );

    const frame = screen.getByTestId('frame');
    expect(Number.parseFloat(frame.style.width)).toBeCloseTo(390);
    expect(Number.parseFloat(frame.style.height)).toBeCloseTo(418.9453);
  });

  it('conta a borda da moldura sem cortar a camada transformada', () => {
    render(
      <ScaleProbe
        width={390}
        height={800}
        logicalWidth={1024}
        logicalHeight={1100}
        strategy="width"
        borderWidth={1}
      />
    );

    const frame = screen.getByTestId('frame');
    const layer = screen.getByTestId('layer');
    const scale = Number.parseFloat(layer.style.transform.slice('scale('.length, -1));
    expect(Number.parseFloat(frame.style.width)).toBeCloseTo(390);
    expect(frame.style.boxSizing).toBe('border-box');
    expect(layer.style.left).toBe('0px');
    expect(1024 * scale).toBeCloseTo(388);
  });

  it('conta borda e padding e posiciona a camada dentro da área útil', () => {
    render(
      <ScaleProbe
        width={390}
        height={800}
        logicalWidth={1024}
        logicalHeight={1100}
        strategy="width"
        borderWidth={1}
        padding={4}
      />
    );

    const frame = screen.getByTestId('frame');
    const layer = screen.getByTestId('layer');
    const scale = Number.parseFloat(layer.style.transform.slice('scale('.length, -1));
    expect(Number.parseFloat(frame.style.width)).toBeCloseTo(390);
    expect(frame.style.boxSizing).toBe('border-box');
    expect(layer.style.left).toBe('4px');
    expect(layer.style.top).toBe('4px');
    expect(1024 * scale).toBeCloseTo(380);
  });

  it('usa o eixo oposto como limite de segurança para não cortar a moldura', () => {
    render(
      <ScaleProbe
        width={844}
        height={390}
        logicalWidth={1024}
        logicalHeight={1100}
        strategy="width"
      />
    );

    const frame = screen.getByTestId('frame');
    expect(Number.parseFloat(frame.style.width)).toBeCloseTo(363.0545);
    expect(Number.parseFloat(frame.style.height)).toBeCloseTo(390);
  });
});
