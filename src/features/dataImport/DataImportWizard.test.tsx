/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DataImportWizard } from './DataImportWizard';
import {
  configureImportTarget,
  confirmImportBatch,
  getActiveImportBatch,
  getImportBatch,
  listImportBatches,
  saveImportMapping,
  undoImportBatch,
  uploadImportFile,
  validateImportBatch,
  type ImportBatchDetail,
  type ImportTargetResult,
  type ImportUploadResult,
  type ImportValidationSummary,
} from '../../infra/dataImportApi';

vi.mock('../../infra/dataImportApi', () => ({
  uploadImportFile: vi.fn(),
  configureImportTarget: vi.fn(),
  saveImportMapping: vi.fn(),
  validateImportBatch: vi.fn(),
  confirmImportBatch: vi.fn(),
  getImportBatch: vi.fn(),
  listImportBatches: vi.fn(),
  getActiveImportBatch: vi.fn(),
  undoImportBatch: vi.fn(),
  cancelImportBatch: vi.fn(),
  importTemplateUrl: (shop: string, target: string) => `/api/imports/${shop}/template?target=${target}`,
  importErrorsCsvUrl: (shop: string, batch: string) => `/api/imports/${shop}/${batch}/errors.csv`,
}));

const SHOP = 'shop-1';
const BATCH = 'batch-1';

function uploadResult(): ImportUploadResult {
  return {
    id: BATCH,
    fileName: 'clientes.csv',
    fileFormat: 'CSV',
    targetType: 'CLIENTS',
    status: 'UPLOADED',
    sheetNames: [],
    selectedSheet: null,
    headers: ['Nome', 'WhatsApp'],
    preview: [{ Nome: 'Ana', WhatsApp: '11987654321' }],
    totalRows: 1,
    sheets: [
      {
        sheetName: null,
        headers: ['Nome', 'WhatsApp'],
        preview: [{ Nome: 'Ana', WhatsApp: '11987654321' }],
        totalRows: 1,
      },
    ],
    createdAt: '2026-11-01T12:00:00.000Z',
    expiresAt: '2026-12-01T12:00:00.000Z',
  };
}

const OPTIONS_FIXTURE = {
  updateExisting: true,
  countFinancialValues: false,
  sendReviewInvitations: false,
  includeCase: false,
  replaceExistingSchedules: false,
  importTimeOffAsPending: false,
  updateExistingProducts: true,
  createProductCategories: true,
  sendFiadoReminders: false,
};

function targetResult(): ImportTargetResult {
  return {
    id: BATCH,
    targetType: 'CLIENTS',
    status: 'MAPPING',
    sheetNames: [],
    selectedSheet: null,
    headers: ['Nome', 'WhatsApp'],
    fields: [
      {
        key: 'name',
        label: 'cliente',
        required: true,
        type: 'text',
        synonyms: ['nome'],
      },
      {
        key: 'whatsapp',
        label: 'WhatsApp',
        required: true,
        type: 'phone',
        synonyms: ['whatsapp'],
      },
    ],
    detectedColumns: { name: 0, whatsapp: 1 },
    preview: [{ Nome: 'Ana', WhatsApp: '11987654321' }],
    totalRows: 1,
    sheets: [
      {
        sheetName: null,
        targetType: 'CLIENTS',
        fields: [
          {
            key: 'name',
            label: 'cliente',
            required: true,
            type: 'text',
            synonyms: ['nome'],
          },
          {
            key: 'whatsapp',
            label: 'WhatsApp',
            required: true,
            type: 'phone',
            synonyms: ['whatsapp'],
          },
        ],
        detectedColumns: { name: 0, whatsapp: 1 },
        columns: { '0': 'name', '1': 'whatsapp' },
        options: OPTIONS_FIXTURE,
        missing: [],
        totalRows: 1,
        preview: [{ Nome: 'Ana', WhatsApp: '11987654321' }],
        warnings: [],
      },
    ],
  };
}

function validationSummary(): ImportValidationSummary {
  return {
    totalRows: 3,
    validRows: 2,
    skippedRows: 0,
    failedRows: 1,
    results: [
      { rowNumber: 1, status: 'VALID' },
      { rowNumber: 2, status: 'VALID' },
      { rowNumber: 3, status: 'FAILED', message: 'Telefone inválido' },
    ],
    warnings: [],
  };
}

function detail(overrides: Partial<ImportBatchDetail> = {}): ImportBatchDetail {
  return {
    id: BATCH,
    fileName: 'clientes.csv',
    fileFormat: 'CSV',
    targetType: 'CLIENTS',
    status: 'COMPLETED',
    sheetName: null,
    totalRows: 3,
    processedRows: 3,
    importedRows: 2,
    failedRows: 1,
    skippedRows: 0,
    errorMessage: null,
    createdAt: '2026-11-01T12:00:00.000Z',
    finishedAt: '2026-11-01T12:05:00.000Z',
    undoneAt: null,
    expiresAt: '2026-12-01T12:00:00.000Z',
    canUndo: true,
    mapping: null,
    counts: {},
    rows: [],
    ...overrides,
  };
}

