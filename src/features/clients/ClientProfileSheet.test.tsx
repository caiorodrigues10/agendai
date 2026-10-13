/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ClientProfileSheet } from './ClientProfileSheet';
import { BarbershopContext } from '../../contexts/BarbershopContext';
import { clientsApi } from '../../infra/clientsApi';
import { crmApi } from '../../infra/crmApi';
import { packagesApi } from '../../infra/packagesApi';
import type { BusinessSegment } from '../../shared/segments';

vi.mock('../../infra/clientsApi', () => ({
  clientsApi: { get: vi.fn(), listPets: vi.fn(), listVehicles: vi.fn() },
}));
vi.mock('../../infra/crmApi', () => ({ crmApi: { profile: vi.fn() } }));
vi.mock('../../infra/packagesApi', () => ({ packagesApi: { listCatalog: vi.fn() } }));

const clientId = '10000000-0000-4000-8000-000000000001';

const client = {
  id: clientId,
  barbershopId: '30000000-0000-4000-8000-000000000001',
  name: 'João',
  whatsapp: '11999999999',
  notes: null,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clientsApi.get).mockResolvedValue(client as never);
  vi.mocked(crmApi.profile).mockResolvedValue(null);
  vi.mocked(packagesApi.listCatalog).mockResolvedValue([]);
});

function wrapperFor(businessSegment: BusinessSegment) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BarbershopContext.Provider value={{ settings: { businessSegment } } as never}>
        {children}
      </BarbershopContext.Provider>
    );
  };
}

function renderSheet(businessSegment?: BusinessSegment) {
  return render(
    <ClientProfileSheet
      clientId={clientId}
      onClose={() => undefined}
      services={[]}
      staff={[]}
      settings={{} as never}
      canCancelSale={false}
      canAnalytics={false}
      onUpdated={() => undefined}
    />,
    businessSegment ? { wrapper: wrapperFor(businessSegment) } : undefined
  );
}

async function assertTabs(hasPets: boolean, hasVehicles: boolean) {
  await waitFor(() => expect(screen.getByRole('button', { name: 'Geral' })).toBeVisible());
  expect(screen.getByRole('button', { name: 'Pacotes' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Histórico' })).toBeVisible();
  expect(Boolean(screen.queryByRole('button', { name: 'Pets' }))).toBe(hasPets);
  expect(Boolean(screen.queryByRole('button', { name: 'Veículos' }))).toBe(hasVehicles);
}

it('app genérico (OTHER, sem salão no contexto) não mostra aba Pets nem Veículos', async () => {
  renderSheet();
  await assertTabs(false, false);
});

it('OTHER explícito também fica sem aba auxiliar', async () => {
  renderSheet('OTHER');
  await assertTabs(false, false);
});

it('PETSHOP e VETERINARY mostram só a aba Pets', async () => {
  renderSheet('PETSHOP');
  await assertTabs(true, false);
});

it('VETERINARY tem a aba Pets (mesmo auxílio do petshop)', async () => {
  renderSheet('VETERINARY');
  await assertTabs(true, false);
});

it('CAR_WASH mostra só a aba Veículos', async () => {
  renderSheet('CAR_WASH');
  await assertTabs(false, true);
});

it('AUTO_REPAIR tem a aba Veículos (mesmo auxílio do lava jato)', async () => {
  renderSheet('AUTO_REPAIR');
  await assertTabs(false, true);
});
