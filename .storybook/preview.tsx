import React, { useEffect } from 'react';
import type { Preview, Decorator, StoryContext } from '@storybook/react-vite';
import '../src/index.css';
import { worker } from '../src/mocks/browser';

/**
 * Congela o relógio para TODAS as stories (D-013): várias renderizam data/hora
 * derivadas de `new Date()`/`Date.now()` no render — "Chegou às HH:HH" da fila,
 * período `YYYY-MM` do ProfitEngine, semana/mês do FinancialDashboard, data
 * default do booking — e os baselines visuais venceriam a cada minuto/dia/mês
 * sem isso. Mantido em 2026-10-01T12:00 (data em que os snapshots foram gerados);
 * mover o valor exige regerar TODOS os baselines (`test:visual -- -u`).
 */
const FROZEN_NOW = new Date('2026-10-01T12:00:00');
const RealDate = Date;
const FrozenDate = class extends RealDate {
  constructor(...args: unknown[]) {
    if (args.length === 0) {
      super(FROZEN_NOW.getTime());
    } else {
      super(...(args as ConstructorParameters<typeof RealDate>));
    }
  }
  static now() {
    return FROZEN_NOW.getTime();
  }
} as DateConstructor;
globalThis.Date = FrozenDate;

type ThemeName = 'light' | 'dark';

/**
 * Aplica o tema do documento igual ao app: classe `.dark` em <html>,
 * colorScheme e background (mesma semântica do ThemeContext/anti-flash).
 */
const ThemeDocument: React.FC<{ theme: ThemeName; children: React.ReactNode }> = ({ theme, children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    root.style.backgroundColor = theme === 'dark' ? '#0a0a0a' : '#f5f5f5';
  }, [theme]);

  return <div className="min-h-screen w-full bg-bg text-text-primary">{children}</div>;
};

const withTheme: Decorator = (Story, context) => {
  const theme: ThemeName = context.globals.theme === 'light' ? 'light' : 'dark';
  return (
    <ThemeDocument theme={theme}>
      <Story />
    </ThemeDocument>
  );
};

/**
 * MSW opt-in por story: `parameters: { msw: true }` ou
 * `parameters: { msw: { handlers: [...] } }` (handlers resetados a cada story).
 * Roda em loader (assíncuono, antes da renderização) — stories sem o
 * parâmetro não tocam o worker (sem efeito colateral).
 */
let mswStarted = false;
const mswLoader = async (context: StoryContext) => {
  const cfg = context.parameters?.msw as boolean | { handlers?: unknown[] } | undefined;
  if (!cfg) return;
  if (!mswStarted) {
    mswStarted = true;
    try {
      await worker.start({ onUnhandledRequest: 'bypass' });
    } catch (err) {
      console.warn('[msw] worker indisponível neste ambiente', err);
    }
  }
  worker.resetHandlers();
  const extra = typeof cfg === 'object' ? cfg.handlers : undefined;
  if (Array.isArray(extra) && extra.length) {
    worker.use(...(extra as Parameters<typeof worker.use>));
  }
};

const preview: Preview = {
  decorators: [withTheme],
  loaders: [mswLoader],
  globalTypes: {
    theme: {
      description: 'Tema (resolve os tokens reais via `.dark` no html)',
      toolbar: {
        icon: 'mirror',
        items: ['dark', 'light'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
  },
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - mostra violações apenas no painel
      // 'error' - falha o CI em violações a11y
      // 'off' - desliga as checagens
      test: 'error',
    },
  },
};

export default preview;
