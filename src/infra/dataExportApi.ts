import { apiClient, API_BASE } from './apiClient';
import { authStorage } from './authStorage';

export type ExportPeriodPreset =
  | 'TODAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'LAST_3_MONTHS'
  | 'LAST_6_MONTHS'
  | 'LAST_12_MONTHS'
  | 'CUSTOM'
  | 'ALL';

export type ExportModuleKey =
  | 'appointments'
  | 'clients'
  | 'services'
  | 'team'
  | 'financial'
  | 'commissions'
  | 'products'
  | 'sales'
  | 'packages'
  | 'fiado'
  | 'queue'
  | 'waitlist'
  | 'reviews'
  | 'loyalty'
  | 'posts'
  | 'settings';

export type ExportFormat = 'XLSX' | 'CSV_ZIP' | 'PDF';

export type ExportJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export interface ExportProgress {
  currentSheet: string | null;
  sheetsDone: number;
  sheetsTotal: number;
  rowsWritten: number;
  skippedSheets: string[];
}

export interface ExportJob {
  id: string;
  periodPreset: ExportPeriodPreset;
  periodFrom: string | null;
  periodTo: string | null;
  timezone: string;
  modules: ExportModuleKey[];
  options: { anonymize: boolean; includeCase: boolean };
  format: ExportFormat;
  status: ExportJobStatus;
  progress: ExportProgress | null;
  fileSizeBytes: number | null;
  fileName: string | null;
  errorMessage: string | null;
  createdAt: string;
  finishedAt: string | null;
  expiresAt: string | null;
  periodLabel?: string;
}

export interface CreateExportInput {
  periodPreset: ExportPeriodPreset;
  dateFrom?: string;
  dateTo?: string;
  modules?: ExportModuleKey[];
  preset?: 'GERENTIAL' | 'BACKUP';
  format?: ExportFormat;
  options?: { anonymize?: boolean; includeCase?: boolean };
}

function token(): string | undefined {
  return authStorage.getAccessToken() || undefined;
}

function barbershopId(): string | undefined {
  return undefined;
}

export const dataExportApi = {
  create: async (barbershopId: string, input: CreateExportInput): Promise<ExportJob> => {
    const response = await apiClient<{ success: boolean; data: ExportJob }>(
      `/api/barbershops/${barbershopId}/exports`,
      'POST',
      input,
      token(),
    );
    return response.data;
  },
  list: async (barbershopId: string): Promise<ExportJob[]> => {
    const response = await apiClient<{ success: boolean; data: ExportJob[] }>(
      `/api/barbershops/${barbershopId}/exports`,
      'GET',
      undefined,
      token(),
    );
    return response.data;
  },
  get: async (barbershopId: string, exportId: string): Promise<ExportJob> => {
    const response = await apiClient<{ success: boolean; data: ExportJob }>(
      `/api/barbershops/${barbershopId}/exports/${exportId}`,
      'GET',
      undefined,
      token(),
    );
    return response.data;
  },
  downloadUrl: (barbershopId: string, exportId: string): string =>
    `${API_BASE}/api/barbershops/${barbershopId}/exports/${exportId}/download`,
  remove: async (barbershopId: string, exportId: string): Promise<void> => {
    await apiClient<void>(`/api/barbershops/${barbershopId}/exports/${exportId}`, 'DELETE', undefined, token());
  },
};

export function exportFileNameForJob(job: ExportJob): string {
  return job.fileName ?? `agendai-exportacao-${job.id.slice(0, 8)}.xlsx`;
}
