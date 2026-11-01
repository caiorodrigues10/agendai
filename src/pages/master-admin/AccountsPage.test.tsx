/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountsPage } from './AccountsPage';
import { adminInternalApi, AccountsListResponse } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: { getAccounts: vi.fn(), getAccount: vi.fn(), getSegments: vi.fn() },
}));

const buildResponse = (overrides: Partial<AccountsListResponse> = {}): AccountsListResponse => ({
  success: true,
  data: [
    {
      id: 'acc-1',
      name: 'Barbearia Central',
      whatsapp: '11999990000',
      cnpj: null,
      address: null,
      city: 'São Paulo',
      active: true,
      approvalStatus: 'APPROVED',
      businessSegment: 'BARBERSHOP',
      createdAt: '2026-09-01T12:00:00.000Z',
      counts: { users: 3, appointments: 120, tickets: 2, queue: 10 },
      subscription: {
        status: 'ACTIVE',
        startDate: '2026-08-01T12:00:00.000Z',
        endDate: '2026-09-01T12:00:00.000Z',
        plan: { id: 'plan-1', name: 'Pro', price: 20, billingCycle: 'MONTHLY' },
      },
    },
    {
      id: 'acc-2',
      name: 'Studio Luz',
      whatsapp: '11988887777',
      cnpj: null,
      address: null,
      city: null,
      active: false,
      approvalStatus: 'PENDING',
      businessSegment: 'NAIL_STUDIO',
      createdAt: '2026-08-15T12:00:00.000Z',
      counts: { users: 1, appointments: 0, tickets: 0, queue: 0 },
      subscription: null,
    },
  ],
  meta: {
    total: 42,
    page: 1,
    limit: 20,
    totalPages: 3,
    summary: { total: 42, active: 30, inactive: 12, pendingApproval: 5 },
  },
  ...overrides,
});

function renderPage(initialEntry = '/master/accounts') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/master/accounts" element={<AccountsPage />} />
        <Route
          path="/master/accounts/:id"
          element={<div>detalhe-conta</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AccountsPage', () => {
  beforeEach(() => {
    vi.mocked(adminInternalApi.getAccounts).mockResolvedValue(buildResponse() as never);
    vi.mocked(adminInternalApi.getSegments).mockResolvedValue({
      success: true,
      data: [
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
          segment: 'NAIL_STUDIO',
          group: 'beauty',
          label: 'Estúdio de unhas',
          features: [],
          advertisingRestricted: false,
          auxiliaryProfile: null,
          hiddenModules: [],
          visibleModules: ['products', 'equipment', 'commissions', 'tip'],
          hiddenTabs: [],
          shops: 4,
        },
      ],
      meta: { total: 2, shops: 16 },
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('carrega as contas e exibe resumo, plano e paginação', async () => {
    renderPage();

    expect(await screen.findByText('Barbearia Central')).toBeInTheDocument();
    expect(adminInternalApi.getAccounts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      status: undefined,
      approval: undefined,
      segment: undefined,
      sort: 'recent',
    });

    expect(screen.getByText(/42 resultado\(s\)/)).toBeInTheDocument();
    expect(screen.getByText(/42 conta\(s\) · 30 ativa\(s\) · 12 inativa\(s\) · 5 pendente\(s\)/)).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Sem plano')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeInTheDocument();
  });

  it('usa os filtros da URL e troca o status ao clicar no segmento', async () => {
    renderPage('/master/accounts?q=central&status=inactive&approval=PENDING&sort=name&page=1');

    await screen.findByText('Barbearia Central');
    expect(adminInternalApi.getAccounts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: 'central',
      status: 'inactive',
      approval: 'PENDING',
      segment: undefined,
      sort: 'name',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Ativas' }));

    await waitFor(() => {
      expect(adminInternalApi.getAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active', search: 'central', sort: 'name' }),
      );
    });
  });

  it('navega para o detalhe ao clicar na conta', async () => {
    renderPage();

    await screen.findByText('Barbearia Central');
    fireEvent.click(screen.getByRole('button', { name: /Barbearia Central/ }));

    expect(await screen.findByText('detalhe-conta')).toBeInTheDocument();
  });

  it('filtra por segmento e mostra a coluna do segmento', async () => {
    renderPage();

    const segmentSelect = await screen.findByLabelText('Segmento');
    expect(segmentSelect).toBeInTheDocument();
    expect(screen.getAllByText('Barbearia').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Estúdio de unhas').length).toBeGreaterThan(0);

    fireEvent.change(segmentSelect, { target: { value: 'NAIL_STUDIO' } });

    await waitFor(() => {
      expect(adminInternalApi.getAccounts).toHaveBeenCalledWith(
        expect.objectContaining({ segment: 'NAIL_STUDIO' }),
      );
    });
  });

  it('mostra estado vazio quando nenhum resultado é encontrado', async () => {
    vi.mocked(adminInternalApi.getAccounts).mockResolvedValue(
      buildResponse({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0, summary: { total: 0, active: 0, inactive: 0, pendingApproval: 0 } } }) as never,
    );

    renderPage();

    expect(
      await screen.findByText('Nenhuma conta encontrada com estes filtros.'),
    ).toBeInTheDocument();
  });

  it('mostra estado de erro com opção de tentar novamente', async () => {
    vi.mocked(adminInternalApi.getAccounts).mockRejectedValue(new Error('boom'));

    renderPage();

    expect(await screen.findByText('Não foi possível carregar as contas.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => {
      expect(adminInternalApi.getAccounts).toHaveBeenCalledTimes(2);
    });
  });
});
