/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TaskDetailPage } from './TaskDetailPage';
import { adminInternalApi, type Task } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: {
    getTask: vi.fn(),
    updateTask: vi.fn(),
    addTaskComment: vi.fn(),
  },
}));

const getTask = vi.mocked(adminInternalApi.getTask);

const TASK: Task = {
  id: 'k-1',
  title: 'Tarefa de teste',
  description: null,
  status: 'TODO',
  priority: 'NORMAL',
  dueDate: null,
  barbershopId: null,
  ticketId: null,
  version: 1,
  createdAt: '2026-10-06T00:00:00.000Z',
  updatedAt: '2026-10-06T00:00:00.000Z',
  completedAt: null,
  createdBy: { id: 'm-1', name: 'Admin' },
  assignedTo: null,
  completedBy: null,
  barbershop: null,
  ticket: null,
  comments: [],
  history: [],
};

describe('TaskDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTask.mockResolvedValue(TASK);
  });

  it('nomeia os botões só-ícone de voltar e de enviar comentário', async () => {
    render(
      <MemoryRouter initialEntries={['/master/tasks/k-1']}>
        <Routes>
          <Route path="/master/tasks/:id" element={<TaskDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Tarefa de teste' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar para a lista' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar comentário' })).toBeInTheDocument();
  });
});
