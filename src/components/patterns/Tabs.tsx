import React, { useId, useRef } from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
  idPrefix?: string;
  /** Active content. When provided, IDs and the accessible panel are managed together. */
  children?: React.ReactNode;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className = '',
  idPrefix,
  children,
}: TabsProps<T>) {
  const instanceId = useId();
  // Preserve external panel IDs for existing consumers without children.
  const prefix = idPrefix ?? (children !== undefined ? instanceId : '');
  const tabId = (id: string) => `${prefix ? `${prefix}-` : ''}tab-${id}`;
  const panelId = (id: string) => `${prefix ? `${prefix}-` : ''}tabpanel-${id}`;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = (id: T) => {
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
    <>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={`flex min-w-0 flex-wrap gap-1 rounded-xl border border-border bg-surface p-1 ${className}`}
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
              id={tabId(item.id)}
              aria-selected={active}
              aria-controls={active ? panelId(item.id) : undefined}
              disabled={item.disabled}
              tabIndex={
                !item.disabled &&
                (active ||
                  (!items.some(tab => tab.id === value && !tab.disabled) &&
                    item === items.find(tab => !tab.disabled)))
                  ? 0
                  : -1
              }
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
              className={`min-h-11 min-w-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {item.icon && (
                  <span aria-hidden="true" className="shrink-0">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {children !== undefined && (
        <div
          role="tabpanel"
          id={panelId(value)}
          aria-labelledby={tabId(value)}
          tabIndex={0}
          className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-xl"
        >
          {children}
        </div>
      )}
    </>
  );
}
