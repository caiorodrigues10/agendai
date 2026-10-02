/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CrmBackfillPanel } from './CrmBackfillPanel';
import { crmApi } from '../../infra/crmApi';
const auth = vi.hoisted(() => ({ role: 'OWNER' }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ user: auth }) }));
vi.mock('../../infra/crmApi', () => ({ crmApi: { backfillRuns: vi.fn(), backfill: vi.fn(), backfillAll: vi.fn() } }));
const run = { id: '1', barbershopId: 'shop', status: 'SUCCEEDED', linkedRecords: 2, createdEvents: 3, totalEvents: 5, startedAt: '2026-09-13T10:00:00Z', completedAt: null, error: null };
beforeEach(() => { vi.clearAllMocks(); auth.role = 'OWNER'; vi.mocked(crmApi.backfillRuns).mockResolvedValue([]); });
it.each(['OWNER', 'EMPLOYEE', 'CLIENT'])('hides global actions for %s', role => {
  auth.role = role;
  const { container } = render(<CrmBackfillPanel global />);
  expect(container).toBeEmptyDOMElement();
  expect(crmApi.backfillRuns).not.toHaveBeenCalled();
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
