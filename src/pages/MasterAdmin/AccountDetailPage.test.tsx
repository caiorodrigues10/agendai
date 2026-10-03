/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountDetailPage } from './AccountDetailPage';
import { adminInternalApi, AccountDetail } from '../../infra/adminInternalApi';

vi.mock('../../infra/adminInternalApi', () => ({
  adminInternalApi: { getAccounts: vi.fn(), getAccount: vi.fn(), accountAction: vi.fn(), impersonate: vi.fn() },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ startImpersonation: vi.fn(), exitImpersonation: vi.fn(), impersonationShop: null }),
}));

const detail: AccountDetail = {
  shop: {
    id: 'acc-1',
    name: 'Barbearia Central',
    whatsapp: '11999990000',
    cnpj: '12345678000199',
    address: 'Rua A, 100',
    city: 'São Paulo',
    active: true,
    approvalStatus: 'APPROVED',
    rejectionReason: null,
    createdAt: '2026-09-01T12:00:00.000Z',
    updatedAt: '2026-09-20T12:00:00.000Z',
    operationMode: 'HYBRID',
    businessSegment: 'OTHER',
    onboardingCompletedAt: null,
    onboardingCurrentStep: null,
    organizationId: null,
  },
  members: { total: 3, active: 2, byRole: { OWNER: 1, EMPLOYEE: 2 } },
  subscription: {
    id: 'sub-1',
    status: 'PAST_DUE',
    startDate: '2026-08-01T12:00:00.000Z',
    endDate: '2026-09-01T12:00:00.000Z',
    cancelDate: null,
    cancelReason: null,
    createdAt: '2026-08-01T12:00:00.000Z',
    plan: { id: 'plan-1', name: 'Pro', price: 20, billingCycle: 'MONTHLY' },
  },
  billing: { invoicesTotal: 4, paid: 3, overdue: 1, pending: 0, sumPaid: 60 },
  usage: {
    appointments: 120,
    appointments30d: 45,
    completed30d: 30,
    queueEntries: 10,
    tickets: 2,
    servicesActive: 5,
    productsActive: 8,
    clients: 40,
    lastAppointment: {
      id: 'ap-1',
      date: '2026-10-01T00:00:00.000Z',
      time: '14:30',
      status: 'COMPLETED',
    },
  },
  attention: [
    {
      id: 'overdue-invoices',
      severity: 'danger',
      title: 'Cobranças vencidas',
      description: '1 fatura(s) vencida(s) sem pagamento.',
      to: '/master/billing',
    },
  ],
};

function renderPage(id = 'acc-1') {
  return render(
    <MemoryRouter initialEntries={[`/master/accounts/${id}`]}>
      <Routes>
        <Route path="/master/accounts/:id" element={<AccountDetailPage />} />
        <Route path="/master/accounts" element={<div>lista-contas</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AccountDetailPage', () => {
  beforeEach(() => {
    vi.mocked(adminInternalApi.getAccount).mockResolvedValue({
      success: true,
      data: detail,
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('carrega a conta e exibe métricas, assinatura e faturamento', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Barbearia Central' })).toBeInTheDocument();
    expect(adminInternalApi.getAccount).toHaveBeenCalledWith('acc-1');

    expect(screen.getByText('R$ 20,00 / mês')).toBeInTheDocument();
    expect(screen.getByText('Em atraso')).toBeInTheDocument();
    expect(screen.getByText('R$ 60,00')).toBeInTheDocument();
    expect(screen.getByText('Agendamentos (30d)')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Donos')).toBeInTheDocument();
    expect(screen.getByText('Cobranças vencidas')).toBeInTheDocument();
    expect(screen.getByText('Ações de controle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Suspender/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar agora/ })).toBeInTheDocument();
  });

  it('volta para a lista de contas', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Barbearia Central' });
    fireEvent.click(screen.getByRole('button', { name: /Voltar para contas/ }));

    expect(await screen.findByText('lista-contas')).toBeInTheDocument();
  });

  it('mostra estado de erro com opção de tentar novamente', async () => {
    vi.mocked(adminInternalApi.getAccount).mockRejectedValue(new Error('boom'));

    renderPage();

    expect(
      await screen.findByText('Não foi possível carregar os dados da conta.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => {
      expect(adminInternalApi.getAccount).toHaveBeenCalledTimes(2);
    });
  });
});
