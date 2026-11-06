/// <reference types="vitest/globals" />
/**
 * Testes do caminho crítico de LCP da rota /login (ITEM A):
 * - Logo: imagem única do tema atual, eager + fetchPriority=high (LCP candidate).
 * - GIS (accounts.google.com/gsi/client): baixado só em intenção (hover/foco/clique).
 * - reCAPTCHA badge: baixado só em interação/idle, nunca no mount.
 * Todos falham antes da otimização e passam depois.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'test-site-key');

const { LoginPage } = await import('./LoginPage');
const { Logo } = await import('../components/ui/Logo');
const { renderWithProviders } = await import('../tests/testUtils');

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    loginWithSavedAccount: vi.fn(),
    forgetSavedAccount: vi.fn(),
    register: vi.fn(),
    registerWithGoogle: vi.fn(),
    logout: vi.fn(),
    hasRole: () => false,
  }),
  useAuthOptional: () => null,
}));

vi.mock('../utils/referralStorage', () => ({
  referralStorage: {
    get: () => null,
    set: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('../infra/authStorage', () => ({
  authStorage: {
    getSavedAccounts: () => [],
    hasStoredSession: () => false,
    getUser: () => null,
    getAccessToken: () => 'token-123',
  },
}));

vi.mock('../infra/authApi', () => ({
  authApi: { resendVerification: vi.fn().mockResolvedValue({ success: true }) },
}));

vi.mock('../infra/subscriptionsApi', () => ({
  subscriptionsApi: { me: vi.fn().mockRejectedValue(new Error('offline')) },
}));

afterEach(() => {
  document.querySelectorAll('script[src*="accounts.google.com"], script[src*="recaptcha"]').forEach(s => s.remove());
});

describe('caminho crítico de LCP (/login)', () => {
  it('Logo renderiza uma única imagem (tema atual), eager e com fetchPriority=high', () => {
    const { container } = render(<Logo />);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    const img = imgs[0];
    // sem ThemeProvider a política pública é dark
    expect(img.getAttribute('src')).toBe('/brand/agendai-logo-dark.webp');
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('width')).toBe('700');
    expect(img.getAttribute('height')).toBe('145');
  });

  it('não injeta o script do GIS no mount; carrega ao interagir com o botão Google', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(document.querySelector('script[src*="accounts.google.com"]')).toBeNull();

    fireEvent.pointerEnter(screen.getByRole('button', { name: /entrar com google/i }));
    await waitFor(() => {
      expect(document.querySelector('script[src*="accounts.google.com"]')).not.toBeNull();
    });
  });

  it('não injeta o reCAPTCHA no mount; carrega na primeira interação', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(document.querySelector('script[src*="recaptcha"]')).toBeNull();

    fireEvent.pointerDown(document.body);
    await waitFor(() => {
      expect(document.querySelector('script[src*="recaptcha"]')).not.toBeNull();
    });
  });
});
