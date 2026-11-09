/// <reference types="vitest/globals" />
import { apiClient, ApiError } from './apiClient';
import { reviewImportCell, uploadImportFile } from './dataImportApi';

vi.mock('./apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./apiClient')>();
  return { ...actual, apiClient: vi.fn() };
});
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: () => 'test-token' } }));

const request = vi.mocked(apiClient);

describe('dataImportApi — contrato da revisão de célula do OCR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('corrige a célula com PATCH na rota de revisão e devolve a prévia nova', async () => {
    const summary = { totalRows: 1, validRows: 1, skippedRows: 0, failedRows: 0, results: [], warnings: [] };
    request.mockResolvedValue({ data: summary });

    const resultado = await reviewImportCell('shop-1', 'batch-9', {
      linha: 2,
      coluna: 1,
      valor: '11999998888',
    });

    expect(resultado).toBe(summary);
    expect(request).toHaveBeenCalledWith(
      '/api/barbershops/shop-1/imports/batch-9/review',
      'PATCH',
      { linha: 2, coluna: 1, valor: '11999998888' },
      'test-token'
    );
  });
});

describe('dataImportApi — erro do upload preserva o código do servidor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('levanta ApiError com o code e a mensagem que o backend mandou', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 413,
      text: async () =>
        JSON.stringify({
          success: false,
          code: 'OCR_IMAGE_TOO_LARGE',
          message: 'A imagem passa de 10 MB. Envie uma imagem menor.',
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const arquivo = new File(['x'], 'foto.png', { type: 'image/png' });
    await expect(uploadImportFile('shop-1', arquivo)).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 413,
      code: 'OCR_IMAGE_TOO_LARGE',
      message: 'A imagem passa de 10 MB. Envie uma imagem menor.',
    });

    vi.unstubAllGlobals();
  });

  it('usa a mensagem genérica quando o corpo não é JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'erro interno',
    });
    vi.stubGlobal('fetch', fetchMock);

    const arquivo = new File(['x'], 'foto.png', { type: 'image/png' });
    const erro = await uploadImportFile('shop-1', arquivo).catch((err: unknown) => err);
    expect(erro).toBeInstanceOf(ApiError);
    expect((erro as ApiError).message).toBe('Falha ao enviar o arquivo (500).');

    vi.unstubAllGlobals();
  });
});
