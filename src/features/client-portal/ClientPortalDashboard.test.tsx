import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ClientPortalDashboard } from './ClientPortalDashboard';
import { clientPortalApi } from '../../infra/clientPortalApi';

vi.mock('../../infra/clientPortalApi', () => ({
  clientPortalApi: {
    getMe: vi.fn(),
    getSalons: vi.fn(),
    getAppointments: vi.fn(),
    getBenefits: vi.fn(),
    unlinkSalon: vi.fn(),
    logout: vi.fn(),
  },
}));
const salon = {
  id: 'link-a',
  barbershopId: 'shop-a',
  barbershopName: 'Salão Aurora',
  status: 'CONFIRMED',
  marketingOptIn: true,
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clientPortalApi.getMe).mockResolvedValue({
    id: 'client',
    name: 'Ana',
    phone: '11999999999',
    phoneVerified: true,
  });
  vi.mocked(clientPortalApi.getSalons).mockResolvedValue([salon]);
  vi.mocked(clientPortalApi.getAppointments).mockResolvedValue([]);
  vi.mocked(clientPortalApi.getBenefits).mockResolvedValue([]);
  vi.mocked(clientPortalApi.unlinkSalon).mockResolvedValue({ success: true });
});

it('distinguishes a failed list from an empty one and retries without resetting the selected tab', async () => {
  vi.mocked(clientPortalApi.getBenefits).mockRejectedValueOnce(new Error('Sem conexão'));
  render(<ClientPortalDashboard />);
  fireEvent.click(await screen.findByRole('tab', { name: 'Benefícios' }));
  expect(await screen.findByText('Sem conexão')).toBeVisible();
  expect(screen.queryByText(/Nenhum benefício/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
  expect(await screen.findByText(/Nenhum benefício/)).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Benefícios' })).toHaveAttribute('aria-selected', 'true');
  expect(clientPortalApi.getMe).toHaveBeenCalledTimes(1);
});

it('allows cancellation before unlinking and retains the salon when the mutation fails', async () => {
  render(<ClientPortalDashboard />);
  fireEvent.click(await screen.findByRole('tab', { name: 'Meus salões' }));
  fireEvent.click(screen.getByRole('button', { name: 'Desvincular Salão Aurora' }));
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar' })
  );
  expect(clientPortalApi.unlinkSalon).not.toHaveBeenCalled();
  vi.mocked(clientPortalApi.unlinkSalon).mockRejectedValueOnce(new Error('Falha de rede'));
  fireEvent.click(screen.getByRole('button', { name: 'Desvincular Salão Aurora' }));
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Desvincular' })
  );
  expect(await screen.findByText('Falha de rede')).toBeVisible();
  expect(screen.getByText('Salão Aurora')).toBeVisible();
});

it('clears the selected salon after unlinking the final link', async () => {
  render(<ClientPortalDashboard />);
  fireEvent.click(await screen.findByRole('tab', { name: 'Meus salões' }));
  fireEvent.click(screen.getByRole('button', { name: 'Desvincular Salão Aurora' }));
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Desvincular' })
  );
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('tab', { name: 'Agenda' }));
  expect(await screen.findByText('Nenhum agendamento.')).toBeVisible();
  expect(clientPortalApi.getAppointments).toHaveBeenCalledTimes(1);
});
