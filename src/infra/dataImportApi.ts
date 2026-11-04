import { apiClient, API_BASE, ApiError } from './apiClient';
import { authStorage } from './authStorage';

/**
 * API do assistente de importação de planilhas.
 *
 * O fluxo é o mesmo dos 7 passos: enviar arquivo → escolher alvo → mapear
 * colunas → validar (dry-run) → confirmar → acompanhar → desfazer.
 *
 * Uma planilha pode ter **várias abas**, cada uma com o seu tipo: o dono
 * escolhe o tipo de cada aba e o assistente mapeia, valida e importa cada uma
 * no seu ritmo (a ordem real é a de dependência entre os tipos).
 *
 * O upload é multipart puro (o `apiClient` só fala JSON), então ele usa
 * `fetch` direto, no mesmo padrão do upload de logo.
 */

/** O que uma aba importa. */
export type ImportTargetType =
  | 'CLIENTS'
  | 'SERVICES'
  | 'APPOINTMENTS'
  | 'STAFF_SCHEDULES'
  | 'SHOP_SCHEDULE'
  | 'TIME_OFF'
  | 'PRODUCTS'
  | 'SERVICE_PACKAGES'
  | 'CLIENT_PACKAGES'
  | 'FIADOS'
  | 'CASES'
  | 'CASE_FEES';

/** Alvo gravado no lote: "MIXED" quando as abas têm tipos diferentes. */
export type ImportBatchTargetType = ImportTargetType | 'MIXED';

/** Tipo de entidade que o lote cria (usado pelo desfazer). */
export type ImportEntityType =
  | 'CLIENT'
  | 'SERVICE'
  | 'APPOINTMENT'
  | 'CASE'
  | 'STAFF_SCHEDULE'
  | 'SHOP_SCHEDULE'
  | 'TIME_OFF'
  | 'PRODUCT'
  | 'PRODUCT_CATEGORY'
  | 'SERVICE_PACKAGE'
  | 'CLIENT_PACKAGE'
  | 'FIADO'
  | 'CASE_FEE';

export type ImportBatchStatus =
  | 'UPLOADED'
  | 'MAPPING'
  | 'VALIDATING'
  | 'AWAITING_CONFIRMATION'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNDONE'
  | 'EXPIRED';

export type ImportRowStatus = 'PENDING' | 'IMPORTED' | 'SKIPPED' | 'FAILED';

export type ImportFieldKey =
  // clientes
  | 'name'
  | 'whatsapp'
  | 'email'
  | 'birthDate'
  | 'notes'
  // serviços
  | 'serviceName'
  | 'description'
  | 'price'
  | 'durationMinutes'
  | 'category'
  // agendamentos
  | 'clientName'
  | 'clientWhatsapp'
  | 'staffName'
  | 'date'
  | 'time'
  | 'status'
  | 'finalPrice'
  | 'paymentMethod'
  | 'modality'
  | 'caseName'
  | 'practiceArea'
  // processos
  | 'caseNumber'
  | 'caseStatus'
  | 'casePriority'
  | 'caseTitle'
  | 'courtName'
  | 'opponent'
  | 'claimedAmount'
  | 'awardedAmount'
  | 'openedAt'
  // horários
  | 'dayOfWeek'
  | 'startTime'
  | 'endTime'
  | 'pauseStart'
  | 'pauseEnd'
  | 'isOpen'
  // folgas
  | 'startDate'
  | 'endDate'
  | 'timeOffReason'
  | 'timeOffStatus'
  // produtos
  | 'productName'
  | 'productSku'
  | 'productBarcode'
  | 'productCategory'
  | 'productDescription'
  | 'productUnit'
  | 'productUnitLabel'
  | 'productType'
  | 'salePrice'
  | 'costPrice'
  | 'stockQty'
  | 'minStock'
  | 'productImage'
  // catálogo de pacotes
  | 'packageName'
  | 'sessionCount'
  | 'packagePrice'
  | 'validityDays'
  // saldo de pacotes do cliente
  | 'totalSessions'
  | 'remainingSessions'
  | 'pricePaid'
  | 'purchasedAt'
  | 'expiresAt'
  // fiado
  | 'customerName'
  | 'fiadoDescription'
  | 'originalAmount'
  | 'paidAmount'
  | 'dueDate'
  // honorários de êxito de processos
  | 'percent'
  | 'feeStatus'
  | 'feeDueDate'
  | 'feeInstallments'
  | 'feeNotes';

