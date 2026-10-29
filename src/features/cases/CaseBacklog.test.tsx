/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CasesHub } from './CasesHub';
import { casesApi, type CaseSummary } from '../../infra/casesApi';
import { clientsApi } from '../../infra/clientsApi';

vi.mock('../../infra/casesApi', () => ({
  casesApi: {
    list: vi.fn(),
    pipeline: vi.fn(),
    practiceAreaReport: vi.fn(),
    get: vi.fn(),
    overview: vi.fn(),
    listTasks: vi.fn(),
    listDeadlines: vi.fn(),
    listEvents: vi.fn(),
    listDocuments: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    createDeadline: vi.fn(),
    updateDeadline: vi.fn(),
    deleteDeadline: vi.fn(),
    createEvent: vi.fn(),
    createDocument: vi.fn(),
    deleteDocument: vi.fn(),
    createHoliday: vi.fn(),
    deleteHoliday: vi.fn(),
    listContracts: vi.fn(),
    createContract: vi.fn(),
    updateContract: vi.fn(),
    addContractSigner: vi.fn(),
    sendContractForSignature: vi.fn(),
    listTimeEntries: vi.fn(),
    createTimeEntry: vi.fn(),
    updateTimeEntry: vi.fn(),
    deleteTimeEntry: vi.fn(),
    timeEntrySummary: vi.fn(),
    listSuccessFees: vi.fn(),
    createSuccessFee: vi.fn(),
    updateSuccessFee: vi.fn(),
    listIntimations: vi.fn(),
    createIntimation: vi.fn(),
    importIntimations: vi.fn(),
    triageIntimation: vi.fn(),
    listFeeInvoices: vi.fn(),
    createFeeInvoice: vi.fn(),
    updateFeeInvoice: vi.fn(),
    issueFeeInvoice: vi.fn(),
    listDeadlineAlerts: vi.fn(),
    listTransfers: vi.fn(),
    listSiblingShops: vi.fn(),
    createTransfer: vi.fn(),
    respondTransfer: vi.fn(),
  },
}));

vi.mock('../../infra/clientsApi', () => ({
  clientsApi: {
    list: vi.fn(),
    createCase: vi.fn(),
    updateCase: vi.fn(),
  },
}));

const caseId = '40000000-0000-4000-8000-000000000001';

function caseSummary(overrides: Partial<CaseSummary> = {}): CaseSummary {
  return {
    id: caseId,
    barbershopId: '30000000-0000-4000-8000-000000000001',
    clientId: '10000000-0000-4000-8000-000000000001',
    clientName: 'Maria Souza',
    nickname: 'Ação de cobrança',
    title: null,
    status: 'ACTIVE',
    priority: 'HIGH',
    practiceArea: 'Cível',
    caseNumber: null,
    shareWithClient: false,
    courtName: null,
    opponent: null,
    claimedAmount: 10000,
    awardedAmount: 50000,
    responsibleStaffId: null,
    responsibleName: null,
    openedAt: '2026-10-01T10:00:00.000Z',
    closedAt: null,
    active: true,
    openTasks: 0,
    pendingDeadlines: 0,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}

async function openDetail() {
  render(<CasesHub />);
  fireEvent.click(await screen.findByText('Ação de cobrança'));
  await screen.findByRole('button', { name: 'Tarefas' });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(casesApi.list).mockResolvedValue([caseSummary()]);
  vi.mocked(casesApi.pipeline).mockResolvedValue({ ACTIVE: 1 });
  vi.mocked(casesApi.practiceAreaReport).mockResolvedValue([]);
  vi.mocked(casesApi.get).mockResolvedValue(caseSummary());
  vi.mocked(casesApi.overview).mockResolvedValue({
    case: caseSummary(),
    tasks: { open: 0, done: 0, overdue: 0 },
    deadlines: { pending: 0, overdue: 0, next: null },
    documents: 0,
    events: 0,
    revenue: 0,
    completedAppointments: 0,
    outstanding: 0,
  });
  vi.mocked(casesApi.listTasks).mockResolvedValue([]);
  vi.mocked(casesApi.listDeadlines).mockResolvedValue([]);
  vi.mocked(casesApi.listEvents).mockResolvedValue([]);
  vi.mocked(casesApi.listDocuments).mockResolvedValue([]);
  vi.mocked(casesApi.listContracts).mockResolvedValue([]);
  vi.mocked(casesApi.listTimeEntries).mockResolvedValue([]);
  vi.mocked(casesApi.timeEntrySummary).mockResolvedValue({
    totalMinutes: 0,
    billableMinutes: 0,
    billableAmount: 0,
    unbilledAmount: 0,
    entryCount: 0,
  });
  vi.mocked(casesApi.listIntimations).mockResolvedValue([]);
  vi.mocked(casesApi.listSuccessFees).mockResolvedValue([]);
  vi.mocked(casesApi.listFeeInvoices).mockResolvedValue([]);
  vi.mocked(casesApi.listTransfers).mockResolvedValue([]);
  vi.mocked(casesApi.listSiblingShops).mockResolvedValue([]);
  vi.mocked(clientsApi.list).mockResolvedValue({
    data: [{ id: '10000000-0000-4000-8000-000000000001', name: 'Maria Souza' } as never],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
  });
});

