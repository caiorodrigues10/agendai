/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhatsAppShopsPage } from './WhatsAppShopsPage';

const mocks = vi.hoisted(() => ({
  shops: vi.fn(),
  patchShopAi: vi.fn(),
  patchShopOwnerBot: vi.fn(),
  batchPatchShopAi: vi.fn(),
  batchPatchShopOwnerBot: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('../../infra/adminWhatsappApi', () => ({
  adminWhatsappApi: {
    shops: mocks.shops,
    patchShopAi: mocks.patchShopAi,
    patchShopOwnerBot: mocks.patchShopOwnerBot,
    batchPatchShopAi: mocks.batchPatchShopAi,
    batchPatchShopOwnerBot: mocks.batchPatchShopOwnerBot,
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: mocks.useAuth,
}));

const SHOP_ID = '11111111-1111-4111-8111-111111111111';
const REASON = 'motivo com pelo menos dez caracteres';

const shop = {
  id: SHOP_ID,
  name: 'Barbearia Central',
  city: 'São Paulo',
  active: true,
  approvalStatus: 'APPROVED',
  whatsappAiEnabled: false,
  evolutionInstanceName: 'shop-1',
  ownerBot: { enabled: true, blocked: false, blockedAt: null },
  counts: { aiConversations: 0, OwnerBotActionLog: 0 },
};

function renderPage() {
  return render(
    <MemoryRouter>
      <WhatsAppShopsPage />
    </MemoryRouter>,
  );
}

describe('WhatsAppShopsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:manage'] },
    });
    mocks.shops.mockResolvedValue({
      data: [shop],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
    mocks.batchPatchShopAi.mockResolvedValue({ data: { updated: 1 } });
    mocks.batchPatchShopOwnerBot.mockResolvedValue({ data: { updated: 1 } });
    mocks.patchShopAi.mockResolvedValue({ data: {} });
    mocks.patchShopOwnerBot.mockResolvedValue({ data: {} });
  });

  it('executa ação em lote com seleção múltipla e motivo', async () => {
    renderPage();
    await screen.findByText('Barbearia Central');

    fireEvent.click(screen.getByLabelText('Selecionar Barbearia Central'));
    fireEvent.click(screen.getByRole('button', { name: 'Ligar IA' }));

    const dialog = screen.getByRole('alertdialog');
    fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(mocks.batchPatchShopAi).toHaveBeenCalledWith([SHOP_ID], true, REASON);
    });
  });

  it('exige motivo antes de abrir a ação individual', async () => {
    renderPage();
    await screen.findByText('Barbearia Central');

    fireEvent.click(screen.getByRole('button', { name: 'Desligada' }));
    const dialog = screen.getByRole('alertdialog');
    const confirm = within(dialog).getByRole('button', { name: 'Confirmar' });
    expect(confirm).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
    fireEvent.click(confirm);

    await waitFor(() => {
      expect(mocks.patchShopAi).toHaveBeenCalledWith(SHOP_ID, { enabled: true, reason: REASON });
    });
  });

  it('não mostra seleção nem ações sem WHATSAPP_MANAGE', async () => {
    mocks.useAuth.mockReturnValue({
      user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:read'] },
    });
    renderPage();
    await screen.findByText('Barbearia Central');

    expect(screen.queryByLabelText('Selecionar todos os salões')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desligada' })).toBeDisabled();
  });
});
