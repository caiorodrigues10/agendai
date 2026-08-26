import { apiClient, ApiError } from './apiClient';

export type ContactTopic = 'planos' | 'suporte' | 'parceria' | 'outro';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  topic: ContactTopic;
  message: string;
}

export interface ContactResult {
  id: string;
  receivedAt: string;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const contactApi = {
  submit: async (payload: ContactPayload): Promise<ContactResult> => {
    const res = await apiClient<{ success: boolean; data: ContactResult }>(
      '/api/contact',
      'POST',
      payload
    );
    return unwrap<ContactResult>(res);
  },
};

export { ApiError };
