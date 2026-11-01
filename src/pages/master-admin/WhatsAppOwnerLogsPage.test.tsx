/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhatsAppOwnerLogsPage } from './WhatsAppOwnerLogsPage';

const mocks = vi.hoisted(() => ({
  ownerBotActionLogs: vi.fn(),
  shops: vi.fn(),
}));

vi.mock('../../infra/adminWhatsappApi', () => ({
  adminWhatsappApi: {
    ownerBotActionLogs: mocks.ownerBotActionLogs,
    shops: mocks.shops,
  },
}));

const SHOP_ID = '11111111-1111-4111-8111-111111111111';

const log = {
  id: 'log-1',
  barbershopId: SHOP_ID,
  barbershopName: 'Barbearia Central',
  action: 'CREATE_APPOINTMENT',
  status: 'SUCCESS',
  riskClass: 'WRITE',
  phoneMasked: '***4321',
  errorMessage: null,
  canUndo: false,
  undoneAt: null,
  createdAt: '2026-01-01T10:00:00.000Z',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <WhatsAppOwnerLogsPage />
    </MemoryRouter>,
  );
}

describe('WhatsAppOwnerLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.shops.mockResolvedValue({
      data: [{ id: SHOP_ID, name: 'Barbearia Central' }],
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });
    mocks.ownerBotActionLogs.mockResolvedValue({
      data: [log],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
  });

  it('mostra carregando, depois a lista', async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    mocks.ownerBotActionLogs.mockImplementation(() => new Promise((resolve) => { resolveList = resolve; }));

    renderPage();
    expect(screen.getByText('Carregando')).toBeInTheDocument();

    resolveList({ data: [log], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } });

    expect(await screen.findByRole('cell', { name: 'Barbearia Central' })).toBeInTheDocument();
    expect(screen.getByText('CREATE_APPOINTMENT')).toBeInTheDocument();
    expect(screen.getByText('***4321')).toBeInTheDocument();
  });

  it('mostra estado vazio', async () => {
    mocks.ownerBotActionLogs.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    });
    renderPage();

    expect(await screen.findByText('Nenhum log encontrado')).toBeInTheDocument();
  });

  it('mostra erro de carga com opção de tentar de novo', async () => {
    mocks.ownerBotActionLogs.mockRejectedValueOnce(new Error('falha ao carregar logs'));
    renderPage();

    expect(await screen.findByText('falha ao carregar logs')).toBeInTheDocument();
    mocks.ownerBotActionLogs.mockResolvedValue({
      data: [log],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('cell', { name: 'Barbearia Central' })).toBeInTheDocument();
  });

  it('filtra por salão, risco e status', async () => {
    renderPage();
    await screen.findByRole('cell', { name: 'Barbearia Central' });

    fireEvent.change(screen.getByLabelText('Salão'), { target: { value: SHOP_ID } });
    fireEvent.change(screen.getByLabelText('Risco'), { target: { value: 'WRITE' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'SUCCESS' } });

    await waitFor(() => {
      expect(mocks.ownerBotActionLogs).toHaveBeenCalledWith(
        expect.objectContaining({ barbershopId: SHOP_ID, riskClass: 'WRITE', status: 'SUCCESS' }),
      );
    });
  });

  it('pagina os logs', async () => {
    mocks.ownerBotActionLogs.mockResolvedValue({
      data: [log],
      meta: { total: 30, page: 1, limit: 20, totalPages: 2 },
    });
    renderPage();
    await screen.findByRole('cell', { name: 'Barbearia Central' });

    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    await waitFor(() => {
      expect(mocks.ownerBotActionLogs).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });

  it('não expõe telefone completo', async () => {
    renderPage();
    await screen.findByRole('cell', { name: 'Barbearia Central' });

    expect(screen.getByText('***4321')).toBeInTheDocument();
    expect(screen.queryByText(/11987654321/)).not.toBeInTheDocument();
  });
});
