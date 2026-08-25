import React from 'react';
import { Check, HelpCircle } from 'lucide-react';

interface ConsentCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  helpLink?: { label: string; href: string };
  className?: string;
}

export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  label,
  checked,
  onChange,
  required = false,
  disabled = false,
  helpText,
  helpLink,
  className = '',
}) => {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          required={required}
          className="sr-only peer"
          aria-required={required}
        />
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
            ${
              checked
                ? 'bg-accent border-accent text-accent-fg'
                : 'bg-bg border-border hover:border-border-strong'
            }
            peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50
            ${disabled ? 'opacity-50' : ''}`}
        >
          {checked && <Check size={12} className="text-current" />}
        </div>
      </div>
      <div className="flex-1 min-w-0 text-sm leading-relaxed">
        <span className="text-text-primary font-medium">
          {label}
          {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
        </span>
        {helpText && (
          <p className="mt-1 text-[11px] text-text-muted">{helpText}</p>
        )}
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
  );
};