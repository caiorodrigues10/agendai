import React, { useCallback, useEffect, useState } from 'react';
import { FIELD_CONTROL, FIELD_CONTROL_ERROR } from './Field';

/** Formata centavos (inteiro) como string BRL: 123456 → "1.234,56" */
const formatDisplay = (cents: number): string => {
  const abs = Math.abs(cents);
  const intPart = Math.floor(abs / 100);
  const centPart = abs % 100;
  const withThousands = intPart.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return `${withThousands},${centPart.toString().padStart(2, '0')}`;
};

/** Extrai centavos a partir de uma string digitada (raw digits) */
const parseRawDigits = (raw: string): number => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
};

interface CurrencyInputProps {
  value: number;
  onChangeValue: (value: number) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
  name?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChangeValue,
  disabled = false,
  error = false,
  placeholder = '0,00',
  min: _min = 0,
  max,
  className,
  id,
  name,
}) => {
  const cents = Math.round(value * 100);
  const [displayValue, setDisplayValue] = useState(formatDisplay(cents));

  useEffect(() => {
    setDisplayValue(formatDisplay(Math.round(value * 100)));
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d]/g, '');
      let newCents = parseRawDigits(raw);

      if (max !== undefined && newCents / 100 > max) {
        newCents = Math.round(max * 100);
      }

      setDisplayValue(formatDisplay(newCents));
      onChangeValue(newCents / 100);
    },
    [onChangeValue, max],
  );

  const handleBlur = useCallback(() => {
    setDisplayValue(formatDisplay(Math.round(value * 100)));
  }, [value]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  const baseClass = error ? FIELD_CONTROL_ERROR : FIELD_CONTROL;

  return (
    <div className={`relative flex items-center ${className ?? ''}`}>
      <span className="pointer-events-none absolute left-3 z-10 select-none text-sm font-bold text-accent">
        R$
      </span>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={`${baseClass} pl-11 tabular-nums`}
      />
    </div>
  );
};
