/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react';
import { useVisualViewport } from './useVisualViewport';

class FakeVisualViewport extends EventTarget {
  offsetTop = 12;
  offsetLeft = 4;
  width = 390;
  height = 700;
}

describe('useVisualViewport', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(window, 'visualViewport', originalDescriptor);
    } else {
      delete (window as Window & { visualViewport?: VisualViewport }).visualViewport;
    }
  });

  it('expõe os limites horizontais e atualiza em resize', () => {
    const viewport = new FakeVisualViewport();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });

    const { result } = renderHook(() => useVisualViewport());
    expect(result.current).toEqual({ top: 12, left: 4, width: 390, height: 700 });

    viewport.width = 844;
    viewport.height = 390;
    act(() => viewport.dispatchEvent(new Event('resize')));

    expect(result.current).toEqual({ top: 12, left: 4, width: 844, height: 390 });
  });

  it('não assina enquanto está desativado e não reaproveita limites antigos', () => {
    const viewport = new FakeVisualViewport();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });

    const { result, rerender } = renderHook(({ enabled }) => useVisualViewport(enabled), {
      initialProps: { enabled: false },
    });
    expect(result.current).toBeNull();

    viewport.width = 844;
    act(() => viewport.dispatchEvent(new Event('resize')));
    expect(result.current).toBeNull();

    rerender({ enabled: true });
    expect(result.current).toEqual({ top: 12, left: 4, width: 844, height: 700 });

    rerender({ enabled: false });
    expect(result.current).toBeNull();

    viewport.width = 390;
    act(() => viewport.dispatchEvent(new Event('resize')));
    expect(result.current).toBeNull();

    rerender({ enabled: true });
    expect(result.current).toEqual({ top: 12, left: 4, width: 390, height: 700 });
  });
});
