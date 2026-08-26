import { apiClient } from './apiClient';

export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  ownerName: string;
  email: string;
  password: string;
  cpf: string;
  barbershopName: string;
  whatsapp: string;
  cnpj?: string;
  termsVersion: string;
  termsAccepted: boolean;
  lgpdConsent: boolean;
  marketingOptIn?: boolean;
}

export const authApi = {
  login: (email: string, password: string) => apiClient<AuthResponse>('/api/auth/login', 'POST', { email, password }),
  register: (payload: RegisterPayload) => apiClient<AuthResponse>('/api/auth/register', 'POST', payload),
  refresh: (refreshToken: string) => apiClient<AuthResponse>('/api/auth/refresh', 'POST', { refreshToken }),
  me: (token: string) => apiClient<{ user: any }>('/api/auth/me', 'GET', undefined, token),
  forgotPassword: (email: string) => apiClient<{ message: string }>('/api/auth/forgot-password', 'POST', { email }),
  resetPassword: (token: string, newPassword: string) => apiClient<{ message: string }>('/api/auth/reset-password', 'POST', { token, newPassword }),
};
