import { useEffect, useMemo, useState } from 'react';

export interface VisualViewportBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Keeps fixed mobile overlays inside the visible area when the on-screen keyboard opens. */
export function useVisualViewport(enabled = true): VisualViewportBounds | null {
  const activation = useMemo(() => ({ enabled, token: {} }).token, [enabled]);
  const [snapshot, setSnapshot] = useState<{
    token: object;
    bounds: VisualViewportBounds;
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () =>
      setSnapshot({
        token: activation,
        bounds: {
          top: viewport.offsetTop ?? 0,
          left: viewport.offsetLeft ?? 0,
          width: viewport.width || window.innerWidth,
          height: viewport.height || window.innerHeight,
        },
      });
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    // A rotação pode não disparar `resize` em algumas versões mobile; o
    // listener da janela cobre esse caso sem depender do VisualViewport.
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [activation, enabled]);

  return enabled && snapshot?.token === activation ? snapshot.bounds : null;
}
