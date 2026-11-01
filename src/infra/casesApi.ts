import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';
import type { CasePriority, ClientCaseStatus } from './clientsApi';

/**
 * API da gestão de processos do escritório (segmento LAW_FIRM).
 *
 * Tudo aqui é **interno**: casos, tarefas, prazos, andamentos e documentos do
 * escritório nunca aparecem em rota pública nem em mensagem ao cliente.
 */

export type CaseTaskStatus = 'OPEN' | 'DONE' | 'CANCELED';
export type DeadlineType =
  | 'JUDICIAL_RESPONSE'
  | 'HEARING'
  | 'APPEAL'
  | 'CONTRACTUAL'
  | 'INTERNAL';
export type DeadlineStatus = 'PENDING' | 'FULFILLED' | 'MISSED' | 'CANCELED';
export type CaseEventType =
  | 'NOTE'
  | 'MEETING'
  | 'FILING'
  | 'COURT_MOTION'
  | 'DEADLINE'
  | 'INTIMATION'
  | 'PAYMENT'
  | 'CLIENT_CONTACT';
export type CaseDocumentType =
  | 'CONTRACT'
  | 'PROCURACAO'
  | 'PETITION'
  | 'EVIDENCE'
  | 'COURT_DOCUMENT'
  | 'INTAKE'
  | 'RECEIPT'
  | 'OTHER';

export interface CaseSummary {
  id: string;
  barbershopId: string;
  clientId: string;
  clientName: string;
  nickname: string;
  title: string | null;
  status: ClientCaseStatus;
  priority: CasePriority;
  practiceArea: string | null;
  caseNumber: string | null;
  courtName: string | null;
  opponent: string | null;
  claimedAmount: number | null;
  awardedAmount: number | null;
  responsibleStaffId: string | null;
  responsibleName: string | null;
  shareWithClient: boolean;
  openedAt: string;
  closedAt: string | null;
  active: boolean;
  openTasks: number;
  pendingDeadlines: number;
  createdAt: string;
  updatedAt: string;
}

