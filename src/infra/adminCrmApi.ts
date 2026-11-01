import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

const token = () => authStorage.getAccessToken() || '';

export type CrmBackfillRunStatus = 'RUNNING' | 'SUCCEEDED' | 'FAILED';
export type CrmBackfillScope = 'TENANT' | 'GLOBAL';

export interface AdminCrmBackfillRun {
  id: string;
  barbershopId: string;
  barbershopName: string | null;
  version: string;
  status: CrmBackfillRunStatus;
  scope: CrmBackfillScope;
  linkedRecords: number;
  createdEvents: number;
  totalEvents: number;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
  triggeredBy: { id: string; name: string; email: string } | null;
}

export interface AdminCrmBackfillRunsResponse {
  success: boolean;
  data: AdminCrmBackfillRun[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    running: number;
    runningGlobal: number;
  };
}

/** Histórico de execuções do backfill de CRM (painel master). */
export const adminCrmApi = {
  backfillRuns: async (params: {
    page?: number;
    limit?: number;
    status?: CrmBackfillRunStatus;
    scope?: CrmBackfillScope;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    if (params.scope) qs.set('scope', params.scope);
    const query = qs.toString();
    return apiClient<AdminCrmBackfillRunsResponse>(
      `/api/admin/crm/backfill/runs${query ? `?${query}` : ''}`,
      'GET',
      undefined,
      token(),
    );
  },
};
