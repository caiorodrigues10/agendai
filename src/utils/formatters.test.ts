/// <reference types="vitest/globals" />
import { formatCurrencyBRL, formatDateBR, formatDateTimeBR, formatTimeBR } from './formatters';

describe('formatters', () => {
  it('formats Brazilian currency consistently', () => {
    expect(formatCurrencyBRL(12.5)).toMatch(/R\$\s?12,50/);
    expect(formatCurrencyBRL(null)).toMatch(/R\$\s?0,00/);
  });

  it('returns the supplied fallback for invalid dates', () => {
    expect(formatDateBR('invalid', 'Sem data')).toBe('Sem data');
    expect(formatDateTimeBR(undefined)).toBe('—');
    expect(formatTimeBR(null)).toBe('—');
  });

  it('renders calendar dates (date-only/midnight UTC) without shifting a day back', () => {
    //25/09 à meia-noite UTC exibiria 24/09 em UTC-3 se parseado como instante
    expect(formatDateBR('2026-09-25T00:00:00.000Z')).toBe('25/09/2026');
    expect(formatDateBR('2026-09-25')).toBe('25/09/2026');
    expect(formatDateBR(new Date('2026-09-25T00:00:00.000Z'))).toBe('25/09/2026');
  });
});