function arquivo(): File {
  return new File(['Nome;WhatsApp\nAna;11987654321'], 'clientes.csv', { type: 'text/csv' });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listImportBatches).mockResolvedValue([]);
  vi.mocked(getActiveImportBatch).mockResolvedValue(null);
  vi.mocked(uploadImportFile).mockResolvedValue(uploadResult());
  vi.mocked(configureImportTarget).mockResolvedValue(targetResult());
  vi.mocked(saveImportMapping).mockResolvedValue({ id: BATCH, status: 'MAPPING' });
  vi.mocked(validateImportBatch).mockResolvedValue(validationSummary());
  vi.mocked(confirmImportBatch).mockResolvedValue({ id: BATCH, status: 'PROCESSING' });
  vi.mocked(getImportBatch).mockResolvedValue(detail());
  vi.mocked(undoImportBatch).mockResolvedValue({
    batchId: BATCH,
    removed: 2,
    kept: 0,
    details: [],
  });
});

describe('DataImportWizard', () => {
  it('começa na etapa de arquivo', async () => {
    render(<DataImportWizard barbershopId={SHOP} onNotify={vi.fn()} />);
    expect(await screen.findByTestId('import-step-upload')).toBeInTheDocument();
  });

  it('envia o arquivo e avança para a escolha do alvo', async () => {
    render(<DataImportWizard barbershopId={SHOP} onNotify={vi.fn()} />);

    const input = await screen.findByTestId('import-file-input');
    fireEvent.change(input, { target: { files: [arquivo()] } });

    expect(await screen.findByTestId('import-step-target')).toBeInTheDocument();
    expect(uploadImportFile).toHaveBeenCalledWith(SHOP, expect.any(File));
  });

  it('escolhe o alvo e mostra o mapa de colunas', async () => {
    render(<DataImportWizard barbershopId={SHOP} onNotify={vi.fn()} />);

    fireEvent.change(await screen.findByTestId('import-file-input'), {
      target: { files: [arquivo()] },
    });
    await screen.findByTestId('import-step-target');

    fireEvent.click(screen.getByRole('radio', { name: /Serviços/ }));
    fireEvent.click(screen.getByTestId('import-target-continue'));

    expect(await screen.findByTestId('import-step-mapping')).toBeInTheDocument();
    expect(configureImportTarget).toHaveBeenCalledWith(SHOP, BATCH, [
      { sheetName: null, targetType: 'SERVICES' },
    ]);
  });

  it('mostra a prévia da validação antes de confirmar', async () => {
    render(<DataImportWizard barbershopId={SHOP} onNotify={vi.fn()} />);

    fireEvent.change(await screen.findByTestId('import-file-input'), {
      target: { files: [arquivo()] },
    });
    await screen.findByTestId('import-step-target');
    fireEvent.click(screen.getByTestId('import-target-continue'));
    await screen.findByTestId('import-step-mapping');
    fireEvent.click(screen.getByTestId('import-mapping-continue'));

    expect(await screen.findByTestId('import-step-review')).toBeInTheDocument();
    expect(screen.getByTestId('import-valid-count')).toHaveTextContent('2');
    expect(screen.getByText(/Telefone inválido/)).toBeInTheDocument();
  });

  it('confirma e mostra o resultado da importação', async () => {
    render(<DataImportWizard barbershopId={SHOP} onNotify={vi.fn()} />);

    fireEvent.change(await screen.findByTestId('import-file-input'), {
      target: { files: [arquivo()] },
    });
    await screen.findByTestId('import-step-target');
    fireEvent.click(screen.getByTestId('import-target-continue'));
    await screen.findByTestId('import-step-mapping');
    fireEvent.click(screen.getByTestId('import-mapping-continue'));
    await screen.findByTestId('import-step-review');
    fireEvent.click(screen.getByTestId('import-review-confirm'));

    expect(await screen.findByTestId('import-step-done')).toBeInTheDocument();
    expect(confirmImportBatch).toHaveBeenCalledWith(SHOP, BATCH);
    await waitFor(() =>
      expect(screen.getByTestId('import-imported-count')).toHaveTextContent('2')
    );
  });

  it('permite desfazer a importação concluída', async () => {
    render(<DataImportWizard barbershopId={SHOP} onNotify={vi.fn()} />);

    fireEvent.change(await screen.findByTestId('import-file-input'), {
      target: { files: [arquivo()] },
    });
    await screen.findByTestId('import-step-target');
    fireEvent.click(screen.getByTestId('import-target-continue'));
    await screen.findByTestId('import-step-mapping');
    fireEvent.click(screen.getByTestId('import-mapping-continue'));
    await screen.findByTestId('import-step-review');
    fireEvent.click(screen.getByTestId('import-review-confirm'));
    await screen.findByTestId('import-step-done');

    const undo = await screen.findByTestId('import-undo-button');
    fireEvent.click(undo);

    await waitFor(() => expect(undoImportBatch).toHaveBeenCalledWith(SHOP, BATCH));
  });

  it('mostra o erro do servidor sem quebrar o assistente', async () => {
    vi.mocked(uploadImportFile).mockRejectedValue(new Error('Formato não suportado.'));
    const onNotify = vi.fn();

    render(<DataImportWizard barbershopId={SHOP} onNotify={onNotify} />);

    fireEvent.change(await screen.findByTestId('import-file-input'), {
      target: { files: [arquivo()] },
    });

    expect(await screen.findByTestId('import-error')).toHaveTextContent(
      'Formato não suportado.'
    );
    expect(onNotify).toHaveBeenCalledWith('Formato não suportado.', 'error');
  });

  it('retoma um lote que ficou pela metade', async () => {
    vi.mocked(getActiveImportBatch).mockResolvedValue({
      id: BATCH,
      fileName: 'clientes.csv',
      fileFormat: 'CSV',
      targetType: 'CLIENTS',
      status: 'AWAITING_CONFIRMATION',
      sheetName: null,
      totalRows: 3,
      processedRows: 0,
      importedRows: 0,
      failedRows: 0,
      skippedRows: 0,
      errorMessage: null,
      createdAt: '2026-11-01T12:00:00.000Z',
      finishedAt: null,
      undoneAt: null,
      expiresAt: '2026-12-01T12:00:00.000Z',
      canUndo: false,
    });

    render(<DataImportWizard barbershopId={SHOP} onNotify={vi.fn()} />);

    expect(await screen.findByTestId('import-step-review')).toBeInTheDocument();
  });

  it('mostra a atribuição de tipo por aba em planilha multi-aba', async () => {
    vi.mocked(uploadImportFile).mockResolvedValue({
      ...uploadResult(),
      fileName: 'tudo.xlsx',
      fileFormat: 'XLSX',
      sheetNames: ['Clientes', 'Serviços'],
      sheets: [
        { sheetName: 'Clientes', headers: ['Nome'], preview: [{ Nome: 'Ana' }], totalRows: 1 },
        { sheetName: 'Serviços', headers: ['Serviço'], preview: [{ Serviço: 'Corte' }], totalRows: 1 },
      ],
    });
    vi.mocked(configureImportTarget).mockResolvedValue({
      ...targetResult(),
      targetType: 'MIXED',
      sheetNames: ['Clientes', 'Serviços'],
      sheets: [
        {
          sheetName: 'Clientes',
          targetType: 'CLIENTS',
          fields: [{ key: 'name', label: 'cliente', required: true, type: 'text', synonyms: ['nome'] }],
          detectedColumns: { name: 0 },
          columns: { '0': 'name' },
          options: OPTIONS_FIXTURE,
          missing: [],
          totalRows: 1,
          preview: [{ Nome: 'Ana' }],
          warnings: [],
        },
        {
          sheetName: 'Serviços',
          targetType: 'SERVICES',
          fields: [{ key: 'serviceName', label: 'serviço', required: true, type: 'text', synonyms: ['servico'] }],
          detectedColumns: { serviceName: 0 },
          columns: { '0': 'serviceName' },
          options: OPTIONS_FIXTURE,
          missing: [],
          totalRows: 1,
          preview: [{ Serviço: 'Corte' }],
          warnings: [],
        },
      ],
    });

    render(<DataImportWizard barbershopId={SHOP} onNotify={vi.fn()} />);

    fireEvent.change(await screen.findByTestId('import-file-input'), {
      target: { files: [new File(['x'], 'tudo.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })] },
    });

    const assignments = await screen.findByTestId('import-sheet-assignments');
    expect(assignments).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('import-sheet-target-Clientes-CLIENTS'));
    fireEvent.click(screen.getByTestId('import-sheet-target-Serviços-SERVICES'));
    fireEvent.click(screen.getByTestId('import-target-continue'));

    expect(await screen.findByTestId('import-step-mapping')).toBeInTheDocument();
    expect(configureImportTarget).toHaveBeenCalledWith(SHOP, BATCH, [
      { sheetName: 'Clientes', targetType: 'CLIENTS' },
      { sheetName: 'Serviços', targetType: 'SERVICES' },
    ]);
    // Abas com mapeamento próprio: um seletor no topo da etapa de mapa.
    expect(screen.getByTestId('import-mapping-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('import-mapping-tab-Clientes')).toBeInTheDocument();
    expect(screen.getByTestId('import-mapping-tab-Serviços')).toBeInTheDocument();
  });
});
