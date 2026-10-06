/**
 * `ErrorBoundary` — a UI de erro só é alcançável quando um filho LANÇA durante o
 * render (não existe prop `error`): sem child quebrado, o boundary apenas
 * repassa o render. Por isso as stories montam um componente `Broken` de
 * propósito, em vez de injetar um estado de erro.
 *
 * A variante `page` (SystemStatePage) não é coberta aqui — já está nos testes
 * unitários (`ErrorBoundary.test.tsx` / `ErrorBoundary.section.test.tsx`).
 *
 * Nota de conversão: a caixa da variante `section` será substituída por
 * `SectionError` numa próxima etapa; quando isso acontecer, o screenshot da
 * story `SecaoErro` muda de propósito (baseline pré-conversão).
 */
import { useEffect, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { spyOn, within } from 'storybook/test';
import { ErrorBoundary } from './ErrorBoundary';

/** Filho que falha propositalmente no render — única forma de acionar a UI de erro. */
const Broken = () => {
  throw new Error('boom');
};

/**
 * Silencia o `console.error` que o React emite quando o filho lança dentro do
 * boundary (e evita que um `window 'error'` não tratado falhe o teste). O log
 * acontece no MOUNT — antes de o `play` rodar —, por isso o silenciador é um
 * wrapper montado junto com a story (um `spyOn` dentro do `play` chegaria
 * tarde). Restaurado na desmontagem para não vazar para as demais stories.
 */
const SilenceBoundaryLogs = ({ children }: { children: ReactNode }) => {
  const [silencer] = useState(() => {
    const consoleError = spyOn(console, 'error').mockImplementation(() => undefined);
    const preventExpectedError = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener('error', preventExpectedError);
    return { consoleError, preventExpectedError };
  });

  useEffect(
    () => () => {
      window.removeEventListener('error', silencer.preventExpectedError);
      silencer.consoleError.mockRestore();
    },
    [silencer]
  );

  return <>{children}</>;
};

const meta = {
  title: 'Infra/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs', 'test'],
} satisfies Meta<typeof ErrorBoundary>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Filho saudável (variante `section`): o boundary repassa o render sem intervir. */
export const Default: Story = {
  args: {
    variant: 'section',
    children: <p>Conteúdo saudável</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Conteúdo saudável', {}, { timeout: 10000 });
  },
};

/**
 * Sem endpoint: o erro nasce do render. Filho que lança → caixa da seção com
 * "Não foi possível carregar esta seção" + botão "Tentar novamente" (o play NÃO
 * clica no retry: ele reseta o boundary e o filho quebra de novo).
 */
export const SecaoErro: Story = {
  args: {
    variant: 'section',
    children: <Broken />,
  },
  decorators: [
    Story => (
      <SilenceBoundaryLogs>
        <Story />
      </SilenceBoundaryLogs>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Não foi possível carregar esta seção', {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: /Tentar novamente/ }, { timeout: 10000 });
  },
};
