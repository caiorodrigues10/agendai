import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function token() {
  return authStorage.getAccessToken() || '';
}

export const usersApi = {
  getAvatarUploadUrl: (userId: string, mimeType: string) =>
    apiClient<{ uploadUrl: string; publicUrl: string; objectName: string }>(
      `/api/users/${userId}/avatar/upload-url?mimeType=${encodeURIComponent(mimeType)}`,
      'GET',
      undefined,
      token()
    ),

  confirmAvatar: (userId: string, avatarUrl: string) =>
    apiClient<{ id: string; avatarUrl: string | null }>(
      `/api/users/${userId}/avatar`,
      'PATCH',
      { avatarUrl },
      token()
    ),

  deleteAvatar: (userId: string) =>
    apiClient<void>(`/api/users/${userId}/avatar`, 'DELETE', undefined, token()),
};
