/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ClientPetsPanel } from './ClientPetsPanel';
import { clientsApi, ClientPet } from '../../infra/clientsApi';

vi.mock('../../infra/clientsApi', () => ({
  clientsApi: {
    listPets: vi.fn(),
    createPet: vi.fn(),
    updatePet: vi.fn(),
    deletePet: vi.fn(),
  },
}));

const clientId = '10000000-0000-4000-8000-000000000001';
const petId = '20000000-0000-4000-8000-000000000001';

function pet(overrides: Partial<ClientPet> = {}): ClientPet {
  return {
    id: petId,
    barbershopId: '30000000-0000-4000-8000-000000000001',
    clientId,
    name: 'Rex',
    species: 'DOG',
    breed: 'Labrador',
    size: 'LARGE',
    coat: 'curta',
    notes: null,
    active: true,
    createdAt: '2026-10-12T10:00:00.000Z',
    updatedAt: '2026-10-12T10:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clientsApi.listPets).mockResolvedValue([]);
});

it('lista os pets do cliente', async () => {
  vi.mocked(clientsApi.listPets).mockResolvedValue([pet()]);
  render(<ClientPetsPanel clientId={clientId} />);
  await waitFor(() => expect(clientsApi.listPets).toHaveBeenCalledWith(clientId));
  expect(await screen.findByText('Rex')).toBeVisible();
  expect(screen.getByText(/Cachorro · Labrador · Grande/)).toBeVisible();
});

it('cria um pet com os campos do formulário', async () => {
  const onChanged = vi.fn();
  vi.mocked(clientsApi.createPet).mockResolvedValue(pet({ name: 'Thor' }));
  render(<ClientPetsPanel clientId={clientId} onChanged={onChanged} />);

  fireEvent.click(screen.getByRole('button', { name: /Novo/ }));
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Thor' } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

  await waitFor(() =>
    expect(clientsApi.createPet).toHaveBeenCalledWith(clientId, expect.objectContaining({ name: 'Thor', species: 'DOG' }))
  );
  expect(onChanged).toHaveBeenCalled();
});

it('edita um pet existente', async () => {
  vi.mocked(clientsApi.listPets).mockResolvedValue([pet()]);
  vi.mocked(clientsApi.updatePet).mockResolvedValue(pet({ name: 'Rex Jr' }));
  render(<ClientPetsPanel clientId={clientId} />);

  fireEvent.click(await screen.findByRole('button', { name: 'Editar Rex' }));
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Rex Jr' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

  await waitFor(() =>
    expect(clientsApi.updatePet).toHaveBeenCalledWith(clientId, petId, expect.objectContaining({ name: 'Rex Jr' }))
  );
});

it('remove um pet após confirmação', async () => {
  vi.mocked(clientsApi.listPets).mockResolvedValue([pet()]);
  vi.mocked(clientsApi.deletePet).mockResolvedValue(undefined);
  render(<ClientPetsPanel clientId={clientId} />);

  fireEvent.click(await screen.findByRole('button', { name: 'Remover Rex' }));
  expect(screen.getByText(/mantido/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Remover' }));

  await waitFor(() => expect(clientsApi.deletePet).toHaveBeenCalledWith(clientId, petId));
});

it('mostra estado vazio quando não há pets', async () => {
  render(<ClientPetsPanel clientId={clientId} />);
  expect(await screen.findByText('Nenhum pet cadastrado ainda.')).toBeVisible();
});
