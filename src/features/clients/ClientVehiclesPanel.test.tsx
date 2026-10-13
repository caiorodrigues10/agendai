/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ClientVehiclesPanel, normalizePlate } from './ClientVehiclesPanel';
import { clientsApi, ClientVehicle } from '../../infra/clientsApi';

vi.mock('../../infra/clientsApi', () => ({
  clientsApi: {
    listVehicles: vi.fn(),
    createVehicle: vi.fn(),
    updateVehicle: vi.fn(),
    deleteVehicle: vi.fn(),
  },
}));

const clientId = '10000000-0000-4000-8000-000000000001';
const vehicleId = '20000000-0000-4000-8000-000000000002';

function vehicle(overrides: Partial<ClientVehicle> = {}): ClientVehicle {
  return {
    id: vehicleId,
    barbershopId: '30000000-0000-4000-8000-000000000001',
    clientId,
    plate: 'ABC1D23',
    vehicleModel: 'Honda CG 160',
    color: 'preto',
    notes: null,
    active: true,
    createdAt: '2026-10-13T10:00:00.000Z',
    updatedAt: '2026-10-13T10:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clientsApi.listVehicles).mockResolvedValue([]);
});

it('normaliza a placa como o backend faz (maiúscula, sem hífen)', () => {
  expect(normalizePlate(' abc-1d23 ')).toBe('ABC1D23');
});

it('lista os veículos do cliente', async () => {
  vi.mocked(clientsApi.listVehicles).mockResolvedValue([vehicle()]);
  render(<ClientVehiclesPanel clientId={clientId} />);
  await waitFor(() => expect(clientsApi.listVehicles).toHaveBeenCalledWith(clientId));
  expect(await screen.findByText('ABC1D23')).toBeVisible();
  expect(screen.getByText(/Honda CG 160 · preto/)).toBeVisible();
});

it('cria um veículo com a placa normalizada', async () => {
  const onChanged = vi.fn();
  vi.mocked(clientsApi.createVehicle).mockResolvedValue(vehicle({ plate: 'XYZ1A23' }));
  render(<ClientVehiclesPanel clientId={clientId} onChanged={onChanged} />);

  fireEvent.click(screen.getByRole('button', { name: /Novo/ }));
  fireEvent.change(screen.getByLabelText('Placa'), { target: { value: 'xyz-1a23' } });
  fireEvent.change(screen.getByLabelText('Marca e modelo'), { target: { value: 'Gol 1.6' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

  await waitFor(() =>
    expect(clientsApi.createVehicle).toHaveBeenCalledWith(
      clientId,
      expect.objectContaining({ plate: 'XYZ1A23', vehicleModel: 'Gol 1.6' })
    )
  );
  expect(onChanged).toHaveBeenCalled();
});

it('recusa placa inválida antes de chamar a API', async () => {
  render(<ClientVehiclesPanel clientId={clientId} />);

  fireEvent.click(screen.getByRole('button', { name: /Novo/ }));
  fireEvent.change(screen.getByLabelText('Placa'), { target: { value: '12' } });
  fireEvent.change(screen.getByLabelText('Marca e modelo'), { target: { value: 'Fiat Mobi' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

  expect(await screen.findByText(/Placa inválida/)).toBeVisible();
  expect(clientsApi.createVehicle).not.toHaveBeenCalled();
});

it('edita um veículo existente', async () => {
  vi.mocked(clientsApi.listVehicles).mockResolvedValue([vehicle()]);
  vi.mocked(clientsApi.updateVehicle).mockResolvedValue(vehicle({ color: 'branco' }));
  render(<ClientVehiclesPanel clientId={clientId} />);

  fireEvent.click(await screen.findByRole('button', { name: 'Editar ABC1D23' }));
  fireEvent.change(screen.getByLabelText('Cor'), { target: { value: 'branco' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

  await waitFor(() =>
    expect(clientsApi.updateVehicle).toHaveBeenCalledWith(
      clientId,
      vehicleId,
      expect.objectContaining({ color: 'branco' })
    )
  );
});

it('remove um veículo após confirmação', async () => {
  vi.mocked(clientsApi.listVehicles).mockResolvedValue([vehicle()]);
  vi.mocked(clientsApi.deleteVehicle).mockResolvedValue(undefined);
  render(<ClientVehiclesPanel clientId={clientId} />);

  fireEvent.click(await screen.findByRole('button', { name: 'Remover ABC1D23' }));
  expect(screen.getByText(/mantido/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Remover' }));

  await waitFor(() => expect(clientsApi.deleteVehicle).toHaveBeenCalledWith(clientId, vehicleId));
});

it('mostra estado vazio quando não há veículos', async () => {
  render(<ClientVehiclesPanel clientId={clientId} />);
  expect(await screen.findByText('Nenhum veículo cadastrado ainda.')).toBeVisible();
});
