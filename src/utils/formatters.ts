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
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    // Date em meia-noite UTC = data de calendário (padrão @db.Date do BE)
    if (
      value.getUTCHours() === 0 && value.getUTCMinutes() === 0 &&
      value.getUTCSeconds() === 0 && value.getUTCMilliseconds() === 0
    ) {
      return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    }
    return value;
  }
  // Datas sem horário (YYYY-MM-DD ou T00:00:00Z, padrão do BE para campos
  // de data) são datas de CALENDÁRIO: monta como data local para não exibir
  // 1 dia a menos em UTC-3 (25/09T00:00Z viraria 24/09 21:00).
  const calendar = /^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.000)?Z)?$/.exec(value);
  if (calendar) {
    const local = new Date(Number(calendar[1]), Number(calendar[2]) - 1, Number(calendar[3]));
    return Number.isNaN(local.getTime()) ? null : local;
  }
  const date = new Date(value);
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
