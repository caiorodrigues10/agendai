/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuditPage } from './AuditPage';
import { adminAuditApi, AuditLogsResponse } from '../../infra/adminAuditApi';

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

const facets = {
  resources: ['products', 'users'],
  users: [{ id: 'user-1', name: 'Administrador', email: 'admin@agendai.local' }],
  shops: [{ id: 'b1', name: 'Barbearia Central' }],
};

const alerts = {
  generatedAt: '2026-10-03T12:00:00.000Z',
  windowHours: 24,
  total: 2,
  byGroup: [
    { key: 'impersonation', label: 'Impersonation', count: 1 },
    { key: 'accounts', label: 'Contas', count: 1 },
  ],
  recent: [
    {
      id: 'a1',
      action: 'ACCOUNT_IMPERSONATE',
      resource: 'admin',
      resourceId: 'b1',
      userId: 'user-1',
      userName: 'Administrador',
      createdAt: '2026-10-03T11:00:00.000Z',
    },
  ],
};

const sessions = {
  generatedAt: '2026-10-03T12:00:00.000Z',
  windowHours: 24,
  sessions: [
    {
      key: 'user-1|1.1.1.1',
      userId: 'user-1',
      email: 'admin@agendai.local',
      name: 'Administrador',
      ip: '1.1.1.1',
      userAgent: 'chrome',
      lastEvent: 'REFRESH',
      lastAt: '2026-10-03T11:55:00.000Z',
      status: 'ACTIVE' as const,
    },
  ],
};

const response: AuditLogsResponse = {
  success: true,
  data: [
    {
      id: 'log-1',
      userId: 'user-1',
      action: 'PATCH /api/products/abc',
      resource: 'products',
      resourceId: 'abc',
      details: '{"fields":["active"]}',
      ipAddress: '192.168.0.1',
      createdAt: '2026-10-03T04:28:54.763Z',
    },
    {
      id: 'log-2',
      userId: 'user-2',
      action: 'POST /api/auth/login',
      resource: 'auth',
      resourceId: null,
      details: null,
      ipAddress: null,
      createdAt: '2026-10-02T10:00:00.000Z',
    },
  ],
  meta: { total: 40, page: 1, limit: 25, totalPages: 2 },
};

function renderPage(initialEntry = '/master/audit') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuditPage />
    </MemoryRouter>,
  );
}

describe('AuditPage', () => {
  beforeEach(() => {
    vi.mocked(adminAuditApi.getAuditLogs).mockResolvedValue(response);
    vi.mocked(adminAuditApi.getAuditFacets).mockResolvedValue({ success: true, data: facets });
    vi.mocked(adminAuditApi.getAuditAlerts).mockResolvedValue({ success: true, data: alerts });
    vi.mocked(adminAuditApi.getAuditSessions).mockResolvedValue({
      success: true,
      data: sessions,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('carrega os logs e exibe registros e paginação', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Auditoria' })).toBeInTheDocument();
    expect(adminAuditApi.getAuditLogs).toHaveBeenCalledWith({
      page: 1,
      limit: 25,
      q: undefined,
      action: undefined,
      resource: undefined,
      from: undefined,
      to: undefined,
    });

    expect(screen.getByText('PATCH /api/products/abc')).toBeInTheDocument();
    expect(screen.getByText('40 registro(s) · página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exportar CSV/ })).toBeEnabled();
  });

  it('lê filtros da URL e aplica novos filtros pelo formulário', async () => {
    renderPage('/master/audit?action=PATCH&page=3');

    await waitFor(() => {
      expect(adminAuditApi.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'PATCH', page: 3 }),
      );
    });

    fireEvent.change(screen.getByPlaceholderText('Ação, recurso ou detalhes'), {
      target: { value: 'login' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Filtrar/ }));

    await waitFor(() => {
      expect(adminAuditApi.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'login', action: 'PATCH', page: 1 }),
      );
    });
  });

  it('exporta o CSV filtrado baixando o arquivo', async () => {
    vi.mocked(adminAuditApi.exportAuditLogsCsv).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['createdAt,action']),
    } as never);
    const createObjectURL = vi.fn(() => 'blob:audit');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    renderPage('/master/audit?action=PATCH');
    await screen.findByRole('heading', { name: 'Auditoria' });

    fireEvent.click(screen.getByRole('button', { name: /Exportar CSV/ }));

    await waitFor(() => {
      expect(adminAuditApi.exportAuditLogsCsv).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'PATCH' }),
      );
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('exibe painéis de alertas e sessões', async () => {
    renderPage();

    expect(await screen.findByText('Alertas sensíveis (24h)')).toBeInTheDocument();
    expect(screen.getByText('Sessões (24h)')).toBeInTheDocument();
    expect(await screen.findByText('ação(ões) sensível(is)')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
  });

  it('abre o modal de detalhes com JSON mascarado', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Auditoria' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Detalhes' })[0]);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Detalhes do registro')).toBeInTheDocument();
    expect(screen.getByText(/"fields": \[/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar detalhes' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('filtra por usuário e salão via selects', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Auditoria' });
    fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: 'user-1' } });
    fireEvent.change(screen.getByLabelText('Salão'), { target: { value: 'b1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));

    await waitFor(() => {
      expect(adminAuditApi.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', shopId: 'b1', page: 1 }),
      );
    });
  });

  it('mostra estado de erro com opção de tentar novamente', async () => {
    vi.mocked(adminAuditApi.getAuditLogs).mockRejectedValue(new Error('boom'));

    renderPage();

    expect(
      await screen.findByText('Não foi possível carregar os logs de auditoria.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => {
      expect(adminAuditApi.getAuditLogs).toHaveBeenCalledTimes(2);
    });
  });
});
