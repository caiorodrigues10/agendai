import React from 'react';
import { cloudinaryDeliveryUrl, coverSrcSet, pageThemeToCssVars, radiusCssVars } from './themeVars';
import { usePageTheme } from './usePageTheme';

interface ShopPageThemeProps {
  barbershopId: string | null | undefined;
  children: React.ReactNode;
}

/**
 * Wrapper da página pública (`/queue/:id`). Aplica o tema salvo pelo dono via
 * CSS variables escopadas; sem tema salvo renderiza filhos intactos (zero
 * regressão visual). Enquanto o tema está carregando, `loading` fica true para
 * a página manter o skeleton (evita FOUC do tema padrão).
 */
export const ShopPageTheme: React.FC<ShopPageThemeProps> = ({ barbershopId, children }) => {
  const { theme } = usePageTheme(barbershopId);

  if (!theme) {
    return (
      <div className="min-h-screen pb-[max(5rem,env(safe-area-inset-bottom))] bg-bg text-text-primary">
        {children}
      </div>
    );
  }

  const overlayAlpha = Math.min(Math.max(theme.coverOverlay, 0), 80) / 100;

  return (
    <div
      data-ag-shop-theme
      data-testid="shop-page-theme"
      data-radius={theme.radiusStyle}
      data-button-style={theme.buttonStyle}
      className="min-h-screen pb-[max(5rem,env(safe-area-inset-bottom))] bg-bg text-text-primary"
      style={{ ...pageThemeToCssVars(theme), ...radiusCssVars(theme.radiusStyle) }}
    >
      {theme.coverUrl && (
        <div
          className="relative w-full h-40 sm:h-52 md:h-64 overflow-hidden"
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
