import { postsApi } from './postsApi';
import { apiClient, apiFetch, ACCESS_BLOCKED_EVENT } from './apiClient';

vi.mock('./apiClient', async importOriginal => ({
  ...await importOriginal<typeof import('./apiClient')>(), apiClient: vi.fn(), apiFetch: vi.fn(),
}));

function response(status: number, body: unknown): Response {
  return { ok: status >= 200 && status < 300, status, json: vi.fn().mockResolvedValue(body) } as unknown as Response;
}

beforeEach(() => { vi.resetAllMocks(); });

describe('postsApi media', () => {
  it('unwraps the uploaded image and submits a multipart file', async () => {
    const media = { id: 'media-1', url: 'https://images.example/photo.png', mimeType: 'image/png', size: 20, createdAt: '2026-10-27' };
    vi.mocked(apiFetch).mockResolvedValue(response(201, { success: true, data: media }));
    const file = new File(['png'], 'photo.png', { type: 'image/png' });
    await expect(postsApi.uploadMedia('shop-1', file)).resolves.toEqual(media);
    const [url, init] = vi.mocked(apiFetch).mock.calls[0];
    expect(url).toBe('/api/posts/media/shop-1');
    expect(init?.method).toBe('POST');
    expect((init?.body as FormData).get('file')).toBe(file);
  });

  it('shows the backend message rather than raw JSON when an upload fails', async () => {
    vi.mocked(apiFetch).mockResolvedValue(response(400, { success: false, message: 'A imagem parece corrompida.' }));
    await expect(postsApi.uploadMedia('shop-1', new File(['x'], 'photo.png'))).rejects.toMatchObject({ name: 'ApiError', statusCode: 400, message: 'A imagem parece corrompida.' });
  });

  it('preserves subscription blocks and notifies the access boundary', async () => {
    const blocked = vi.fn();
    window.addEventListener(ACCESS_BLOCKED_EVENT, blocked);
    try {
      vi.mocked(apiFetch).mockResolvedValue(response(403, { success: false, message: 'Assinatura necessária', code: 'SUBSCRIPTION_REQUIRED' }));
      await expect(postsApi.uploadMedia('shop-1', new File(['x'], 'photo.png'))).rejects.toMatchObject({ code: 'SUBSCRIPTION_REQUIRED', statusCode: 403 });
      expect(blocked).toHaveBeenCalledOnce();
      expect((blocked.mock.calls[0][0] as CustomEvent).detail).toMatchObject({ code: 'SUBSCRIPTION_REQUIRED', statusCode: 403 });
    } finally {
      window.removeEventListener(ACCESS_BLOCKED_EVENT, blocked);
    }
  });

  it('reports a useful size error even when a proxy returns non-JSON', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: false, status: 413, json: vi.fn().mockRejectedValue(new Error('HTML response')) } as unknown as Response);
    await expect(postsApi.uploadMedia('shop-1', new File(['x'], 'photo.png'))).rejects.toMatchObject({ statusCode: 413, message: expect.stringContaining('5 MB') });
  });

  it('does not treat a malformed success response as a completed upload', async () => {
    vi.mocked(apiFetch).mockResolvedValue(response(201, { success: true, data: {} }));
    await expect(postsApi.uploadMedia('shop-1', new File(['x'], 'photo.png'))).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('rejects an invalid library response before the editor tries to render it', async () => {
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: null });
    await expect(postsApi.listMedia('shop-1')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: [] });
    await expect(postsApi.listMedia('shop-1')).resolves.toEqual([]);
  });
});
