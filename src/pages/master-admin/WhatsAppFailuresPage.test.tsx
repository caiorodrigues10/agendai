/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhatsAppFailuresPage } from './WhatsAppFailuresPage';

const mocks = vi.hoisted(() => ({
  failedNotifications: vi.fn(),
  retryDelivery: vi.fn(),
  retryOutbox: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('../../infra/adminWhatsappApi', () => ({
  adminWhatsappApi: {
    failedNotifications: mocks.failedNotifications,
    retryDelivery: mocks.retryDelivery,
    retryOutbox: mocks.retryOutbox,
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: mocks.useAuth,
}));

const REASON = 'motivo com pelo menos dez caracteres';

const delivery = {
  id: 'delivery-1',
  barbershopId: 'shop-1',
  channel: 'WHATSAPP',
  type: 'APPOINTMENT_CONFIRMATION',
  status: 'FAILED',
  errorCode: null,
  errorMessage: 'sem rede',
  createdAt: '2026-01-01T10:00:00.000Z',
  retryable: true,
};

const outbox = {
  id: 'outbox-1',
  deliveryId: 'delivery-1',
  status: 'FAILED',
  lastError: 'timeout',
  publishAttempts: 2,
  createdAt: '2026-01-01T10:00:00.000Z',
  retryable: true,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <WhatsAppFailuresPage />
    </MemoryRouter>,
  );
}

describe('WhatsAppFailuresPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:manage'] },
    });
    mocks.failedNotifications.mockResolvedValue({ data: { deliveries: [delivery], outbox: [outbox] } });
    mocks.retryDelivery.mockResolvedValue({ data: { id: 'delivery-1', retried: true } });
    mocks.retryOutbox.mockResolvedValue({ data: { id: 'outbox-1', retried: true } });
  });

  it('reenvia uma entrega com motivo', async () => {
    renderPage();
    await screen.findByText(/APPOINTMENT_CONFIRMATION/);

    fireEvent.click(screen.getAllByRole('button', { name: 'Reenviar' })[0]);
    const dialog = screen.getByRole('alertdialog');
    fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reenviar' }));

    await waitFor(() => {
      expect(mocks.retryDelivery).toHaveBeenCalledWith('delivery-1', REASON);
    });
  });

  it('reenvia um item do outbox com motivo', async () => {
    renderPage();
    await screen.findByText(/timeout/);

    fireEvent.click(screen.getAllByRole('button', { name: 'Reenviar' })[1]);
    const dialog = screen.getByRole('alertdialog');
    fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reenviar' }));

    await waitFor(() => {
      expect(mocks.retryOutbox).toHaveBeenCalledWith('outbox-1', REASON);
    });
  });

  it('mostra erro do reenvio no diálogo', async () => {
    mocks.retryDelivery.mockRejectedValue(new Error('destinatário suprimido'));
    renderPage();
    await screen.findByText(/APPOINTMENT_CONFIRMATION/);

    fireEvent.click(screen.getAllByRole('button', { name: 'Reenviar' })[0]);
    const dialog = screen.getByRole('alertdialog');
    fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reenviar' }));

    expect(await within(dialog).findByText('destinatário suprimido')).toBeInTheDocument();
  });

  it('desabilita o reenvio de item não reenviável e mostra o motivo', async () => {
    mocks.failedNotifications.mockResolvedValue({
      data: {
        deliveries: [
          {
            ...delivery,
            id: 'delivery-suppressed',
            status: 'SUPPRESSED',
            retryable: false,
            notRetryableReason: 'Destinatário suprimido',
          },
        ],
        outbox: [],
      },
    });
    renderPage();

    await screen.findByText(/APPOINTMENT_CONFIRMATION/);
    const button = screen.getByRole('button', { name: 'Reenviar' });
    expect(button).toBeDisabled();
    expect(screen.getByText('Não reenviável')).toBeInTheDocument();
    expect(screen.getByText('— Destinatário suprimido')).toBeInTheDocument();

    const wrapper = button.parentElement as HTMLElement;
    fireEvent.mouseOver(wrapper);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Destinatário suprimido');
  });

  it('esconde reenvio sem WHATSAPP_MANAGE', async () => {
    mocks.useAuth.mockReturnValue({
      user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:read'] },
    });
    renderPage();
    await screen.findByText(/APPOINTMENT_CONFIRMATION/);

    expect(screen.queryByRole('button', { name: 'Reenviar' })).not.toBeInTheDocument();
  });
});
