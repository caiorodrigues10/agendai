/// <reference types="vitest/globals" />
import { impersonationStorage } from './impersonationStorage';
import { authStorage } from './authStorage';

const SESSION = {
  accessToken: 'imp-token-123',
  expiresIn: 1800,
  user: { id: 'owner-1', name: 'Dono', email: 'd@x.com', role: 'OWNER' },
  shop: { id: 'shop-1', name: 'Barbearia X' },
};

describe('impersonationStorage', () => {
  afterEach(() => {
    impersonationStorage.clear();
    authStorage.clearTokens();
    vi.useRealTimers();
  });

  it('inicia sessão em memória com expiração e loja', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T10:00:00Z'));

    impersonationStorage.start(SESSION);

    expect(impersonationStorage.isActive()).toBe(true);
    expect(impersonationStorage.get()?.shop).toEqual(SESSION.shop);
    expect(impersonationStorage.secondsLeft()).toBe(1800);
  });

  it('expira sozinha após o tempo do backend', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T10:00:00Z'));
    impersonationStorage.start(SESSION);

    vi.setSystemTime(new Date('2026-10-03T10:30:01Z'));

    expect(impersonationStorage.isActive()).toBe(false);
    expect(impersonationStorage.get()).toBeNull();
    expect(impersonationStorage.secondsLeft()).toBe(0);
  });

  it('clear encerra a sessão', () => {
    impersonationStorage.start(SESSION);
    impersonationStorage.clear();
    expect(impersonationStorage.isActive()).toBe(false);
  });

  it('nunca persiste em localStorage', () => {
    impersonationStorage.start(SESSION);
    expect(JSON.stringify(localStorage)).not.toContain('imp-token-123');
    impersonationStorage.clear();
  });

  it('authStorage.getAccessToken prioriza o token de impersonation', () => {
    authStorage.setTokens('master-token', 'refresh-master', true);
    expect(authStorage.getAccessToken()).toBe('master-token');

    impersonationStorage.start(SESSION);
    expect(authStorage.getAccessToken()).toBe('imp-token-123');

    impersonationStorage.clear();
    expect(authStorage.getAccessToken()).toBe('master-token');
  });
});
