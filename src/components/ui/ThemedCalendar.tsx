import React from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import './ThemedCalendar.css';

export function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalISO(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

interface ThemedCalendarProps {
  value: string;
  min?: string;
  max?: string;
  /** Retorna true para desabilitar o dia (ex.: salão fechado). */
  isDayDisabled?: (date: Date) => boolean;
  onChange: (isoDate: string) => void;
}

export const ThemedCalendar: React.FC<ThemedCalendarProps> = ({
  value,
  min,
  max,
  isDayDisabled,
  onChange,
}) => {
  const selected = value ? parseLocalISO(value) : undefined;
  const startMonth = min ? parseLocalISO(min) : undefined;
  const endMonth = max ? parseLocalISO(max) : undefined;

  return (
    <DayPicker
      mode="single"
      locale={ptBR}
      navLayout="around"
      selected={selected}
      defaultMonth={selected}
      startMonth={startMonth}
      endMonth={endMonth}
      onSelect={day => {
        if (!day) return;
        onChange(toLocalISO(day));
      }}
      disabled={day => {
        const iso = toLocalISO(day);
        if (min && iso < min) return true;
        if (max && iso > max) return true;
        return Boolean(isDayDisabled?.(day));
      }}
      className="ag-calendar"
    />
  );
};
