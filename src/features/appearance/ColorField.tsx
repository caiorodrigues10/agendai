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
 * O seletor vira um swatch customizado (xadrez neutro + cor com relevo) com o
 * `input[type=color]` transparente por cima — o navegador estilo sistema fica
 * por baixo e herda o foco/teclado via `peer-focus-visible`.
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
        {/* Swatch 40×40: xadrez neutro só POR TRÁS (aparece se a cor tiver
            transparência); a cor preenche o swatch e a moldura é sólida. */}
        <div className="relative h-10 w-10 shrink-0">
          <input
            id={inputId}
            type="color"
            value={isHexColor(value) ? value : '#000000'}
            disabled={disabled}
            onChange={e => onChange(e.target.value.toUpperCase())}
            className="peer absolute inset-0 h-full w-full cursor-pointer rounded-lg opacity-0 disabled:cursor-not-allowed"
            aria-label={`${label} (seletor de cor)`}
          />
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg ring-1 ring-black/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus dark:ring-white/20"
            style={{
              backgroundColor: '#e5e5e5',
              backgroundImage:
                'linear-gradient(45deg, #a3a3a3 25%, transparent 25%, transparent 75%, #a3a3a3 75%), linear-gradient(45deg, #a3a3a3 25%, transparent 25%, transparent 75%, #a3a3a3 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 4px 4px',
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: isHexColor(value) ? value : '#000000' }}
            aria-hidden="true"
          />
        </div>
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
