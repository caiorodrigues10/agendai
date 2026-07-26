import { apiClient } from '../infra/apiClient';
import { authStorage } from '../infra/authStorage';

/** Envia WhatsApp via backend (requer staff autenticado). */
export const notifyBarberBot = async (targetPhone: string, message: string): Promise<boolean> => {
  const token = authStorage.getAccessToken();
  if (!token) return false;

  try {
    const res = await apiClient<{ success: boolean; data: { sent: boolean } }>(
      '/api/notifications/whatsapp',
      'POST',
      { phone: targetPhone, message },
      token
    );
    return res.data?.sent ?? false;
  } catch {
    return false;
  }
};
