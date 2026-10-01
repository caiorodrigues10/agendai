/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PublicProductPage } from './PublicProductPage';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('../infra/publicProductsApi', () => ({
  publicProductsApi: { list: vi.fn(), get: mockGet, reserve: vi.fn() },
}));

const shop = { name: 'Salão Teste', address: 'Rua X, 100', city: null, whatsapp: '11999999999' };

const product = (available: number | null) => ({
  id: 'p1',
  name: 'Pomada modeladora',
  description: null,
  imageUrl: null,
  price: 30,
  unitLabel: 'un',
  category: null,
  available,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/queue/shop-1/produtos/p1']}>
      <Routes>
        <Route path="/queue/:id/produtos/:productId" element={<PublicProductPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PublicProductPage — produto esgotado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra o selo Esgotado e trava o botão de reservar', async () => {
    mockGet.mockResolvedValue({ shop, product: product(0) });
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Pomada modeladora' })
    ).toBeInTheDocument();
    expect(screen.getByText('Esgotado')).toBeInTheDocument();
    expect(screen.getByText(/sem estoque para reserva/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reservar produto' })).toBeDisabled();
  });

  it('reserva normalmente quando há disponível', async () => {
    mockGet.mockResolvedValue({ shop, product: product(3) });
    renderPage();

    await screen.findByRole('button', { name: 'Reservar produto' });
    expect(screen.queryByText('Esgotado')).toBeNull();
    expect(screen.getByRole('button', { name: 'Reservar produto' })).toBeEnabled();
    expect(screen.getByText(/Disponível: 3 un/)).toBeInTheDocument();
  });
});
