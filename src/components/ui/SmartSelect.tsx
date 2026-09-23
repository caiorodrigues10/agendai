import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  size,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import {
  LuCheck as Check,
  LuChevronDown as ChevronDown,
  LuLoaderCircle as Loader2,
  LuSearch as Search,
  LuX as X,
} from 'react-icons/lu';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface CommonProps<T extends string> {
  id?: string;
  name?: string;
  label?: string;
  'aria-label'?: string;
  options: SelectOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean | 'auto';
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  error?: string;
  clearable?: boolean;
  emptyMessage?: string;
  noResultsMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onSearchChange?: (value: string) => void;
  filterOption?: (option: SelectOption<T>, query: string) => boolean;
  renderOption?: (option: SelectOption<T>, selected: boolean) => React.ReactNode;
}

export type SmartSelectProps<T extends string = string> = CommonProps<T> &
  (
    | { mode?: 'single'; value: T | null; onChange: (value: T | null) => void; maxSelected?: never }
    | { mode: 'multiple'; value: T[]; onChange: (value: T[]) => void; maxSelected?: number }
  );

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function SmartSelect<T extends string = string>(props: SmartSelectProps<T>) {
  const {
    id: providedId,
    label,
    'aria-label': ariaLabel,
    options,
    placeholder = 'Selecione…',
    searchPlaceholder = 'Digite para buscar…',
    searchable = 'auto',
    disabled = false,
    required = false,
    loading = false,
    error,
    clearable = true,
    emptyMessage = 'Nenhuma opção disponível',
    noResultsMessage = 'Nenhum resultado encontrado',
    size: selectSize = 'md',
    className = '',
    onSearchChange,
    filterOption,
    renderOption,
  } = props;
  const mode = props.mode ?? 'single';
  const multipleProps = props.mode === 'multiple' ? props : null;
  const singleProps = multipleProps ? null : props as Extract<SmartSelectProps<T>, { mode?: 'single' }>;
  const generatedId = useId();
  const id = providedId ?? `smart-select-${generatedId}`;
  const listId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [
      offset(4),
      flip({ fallbackPlacements: ['top-start'], padding: 16 }),
      size({
        apply({ rects, availableHeight, placement, elements }) {
          const list = listRef.current;
          const popup = elements.floating;
          if (!list || !popup) return;
          popup.style.setProperty('--smart-select-width', `${rects.reference.width}px`);
          const headerH = 36;
          const searchH = showSearch ? 52 : 0;
          const popupPad = 16;
          const nonListH = headerH + searchH + popupPad;
          const maxListH = Math.max(0, availableHeight - nonListH);
          list.style.maxHeight = `${maxListH}px`;
          list.style.overflowY = 'auto';
          if (placement === 'top') {
            popup.style.transformOrigin = 'bottom';
          }
        },
        padding: 16,
      }),
    ],
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
  });

  const click = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  useEffect(() => {
    if (!open) return;
    const closeOnScroll = (event: Event) => {
      if (refs.floating.current?.contains(event.target as Node)) return;
      if ((refs.reference.current as HTMLElement | null)?.contains(event.target as Node)) return;
      setOpen(false);
      setQuery('');
    };
    window.addEventListener('scroll', closeOnScroll, { capture: true });
    window.addEventListener('resize', closeOnScroll);
    return () => {
      window.removeEventListener('scroll', closeOnScroll, { capture: true });
      window.removeEventListener('resize', closeOnScroll);
    };
  }, [open, refs.floating, refs.reference]);

  useEffect(() => {
    if (open) window.setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  const selectedValues = multipleProps ? multipleProps.value : props.value == null ? [] : [props.value];
  const selectedOptions = options.filter(option => selectedValues.includes(option.value));
  const showSearch = searchable === true || (searchable === 'auto' && options.length >= 7);
  const visibleOptions = useMemo(() => {
    if (!query) return options;
    const normalizedQuery = normalize(query);
    return options.filter(option =>
      filterOption
        ? filterOption(option, query)
        : [option.label, option.description ?? '', ...(option.keywords ?? [])]
            .map(normalize)
            .some(value => value.includes(normalizedQuery))
    );
  }, [filterOption, options, query]);

  const setSearch = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
    onSearchChange?.(value);
  };

  const close = () => {
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  };

  const choose = (option: SelectOption<T>) => {
    if (option.disabled || loading) return;
    if (multipleProps) {
      const selected = multipleProps.value.includes(option.value);
      if (!selected && multipleProps.maxSelected !== undefined && multipleProps.value.length >= multipleProps.maxSelected) return;
      multipleProps.onChange(selected ? multipleProps.value.filter(value => value !== option.value) : [...multipleProps.value, option.value]);
      return;
    }
    singleProps?.onChange(option.value);
    close();
  };

  const clear = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (multipleProps) multipleProps.onChange([]);
    else singleProps?.onChange(null);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(value => !value);
    }
    if (event.key === 'ArrowDown' && !open) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => Math.min(index + 1, Math.max(visibleOptions.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => Math.max(index - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(Math.max(visibleOptions.length - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = visibleOptions[activeIndex];
      if (option) choose(option);
    } else if (event.key === 'Backspace' && multipleProps && !query && multipleProps.value.length) {
      multipleProps.onChange(multipleProps.value.filter(value => value !== multipleProps.value[multipleProps.value.length - 1]));
    }
  };

  const selectedLabel = mode === 'single' ? selectedOptions[0]?.label : undefined;
  const triggerSize = selectSize === 'sm' ? 'min-h-9 px-3 text-xs' : selectSize === 'lg' ? 'min-h-12 px-4' : 'min-h-11 px-3.5 text-sm';

  const popup = open && (
    <FloatingPortal>
      {mobile ? (
        <div className="fixed inset-x-0 bottom-0 z-[150] rounded-t-2xl border border-border bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
          <PopupContent />
        </div>
      ) : (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-[150] w-[var(--smart-select-width)] rounded-xl border border-border bg-surface p-2 shadow-2xl"
        >
          <PopupContent />
        </div>
      )}
    </FloatingPortal>
  );

  function PopupContent() {
    return (
      <>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-text-primary">{label ?? 'Selecionar'}</span>
          {multipleProps && multipleProps.value.length > 0 && <button type="button" onClick={() => multipleProps.onChange([])} className="text-xs font-semibold text-accent">Limpar todos</button>}
        </div>
        {showSearch && (
          <div className="relative mb-2">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input ref={searchRef} value={query} onChange={event => setSearch(event.target.value)} onKeyDown={handleSearchKeyDown} placeholder={searchPlaceholder} className="min-h-11 w-full rounded-lg border border-border bg-bg pl-9 pr-3 text-sm text-text-primary outline-none focus:border-focus" aria-label="Buscar opções" />
          </div>
        )}
        <div ref={listRef} id={listId} role="listbox" aria-multiselectable={mode === 'multiple' || undefined} className="overscroll-contain">
          {loading ? <div className="flex items-center justify-center gap-2 p-4 text-sm text-text-muted"><Loader2 size={16} className="animate-spin" />Carregando…</div> : visibleOptions.length === 0 ? <div className="p-4 text-center text-sm text-text-muted">{options.length === 0 ? emptyMessage : noResultsMessage}</div> : visibleOptions.map((option, index) => {
            const selected = selectedValues.includes(option.value);
            return <button type="button" key={option.value} id={`${listId}-option-${option.value}`} role="option" aria-selected={selected} disabled={option.disabled} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(option)} className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${index === activeIndex ? 'bg-surface-2' : ''} ${selected ? 'text-accent' : 'text-text-primary'} ${option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-surface-2'}`}>
              {option.icon}
              <span className="min-w-0 flex-1"><span className="block truncate">{renderOption ? renderOption(option, selected) : option.label}</span>{option.description && <span className="block truncate text-xs text-text-muted">{option.description}</span>}</span>
              {selected && <Check size={16} className="shrink-0 text-accent" />}
            </button>;
          })}
        </div>
        {mobile && multipleProps && <button type="button" onClick={close} className="mt-3 min-h-11 w-full rounded-xl bg-accent font-bold text-accent-fg">Concluir</button>}
      </>
    );
  }

  return <div className={`relative ${className}`}>
    {label && <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-text-secondary">{label}{required && <span className="text-danger"> *</span>}</label>}
    <button
      ref={mobile ? triggerRef : refs.setReference}
      id={id}
      type="button"
      role="combobox"
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-controls={listId}
      aria-haspopup="listbox"
      aria-describedby={error ? errorId : undefined}
      disabled={disabled}
      onKeyDown={handleTriggerKeyDown}
      {...(!mobile ? getReferenceProps() : {})}
      className={`flex w-full items-center gap-2 rounded-xl border border-border bg-surface text-left text-text-primary outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:opacity-50 ${triggerSize}`}
    >
      {multipleProps ? <span className="flex min-w-0 flex-1 flex-wrap gap-1">{selectedOptions.length ? selectedOptions.slice(0, 3).map(option => <span key={option.value} className="inline-flex items-center gap-1 rounded-md bg-selection px-2 py-1 text-xs text-accent">{option.label}<button type="button" aria-label={`Remover ${option.label}`} onClick={event => { event.stopPropagation(); multipleProps.onChange(multipleProps.value.filter(value => value !== option.value)); }}><X size={12} /></button></span>) : <span className="text-text-muted">{placeholder}</span>}{selectedOptions.length > 3 && <span className="rounded-md bg-surface-2 px-2 py-1 text-xs text-text-secondary">{selectedOptions.length} selecionados</span>}</span> : <span className={`min-w-0 flex-1 truncate ${selectedLabel ? '' : 'text-text-muted'}`}>{selectedLabel ?? placeholder}</span>}
      {clearable && selectedValues.length > 0 && !required && <span role="button" tabIndex={0} aria-label="Limpar seleção" onClick={clear} className="rounded p-1 text-text-muted hover:bg-surface-2"><X size={15} /></span>}
      <ChevronDown size={17} className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {error && <p id={errorId} className="mt-1 text-xs text-danger">{error}</p>}
    {popup}
  </div>;
}

export const Select = SmartSelect;
export const MultiSelect = <T extends string>(props: Omit<Extract<SmartSelectProps<T>, { mode: 'multiple' }>, 'mode'> & { mode?: 'multiple' }) => <SmartSelect {...props} mode="multiple" />;