export interface CaseTask {
  id: string;
  barbershopId: string;
  caseId: string;
  title: string;
  description: string | null;
  status: CaseTaskStatus;
  priority: CasePriority;
  dueDate: string | null;
  assigneeStaffId: string | null;
  assigneeName: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseDeadline {
  id: string;
  barbershopId: string;
  caseId: string | null;
  caseName: string | null;
  title: string;
  type: DeadlineType;
  status: DeadlineStatus;
  dueDate: string;
  businessDays: number | null;
  courtName: string | null;
  notes: string | null;
  completedAt: string | null;
  daysRemaining: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseEvent {
  id: string;
  barbershopId: string;
  caseId: string;
  type: CaseEventType;
  title: string;
  description: string | null;
  occurredAt: string;
  createdByUserId: string | null;
  authorName: string | null;
  visibleToClient: boolean;
  createdAt: string;
}

export interface CaseDocument {
  id: string;
  barbershopId: string;
  caseId: string;
  title: string;
  type: CaseDocumentType;
  fileUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  version: number;
  notes: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeHoliday {
  id: string;
  barbershopId: string;
  date: string;
  name: string;
  createdAt: string;
}

export interface CaseOverview {
  case: CaseSummary;
  tasks: { open: number; done: number; overdue: number };
  deadlines: { pending: number; overdue: number; next: CaseDeadline | null };
  documents: number;
  events: number;
  revenue: number;
  completedAppointments: number;
  outstanding: number;
}

export interface PracticeAreaReportRow {
  practiceArea: string;
  total: number;
  active: number;
  closed: number;
  claimed: number;
  awarded: number;
  revenue: number;
}

// ─── Contratos e assinaturas ────────────────────────────────────────────────

export type ContractType =
  | 'ENGAGEMENT'
  | 'PROCURACAO'
  | 'SETTLEMENT'
  | 'FEE_AGREEMENT'
  | 'OTHER';
export type ContractStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_SIGNED' | 'SIGNED' | 'VOID';
export type SignatureRole = 'CLIENT' | 'LAWYER' | 'WITNESS';
export type SignatureStatus = 'PENDING' | 'SIGNED' | 'DECLINED';

export interface ContractSignature {
  id: string;
  barbershopId: string;
  contractId: string;
  signerName: string;
  signerEmail: string | null;
  signerWhatsapp: string | null;
  role: SignatureRole;
  status: SignatureStatus;
  signatureUrl: string | null;
  signatureType: 'DRAWN' | 'TYPED' | 'DIGITAL_CERT';
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseContract {
  id: string;
  barbershopId: string;
  caseId: string;
  clientId: string;
  clientName: string | null;
  title: string;
  type: ContractType;
  status: ContractStatus;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  version: number;
  value: number | null;
  feePercent: number | null;
  notes: string | null;
  signedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  signatures: ContractSignature[];
  pendingSignatures: number;
}

export interface PublicContract {
  contractTitle: string;
  contractType: ContractType;
  content: string | null;
  fileUrl: string | null;
  signerName: string;
  status: SignatureStatus;
  signedAt: string | null;
}

// ─── Timesheet ──────────────────────────────────────────────────────────────

export interface CaseTimeEntry {
  id: string;
  barbershopId: string;
  caseId: string;
  clientId: string;
  staffUserId: string;
  staffName: string | null;
  description: string | null;
  minutes: number;
  billable: boolean;
  hourlyRate: number | null;
  billed: boolean;
  entryDate: string;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntrySummary {
  totalMinutes: number;
  billableMinutes: number;
  billableAmount: number;
  unbilledAmount: number;
  entryCount: number;
}

// ─── Honorários de êxito ────────────────────────────────────────────────────

export interface CaseSuccessFee {
  id: string;
  barbershopId: string;
  caseId: string;
  caseName: string | null;
  percent: number;
  baseAmount: number | null;
  amount: number | null;
  installments: number;
  status: 'PENDING' | 'INVOICED' | 'PAID' | 'CANCELED';
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Intimações ────────────────────────────────────────────────────────────

export type IntimationSource = 'EMAIL' | 'WHATSAPP' | 'MANUAL' | 'IMPORT';
export type IntimationStatus = 'NEW' | 'TRIAGED' | 'LINKED' | 'IGNORED';

export interface CourtIntimation {
  id: string;
  barbershopId: string;
  caseId: string | null;
  caseName: string | null;
  source: IntimationSource;
  receivedAt: string;
  subject: string;
  body: string;
  detectedNumber: string | null;
  suggestedType: CaseEventType;
  status: IntimationStatus;
  triagedAt: string | null;
  linkedEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── NFS-e ──────────────────────────────────────────────────────────────────

export interface CaseFeeInvoice {
  id: string;
  barbershopId: string;
  caseId: string | null;
  clientId: string | null;
  invoiceNumber: string | null;
  externalId: string | null;
  provider: 'MANUAL' | 'NFE_IO' | 'FOCUS';
  status: 'DRAFT' | 'ISSUED' | 'CANCELED' | 'FAILED';
  description: string;
  amount: number;
  issRetained: boolean;
  taxpayerId: string | null;
  issuedAt: string | null;
  xmlUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Alertas de prazo ───────────────────────────────────────────────────────

export interface DeadlineAlert {
  id: string;
  barbershopId: string;
  deadlineId: string;
  deadlineTitle: string | null;
  userId: string;
  channel: 'WHATSAPP' | 'EMAIL';
  kind: 'UPCOMING' | 'OVERDUE';
  daysRemaining: number | null;
  sentOn: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELED';
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

// ─── Transferência entre unidades ──────────────────────────────────────────

export interface CaseTransfer {
  id: string;
  barbershopId: string;
  originName: string | null;
  caseId: string;
  caseName: string | null;
  targetBarbershopId: string;
  targetName: string | null;
  reason: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  requestedByUserId: string;
  acceptedByUserId: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export const casesApi = {
  // ─── Casos ────────────────────────────────────────────────────────────────
  list: async (params?: {
    status?: ClientCaseStatus;
    priority?: CasePriority;
    practiceArea?: string;
    clientId?: string;
    responsibleStaffId?: string;
    q?: string;
    includeArchived?: boolean;
    limit?: number;
  }) => {
    const res = await apiClient<{ success: boolean; data: CaseSummary[] }>(
      `/api/cases${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseSummary[]>(res);
  },

  pipeline: async () => {
    const res = await apiClient<{ success: boolean; data: Record<string, number> }>(
      '/api/cases/pipeline',
      'GET',
      undefined,
      token()
    );
    return unwrap<Record<string, number>>(res);
  },

  get: async (caseId: string) => {
    const res = await apiClient<{ success: boolean; data: CaseSummary }>(
      `/api/cases/${caseId}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseSummary>(res);
  },

  overview: async (caseId: string) => {
    const res = await apiClient<{ success: boolean; data: CaseOverview }>(
      `/api/cases/${caseId}/overview`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseOverview>(res);
  },

  practiceAreaReport: async () => {
    const res = await apiClient<{ success: boolean; data: PracticeAreaReportRow[] }>(
      '/api/cases/reports/practice-areas',
      'GET',
      undefined,
      token()
    );
    return unwrap<PracticeAreaReportRow[]>(res);
  },

  // ─── Tarefas ──────────────────────────────────────────────────────────────
  listTasks: async (caseId: string) => {
    const res = await apiClient<{ success: boolean; data: CaseTask[] }>(
      `/api/cases/${caseId}/tasks`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseTask[]>(res);
  },

  createTask: async (
    caseId: string,
    body: {
      title: string;
      description?: string | null;
      priority?: CasePriority;
      dueDate?: string | null;
      assigneeStaffId?: string | null;
    }
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseTask }>(
      `/api/cases/${caseId}/tasks`,
      'POST',
      body,
      token()
    );
    return unwrap<CaseTask>(res);
  },

  updateTask: async (
    caseId: string,
    taskId: string,
    body: Partial<{
      title: string;
      description: string | null;
      status: CaseTaskStatus;
      priority: CasePriority;
      dueDate: string | null;
      assigneeStaffId: string | null;
    }>
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseTask }>(
      `/api/cases/${caseId}/tasks/${taskId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<CaseTask>(res);
  },

  deleteTask: async (caseId: string, taskId: string) => {
    await apiClient<void>(
      `/api/cases/${caseId}/tasks/${taskId}`,
      'DELETE',
      undefined,
      token()
    );
  },

  // ─── Prazos ───────────────────────────────────────────────────────────────
  listDeadlines: async (params?: {
    from?: string;
    to?: string;
    status?: DeadlineStatus;
    caseId?: string;
    withinBusinessDays?: number;
    limit?: number;
  }) => {
    const res = await apiClient<{ success: boolean; data: CaseDeadline[] }>(
      `/api/cases/deadlines${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseDeadline[]>(res);
  },

  createDeadline: async (
    caseId: string,
    body: {
      title: string;
      type?: DeadlineType;
      dueDate?: string;
      businessDays?: number;
      referenceDate?: string;
      courtName?: string | null;
      notes?: string | null;
    }
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseDeadline }>(
      `/api/cases/${caseId}/deadlines`,
      'POST',
      body,
      token()
    );
    return unwrap<CaseDeadline>(res);
  },

  updateDeadline: async (
    deadlineId: string,
    body: Partial<{
      title: string;
      type: DeadlineType;
      status: DeadlineStatus;
      dueDate: string;
      businessDays: number;
      referenceDate: string;
      courtName: string | null;
      notes: string | null;
    }>
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseDeadline }>(
      `/api/cases/deadlines/${deadlineId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<CaseDeadline>(res);
  },

  deleteDeadline: async (deadlineId: string) => {
    await apiClient<void>(`/api/cases/deadlines/${deadlineId}`, 'DELETE', undefined, token());
  },

  // ─── Andamentos ───────────────────────────────────────────────────────────
  listEvents: async (caseId: string) => {
    const res = await apiClient<{ success: boolean; data: CaseEvent[] }>(
      `/api/cases/${caseId}/events`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseEvent[]>(res);
  },

  createEvent: async (
    caseId: string,
    body: {
      title: string;
      type?: CaseEventType;
      description?: string | null;
      occurredAt?: string;
      visibleToClient?: boolean;
    }
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseEvent }>(
      `/api/cases/${caseId}/events`,
      'POST',
      body,
      token()
    );
    return unwrap<CaseEvent>(res);
  },

  // ─── Documentos ───────────────────────────────────────────────────────────
  listDocuments: async (caseId: string) => {
    const res = await apiClient<{ success: boolean; data: CaseDocument[] }>(
      `/api/cases/${caseId}/documents`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseDocument[]>(res);
  },

  createDocument: async (
    caseId: string,
    body: {
      title: string;
      type?: CaseDocumentType;
      fileUrl?: string | null;
      fileName?: string | null;
      mimeType?: string | null;
      sizeBytes?: number | null;
      version?: number | null;
      notes?: string | null;
    }
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseDocument }>(
      `/api/cases/${caseId}/documents`,
      'POST',
      body,
      token()
    );
    return unwrap<CaseDocument>(res);
  },

  deleteDocument: async (caseId: string, documentId: string) => {
    await apiClient<void>(
      `/api/cases/${caseId}/documents/${documentId}`,
      'DELETE',
      undefined,
      token()
    );
  },

  // ─── Feriados do escritório ───────────────────────────────────────────────
  listHolidays: async (params?: { from?: string; to?: string }) => {
    const res = await apiClient<{ success: boolean; data: OfficeHoliday[] }>(
      `/api/cases/holidays${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<OfficeHoliday[]>(res);
  },

  createHoliday: async (body: { date: string; name: string }) => {
    const res = await apiClient<{ success: boolean; data: OfficeHoliday }>(
      '/api/cases/holidays',
      'POST',
      body,
      token()
    );
    return unwrap<OfficeHoliday>(res);
  },

  deleteHoliday: async (holidayId: string) => {
    await apiClient<void>(`/api/cases/holidays/${holidayId}`, 'DELETE', undefined, token());
  },

  // ─── Contratos e assinaturas ─────────────────────────────────────────────
  listContracts: async (params?: { caseId?: string; status?: ContractStatus; limit?: number }) => {
    const res = await apiClient<{ success: boolean; data: CaseContract[] }>(
      `/api/cases/contracts${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseContract[]>(res);
  },

  createContract: async (
    caseId: string,
    body: {
      title: string;
      type?: ContractType;
      content?: string | null;
      value?: number | null;
      feePercent?: number | null;
      notes?: string | null;
      signers?: {
        signerName: string;
        signerEmail?: string | null;
        signerWhatsapp?: string | null;
        role?: SignatureRole;
      }[];
    }
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseContract }>(
      `/api/cases/${caseId}/contracts`,
      'POST',
      body,
      token()
    );
    return unwrap<CaseContract>(res);
  },

  updateContract: async (
    contractId: string,
    body: Partial<{
      title: string;
      content: string | null;
      value: number | null;
      feePercent: number | null;
      notes: string | null;
      status: ContractStatus;
      fileUrl: string | null;
      fileName: string | null;
      mimeType: string | null;
      sizeBytes: number | null;
    }>
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseContract }>(
      `/api/cases/contracts/${contractId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<CaseContract>(res);
  },

  addContractSigner: async (
    contractId: string,
    body: {
      signerName: string;
      signerEmail?: string | null;
      signerWhatsapp?: string | null;
      role?: SignatureRole;
    }
  ) => {
    const res = await apiClient<{ success: boolean; data: ContractSignature }>(
      `/api/cases/contracts/${contractId}/signers`,
      'POST',
      body,
      token()
    );
    return unwrap<ContractSignature>(res);
  },

  sendContractForSignature: async (
    contractId: string,
    body?: { message?: string | null }
  ) => {
    const res = await apiClient<{
      success: boolean;
      data: { contract: CaseContract; links: { signerName: string; url: string }[] };
    }>(`/api/cases/contracts/${contractId}/send`, 'POST', body ?? {}, token());
    return unwrap<{ contract: CaseContract; links: { signerName: string; url: string }[] }>(res);
  },

  // ─── Assinatura (público) ────────────────────────────────────────────────
  getPublicContract: async (signatureToken: string) => {
    const res = await apiClient<{ success: boolean; data: PublicContract }>(
      `/api/contracts/sign/${signatureToken}`,
      'GET',
      undefined,
      ''
    );
    return unwrap<PublicContract>(res);
  },

  signContract: async (
    signatureToken: string,
    body: { typedName?: string; drawnSignature?: string }
  ) => {
    const res = await apiClient<{ success: boolean; data: { contractId: string; signedAt: string } }>(
      `/api/contracts/sign/${signatureToken}`,
      'POST',
      body,
      ''
    );
    return unwrap<{ contractId: string; signedAt: string }>(res);
  },

  declineContract: async (signatureToken: string, reason?: string | null) => {
    const res = await apiClient<{ success: boolean; data: { declined: boolean } }>(
      `/api/contracts/sign/${signatureToken}/decline`,
      'POST',
      { reason: reason ?? null },
      ''
    );
    return unwrap<{ declined: boolean }>(res);
  },

  // ─── Timesheet ───────────────────────────────────────────────────────────
  listTimeEntries: async (params?: {
    caseId?: string;
    staffUserId?: string;
    billed?: boolean;
    limit?: number;
  }) => {
    const res = await apiClient<{ success: boolean; data: CaseTimeEntry[] }>(
      `/api/cases/time-entries${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseTimeEntry[]>(res);
  },

  createTimeEntry: async (
    caseId: string,
    body: {
      staffUserId: string;
      description?: string | null;
      minutes: number;
      billable?: boolean;
      hourlyRate?: number | null;
      entryDate?: string;
    }
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseTimeEntry }>(
      `/api/cases/${caseId}/time-entries`,
      'POST',
      body,
      token()
    );
    return unwrap<CaseTimeEntry>(res);
  },

  updateTimeEntry: async (
    entryId: string,
    body: Partial<{
      description: string | null;
      minutes: number;
      billable: boolean;
      hourlyRate: number | null;
      billed: boolean;
      entryDate: string;
    }>
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseTimeEntry }>(
      `/api/cases/time-entries/${entryId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<CaseTimeEntry>(res);
  },

  deleteTimeEntry: async (entryId: string) => {
    await apiClient<void>(`/api/cases/time-entries/${entryId}`, 'DELETE', undefined, token());
  },

  timeEntrySummary: async (caseId: string) => {
    const res = await apiClient<{ success: boolean; data: TimeEntrySummary }>(
      `/api/cases/${caseId}/time-entries/summary`,
      'GET',
      undefined,
      token()
    );
    return unwrap<TimeEntrySummary>(res);
  },

  // ─── Honorários de êxito ─────────────────────────────────────────────────
  listSuccessFees: async (params?: { caseId?: string; status?: string; limit?: number }) => {
    const res = await apiClient<{ success: boolean; data: CaseSuccessFee[] }>(
      `/api/cases/success-fees${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseSuccessFee[]>(res);
  },

  createSuccessFee: async (
    caseId: string,
    body: { percent: number; installments?: number; dueDate?: string | null; notes?: string | null }
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseSuccessFee }>(
      `/api/cases/${caseId}/success-fees`,
      'POST',
      body,
      token()
    );
    return unwrap<CaseSuccessFee>(res);
  },

  updateSuccessFee: async (
    feeId: string,
    body: Partial<{
      percent: number;
      installments: number;
      status: 'PENDING' | 'INVOICED' | 'PAID' | 'CANCELED';
      dueDate: string | null;
      paidAt: string | null;
      notes: string | null;
    }>
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseSuccessFee }>(
      `/api/cases/success-fees/${feeId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<CaseSuccessFee>(res);
  },

  // ─── Intimações ──────────────────────────────────────────────────────────
  listIntimations: async (params?: {
    status?: IntimationStatus;
    caseId?: string;
    limit?: number;
  }) => {
    const res = await apiClient<{ success: boolean; data: CourtIntimation[] }>(
      `/api/cases/intimations${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CourtIntimation[]>(res);
  },

  createIntimation: async (body: {
    subject: string;
    body: string;
    source?: IntimationSource;
    receivedAt?: string;
  }) => {
    const res = await apiClient<{ success: boolean; data: CourtIntimation }>(
      '/api/cases/intimations',
      'POST',
      body,
      token()
    );
    return unwrap<CourtIntimation>(res);
  },

  importIntimations: async (body: { text: string; source?: IntimationSource }) => {
    const res = await apiClient<{
      success: boolean;
      data: { imported: number; intimations: CourtIntimation[] };
    }>('/api/cases/intimations/import', 'POST', body, token());
    return unwrap<{ imported: number; intimations: CourtIntimation[] }>(res);
  },

  triageIntimation: async (
    intimationId: string,
    body: {
      status?: IntimationStatus;
      caseId?: string | null;
      suggestedType?: CaseEventType;
      createEvent?: boolean;
      eventTitle?: string;
      visibleToClient?: boolean;
    }
  ) => {
    const res = await apiClient<{ success: boolean; data: CourtIntimation }>(
      `/api/cases/intimations/${intimationId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<CourtIntimation>(res);
  },

  // ─── NFS-e ───────────────────────────────────────────────────────────────
  listFeeInvoices: async (params?: { caseId?: string; status?: string; limit?: number }) => {
    const res = await apiClient<{ success: boolean; data: CaseFeeInvoice[] }>(
      `/api/cases/fee-invoices${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseFeeInvoice[]>(res);
  },

  createFeeInvoice: async (body: {
    caseId?: string | null;
    clientId?: string | null;
    description: string;
    amount: number;
    issRetained?: boolean;
    taxpayerId?: string | null;
    provider?: 'MANUAL' | 'NFE_IO' | 'FOCUS';
    invoiceNumber?: string | null;
  }) => {
    const res = await apiClient<{ success: boolean; data: CaseFeeInvoice }>(
      '/api/cases/fee-invoices',
      'POST',
      body,
      token()
    );
    return unwrap<CaseFeeInvoice>(res);
  },

  updateFeeInvoice: async (
    invoiceId: string,
    body: Partial<{
      description: string;
      amount: number;
      invoiceNumber: string | null;
      status: 'DRAFT' | 'ISSUED' | 'CANCELED' | 'FAILED';
      issRetained: boolean;
      taxpayerId: string | null;
    }>
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseFeeInvoice }>(
      `/api/cases/fee-invoices/${invoiceId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<CaseFeeInvoice>(res);
  },

  issueFeeInvoice: async (invoiceId: string, body?: { invoiceNumber?: string; xmlUrl?: string | null }) => {
    const res = await apiClient<{ success: boolean; data: CaseFeeInvoice }>(
      `/api/cases/fee-invoices/${invoiceId}/issue`,
      'POST',
      body ?? {},
      token()
    );
    return unwrap<CaseFeeInvoice>(res);
  },

  // ─── Alertas de prazo ─────────────────────────────────────────────────────
  listDeadlineAlerts: async (params?: { status?: string; limit?: number }) => {
    const res = await apiClient<{ success: boolean; data: DeadlineAlert[] }>(
      `/api/cases/alerts${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<DeadlineAlert[]>(res);
  },

  // ─── Transferência entre unidades ─────────────────────────────────────────
  /** Unidades irmãs (mesma organização) disponíveis para transferência. */
  listSiblingShops: async () => {
    const res = await apiClient<{ success: boolean; data: { id: string; name: string }[] }>(
      '/api/cases/transfers/sibling-shops',
      'GET',
      undefined,
      token()
    );
    return unwrap<{ id: string; name: string }[]>(res);
  },

  listTransfers: async (params?: {
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
    role?: 'origin' | 'target';
    limit?: number;
  }) => {
    const res = await apiClient<{ success: boolean; data: CaseTransfer[] }>(
      `/api/cases/transfers${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<CaseTransfer[]>(res);
  },

  createTransfer: async (
    caseId: string,
    body: { targetBarbershopId: string; reason?: string | null }
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseTransfer }>(
      `/api/cases/${caseId}/transfers`,
      'POST',
      body,
      token()
    );
    return unwrap<CaseTransfer>(res);
  },

  respondTransfer: async (
    transferId: string,
    body: { decision: 'ACCEPTED' | 'REJECTED'; reason?: string | null }
  ) => {
    const res = await apiClient<{ success: boolean; data: CaseTransfer }>(
      `/api/cases/transfers/${transferId}/respond`,
      'POST',
      body,
      token()
    );
    return unwrap<CaseTransfer>(res);
  },
};
