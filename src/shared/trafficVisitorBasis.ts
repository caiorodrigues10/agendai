import type { TrafficVisitorsBasis } from '../infra/adminTrafficApi';

/**
 * Legenda da base de visitantes, usada tanto no painel master
 * (`/master/traffic`) quanto no painel do dono ("Visitas ao seu salão").
 */
export const VISITOR_BASIS_TOOLTIPS: Record<TrafficVisitorsBasis, string> = {
  daily_distinct: 'Visitantes distintos no dia.',
  sum_of_daily_distinct:
    'Soma dos visitantes distintos de cada dia. A mesma pessoa pode ser contada em dias diferentes.',
};

export const getVisitorBasisTooltip = (basis: TrafficVisitorsBasis): string =>
  VISITOR_BASIS_TOOLTIPS[basis];
