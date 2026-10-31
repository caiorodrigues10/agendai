/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuditPage } from './AuditPage';
import { adminAuditApi, AuditLogsResponse } from '../../infra/adminAuditApi';
import { adminSessionsApi } from '../../infra/adminSessionsApi';

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
  success: true,
  data: [
    {
      id: 's1',
      userId: 'user-1',
      userName: 'Administrador',
      userEmail: 'admin@agendai.local',
      userRole: 'MASTER_ADMIN',
      barbershopId: null,
      deviceLabel: 'Chrome em macOS',
      ipAddress: '1.1.1.1',
      userAgent: 'chrome',
      createdAt: '2026-10-03T11:00:00.000Z',
      lastSeenAt: '2026-10-03T11:55:00.000Z',
      expiresAt: '2026-10-04T11:00:00.000Z',
      status: 'active' as const,
      revokedAt: null,
      revokedReason: null,
      current: true,
    },
  ],
  meta: { total: 1, page: 1, limit: 8, totalPages: 1 },
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
      barbershopId: 'b1',
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
    </MemoryRouter>
  );
}

describe('AuditPage', () => {
  beforeEach(() => {
    vi.mocked(adminAuditApi.getAuditLogs).mockResolvedValue(response);
    vi.mocked(adminAuditApi.getAuditFacets).mockResolvedValue({ success: true, data: facets });
    vi.mocked(adminAuditApi.getAuditAlerts).mockResolvedValue({ success: true, data: alerts });
    vi.mocked(adminSessionsApi.list).mockResolvedValue(sessions);
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

    expect(await screen.findByText('PATCH /api/products/abc')).toBeInTheDocument();
    // Salão do log exibido como chip (nome vindo da facet de shops).
    expect(screen.getByText('Barbearia Central', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('40 registros')).toBeInTheDocument();
    expect(screen.getByText('1–2 de 40 registros')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exportar CSV/ })).toBeEnabled();
  });

  it('lê filtros da URL e aplica novos filtros pelo formulário', async () => {
    renderPage('/master/audit?action=PATCH&page=3');

    await waitFor(() => {
      expect(adminAuditApi.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'PATCH', page: 3 })
      );
    });

    fireEvent.change(screen.getByPlaceholderText('Ação, recurso ou detalhes'), {
      target: { value: 'login' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Filtrar/ }));

    await waitFor(() => {
      expect(adminAuditApi.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'login', action: 'PATCH', page: 1 })
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
    await screen.findByText('PATCH /api/products/abc');

    fireEvent.click(screen.getByRole('button', { name: /Exportar CSV/ }));

    await waitFor(() => {
      expect(adminAuditApi.exportAuditLogsCsv).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'PATCH' })
      );
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('exibe painéis de alertas e sessões', async () => {
    renderPage();

    expect(await screen.findByText('Alertas sensíveis (24h)')).toBeInTheDocument();
    expect(screen.getByText('Sessões de acesso')).toBeInTheDocument();
    expect(await screen.findByText('ações sensíveis')).toBeInTheDocument();
    expect(await screen.findByText('Chrome em macOS')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
  });

  it('abre os detalhes legíveis e expande os dados técnicos somente quando solicitado', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Detalhes: Registro atualizado' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Detalhes do registro')).toBeInTheDocument();
    const technical = within(dialog).getByText('Dados técnicos').closest('details');
    expect(technical).not.toHaveAttribute('open');
    expect(within(dialog).getByText('Administrador')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByText('Dados técnicos'));
    expect(technical).toHaveAttribute('open');
    expect(within(dialog).getByText(/"fields": \[/)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar detalhes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('expande filtros e seleciona usuário e salão pelos controles pesquisáveis', async () => {
    renderPage();

    await screen.findByText('PATCH /api/products/abc');
    expect(screen.queryByRole('combobox', { name: 'Usuário' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    await userEvent.click(screen.getByRole('combobox', { name: 'Usuário' }));
    await userEvent.click(await screen.findByRole('option', { name: /Administrador/ }));
    await userEvent.click(screen.getByRole('combobox', { name: 'Salão' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Barbearia Central' }));
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar' }));

    await waitFor(() => {
      expect(adminAuditApi.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', shopId: 'b1', page: 1 })
      );
    });
  });

  it('mostra estado de erro com opção de tentar novamente', async () => {
    vi.mocked(adminAuditApi.getAuditLogs).mockRejectedValue(new Error('boom'));

    renderPage();

    expect(
      await screen.findByText('Não foi possível carregar os logs de auditoria.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => {
      expect(adminAuditApi.getAuditLogs).toHaveBeenCalledTimes(2);
    });
  });

  it('remove somente o filtro escolhido e volta à primeira página', async () => {
    renderPage('/master/audit?q=produto&action=PATCH&page=3');
    await screen.findByText('PATCH /api/products/abc');

    await userEvent.click(screen.getByRole('button', { name: 'Remover filtro Ação: PATCH' }));

    await waitFor(() =>
      expect(adminAuditApi.getAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({ q: 'produto', action: undefined, page: 1 })
      )
    );
    expect(
      screen.getByRole('button', { name: 'Remover filtro Busca: produto' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remover filtro Ação: PATCH' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Busca' })).toHaveFocus();
  });

  it('aplica o atalho Hoje usando o dia de Brasília e preserva a busca', async () => {
    renderPage('/master/audit?q=produto&page=2');
    await screen.findByText('PATCH /api/products/abc');
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    await userEvent.click(screen.getByRole('button', { name: 'Hoje' }));

    await waitFor(() =>
      expect(adminAuditApi.getAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({ q: 'produto', from: today, to: today, page: 1 })
      )
    );
  });

  it('não consulta um intervalo de datas invertido e explica o erro junto ao campo', async () => {
    renderPage();
    await screen.findByText('PATCH /api/products/abc');
    await userEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    fireEvent.change(screen.getByLabelText('De'), { target: { value: '2026-10-20' } });
    const endDate = screen.getByLabelText('Até');
    fireEvent.change(endDate, { target: { value: '2026-10-01' } });
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar' }));

    expect(
      await screen.findByText('A data final deve ser igual ou posterior à data inicial.', {
        selector: 'p',
      })
    ).toBeVisible();
    expect(endDate).toHaveAttribute('aria-invalid', 'true');
    expect(adminAuditApi.getAuditLogs).toHaveBeenCalledTimes(1);
  });

  it('oculta o CPF contextual na lista e nos dados técnicos do detalhe', async () => {
    const sensitiveLog = {
      ...response.data[0],
      id: 'block-1',
      action: 'BLOCK_ENTITY',
      resource: 'BlockedEntity',
      userId: '00000000-0000-0000-0000-000000000000',
      details: JSON.stringify({
        type: 'CPF',
        value: '12345678909',
        reason: 'Bloqueio preventivo de teste',
      }),
    };
    vi.mocked(adminAuditApi.getAuditLogs).mockResolvedValue({ ...response, data: [sensitiveLog] });
    renderPage();

    expect(await screen.findByText('Bloqueio preventivo de teste')).toBeInTheDocument();
    expect(screen.getByText('Sistema')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('12345678909');
    await userEvent.click(screen.getByRole('button', { name: 'Detalhes: Bloqueio registrado' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByText('Dados técnicos'));
    expect(dialog).not.toHaveTextContent('12345678909');
    expect(within(dialog).getByText(/"value": "•••••"/)).toBeVisible();
  });

  it('sinaliza a atualização, mantém o histórico anterior e desabilita a exportação enquanto carrega', async () => {
    let complete: ((value: AuditLogsResponse) => void) | undefined;
    vi.mocked(adminAuditApi.getAuditLogs)
      .mockResolvedValueOnce(response)
      .mockImplementationOnce(
        () =>
          new Promise<AuditLogsResponse>(resolve => {
            complete = resolve;
          })
      );
    renderPage();
    await screen.findByText('PATCH /api/products/abc');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Busca' }), 'novo filtro');
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar' }));

    expect(await screen.findByText('Atualizando registros…')).toBeInTheDocument();
    expect(screen.getByText('PATCH /api/products/abc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
    complete?.({ ...response, data: [], meta: { ...response.meta, total: 0, totalPages: 0 } });
    expect(await screen.findByText('Nenhum registro encontrado.')).toBeInTheDocument();
    expect(screen.queryByText('PATCH /api/products/abc')).not.toBeInTheDocument();
    expect(screen.queryByText('Atualizando registros…')).not.toBeInTheDocument();
  });

  it('identifica dados antigos após falha de atualização e remove o aviso ao tentar novamente', async () => {
    vi.mocked(adminAuditApi.getAuditLogs)
      .mockResolvedValueOnce(response)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ ...response, data: [response.data[1]] });
    renderPage();
    await screen.findByText('PATCH /api/products/abc');

    await userEvent.click(screen.getByRole('button', { name: 'Atualizar registros' }));
    expect(await screen.findByText('Os registros abaixo são da consulta anterior.')).toBeVisible();
    expect(screen.getByText('PATCH /api/products/abc')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() =>
      expect(
        screen.queryByText('Os registros abaixo são da consulta anterior.')
      ).not.toBeInTheDocument()
    );
    expect(screen.queryByText('PATCH /api/products/abc')).not.toBeInTheDocument();
    expect(screen.getByText('POST /api/auth/login')).toBeInTheDocument();
  });
});
