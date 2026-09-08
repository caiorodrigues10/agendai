import { maskPhone, normalizePhoneBR } from './documentUtils';

export function formatBrPhone(value: string | null | undefined, fallback = '—'): string {
  if (!value) return fallback;
  const normalized = normalizePhoneBR(value);
  return normalized ? maskPhone(normalized) : fallback;
}

export const formatWhatsapp = formatBrPhone;

export function maskedOrFallbackPhone(
  value: string | null | undefined,
  fallback = 'Não informado'
): string {
  return formatBrPhone(value, fallback);
}
