/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { TaskFormDialog } from './TaskFormDialog';
import { adminInternalApi, TeamMember } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: {
    createTask: vi.fn(),
    listTeam: vi.fn(),
  },
}));

const createTask = vi.mocked(adminInternalApi.createTask);
const listTeam = vi.mocked(adminInternalApi.listTeam);

const member: TeamMember = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Ana Suporte',
  email: 'ana@agendai.local',
  role: 'ADMIN',
  active: true,
  avatarUrl: null,
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
  _count: { ticketsAssigned: 0, tasksAssigned: 0 },
};

function setup(props: Partial<ComponentProps<typeof TaskFormDialog>> = {}) {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  const onError = vi.fn();
  render(<TaskFormDialog open onClose={onClose} onSaved={onSaved} onError={onError} {...props} />);
  return { onClose, onSaved, onError };
}

beforeEach(() => {
  vi.clearAllMocks();
  listTeam.mockResolvedValue({
    success: true,
    users: [member],
    invitations: [],
    meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
  });
  createTask.mockResolvedValue({} as Awaited<ReturnType<typeof createTask>>);
});

describe('TaskFormDialog', () => {
  it('cria tarefa enviando prazo em ISO, responsável e sem descrição vazia', async () => {
    const { onSaved, onError } = setup();
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText('Título'), {
      target: { value: 'Revisar convite pendente' },
    });
    fireEvent.change(within(dialog).getByLabelText('Prioridade'), {
      target: { value: 'HIGH' },
    });
    fireEvent.change(within(dialog).getByLabelText('Prazo'), {
      target: { value: '2026-10-10' },
    });
    const assignee = await within(dialog).findByRole('combobox', { name: 'Responsável' });
    fireEvent.change(assignee, { target: { value: member.id } });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar tarefa' }));

    await waitFor(() => expect(createTask).toHaveBeenCalled());
    const payload = createTask.mock.calls[0][0];
    expect(payload).toEqual({
      title: 'Revisar convite pendente',
      priority: 'HIGH',
      dueDate: '2026-10-10T00:00:00.000Z',
      assignedToId: member.id,
    });
    expect(Object.keys(payload)).not.toContain('description');
    expect(onSaved).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('valida título obrigatório antes de enviar', async () => {
    const { onSaved } = setup();
    const dialog = await screen.findByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar tarefa' }));

    expect(await within(dialog).findByText('Informe o título.')).toBeInTheDocument();
    expect(createTask).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('cria sem responsável quando a equipe não puder ser carregada', async () => {
    listTeam.mockRejectedValue(new Error('offline'));
    const { onSaved } = setup();
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText('Título'), { target: { value: 'Ligar cliente' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar tarefa' }));

    await waitFor(() => expect(createTask).toHaveBeenCalledWith({ title: 'Ligar cliente', priority: 'NORMAL' }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('mantém o formulário aberto e reporta erro da API', async () => {
    createTask.mockRejectedValue(new Error('falha inesperada'));
    const { onSaved, onError } = setup();
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText('Título'), { target: { value: 'Tarefa' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar tarefa' }));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.any(String)));
    expect(await within(dialog).findByRole('alert')).not.toBeEmptyDOMElement();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
