import React from 'react';
import { Check, HelpCircle, AlertCircle } from 'lucide-react';

interface ConsentCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  helpLink?: { label: string; href: string };
  className?: string;
  variant?: 'default' | 'compact';
}

export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  label,
  checked,
  onChange,
  required = false,
  disabled = false,
  error,
  helpText,
  helpLink,
  className = '',
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';

  return (
    <div className={className}>
      <label
        className={`flex ${isCompact ? 'items-center' : 'items-start'} ${isCompact ? 'gap-2' : 'gap-3'} cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className={`relative flex-shrink-0 ${isCompact ? '' : 'mt-0.5'}`}>
          <input
            type="checkbox"
            checked={checked}
            onChange={e => !disabled && onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
            aria-required={required}
          />
          <div
            className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} rounded border-2 flex items-center justify-center transition-all duration-200
            ${
              error
                ? 'border-danger'
                : checked
                  ? 'bg-accent border-accent text-accent-fg'
                  : 'bg-bg border-border hover:border-border-strong'
            }
            peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50
            ${disabled ? 'opacity-50' : ''}`}
          >
            {checked && <Check size={isCompact ? 10 : 12} className="text-current" />}
          </div>
        </div>
        <div className={`flex-1 min-w-0 ${isCompact ? 'text-[11px] leading-none' : 'text-sm leading-relaxed'}`}>
          <span className={`text-text-primary ${isCompact ? 'text-[11px]' : 'font-medium'}`}>
            {label}
            {required && (
              <span className="text-danger ml-1" aria-hidden="true">
                *
              </span>
            )}
          </span>
          {helpText && <p className="mt-1 text-[11px] text-text-muted">{helpText}</p>}
          {helpLink && (
            <a
              href={helpLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
            >
              {helpLink.label}
              <HelpCircle size={10} />
            </a>
          )}
        </div>
      </label>
      {error && (
        <p className="mt-1.5 ml-8 flex items-center gap-1.5 text-[11px] text-danger">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
};
