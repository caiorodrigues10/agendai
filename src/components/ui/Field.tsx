import React from 'react';

export const FIELD_CONTROL =
  'w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-focus disabled:opacity-70';

export const FIELD_CONTROL_ERROR =
  'w-full rounded-lg border border-danger bg-input-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-focus disabled:opacity-70';

export const FORM_SECTION_TITLE = 'text-xs font-bold uppercase tracking-wider text-text-muted';

export const FORM_GRID = 'grid sm:grid-cols-2 gap-4';

export const FORM_FOOTER = 'flex gap-3 pt-4 border-t border-border';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, hint, error, className, children }) => {
  const id = React.useId();
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const controls = React.Children.map(children, child => {
    if (
      !React.isValidElement<React.InputHTMLAttributes<HTMLInputElement>>(child) ||
      !['input', 'textarea', 'select'].includes(String(child.type))
    )
      return child;
    return React.cloneElement(child, {
      'aria-invalid': error ? true : child.props['aria-invalid'],
      'aria-describedby':
        [child.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
    });
  });
  return (
    <label className={className ?? 'block min-w-0'}>
      <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>
      {controls}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 block text-xs text-text-secondary">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 block text-sm text-danger">
          {error}
        </p>
      ) : null}
    </label>
  );
};
