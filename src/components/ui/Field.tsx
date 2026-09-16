import React from 'react';

export const FIELD_CONTROL =
  'w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-focus disabled:opacity-70';

export const FIELD_CONTROL_ERROR =
  'w-full rounded-lg border border-danger bg-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-focus disabled:opacity-70';

export const FORM_SECTION_TITLE =
  'text-xs font-bold uppercase tracking-wider text-text-muted';

export const FORM_GRID = 'grid sm:grid-cols-2 gap-4';

export const FORM_FOOTER =
  'flex gap-3 pt-4 border-t border-border';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, hint, error, className, children }) => (
  <label className={className ?? 'block'}>
    <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>
    {children}
    {hint ? <p className="mt-1 text-[11px] text-text-muted">{hint}</p> : null}
    {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
  </label>
);