export interface ImportOptions {
  updateExisting: boolean;
  countFinancialValues: boolean;
  sendReviewInvitations: boolean;
  includeCase: boolean;
  /** Substitui o horário já configurado do dia. */
  replaceExistingSchedules: boolean;
  /** Importa a folga como pendente de aprovação. */
  importTimeOffAsPending: boolean;
  /** Atualiza preço e estoque mínimo de produto que já existe. */
  updateExistingProducts: boolean;
  /** Cria a categoria de produto que ainda não existe. */
  createProductCategories: boolean;
  /** Envia o lembrete de cobrança do fiado importado. */
  sendFiadoReminders: boolean;
}

export interface ImportFieldDescription {
  key: ImportFieldKey;
  label: string;
  required: boolean;
  type: 'text' | 'phone' | 'email' | 'date' | 'time' | 'money' | 'number' | 'quantity' | 'weekday';
  hint?: string;
  synonyms: string[];
}

export interface ImportBatchSummary {
  id: string;
  fileName: string;
  fileFormat: 'XLSX' | 'CSV';
  targetType: ImportBatchTargetType;
  status: ImportBatchStatus;
  sheetName: string | null;
  totalRows: number;
  processedRows: number;
  importedRows: number;
  failedRows: number;
  skippedRows: number;
  errorMessage: string | null;
  createdAt: string;
  finishedAt: string | null;
  undoneAt: string | null;
  expiresAt: string;
  canUndo: boolean;
  source?: 'WEB' | 'WHATSAPP_OWNER_BOT';
  avisoQualidade?: string;
}

/**
 * Uma célula lida por OCR que o dono precisa conferir.
 *
 * Vem do gate de confiança do backend: `pendente` é a fila de trabalho do
 * dono (corrigir ou aceitar); `aceito`/`editado` dizem como a célula foi
 * resolvida.
 */
export interface OcrCelulaRevisar {
  /** Linha da tabela lida (1-based). */
  linha: number;
  /** Coluna (0-based). */
  coluna: number;
  /** Campo de destino escolhido pelo dono (ou "Coluna N"). */
  campo: string;
  /** Valor lido (ou já corrigido). */
  valor: string;
  /** Confiança da leitura (0-100). */
  confianca: number | null;
  /** Por que a célula foi marcada. */
  motivo: string | null;
  /** Ainda espera o dono? */
  pendente: boolean;
  /** O dono aceitou o valor como está. */
  aceito: boolean;
  /** O dono corrigiu o valor. */
  editado: boolean;
}

/** Destino possível para uma imagem, com o que a foto precisa mostrar. */
export interface OcrDestino {
  targetType: ImportTargetType;
  rotulo: string;
  /** Campos obrigatórios do destino. */
  obrigatorios: ImportFieldKey[];
  /** O que a leitura por foto não garante neste destino. */
  observacao: string;
}

/** Uma aba do arquivo, como o dono a vê logo depois do upload. */
export interface ImportSheetInfo {
  sheetName: string | null;
  headers: string[];
  preview: Record<string, string>[];
  totalRows: number;
}

export interface ImportUploadResult {
  id: string;
  fileName: string;
  fileFormat: 'XLSX' | 'CSV';
  targetType: ImportBatchTargetType;
  status: ImportBatchStatus;
  sheetNames: string[];
  selectedSheet: string | null;
  headers: string[];
  preview: Record<string, string>[];
  totalRows: number;
  sheets: ImportSheetInfo[];
  createdAt: string;
  expiresAt: string;
  avisoQualidade?: string;
  /** "IMAGEM" quando o lote veio de uma foto lida por OCR. */
  origem?: 'IMAGEM';
  /** Destinos possíveis para a imagem (só quando `origem` é "IMAGEM"). */
  destinos?: OcrDestino[];
}

/** Uma aba do plano (mapeamento + opções + avisos), como a tela mostra. */
export interface ImportSheetPlanView {
  sheetName: string | null;
  targetType: ImportTargetType;
  fields: ImportFieldDescription[];
  detectedColumns: Partial<Record<ImportFieldKey, number>>;
  columns: Record<string, string>;
  options: ImportOptions;
  missing: string[];
  totalRows: number;
  preview: Record<string, string>[];
  warnings: string[];
}

export interface ImportTargetResult {
  id: string;
  targetType: ImportBatchTargetType;
  status: ImportBatchStatus;
  sheetNames: string[];
  selectedSheet: string | null;
  headers: string[];
  fields: ImportFieldDescription[];
  detectedColumns: Partial<Record<ImportFieldKey, number>>;
  preview: Record<string, string>[];
  totalRows: number;
  sheets: ImportSheetPlanView[];
}

