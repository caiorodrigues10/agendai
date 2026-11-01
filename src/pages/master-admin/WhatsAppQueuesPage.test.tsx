/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhatsAppQueuesPage } from './WhatsAppQueuesPage';

const mocks = vi.hoisted(() => ({
  queues: vi.fn(),
  reprocessJob: vi.fn(),
  cleanJob: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('../../infra/adminWhatsappApi', () => ({
  adminWhatsappApi: {
    queues: mocks.queues,
    reprocessJob: mocks.reprocessJob,
    cleanJob: mocks.cleanJob,
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: mocks.useAuth,
}));

const REASON = 'motivo com pelo menos dez caracteres';

const availableQueues = {
  counts: {
    whatsapp: { available: true, wait: 1, active: 0, completed: 2, failed: 1, delayed: 0 },
  },
  failed: {
    whatsapp: {
      available: true,
      jobs: [
        {
          id: 'job-1',
          name: 'send',
          failedReason: 'timeout',
          attemptsMade: 3,
          timestamp: 10,
          phoneMasked: '(11) 98765-4321',
        },
      ],
    },
  },
};

function renderPage() {
  return render(
    <MemoryRouter>
      <WhatsAppQueuesPage />
    </MemoryRouter>,
  );
}

describe('WhatsAppQueuesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:manage'] },
    });
    mocks.queues.mockResolvedValue({ data: availableQueues });
    mocks.reprocessJob.mockResolvedValue({ data: { reprocessed: true } });
    mocks.cleanJob.mockResolvedValue({ data: { removed: true } });
  });

  it('mostra as contagens e o job falho com telefone mascarado', async () => {
    renderPage();

    expect(await screen.findByText('timeout')).toBeInTheDocument();
    expect(screen.getByText(/Telefone: \(11\) 98765-4321/)).toBeInTheDocument();
    expect(screen.queryByText('11987654321')).not.toBeInTheDocument();
  });

  it('mostra fila indisponível em vez de zeros', async () => {
    mocks.queues.mockResolvedValue({
      data: {
        counts: { whatsapp: { available: false, error: 'Redis fora' } },
        failed: { whatsapp: { available: false, error: 'Redis fora' } },
      },
    });
    renderPage();

    expect(await screen.findAllByText(/fila indisponível/i)).not.toHaveLength(0);
    expect(screen.getAllByText(/Redis fora/).length).toBeGreaterThan(0);
  });

  it('reprocessa um job falho com motivo', async () => {
    renderPage();
    await screen.findByText('timeout');

    fireEvent.click(screen.getByRole('button', { name: 'Reprocessar' }));
    const dialog = screen.getByRole('alertdialog');
    fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reprocessar' }));

    await waitFor(() => {
      expect(mocks.reprocessJob).toHaveBeenCalledWith('whatsapp', 'job-1', REASON);
    });
  });

  it('limpa um job falho com motivo', async () => {
    renderPage();
    await screen.findByText('timeout');

    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }));
    const dialog = screen.getByRole('alertdialog');
    fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Limpar' }));

    await waitFor(() => {
      expect(mocks.cleanJob).toHaveBeenCalledWith('whatsapp', 'job-1', REASON);
    });
  });

  it('mostra o erro da ação sem perder a lista', async () => {
    mocks.reprocessJob.mockRejectedValue(new Error('Job não está falho (estado atual: active)'));
    renderPage();
    await screen.findByText('timeout');

    fireEvent.click(screen.getByRole('button', { name: 'Reprocessar' }));
    const dialog = screen.getByRole('alertdialog');
    fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reprocessar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('estado atual: active');
    expect(screen.getByText('timeout')).toBeInTheDocument();
  });

  it('esconde as ações sem WHATSAPP_MANAGE', async () => {
    mocks.useAuth.mockReturnValue({
      user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:read'] },
    });
    renderPage();
    await screen.findByText('timeout');

    expect(screen.queryByRole('button', { name: 'Reprocessar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument();
  });
});
