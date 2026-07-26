import React, { forwardRef } from 'react';
import { Key, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { getPasswordStrength, PasswordStrengthLevel } from '../../utils/passwordStrength';

const STRENGTH_BAR: Record<PasswordStrengthLevel, string> = {
  empty: 'bg-border',
  weak: 'bg-danger',
  fair: 'bg-warning',
  good: 'bg-accent',
  strong: 'bg-success',
};

const STRENGTH_BORDER: Record<PasswordStrengthLevel, string> = {
  empty: 'border-border focus-within:border-accent/50',
  weak: 'border-danger/40 focus-within:border-danger/60',
  fair: 'border-warning/40 focus-within:border-warning/60',
  good: 'border-accent/40 focus-within:border-accent/60',
  strong: 'border-success/40 focus-within:border-success/60',
};

const STRENGTH_TEXT: Record<PasswordStrengthLevel, string> = {
  empty: 'text-text-muted',
  weak: 'text-danger',
  fair: 'text-warning',
  good: 'text-accent',
  strong: 'text-success',
};

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showPassword: boolean;
  onToggleShow: () => void;
  error?: string;
  showStrength?: boolean;
  value?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showPassword, onToggleShow, error, showStrength, value = '', className, ...props }, ref) => {
    const strength = showStrength ? getPasswordStrength(value) : null;
    const hasError = !!error;
    const borderLevel = hasError ? 'empty' : (strength?.level ?? 'empty');
    const showMeter = showStrength && value.length > 0;

    return (
      <div className="space-y-1">
        <div
          className={`
            rounded-xl border overflow-hidden transition-colors
            focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)]
            ${hasError
              ? 'border-danger/40 focus-within:border-danger'
              : STRENGTH_BORDER[borderLevel]}
          `}
        >
          <div className="relative group bg-bg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key
                size={16}
                className={`transition-colors ${
                  hasError ? 'text-danger' : 'text-text-muted group-focus-within:text-accent'
                }`}
              />
            </div>
            <input
              ref={ref}
              type={showPassword ? 'text' : 'password'}
              value={value}
              className={`
                w-full bg-transparent py-3 pl-10 pr-10 text-text-primary text-sm
                outline-none placeholder:text-text-muted
                ${hasError ? 'text-danger' : ''}
                ${className ?? ''}
              `}
              {...props}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={onToggleShow}
                className="text-text-muted hover:text-accent transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {showMeter && strength && (
            <div className="px-3 py-2 border-t border-border/60 bg-surface-2/40 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map(segment => (
                    <div
                      key={segment}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        segment <= strength.score
                          ? STRENGTH_BAR[strength.level]
                          : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 ${STRENGTH_TEXT[strength.level]}`}>
                  {strength.label}
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {(
                  [
                    { key: 'minLength', label: 'Mín. 6 caracteres' },
                    { key: 'hasLetter', label: 'Letra' },
                    { key: 'hasNumber', label: 'Número' },
                    { key: 'hasUpper', label: 'Maiúscula' },
                  ] as const
                ).map(({ key, label }) => {
                  const met = strength.checks[key];
                  return (
                    <li
                      key={key}
                      className={`flex items-center gap-1 text-[10px] transition-colors ${
                        met ? 'text-success' : 'text-text-muted'
                      }`}
                    >
                      {met ? <Check size={10} strokeWidth={3} /> : <span className="w-2.5 h-px bg-border-strong" />}
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <span className="text-[10px] font-medium text-danger flex items-center gap-1">
            <AlertCircle size={10} /> {error}
          </span>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
