/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CrmBackfillPanel } from './CrmBackfillPanel';
import { crmApi } from '../../infra/crmApi';
import { adminCrmApi, AdminCrmBackfillRun } from '../../infra/adminCrmApi';
const auth = vi.hoisted(() => ({ role: 'OWNER' }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ user: auth }) }));
vi.mock('../../infra/crmApi', () => ({ crmApi: { backfillRuns: vi.fn(), backfill: vi.fn(), backfillAll: vi.fn() } }));
vi.mock('../../infra/adminCrmApi', () => ({ adminCrmApi: { backfillRuns: vi.fn() } }));

const run = { id: '1', barbershopId: 'shop', status: 'SUCCEEDED', linkedRecords: 2, createdEvents: 3, totalEvents: 5, startedAt: '2026-09-13T10:00:00Z', completedAt: null, error: null };

const adminRun = (overrides: Partial<AdminCrmBackfillRun> = {}): AdminCrmBackfillRun => ({
  id: 'run-1',
  barbershopId: 'shop-1',
  barbershopName: 'Barbearia Central',
  version: 'v2',
  status: 'SUCCEEDED',
  scope: 'GLOBAL',
  linkedRecords: 10,
  createdEvents: 4,
  totalEvents: 14,
  error: null,
  startedAt: '2026-09-13T10:00:00Z',
  completedAt: '2026-09-13T10:05:00Z',
  triggeredBy: { id: 'user-1', name: 'Ana Master', email: 'ana@agendai.com' },
  ...overrides,
});

const adminResponse = (data: AdminCrmBackfillRun[], meta: Partial<{ total: number; page: number; limit: number; totalPages: number; running: number; runningGlobal: number }> = {}) => ({
  success: true,
  data,
  meta: { total: data.length, page: 1, limit: 10, totalPages: 1, running: 0, runningGlobal: 0, ...meta },
});

beforeEach(() => {
  vi.clearAllMocks();
  auth.role = 'OWNER';
  vi.mocked(crmApi.backfillRuns).mockResolvedValue([]);
  vi.mocked(adminCrmApi.backfillRuns).mockResolvedValue(adminResponse([]));
});

it.each(['OWNER', 'EMPLOYEE', 'CLIENT'])('hides global actions for %s', role => {
  auth.role = role;
  const { container } = render(<CrmBackfillPanel global />);
  expect(container).toBeEmptyDOMElement();
  expect(crmApi.backfillRuns).not.toHaveBeenCalled();
  expect(adminCrmApi.backfillRuns).not.toHaveBeenCalled();
});
it('hides salon maintenance from employees', () => {
  auth.role = 'EMPLOYEE';
  const { container } = render(<CrmBackfillPanel />);
  expect(container).toBeEmptyDOMElement();
});
it('shows translated history, counts and errors', async () => {
  vi.mocked(crmApi.backfillRuns).mockResolvedValue([run, { ...run, id: '2', status: 'FAILED', error: 'Falha registrada' }, { ...run, id: '3', status: 'FUTURE' }]);
  render(<CrmBackfillPanel />);
  expect(await screen.findByText('Falha registrada')).toBeVisible();
  expect(screen.getByText(/Concluído/)).toBeVisible();
  expect(screen.getByText(/Status indisponível/)).toBeVisible();
  expect(screen.queryByText('FAILED')).not.toBeInTheDocument();
});
it('refreshes history even if execution fails and permits retry', async () => {
  vi.mocked(crmApi.backfill).mockRejectedValue(new Error('Serviço indisponível'));
  render(<CrmBackfillPanel />);
  const button = screen.getByRole('button', { name: 'Reprocessar histórico do salão' });
  expect(button).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Digite REPROCESSAR para confirmar'), { target: { value: 'REPROCESSAR' } });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(await screen.findByText('Serviço indisponível')).toBeVisible();
  await waitFor(() => expect(crmApi.backfillRuns).toHaveBeenCalledTimes(2));
  expect(button).toBeEnabled();
});
it('requires explicit global confirmation and summarizes partial failures', async () => {
  auth.role = 'MASTER_ADMIN';
  vi.mocked(crmApi.backfillAll).mockResolvedValue([{ barbershopId: 'a', run }, { barbershopId: 'b', error: 'Falha no salão' }]);
  render(<CrmBackfillPanel global />);
  const button = screen.getByRole('button', { name: 'Reprocessar todos os salões ativos' });
  expect(button).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Digite REPROCESSAR para confirmar'), { target: { value: 'REPROCESSAR' } });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(await screen.findByText('2 salões · 1 concluídos · 1 falhas')).toBeVisible();
  expect(screen.getByText('Falha no salão')).toBeVisible();
  expect(crmApi.backfillAll).toHaveBeenCalledTimes(1);
});

