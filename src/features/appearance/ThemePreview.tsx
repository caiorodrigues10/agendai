import React from 'react';
import type { PageThemeInput, RadiusStyle } from '../../infra/pageThemeApi';
import { cloudinaryDeliveryUrl, coverSrcSet, pageThemeToCssVars, radiusCssVars } from './themeVars';
import type { ThemeColorSource } from './themeVars';

interface ThemePreviewProps {
  theme: ThemeColorSource & {
    radiusStyle: RadiusStyle;
    buttonStyle: PageThemeInput['buttonStyle'];
    coverOverlay: number;
    coverUrl?: string | null;
  };
  shopName: string;
}

const RADIUS_LABEL: Record<RadiusStyle, string> = {
  squared: '0',
  rounded: '12px',
  pill: '999px',
};

/**
 * Preview ao vivo do tema (miniatura da página pública). Espelha as mesmas
 * CSS variables aplicadas em `ShopPageTheme`, então o que o dono vê aqui é o
 * que o cliente vê no link público.
 */
export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, shopName }) => {
  const vars = { ...pageThemeToCssVars(theme), ...radiusCssVars(theme.radiusStyle) };
  const radius = RADIUS_LABEL[theme.radiusStyle];
  const outline = theme.buttonStyle === 'outline';

  return (
    <div
      data-testid="theme-preview"
      data-ag-shop-theme
      data-radius={theme.radiusStyle}
      data-button-style={theme.buttonStyle}
      className="overflow-hidden rounded-2xl border border-border shadow-card"
      style={vars}
    >
      <div className="bg-bg px-4 pb-4">
        {theme.coverUrl ? (
          <div className="relative -mx-4 mb-3 h-24 overflow-hidden">
            <img
              src={cloudinaryDeliveryUrl(theme.coverUrl, 640)}
              srcSet={coverSrcSet(theme.coverUrl)}
              sizes="(max-width: 640px) 100vw, 320px"
              alt=""
              className="ag-shop-cover-img absolute inset-0 h-full w-full"
            />
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: theme.coverOverlay / 100 }}
              aria-hidden="true"
            />
          </div>
        ) : null}
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center text-sm font-bold"
            style={{
              borderRadius: radius,
              backgroundColor: theme.accentColor,
              color: 'var(--ag-accent-fg)',
            }}
          >
            {shopName.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text-primary">{shopName}</p>
            <p className="flex items-center gap-1 text-xs text-text-muted">
              <span style={{ color: theme.accentColor }} aria-hidden="true">
                ★
              </span>
              4,9 · Barbearia
            </p>
          </div>
        </div>

        <div
          className="mb-3 flex gap-1 p-1"
          style={{ backgroundColor: theme.surfaceColor, borderRadius: radius }}
        >
          <span
            className="flex-1 py-1.5 text-center text-[11px] font-bold"
            style={{
              borderRadius: radius,
              backgroundColor: theme.accentColor,
              color: 'var(--ag-accent-fg)',
            }}
          >
            Fila
          </span>
          <span className="flex-1 py-1.5 text-center text-[11px] font-bold text-text-muted">
            Agenda
          </span>
          <span className="flex-1 py-1.5 text-center text-[11px] font-bold text-text-muted">
            Perfil
          </span>
        </div>

        <div
          className="mb-2 p-3"
          style={{ backgroundColor: theme.surfaceColor, borderRadius: radius }}
        >
          <div className="mb-1 h-2 w-2/3 rounded" style={{ backgroundColor: 'var(--ag-border-strong)' }} />
          <div className="h-2 w-1/3 rounded" style={{ backgroundColor: theme.textMutedColor, opacity: 0.6 }} />
        </div>

        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="w-full py-2.5 text-sm font-bold"
          style={{
            borderRadius: radius,
            backgroundColor: outline ? 'transparent' : theme.accentColor,
            color: outline ? theme.accentColor : 'var(--ag-accent-fg)',
            border: outline ? `1px solid ${theme.accentColor}` : 'none',
          }}
        >
          Entrar na fila
        </button>
      </div>
    </div>
  );
};