it('cria um contrato com signatário a partir da aba Contratos', async () => {
  vi.mocked(casesApi.createContract).mockResolvedValue({} as never);
  await openDetail();

  fireEvent.click(screen.getByRole('button', { name: 'Contratos' }));
  fireEvent.change(await screen.findByLabelText('Título do contrato'), {
    target: { value: 'Contrato de honorários' },
  });
  fireEvent.change(screen.getByLabelText('Nome do signatário'), {
    target: { value: 'Maria Souza' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Criar/ }));

  await waitFor(() =>
    expect(casesApi.createContract).toHaveBeenCalledWith(
      caseId,
      expect.objectContaining({
        title: 'Contrato de honorários',
        signers: [expect.objectContaining({ signerName: 'Maria Souza' })],
      })
    )
  );
});

it('importa uma intimação colada do tribunal', async () => {
  vi.mocked(casesApi.importIntimations).mockResolvedValue({
    imported: 1,
    intimations: [],
  });
  await openDetail();

  fireEvent.click(screen.getByRole('button', { name: 'Intimações' }));
  fireEvent.change(await screen.findByLabelText('Texto da intimação'), {
    target: { value: 'Processo 1234567-89.2026.8.26.0100 — audiência' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Importar e analisar/ }));

  await waitFor(() =>
    expect(casesApi.importIntimations).toHaveBeenCalledWith({
      text: 'Processo 1234567-89.2026.8.26.0100 — audiência',
    })
  );
});

it('registra honorário de êxito com percentual informado pelo escritório', async () => {
  vi.mocked(casesApi.createSuccessFee).mockResolvedValue({} as never);
  await openDetail();

  fireEvent.click(screen.getByRole('button', { name: 'Honorários e NFS-e' }));
  fireEvent.change(await screen.findByLabelText('Percentual de honorário de êxito'), {
    target: { value: '20' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Registrar/ }));

  await waitFor(() =>
    expect(casesApi.createSuccessFee).toHaveBeenCalledWith(
      caseId,
      expect.objectContaining({ percent: 20 })
    )
  );
});

it('lança horas no timesheet do processo', async () => {
  vi.mocked(casesApi.createTimeEntry).mockResolvedValue({} as never);
  render(
    <CasesHub
      staff={[{ id: 'user-1', name: 'Dr. Ana' } as never]}
    />
  );
  fireEvent.click(await screen.findByText('Ação de cobrança'));
  await screen.findByRole('button', { name: 'Tarefas' });

  fireEvent.click(screen.getByRole('button', { name: 'Horas' }));
  fireEvent.change(await screen.findByLabelText('Profissional que trabalhou'), {
    target: { value: 'user-1' },
  });
  fireEvent.change(screen.getByLabelText('Minutos trabalhados'), {
    target: { value: '90' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Lançar/ }));

  await waitFor(() =>
    expect(casesApi.createTimeEntry).toHaveBeenCalledWith(
      caseId,
      expect.objectContaining({ staffUserId: 'user-1', minutes: 90 })
    )
  );
});

it('aceita a transferência de processo pendente entre unidades', async () => {
  vi.mocked(casesApi.listTransfers).mockResolvedValue([
    {
      id: 'transfer-1',
      barbershopId: 'shop-a',
      originName: 'Unidade A',
      caseId,
      caseName: 'Ação de cobrança',
      targetBarbershopId: 'shop-b',
      targetName: 'Unidade B',
      reason: 'mudança de vara',
      status: 'PENDING',
      requestedByUserId: 'user-1',
      acceptedByUserId: null,
      acceptedAt: null,
      createdAt: '2026-10-20T10:00:00.000Z',
      updatedAt: '2026-10-20T10:00:00.000Z',
    },
  ]);
  vi.mocked(casesApi.respondTransfer).mockResolvedValue({} as never);

  render(<CasesHub />);
  fireEvent.click(await screen.findByRole('button', { name: /Transferências/ }));

  expect(await screen.findByText(/Ação de cobrança/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /Aceitar/ }));

  await waitFor(() =>
    expect(casesApi.respondTransfer).toHaveBeenCalledWith('transfer-1', {
      decision: 'ACCEPTED',
    })
  );
});

it('compartilha o processo com o cliente no portal', async () => {
  vi.mocked(clientsApi.updateCase).mockResolvedValue({} as never);

  render(<CasesHub />);
  fireEvent.click(await screen.findByText('Ação de cobrança'));
  await screen.findByRole('button', { name: 'Tarefas' });

  fireEvent.click(screen.getByRole('button', { name: /Não compartilhado/ }));

  await waitFor(() =>
    expect(clientsApi.updateCase).toHaveBeenCalledWith(
      '10000000-0000-4000-8000-000000000001',
      caseId,
      { shareWithClient: true }
    )
  );
});
