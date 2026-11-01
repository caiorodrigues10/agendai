import { useEffect, useState } from 'react';

export interface VisualViewportBounds {
  top: number;
  height: number;
}

/** Keeps fixed mobile overlays inside the visible area when the on-screen keyboard opens. */
export function useVisualViewport(enabled = true): VisualViewportBounds | null {
  const [bounds, setBounds] = useState<VisualViewportBounds | null>(null);

  useEffect(() => {
    if (!enabled) {
      setBounds(null);
      return;
    }
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => setBounds({ top: viewport.offsetTop, height: viewport.height });
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return bounds;
}
