import { apiClient } from './apiClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  barbershopId?: string;
  active?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
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
  referralCode?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient<AuthResponse>('/api/auth/login', 'POST', { email, password }),
  register: (payload: RegisterPayload) =>
    apiClient<AuthResponse>('/api/auth/register', 'POST', payload),
  refresh: (refreshToken: string) =>
    apiClient<AuthResponse>('/api/auth/refresh', 'POST', { refreshToken }),
  me: (token: string) => apiClient<{ user: AuthUser }>('/api/auth/me', 'GET', undefined, token),
  googleLogin: (idToken: string) =>
    apiClient<AuthResponse>('/api/auth/google', 'POST', { idToken }),
};
