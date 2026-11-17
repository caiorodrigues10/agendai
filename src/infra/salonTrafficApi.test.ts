/// <reference types="vitest/globals" />
import { buildSalonTrafficQuery, getSalonTraffic, salonTrafficApi } from './salonTrafficApi';

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
  getAccessToken: vi.fn(),
}));

vi.mock('./apiClient', () => ({
  apiClient: mocks.apiClient,
}));

vi.mock('./authStorage', () => ({
  authStorage: {
    getAccessToken: mocks.getAccessToken,
  },
}));

describe('salonTrafficApi', () => {
  beforeEach(() => {
    mocks.getAccessToken.mockReturnValue('owner-token');
    mocks.apiClient.mockReset();
  });

  it('monta a query apenas com o período (salão vai no caminho, nunca na query)', () => {
    expect(buildSalonTrafficQuery({ period: 'day' }).toString()).toBe('period=day');
    expect(buildSalonTrafficQuery({ period: 'week' }).toString()).toBe('period=week');
    expect(buildSalonTrafficQuery({ period: 'month' }).toString()).toBe('period=month');
    expect(buildSalonTrafficQuery({ period: '3m' }).toString()).toBe('period=3m');
    expect(buildSalonTrafficQuery({ period: 'year' }).toString()).toBe('period=year');
  });

  it('consulta o relatório do salão com token e id codificado', async () => {
    const response = { success: true, data: {} };
    mocks.apiClient.mockResolvedValueOnce(response);

    await expect(getSalonTraffic('shop-1', { period: 'week' })).resolves.toBe(response);

    expect(mocks.apiClient).toHaveBeenCalledWith(
      '/api/barbershops/shop-1/traffic?period=week',
      'GET',
      undefined,
      'owner-token'
    );
  });

  it('codifica caracteres especiais no id do salão', async () => {
    mocks.apiClient.mockResolvedValueOnce({ success: true, data: {} });

    await salonTrafficApi.getSalonTraffic('a/b c', { period: 'day' });

    expect(mocks.apiClient).toHaveBeenCalledWith(
      '/api/barbershops/a%2Fb%20c/traffic?period=day',
      'GET',
      undefined,
      'owner-token'
    );
  });

  it('nunca envia campos de visitante ou âncoras de data', () => {
    const params = buildSalonTrafficQuery({ period: '3m' });
    expect([...params.keys()]).toEqual(['period']);
  });
});
