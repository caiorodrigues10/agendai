import '@testing-library/jest-dom/vitest';
import React, { PropsWithChildren } from 'react';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

/** ThemeProvider real chama useAuth — stub global para smoke RTL. */
vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: PropsWithChildren) =>
    React.createElement(React.Fragment, null, children),
  useTheme: () => ({
    theme: 'dark' as const,
    resolvedTheme: 'dark' as const,
    toggleTheme: () => undefined,
    setTheme: () => undefined,
  }),
}));
