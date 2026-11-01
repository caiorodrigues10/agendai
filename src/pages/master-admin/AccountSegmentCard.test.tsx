/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AccountSegmentCard } from './AccountSegmentCard';
import { adminInternalApi, SegmentCatalogItem } from '../../infra/adminInternalApi';
import { ApiError } from '../../infra/apiClient';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: { getSegments: vi.fn(), updateAccountSegment: vi.fn() },
}));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: vi.fn() }));

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

const shop = { id: 'shop-1', name: 'Barbearia Central', businessSegment: 'BARBERSHOP' };

const mockAuth = (permissions: string[] = []) => {
  vi.mocked(useAuth).mockReturnValue({
    user: { internalPermissions: permissions },
  } as never);
};

async function openAndSelect(targetLabel = 'Escritório de advocacia') {
  fireEvent.click(screen.getByRole('button', { name: /Alterar segmento/ }));
  const combobox = await screen.findByRole('combobox', { name: 'Novo segmento' });
  fireEvent.click(combobox);
  fireEvent.click(await screen.findByRole('option', { name: new RegExp(targetLabel) }));
}

describe('AccountSegmentCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth();
    vi.mocked(adminInternalApi.getSegments).mockResolvedValue({
      success: true,
      data: catalog,
      meta: { total: catalog.length, shops: 15 },
    } as never);
  });

  it('exibe o segmento atual com módulos, features e publicidade', async () => {
    render(<AccountSegmentCard shop={shop} onChanged={vi.fn()} />);

    expect(await screen.findByText('Barbearia')).toBeInTheDocument();
    expect(screen.getByText('Produtos, Equipamento, Comissões, Gorjeta')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma')).toBeInTheDocument();
    expect(screen.getByText('Permitida')).toBeInTheDocument();
  });

  it('esconde a ação de alterar sem permissão de contas', async () => {
    mockAuth(['internal:dashboard:read']);
    render(<AccountSegmentCard shop={shop} onChanged={vi.fn()} />);

    await screen.findByText('Barbearia');
    expect(screen.queryByRole('button', { name: /Alterar segmento/ })).not.toBeInTheDocument();
  });

  it('exige motivo mínimo e mostra a prévia de impacto', async () => {
    render(<AccountSegmentCard shop={shop} onChanged={vi.fn()} />);
    await screen.findByText('Barbearia');

    await openAndSelect();

    expect(await screen.findByText(/Passam a ser ocultados: Produtos, Equipamento, Comissões, Gorjeta/)).toBeInTheDocument();
    expect(screen.getByText(/Features liberadas: Gestão de processos/)).toBeInTheDocument();
    expect(screen.getByText(/não permite divulgação comercial/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Motivo da troca'), { target: { value: 'curto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Revisar troca' }));

    expect(await screen.findByText('Informe um motivo com pelo menos 10 caracteres.')).toBeInTheDocument();
    expect(adminInternalApi.updateAccountSegment).not.toHaveBeenCalled();
  });

  it('confirma a troca e notifica o chamador', async () => {
    const onChanged = vi.fn();
    vi.mocked(adminInternalApi.updateAccountSegment).mockResolvedValue({
      success: true,
      data: {
        id: shop.id,
        segment: 'LAW_FIRM',
        previousSegment: 'BARBERSHOP',
        impact: {
          from: 'BARBERSHOP',
          to: 'LAW_FIRM',
          hiddenModules: [],
          shownModules: [],
          hiddenTabs: [],
          shownTabs: [],
          lostFeatures: [],
          gainedFeatures: [],
          advertisingChange: 'restricted',
        },
        conflicts: [],
      },
    } as never);

    render(<AccountSegmentCard shop={shop} onChanged={onChanged} />);
    await screen.findByText('Barbearia');

    await openAndSelect();
    fireEvent.change(screen.getByLabelText('Motivo da troca'), {
      target: { value: 'Cliente é escritório de advocacia' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Revisar troca' }));

    const confirm = await screen.findByRole('alertdialog');
    fireEvent.click(within(confirm).getByRole('button', { name: 'Alterar segmento' }));

    await waitFor(() => {
      expect(adminInternalApi.updateAccountSegment).toHaveBeenCalledWith('shop-1', {
        segment: 'LAW_FIRM',
        reason: 'Cliente é escritório de advocacia',
        confirm: undefined,
      });
    });
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it('trata conflito 409 exigindo ciência antes de reenviar', async () => {
    vi.mocked(adminInternalApi.updateAccountSegment)
      .mockRejectedValueOnce(
        new ApiError('Conflito', 409, 'SEGMENT_CHANGE_REQUIRES_CONFIRMATION', {
          errors: { conflicts: [{ code: 'products', message: 'Produtos ativos', count: 2 }] },
        }),
      )
      .mockResolvedValueOnce({ success: true, data: {} } as never);

    render(<AccountSegmentCard shop={shop} onChanged={vi.fn()} />);
    await screen.findByText('Barbearia');

    await openAndSelect();
    fireEvent.change(screen.getByLabelText('Motivo da troca'), {
      target: { value: 'Cliente é escritório de advocacia' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Revisar troca' }));
    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Alterar segmento' }));

    expect(await screen.findByText(/Produtos ativos \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Revise e confirme para prosseguir/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Revisar troca' }));
    fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Alterar segmento' }));

    await waitFor(() => {
      expect(adminInternalApi.updateAccountSegment).toHaveBeenLastCalledWith('shop-1', {
        segment: 'LAW_FIRM',
        reason: 'Cliente é escritório de advocacia',
        confirm: true,
      });
    });
  });
});
