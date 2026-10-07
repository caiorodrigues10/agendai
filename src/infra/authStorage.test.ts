/// <reference types="vitest/globals" />
import { authStorage } from './authStorage';

const LEGACY_TOKEN_KEYS = [
  'barber_access_token',
  'barber_access_token_session',
  'barber_refresh_token',
  'barber_refresh_token_session',
];

function storageSnapshot(): string {
  return JSON.stringify({ local: localStorage, session: sessionStorage });
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  authStorage.clearTokens();
  authStorage.clearUser();
});

describe('authStorage (S5: tokens fora do storage)', () => {
  it('access token fica só em memória', () => {
    authStorage.setAccessToken('access-abc-123');

    expect(authStorage.getAccessToken()).toBe('access-abc-123');
    expect(storageSnapshot()).not.toContain('access-abc-123');
  });

  it('não persiste o refresh token recebido no corpo', () => {
    authStorage.setTokens('access-abc-123', 'refresh-xyz-456', true);

    expect(authStorage.getAccessToken()).toBe('access-abc-123');
    expect(storageSnapshot()).not.toContain('refresh-xyz-456');
    expect(storageSnapshot()).not.toContain('access-abc-123');
  });

  it('remove as chaves de token de versões antigas (migração)', () => {
    localStorage.setItem('barber_access_token', 'access-legado');
    localStorage.setItem('barber_refresh_token', 'refresh-legado');
    sessionStorage.setItem('barber_access_token_session', 'access-legado-sess');
    sessionStorage.setItem('barber_refresh_token_session', 'refresh-legado-sess');

    authStorage.setTokens('access-novo', undefined, true);

    for (const key of LEGACY_TOKEN_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
      expect(sessionStorage.getItem(key)).toBeNull();
    }
    expect(authStorage.getAccessToken()).toBe('access-novo');
    expect(authStorage.getRefreshToken()).toBeNull();
  });

  it('mantém o refresh legado legível até a primeira renovação', () => {
    localStorage.setItem('barber_refresh_token', 'refresh-legado');

    expect(authStorage.getRefreshToken()).toBe('refresh-legado');
    expect(authStorage.hasStoredSession()).toBe(true);
  });

  it('preserva "manter conectado", usuário e contas salvas', () => {
    authStorage.setTokens('access-abc', undefined, true);
    authStorage.setUser({ id: 'u1', name: 'Dono', email: 'dono@example.com' }, true);
    authStorage.upsertSavedAccount({ id: 'u1', name: 'Dono', email: 'dono@example.com' });
    authStorage.setRememberMe(true);

    expect(authStorage.getRememberMe()).toBe(true);
    expect(authStorage.getUser().id).toBe('u1');
    expect(authStorage.getSavedAccounts()).toEqual([
      expect.objectContaining({ id: 'u1', email: 'dono@example.com' }),
    ]);
    expect(storageSnapshot()).not.toContain('access-abc');
  });

  it('clearTokens zera memória e chaves de token', () => {
    authStorage.setTokens('access-abc', undefined, true);
    authStorage.clearTokens();

    expect(authStorage.getAccessToken()).toBeNull();
    expect(localStorage.getItem('barber_remember_me')).toBeNull();
    expect(storageSnapshot()).not.toContain('access-abc');
  });
});
