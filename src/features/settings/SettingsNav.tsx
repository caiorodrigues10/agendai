import React, { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { prefersReducedMotion } from '../../utils/reducedMotion';
import {
  SETTINGS_SECTIONS,
  SETTINGS_SECTION_GROUPS,
  type SettingsSection,
} from './settingsSections';

/**
 * A coluna lateral só existe a partir de `xl` (1280px). Abaixo disso a página
 * já empilha a navegação fixa do app (`w-60` + `gap-6` dentro de `max-w-7xl`)
 * e, com 10 seções, uma segunda coluna de 240px deixaria o conteúdo em ~430px
 * — mais estreito que o `main` de 696px que existe hoje a 1024px, e quebraria
 * os `sm:grid-cols-2` dos painéis (breakpoints são de viewport, não de
 * contêiner). A partir de 1280px o conteúdo volta a ~688px, ou seja, a mesma
 * largura que os painéis têm hoje. Abaixo de `xl` vale a faixa rolável única.
 */
const SIDEBAR_MEDIA = '(min-width: 1280px)';

const subscribeToSidebar = (onStoreChange: () => void) => {
  const media = window.matchMedia(SIDEBAR_MEDIA);
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
};

const getSidebarSnapshot = () => window.matchMedia(SIDEBAR_MEDIA).matches;
const getSidebarServerSnapshot = () => false;

export interface SettingsNavProps {
  /** Seção ativa — mesmo estado de sempre; `?section=` continua mandando aqui. */
  value: SettingsSection;
  onChange: (id: SettingsSection) => void;
  ariaLabel: string;
  children?: React.ReactNode;
}

const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

export function SettingsNav({ value, onChange, ariaLabel, children }: SettingsNavProps) {
  const instanceId = useId();
  const isSidebar = useSyncExternalStore(
    subscribeToSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot
  );
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const previousSection = useRef<SettingsSection>(value);
  const [edges, setEdges] = useState({ start: false, end: true });

  const tabId = (id: SettingsSection) => `${instanceId}-tab-${id}`;
  const panelId = (id: SettingsSection) => `${instanceId}-tabpanel-${id}`;

  const focusTab = (id: SettingsSection) => {
    onChange(id);
    tabRefs.current[id]?.focus();
  };

  const move = (step: number | 'first' | 'last') => {
    const ids = SETTINGS_SECTIONS.map(section => section.id);
    const current = ids.indexOf(value);
    let next: number;
    if (step === 'first') next = 0;
    else if (step === 'last') next = ids.length - 1;
    else next = (current + step + ids.length) % ids.length;
    focusTab(ids[next]);
  };

  // As quatro setas permanecem ativas nos dois layouts, conforme o contrato
  // de acessibilidade desta tela; `aria-orientation` anuncia o eixo visual.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move('first');
    } else if (event.key === 'End') {
      event.preventDefault();
      move('last');
    }
  };

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const start = list.scrollLeft > 2;
    const end = list.scrollLeft + list.clientWidth < list.scrollWidth - 2;
    setEdges(previous =>
      previous.start === start && previous.end === end ? previous : { start, end }
    );
  };

  // A aba ativa fica sempre visível: centralizada na faixa rolável e apenas
  // no eixo necessário dentro da coluna vertical (inclusive em telas baixas).
  useEffect(() => {
    tabRefs.current[value]?.scrollIntoView?.({
      block: 'nearest',
      inline: isSidebar ? 'nearest' : 'center',
      behavior: scrollBehavior(),
    });
  }, [isSidebar, value]);

  // No modo rolável, a nova seção deve começar no topo do conteúdo. O painel
  // tem scroll-margin para ficar logo abaixo do header fixo do app.
  useEffect(() => {
    if (previousSection.current === value) return;
    previousSection.current = value;
    if (isSidebar) return;
    panelRef.current?.scrollIntoView?.({
      block: 'start',
      inline: 'nearest',
      behavior: scrollBehavior(),
    });
  }, [isSidebar, value]);

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="min-w-0 xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:w-60 xl:shrink-0 xl:self-start xl:overflow-y-auto">
        <div className="relative rounded-xl border border-border bg-surface">
          <div
            ref={listRef}
            role="tablist"
            aria-label={ariaLabel}
            aria-orientation={isSidebar ? 'vertical' : 'horizontal'}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-1 overflow-x-auto p-1.5 scroll-px-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:flex-col xl:gap-0.5 xl:overflow-visible"
          >
            {SETTINGS_SECTION_GROUPS.map(group => (
              <div
                key={group.id}
                role="group"
                aria-label={group.label}
                className="flex shrink-0 gap-1 xl:flex-col xl:gap-0.5"
              >
                <span
                  aria-hidden="true"
                  className="hidden px-3 pb-1 pt-2 text-[11px] font-semibold lowercase tracking-wide text-text-muted xl:block"
                >
                  {group.label}
                </span>
                {SETTINGS_SECTIONS.filter(section => section.group === group.id).map(section => {
                  const Icon = section.icon;
                  const active = section.id === value;
                  return (
                    <button
                      key={section.id}
                      ref={element => {
                        tabRefs.current[section.id] = element;
                      }}
                      type="button"
                      role="tab"
                      id={tabId(section.id)}
                      aria-selected={active}
                      aria-controls={panelId(section.id)}
                      tabIndex={active ? 0 : -1}
                      onClick={() => onChange(section.id)}
                      onKeyDown={handleKeyDown}
                      className={`group relative flex min-h-11 min-w-0 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                        active
                          ? 'border-accent/30 bg-selection text-accent'
                          : 'border-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 hidden h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-accent xl:block"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className={`shrink-0 transition-colors ${
                          active ? 'text-accent' : 'text-text-muted group-hover:text-accent'
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      {section.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {edges.start && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1.5 left-1.5 w-5 bg-linear-to-r from-surface to-transparent xl:hidden"
            />
          )}
          {edges.end && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1.5 right-1.5 w-5 bg-linear-to-l from-surface to-transparent xl:hidden"
            />
          )}
        </div>
      </div>

      {children !== undefined &&
        SETTINGS_SECTIONS.map(section => {
          const active = section.id === value;
          return (
            <div
              key={section.id}
              ref={active ? panelRef : undefined}
              role="tabpanel"
              id={panelId(section.id)}
              aria-labelledby={tabId(section.id)}
              hidden={!active}
              tabIndex={active ? 0 : undefined}
              className="min-w-0 scroll-mt-[calc(var(--app-header-h,64px)+0.75rem)] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus xl:flex-1"
            >
              {active ? children : null}
            </div>
          );
        })}
    </div>
  );
}
