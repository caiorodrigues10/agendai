import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

const token = () => authStorage.getAccessToken() || '';
const query = (params: Record<string, string | number | undefined>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  return qs.toString() ? `?${qs}` : '';
};
const data = <T>(result: { data: T }) => result.data;

export type SupportCategory = 'ERROR' | 'SUGGESTION' | 'FEEDBACK' | 'QUESTION' | 'BILLING' | 'ACCESS' | 'SCHEDULE';
export type SupportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type SupportStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_SHOP' | 'RESOLVED' | 'CANCELLED';

export interface SupportReport {
  id: string;
  protocol: string;
  title: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

export interface SupportReportComment {
  id: string;
  text: string;
  createdAt: string;
  author: { name: string };
}

export interface SupportReportDetail extends SupportReport {
  description: string;
  comments: SupportReportComment[];
}

export interface SupportReportInput {
  title: string;
  description: string;
  category: SupportCategory;
  priority?: SupportPriority;
  page?: string;
  userAgent?: string;
}

export interface SupportListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const supportApi = {
  createReport: async (input: SupportReportInput): Promise<SupportReport> =>
    data(
      await apiClient<{ success: boolean; data: SupportReport }>(
        '/api/support/reports',
        'POST',
        input,
        token()
      )
    ),
  listMyReports: async (params: { page?: number; limit?: number; status?: string } = {}) =>
    apiClient<{ success: boolean; data: SupportReport[]; meta: SupportListMeta }>(
      `/api/support/reports${query(params)}`,
      'GET',
      undefined,
      token()
    ),
  getReport: async (id: string): Promise<SupportReportDetail> =>
    data(
      await apiClient<{ success: boolean; data: SupportReportDetail }>(
        `/api/support/reports/${id}`,
        'GET',
        undefined,
        token()
      )
    ),
  addComment: async (id: string, text: string): Promise<SupportReportComment> =>
    data(
      await apiClient<{ success: boolean; data: SupportReportComment }>(
        `/api/support/reports/${id}/comments`,
        'POST',
        { text },
        token()
      )
    ),
};
