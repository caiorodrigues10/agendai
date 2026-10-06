import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { SupportReportDetail } from './SupportReportDetail';
import type { SupportReportDetail as SupportReportDetailData } from '../../infra/supportApi';

const report: SupportReportDetailData = {
  id: 'rep-1',
  protocol: 'SUP-000456',
  title: 'Não consigo emitir a fatura do plano',
  category: 'BILLING',
  priority: 'HIGH',
  status: 'OPEN',
  createdAt: '2026-09-30T14:20:00.000Z',
  updatedAt: '2026-09-30T14:20:00.000Z',
  description:
    'Ao clicar em emitir fatura, a tela trava com erro 500 no painel financeiro.',
  comments: [
    {
      id: 'cmt-1',
      text: 'Recebemos seu relato. Estamos investigando o fluxo de emissão.',
      createdAt: '2026-09-30T15:00:00.000Z',
      author: { name: 'Rafael Lima' },
    },
  ],
};

const getReportOk = http.get('/api/support/reports/:id', () =>
  HttpResponse.json({ success: true, data: report })
);

const commentFail = http.post('/api/support/reports/:id/comments', () =>
  HttpResponse.json(
    { success: false, message: 'Não foi possível enviar o comentário.' },
    { status: 500 }
  )
);

const mswHandlers = [getReportOk];

const meta = {
  title: 'Suporte/SupportReportDetail',
  component: SupportReportDetail,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
  args: {
    reportId: 'rep-1',
    onClose: () => undefined,
  },
} satisfies Meta<typeof SupportReportDetail>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O modal usa `createPortal(..., document.body)`, então fora de `#storybook-root`. */
const dialog = () => within(document.body);

/**
 * Relatório carregado (GET /api/support/reports/rep-1 → success/data) com a
 * conversa de comentários visível no modal.
 */
export const Default: Story = {
  play: async () => {
    const body = dialog();
    await body.findByText('Não consigo emitir a fatura do plano', {}, { timeout: 10000 });
    await body.findByText(/Recebemos seu relato/, {}, { timeout: 10000 });
    await body.findByRole('dialog', {}, { timeout: 10000 });
  },
};

/**
 * Falha ao enviar comentário do relatório (POST
 * /api/support/reports/:id/comments → 500): banner `role="alert"` com o texto
 * de fallback em L237 do SupportReportDetail, abaixo do textarea (o GET do
 * relatório permanece com sucesso).
 */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        commentFail,
      ],
    },
  },
  play: async () => {
    const body = dialog();
    await body.findByText('Não consigo emitir a fatura do plano', {}, { timeout: 10000 });
    await body.findByRole('dialog', {}, { timeout: 10000 });
    await userEvent.type(
      await body.findByLabelText('Adicionar comentário', {}, { timeout: 10000 }),
      'O erro 500 continua acontecendo na emissão.'
    );
    await userEvent.click(
      await body.findByRole('button', { name: 'Enviar comentário' }, { timeout: 10000 })
    );
    await body.findByText(
      /Não foi possível enviar o comentário/,
      {},
      { timeout: 10000 }
    );
  },
};
