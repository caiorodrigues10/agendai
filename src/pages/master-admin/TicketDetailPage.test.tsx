/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TicketDetailPage } from './TicketDetailPage';
import { adminInternalApi, type Ticket } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: {
    getTicket: vi.fn(),
    updateTicket: vi.fn(),
    addTicketComment: vi.fn(),
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'm-1', name: 'Admin', email: 'admin@admin.com', role: 'MASTER_ADMIN' },
  }),
}));

const getTicket = vi.mocked(adminInternalApi.getTicket);

const TICKET: Ticket = {
  id: 't-1',
  protocol: 'AG-QA0001',
  title: 'Chamado de teste',
  description: 'Descrição do chamado.',
  channel: 'OTHER',
  category: 'QUESTION',
  priority: 'NORMAL',
  status: 'OPEN',
  barbershopId: null,
  version: 1,
  createdAt: '2026-10-06T00:00:00.000Z',
  updatedAt: '2026-10-06T00:00:00.000Z',
  resolvedAt: null,
  cancelledAt: null,
  cancelReason: null,
  resolveNote: null,
  assignedTo: null,
  barbershop: null,
  comments: [],
  history: [],
};

describe('TicketDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTicket.mockResolvedValue(TICKET);
  });

  it('nomeia os botões só-ícone de voltar e de enviar comentário', async () => {
    render(
      <MemoryRouter initialEntries={['/master/tickets/t-1']}>
        <Routes>
          <Route path="/master/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Chamado de teste' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar para a lista' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar comentário' })).toBeInTheDocument();
  });
});
