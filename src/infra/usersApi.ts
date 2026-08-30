import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const usersApi = {
  getAvatarUploadUrl: (userId: string, mimeType: string) =>
    apiClient<{ success: boolean; data: { uploadUrl: string; publicUrl: string; objectName: string } }>(
      `/api/users/${userId}/avatar/upload-url?mimeType=${encodeURIComponent(mimeType)}`,
      'GET',
      undefined,
      token()
    ).then(res => unwrap<{ uploadUrl: string; publicUrl: string; objectName: string }>(res)),

  confirmAvatar: (userId: string, avatarUrl: string) =>
    apiClient<{ id: string; avatarUrl: string | null }>(
      `/api/users/${userId}/avatar`,
      'PATCH',
      { avatarUrl },
      token()
    ).then(res => unwrap<{ id: string; avatarUrl: string | null }>(res)),

  deleteAvatar: (userId: string) =>
    apiClient<void>(`/api/users/${userId}/avatar`, 'DELETE', undefined, token()),
};
