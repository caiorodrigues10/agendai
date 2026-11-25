import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from './apiClient';
import { postsApi, type DesignCatalog } from './postsApi';

vi.mock('./apiClient', async importOriginal => {
  const actual = await importOriginal<typeof import('./apiClient')>();
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

const catalogPayload = {
  success: true,
  data: {
    segment: 'BARBERSHOP',
    designs: [],
    etag: '"etag-1"',
    advertisingRestricted: false,
    icons: ['scissors'],
  },
};

function jsonResponse(status: number, body?: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers({ etag: '"etag-1"' }),
    json: async () => body,
    text: async () => JSON.stringify(body ?? {}),
  } as unknown as Response;
}

beforeEach(() => {
  postsApi.clearDesignCache();
});

describe('postsApi.listDesigns — revalidação ETag/304', () => {
  it('reaproveita o payload cacheado quando o servidor responde 304', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(jsonResponse(200, catalogPayload))
      .mockResolvedValueOnce(jsonResponse(304));

    const first = await postsApi.listDesigns('shop-1');
    const second = await postsApi.listDesigns('shop-1');

    expect(first.notModified).toBeUndefined();
    expect(second.notModified).toBe(true);
    expect(second.designs).toEqual(first.designs);
    expect(vi.mocked(apiFetch).mock.calls[1]?.[1]?.headers).toEqual({
      'If-None-Match': '"etag-1"',
    });
  });

  it('refaz a requisição sem ETag quando recebe 304 sem cache local', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(jsonResponse(304))
      .mockResolvedValueOnce(jsonResponse(200, catalogPayload));

    const result = await postsApi.listDesigns('shop-1', { etag: '"etag-1"' });

    expect(result.segment).toBe('BARBERSHOP');
    expect(result.designs).toEqual([]);
    expect(vi.mocked(apiFetch).mock.calls[0]?.[1]?.headers).toEqual({
      'If-None-Match': '"etag-1"',
    });
    expect(vi.mocked(apiFetch).mock.calls[1]?.[1]?.headers).toBeUndefined();
  });

  it('não transforma 304 repetido em catálogo vazio', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(jsonResponse(304))
      .mockResolvedValueOnce(jsonResponse(304));

    await expect(
      postsApi.listDesigns('shop-1', { etag: '"etag-1"' }),
    ).rejects.toMatchObject({ statusCode: 304 });
  });

  it('mantém o catálogo em memória por salão', async () => {
    const result: DesignCatalog = {
      segment: 'BARBERSHOP',
      designs: [],
      etag: '"etag-1"',
      advertisingRestricted: false,
      icons: [],
    };
    vi.mocked(apiFetch).mockResolvedValueOnce(jsonResponse(200, catalogPayload));
    await postsApi.listDesigns('shop-1');
    expect(result.designs).toEqual([]);
  });
});
