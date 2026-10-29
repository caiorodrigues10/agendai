/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
    awardedAmount: null,
    responsibleStaffId: null,
    responsibleName: null,
    openedAt: '2026-10-01T10:00:00.000Z',
    closedAt: null,
    active: true,
    openTasks: 2,
    pendingDeadlines: 1,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(casesApi.list).mockResolvedValue([caseSummary()]);
  vi.mocked(casesApi.pipeline).mockResolvedValue({ ACTIVE: 3, LEAD: 1 });
  vi.mocked(casesApi.practiceAreaReport).mockResolvedValue([
    {
      practiceArea: 'Cível',
      total: 3,
      active: 2,
      closed: 1,
      claimed: 10000,
      awarded: 5000,
      revenue: 3000,
    },
  ]);
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

it('mostra o pipeline e a lista de processos do escritório', async () => {
  render(<CasesHub />);

  expect(await screen.findByText('Maria Souza · Cível')).toBeVisible();
  expect(screen.getByText('Ação de cobrança')).toBeVisible();
  expect(screen.getAllByText('Em andamento').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Alta').length).toBeGreaterThan(0);
  // etapa do pipeline com contagem do backend
  expect(screen.getAllByText('3').length).toBeGreaterThan(0);
});

it('filtra por situação ao clicar na etapa do pipeline', async () => {
  render(<CasesHub />);
  await screen.findByText('Ação de cobrança');

  const pipeline = screen.getByRole('region', { name: 'Etapas do pipeline' });
  fireEvent.click(within(pipeline).getByRole('button', { name: /Em andamento/ }));
  await waitFor(() =>
    expect(casesApi.list).toHaveBeenCalledWith(expect.objectContaining({ status: 'ACTIVE' }))
  );
});

it('abre o detalhe do processo com as abas de tarefas, prazos e documentos', async () => {
  vi.mocked(casesApi.get).mockResolvedValue(caseSummary());
  vi.mocked(casesApi.overview).mockResolvedValue({
    case: caseSummary(),
    tasks: { open: 2, done: 1, overdue: 0 },
    deadlines: { pending: 1, overdue: 0, next: null },
    documents: 3,
    events: 4,
    revenue: 3000,
    completedAppointments: 2,
    outstanding: 500,
  });
  vi.mocked(casesApi.listTasks).mockResolvedValue([]);
  vi.mocked(casesApi.listDeadlines).mockResolvedValue([]);
  vi.mocked(casesApi.listEvents).mockResolvedValue([]);
  vi.mocked(casesApi.listDocuments).mockResolvedValue([]);

  render(<CasesHub />);
  fireEvent.click(await screen.findByText('Ação de cobrança'));

  expect(await screen.findByRole('button', { name: 'Tarefas' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Prazos' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Documentos' })).toBeVisible();
  expect(await screen.findByText('Tarefas abertas')).toBeVisible();
});

it('cria um processo para o cliente escolhido', async () => {
  vi.mocked(clientsApi.createCase).mockResolvedValue({} as never);
  render(<CasesHub />);
  await screen.findByText('Ação de cobrança');

  fireEvent.click(screen.getByRole('button', { name: /Novo processo/ }));
  fireEvent.change(await screen.findByLabelText('Apelido do processo'), {
    target: { value: 'Averbação' },
  });
  fireEvent.click(await screen.findByRole('button', { name: 'Maria Souza' }));
  fireEvent.click(screen.getByRole('button', { name: 'Criar processo' }));

  await waitFor(() =>
    expect(clientsApi.createCase).toHaveBeenCalledWith(
      '10000000-0000-4000-8000-000000000001',
      expect.objectContaining({ nickname: 'Averbação' })
    )
  );
});
