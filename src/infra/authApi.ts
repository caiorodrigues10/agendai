import { apiClient } from './apiClient';

export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (email: string, password: string) => apiClient<AuthResponse>('/api/auth/login', 'POST', { email, password }),
  refresh: (refreshToken: string) => apiClient<AuthResponse>('/api/auth/refresh', 'POST', { refreshToken }),
  me: (token: string) => apiClient<{ user: any }>('/api/auth/me', 'GET', undefined, token)
};
