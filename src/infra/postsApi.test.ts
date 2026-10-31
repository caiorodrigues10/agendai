import { postsApi } from './postsApi';
import { apiClient } from './apiClient';

vi.mock('./apiClient', async importOriginal => ({
  ...await importOriginal<typeof import('./apiClient')>(), apiClient: vi.fn(),
}));

afterEach(() => { vi.useRealTimers(); vi.resetAllMocks(); });

describe('postsApi.preview', () => {
  it('extrai imageUrl do envelope e mantém os parâmetros da arte', async () => {
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: { imageUrl: 'data:image/png;base64,abc' } });
    await expect(postsApi.preview('shop-1', { templateKey: 'novidade', paletteKey: 'rose', format: 'story', title: 'Novidade do salão' })).resolves.toBe('data:image/png;base64,abc');
    const [url, method, , , options] = vi.mocked(apiClient).mock.calls[0];
    const query = new URL(url, 'http://localhost').searchParams;
    expect(method).toBe('GET');
    expect(query.get('paletteKey')).toBe('rose');
    expect(query.get('templateKey')).toBe('novidade');
    expect(query.get('format')).toBe('story');
    expect(query.get('title')).toBe('Novidade do salão');
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it('rejeita respostas de sucesso sem imagem para não deixar o editor vazio', async () => {
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: {} });
    await expect(postsApi.preview('shop-1', {})).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('interrompe uma API travada e devolve erro recuperável', async () => {
    vi.useFakeTimers();
    // Inclui uma renovação de sessão ou outra etapa que não respeite abort.
    vi.mocked(apiClient).mockImplementation(() => new Promise(() => undefined));
    const preview = postsApi.preview('shop-1', {});
    const result = expect(preview).rejects.toMatchObject({ code: 'POST_PREVIEW_TIMEOUT' });
    await vi.advanceTimersByTimeAsync(30_000);
    await result;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('propaga cancelamento ao trocar a arte e libera o timer', async () => {
    vi.useFakeTimers();
    vi.mocked(apiClient).mockImplementation((_url, _method, _body, _token, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }));
    const controller = new AbortController();
    const preview = postsApi.preview('shop-1', {}, { signal: controller.signal });
    const result = expect(preview).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await result;
    expect(vi.getTimerCount()).toBe(0);
  });
});
