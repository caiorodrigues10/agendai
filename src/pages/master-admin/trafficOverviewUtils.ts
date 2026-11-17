import {
  TRAFFIC_AREAS,
  TRAFFIC_PERIODS,
  TRAFFIC_USER_ROLES,
  type TrafficArea,
  type TrafficPeriod,
  type TrafficUserRole,
  type TrafficVisitorsBasis,
} from '../../infra/adminTrafficApi';

export const SAO_PAULO_TIMEZONE = 'America/Sao_Paulo';

/**
 * Legenda de "visitantes" por base de cálculo.
 *
 * A base vem da API (`totals.visitorsBasis`): `daily_distinct` são os
 * visitantes distintos **de um dia**; `sum_of_daily_distinct` é a **soma dos
 * distintos de cada dia** do período — a mesma pessoa pode ser contada em
 * dias diferentes. A tela nunca apresenta esse valor como pessoas únicas.
 */
export const VISITOR_BASIS_TOOLTIPS: Record<TrafficVisitorsBasis, string> = {
  daily_distinct: 'Visitantes distintos do dia: quantas pessoas diferentes acessaram o site hoje.',
  sum_of_daily_distinct:
    'Soma dos visitantes distintos de cada dia do período: a mesma pessoa pode ser contada em dias diferentes.',
};

/** Texto neutro para uma base ausente ou desconhecida (nunca mente sobre o número). */
export const VISITOR_TOOLTIP_FALLBACK =
  'Visitantes distintos por dia: a mesma pessoa que volta em outro dia conta de novo.';

/** Rótulo do KPI de visitantes conforme a base informada pela API. */
export const VISITOR_BASIS_LABELS: Record<TrafficVisitorsBasis, string> = {
  daily_distinct: 'Visitantes do dia',
  sum_of_daily_distinct: 'Visitantes (soma dos dias)',
};

/** Legenda curta da base de cálculo (usada quando há mais de um número). */
export const VISITOR_BASIS_LEGENDS: Record<TrafficVisitorsBasis, string> = {
  daily_distinct: 'visitantes distintos do dia',
  sum_of_daily_distinct:
    'soma dos visitantes distintos de cada dia (a mesma pessoa pode ser contada em dias diferentes)',
};

export function getVisitorBasisTooltip(basis: TrafficVisitorsBasis | undefined): string {
  return basis ? VISITOR_BASIS_TOOLTIPS[basis] : VISITOR_TOOLTIP_FALLBACK;
}

/**
 * Legenda do card "Pessoas que entraram": o número de hoje e o dos últimos
 * 7 dias têm bases diferentes (uma por dia, outra a soma dos dias), então a
 * legenda diz qual base vale para cada número.
 */
export function getVisitorBasisLegend(
  dayBasis: TrafficVisitorsBasis | undefined,
  weekBasis: TrafficVisitorsBasis | undefined
): string {
  const day = dayBasis ? VISITOR_BASIS_LEGENDS[dayBasis] : 'visitantes do dia';
  const week = weekBasis ? VISITOR_BASIS_LEGENDS[weekBasis] : 'soma dos dias';

  return `Hoje: ${day}. Últimos 7 dias: ${week}.`;
}

export const PERIOD_LABELS: Record<TrafficPeriod, string> = {
  day: 'Dia',
  week: 'Semana',
  month: 'Mês',
  '3m': '3 meses',
  '6m': '6 meses',
  year: 'Último ano',
  all: 'Anos',
};

export const AREA_LABELS: Record<TrafficArea, string> = {
  all: 'Todas',
  public_site: 'Site público',
  salon_public: 'Páginas de salão',
  logged_area: 'Área logada',
};

export const ROLE_LABELS: Record<TrafficUserRole, string> = {
  MASTER_ADMIN: 'Administrador master',
  OWNER: 'Dono',
  EMPLOYEE: 'Funcionário',
  CUSTOMER: 'Cliente',
};

export const isTrafficPeriod = (value: string | null): value is TrafficPeriod =>
  Boolean(value && TRAFFIC_PERIODS.includes(value as TrafficPeriod));

export const isTrafficArea = (value: string | null): value is TrafficArea =>
  Boolean(value && TRAFFIC_AREAS.includes(value as TrafficArea));

export const isTrafficUserRole = (value: string | null): value is TrafficUserRole =>
  Boolean(value && TRAFFIC_USER_ROLES.includes(value as TrafficUserRole));

export function getSaoPauloCivilDate(reference: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SAO_PAULO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(reference);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '';

  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function isValidCivilDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function isValidCivilMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function normalizeDate(value: string | null, fallback: string): string {
  if (value && isValidCivilDate(value) && value <= fallback) return value;
  return fallback;
}

export function normalizeMonth(value: string | null, fallback: string): string {
  if (value && isValidCivilMonth(value) && value <= fallback) return value;
  return fallback;
}

export function formatDatePtBr(value: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (dateOnly) {
    const date = new Date(
      Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 12)
    );
    return date.toLocaleDateString('pt-BR', { timeZone: SAO_PAULO_TIMEZONE });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('pt-BR', { timeZone: SAO_PAULO_TIMEZONE });
}

export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}
