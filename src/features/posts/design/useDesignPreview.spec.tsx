import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../infra/apiClient';
import type { DesignPreviewResult, PreviewDesignPayload } from '../../../infra/postsApi';
import { postsApi } from '../../../infra/postsApi';
import { DESIGN_PREVIEW_DEBOUNCE_MS, useDesignPreview } from './useDesignPreview';

vi.mock('../../../infra/postsApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../infra/postsApi')>();
  return {
    ...actual,
    postsApi: {
      ...actual.postsApi,
      previewDesign: vi.fn(),
    },
  };
});

const previewResult: DesignPreviewResult = {
  imageUrl: 'data:image/jpeg;base64,preview',
  warnings: [],
  suggestions: {},
  width: 540,
};

const payloadA: PreviewDesignPayload = {
  barbershopId: 'shop-1',
  designKey: 'barbershop-ouro-escuro',
  designVersion: 1,
  format: 'portrait',
  data: { headline: 'A' },
};

const payloadB: PreviewDesignPayload = {
  ...payloadA,
  data: { headline: 'B' },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDesignPreview', () => {
  it('aguarda o debounce antes de pedir a prévia', async () => {
    vi.mocked(postsApi.previewDesign).mockResolvedValue(previewResult);
    const { result } = renderHook(() => useDesignPreview(payloadA));

    expect(postsApi.previewDesign).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(DESIGN_PREVIEW_DEBOUNCE_MS - 1);
      await Promise.resolve();
    });
    expect(postsApi.previewDesign).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(postsApi.previewDesign).toHaveBeenCalledTimes(1);
    expect(postsApi.previewDesign).toHaveBeenCalledWith(payloadA, expect.any(AbortSignal));
    expect(result.current.preview).toEqual(previewResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('cancela a requisição anterior e descarta resposta fora de ordem', async () => {
    const first = deferred<DesignPreviewResult>();
    const second = deferred<DesignPreviewResult>();
    vi.mocked(postsApi.previewDesign)
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);

    const { result, rerender } = renderHook(
      ({ payload }) => useDesignPreview(payload),
      { initialProps: { payload: payloadA } },
    );

    await act(async () => {
      vi.advanceTimersByTime(DESIGN_PREVIEW_DEBOUNCE_MS);
      await Promise.resolve();
    });

    const firstSignal = vi.mocked(postsApi.previewDesign).mock.calls[0]?.[1];
    expect(firstSignal).toBeInstanceOf(AbortSignal);
    expect(firstSignal?.aborted).toBe(false);

    rerender({ payload: payloadB });
    expect(firstSignal?.aborted).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(DESIGN_PREVIEW_DEBOUNCE_MS);
      await Promise.resolve();
    });

    await act(async () => {
      first.resolve({ ...previewResult, imageUrl: 'data:image/jpeg;base64,old' });
      second.resolve({ ...previewResult, imageUrl: 'data:image/jpeg;base64,new' });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.preview?.imageUrl).toBe('data:image/jpeg;base64,new');
    expect(result.current.preview?.imageUrl).not.toContain('old');
  });

  it('limpa a prévia quando o payload é removido', async () => {
    vi.mocked(postsApi.previewDesign).mockResolvedValue(previewResult);
    const { result, rerender } = renderHook(
      ({ payload }) => useDesignPreview(payload),
      { initialProps: { payload: payloadA as PreviewDesignPayload | null } },
    );

    await act(async () => {
      vi.advanceTimersByTime(DESIGN_PREVIEW_DEBOUNCE_MS);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.preview).not.toBeNull();

    rerender({ payload: null });
    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(result.current.preview).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('404 marca "feature desligada" (o consumidor troca de editor)', async () => {
    vi.mocked(postsApi.previewDesign).mockRejectedValue(
      new ApiError('Rota não encontrada', 404),
    );
    const { result } = renderHook(() => useDesignPreview(payloadA));

    await act(async () => {
      vi.advanceTimersByTime(DESIGN_PREVIEW_DEBOUNCE_MS);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.errorFeatureOff).toBe(true);
  });

  it('5xx/rede NÃO marca feature desligada e o retry repete a prévia', async () => {
    vi.mocked(postsApi.previewDesign).mockRejectedValueOnce(
      new ApiError('Servidor indisponível', 503),
    );
    const { result } = renderHook(() => useDesignPreview(payloadA));

    await act(async () => {
      vi.advanceTimersByTime(DESIGN_PREVIEW_DEBOUNCE_MS);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.errorFeatureOff).toBe(false);

    vi.mocked(postsApi.previewDesign).mockResolvedValue(previewResult);
    act(() => result.current.retry());
    await act(async () => {
      vi.advanceTimersByTime(DESIGN_PREVIEW_DEBOUNCE_MS);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(postsApi.previewDesign).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
    expect(result.current.preview).toEqual(previewResult);
  });
});
