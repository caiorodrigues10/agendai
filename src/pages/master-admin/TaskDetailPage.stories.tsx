import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { TaskDetailPage } from './TaskDetailPage';
import type { Task } from '../../infra/adminInternalApi';

const task: Task = {
  id: 'task-1',
  title: 'Revisar integração de pagamentos',
  description:
    'Validar o fluxo de cobrança recorrente antes do release de outubro e confirmar os webhooks do provedor.',
  status: 'TODO',
  priority: 'HIGH',
  dueDate: '2026-10-15T12:00:00.000Z',
  barbershopId: 'shop-1',
  ticketId: 'tkt-1',
  version: 3,
  createdAt: '2026-09-28T09:30:00.000Z',
  updatedAt: '2026-09-30T15:00:00.000Z',
  completedAt: null,
  createdBy: { id: 'usr-admin', name: 'Ana Souza' },
  assignedTo: { id: 'usr-dev', name: 'Caio Oliveira' },
  completedBy: null,
  barbershop: { id: 'shop-1', name: 'Barbearia Central' },
  ticket: { id: 'tkt-1', protocol: 'TKT-000123', title: 'Falha ao gerar fatura' },
  comments: [
    {
      id: 'cmt-1',
      text: 'Ambiente de staging atualizado com a nova versão do gateway.',
      createdAt: '2026-09-29T10:00:00.000Z',
      author: { id: 'usr-admin', name: 'Ana Souza' },
    },
  ],
  history: [
    {
      id: 'hst-1',
      field: 'status',
      oldValue: null,
      newValue: 'TODO',
      reason: null,
      createdAt: '2026-09-28T09:30:00.000Z',
      actor: { id: 'usr-admin', name: 'Ana Souza' },
    },
  ],
};

const getTaskOk = http.get('/api/admin/tasks/:id', () =>
  HttpResponse.json({ success: true, data: task })
);

const mswHandlers = [getTaskOk];

const meta = {
  title: 'MasterAdmin/TaskDetailPage',
  component: TaskDetailPage,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <MemoryRouter initialEntries={['/master/tasks/task-1']}>
        <Routes>
          <Route path="/master/tasks/:id" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof TaskDetailPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Detalhe da tarefa carregado (GET /api/admin/tasks/task-1 → success/data). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'Revisar integração de pagamentos',
      {},
      { timeout: 10000 }
    );
  },
};

/**
 * Falha ao mudar o status (PATCH /api/admin/tasks/:id → 500): banner de erro
 * `actionError` logo abaixo da barra de ações, sem alterar o status local.
 */
export const ErroAcao: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.patch('/api/admin/tasks/:id', () =>
          HttpResponse.json(
            { success: false, message: 'Erro ao atualizar status.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'Revisar integração de pagamentos',
      {},
      { timeout: 10000 }
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Iniciar' }, { timeout: 10000 })
    );
    await canvas.findByText(/Erro ao atualizar status/, {}, { timeout: 10000 });
  },
};
