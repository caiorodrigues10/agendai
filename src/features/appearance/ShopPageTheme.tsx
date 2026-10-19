import React, { useEffect, useState } from 'react';
import type { PageThemeVariant } from '../../infra/pageThemeApi';
import { cloudinaryDeliveryUrl, coverSrcSet, pageThemeToCssVars, radiusCssVars } from './themeVars';
import { resolveVariantColors } from './pageThemeVariants';
import { usePageTheme } from './usePageTheme';

interface ShopPageThemeProps {
  barbershopId: string | null | undefined;
  children: React.ReactNode;
}

/** Preferência do sistema (modo AUTO da página do salão), com listener vivo. */
function usePrefersLightScheme(): boolean {
  const [prefersLight, setPrefersLight] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-color-scheme: light)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (event: MediaQueryListEvent) => setPrefersLight(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return prefersLight;
}

/**
 * Wrapper da página pública (`/queue/:id`). Aplica o tema salvo pelo dono via
 * CSS variables escopadas; sem tema salvo renderiza filhos intactos (zero
 * regressão visual). Enquanto o tema está carregando, `loading` fica true para
 * a página manter o skeleton (evita FOUC do tema padrão).
 *
 * Variante de cor: `mode` do dono — `LIGHT`/`DARK` força; `AUTO` segue o
 * sistema (`prefers-color-scheme`). Sem tema salvo a página mantém a
 * aparência atual do app (classe `.dark` do documento).
 */
export const ShopPageTheme: React.FC<ShopPageThemeProps> = ({ barbershopId, children }) => {
  const { theme } = usePageTheme(barbershopId);
  const prefersLight = usePrefersLightScheme();

  if (!theme) {
    return (
      <div className="min-h-screen pb-[max(5rem,env(safe-area-inset-bottom))] bg-bg text-text-primary">
        {children}
      </div>
    );
  }

  const variant: PageThemeVariant =
    theme.mode === 'LIGHT'
      ? 'light'
      : theme.mode === 'DARK'
        ? 'dark'
        : prefersLight
          ? 'light'
          : 'dark';
  const colors = resolveVariantColors(theme, variant);
  const overlayAlpha = Math.min(Math.max(theme.coverOverlay, 0), 80) / 100;

  return (
    <div
      data-ag-shop-theme
      data-testid="shop-page-theme"
      data-radius={theme.radiusStyle}
      data-button-style={theme.buttonStyle}
      data-variant={variant}
      className="min-h-screen pb-[max(5rem,env(safe-area-inset-bottom))] bg-bg text-text-primary"
      style={{ ...pageThemeToCssVars(colors, variant), ...radiusCssVars(theme.radiusStyle) }}
    >
      {theme.coverUrl && (
        <div
          // Proporção espelhada de COVER_ASPECT (themeVars.ts): 16/6 mobile,
          // 16/4 desktop (Tailwind precisa de classes estáticas).
          className="relative w-full aspect-[16/6] sm:aspect-[16/4] overflow-hidden"
          data-testid="shop-page-cover"
        >
          <img
            src={cloudinaryDeliveryUrl(theme.coverUrl, 1600)}
            srcSet={coverSrcSet(theme.coverUrl)}
            sizes="100vw"
            alt=""
            loading="eager"
            fetchPriority="high"
            className="ag-shop-cover-img absolute inset-0 h-full w-full"
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayAlpha }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-bg to-transparent"
            aria-hidden="true"
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default ShopPageTheme;