describe('master history', () => {
  it('lists paginated runs with scope, shop and trigger user', async () => {
    auth.role = 'MASTER_ADMIN';
    vi.mocked(adminCrmApi.backfillRuns).mockResolvedValue(
      adminResponse([adminRun(), adminRun({ id: 'run-2', status: 'FAILED', scope: 'TENANT', barbershopName: 'Studio Luz', error: 'Timeout no salão' })], {
        total: 12,
        page: 1,
        totalPages: 2,
      }),
    );

    render(<CrmBackfillPanel global />);

    expect(await screen.findByText('Barbearia Central')).toBeVisible();
    expect(screen.getByText('Studio Luz')).toBeVisible();
    expect(screen.getAllByText('Ana Master')).toHaveLength(2);
    expect(screen.getAllByText('Global').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Salão').length).toBeGreaterThan(0);
    expect(screen.getByText(/12 execução\(ões\) · página 1 de 2/)).toBeVisible();
    expect(adminCrmApi.backfillRuns).toHaveBeenCalledWith({ page: 1, limit: 10, status: undefined, scope: undefined });
  });

  it('refetches with status and scope filters and resets to first page', async () => {
    auth.role = 'MASTER_ADMIN';
    vi.mocked(adminCrmApi.backfillRuns).mockResolvedValue(adminResponse([adminRun()], { total: 11, totalPages: 2 }));

    render(<CrmBackfillPanel global />);
    await screen.findByText('Barbearia Central');

    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    await waitFor(() => expect(adminCrmApi.backfillRuns).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })));

    fireEvent.change(screen.getByLabelText('Filtrar por status'), { target: { value: 'FAILED' } });
    await waitFor(() => expect(adminCrmApi.backfillRuns).toHaveBeenCalledWith(expect.objectContaining({ page: 1, status: 'FAILED' })));

    fireEvent.change(screen.getByLabelText('Filtrar por escopo'), { target: { value: 'GLOBAL' } });
    await waitFor(() => expect(adminCrmApi.backfillRuns).toHaveBeenCalledWith(expect.objectContaining({ page: 1, status: 'FAILED', scope: 'GLOBAL' })));
  });

  it('expands the run detail with completion date and error', async () => {
    auth.role = 'MASTER_ADMIN';
    vi.mocked(adminCrmApi.backfillRuns).mockResolvedValue(adminResponse([adminRun({ status: 'FAILED', error: 'Falha registrada' })]));

    render(<CrmBackfillPanel global />);
    await screen.findByText('Barbearia Central');

    expect(screen.queryByText('Falha registrada')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));

    expect(await screen.findByText('Falha registrada')).toBeVisible();
    expect(screen.getByText(/Versão: v2/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ocultar' })).toBeVisible();
  });

  it('blocks the trigger while a global run is in progress', async () => {
    auth.role = 'MASTER_ADMIN';
    vi.mocked(adminCrmApi.backfillRuns).mockResolvedValue(adminResponse([adminRun({ status: 'RUNNING', scope: 'GLOBAL' })], { runningGlobal: 1 }));

    render(<CrmBackfillPanel global />);

    expect(await screen.findByText(/Há um reprocessamento em andamento/)).toBeVisible();
    const button = screen.getByRole('button', { name: 'Reprocessamento em andamento…' });
    fireEvent.change(screen.getByLabelText('Digite REPROCESSAR para confirmar'), { target: { value: 'REPROCESSAR' } });
    await waitFor(() => expect(button).toBeDisabled());
    expect(crmApi.backfillAll).not.toHaveBeenCalled();
  });

  it('shows an empty state when there are no runs', async () => {
    auth.role = 'MASTER_ADMIN';
    render(<CrmBackfillPanel global />);

    expect(await screen.findByText('Nenhuma execução registrada')).toBeVisible();
  });
});
