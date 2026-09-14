import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CrmMergePanel } from './CrmMergePanel';
import { CrmMergeSchema } from '../../schemas';
import { crmApi } from '../../infra/crmApi';
import { clientsApi } from '../../infra/clientsApi';
vi.mock('../../infra/crmApi', () => ({ crmApi: { mergeClients: vi.fn() } }));
vi.mock('../../infra/clientsApi', () => ({ clientsApi: { list: vi.fn() } }));
const targetId = '10000000-0000-4000-8000-000000000001';
const sourceId = '10000000-0000-4000-8000-000000000002';
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clientsApi.list).mockResolvedValue({ data: [{ id: targetId, name: 'Ana Principal', whatsapp: '11999999999' }, { id: sourceId, name: 'Ana Duplicada', whatsapp: '11888888888' }], meta: { total: 2, page: 1, limit: 50, totalPages: 1 } } as Awaited<ReturnType<typeof clientsApi.list>>);
  vi.mocked(crmApi.mergeClients).mockResolvedValue(undefined);
});
it('rejects missing, repeated, overlapping or unconfirmed selections', () => {
  for (const sourceIds of [[], [targetId], [sourceId, sourceId]]) expect(CrmMergeSchema.safeParse({ targetId, sourceIds, confirmation: 'MESCLAR' }).success).toBe(false);
  expect(CrmMergeSchema.safeParse({ targetId, sourceIds: [sourceId], confirmation: '' }).success).toBe(false);
});
async function selectClients() {
  await waitFor(() => expect(clientsApi.list).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('combobox', { name: 'Cadastro principal' }));
  fireEvent.click(await screen.findByRole('option', { name: /Ana Principal/ }));
  fireEvent.click(screen.getByRole('combobox', { name: 'Cadastros duplicados' }));
  fireEvent.click(await screen.findByRole('option', { name: /Ana Duplicada/ }));
  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.change(screen.getByLabelText('Digite MESCLAR para confirmar'), { target: { value: 'MESCLAR' } });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Mesclar cadastros' })).toBeEnabled());
}
it('previews the selection and refreshes the surviving profile after merge', async () => {
  const onMerged = vi.fn();
  render(<CrmMergePanel onMerged={onMerged} />);
  expect(screen.getByRole('button', { name: 'Mesclar cadastros' })).toBeDisabled();
  await selectClients();
  expect(screen.getByText('Remover 1 cadastro(s):')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Mesclar cadastros' }));
  await waitFor(() => expect(onMerged).toHaveBeenCalledWith(targetId));
  expect(crmApi.mergeClients).toHaveBeenCalledWith({ targetId, sourceIds: [sourceId] });
});
it('retains selections and shows execution errors without refreshing', async () => {
  vi.mocked(crmApi.mergeClients).mockRejectedValue(new Error('Cliente indisponível no salão'));
  const onMerged = vi.fn();
  render(<CrmMergePanel onMerged={onMerged} />);
  await selectClients();
  fireEvent.click(screen.getByRole('button', { name: 'Mesclar cadastros' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Cliente indisponível no salão');
  expect(onMerged).not.toHaveBeenCalled();
  expect(screen.getByText('Remover 1 cadastro(s):')).toBeVisible();
});
