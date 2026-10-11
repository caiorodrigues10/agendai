/**
 * Agendamento de trabalho não crítico com plano B para navegadores sem
 * `requestIdleCallback` (Safari/WebKit — macOS e iOS não suportam a API).
 *
 * Sem este helper, um código que só chama `requestIdleCallback` simplesmente
 * nunca executa no Safari: o trabalho adiado (badge do reCAPTCHA, por exemplo)
 * fica pendurado para sempre e, no pior caso, o fluxo associado trava.
 *
 * Uso:
 *   const task = runWhenIdle(() => ..., { timeout: 5000, delay: 2000 });
 *   cancelIdle(task);
 *
 * - `timeout`: orçamento do próprio `requestIdleCallback` (só quando existe);
 * - `delay`: atraso do fallback por `setTimeout` quando não existe (padrão
 *   2000 ms — curto o suficiente para o trabalho acontecer logo após a 1ª
 *   pintura, longe o bastante para não disputar banda com o LCP).
 */

export interface RunWhenIdleOptions {
  /** Orçamento em ms repassado ao `requestIdleCallback` (padrão 5000). */
  timeout?: number;
  /** Atraso em ms do fallback `setTimeout` quando não há idle API (padrão 2000). */
  delay?: number;
}

export interface IdleTask {
  cancel: () => void;
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function runWhenIdle(cb: () => void, options: RunWhenIdleOptions = {}): IdleTask {
  const { timeout = 5000, delay = 2000 } = options;
  const w = window as IdleWindow;

  if (typeof w.requestIdleCallback === 'function') {
    const handle = w.requestIdleCallback(cb, { timeout });
    return {
      cancel: () => {
        if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(handle);
      },
    };
  }

  const timer = window.setTimeout(cb, delay);
  return {
    cancel: () => {
      window.clearTimeout(timer);
    },
  };
}

/** Cancela uma tarefa criada por `runWhenIdle` (tolerante a null/undefined). */
export function cancelIdle(task: IdleTask | null | undefined): void {
  task?.cancel();
}
