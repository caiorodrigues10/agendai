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
});
