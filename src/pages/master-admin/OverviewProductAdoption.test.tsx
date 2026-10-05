/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OverviewProductAdoption } from './OverviewProductAdoption';
import { adminInternalApi, ProductAdoption } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: { getProductAdoption: vi.fn() },
}));

const adoption: ProductAdoption = {
  generatedAt: new Date().toISOString(),
  catalog: {
    shopsTotal: 4,
    shopsWithCatalog: 3,
    adoptionPct: 75,
    productsActive: 32,
    productsInactive: 2,
    categoriesTotal: 14,
    lowStock: 3,
    outOfStock: 1,
  },
  sales30d: { units: 12, revenue: 349.9 },
  topProducts: [
    { productId: 'p1', name: 'Pomada Modeladora', units: 10, revenue: 250 },
    { productId: 'p2', name: 'Óleo Barber', units: 2, revenue: 99.9 },
  ],
  topCategories: [
    { categoryId: 'c1', name: 'Cabelo', products: 18 },
    { categoryId: null, name: 'Sem categoria', products: 31 },
  ],
};

describe('OverviewProductAdoption', () => {
  beforeEach(() => {
    vi.mocked(adminInternalApi.getProductAdoption).mockResolvedValue({
      success: true,
      data: adoption,
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('exibe KPIs de adoção, estoque e top produtos', async () => {
    render(<OverviewProductAdoption />);

    expect(await screen.findByText('Adoção do catálogo')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('3 de 4 salões com produtos')).toBeInTheDocument();
    expect(screen.getByText('R$ 349,90')).toBeInTheDocument();
    expect(screen.getByText('12 unidades vendidas')).toBeInTheDocument();
    expect(screen.getByText('Pomada Modeladora')).toBeInTheDocument();
    expect(screen.getByText('Sem categoria')).toBeInTheDocument();
    expect(adminInternalApi.getProductAdoption).toHaveBeenCalledTimes(1);
  });

  it('mostra estados vazios quando não há vendas nem categorias', async () => {
    vi.mocked(adminInternalApi.getProductAdoption).mockResolvedValue({
      success: true,
      data: {
        ...adoption,
        sales30d: { units: 0, revenue: 0 },
        topProducts: [],
        topCategories: [],
      },
    } as never);

    render(<OverviewProductAdoption />);

    expect(
      await screen.findByText('Nenhuma venda de produto concluída até o momento.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Nenhuma categoria cadastrada até o momento.')).toBeInTheDocument();
  });

  it('mostra estado de erro com opção de tentar novamente', async () => {
    vi.mocked(adminInternalApi.getProductAdoption).mockRejectedValue(new Error('boom'));

    render(<OverviewProductAdoption />);

    expect(
      await screen.findByText('Não foi possível carregar a adoção de produtos.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => {
      expect(adminInternalApi.getProductAdoption).toHaveBeenCalledTimes(2);
    });
  });
});
