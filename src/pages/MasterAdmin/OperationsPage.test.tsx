/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OperationsPage } from './OperationsPage';
import { adminInternalApi, OperationsHealth } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: { getOperationsHealth: vi.fn() },
}));

vi.mock('../../features/notifications', () => ({
  NotificationHealthPanel: () => <div>painel-notificacoes</div>,
}));

const health: OperationsHealth = {
  generatedAt: new Date().toISOString(),
  status: 'DEGRADED',
  errors: {
    total24h: 339,
    last24h5xx: 128,
    lastHour5xx: 1,
    byStatus: [
      { statusCode: 401, count: 164 },
      { statusCode: 500, count: 128 },
    ],
    topPaths: [{ path: '/api/products', method: 'GET', count: 61 }],
  },
  cron: {
    failures24h: 2,
    running: 1,
    recentFailures: [
      { id: 'cron-1', jobName: 'notification-scheduler', startedAt: '2026-10-03T01:00:00.000Z', error: 'timeout' },
    ],
  },
  delivery: {
    whatsapp: { total24h: 10, failed24h: 1, failedRatePct: 10 },
    email: { total24h: 5, failed24h: 0, failedRatePct: 0 },
  },
  outbox: { pending: 3, failed: 1 },
};

function renderPage() {
  return render(<OperationsPage />);
}

describe('OperationsPage', () => {
  beforeEach(() => {
    vi.mocked(adminInternalApi.getOperationsHealth).mockResolvedValue({
      success: true,
      data: health,
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('carrega a saúde da operação e exibe status, KPIs e painéis', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: /Operação/ })).toBeInTheDocument();
    expect(adminInternalApi.getOperationsHealth).toHaveBeenCalledTimes(1);

    expect(screen.getByText('Degradada')).toBeInTheDocument();
    expect(screen.getByText('Erros 5xx (24h)')).toBeInTheDocument();
    expect(screen.getAllByText('128')).toHaveLength(2);
    expect(screen.getByText('Caminhos com mais erros (24h)')).toBeInTheDocument();
    expect(screen.getByText('notification-scheduler')).toBeInTheDocument();
    expect(screen.getByText('Entregas de mensagens (24h)')).toBeInTheDocument();
    expect(screen.getByText('painel-notificacoes')).toBeInTheDocument();
  });

  it('mostra estado vazio de erros quando não há registros', async () => {
    vi.mocked(adminInternalApi.getOperationsHealth).mockResolvedValue({
      success: true,
      data: {
        ...health,
        status: 'HEALTHY',
        errors: { ...health.errors, total24h: 0, last24h5xx: 0, lastHour5xx: 0, byStatus: [], topPaths: [] },
        cron: { failures24h: 0, running: 0, recentFailures: [] },
      },
    } as never);

    renderPage();

    expect(await screen.findByText('Saudável')).toBeInTheDocument();
    expect(screen.getByText('Nenhum erro registrado nas últimas 24 horas.')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma falha recente de cron.')).toBeInTheDocument();
  });

  it('mostra estado de erro com opção de tentar novamente', async () => {
    vi.mocked(adminInternalApi.getOperationsHealth).mockRejectedValue(new Error('boom'));

    renderPage();

    expect(
      await screen.findByText('Não foi possível carregar as informações de operação.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => {
      expect(adminInternalApi.getOperationsHealth).toHaveBeenCalledTimes(2);
    });
  });
});
