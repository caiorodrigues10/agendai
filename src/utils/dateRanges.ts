function toLocalIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function todayISO(): string {
  return toLocalIsoDate(new Date());
}

export function addDaysISO(days: number, from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return toLocalIsoDate(date);
}

/** Parses a calendar date at noon to avoid timezone shifts in the UI. */
export function dateAtNoon(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export type DefaultPeriod = '7d' | '30d' | '90d';

export function getDefaultPeriod(period: DefaultPeriod = '30d'): { from: string; to: string } {
  const days = Number.parseInt(period, 10);
  return { from: addDaysISO(-(days - 1)), to: todayISO() };
}

export function getPeriodRange(from?: string, to?: string, fallback: DefaultPeriod = '30d') {
  const defaults = getDefaultPeriod(fallback);
  return { from: from || defaults.from, to: to || defaults.to };
}
