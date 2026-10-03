/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuditAlertsPanel, AuditSessionsPanel } from './AuditAdvancedPanels';
import { adminAuditApi, AuditAlerts, AuditSessions } from '../../infra/adminAuditApi';

vi.mock('../../infra/adminAuditApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../infra/adminAuditApi')>();
  return {
    ...actual,
    adminAuditApi: {
      getAuditLogs: vi.fn(),
      exportAuditLogsCsv: vi.fn(),
      getAuditFacets: vi.fn(),
      getAuditAlerts: vi.fn(),
      getAuditSessions: vi.fn(),
    },
  };
});

const alerts: AuditAlerts = {
  generatedAt: '2026-10-03T12:00:00.000Z',
  windowHours: 24,
  total: 3,
  byGroup: [
    { key: 'impersonation', label: 'Impersonation', count: 2 },
    { key: 'accounts', label: 'Contas', count: 1 },
    { key: 'deletions', label: 'Exclusões', count: 0 },
    { key: 'blocks', label: 'Bloqueios', count: 0 },
    { key: 'others', label: 'Outras ações sensíveis', count: 0 },
  ],
  recent: [
    {
      id: 'a1',
      action: 'ACCOUNT_IMPERSONATE',
      resource: 'admin',
      resourceId: 'b1',
      userId: 'u1',
      userName: 'Administrador',
      createdAt: '2026-10-03T11:00:00.000Z',
    },
  ],
};

const sessions: AuditSessions = {
  generatedAt: '2026-10-03T12:00:00.000Z',
  windowHours: 24,
  sessions: [
    {
      key: 'u1|1.1.1.1',
      userId: 'u1',
      email: 'admin@agendai.local',
      name: 'Administrador',
      ip: '1.1.1.1',
      userAgent: 'chrome',
      lastEvent: 'REFRESH',
      lastAt: '2026-10-03T11:55:00.000Z',
      status: 'ACTIVE',
    },
    {
      key: 'u2|2.2.2.2',
      userId: 'u2',
      email: 'owner@x.com',
      name: null,
      ip: '2.2.2.2',
      userAgent: 'safari',
      lastEvent: 'LOGOUT',
      lastAt: '2026-10-03T10:00:00.000Z',
      status: 'CLOSED',
    },
  ],
};

describe('AuditAlertsPanel', () => {
  afterEach(() => vi.clearAllMocks());

  it('exibe total, grupos e eventos recentes', async () => {
    vi.mocked(adminAuditApi.getAuditAlerts).mockResolvedValue({ success: true, data: alerts });

    render(<AuditAlertsPanel />);

    expect(await screen.findByText('ação(ões) sensível(is)')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Impersonation')).toBeInTheDocument();
    expect(screen.getByText('ACCOUNT_IMPERSONATE')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('mostra erro e recarrega ao tentar novamente', async () => {
    vi.mocked(adminAuditApi.getAuditAlerts)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ success: true, data: alerts });

    render(<AuditAlertsPanel />);

    expect(await screen.findByText('Não foi possível carregar os alertas.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    await waitFor(() =>
      expect(adminAuditApi.getAuditAlerts).toHaveBeenCalledTimes(2),
    );
    expect(await screen.findByText('ação(ões) sensível(is)')).toBeInTheDocument();
  });
});

describe('AuditSessionsPanel', () => {
  afterEach(() => vi.clearAllMocks());

  it('lista sessões com status', async () => {
    vi.mocked(adminAuditApi.getAuditSessions).mockResolvedValue({
      success: true,
      data: sessions,
    });

    render(<AuditSessionsPanel />);

    expect(await screen.findByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('Encerrada')).toBeInTheDocument();
    expect(screen.getByText('owner@x.com')).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há sessões', async () => {
    vi.mocked(adminAuditApi.getAuditSessions).mockResolvedValue({
      success: true,
      data: { ...sessions, sessions: [] },
    });

    render(<AuditSessionsPanel />);

    expect(
      await screen.findByText('Nenhuma sessão nas últimas 24h.'),
    ).toBeInTheDocument();
  });
});
