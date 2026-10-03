/// <reference types="vitest/globals" />
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { MultiUnitDashboard } from './MultiUnitDashboard';
import { organizationsApi, OrganizationDashboardShop } from '@/infra/organizationsApi';
import { useOrganizationDashboard } from '@/hooks/useOrganizationDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useBarbershopFilters } from '@/contexts/BarbershopFiltersContext';

vi.mock('@/hooks/useOrganizationDashboard', () => ({ useOrganizationDashboard: vi.fn() }));
vi.mock('@/infra/organizationsApi', () => ({
  organizationsApi: {
    listAvailableBarbershops: vi.fn(),
    attachBarbershop: vi.fn(),
    detachBarbershop: vi.fn(),
    switchShop: vi.fn(),
  },
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('@/contexts/BarbershopFiltersContext', () => ({ useBarbershopFilters: vi.fn() }));
vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: vi.fn() };
});

const hook = vi.mocked(useOrganizationDashboard);
const listAvailable = vi.mocked(organizationsApi.listAvailableBarbershops);
const attach = vi.mocked(organizationsApi.attachBarbershop);
const detach = vi.mocked(organizationsApi.detachBarbershop);
const switchShop = vi.fn();
const navigate = vi.fn();

function mockAuth(overrides: { barbershopId?: string; switchShop?: ReturnType<typeof vi.fn> } = {}) {
  vi.mocked(useAuth).mockReturnValue({
    switchShop: overrides.switchShop ?? switchShop,
    user: { id: 'u1', name: 'Caio', email: 'caio@example.com', role: 'OWNER', barbershopId: overrides.barbershopId ?? 'b0' },
  } as unknown as ReturnType<typeof useAuth>);
}

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
  mockAuth();
  vi.mocked(useBarbershopFilters).mockReturnValue({
    barbershopId: 'b0',
  } as unknown as ReturnType<typeof useBarbershopFilters>);
  vi.mocked(useNavigate).mockReturnValue(navigate);
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

  it('não exibe mais o indicador "Ao vivo" / "Atualizando…"', () => {
    mockHook({ connectedSockets: 1 });
    render(<MultiUnitDashboard orgId="org1" />);

    expect(screen.queryByTestId('live-dot')).toBeNull();
    expect(screen.queryByText('Ao vivo')).toBeNull();
    expect(screen.queryByText('Atualizando…')).toBeNull();
  });

  it('mostra o botão Acessar apenas nos salões com acesso FULL', () => {
    render(<MultiUnitDashboard orgId="org1" />);

    const [central, filial] = screen.getAllByTestId('shop-card');
    expect(within(central).getByRole('button', { name: 'Acessar Salão Central' })).toBeEnabled();
    expect(within(filial).queryByRole('button', { name: /Acessar/ })).toBeNull();
  });

  it('no salão ativo o botão fica desabilitado e diz "Salão atual"', () => {
    vi.mocked(useBarbershopFilters).mockReturnValue({
      barbershopId: 'b1',
    } as unknown as ReturnType<typeof useBarbershopFilters>);
    render(<MultiUnitDashboard orgId="org1" />);

    const [central] = screen.getAllByTestId('shop-card');
    const button = within(central).getByRole('button', { name: 'Salão Central é o salão atual' });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Salão atual');
    expect(switchShop).not.toHaveBeenCalled();
  });

  it('clique em Acessar troca o salão da sessão e navega para o início do painel', async () => {
    switchShop.mockResolvedValue({ ok: true });
    render(<MultiUnitDashboard orgId="org1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Acessar Salão Central' }));

    await waitFor(() => expect(switchShop).toHaveBeenCalledWith('org1', 'b1'));
    expect(navigate).toHaveBeenCalledWith('/app');
  });

  it('erro da troca aparece em português e não navega', async () => {
    switchShop.mockResolvedValue({ ok: false, message: 'Você não tem permissão para acessar este salão.' });
    render(<MultiUnitDashboard orgId="org1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Acessar Salão Central' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você não tem permissão para acessar este salão.',
    );
    expect(navigate).not.toHaveBeenCalled();
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
