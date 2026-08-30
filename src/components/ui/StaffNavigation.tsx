import { useEffect, useMemo, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { RiCloseLine, RiMore2Line } from 'react-icons/ri';
import {
  canAccessTab,
  MOBILE_PRIMARY_TAB_IDS,
  TAB_GROUPS,
  type TabDef,
  type TabGroup,
} from '../../config/tabRegistry';

interface StaffNavigationProps {
  activeTab: string;
  userRole?: string;
  onNavigate: (tabId: string) => void;
}

const visibleTabs = (group: TabGroup, userRole?: string) =>
  group.tabs.filter(tab => canAccessTab(tab.id, userRole));

export function StaffNavigation({ activeTab, userRole, onNavigate }: StaffNavigationProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const groups = useMemo(
    () =>
      TAB_GROUPS.map(group => ({ ...group, tabs: visibleTabs(group, userRole) })).filter(
        group => group.tabs.length > 0
      ),
    [userRole]
  );

  const primaryTabs = useMemo(() => {
    const tabsById = new Map(groups.flatMap(group => group.tabs).map(tab => [tab.id, tab]));
    return MOBILE_PRIMARY_TAB_IDS.flatMap(id => {
      const tab = tabsById.get(id);
      return tab ? [tab] : [];
    });
  }, [groups]);

  const moreGroups = useMemo(
    () =>
      groups
        .map(group => ({
          ...group,
          tabs: group.tabs.filter(tab => !MOBILE_PRIMARY_TAB_IDS.includes(tab.id as never)),
        }))
        .filter(group => group.tabs.length > 0),
    [groups]
  );

  const moreIsActive = moreGroups.some(group => group.tabs.some(tab => tab.id === activeTab));

  useEffect(() => {
    if (!moreOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreOpen]);

  const navigateTo = (tabId: string) => {
    setMoreOpen(false);
    onNavigate(tabId);
  };

  return (
    <>
      <aside className="hidden w-60 shrink-0 lg:block">
        <nav
          aria-label="Navegação do painel"
          className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-3 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]"
        >
          <div className="mb-3 border-b border-border px-2 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-text-muted">
              Navegação
            </p>
            <p className="mt-1 text-sm font-semibold text-text-primary">Áreas do salão</p>
          </div>

          <div className="space-y-4">
            {groups.map(group => (
              <section key={group.id} aria-labelledby={`desktop-nav-${group.id}`}>
                <p
                  id={`desktop-nav-${group.id}`}
                  className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
                >
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.tabs.map(tab => (
                    <DesktopNavigationItem
                      key={tab.id}
                      tab={tab}
                      active={activeTab === tab.id}
                      onNavigate={navigateTo}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </nav>
      </aside>

      <nav
        aria-label="Navegação compacta do painel"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
          {primaryTabs.map(tab => (
            <MobileNavigationItem
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onNavigate={navigateTo}
            />
          ))}
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-controls="staff-navigation-more"
            aria-current={moreIsActive ? 'page' : undefined}
            onClick={() => setMoreOpen(open => !open)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors ${
              moreIsActive || moreOpen
                ? 'bg-accent text-accent-fg shadow-lg shadow-accent/20'
                : 'text-text-muted hover:bg-bg hover:text-text-primary'
            }`}
          >
            <RiMore2Line size={20} />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu de mais opções"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => setMoreOpen(false)}
          />
          <FocusLock returnFocus>
            <section
              id="staff-navigation-more"
              role="dialog"
              aria-modal="true"
              aria-labelledby="staff-navigation-more-title"
              className="absolute inset-x-0 bottom-0 max-h-[min(78dvh,42rem)] overflow-y-auto rounded-t-3xl border-x border-t border-border bg-surface px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border-strong" />
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted">
                    Navegação
                  </p>
                  <h2
                    id="staff-navigation-more-title"
                    className="mt-1 text-lg font-semibold text-text-primary"
                  >
                    Mais opções
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-bg hover:text-text-primary"
                  aria-label="Fechar"
                >
                  <RiCloseLine size={21} />
                </button>
              </div>

              <div className="space-y-5">
                {moreGroups.map(group => (
                  <section key={group.id} aria-labelledby={`mobile-nav-${group.id}`}>
                    <p
                      id={`mobile-nav-${group.id}`}
                      className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted"
                    >
                      {group.label}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.tabs.map(tab => (
                        <MoreNavigationItem
                          key={tab.id}
                          tab={tab}
                          active={activeTab === tab.id}
                          onNavigate={navigateTo}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          </FocusLock>
        </div>
      )}
    </>
  );
}

function DesktopNavigationItem({
  tab,
  active,
  onNavigate,
}: {
  tab: TabDef;
  active: boolean;
  onNavigate: (tabId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(tab.id)}
      aria-current={active ? 'page' : undefined}
      className={`group flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-accent-fg shadow-md shadow-accent/15'
          : 'text-text-secondary hover:bg-bg hover:text-text-primary'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          active ? 'bg-white/15' : 'bg-surface-2 text-text-muted group-hover:text-accent'
        }`}
      >
        <tab.icon size={17} />
      </span>
      <span className="truncate">{tab.label}</span>
    </button>
  );
}

function MobileNavigationItem({
  tab,
  active,
  onNavigate,
}: {
  tab: TabDef;
  active: boolean;
  onNavigate: (tabId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(tab.id)}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors ${
        active
          ? 'bg-accent text-accent-fg shadow-lg shadow-accent/20'
          : 'text-text-muted hover:bg-bg hover:text-text-primary'
      }`}
    >
      <tab.icon size={18} />
      <span className="max-w-full truncate leading-tight">{tab.label}</span>
    </button>
  );
}

function MoreNavigationItem({
  tab,
  active,
  onNavigate,
}: {
  tab: TabDef;
  active: boolean;
  onNavigate: (tabId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(tab.id)}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-16 items-center gap-3 rounded-2xl border px-3 text-left transition-colors ${
        active
          ? 'border-accent/30 bg-accent/12 text-text-primary'
          : 'border-border bg-bg text-text-secondary hover:border-accent/30 hover:text-text-primary'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          active ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-text-muted'
        }`}
      >
        <tab.icon size={18} />
      </span>
      <span className="min-w-0 truncate text-sm font-semibold">{tab.label}</span>
    </button>
  );
}
