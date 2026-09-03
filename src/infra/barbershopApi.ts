import { API_BASE, apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { DaySchedule, Service, StaffMember, FeedPost, PostMode, PostConfig, OperationMode, OpeningMode, ManualShopStatus, ShopOpenState, ScheduleException, BusinessSegment } from '../types';
import { mapScheduleToApi } from '../utils/schedulingUtils';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

interface BarbershopData {
  name?: string;
  whatsapp?: string;
  address?: string | null;
  city?: string | null;
  logoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  operationMode?: OperationMode;
  openingMode?: OpeningMode;
  businessSegment?: BusinessSegment;
  manualStatus?: ManualShopStatus;
  openState?: ShopOpenState;
  scheduleExceptions?: ScheduleException[];
}

export interface ShopStatusPayload {
  id?: string;
  openingMode: OpeningMode;
  manualStatus: ManualShopStatus;
  openState: ShopOpenState;
  scheduleExceptions: ScheduleException[];
}

type UpdateBarbershopPayload = Partial<BarbershopData>;

type AddServicePayload = Omit<Service, 'id'>;
type UpdateServicePayload = Partial<AddServicePayload>;

interface StaffPayload {
  name: string;
  email: string;
  password?: string;
  cpf?: string;
  role: string;
  barbershopId: string;
  permissions?: string[];
}

type AddPostPayload = Omit<FeedPost, 'id' | 'createdAt' | 'updatedAt' | 'likes'>;
type UpdatePostPayload = Partial<AddPostPayload>;

interface CreatePostPayload {
  barbershopId: string;
  postMode: PostMode;
  type: string;
  title?: string;
  ctaText?: string;
  content?: string;
  imageUrl?: string;
  scheduledFor?: string;
  templateKey?: string;
  format?: 'square' | 'portrait' | 'story';
  primaryMediaId?: string | null;
  secondaryMediaId?: string | null;
  paletteKey?: string;
  designOptions?: { focalX?: number; focalY?: number; overlay?: number };
}

export interface PostAiSuggestion {
  title: string;
  ctaText: string;
}

interface GeneratePostPayload {
  barbershopId: string;
  type: string;
  postMode: PostMode;
  tone?: 'promocional' | 'informativo' | 'divertido';
  extra?: string;
  count?: number;
}

interface PostConfigPayload {
  barbershopId: string;
  autoPostEnabled: boolean;
}

export interface ShopWhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'open';
  connected: boolean;
  method: 'qr' | 'pairing_code' | null;
  qrcodeBase64: string | null;
  pairingCode: string | null;
}

export interface QueueAlertSettings {
  enabled: boolean; threshold: number; phone: string | null; currentWaiting: number; exceeded: boolean; whatsappConnected: boolean; queueEnabled: boolean;
}

