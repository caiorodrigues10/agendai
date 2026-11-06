import { runWhenIdle, cancelIdle } from '../utils/idle';

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const w = window as IdleWindow;
const originalRIC = w.requestIdleCallback;
const originalCIC = w.cancelIdleCallback;

describe('runWhenIdle (src/utils/idle.ts)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Simula Safari/WebKit: sem a API de idle.
    Object.defineProperty(window, 'requestIdleCallback', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'cancelIdleCallback', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalRIC) Object.defineProperty(window, 'requestIdleCallback', { value: originalRIC, configurable: true, writable: true });
    else delete (window as Partial<IdleWindow>).requestIdleCallback;
    if (originalCIC) Object.defineProperty(window, 'cancelIdleCallback', { value: originalCIC, configurable: true, writable: true });
    else delete (window as Partial<IdleWindow>).cancelIdleCallback;
  });

  it('sem requestIdleCallback: agenda com setTimeout e delay padrão de 2000 ms', () => {
    const cb = vi.fn();
    runWhenIdle(cb);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1999);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('sem requestIdleCallback: respeita delay customizado', () => {
    const cb = vi.fn();
    runWhenIdle(cb, { delay: 150 });
    vi.advanceTimersByTime(150);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('com requestIdleCallback: usa a API (com timeout) em vez de setTimeout', () => {
    const ric = vi.fn().mockReturnValue(77);
    const cic = vi.fn();
    Object.defineProperty(window, 'requestIdleCallback', { value: ric, configurable: true, writable: true });
    Object.defineProperty(window, 'cancelIdleCallback', { value: cic, configurable: true, writable: true });

    const cb = vi.fn();
    const task = runWhenIdle(cb, { timeout: 3000 });

    expect(ric).toHaveBeenCalledTimes(1);
    expect(ric).toHaveBeenCalledWith(cb, { timeout: 3000 });
    expect(cb).not.toHaveBeenCalled(); // o próprio idle decide quando executa
    vi.advanceTimersByTime(5000);
    expect(cb).not.toHaveBeenCalled();

    task.cancel();
    expect(cic).toHaveBeenCalledWith(77);
  });

  it('cancel() impede a execução do fallback por setTimeout', () => {
    const cb = vi.fn();
    const task = runWhenIdle(cb, { delay: 500 });
    task.cancel();
    vi.advanceTimersByTime(10000);
    expect(cb).not.toHaveBeenCalled();
  });

  it('cancelIdle tolera null/undefined', () => {
    expect(() => cancelIdle(null)).not.toThrow();
    expect(() => cancelIdle(undefined)).not.toThrow();
  });
});
