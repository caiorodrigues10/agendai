import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { OrganizationsPanel } from './OrganizationsPanel';
import { organizationsApi } from '@/infra/organizationsApi';
vi.mock('@/infra/organizationsApi', () => ({
  organizationsApi: { listMy: vi.fn(), create: vi.fn(), delete: vi.fn() },
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(organizationsApi.listMy).mockResolvedValue([]);
});
it('validates fields and preserves values after a failed creation', async () => {
  vi.mocked(organizationsApi.create).mockRejectedValue(new Error('Identificador já utilizado'));
  render(<OrganizationsPanel />);
  fireEvent.click(await screen.findByRole('button', { name: 'Nova organização' }));
  fireEvent.click(screen.getByRole('button', { name: 'Criar organização' }));
  expect(await screen.findByText('Informe o nome da organização')).toBeVisible();
  expect(organizationsApi.create).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/^Nome da organização/), { target: { value: 'Aurora' } });
  fireEvent.change(screen.getByLabelText(/Identificador/), { target: { value: 'aurora' } });
  fireEvent.click(screen.getByRole('button', { name: 'Criar organização' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Identificador já utilizado');
  expect(screen.getByLabelText(/^Nome da organização/)).toHaveValue('Aurora');
  expect(organizationsApi.create).toHaveBeenCalledWith({
    name: 'Aurora',
    slug: 'aurora',
    logoUrl: undefined,
  });
});
it('offers retry instead of showing an empty list after a load failure', async () => {
  vi.mocked(organizationsApi.listMy).mockRejectedValueOnce(new Error('Falha ao carregar'));
  render(<OrganizationsPanel />);
  fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
  await waitFor(() =>
    expect(screen.getByText('Sua primeira organização começa aqui')).toBeVisible()
  );
});

