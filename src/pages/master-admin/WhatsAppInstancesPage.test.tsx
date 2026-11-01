/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhatsAppInstancesPage } from './WhatsAppInstancesPage';

const mocks = vi.hoisted(() => ({
  instances: vi.fn(),
  reconnect: vi.fn(),
  logout: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('../../infra/adminWhatsappApi', () => ({
  adminWhatsappApi: {
    instances: mocks.instances,
    reconnect: mocks.reconnect,
    logout: mocks.logout,
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: mocks.useAuth,
}));

const SHOP_ID = '11111111-1111-4111-8111-111111111111';
const REASON = 'motivo com pelo menos dez caracteres';

const shopInstance = {
  kind: 'shop' as const,
  name: 'shop-1',
  state: 'close',
  shopId: SHOP_ID,
  shopName: 'Barbearia Central',
};

const platformInstance = {
  kind: 'platform' as const,
  name: 'agendai-plataforma',
  state: 'open',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <WhatsAppInstancesPage />
    </MemoryRouter>,
  );
}

function grantManage() {
  mocks.useAuth.mockReturnValue({
    user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:manage'] },
  });
}

function grantReadOnly() {
  mocks.useAuth.mockReturnValue({
    user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:read'] },
  });
}

function fillReasonAndConfirm(label: string) {
  const dialog = screen.getByRole('alertdialog');
  fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
  fireEvent.click(within(dialog).getByRole('button', { name: label }));
}

describe('WhatsAppInstancesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    grantManage();
    mocks.instances.mockResolvedValue({
      data: [platformInstance, shopInstance],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    });
    mocks.reconnect.mockResolvedValue({
      data: { instanceName: 'shop-1', state: 'connecting', qrcodeBase64: 'data:image/png;base64,QR' },
    });
    mocks.logout.mockResolvedValue({ data: { instanceName: 'shop-1', state: 'close' } });
  });

  it('lista as instâncias e mostra ações só para instâncias de salão', async () => {
    renderPage();

    expect(await screen.findByText('Barbearia Central · shop-1')).toBeInTheDocument();
    expect(screen.getByText('agendai-plataforma')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Reconectar' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Deslogar' })).toHaveLength(1);
    expect(screen.getByText('Gerenciada pela plataforma')).toBeInTheDocument();
  });

  it('esconde ações quando o usuário só tem leitura', async () => {
    grantReadOnly();
    renderPage();

    await screen.findByText('Barbearia Central · shop-1');
    expect(screen.queryByRole('button', { name: 'Reconectar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deslogar' })).not.toBeInTheDocument();
  });

  it('reconecta com motivo e exibe o QR code retornado', async () => {
    renderPage();
    await screen.findByText('Barbearia Central · shop-1');

    fireEvent.click(screen.getByRole('button', { name: 'Reconectar' }));
    fillReasonAndConfirm('Reconectar');

    await waitFor(() => {
      expect(mocks.reconnect).toHaveBeenCalledWith(SHOP_ID, REASON);
    });
    expect(await screen.findByAltText('QR code para reconectar shop-1')).toBeInTheDocument();
  });

  it('desloga com motivo', async () => {
    renderPage();
    await screen.findByText('Barbearia Central · shop-1');

    fireEvent.click(screen.getByRole('button', { name: 'Deslogar' }));
    fillReasonAndConfirm('Deslogar');

    await waitFor(() => {
      expect(mocks.logout).toHaveBeenCalledWith(SHOP_ID, REASON);
    });
  });

  it('mostra badge de inacessível com o motivo do erro', async () => {
    mocks.instances.mockResolvedValue({
      data: [
        { ...platformInstance, state: 'unreachable', error: 'Evolution indisponível' },
        shopInstance,
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    });
    renderPage();

    const badge = await screen.findByText('Inacessível');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('[data-state]')).toHaveAttribute('data-state', 'unreachable');
    expect(screen.queryByText('Fechada')).toBeInTheDocument();
  });

  it('pagina as instâncias e recarrega ao pedir atualização', async () => {
    mocks.instances.mockResolvedValue({
      data: [shopInstance],
      meta: { total: 40, page: 1, limit: 20, totalPages: 2 },
    });
    renderPage();

    await screen.findByText('Barbearia Central · shop-1');
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    await waitFor(() => {
      expect(mocks.instances).toHaveBeenCalledWith({ page: 2, limit: 20 });
    });

    fireEvent.click(screen.getByRole('button', { name: /Atualizar/ }));
    await waitFor(() => {
      expect(mocks.instances).toHaveBeenCalledTimes(3);
    });
  });

  it('mostra o erro da ação no diálogo sem derrubar a tela', async () => {
    mocks.reconnect.mockRejectedValue(new Error('falha ao reconectar'));
    renderPage();
    await screen.findByText('Barbearia Central · shop-1');

    fireEvent.click(screen.getByRole('button', { name: 'Reconectar' }));
    fillReasonAndConfirm('Reconectar');

    expect(await screen.findByRole('alert')).toHaveTextContent('falha ao reconectar');
    expect(screen.getByText('Barbearia Central · shop-1')).toBeInTheDocument();
  });
});
