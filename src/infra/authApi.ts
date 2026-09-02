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
  refreshToken?: string;
}

export interface RegisterPayload {
  ownerName: string;
  email: string;
  password: string;
  cpf: string;
  barbershopName: string;
  whatsapp: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  cnpj?: string;
  referralCode?: string;
  termsVersion: string;
  termsAccepted: boolean;
  marketingOptIn?: boolean;
  lgpdConsent: boolean;
  schedule?: { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }[];
}

export const authApi = {
  login: (email: string, password: string, recaptchaToken?: string, rememberMe = true) =>
    apiClient<AuthResponse>('/api/auth/login', 'POST', { email, password, recaptchaToken, rememberMe }),
  register: (payload: RegisterPayload & { recaptchaToken?: string }) =>
    apiClient<AuthResponse>('/api/auth/register', 'POST', payload),
  refresh: (refreshToken?: string) =>
    apiClient<AuthResponse>('/api/auth/refresh', 'POST', { refreshToken }),
  me: (token: string) => apiClient<{ user: AuthUser }>('/api/auth/me', 'GET', undefined, token),
  logout: (token: string) =>
    apiClient<{ message: string }>('/api/auth/logout', 'POST', undefined, token),
  googleLogin: (idToken: string) =>
    apiClient<AuthResponse>('/api/auth/google', 'POST', { idToken }),
  forgotPassword: (email: string, recaptchaToken?: string) =>
    apiClient<{ message: string }>('/api/auth/forgot-password', 'POST', { email, recaptchaToken }),
  resetPassword: (token: string, newPassword: string) =>
    apiClient<{ message: string }>('/api/auth/reset-password', 'POST', { token, newPassword }),
};
