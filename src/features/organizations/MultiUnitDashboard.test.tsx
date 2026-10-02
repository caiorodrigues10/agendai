/// <reference types="vitest/globals" />
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MultiUnitDashboard } from './MultiUnitDashboard';
import { organizationsApi, OrganizationDashboardShop } from '@/infra/organizationsApi';
import { useOrganizationDashboard } from '@/hooks/useOrganizationDashboard';

vi.mock('@/hooks/useOrganizationDashboard', () => ({ useOrganizationDashboard: vi.fn() }));
vi.mock('@/infra/organizationsApi', () => ({
  organizationsApi: { listAvailableBarbershops: vi.fn(), attachBarbershop: vi.fn(), detachBarbershop: vi.fn() },
}));

const hook = vi.mocked(useOrganizationDashboard);
const listAvailable = vi.mocked(organizationsApi.listAvailableBarbershops);
const attach = vi.mocked(organizationsApi.attachBarbershop);
const detach = vi.mocked(organizationsApi.detachBarbershop);

const refetch = vi.fn();

const fullShop: OrganizationDashboardShop = {
  barbershopId: 'b1',
  name: 'Salão Central',
  logoUrl: null,
  isOpen: true,
  accessLevel: 'FULL',
  liveNow: 4,
  waitingCount: 1,
  inServiceCount: 3,
  revenue: { today: 123.45, week: 500, month: 1998 },
};

const operationalShop: OrganizationDashboardShop = {
  barbershopId: 'b2',
  name: 'Salão Filial',
  logoUrl: null,
  isOpen: false,
  accessLevel: 'OPERATIONAL',
  liveNow: 0,
  waitingCount: 0,
  inServiceCount: 0,
};

function mockHook(overrides: Partial<ReturnType<typeof useOrganizationDashboard>> = {}) {
  hook.mockReturnValue({
    shops: [fullShop, operationalShop],
    loading: false,
    error: null,
    refetch,
    connectedSockets: 2,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockHook();
});

describe('MultiUnitDashboard', () => {
  it('renderiza um card por salão com fila e atendimento como números separados', () => {
    render(<MultiUnitDashboard orgId="org1" />);

    const cards = screen.getAllByTestId('shop-card');
    expect(cards).toHaveLength(2);

    const central = within(cards[0]);
    expect(central.getByText('Salão Central')).toBeVisible();
    expect(central.getByText('Aberto')).toBeVisible();
    expect(central.getByText('Na fila')).toBeVisible();
    expect(central.getByText('Em atendimento')).toBeVisible();
    expect(central.getByText('1')).toBeVisible();
    expect(central.getByText('3')).toBeVisible();
    // nunca exibe a soma (liveNow) no display
    expect(central.queryByText('4')).toBeNull();

    const filial = within(cards[1]);
    expect(filial.getByText('Fechado')).toBeVisible();
    expect(filial.getAllByText('0')).toHaveLength(2);
  });

  it('mostra faturamento apenas para acesso FULL, formatado em BRL', () => {
    render(<MultiUnitDashboard orgId="org1" />);

    const [central, filial] = screen.getAllByTestId('shop-card');
    expect(central).toHaveTextContent(/Hoje:\s*R\$\s*123,45/);
    expect(central).toHaveTextContent(/Mês:\s*R\$\s*1\.998,00/);
    expect(within(filial).queryByText(/R\$/)).toBeNull();
    expect(filial).not.toHaveTextContent('Hoje:');
  });

  it('exibe indicador ao vivo quando todos os sockets estão conectados', () => {
    mockHook({ connectedSockets: 2 });
    const { rerender } = render(<MultiUnitDashboard orgId="org1" />);
    expect(screen.getByTestId('live-dot')).toHaveClass('bg-success');
    expect(screen.getByText('Ao vivo')).toBeVisible();

    mockHook({ connectedSockets: 1 });
    rerender(<MultiUnitDashboard orgId="org1" />);
    expect(screen.getByText('Atualizando…')).toBeVisible();
  });

  it('mostra loading e estado de erro com refetch', async () => {
    mockHook({ loading: true });
    const { unmount } = render(<MultiUnitDashboard orgId="org1" />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando salões…');
    unmount();

    mockHook({ error: 'Sem acesso a esta organização' });
    render(<MultiUnitDashboard orgId="org1" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Sem acesso a esta organização');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sem salões: mostra estado vazio com o botão Adicionar salão', async () => {
    mockHook({ shops: [] });
    render(<MultiUnitDashboard orgId="org1" />);
    expect(screen.getByText('Nenhum salão nesta organização ainda.')).toBeVisible();
    expect(screen.getByRole('button', { name: /Adicionar salão/ })).toBeVisible();
  });

  it('lista salões disponíveis, anexa e dispara refetch para o novo salão aparecer', async () => {
    listAvailable.mockResolvedValue([{ id: 'new-shop', name: 'Salão Novo', city: 'São Paulo' }]);
    attach.mockResolvedValue({ id: 'new-shop', name: 'Salão Novo', organizationId: 'org1' });

    render(<MultiUnitDashboard orgId="org1" />);
    fireEvent.click(screen.getByRole('button', { name: /Adicionar salão/ }));

    expect(await screen.findByText('Salão Novo')).toBeVisible();
    expect(listAvailable).toHaveBeenCalledWith('org1');

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    await waitFor(() => expect(attach).toHaveBeenCalledWith('org1', 'new-shop'));
    expect(refetch).toHaveBeenCalled();
  });

  it('mostra a mensagem amigável do backend quando o anexo falha (409)', async () => {
    listAvailable.mockResolvedValue([{ id: 'taken', name: 'Salão Ocupado' }]);
    attach.mockRejectedValue(new Error('Barbearia já está vinculada a uma organização'));

    render(<MultiUnitDashboard orgId="org1" />);
    fireEvent.click(screen.getByRole('button', { name: /Adicionar salão/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Barbearia já está vinculada a uma organização');
    expect(refetch).not.toHaveBeenCalled();
  });

  it('desanexar: abre confirmação explicando que o salão não é apagado; cancelar não chama a API', async () => {
    render(<MultiUnitDashboard orgId="org1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Desanexar Salão Central' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('O salão continuará ativo, apenas deixará de fazer parte desta organização.');
    expect(dialog).toHaveTextContent('Você poderá anexá-lo novamente depois.');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(detach).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
  });

  it('desanexar: confirmar chama detachBarbershop com o par e dispara refetch', async () => {
    detach.mockResolvedValue({ id: 'b1', name: 'Salão Central', organizationId: 'org1' });
    render(<MultiUnitDashboard orgId="org1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Desanexar Salão Central' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Desanexar' }));

    await waitFor(() => expect(detach).toHaveBeenCalledWith('org1', 'b1'));
    expect(refetch).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('desanexar: erro do backend aparece como alerta amigável', async () => {
    detach.mockRejectedValue(new Error('Barbearia não está vinculada a esta organização'));
    render(<MultiUnitDashboard orgId="org1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Desanexar Salão Filial' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Desanexar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Barbearia não está vinculada a esta organização');
    expect(refetch).not.toHaveBeenCalled();
  });
});
