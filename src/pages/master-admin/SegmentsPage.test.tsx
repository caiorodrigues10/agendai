/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { SegmentsPage } from './SegmentsPage';
import { adminInternalApi, SegmentCatalogItem } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: { getSegments: vi.fn() },
}));

const catalog: SegmentCatalogItem[] = [
  {
    segment: 'BARBERSHOP',
    group: 'beauty',
    label: 'Barbearia',
    features: [],
    advertisingRestricted: false,
    auxiliaryProfile: null,
    hiddenModules: [],
    visibleModules: ['products', 'equipment', 'commissions', 'tip'],
    hiddenTabs: [],
    shops: 12,
  },
  {
    segment: 'LAW_FIRM',
    group: 'professional',
    label: 'Escritório de advocacia',
    features: ['caseManagement'],
    advertisingRestricted: true,
    auxiliaryProfile: null,
    hiddenModules: ['products', 'equipment', 'commissions', 'tip'],
    visibleModules: [],
    hiddenTabs: ['marketing'],
    shops: 3,
  },
];

const response = (data: SegmentCatalogItem[]) => ({
  success: true,
  data,
  meta: { total: data.length, shops: data.reduce((sum, item) => sum + item.shops, 0) },
});

describe('SegmentsPage', () => {
  afterEach(() => vi.clearAllMocks());

  it('exibe o catálogo com contagem de salões, módulos e features', async () => {
    vi.mocked(adminInternalApi.getSegments).mockResolvedValue(response(catalog) as never);

    render(<SegmentsPage />);

    expect(await screen.findByText('Barbearia')).toBeInTheDocument();
    expect(screen.getByText('Escritório de advocacia')).toBeInTheDocument();
    expect(screen.getByText('2 segmentos · 15 salão(ões)')).toBeInTheDocument();
    expect(screen.getByText('12 salão(ões)')).toBeInTheDocument();
    expect(screen.getByText(/Produtos, Equipamento, Comissões, Gorjeta/)).toBeInTheDocument();
    expect(screen.getByText('Publicidade restrita')).toBeInTheDocument();
    expect(screen.getByText(/Gestão de processos/)).toBeInTheDocument();
  });

  it('filtra o catálogo pela busca e mostra estado vazio', async () => {
    vi.mocked(adminInternalApi.getSegments).mockResolvedValue(response(catalog) as never);

    render(<SegmentsPage />);
    await screen.findByText('Barbearia');

    fireEvent.change(screen.getByLabelText('Buscar segmento'), { target: { value: 'advocacia' } });

    expect(screen.getByText('Escritório de advocacia')).toBeInTheDocument();
    expect(screen.queryByText('Barbearia')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar segmento'), { target: { value: 'inexistente' } });

    expect(screen.getByText('Nenhum segmento encontrado')).toBeInTheDocument();
  });

  it('mostra erro com opção de tentar novamente', async () => {
    vi.mocked(adminInternalApi.getSegments).mockRejectedValue(new Error('Falha ao carregar catálogo'));

    render(<SegmentsPage />);

    expect(await screen.findByText('Falha ao carregar catálogo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(adminInternalApi.getSegments).toHaveBeenCalledTimes(2);
  });
});
