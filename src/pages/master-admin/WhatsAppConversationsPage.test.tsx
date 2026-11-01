/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhatsAppConversationsPage } from './WhatsAppConversationsPage';

const mocks = vi.hoisted(() => ({
  aiConversations: vi.fn(),
  aiConversationDetail: vi.fn(),
  aiTransfer: vi.fn(),
  shops: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('../../infra/adminWhatsappApi', () => ({
  adminWhatsappApi: {
    aiConversations: mocks.aiConversations,
    aiConversationDetail: mocks.aiConversationDetail,
    aiTransfer: mocks.aiTransfer,
    shops: mocks.shops,
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: mocks.useAuth,
}));

const SHOP_ID = '11111111-1111-4111-8111-111111111111';
const REASON = 'motivo com pelo menos dez caracteres';

const conversation = {
  id: 'conv-1',
  barbershopId: SHOP_ID,
  barbershopName: 'Barbearia Central',
  phoneMasked: '(11) 98765-4321',
  status: 'ACTIVE',
  startedAt: '2026-01-01T10:00:00.000Z',
  lastMessageAt: '2026-01-01T10:05:00.000Z',
  endedAt: null,
  messageCount: 2,
};

const detail = {
  ...conversation,
  context: { raw: 'contexto interno' },
  messages: [
    { id: 'm1', direction: 'INBOUND', content: 'Olá', messageType: 'TEXT', intent: null, confidence: null, sentAt: '2026-01-01T10:00:00.000Z' },
    { id: 'm2', direction: 'OUTBOUND', content: 'Posso ajudar?', messageType: 'TEXT', intent: null, confidence: null, sentAt: '2026-01-01T10:01:00.000Z' },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter>
      <WhatsAppConversationsPage />
    </MemoryRouter>,
  );
}

describe('WhatsAppConversationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:manage'] },
    });
    mocks.shops.mockResolvedValue({
      data: [{ id: SHOP_ID, name: 'Barbearia Central' }],
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });
    mocks.aiConversations.mockResolvedValue({
      data: [conversation],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
    mocks.aiConversationDetail.mockResolvedValue({ data: detail });
    mocks.aiTransfer.mockResolvedValue({ data: { id: 'conv-1', status: 'TRANSFERRED_TO_HUMAN' } });
  });

  it('mostra carregando, depois a lista', async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    mocks.aiConversations.mockImplementation(() => new Promise((resolve) => { resolveList = resolve; }));

    renderPage();
    expect(screen.getByText('Carregando')).toBeInTheDocument();
    await waitFor(() => expect(mocks.aiConversations).toHaveBeenCalled());

    resolveList({
      data: [conversation],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });

    expect(await screen.findByRole('cell', { name: 'Barbearia Central' })).toBeInTheDocument();
    expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument();
  });

  it('mostra estado vazio', async () => {
    mocks.aiConversations.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    });
    renderPage();

    expect(await screen.findByText('Nenhuma conversa encontrada')).toBeInTheDocument();
  });

  it('mostra erro de carga com opção de tentar de novo', async () => {
    mocks.aiConversations.mockRejectedValueOnce(new Error('falha ao carregar'));
    renderPage();

    expect(await screen.findByText('falha ao carregar')).toBeInTheDocument();
    mocks.aiConversations.mockResolvedValue({
      data: [conversation],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('cell', { name: 'Barbearia Central' })).toBeInTheDocument();
  });

  it('filtra por salão e status', async () => {
    renderPage();
    await screen.findByRole('cell', { name: 'Barbearia Central' });

    fireEvent.change(screen.getByLabelText('Salão'), { target: { value: SHOP_ID } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'ACTIVE' } });
    await waitFor(() => {
      expect(mocks.aiConversations).toHaveBeenCalledWith(
        expect.objectContaining({ barbershopId: SHOP_ID, status: 'ACTIVE' }),
      );
    });
  });

  it('erro de ação não derruba a tabela', async () => {
    mocks.aiConversationDetail.mockRejectedValue(new Error('conversa indisponível'));
    renderPage();
    await screen.findByRole('cell', { name: 'Barbearia Central' });

    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));

    expect(await screen.findByText('conversa indisponível')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Barbearia Central' })).toBeInTheDocument();
  });

  it('transfere para humano com motivo e mostra erro sem fechar o diálogo', async () => {
    mocks.aiTransfer.mockRejectedValue(new Error('não foi possível transferir'));
    renderPage();
    await screen.findByRole('cell', { name: 'Barbearia Central' });

    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));
    await screen.findByText('Posso ajudar?');
    fireEvent.click(screen.getByRole('button', { name: 'Transferir para humano' }));

    const dialog = screen.getByRole('alertdialog');
    fireEvent.change(within(dialog).getByLabelText(/Motivo/i), { target: { value: REASON } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Transferir' }));

    expect(await within(dialog).findByText('não foi possível transferir')).toBeInTheDocument();
    expect(mocks.aiTransfer).toHaveBeenCalledWith('conv-1', REASON);
    expect(screen.getByRole('cell', { name: 'Barbearia Central' })).toBeInTheDocument();
  });

  it('esconde a ação de transferência sem WHATSAPP_MANAGE', async () => {
    mocks.useAuth.mockReturnValue({
      user: { id: 'admin-1', name: 'Admin', role: 'MASTER_ADMIN', internalPermissions: ['internal:whatsapp:read'] },
    });
    renderPage();
    await screen.findByRole('cell', { name: 'Barbearia Central' });

    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));
    await screen.findByText('Posso ajudar?');
    expect(screen.queryByRole('button', { name: 'Transferir para humano' })).not.toBeInTheDocument();
  });

  it('não expõe o contexto cru da conversa', async () => {
    renderPage();
    await screen.findByRole('cell', { name: 'Barbearia Central' });

    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));
    await screen.findByText('Posso ajudar?');
    expect(screen.queryByText(/contexto interno/)).not.toBeInTheDocument();
  });
});
