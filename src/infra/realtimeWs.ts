import { API_BASE } from './apiClient';
import { authStorage } from './authStorage';

export function realtimeWsUrl(barbershopId: string): string {
  const origin = API_BASE || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:3333');
  const url = new URL('/api/ws', origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('barbershopId', barbershopId);
  const token = authStorage.getAccessToken();
  if (token) url.searchParams.set('token', token);
  return url.toString();
}
