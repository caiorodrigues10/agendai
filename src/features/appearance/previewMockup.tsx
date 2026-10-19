import React, { useState } from 'react';
import { MemoryRouter, useInRouterContext } from 'react-router-dom';
import { LuList as List, LuCalendarDays as CalendarDays, LuStore as Store } from 'react-icons/lu';
import type { ShopSettings } from '../../types';
import type { PageThemeInput, RadiusStyle } from '../../infra/pageThemeApi';
import { BarbershopContext } from '../../contexts/BarbershopContext';
import { BarbershopFiltersContext } from '../../contexts/BarbershopFiltersContext';
import { ShopProfile } from '../shop';
import { visiblePublicTabs } from '../../shared/publicTabs';
import { cloudinaryDeliveryUrl, COVER_ASPECT, coverSrcSet, pageThemeToCssVars, radiusCssVars } from './themeVars';
import type { ThemeColorSource } from './themeVars';
import { PREVIEW_POSTS } from './previewData';

/**
 * Dimensões lógicas dos mockups (conteúdo em tamanho real, escalado pelo frame).
 * Mobile: tela 390×823 (9:19) + moldura de celular 6px de cada lado (p-[6px]).
 * Desktop: janela 1024×1100 — largura lógica 1024 = breakpoint lg real da
 * página; altura cobre a primeira dobra completa com a barra de navegador.
 * O frame usa o MESMO aspect-ratio, então a escala é sempre largura-driven
 * (sem barras pretas laterais nem sobra abaixo).
 */
export const PREVIEW_DEVICES = {
  mobile: { w: 402, h: 835 },
  desktop: { w: 1024, h: 1100 },
} as const;

export type PreviewDeviceMode = keyof typeof PREVIEW_DEVICES;

export type PreviewTheme = ThemeColorSource & {
  radiusStyle: RadiusStyle;
  buttonStyle: PageThemeInput['buttonStyle'];
  coverOverlay: number;
  coverUrl?: string | null;
};

const noop = () => undefined;

/** Barbershop mínimo: a prévia não depende da sessão real. */
const PREVIEW_BARBERSHOP = {
  services: [],
  isShopOpen: () => true,
  getTodayScheduleDisplay: () => '09h – 19h',
} as unknown as NonNullable<React.ContextType<typeof BarbershopContext>>;

const PREVIEW_FILTERS: NonNullable<React.ContextType<typeof BarbershopFiltersContext>> = {
  barbershopId: null,
  staffId: null,
  dateRange: null,
  setBarbershopId: noop,
  setStaffId: noop,
  setDateRange: noop,
};

