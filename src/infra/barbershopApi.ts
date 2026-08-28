import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { DaySchedule, Service, StaffMember, FeedPost, PostMode, PostConfig } from '../types';
import { mapScheduleToApi } from '../utils/schedulingUtils';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

interface BarbershopData {
  name?: string;
  whatsapp?: string;
  address?: string | null;
  logoUrl?: string | null;
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
  qrcodeBase64: string | null;
}

export const barbershopApi = {
  listBarbershops: () =>
    apiClient<{ success: boolean; data: BarbershopData[] }>('/api/barbershops').then(unwrap),
  getBarbershop: (id: string) =>
    apiClient<{ success: boolean; data: BarbershopData }>(`/api/barbershops/${id}`).then(unwrap),
  getSchedule: (id: string) =>
    apiClient<{ success: boolean; data: DaySchedule[] }>(`/api/barbershops/${id}/schedule`).then(
      unwrap
    ),
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

  getPostPreview: (barbershopId: string, postMode: PostMode, type: string) => {
    const token = authStorage.getAccessToken() || '';
    const qs = `barbershopId=${encodeURIComponent(barbershopId)}&postMode=${postMode}&type=${encodeURIComponent(type)}`;
    return apiClient<{ success: boolean; data: { imageUrl: string } }>(
      `/api/posts/preview?${qs}`,
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

  connectWhatsApp: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<{ success: boolean; data: ShopWhatsAppStatus }>(
      `/api/barbershops/${barbershopId}/whatsapp/connect`,
      'POST',
      undefined,
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
    ).then(unwrap);
  },

  deleteLogo: (barbershopId: string) => {
    const token = authStorage.getAccessToken() || '';
    return apiClient<void>(`/api/barbershops/${barbershopId}/logo`, 'DELETE', undefined, token);
  },

  uploadPostVideo: async (barbershopId: string, file: File): Promise<{ videoUrl: string }> => {
    const token = authStorage.getAccessToken() || '';
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`/api/feed/video?barbershopId=${barbershopId}`, {
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