async function uploadLogoMultipart(barbershopId: string, file: File): Promise<{ logoUrl: string }> {
  const token = authStorage.getAccessToken() || '';
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(`${API_BASE}/api/barbershops/${encodeURIComponent(barbershopId)}/logo/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
    body: formData,
  });

  const bodyText = await response.text();
  if (!response.ok) {
    let message = `Falha ao enviar logo (${response.status})`;
    if (bodyText) {
      try {
        const parsed = JSON.parse(bodyText) as { message?: string };
        if (parsed.message) message = parsed.message;
      } catch {
        /* ignore malformed error body */
      }
    }
    throw new Error(message);
  }

  if (!bodyText) {
    throw new Error('O servidor respondeu sem dados ao enviar a logo. Verifique se a API está no ar.');
  }

  let parsed: { data?: { logoUrl?: string } };
  try {
    parsed = JSON.parse(bodyText) as { data?: { logoUrl?: string } };
  } catch {
    throw new Error('Resposta inválida do servidor ao enviar a logo.');
  }

  if (!parsed.data?.logoUrl) {
    throw new Error('Resposta inválida: logoUrl ausente.');
  }

  return { logoUrl: parsed.data.logoUrl };
}

export const barbershopApi = {
  listBarbershops: () =>
    apiClient<{ success: boolean; data: BarbershopData[] }>('/api/barbershops').then(unwrap),
  getBarbershop: (id: string) =>
    apiClient<{ success: boolean; data: BarbershopData }>(`/api/barbershops/${id}`).then(res =>
      unwrap<BarbershopData>(res)
    ),
  getSchedule: (id: string) =>
    apiClient<{ success: boolean; data: DaySchedule[] }>(`/api/barbershops/${id}/schedule`).then(
      unwrap
    ),
  getAppointmentPolicy: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: AppointmentPolicy }>(`/api/barbershops/${id}/appointment-policy`, 'GET', undefined, token).then(res => unwrap<AppointmentPolicy>(res));
  },
  updateAppointmentPolicy: (id: string, payload: Partial<AppointmentPolicy>) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: AppointmentPolicy }>(`/api/barbershops/${id}/appointment-policy`, 'PATCH', payload, token).then(res => unwrap<AppointmentPolicy>(res));
  },
  updateBarbershop: (id: string, payload: UpdateBarbershopPayload) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: BarbershopData }>(
      `/api/barbershops/${id}`,
      'PATCH',
      payload,
      token
    ).then(unwrap);
  },
  updateSchedule: (id: string, schedule: DaySchedule[]) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: DaySchedule[] }>(
      `/api/barbershops/${id}/schedule`,
      'PATCH',
      mapScheduleToApi(schedule),
      token
    );
  },
  listServices: (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<{ success: boolean; data: Service[] }>(`/api/services${qs}`).then(res =>
      unwrap<Service[]>(res)
    );
  },
  addService: (payload: AddServicePayload) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: Service }>(
      '/api/services',
      'POST',
      payload,
      token
    ).then(res => unwrap<Service>(res));
  },
  updateService: (id: string, payload: UpdateServicePayload) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: Service }>(
      `/api/services/${id}`,
      'PATCH',
      payload,
      token
    ).then(res => unwrap<Service>(res));
  },
  deleteService: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/services/${id}`, 'DELETE', undefined, token);
  },
  listStaff: async (barbershopId?: string) => {
    const token = authStorage.getAccessToken() || '';
    if (token) {
      const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
      try {
        const res = await apiClient<{ success: boolean; data: StaffMember[] }>(
          `/api/users${qs}`,
          'GET',
          undefined,
          token
        );
        const data = unwrap<StaffMember[]>(res);
        return Array.isArray(data) ? data : [];
      } catch {
        // OWNER-only /users: visitante ou employee cai no endpoint público.
      }
    }
    if (!barbershopId) return [];
    const res = await apiClient<{ success: boolean; data: { id: string; name: string }[] }>(
      `/api/barbershops/${barbershopId}/staff`,
      'GET'
    );
    const data = unwrap<{ id: string; name: string }[]>(res);
    if (!Array.isArray(data)) return [];
    return data.map(member => ({
      id: member.id,
      name: member.name,
      email: '',
      role: 'EMPLOYEE' as const,
      barbershopId,
    }));
  },
  addStaff: (payload: StaffPayload) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: StaffMember }>(
      '/api/users',
      'POST',
      payload,
      token
    ).then(unwrap);
  },
  updateStaff: (id: string, payload: Partial<StaffPayload>) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: StaffMember }>(
      `/api/users/${id}`,
      'PATCH',
      payload,
      token
    ).then(unwrap);
  },
  deleteStaff: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/users/${id}`, 'DELETE', undefined, token);
  },
  listFeed: (barbershopId?: string) => {
    const qs = barbershopId ? `?barbershopId=${barbershopId}` : '';
    return apiClient<{ success: boolean; data: FeedPost[] }>(`/api/feed${qs}`).then(res =>
      unwrap<FeedPost[]>(res)
    );
  },
  addPost: (payload: AddPostPayload) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: FeedPost }>(
      '/api/feed',
      'POST',
      payload,
      token
    ).then(res => unwrap<FeedPost>(res));
  },
  deletePost: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/feed/${id}`, 'DELETE', undefined, token);
  },
  updatePost: (id: string, payload: UpdatePostPayload) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: FeedPost }>(
      `/api/feed/${id}`,
      'PATCH',
      payload,
      token
    ).then(res => unwrap<FeedPost>(res));
  },

  getPostPreview: (
    barbershopId: string,
    postMode: PostMode,
    type: string,
    title?: string,
    ctaText?: string,
    templateKey = 'agenda-aberta',
    format: 'square' | 'portrait' | 'story' = 'square'
  ) => {
    const token = authStorage.getAccessToken() || '';
    const params = new URLSearchParams({
      barbershopId,
      postMode,
      type,
      templateKey,
      format,
    });
    if (title?.trim()) params.set('title', title.trim());
    if (ctaText?.trim()) params.set('ctaText', ctaText.trim());
    return apiClient<{ success: boolean; data: { imageUrl: string } }>(
      `/api/posts/preview?${params.toString()}`,
      'GET',
      undefined,
      token
    ).then(res => unwrap<{ imageUrl: string }>(res));
  },
  generatePostContent: (payload: GeneratePostPayload) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{
      success: boolean;
      data: { suggestions: PostAiSuggestion[]; source: 'ai' | 'template' };
    }>('/api/posts/generate', 'POST', payload, token).then(
      res => unwrap<{ suggestions: PostAiSuggestion[]; source: 'ai' | 'template' }>(res)
    );
  },
  createPost: (payload: CreatePostPayload) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: FeedPost }>(
      '/api/posts',
      'POST',
      payload,
      token
    ).then(res => unwrap<FeedPost>(res));
  },
  updateScheduledPost: (id: string, payload: Partial<CreatePostPayload> & { status?: string }) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: FeedPost }>(
      `/api/posts/${id}`,
      'PATCH',
      payload,
      token
    ).then(res => unwrap<FeedPost>(res));
  },
  listScheduledPosts: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: FeedPost[] }>(
      `/api/posts/scheduled?barbershopId=${encodeURIComponent(barbershopId)}`,
      'GET',
      undefined,
      token
    ).then(res => unwrap<FeedPost[]>(res));
  },
  getPostConfig: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: PostConfig }>(
      `/api/posts/config?barbershopId=${encodeURIComponent(barbershopId)}`,
      'GET',
      undefined,
      token
    ).then(res => unwrap<PostConfig>(res));
  },
  savePostConfig: (barbershopId: string, autoPostEnabled: boolean) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: PostConfig }>(
      '/api/posts/config',
      'PUT',
      { barbershopId, autoPostEnabled },
      token
    ).then(res => unwrap<PostConfig>(res));
  },
  deleteScheduledPost: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/posts/${id}`, 'DELETE', undefined, token);
  },

  getWhatsAppStatus: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: ShopWhatsAppStatus }>(
      `/api/barbershops/${barbershopId}/whatsapp`,
      'GET',
      undefined,
      token
    ).then(res => unwrap<ShopWhatsAppStatus>(res));
  },

  connectWhatsApp: (barbershopId: string, input: { method: 'qr' } | { method: 'pairing_code'; phoneNumber: string } = { method: 'qr' }) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: ShopWhatsAppStatus }>(
      `/api/barbershops/${barbershopId}/whatsapp/connect`,
      'POST',
      input,
      token
    ).then(res => unwrap<ShopWhatsAppStatus>(res));
  },

  disconnectWhatsApp: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: ShopWhatsAppStatus }>(
      `/api/barbershops/${barbershopId}/whatsapp/disconnect`,
      'POST',
      undefined,
      token
    ).then(res => unwrap<ShopWhatsAppStatus>(res));
  },

  getQueueAlert: (id: string) => apiClient<{ success: boolean; data: QueueAlertSettings }>(`/api/barbershops/${id}/queue-alert`, 'GET', undefined, authStorage.getAccessToken() || '').then(res => unwrap<QueueAlertSettings>(res)),
  updateQueueAlert: (id: string, payload: { enabled: boolean; threshold: number; phone?: string | null }) => apiClient<{ success: boolean; data: Partial<QueueAlertSettings> }>(`/api/barbershops/${id}/queue-alert`, 'PATCH', payload, authStorage.getAccessToken() || '').then(res => unwrap<Partial<QueueAlertSettings>>(res)),
  testQueueAlert: (id: string) => apiClient<{ success: boolean; data: { sent: boolean } }>(`/api/barbershops/${id}/queue-alert/test`, 'POST', undefined, authStorage.getAccessToken() || '').then(res => unwrap<{ sent: boolean }>(res)),

  updateOnboardingStep: (barbershopId: string, step: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/onboarding/steps`,
      'POST',
      { step },
      token
    );
  },

  getOnboarding: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: { steps: { key: string; label: string; completed: boolean; required: boolean }[]; progress: number; nextStep: string | null; completed: boolean; welcomeSeen: boolean; dismissed: boolean } }>(
      `/api/barbershops/${barbershopId}/onboarding`, 'GET', undefined, token
    ).then(res => unwrap<{ steps: { key: string; label: string; completed: boolean; required: boolean }[]; progress: number; nextStep: string | null; completed: boolean; welcomeSeen: boolean; dismissed: boolean }>(res));
  },

  markOnboardingWelcomeSeen: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient(`/api/barbershops/${barbershopId}/onboarding/welcome-seen`, 'POST', undefined, token);
  },

  dismissOnboarding: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient(`/api/barbershops/${barbershopId}/onboarding/dismiss`, 'POST', undefined, token);
  },

  reopenOnboarding: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient(`/api/barbershops/${barbershopId}/onboarding/reopen`, 'POST', undefined, token);
  },

  getLogoUploadUrl: (barbershopId: string, mimeType: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: { uploadUrl: string; publicUrl: string } }>(
      `/api/barbershops/${barbershopId}/logo/upload-url?mimeType=${encodeURIComponent(mimeType)}`,
      'GET',
      undefined,
      token
    ).then(res => unwrap<{ uploadUrl: string; publicUrl: string }>(res));
  },

  confirmLogo: (barbershopId: string, logoUrl: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: BarbershopData }>(
      `/api/barbershops/${barbershopId}/logo`,
      'PATCH',
      { logoUrl },
      token
    ).then(res => unwrap<BarbershopData>(res));
  },

  deleteLogo: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/barbershops/${barbershopId}/logo`, 'DELETE', undefined, token);
  },

  uploadLogoDirect: async (barbershopId: string, file: File): Promise<{ logoUrl: string }> => {
    const mimeType = file.type === 'image/jpg' ? 'image/jpeg' : file.type || 'image/jpeg';

    try {
      const { uploadUrl, publicUrl } = await barbershopApi.getLogoUploadUrl(barbershopId, mimeType);
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`Falha ao enviar arquivo para o storage (${putRes.status})`);
      }
      const confirmed = await barbershopApi.confirmLogo(barbershopId, publicUrl);
      return { logoUrl: confirmed.logoUrl ?? publicUrl };
    } catch (signedUrlErr) {
      // Fallback: multipart via backend (útil quando CORS do GCS não está configurado)
      try {
        return await uploadLogoMultipart(barbershopId, file);
      } catch (multipartErr) {
        throw multipartErr instanceof Error && multipartErr.message
          ? multipartErr
          : signedUrlErr instanceof Error
            ? signedUrlErr
            : new Error('Não foi possível enviar a logo.');
      }
    }
  },

  updateOperationMode: async (
    barbershopId: string,
    operationMode: OperationMode
  ): Promise<{
    operationMode: OperationMode;
    capabilities: { queue: boolean; appointments: boolean };
    pending: { manualQueue: number; futureAppointments: number };
  }> => {
    const token = authStorage.getAccessToken() || '';
    const res = await apiClient<{
      success: boolean;
      data: {
        operationMode: OperationMode;
        capabilities: { queue: boolean; appointments: boolean };
        pending: { manualQueue: number; futureAppointments: number };
      };
    }>(
      `/api/barbershops/${barbershopId}/operation-mode`,
      'PATCH',
      { operationMode },
      token
    );
    return (res as { data: { operationMode: OperationMode; capabilities: { queue: boolean; appointments: boolean }; pending: { manualQueue: number; futureAppointments: number } } }).data;
  },

  setManualStatus: (id: string, status: ManualShopStatus) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: ShopStatusPayload }>(
      `/api/barbershops/${id}/manual-status`,
      'PATCH',
      { status },
      token
    ).then(res => unwrap<ShopStatusPayload>(res));
  },

  setQueueStatus: (id: string, closed: boolean) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: ShopStatusPayload }>(
      `/api/barbershops/${id}/queue-status`,
      'PATCH',
      { closed },
      token
    ).then(res => unwrap<ShopStatusPayload>(res));
  },

  listScheduleExceptions: (id: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: ScheduleException[] }>(
      `/api/barbershops/${id}/schedule-exceptions`,
      'GET',
      undefined,
      token
    ).then(res => unwrap<ScheduleException[]>(res));
  },

  createScheduleExceptions: (
    id: string,
    payload: { from: string; to?: string; reason?: string; isOpen?: boolean }
  ) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: ScheduleException[] }>(
      `/api/barbershops/${id}/schedule-exceptions`,
      'POST',
      payload,
      token
    ).then(res => unwrap<ScheduleException[]>(res));
  },

  deleteScheduleException: (id: string, exceptionId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean }>(
      `/api/barbershops/${id}/schedule-exceptions/${exceptionId}`,
      'DELETE',
      undefined,
      token
    );
  },

  uploadPostVideo: async (barbershopId: string, file: File): Promise<{ videoUrl: string }> => {
    const token = authStorage.getAccessToken() || '';
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`/api/feed/${encodeURIComponent(barbershopId)}/video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao enviar vídeo' }));
      throw new Error(error.message || 'Erro ao enviar vídeo');
    }

    const result = await response.json();
    return result.data;
  },
};

export interface AppointmentPolicy {
  bookingNoticeMinutes: number;
  cancelNoticeMinutes: number;
  rescheduleNoticeMinutes: number;
  bookingHorizonDays: number;
  allowPublicCancellation: boolean;
  allowPublicReschedule: boolean;
  requestReview: boolean;
}