function MemoryRouterOnly({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

/**
 * Providers mínimos da prévia. Router só entra quando a árvore ainda não tem
 * um (o painel já rota dentro do BrowserRouter do app — aninhar Router quebra).
 */
function PreviewProviders({ children }: { children: React.ReactNode }) {
  const inRouter = useInRouterContext();
  return (
    <BarbershopContext.Provider value={PREVIEW_BARBERSHOP}>
      <BarbershopFiltersContext.Provider value={PREVIEW_FILTERS}>
        {inRouter ? children : <MemoryRouterOnly>{children}</MemoryRouterOnly>}
      </BarbershopFiltersContext.Provider>
    </BarbershopContext.Provider>
  );
}

/**
 * Barra de status do celular (altura compacta h-5; sem notch/entalhe — hora à
 * esquerda, 5G + bateria à direita). Cores herdam do tema: texto via
 * `--shop-text` (cor herdada do wrapper) sobre `--shop-bg`.
 */
function PreviewStatusBar() {
  return (
    <div
      className="flex h-5 shrink-0 items-center justify-between px-5 text-[10px] font-semibold"
      aria-hidden="true"
    >
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <span>5G</span>
        <span className="inline-block h-2.5 w-5 rounded-[2px] border border-current opacity-70" />
      </span>
    </div>
  );
}

/**
 * Capa no topo do preview: imagem enviada (com overlay escuro igual à página
 * real + fade proporcional de 30% na base) ou degradê do accent mais baixo
 * (~80px) quando não há capa. Usa a MESMA proporção da página pública
 * (`COVER_ASPECT`, aplicada via style — media query não vale dentro do mockup
 * escalado). Skeleton durante o carregamento e fallback elegante se falhar.
 */
function PreviewCover({
  url,
  overlay,
  busy,
  aspect,
}: {
  url?: string | null;
  overlay: number;
  busy?: boolean;
  aspect: string;
}) {
  // Rastreia por URL: trocar a capa reseta skeleton/fallback sem efeito extra.
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasImg = Boolean(url) && failedUrl !== url;
  const loaded = loadedUrl === url;

  return (
    <div
      data-testid="preview-cover"
      className="relative overflow-hidden"
      style={
        hasImg
          ? { aspectRatio: aspect }
          : { height: 80, backgroundImage: 'linear-gradient(135deg, var(--shop-accent, var(--ag-accent)), var(--shop-surface, var(--ag-surface)))' }
      }
    >
      {busy && (
        <div className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden="true" />
      )}
      {!busy && hasImg && url && (
        <img
          key={url}
          src={cloudinaryDeliveryUrl(url, 1600)}
          srcSet={coverSrcSet(url)}
          sizes="(max-width: 640px) 100vw, 1200px"
          alt=""
          loading="lazy"
          onLoad={() => setLoadedUrl(url)}
          onError={() => setFailedUrl(url)}
          className={`ag-shop-cover-img absolute inset-0 h-full w-full ${loaded ? '' : 'opacity-0'}`}
        />
      )}
      {!busy && !loaded && hasImg && (
        <div className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden="true" />
      )}
      {!busy && hasImg && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: Math.min(Math.max(overlay, 0), 80) / 100 }}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-x-0 bottom-0 h-[30%] bg-linear-to-t from-bg to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Barra de abas da página pública (Fila | Agenda | Perfil) em modo visual —
 * réplica fiel do PublicHome com "Perfil" ativo (mesmas classes/marcadores).
 */
function StaticPublicTabBar({ operationMode }: { operationMode?: ShopSettings['operationMode'] }) {
  const tabs = visiblePublicTabs(operationMode);
  const indicator =
    tabs.length === 3
      ? 'w-[calc(33.3%-2px)] left-[calc(66.6%+2px)]'
      : tabs.length === 2
        ? 'w-[calc(50%-2px)] left-[calc(50%+2px)]'
        : 'w-[calc(100%-8px)] left-1';
  return (
    <div className="relative mb-4 flex rounded-xl border border-border bg-surface p-1">
      {tabs.map(tab => (
        <span
          key={tab}
          className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold ${
            tab === 'profile' ? 'text-accent' : 'text-text-muted'
          }`}
        >
          {tab === 'queue' && (
            <>
              <List size={16} /> Fila
            </>
          )}
          {tab === 'appointments' && (
            <>
              <CalendarDays size={16} /> Agenda
            </>
          )}
          {tab === 'profile' && (
            <>
              <Store size={16} /> Perfil
            </>
          )}
        </span>
      ))}
      <div
        className={`absolute bottom-1 top-1 rounded-lg bg-selection transition-all duration-300 ${indicator}`}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Conteúdo temático da prévia: MESMO componente da página pública
 * (`ShopProfile`) com dados de exemplo, escopado nas CSS variables do tema.
 * O wrapper interno é `inert` (não focável/clicável); o box de scroll fica
 * FORA do inert para o conteúdo continuar rolável (inert bloqueia wheel).
 */
export function PreviewScreen({
  mode,
  variant,
  theme,
  settings,
  coverBusy,
}: {
  mode: PreviewDeviceMode;
  /** Variante de cor da prévia (Claro | Escuro) — mesma semântica da página real. */
  variant: 'light' | 'dark';
  theme: PreviewTheme;
  settings: ShopSettings;
  coverBusy?: boolean;
}) {
  const setInert = (el: HTMLDivElement | null) => {
    if (el) el.setAttribute('inert', '');
  };
  const coverAspect = mode === 'desktop' ? COVER_ASPECT.desktop : COVER_ASPECT.mobile;
  return (
    <div
      data-testid="theme-preview"
      data-ag-shop-theme
      data-ag-preview-content
      data-radius={theme.radiusStyle}
      data-button-style={theme.buttonStyle}
      data-variant={variant}
      className="absolute inset-0 flex flex-col bg-bg text-text-primary"
      style={{ ...pageThemeToCssVars(theme, variant), ...radiusCssVars(theme.radiusStyle) }}
    >
      {mode === 'mobile' && <PreviewStatusBar />}
      <div
        data-ag-preview-scroll
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div ref={setInert} aria-hidden="true">
          <PreviewCover
            url={theme.coverUrl}
            overlay={theme.coverOverlay}
            busy={coverBusy}
            aspect={coverAspect}
          />
          <div className="mx-auto max-w-md px-4 pt-2 pb-16 sm:max-w-xl md:max-w-3xl lg:max-w-4xl">
            <StaticPublicTabBar operationMode={settings.operationMode} />
            <PreviewProviders>
              <ShopProfile
                settings={settings}
                posts={PREVIEW_POSTS}
                currentUser={null}
                audience="public"
                previewMode
                onGoQueue={noop}
                onGoAppointments={noop}
                onDeletePost={noop}
                onLikePost={noop}
              />
            </PreviewProviders>
          </div>
        </div>
      </div>
      {/* Fade do rodapé: o scroll continua rolando por baixo (pointer-events-none). */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-bg to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

/** Moldura do dispositivo (celular 9:19 ou janela de navegador). */
export function MockupDevice({
  mode,
  screen,
  slug = 'seu-salao',
}: {
  mode: PreviewDeviceMode;
  screen: React.ReactNode;
  /** Id real da barbearia → mesma URL da página pública na barra do navegador. */
  slug?: string;
}) {
  if (mode === 'desktop') {
    return (
      <div
        data-testid="device-desktop"
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-surface-2 shadow-lg ring-1 ring-border"
      >
        <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </span>
          <span className="mx-auto flex h-5 max-w-sm min-w-0 flex-1 items-center justify-center truncate rounded-md border border-border bg-bg px-3 text-xs text-text-muted">
            agendaja.com/queue/{slug}
          </span>
          <span className="w-14" aria-hidden="true" />
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-bg">{screen}</div>
      </div>
    );
  }
  return (
    <div
      data-testid="device-mobile"
      className="flex h-full w-full flex-col rounded-[38px] border border-border bg-surface-2 p-[6px] shadow-lg ring-1 ring-border"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[32px] bg-bg">
        {screen}
      </div>
    </div>
  );
}
