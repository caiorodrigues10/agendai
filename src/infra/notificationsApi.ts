import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

export interface SendWhatsAppPayload {
  phone: string;
  message: string;
  barbershopId?: string;
}

export const notificationsApi = {
  sendWhatsApp: async (payload: SendWhatsAppPayload) => {
    const token = authStorage.getAccessToken() || '';
    const res = await apiClient<{ success: boolean; data: { sent: boolean } }>(
      '/api/notifications/whatsapp',
      'POST',
      payload,
      token
    );
    return unwrap<{ sent: boolean }>(res);
  },
};
