/// <reference types="vitest/globals" />
import * as matchers from '@testing-library/jest-dom/matchers';
import React, { PropsWithChildren } from 'react';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

const liveIntervals = new Set<ReturnType<typeof setInterval>>();
const nativeSetInterval = globalThis.setInterval.bind(globalThis);
const nativeClearInterval = globalThis.clearInterval.bind(globalThis);
globalThis.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
  const id = nativeSetInterval(handler, timeout, ...args);
  liveIntervals.add(id);
  return id;
}) as typeof setInterval;
globalThis.clearInterval = ((id?: ReturnType<typeof setInterval>) => {
  if (id !== undefined) liveIntervals.delete(id);
  nativeClearInterval(id);
}) as typeof clearInterval;

afterEach(() => {
  cleanup();
  for (const id of liveIntervals) nativeClearInterval(id);
  liveIntervals.clear();
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

vi.mock('@floating-ui/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@floating-ui/react')>();
  return {
    ...actual,
    autoUpdate: () => () => undefined,
  };
});

vi.mock('react-focus-lock', () => {
  const PassThrough = ({ children }: { children: React.ReactNode }) => children;
  return { default: PassThrough, FocusLock: PassThrough };
});

vi.mock('framer-motion', () => {
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      animate: _a,
      initial: _i,
      exit: _e,
      transition: _t,
      variants: _v,
      whileHover: _wh,
      whileTap: _wt,
      whileInView: _wiv,
      layout: _l,
      layoutId: _lid,
      drag: _d,
      ...rest
    } = props;
    return rest;
  };
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        const MotionComponent = React.forwardRef(
          (props: Record<string, unknown> & { children?: React.ReactNode }, ref) =>
            React.createElement(tag, { ...stripMotionProps(props), ref }, props.children)
        );
        MotionComponent.displayName = `motion.${tag}`;
        return MotionComponent;
      },
    }
  );
  return {
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children ?? null,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
    useReducedMotion: () => true,
  };
});

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
