/// <reference types="vitest/globals" />
vi.mock('./apiClient', () => ({
  apiClient: vi.fn(),
  apiFetch: vi.fn(),
}));
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: () => 'test-token' } }));

import { apiClient, apiFetch } from './apiClient';
import { postsApi } from './postsApi';

const mockedFetch = vi.mocked(apiFetch);
const mockedClient = vi.mocked(apiClient);
const shop = '11111111-1111-1111-1111-111111111111';
const file = new File(['x'], 'foto.png', { type: 'image/png' });

function jsonResponse(status: number, body: string) {
  return new Response(body, { status, headers: { 'Content-Type': 'application/json' } });
}

describe('postsApi.uploadMedia — erros amigáveis', () => {
  beforeEach(() => vi.clearAllMocks());

  it('extrai message do corpo JSON quando presente', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse(400, JSON.stringify({ message: 'Formato inválido do arquivo.' })));
    await expect(postsApi.uploadMedia(shop, file)).rejects.toThrow('Formato inválido do arquivo.');
  });

  it('extrai error aninhado quando message não existe', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse(400, JSON.stringify({ error: { message: 'Arquivo corrompido.' } })));
    await expect(postsApi.uploadMedia(shop, file)).rejects.toThrow('Arquivo corrompido.');
  });

  it('413 vira mensagem de tamanho sem expor o corpo cru', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse(413, JSON.stringify({ statusCode: 413, error: 'Payload Too Large', message: 'request entity too large' })));
    await expect(postsApi.uploadMedia(shop, file)).rejects.toThrow(/muito grande.*5 MB/i);
  });

  it('415 vira mensagem de formato', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse(415, '<html>Unsupported Media Type</html>'));
    await expect(postsApi.uploadMedia(shop, file)).rejects.toThrow(/Formato de imagem não suportado/);
  });

  it('429 vira mensagem de rate limit', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse(429, ''));
    await expect(postsApi.uploadMedia(shop, file)).rejects.toThrow(/Muitos envios/);
  });

  it('5xx vira mensagem de servidor', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse(502, '<html>Bad Gateway</html>'));
    await expect(postsApi.uploadMedia(shop, file)).rejects.toThrow(/servidor falhou/i);
  });

  it('descarta message que ainda parece payload serializado', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse(400, JSON.stringify({ message: '{"statusCode":400,"foo":1}' })));
    await expect(postsApi.uploadMedia(shop, file)).rejects.toThrow(/Não foi possível enviar a imagem/);
  });
});

describe('postsApi — galeria (inGallery)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('listMedia filtra pela galeria quando solicitado', async () => {
    mockedClient.mockResolvedValueOnce({ success: true, data: [] });
    await postsApi.listMedia(shop, { inGallery: true });
    expect(mockedClient).toHaveBeenCalledWith(
      expect.stringContaining('inGallery=true'),
      'GET', undefined, 'test-token'
    );
  });

  it('uploadMedia envia inGallery no FormData antes do arquivo', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse(201, JSON.stringify({ success: true, data: { id: 'm1' } })));
    await postsApi.uploadMedia(shop, file, { inGallery: true });
    const [, init] = mockedFetch.mock.calls[0] as unknown as [string, RequestInit];
    const form = init.body as FormData;
    expect(form.get('inGallery')).toBe('true');
    expect(form.get('file')).toBeInstanceOf(File);
    // field antes do file: o Fastify multipart só lê fields que chegam antes do stream
    expect([...form.keys()][0]).toBe('inGallery');
  });

  it('updateMedia faz PATCH com a flag', async () => {
    mockedClient.mockResolvedValueOnce({ success: true, data: { id: 'm1' } });
    await postsApi.updateMedia('m1', { inGallery: false });
    expect(mockedClient).toHaveBeenCalledWith(
      '/api/posts/media/m1', 'PATCH', { inGallery: false }, 'test-token'
    );
  });
});
