import React, { useState } from 'react';
import { FIELD_CONTROL } from '../../components/ui/Field';
import { isHexColor, normalizeHexColor } from '../../shared/pageThemeContrast';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

/**
 * Color picker nativo + campo hex sincronizados. O valor só é propagado quando
 * é um hex válido (#RRGGBB); enquanto o dono digita, o texto fica local.
 */
export const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange, disabled }) => {
  const inputId = `color-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const [text, setText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    // Preset/restaurar mudou o valor externo: sincroniza o campo durante o render.
    setPrevValue(value);
    setText(value);
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-secondary">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="color"
          value={isHexColor(value) ? value : '#000000'}
          disabled={disabled}
          onChange={e => onChange(e.target.value.toUpperCase())}
          className="h-11 w-16 shrink-0 cursor-pointer rounded-lg border border-input-border bg-input-bg p-1 disabled:opacity-70"
          aria-label={`${label} (seletor de cor)`}
        />
        <input
          type="text"
          value={text}
          disabled={disabled}
          onChange={e => {
            const raw = e.target.value;
            const withHash = raw.startsWith('#') ? raw : `#${raw}`;
            setText(withHash.toUpperCase());
            if (isHexColor(withHash)) onChange(normalizeHexColor(withHash));
          }}
          onBlur={() => {
            if (!isHexColor(text)) setText(value);
          }}
          maxLength={7}
          spellCheck={false}
          className={`${FIELD_CONTROL} font-mono uppercase`}
          aria-label={`${label} (hex)`}
        />
      </div>
    </div>
  );
};
