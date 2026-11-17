import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import type { TrafficOrigin, TrafficPeriodData, TrafficVisitorsBasis } from './adminTrafficApi';

/**
 * Relatório de visitas à página pública de um salão (somente leitura, dono).
 *
 * Contrato de backend pendente: `docs/TRAFFIC_BEACON_BACKEND_CONTRACT.md`.
 * Nada aqui foi implementado no backend ainda.
 */
export const SALON_TRAFFIC_PERIODS = ['day', 'week', 'month', '3m', 'year'] as const;

export type SalonTrafficPeriod = (typeof SALON_TRAFFIC_PERIODS)[number];

export interface SalonTrafficQuery {
  period: SalonTrafficPeriod;
}

/** Seções da página pública do salão (chaves fixas enviadas pelo backend). */
export const SALON_TRAFFIC_SECTIONS = [
  'profile',
  'queue',
  'appointments',
  'products',
  'other',
] as const;

export type SalonTrafficSectionKey = (typeof SALON_TRAFFIC_SECTIONS)[number];

export interface SalonTrafficTotals {
  visits: number;
  visitors: number;
  visitorsBasis: TrafficVisitorsBasis;
}

export interface SalonTrafficDelta {
  visits: number | null;
  visitors: number | null;
}

export interface SalonTrafficSeriesPoint {
  bucketStart: string;
  label: string;
  visits: number;
  visitors: number;
  partial: boolean;
}

export interface SalonTrafficSectionSummary {
  section: SalonTrafficSectionKey;
  visits: number;
  visitors: number;
}

export interface SalonTrafficData {
  period: TrafficPeriodData;
  generatedAt: string;
  beaconEnabled: boolean;
  totals: SalonTrafficTotals;
  prevTotals: SalonTrafficTotals | null;
  deltaPct: SalonTrafficDelta | null;
  series: SalonTrafficSeriesPoint[];
  sections: SalonTrafficSectionSummary[];
  origins: TrafficOrigin[];
}

export interface SalonTrafficResponse {
  success: boolean;
  data: SalonTrafficData;
}

/**
 * Monta a query do relatório: apenas `period`. O salão vai no caminho da rota,
 * nunca na query, e nenhum filtro de visitante é enviado pelo frontend.
 */
export function buildSalonTrafficQuery(query: SalonTrafficQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set('period', query.period);
  return params;
}

function token(): string {
  return authStorage.getAccessToken() || '';
}

/** `GET /api/barbershops/:id/traffic` — autenticado, restrito ao dono do salão. */
export function getSalonTraffic(
  barbershopId: string,
  query: SalonTrafficQuery
): Promise<SalonTrafficResponse> {
  const search = buildSalonTrafficQuery(query).toString();
  return apiClient<SalonTrafficResponse>(
    `/api/barbershops/${encodeURIComponent(barbershopId)}/traffic?${search}`,
    'GET',
    undefined,
    token()
  );
}

export const salonTrafficApi = {
  getSalonTraffic,
};
