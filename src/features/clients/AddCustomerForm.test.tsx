/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AddCustomerForm } from './AddCustomerForm';
import { clientsApi, ClientPet } from '../../infra/clientsApi';
import { Service } from '../../types';

vi.mock('../../infra/clientsApi', () => ({
  clientsApi: {
    list: vi.fn(),
    listPets: vi.fn(),
  },
}));

const service = { id: '30000000-0000-4000-8000-000000000001', name: 'Banho', price: 60, avgTimeMinutes: 45, icon: 'scissors', active: true } as Service;
const clientId = '10000000-0000-4000-8000-000000000001';
const petId = '20000000-0000-4000-8000-000000000001';

const rex: ClientPet = {
  id: petId,
  barbershopId: '40000000-0000-4000-8000-000000000001',
  clientId,
  name: 'Rex',
  species: 'DOG',
  breed: null,
  size: null,
  coat: null,
  notes: null,
  active: true,
  createdAt: '2026-10-12T10:00:00.000Z',
  updatedAt: '2026-10-12T10:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

it('envia petId escolhido no onJoin (staff + petshop)', async () => {
  vi.mocked(clientsApi.list).mockResolvedValue({
    data: [{ id: clientId, name: 'Tutor', whatsapp: '11999990211' }],
    meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
  } as Awaited<ReturnType<typeof clientsApi.list>>);
  vi.mocked(clientsApi.listPets).mockResolvedValue([rex]);
  const onJoin = vi.fn().mockResolvedValue(undefined);

  render(<AddCustomerForm services={[service]} onJoin={onJoin} onCancel={vi.fn()} isStaffMode showPetSelector />);

  fireEvent.change(screen.getByPlaceholderText('Ex: João Silva'), { target: { value: 'Tutor' } });
  fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), { target: { value: '11999990211' } });

  const petButton = await screen.findByRole('button', { name: 'Rex' }, { timeout: 2000 });
  fireEvent.click(petButton);
  fireEvent.click(screen.getByRole('button', { name: /Adicionar à Fila/ }));

  await waitFor(() =>
    expect(onJoin).toHaveBeenCalledWith('Tutor', '11999990211', service.id, true, petId)
  );
});

it('não mostra seletor de pet sem showPetSelector', async () => {
  vi.mocked(clientsApi.list).mockResolvedValue({
    data: [{ id: clientId, name: 'Tutor', whatsapp: '11999990211' }],
    meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
  } as Awaited<ReturnType<typeof clientsApi.list>>);
  vi.mocked(clientsApi.listPets).mockResolvedValue([rex]);

  render(<AddCustomerForm services={[service]} onJoin={vi.fn()} onCancel={vi.fn()} isStaffMode />);

  fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), { target: { value: '11999990211' } });
  await waitFor(() => expect(clientsApi.list).not.toHaveBeenCalled());
  expect(screen.queryByRole('button', { name: 'Rex' })).toBeNull();
});
