import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface CopilotSuggestion {
  id: string;
  barbershopId: string;
  type: string;
  title: string;
  description: string;
  priority: number;
  actionLabel?: string;
  actionPayload?: Record<string, unknown>;
  status: string;
  createdAt: string;
}

export const copilotApi = {
  listSuggestions: (barbershopId: string, params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiClient<{ success: boolean; data: CopilotSuggestion[] }>(
      `/api/barbershops/${barbershopId}/copilot/suggestions${query ? '?' + query : ''}`,
      'GET',
      undefined,
      token()
    ).then(r => unwrap<CopilotSuggestion[]>(r));
  },

  markRead: (barbershopId: string, suggestionId: string) =>
    apiClient<{ success: boolean; data: CopilotSuggestion }>(
      `/api/barbershops/${barbershopId}/copilot/suggestions/${suggestionId}/read`,
      'PATCH',
      undefined,
      token()
    ).then(r => unwrap<CopilotSuggestion>(r)),

  dismiss: (barbershopId: string, suggestionId: string) =>
    apiClient<{ success: boolean; data: CopilotSuggestion }>(
      `/api/barbershops/${barbershopId}/copilot/suggestions/${suggestionId}/dismiss`,
      'PATCH',
      undefined,
      token()
    ).then(r => unwrap<CopilotSuggestion>(r)),

  accept: (barbershopId: string, suggestionId: string) =>
    apiClient<{ success: boolean; data: CopilotSuggestion }>(
      `/api/barbershops/${barbershopId}/copilot/suggestions/${suggestionId}/accept`,
      'PATCH',
      undefined,
      token()
    ).then(r => unwrap<CopilotSuggestion>(r)),

  generate: (barbershopId: string) =>
    apiClient<{ success: boolean; data: CopilotSuggestion[] }>(
      `/api/barbershops/${barbershopId}/copilot/generate`,
      'POST',
      undefined,
      token()
    ).then(r => unwrap<CopilotSuggestion[]>(r)),
};
