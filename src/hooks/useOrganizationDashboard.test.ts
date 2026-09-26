/// <reference types="vitest/globals" />
import { act, renderHook, waitFor } from '@testing-library/react';
import { organizationsApi } from '../infra/organizationsApi';
import { useOrganizationDashboard } from './useOrganizationDashboard';

vi.mock('../infra/organizationsApi', () => ({
  organizationsApi: { getDashboard: vi.fn() },
}));
vi.mock('../infra/authStorage', () => ({
  authStorage: { getAccessToken: () => 'test-token' },
}));
vi.mock('../infra/realtimeWs', () => ({
  realtimeWsUrl: (id: string) => `ws://test.local/api/ws?barbershopId=${id}`,
}));
vi.mock('../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }
  close() {
    this.onclose?.();
  }
  simulateOpen() {
    this.onopen?.();
  }
  simulateMessage(type: string) {
    this.onmessage?.({ data: JSON.stringify({ type }) });
  }
}

const getDashboard = vi.mocked(organizationsApi.getDashboard);

const dashboardShop = (id: string) => ({
  barbershopId: id,
  name: `Shop ${id}`,
  logoUrl: null,
  isOpen: true,
  accessLevel: 'FULL' as const,
  liveNow: 2,
  revenue: { today: 10, week: 70, month: 300 },
});

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('useOrganizationDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('carrega o dashboard, expõe os salões e abre 1 WS por salão', async () => {
    getDashboard.mockResolvedValue([dashboardShop('s1'), dashboardShop('s2')]);

    const { result, unmount } = renderHook(() => useOrganizationDashboard('org-1'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.shops).toHaveLength(2));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(getDashboard).toHaveBeenCalledWith('org-1');
    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(FakeWebSocket.instances.map(w => w.url).sort()).toEqual([
      'ws://test.local/api/ws?barbershopId=s1',
      'ws://test.local/api/ws?barbershopId=s2',
    ]);

    unmount();
    expect(FakeWebSocket.instances.every(w => w.onopen === null)).toBe(true);
  });

  it('agrupa eventos WS de vários salões em um único refetch (debounce 1s)', async () => {
    vi.useFakeTimers();
    getDashboard.mockResolvedValue([dashboardShop('s1')]);

    const { result } = renderHook(() => useOrganizationDashboard('org-1'));
    await flush();
    expect(getDashboard).toHaveBeenCalledTimes(1);

    const ws = FakeWebSocket.instances[0];
    act(() => ws.simulateOpen());
    await flush();
    expect(getDashboard).toHaveBeenCalledTimes(2);
    expect(result.current.connectedSockets).toBe(1);

    act(() => {
      ws.simulateMessage('queue:changed');
      ws.simulateMessage('appointments:changed');
    });
    expect(getDashboard).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(999);
    });
    expect(getDashboard).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(getDashboard).toHaveBeenCalledTimes(3);
  });

  it('mantém os dados em dia com poll de 30s', async () => {
    vi.useFakeTimers();
    getDashboard.mockResolvedValue([dashboardShop('s1')]);

    renderHook(() => useOrganizationDashboard('org-1'));
    await flush();
    expect(getDashboard).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(getDashboard).toHaveBeenCalledTimes(2);
  });

  it('sem organização: não busca nem abre WS', () => {
    const { result } = renderHook(() => useOrganizationDashboard(null));

    expect(result.current.shops).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(getDashboard).not.toHaveBeenCalled();
    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it('expõe o erro da API e permite nova tentativa via refetch', async () => {
    getDashboard.mockRejectedValueOnce(new Error('Sem acesso a esta organização'));

    const { result } = renderHook(() => useOrganizationDashboard('org-1'));
    await waitFor(() => expect(result.current.error).toBe('Sem acesso a esta organização'));
    expect(result.current.loading).toBe(false);

    getDashboard.mockResolvedValueOnce([dashboardShop('s1')]);
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.shops).toHaveLength(1);
  });
});
