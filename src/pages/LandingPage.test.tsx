import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../tests/testUtils';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    hasRole: () => false,
  }),
}));

vi.mock('../components/marketing/MarketingNav', () => ({
  MarketingNav: () => <nav data-testid="marketing-nav">AgendAI</nav>,
}));

vi.mock('../components/marketing/MarketingFooter', () => ({
  MarketingFooter: () => <footer>footer</footer>,
}));

vi.mock('gsap', () => {
  const matchMedia = vi.fn(() => ({
    add: vi.fn((_q: string, fn: () => void | (() => void)) => {
      const cleanup = fn();
      return typeof cleanup === 'function' ? cleanup : undefined;
    }),
    revert: vi.fn(),
  }));
  const api = {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    to: vi.fn(),
    from: vi.fn(),
    matchMedia,
    timeline: vi.fn(() => ({ to: vi.fn(), from: vi.fn() })),
  };
  return { gsap: api, default: api };
});

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { refresh: vi.fn() },
}));

describe('LandingPage smoke', () => {
  it('monta a landing sem crash', async () => {
    const { LandingPage } = await import('./LandingPage');
    renderWithProviders(<LandingPage />, { route: '/' });
    expect(screen.getByTestId('marketing-nav')).toBeInTheDocument();
    expect(document.body.textContent?.length ?? 0).toBeGreaterThan(20);
  });
});
