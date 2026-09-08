const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const compactBrlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function formatCurrencyBRL(value: number | string | null | undefined): string {
  return brlFormatter.format(Number(value ?? 0));
}

export function formatCurrencyCompactBRL(value: number | string | null | undefined): string {
  return compactBrlFormatter.format(Number(value ?? 0));
}

export function formatNumberBR(value: number | string | null | undefined): string {
  return numberFormatter.format(Number(value ?? 0));
}

export function formatPercentBR(value: number | null | undefined, fractionDigits = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value ?? 0));
}

function parseDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateBR(value: Date | string | null | undefined, fallback = '—'): string {
  const date = parseDate(value);
  return date ? date.toLocaleDateString('pt-BR') : fallback;
}

export function formatDateTimeBR(value: Date | string | null | undefined, fallback = '—'): string {
  const date = parseDate(value);
  return date ? date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : fallback;
}

export function formatTimeBR(value: Date | string | null | undefined, fallback = '—'): string {
  const date = parseDate(value);
  return date ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : fallback;
}
