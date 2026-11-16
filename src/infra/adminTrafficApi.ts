import { apiClient, apiFetch } from './apiClient';
import { authStorage } from './authStorage';

export const TRAFFIC_PERIODS = ['day', 'week', 'month', '3m', '6m', 'year', 'all'] as const;

export type TrafficPeriod = (typeof TRAFFIC_PERIODS)[number];

export const TRAFFIC_AREAS = ['all', 'public_site', 'salon_public', 'logged_area'] as const;

export type TrafficArea = (typeof TRAFFIC_AREAS)[number];

export const TRAFFIC_USER_ROLES = ['MASTER_ADMIN', 'OWNER', 'EMPLOYEE', 'CUSTOMER'] as const;

export type TrafficUserRole = (typeof TRAFFIC_USER_ROLES)[number];

export interface AdminTrafficQuery {
  period: TrafficPeriod;
  area: TrafficArea;
  userRole?: TrafficUserRole;
  /** Civil day anchor. Only sent when period is `day`. */
  date?: string;
  /** Civil month anchor. Only sent when period is `month`. */
  month?: string;
}

export type TrafficBucketGranularity = 'hour' | 'day' | 'week' | 'month' | 'year';
export type TrafficVisitorsBasis = 'daily_distinct' | 'sum_of_daily_distinct';

export interface TrafficPeriodData {
  key: TrafficPeriod;
  label: string;
  granularity: TrafficBucketGranularity;
  fromDay: string;
  toDay: string;
  prevFromDay: string | null;
  prevToDay: string | null;
  timezone: 'America/Sao_Paulo';
  dataFrom: string | null;
}

export interface TrafficTotals {
  visits: number;
  visitors: number;
  visitorsBasis: TrafficVisitorsBasis;
  sessions: number;
  loggedInUsers: number;
  newShops: number;
  newUsers: number;
  newUsersRemoved: number;
}

export interface TrafficDelta {
  visits: number | null;
  visitors: number | null;
  sessions: number | null;
  loggedInUsers: number | null;
  newShops: number | null;
  newUsers: number | null;
}

export interface TrafficSeriesPoint {
  bucketStart: string;
  label: string;
  visits: number;
  visitors: number;
  sessions: number | null;
  newShops: number;
  newUsers: number;
  newUsersRemoved: number;
  partial: boolean;
}

export interface TrafficAreaSummary {
  area: Exclude<TrafficArea, 'all'>;
  label: string;
  visits: number;
  visitors: number;
  sessions: number;
}

export interface TrafficOrigin {
  host: string;
  visits: number;
}

export interface TrafficLoss {
  counterRegressions: number;
  redisUnavailableDrops: number;
  notes: string[];
}

export interface TrafficUserActivity {
  firstRecordedAt: string | null;
}

export interface AdminTrafficData {
  period: TrafficPeriodData;
  generatedAt: string;
  beaconEnabled: boolean;
  totals: TrafficTotals;
  prevTotals: TrafficTotals | null;
  deltaPct: TrafficDelta | null;
  series: TrafficSeriesPoint[];
  areas: TrafficAreaSummary[];
  origins: TrafficOrigin[];
  loss: TrafficLoss;
  userActivity: TrafficUserActivity;
}

export interface AdminTrafficResponse {
  success: boolean;
  data: AdminTrafficData;
}

/**
 * Builds the traffic query according to the endpoint contract. Historical
 * anchors are mutually exclusive: a day sends only `date`, a month sends only
 * `month`, and every other period sends neither.
 */
export function buildAdminTrafficQuery(query: AdminTrafficQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set('period', query.period);
  params.set('area', query.area);

  if (query.userRole) {
    params.set('userRole', query.userRole);
  }

  if (query.period === 'day') {
    if (query.date) params.set('date', query.date);
  } else if (query.period === 'month') {
    if (query.month) params.set('month', query.month);
  }

  return params;
}

function token(): string {
  return authStorage.getAccessToken() || '';
}

export const adminTrafficApi = {
  getTrafficReport(query: AdminTrafficQuery): Promise<AdminTrafficResponse> {
    const search = buildAdminTrafficQuery(query).toString();
    return apiClient<AdminTrafficResponse>(
      `/api/admin/traffic?${search}`,
      'GET',
      undefined,
      token()
    );
  },

  exportTrafficCsv(query: AdminTrafficQuery): Promise<Response> {
    const search = buildAdminTrafficQuery(query).toString();
    return apiFetch(`/api/admin/traffic/export?${search}`, { method: 'GET' }, token());
  },
};
