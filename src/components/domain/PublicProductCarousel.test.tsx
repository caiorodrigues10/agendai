/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PublicProductCarousel } from './PublicProductCarousel';

const { mockList } = vi.hoisted(() => ({ mockList: vi.fn() }));
vi.mock('../../infra/publicProductsApi', () => ({
  publicProductsApi: { list: mockList },
}));

const product = (n: number, over: Record<string, unknown> = {}) => ({
  id: `p${n}`,
  name: `Produto ${n}`,
  description: `Descrição curta ${n}`,
  imageUrl: null,
  price: 30,
  unitLabel: 'un',
  category: null,
  available: 2,
  ...over,
});

const shop = { name: 'Salão Teste', address: null, city: null, whatsapp: '11999999999' };

function renderCarousel() {
  return render(
    <MemoryRouter>
      <PublicProductCarousel barbershopId="shop-1" />
    </MemoryRouter>
  );
}

describe('PublicProductCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza grade (sem scroll horizontal) com 1 a 3 produtos', async () => {
    mockList.mockResolvedValue({ shop, products: [product(1), product(2)] });
    const { container } = renderCarousel();

    await screen.findByRole('region', { name: 'Produtos para reserva' });
    expect(screen.getByRole('heading', { name: 'Produtos' })).toBeInTheDocument();
    expect(screen.getByText('Produto 1')).toBeInTheDocument();
    expect(screen.getByText('Produto 2')).toBeInTheDocument();
    expect(screen.getByText('Descrição curta 1')).toBeInTheDocument();
    expect(container.querySelector('.grid-cols-1')).not.toBeNull();
    expect(container.querySelector('.overflow-x-auto')).toBeNull();
  });

  it('mantém o carrossel com scroll horizontal a partir de 4 produtos', async () => {
    mockList.mockResolvedValue({
      shop,
      products: [product(1), product(2), product(3), product(4), product(5)],
    });
    const { container } = renderCarousel();

    await screen.findByRole('region', { name: 'Produtos para reserva' });
    expect(screen.getByText('Produto 5')).toBeInTheDocument();
    expect(container.querySelector('.overflow-x-auto')).not.toBeNull();
    expect(container.querySelector('.grid-cols-1')).toBeNull();
  });

  it('marca produto sem estoque como Esgotado', async () => {
    mockList.mockResolvedValue({
      shop,
      products: [product(1, { available: 0 }), product(2, { available: 4 })],
    });
    renderCarousel();

    await screen.findByRole('region', { name: 'Produtos para reserva' });
    expect(screen.getByText('Esgotado')).toBeInTheDocument();
    expect(screen.getByText(/4 disponível/)).toBeInTheDocument();
    expect(screen.queryByText('0 disponíveis')).toBeNull();
  });

  it('não renderiza a seção quando não há produtos', async () => {
    mockList.mockResolvedValue({ shop, products: [] });
    renderCarousel();

    await waitFor(() => expect(mockList).toHaveBeenCalledWith('shop-1'));
    expect(screen.queryByRole('region', { name: 'Produtos para reserva' })).toBeNull();
  });

  it('não derruba o perfil quando a resposta não contém uma lista de produtos', async () => {
    mockList.mockResolvedValue({ shop });
    renderCarousel();
    await waitFor(() => expect(mockList).toHaveBeenCalledWith('shop-1'));
    expect(screen.queryByRole('region', { name: 'Produtos para reserva' })).toBeNull();
  });

  it('esconde a seção e registra console.error quando a API falha', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const cause = new Error('boom');
    mockList.mockRejectedValue(cause);
    renderCarousel();

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(console.error).toHaveBeenCalledWith(
      '[PublicProductCarousel] falha ao carregar produtos públicos:',
      cause
    );
    expect(screen.queryByRole('region', { name: 'Produtos para reserva' })).toBeNull();
    errorSpy.mockRestore();
  });
});
