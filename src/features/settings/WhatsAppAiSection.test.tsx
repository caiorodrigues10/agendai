/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WhatsAppAiSection } from './WhatsAppAiSection';
import {
  whatsappAiApi,
  type AiConversation,
  type AiIntentStats,
  type AiSettings,
} from '../../infra/whatsappAiApi';

vi.mock('../../infra/whatsappAiApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/whatsappAiApi')>();
  return {
    ...actual,
    whatsappAiApi: {
      ...actual.whatsappAiApi,
      getSettings: vi.fn(),
      updateSettings: vi.fn(),
      listConversations: vi.fn(),
      getConversationDetail: vi.fn(),
      getIntentLogs: vi.fn(),
      getStats: vi.fn(),
      transferToHuman: vi.fn(),
      processIncoming: vi.fn(),
    },
  };
});

const settings: AiSettings = {
  barbershopId: 'shop-1',
  name: 'Barbearia do Zé',
  enabled: false,
  aiInstanceConfigured: true,
};

const conversation: AiConversation = {
  id: 'conv-1',
  barbershopId: 'shop-1',
  phone: '(11) 99999-0000',
  normalizedPhone: '5511999990000',
  status: 'ACTIVE',
  context: {},
  startedAt: '2026-10-30T12:00:00.000Z',
  lastMessageAt: '2026-10-30T12:01:00.000Z',
  endedAt: null,
  _count: { messages: 2 },
};

const stats: AiIntentStats = {
  total: 12,
  byIntent: { pricing: 8, hours: 4 },
  byHandledBy: { AI: 12 },
  avgConfidence: 0.87,
};

function mockBasics(overrides: Partial<AiSettings> = {}) {
  vi.mocked(whatsappAiApi.getSettings).mockResolvedValue({ ...settings, ...overrides });
  vi.mocked(whatsappAiApi.listConversations).mockResolvedValue({
    conversations: [conversation],
    total: 1,
    page: 1,
    limit: 20,
  });
  vi.mocked(whatsappAiApi.getIntentLogs).mockResolvedValue({ logs: [], total: 0, page: 1, limit: 50 });
  vi.mocked(whatsappAiApi.getStats).mockResolvedValue(stats);
}

describe('WhatsAppAiSection', () => {
  afterEach(() => vi.clearAllMocks());

  it('carrega a configuração e mostra o atendente desligado', async () => {
    mockBasics();

    render(<WhatsAppAiSection barbershopId="shop-1" onNotify={vi.fn()} />);

    const toggle = await screen.findByRole('switch', { name: 'Atendente de IA' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(await screen.findByText('(11) 99999-0000')).toBeInTheDocument();
  });

  it('avisa quando a instância da IA não está configurada no servidor', async () => {
    mockBasics({ aiInstanceConfigured: false });

    render(<WhatsAppAiSection barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(await screen.findByTestId('whatsapp-ai-no-instance')).toBeInTheDocument();
  });

  it('liga o atendente ao clicar no toggle', async () => {
    mockBasics();
    vi.mocked(whatsappAiApi.updateSettings).mockResolvedValue({ ...settings, enabled: true });
    const onNotify = vi.fn();

    render(<WhatsAppAiSection barbershopId="shop-1" onNotify={onNotify} />);

    fireEvent.click(await screen.findByRole('switch', { name: 'Atendente de IA' }));

    await waitFor(() =>
      expect(whatsappAiApi.updateSettings).toHaveBeenCalledWith('shop-1', true)
    );
    expect(onNotify).toHaveBeenCalledWith(
      'Atendente de IA ligado neste salão.',
      'success'
    );
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Atendente de IA' })).toHaveAttribute(
        'aria-checked',
        'true'
      )
    );
  });

  it('abre a conversa e transfere para um atendente humano', async () => {
    mockBasics();
    vi.mocked(whatsappAiApi.getConversationDetail).mockResolvedValue({
      ...conversation,
      messages: [
        {
          id: 'm1',
          conversationId: 'conv-1',
          direction: 'INBOUND',
          content: 'Qual o horário?',
          messageType: 'TEXT',
          intent: 'hours',
          entities: {},
          confidence: 0.9,
          sentAt: '2026-10-30T12:00:00.000Z',
        },
      ],
    });
    vi.mocked(whatsappAiApi.transferToHuman).mockResolvedValue({
      ...conversation,
      status: 'TRANSFERRED_TO_HUMAN',
    });

    render(<WhatsAppAiSection barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(await screen.findByText('(11) 99999-0000'));

    expect(await screen.findByTestId('whatsapp-ai-detail')).toBeInTheDocument();
    expect(screen.getByText('Qual o horário?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Transferir para humano/i }));

    await waitFor(() =>
      expect(whatsappAiApi.transferToHuman).toHaveBeenCalledWith('shop-1', 'conv-1')
    );
  });

  it('mostra os indicadores na aba Analytics', async () => {
    mockBasics();

    render(<WhatsAppAiSection barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: /Analytics/i }));

    expect(await screen.findByText('Mensagens')).toBeInTheDocument();
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getByText('87%')).toBeInTheDocument();
    expect(screen.getByText('Preço')).toBeInTheDocument();
    expect(screen.getByText('Resposta automática')).toBeInTheDocument();
  });

  it('processa uma mensagem de teste e exibe a resposta da IA', async () => {
    mockBasics();
    vi.mocked(whatsappAiApi.processIncoming).mockResolvedValue({
      conversationId: 'conv-1',
      message: {
        id: 'm2',
        conversationId: 'conv-1',
        direction: 'OUTBOUND',
        content: 'Funcionamos das 9h às 19h.',
        messageType: 'TEXT',
        intent: 'hours',
        entities: {},
        confidence: 0.93,
        sentAt: '2026-10-30T12:02:00.000Z',
      },
      intent: 'hours',
      confidence: 0.93,
      transferredToHuman: false,
      handledBy: 'AI',
      reply: 'Funcionamos das 9h às 19h.',
    });

    render(<WhatsAppAiSection barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.change(await screen.findByLabelText('Telefone do cliente'), {
      target: { value: '11999990000' },
    });
    fireEvent.change(screen.getByLabelText('Mensagem do cliente'), {
      target: { value: 'Qual o horário?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Processar/i }));

    await waitFor(() =>
      expect(whatsappAiApi.processIncoming).toHaveBeenCalledWith(
        'shop-1',
        '11999990000',
        'Qual o horário?'
      )
    );
    expect(await screen.findByText('Funcionamos das 9h às 19h.')).toBeInTheDocument();
  });
});