export interface ImportRowValidation {
  rowNumber: number;
  sheetName?: string | null;
  status: 'VALID' | 'SKIPPED' | 'FAILED';
  message?: string;
  field?: ImportFieldKey;
  warnings?: string[];
  /** Célula lida por OCR que passa nos normalizadores mas pode ser falso
   * confiante: o dono deve revisar antes de confirmar. */
  revisar?: boolean;
  /** Células da linha que o dono precisa conferir (quando a origem é uma
   * imagem). */
  celulasRevisar?: OcrCelulaRevisar[];
}

export interface ImportValidationSummary {
  totalRows: number;
  validRows: number;
  skippedRows: number;
  failedRows: number;
  results: ImportRowValidation[];
  warnings: string[];
}

/** Uma aba do plano que o dono envia (mapa + opções). */
export interface ImportSheetPlanInput {
  sheetName: string | null;
  targetType: ImportTargetType;
  columns: Record<string, ImportFieldKey>;
  options: ImportOptions;
}

export interface ImportBatchDetail extends ImportBatchSummary {
  mapping: { version?: number; sheets?: unknown[] } | { columns: Record<string, string>; options: ImportOptions } | null;
  counts: Record<string, number>;
  rows: {
    id: string;
    sheetName: string;
    rowNumber: number;
    status: ImportRowStatus;
    entityType: ImportEntityType | null;
    errorMessage: string | null;
  }[];
}

export interface ImportUndoResult {
  batchId: string;
  removed: number;
  kept: number;
  details: {
    entityType: string;
    entityId: string;
    action: 'removed' | 'kept' | 'restored';
    reason?: string;
  }[];
}

const base = (barbershopId: string) =>
  `/api/barbershops/${encodeURIComponent(barbershopId)}/imports`;

/** Token da sessão (o `apiClient` fala JSON e não lê o storage sozinho). */
const token = () => authStorage.getAccessToken() || '';

/** Envia o arquivo e cria o lote. */
export async function uploadImportFile(
  barbershopId: string,
  file: File
): Promise<ImportUploadResult> {
  const accessToken = token();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}${base(barbershopId)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
    body: formData,
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw erroDeUpload(bodyText, response.status);
  }

  const parsed = JSON.parse(bodyText) as { data?: ImportUploadResult };
  if (!parsed.data) throw new Error('O servidor não devolveu os dados da importação.');
  return parsed.data;
}

/** Uma aba escolhida na etapa de alvo: nome + tipo que ela importa. */
export interface ImportSheetTargetChoice {
  sheetName: string | null;
  targetType: ImportTargetType;
}

/**
 * Escolhe o que cada aba importa.
 *
 * `sheets` (multi-aba) tem prioridade; `targetType`/`sheetName` atendem o
 * arquivo de aba única.
 */
export async function configureImportTarget(
  barbershopId: string,
  batchId: string,
  sheets: ImportSheetTargetChoice[]
): Promise<ImportTargetResult>;
export async function configureImportTarget(
  barbershopId: string,
  batchId: string,
  targetType: ImportTargetType,
  sheetName?: string | null
): Promise<ImportTargetResult>;
export async function configureImportTarget(
  barbershopId: string,
  batchId: string,
  targetOrSheets: ImportTargetType | ImportSheetTargetChoice[],
  sheetName?: string | null
): Promise<ImportTargetResult> {
  const body = Array.isArray(targetOrSheets)
    ? { sheets: targetOrSheets }
    : { targetType: targetOrSheets, sheetName: sheetName ?? null };

  const res = await apiClient<{ data: ImportTargetResult }>(
    `${base(barbershopId)}/${batchId}/target`,
    'PATCH',
    body,
    token()
  );
  return res.data;
}

/** Salva o mapeamento de colunas e as opções de cada aba. */
export async function saveImportMapping(
  barbershopId: string,
  batchId: string,
  sheets: ImportSheetPlanInput[]
): Promise<{ id: string; status: ImportBatchStatus }> {
  const res = await apiClient<{ data: { id: string; status: ImportBatchStatus } }>(
    `${base(barbershopId)}/${batchId}/mapping`,
    'PATCH',
    { sheets },
    token()
  );
  return res.data;
}

/** Dry-run: mostra o que entra e o que é rejeitado. */
export async function validateImportBatch(
  barbershopId: string,
  batchId: string
): Promise<ImportValidationSummary> {
  const res = await apiClient<{ data: ImportValidationSummary }>(
    `${base(barbershopId)}/${batchId}/validate`,
    'POST',
    {},
    token()
  );
  return res.data;
}

