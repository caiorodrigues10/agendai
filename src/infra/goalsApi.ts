import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export type GoalMetric = 'REVENUE' | 'APPOINTMENTS' | 'PRODUCTS_SOLD';
export type GoalPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface ProfessionalGoal {
  id: string;
  professionalId: string;
  professionalName?: string;
  barbershopId: string;
  metric: GoalMetric;
  target: number;
  current: number;
  percentage: number;
  period: string;
  startDate: string;
  endDate: string;
}

type GoalRecord = {
  id: string;
  professionalId: string;
  professionalName?: string;
  barbershopId: string;
  metric: GoalMetric;
  target: number | string;
  period?: string;
  startDate: string;
  endDate: string;
};

type GoalProgressRow = {
  goal?: GoalRecord;
  current?: number | string;
  target?: number | string;
  percentage?: number | string;
} & Partial<ProfessionalGoal>;

function asNumber(value: number | string | null | undefined, fallback = 0): number {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? n : fallback;
}

function flattenGoal(row: GoalProgressRow | GoalRecord | null | undefined): ProfessionalGoal | null {
  if (!row) return null;
  const nested = 'goal' in row && row.goal ? row.goal : null;
  const base = nested ?? (row as GoalRecord);
  if (!base?.id) return null;
  return {
    id: base.id,
    professionalId: base.professionalId,
    professionalName: base.professionalName,
    barbershopId: base.barbershopId,
    metric: base.metric,
    target: asNumber('target' in row && row.target != null ? row.target : base.target),
    current: asNumber('current' in row ? row.current : 0),
    percentage: asNumber('percentage' in row ? row.percentage : 0),
    period: base.period ?? 'MONTHLY',
    startDate: typeof base.startDate === 'string' ? base.startDate : String(base.startDate),
    endDate: typeof base.endDate === 'string' ? base.endDate : String(base.endDate),
  };
}

function flattenList(res: unknown): ProfessionalGoal[] {
  const data = unwrap<unknown>(res);
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  return rows
    .map(row => flattenGoal(row as GoalProgressRow))
    .filter((row): row is ProfessionalGoal => row != null);
}

export const goalsApi = {
  list: (barbershopId: string, params?: { professionalId?: string; period?: string }) =>
    apiClient<{ success: boolean; data: GoalRecord[] }>(
      `/api/barbershops/${barbershopId}/goals${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(flattenList),

  create: (
    barbershopId: string,
    data: {
      professionalId: string;
      metric: GoalMetric;
      target: number;
      startDate: string;
      endDate: string;
      period?: GoalPeriod;
    }
  ) =>
    apiClient<{ success: boolean; data: GoalRecord }>(
      `/api/barbershops/${barbershopId}/goals`,
      'POST',
      { period: 'MONTHLY', ...data },
      token()
    ).then(res => flattenGoal(unwrap<GoalRecord>(res)) as ProfessionalGoal),

  update: (barbershopId: string, goalId: string, data: { target?: number; endDate?: string }) =>
    apiClient<{ success: boolean; data: GoalRecord }>(
      `/api/barbershops/${barbershopId}/goals/${goalId}`,
      'PATCH',
      data,
      token()
    ).then(res => flattenGoal(unwrap<GoalRecord>(res)) as ProfessionalGoal),

  getProgress: (barbershopId: string, goalId: string) =>
    apiClient<{ success: boolean; data: GoalProgressRow }>(
      `/api/barbershops/${barbershopId}/goals/${goalId}/progress`,
      'GET',
      undefined,
      token()
    ).then(res => flattenGoal(unwrap<GoalProgressRow>(res)) as ProfessionalGoal),

  getRanking: (
    barbershopId: string,
    params?: {
      metric?: GoalMetric;
      startDate?: string;
      endDate?: string;
      from?: string;
      to?: string;
    }
  ) =>
    apiClient<{ success: boolean; data: GoalProgressRow[] }>(
      `/api/barbershops/${barbershopId}/goals/ranking${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    ).then(flattenList),
};
