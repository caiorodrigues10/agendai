import React, { useRef } from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, value, onChange, ariaLabel, className = '' }) => {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = (id: string) => {
    onChange(id);
    refs.current[id]?.focus();
  };

  const move = (direction: 1 | -1 | 'first' | 'last') => {
    const enabled = items.filter(item => !item.disabled);
    if (!enabled.length) return;
    if (direction === 'first') return focusTab(enabled[0].id);
    if (direction === 'last') return focusTab(enabled[enabled.length - 1].id);
    const current = enabled.findIndex(item => item.id === value);
    const next = (current + direction + enabled.length) % enabled.length;
    focusTab(enabled[next].id);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1 ${className}`}
    >
      {items.map(item => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            ref={el => {
              refs.current[item.id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active}
            aria-controls={`tabpanel-${item.id}`}
            disabled={item.disabled}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                move(1);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                move(-1);
              } else if (e.key === 'Home') {
                e.preventDefault();
                move('first');
              } else if (e.key === 'End') {
                e.preventDefault();
                move('last');
              }
            }}
            className={`min-h-10 rounded-lg px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? 'bg-accent/15 text-accent'
                : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
