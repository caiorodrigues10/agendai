import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token(): string {
  return authStorage.getAccessToken() || '';
}

function unwrap<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : '';
}

export type NotificationChannel = 'EMAIL' | 'WHATSAPP';

export type NotificationDeliveryStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'PROCESSING'
  | 'RETRYING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'BOUNCED'
  | 'COMPLAINED'
  | 'SUPPRESSED'
  | 'SKIPPED'
  | 'CANCELED';

export interface NotificationDelivery {
  id: string;
  channel: NotificationChannel;
  type: string;
  status: NotificationDeliveryStatus;
  destinationMasked?: string | null;
  maskedDestination?: string | null;
  recipientMasked?: string | null;
  attemptCount?: number;
  attempts?: number;
  lastError?: string | null;
  lastErrorMessage?: string | null;
  lastErrorCode?: string | null;
  barbershopId?: string | null;
  barbershopName?: string | null;
  createdAt: string;
  queuedAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  failedAt?: string | null;
}

export interface NotificationListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationDeliveryList {
  data: NotificationDelivery[];
  meta: NotificationListMeta;
}

export interface ListNotificationDeliveriesParams {
  channel?: NotificationChannel;
  type?: string;
  status?: NotificationDeliveryStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  barbershopId?: string;
}

export interface NotificationPreference {
  channel: NotificationChannel;
  type: string;
  enabled: boolean;
  label?: string;
  description?: string;
}

export interface NotificationWorkerHealth {
  status?: string;
  heartbeatAt?: string | null;
  lastHeartbeatAt?: string | null;
}

export interface NotificationOperationsHealth {
  status?: string;
  worker?: NotificationWorkerHealth;
  scheduler?: NotificationWorkerHealth;
  outbox?: {
    pending?: number;
    processing?: number;
    oldestPendingAt?: string | null;
  };
  queue?: {
    waiting?: number;
    active?: number;
    delayed?: number;
    failed?: number;
  };
  deliveries?: {
    totalLast15Minutes?: number;
    failedLast15Minutes?: number;
    failureRate?: number;
  };
  checkedAt?: string;
}

export interface SendWhatsAppPayload {
  phone: string;
  message: string;
  barbershopId: string;
}

export interface QueuedNotification {
  deliveryId: string;
  status: NotificationDeliveryStatus;
  queued: boolean;
}

function normalizePreferences(response: unknown): NotificationPreference[] {
  const value = unwrap<unknown>(response);
  if (Array.isArray(value)) return value as NotificationPreference[];
  if (value && typeof value === 'object' && 'preferences' in value) {
    const preferences = (value as { preferences?: unknown }).preferences;
    return Array.isArray(preferences) ? (preferences as NotificationPreference[]) : [];
  }
  return [];
}

export const notificationsApi = {
  sendWhatsApp: async (
    payload: SendWhatsAppPayload,
    idempotencyKey = crypto.randomUUID()
  ): Promise<QueuedNotification> => {
    const response = await apiClient<{ success: boolean; data: QueuedNotification }>(
      '/api/notifications/whatsapp',
      'POST',
      payload,
      token(),
      { headers: { 'Idempotency-Key': idempotencyKey } }
    );
    return unwrap<QueuedNotification>(response);
  },

  listDeliveries: async (
    params: ListNotificationDeliveriesParams = {}
  ): Promise<NotificationDeliveryList> => {
    const response = await apiClient<{
      success: boolean;
      data: NotificationDelivery[];
      meta: NotificationListMeta;
    }>(
      `/api/notifications/deliveries${query({
        channel: params.channel,
        type: params.type,
        status: params.status,
        from: params.from,
        to: params.to,
        page: params.page,
        limit: params.limit,
        barbershopId: params.barbershopId,
      })}`,
      'GET',
      undefined,
      token()
    );
    const items = Array.isArray(response.data) ? response.data : [];
    return {
      data: items,
      meta: response.meta ?? {
        total: items.length,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        totalPages: 1,
      },
    };
  },

  retryDelivery: async (
    deliveryId: string,
    idempotencyKey = crypto.randomUUID()
  ): Promise<QueuedNotification> => {
    const response = await apiClient<{ success: boolean; data: QueuedNotification }>(
      `/api/notifications/deliveries/${encodeURIComponent(deliveryId)}/retry`,
      'POST',
      undefined,
      token(),
      { headers: { 'Idempotency-Key': idempotencyKey } }
    );
    return unwrap<QueuedNotification>(response);
  },

  getPreferences: async (): Promise<NotificationPreference[]> => {
    const response = await apiClient<unknown>(
      '/api/notifications/preferences',
      'GET',
      undefined,
      token()
    );
    return normalizePreferences(response);
  },

  updatePreferences: async (
    preferences: NotificationPreference[]
  ): Promise<NotificationPreference[]> => {
    const response = await apiClient<unknown>(
      '/api/notifications/preferences',
      'PATCH',
      {
        preferences: preferences.map(({ channel, type, enabled }) => ({
          channel,
          type,
          enabled,
        })),
      },
      token()
    );
    return normalizePreferences(response);
  },

  getOperationsHealth: async (): Promise<NotificationOperationsHealth> => {
    const response = await apiClient<unknown>(
      '/api/admin/operations/notifications',
      'GET',
      undefined,
      token()
    );
    return unwrap<NotificationOperationsHealth>(response);
  },
};
