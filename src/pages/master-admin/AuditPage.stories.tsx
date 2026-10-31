import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { AuditPage } from './AuditPage';
import type { AuditAlerts, AuditFacets, AuditLogsResponse } from '../../infra/adminAuditApi';
import type { AdminSession } from '../../infra/adminSessionsApi';

const facets: AuditFacets = {
  resources: ['products', 'auth', 'BlockedEntity', 'users'],
  users: [{ id: 'user-1', name: 'Administrador', email: 'admin@agendai.local' }],
  shops: [{ id: 'b1', name: 'Barbearia Central' }],
};

const alerts: AuditAlerts = {
  generatedAt: '2026-10-01T11:00:00.000Z',
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
      createdAt: '2026-10-01T11:00:00.000Z',
    },
  ],
};

const sessions: {
  success: true;
  data: AdminSession[];
  meta: { total: number; page: number; limit: number; totalPages: number };
} = {
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
      createdAt: '2026-10-01T11:00:00.000Z',
      lastSeenAt: '2026-10-01T11:55:00.000Z',
      expiresAt: '2026-10-02T11:00:00.000Z',
      status: 'active',
      revokedAt: null,
      revokedReason: null,
      current: true,
    },
  ],
  meta: { total: 1, page: 1, limit: 8, totalPages: 1 },
};

const auditLogs: AuditLogsResponse = {
  success: true,
  data: [
    {
      id: 'log-block',
      userId: '00000000-0000-0000-0000-000000000000',
      action: 'BLOCK_ENTITY',
      resource: 'BlockedEntity',
      resourceId: 'block-synthetic',
      details: JSON.stringify({
        type: 'CPF',
        value: '12345678909',
        reason: 'Assinatura encerrada sem renovação. Bloqueio preventivo registrado pelo sistema.',
        barbershopId: 'b1',
      }),
      ipAddress: null,
      barbershopId: 'b1',
      createdAt: '2026-10-01T10:38:56.000Z',
    },
    {
      id: 'log-1',
      userId: 'user-1',
      action: 'PATCH /api/products/abc',
      resource: 'products',
      resourceId: 'abc',
      details: '{"fields":["active"]}',
      ipAddress: '192.168.0.1',
      barbershopId: 'b1',
      createdAt: '2026-10-01T04:28:54.763Z',
    },
    {
      id: 'log-2',
      userId: 'user-2',
      action: 'POST /api/auth/login',
      resource: 'auth',
      resourceId: null,
      details: null,
      ipAddress: null,
      createdAt: '2026-09-30T10:00:00.000Z',
    },
    {
      id: 'log-3',
      userId: 'user-1',
      action: 'DELETE /api/admin/users/usr-9',
      resource: 'users',
      resourceId: 'usr-9',
      details: '{"reason":"conta duplicada"}',
      ipAddress: '192.168.0.1',
      createdAt: '2026-09-29T18:30:00.000Z',
    },
  ],
  meta: { total: 40, page: 1, limit: 25, totalPages: 2 },
};

const facetsHandler = http.get('/api/admin/audit-logs/facets', () =>
  HttpResponse.json({ success: true, data: facets })
);
const logsHandler = http.get('/api/admin/audit-logs', () => HttpResponse.json(auditLogs));
const alertsHandler = http.get('/api/admin/audit-logs/alerts', () =>
  HttpResponse.json({ success: true, data: alerts })
);
const sessionsHandler = http.get('/api/admin/sessions', () => HttpResponse.json(sessions));

/** Todos os endpoints que a página carrega no mount. */
const mswHandlers = [facetsHandler, logsHandler, alertsHandler, sessionsHandler];

const meta = {
  title: 'MasterAdmin/AuditPage',
  component: AuditPage,
  tags: ['autodocs', 'test'],
  decorators: [
    (Story, context) => (
      <MemoryRouter initialEntries={[context.parameters.auditUrl ?? '/master/audit']}>
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof AuditPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Página carregada: lista de logs, facets, alertas e sessões respondem com sucesso. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('PATCH /api/products/abc', {}, { timeout: 10000 });
    await canvas.findByText('POST /api/auth/login', {}, { timeout: 10000 });
    await canvas.findByText('40 registros', {}, { timeout: 10000 });
    await canvas.findByText('ações sensíveis', {}, { timeout: 10000 });
    await canvas.findByText('Chrome em macOS', {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: 'Detalhes: Bloqueio registrado' });
    await expect(canvasElement).not.toHaveTextContent('12345678909');
  },
};

/**
 * `GET /api/admin/audit-logs/export` → 500 `{ success: false, message }`.
 * O banner `exportError` aparece logo abaixo do cabeçalho (AuditHeader),
 * acima dos painéis de alertas/sessões.
 */
export const ErroExportar: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.get('/api/admin/audit-logs/export', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível exportar os registros.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('PATCH /api/products/abc', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: /Exportar CSV/ }, { timeout: 10000 })
    );
    await canvas.findByText(/Não foi possível exportar os registros/, {}, { timeout: 10000 });
  },
};

/** O estado sem alertas não ocupa a tela com blocos vazios. */
export const SemAlertas: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/admin/audit-logs/alerts', () =>
          HttpResponse.json({
            success: true,
            data: {
              ...alerts,
              total: 0,
              recent: [],
              byGroup: [
                { key: 'impersonation', label: 'Impersonation', count: 0 },
                { key: 'accounts', label: 'Contas', count: 0 },
                { key: 'deletions', label: 'Exclusões', count: 0 },
                { key: 'blocks', label: 'Bloqueios', count: 0 },
              ],
            },
          })
        ),
        ...mswHandlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Nenhuma ação sensível nas últimas 24 horas.');
  },
};

/** Um resultado vazio filtrado oferece orientação e uma saída visível. */
export const SemResultados: Story = {
  parameters: {
    auditUrl: '/master/audit?q=nenhum-evento',
    msw: {
      handlers: [
        http.get('/api/admin/audit-logs', () =>
          HttpResponse.json({
            ...auditLogs,
            data: [],
            meta: { total: 0, page: 1, limit: 25, totalPages: 0 },
          })
        ),
        ...mswHandlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Nenhum registro encontrado.');
    await canvas.findByRole('button', { name: 'Remover filtro Busca: nenhum-evento' });
  },
};

/** Filtros previamente aplicados ficam identificados e podem ser removidos individualmente. */
export const FiltrosAplicados: Story = {
  parameters: { auditUrl: '/master/audit?action=PATCH&shopId=b1' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('button', { name: 'Remover filtro Ação: PATCH' });
    await canvas.findByRole('button', { name: 'Remover filtro Salão: Barbearia Central' });
    await expect(canvas.getByRole('combobox', { name: 'Salão' })).toBeVisible();
  },
};