/** O que o dono faz com uma célula lida por OCR. */
export interface OcrCelulaRevisao {
  linha: number;
  coluna: number;
  /** Valor corrigido pelo dono (omitido quando ele só aceita o que leu). */
  valor?: string;
  /** Aceita o valor lido como está. */
  aceitar?: boolean;
}

/**
 * Corrige (ou aceita) uma célula lida por OCR.
 *
 * O backend reescreve o CSV do lote a partir do valor novo e **revalida** o
 * lote inteiro: a resposta é a nova prévia, com a célula já fora da fila de
 * revisão.
 */
export async function reviewImportCell(
  barbershopId: string,
  batchId: string,
  revisao: OcrCelulaRevisao
): Promise<ImportValidationSummary> {
  const res = await apiClient<{ data: ImportValidationSummary }>(
    `${base(barbershopId)}/${batchId}/review`,
    'PATCH',
    revisao,
    token()
  );
  return res.data;
}

/** Confirma e enfileira o processamento. */
export async function confirmImportBatch(
  barbershopId: string,
  batchId: string
): Promise<{ id: string; status: ImportBatchStatus }> {
  const res = await apiClient<{ data: { id: string; status: ImportBatchStatus } }>(
    `${base(barbershopId)}/${batchId}/confirm`,
    'POST',
    {},
    token()
  );
  return res.data;
}

/** Detalhe do lote (progresso e linhas com problema). */
export async function getImportBatch(
  barbershopId: string,
  batchId: string
): Promise<ImportBatchDetail> {
  const res = await apiClient<{ data: ImportBatchDetail }>(
    `${base(barbershopId)}/${batchId}`,
    'GET',
    undefined,
    token()
  );
  return res.data;
}

/** Histórico de importações. */
export async function listImportBatches(barbershopId: string): Promise<ImportBatchSummary[]> {
  const res = await apiClient<{ data: ImportBatchSummary[] }>(
    base(barbershopId),
    'GET',
    undefined,
    token()
  );
  return res.data;
}

/** Lote que pode ser retomado (o dono saiu da tela no meio). */
export async function getActiveImportBatch(
  barbershopId: string
): Promise<ImportBatchSummary | null> {
  const res = await apiClient<{ data: ImportBatchSummary | null }>(
    `${base(barbershopId)}/active`,
    'GET',
    undefined,
    token()
  );
  return res.data;
}

/** Desfaz a importação (janela de 30 dias). */
export async function undoImportBatch(
  barbershopId: string,
  batchId: string
): Promise<ImportUndoResult> {
  const res = await apiClient<{ data: ImportUndoResult }>(
    `${base(barbershopId)}/${batchId}/undo`,
    'POST',
    {},
    token()
  );
  return res.data;
}

/** Cancela um lote abandonado. */
export async function cancelImportBatch(
  barbershopId: string,
  batchId: string
): Promise<{ id: string; status: ImportBatchStatus }> {
  const res = await apiClient<{ data: { id: string; status: ImportBatchStatus } }>(
    `${base(barbershopId)}/${batchId}/cancel`,
    'POST',
    {},
    token()
  );
  return res.data;
}

/** Link de download do modelo (.xlsx) e do CSV de erros. */
export function importTemplateUrl(barbershopId: string, target: ImportTargetType): string {
  return `${API_BASE}${base(barbershopId)}/template?target=${target}`;
}

export function importErrorsCsvUrl(barbershopId: string, batchId: string): string {
  return `${API_BASE}${base(barbershopId)}/${batchId}/errors.csv`;
}

/**
 * Erro do upload (multipart) como `ApiError`.
 *
 * O upload não passa pelo `apiClient` (que só fala JSON), então o corpo da
 * resposta é interpretado aqui — e o `code` do backend é preservado: é ele
 * que permite dizer "a imagem é grande demais" em vez de "algo deu errado".
 */
function erroDeUpload(bodyText: string, status: number): ApiError {
  let body: Record<string, unknown> | null = null;
  try {
    const parsed = JSON.parse(bodyText) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    /* corpo não-JSON: a mensagem genérica abaixo cobre */
  }
  const message =
    body && typeof body.message === 'string'
      ? body.message
      : `Falha ao enviar o arquivo (${status}).`;
  const code = body && typeof body.code === 'string' ? body.code : undefined;
  return new ApiError(message, status, code, body ?? undefined);
}
