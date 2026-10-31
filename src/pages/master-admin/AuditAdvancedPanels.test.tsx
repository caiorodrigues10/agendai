/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AuditAlertsPanel, AuditSessionsPanel } from './AuditAdvancedPanels';
import { adminAuditApi, AuditAlerts } from '../../infra/adminAuditApi';
import { adminSessionsApi, AdminSession } from '../../infra/adminSessionsApi';
import { ApiError } from '../../infra/apiClient';

vi.mock('../../infra/adminAuditApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/adminAuditApi')>();
  return {
    ...actual,
    adminAuditApi: {
      getAuditLogs: vi.fn(),
      exportAuditLogsCsv: vi.fn(),
      getAuditFacets: vi.fn(),
      getAuditAlerts: vi.fn(),
    },
  };
});

vi.mock('../../infra/adminSessionsApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../infra/adminSessionsApi')>();
  return {
    ...actual,
    adminSessionsApi: {
      list: vi.fn(),
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
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

const adminSessions: AdminSession[] = [
  {
    id: 's1',
    userId: 'u1',
    userName: 'Administrador',
    userEmail: 'admin@agendai.local',
    userRole: 'MASTER_ADMIN',
    barbershopId: null,
    deviceLabel: 'Chrome em macOS',
    ipAddress: '1.1.1.1',
    userAgent: 'ua-1',
    createdAt: '2026-10-03T11:00:00.000Z',
    lastSeenAt: '2026-10-03T11:55:00.000Z',
    expiresAt: '2026-10-04T11:00:00.000Z',
    status: 'active',
    revokedAt: null,
    revokedReason: null,
    current: true,
  },
  {
    id: 's2',
    userId: 'u2',
    userName: 'Proprietário',
    userEmail: 'owner@x.com',
    userRole: 'OWNER',
    barbershopId: 'b1',
    deviceLabel: 'Firefox em Windows',
    ipAddress: '2.2.2.2',
    userAgent: 'ua-2',
    createdAt: '2026-10-02T10:00:00.000Z',
    lastSeenAt: '2026-10-02T10:30:00.000Z',
    expiresAt: '2026-10-03T10:00:00.000Z',
    status: 'revoked',
    revokedAt: '2026-10-02T11:00:00.000Z',
    revokedReason: 'acesso indevido',
    current: false,
  },
];

describe('AuditAlertsPanel', () => {
  afterEach(() => vi.clearAllMocks());

  it('exibe total, grupos e eventos recentes', async () => {
    vi.mocked(adminAuditApi.getAuditAlerts).mockResolvedValue({ success: true, data: alerts });

    render(<AuditAlertsPanel />);

    expect(await screen.findByText('ações sensíveis')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Impersonation')).toBeInTheDocument();
    expect(screen.getByText('ACCOUNT_IMPERSONATE')).not.toBeVisible();

    fireEvent.click(screen.getByText('Ver ações sensíveis recentes'));

    expect(screen.getByText('ACCOUNT_IMPERSONATE')).toBeVisible();
    expect(screen.getByText('Acesso assistido iniciado')).toBeVisible();
    expect(screen.getByText('Administrador')).toBeVisible();
  });

  it('mostra erro e recarrega ao tentar novamente', async () => {
    vi.mocked(adminAuditApi.getAuditAlerts)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ success: true, data: alerts });

    render(<AuditAlertsPanel />);

    expect(await screen.findByText('Não foi possível carregar os alertas.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    await waitFor(() => expect(adminAuditApi.getAuditAlerts).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('ações sensíveis')).toBeInTheDocument();
  });

  it('contextualiza a ausência de ações na janela de 24h', async () => {
    vi.mocked(adminAuditApi.getAuditAlerts).mockResolvedValue({
      success: true,
      data: {
        ...alerts,
        total: 0,
        byGroup: alerts.byGroup.map(group => ({ ...group, count: 0 })),
        recent: [],
      },
    });

    render(<AuditAlertsPanel />);

    expect(await screen.findByText('Nenhuma ação sensível nas últimas 24 horas.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Alertas sensíveis (24h)' })).toBeVisible();
    expect(screen.queryByText('Ver ações sensíveis recentes')).not.toBeInTheDocument();
  });

  it('identifica carregamento sem antecipar uma contagem de zero', () => {
    vi.mocked(adminAuditApi.getAuditAlerts).mockReturnValue(new Promise(() => undefined));

    render(<AuditAlertsPanel />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando alertas…');
    expect(
      screen.queryByText('Nenhuma ação sensível nas últimas 24 horas.')
    ).not.toBeInTheDocument();
  });
});

describe('AuditSessionsPanel', () => {
  afterEach(() => vi.clearAllMocks());

  it('lista sessões reais com dispositivo, IP e status', async () => {
    vi.mocked(adminSessionsApi.list).mockResolvedValue({
      success: true,
      data: adminSessions,
      meta: { total: 2, page: 1, limit: 8, totalPages: 1 },
    });

    render(<AuditSessionsPanel />);

    expect(await screen.findByText('Chrome em macOS')).toBeInTheDocument();
    expect(screen.getByText('Firefox em Windows')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('Encerrada')).toBeInTheDocument();
    expect(screen.getByText('Você')).toBeInTheDocument();
    expect(screen.getByText('1.1.1.1', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('2 exibidas')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Encerrar sessão de/ })).toHaveLength(1);
  });

  it('encerra uma sessão informando o motivo e recarrega a lista', async () => {
    vi.mocked(adminSessionsApi.list).mockResolvedValue({
      success: true,
      data: adminSessions,
      meta: { total: 2, page: 1, limit: 8, totalPages: 1 },
    });
    vi.mocked(adminSessionsApi.revoke).mockResolvedValue({
      success: true,
      data: { id: 's1', revoked: true },
    });

    render(<AuditSessionsPanel />);

    fireEvent.click(
      await screen.findByRole('button', { name: /^Encerrar sessão de Administrador/ })
    );
    const textarea = await screen.findByPlaceholderText('Por que esta ação está sendo executada?');
    fireEvent.change(textarea, { target: { value: 'Sessão suspeita de terceiro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Encerrar sessão' }));

    await waitFor(() =>
      expect(adminSessionsApi.revoke).toHaveBeenCalledWith('s1', {
        reason: 'Sessão suspeita de terceiro',
        confirmSelf: true,
      })
    );
    await waitFor(() => expect(adminSessionsApi.list).toHaveBeenCalledTimes(2));
    expect(screen.queryByPlaceholderText('Por que esta ação está sendo executada?')).toBeNull();
  });

  it('mostra estado vazio quando não há sessões', async () => {
    vi.mocked(adminSessionsApi.list).mockResolvedValue({
      success: true,
      data: [],
      meta: { total: 0, page: 1, limit: 8, totalPages: 0 },
    });

    render(<AuditSessionsPanel />);

    expect(await screen.findByText('Nenhuma sessão registrada.')).toBeInTheDocument();
  });

  it('mostra erro de permissão (403) e recarrega ao tentar novamente', async () => {
    vi.mocked(adminSessionsApi.list)
      .mockRejectedValueOnce(new ApiError('Sem permissão', 403))
      .mockResolvedValueOnce({
        success: true,
        data: adminSessions,
        meta: { total: 2, page: 1, limit: 8, totalPages: 1 },
      });

    render(<AuditSessionsPanel />);

    expect(
      await screen.findByText('Sem permissão para ver sessões (requer Gerenciar usuários).')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    await waitFor(() => expect(adminSessionsApi.list).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Chrome em macOS')).toBeInTheDocument();
  });

  it('informa quando a lista mostra apenas parte das sessões registradas', async () => {
    vi.mocked(adminSessionsApi.list).mockResolvedValue({
      success: true,
      data: adminSessions,
      meta: { total: 20, page: 1, limit: 8, totalPages: 3 },
    });

    render(<AuditSessionsPanel />);

    expect(await screen.findByText('2 exibidas de 20')).toBeVisible();
    expect(adminSessionsApi.list).toHaveBeenCalledWith({ limit: 8 });
    expect(
      screen.getByText('Acessos recentes por dispositivo, incluindo sessões encerradas.')
    ).toBeVisible();
  });

  it('mantém acessíveis os dados de dispositivos desconhecidos', async () => {
    vi.mocked(adminSessionsApi.list).mockResolvedValue({
      success: true,
      data: [{ ...adminSessions[0], deviceLabel: null, ipAddress: null }],
      meta: { total: 1, page: 1, limit: 8, totalPages: 1 },
    });

    render(<AuditSessionsPanel />);

    expect(await screen.findByText('Dispositivo desconhecido')).toBeVisible();
    expect(screen.getByText('IP indisponível', { exact: false })).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'Encerrar sessão de Administrador em dispositivo desconhecido',
      })
    ).toBeVisible();
    expect(screen.getByText('1 exibida')).toBeVisible();
  });

  it('limpa o motivo ao cancelar e abrir novamente a confirmação', async () => {
    vi.mocked(adminSessionsApi.list).mockResolvedValue({
      success: true,
      data: adminSessions,
      meta: { total: 2, page: 1, limit: 8, totalPages: 1 },
    });

    render(<AuditSessionsPanel />);

    const open = await screen.findByRole('button', { name: /^Encerrar sessão de Administrador/ });
    fireEvent.click(open);
    fireEvent.change(screen.getByPlaceholderText('Por que esta ação está sendo executada?'), {
      target: { value: 'Motivo que não deve persistir' },
    });
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar' })
    );
    fireEvent.click(open);

    expect(screen.getByPlaceholderText('Por que esta ação está sendo executada?')).toHaveValue('');
    expect(adminSessionsApi.revoke).not.toHaveBeenCalled();
  });
});
