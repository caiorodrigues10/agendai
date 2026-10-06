import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SupportReportForm } from './SupportReportForm';
import type { SupportReport } from '../../infra/supportApi';

const report: SupportReport = {
  id: 'rep-1',
  protocol: 'SUP-000456',
  title: 'Fila não atualiza após check-in',
  category: 'ERROR',
  priority: 'NORMAL',
  status: 'OPEN',
  createdAt: '2026-09-30T14:20:00.000Z',
  updatedAt: '2026-09-30T14:20:00.000Z',
};

/** `POST /api/support/reports` → sucesso. */
const createOk = http.post('/api/support/reports', () =>
  HttpResponse.json({ success: true, data: report })
);

/** `POST /api/support/reports` → 500: dispara o catch de submit (L78 → banner L192-196). */
const createFail = http.post('/api/support/reports', () =>
  HttpResponse.json(
    { success: false, message: 'Não foi possível enviar o relatório.' },
    { status: 500 }
  )
);

const mswHandlers = () => [createOk];

const meta = {
  title: 'Suporte/SupportReportForm',
  component: SupportReportForm,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers() },
  },
  args: { onCreated: fn() },
} satisfies Meta<typeof SupportReportForm>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Preenche o mínimo para passar pelo Zod: categoria + título (≥5) + descrição (≥10). */
const fillForm = async (canvas: ReturnType<typeof within>) => {
  await canvas.findByText('Novo relatório', {}, { timeout: 10000 });
  await userEvent.click(
    await canvas.findByRole('radio', { name: /Bug ou erro/ }, { timeout: 10000 })
  );
  await userEvent.type(
    await canvas.findByLabelText(/^Título/, {}, { timeout: 10000 }),
    'Fila quebrada'
  );
  await userEvent.type(
    await canvas.findByLabelText(/^Descrição/, {}, { timeout: 10000 }),
    'A fila congela após o check-in dos clientes.'
  );
};

/**
 * Formulário válido enviado com sucesso (POST /api/support/reports → 200):
 * `onCreated` disparado e campos resetados — sem banner de erro.
 */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas);
    await userEvent.click(
      await canvas.findByRole('button', { name: /Enviar relatório/ }, { timeout: 10000 })
    );
    await waitFor(() => expect(args.onCreated).toHaveBeenCalled(), { timeout: 10000 });
    await waitFor(
      () => expect(canvas.getByLabelText(/^Título/)).toHaveValue(''),
      { timeout: 10000 }
    );
  },
};

/**
 * Falha do envio (POST /api/support/reports → 500): banner `role="alert"` com a
 * mensagem do catch (SupportReportForm L192-196), acima do botão de envio, com o
 * formulário ainda preenchido — estado final do play.
 */
export const Erro: Story = {
  // O MSW casa o PRIMEIRO handler do array: o 500 precisa vir antes do `createOk`.
  parameters: { msw: { handlers: [createFail] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillForm(canvas);
    await userEvent.click(
      await canvas.findByRole('button', { name: /Enviar relatório/ }, { timeout: 10000 })
    );
    const alert = await canvas.findByRole('alert', {}, { timeout: 10000 });
    expect(alert).toHaveTextContent(/Não foi possível enviar o relatório/);
  },
};
