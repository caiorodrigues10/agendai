/// <reference types="vitest/globals" />
import {
  adminTrafficApi,
  buildAdminTrafficQuery,
  type AdminTrafficResponse,
} from './adminTrafficApi';

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
  apiFetch: vi.fn(),
  getAccessToken: vi.fn(),
}));

vi.mock('./apiClient', () => ({
  apiClient: mocks.apiClient,
  apiFetch: mocks.apiFetch,
}));

vi.mock('./authStorage', () => ({
  authStorage: {
    getAccessToken: mocks.getAccessToken,
  },
}));

describe('adminTrafficApi', () => {
  beforeEach(() => {
    mocks.getAccessToken.mockReturnValue('master-token');
  });

  it('mantém as âncoras mutuamente exclusivas e ligadas ao período', () => {
    expect(
      buildAdminTrafficQuery({
        period: 'day',
        area: 'all',
        userRole: 'OWNER',
        date: '2026-11-14',
        month: '2026-10',
      }).toString()
    ).toBe('period=day&area=all&userRole=OWNER&date=2026-11-14');

    expect(
      buildAdminTrafficQuery({
        period: 'month',
        area: 'public_site',
        date: '2026-11-14',
        month: '2026-10',
      }).toString()
    ).toBe('period=month&area=public_site&month=2026-10');

    expect(
      buildAdminTrafficQuery({
        period: '3m',
        area: 'logged_area',
        date: '2026-11-14',
        month: '2026-10',
      }).toString()
    ).toBe('period=3m&area=logged_area');
  });

  it('consulta o relatório com token e query válida', async () => {
    const response = { success: true, data: {} } as AdminTrafficResponse;
    mocks.apiClient.mockResolvedValueOnce(response);

    await expect(
      adminTrafficApi.getTrafficReport({
        period: 'day',
        area: 'public_site',
        userRole: 'CUSTOMER',
        date: '2026-11-14',
      })
    ).resolves.toBe(response);

    expect(mocks.apiClient).toHaveBeenCalledWith(
      '/api/admin/traffic?period=day&area=public_site&userRole=CUSTOMER&date=2026-11-14',
      'GET',
      undefined,
      'master-token'
    );
  });

  it('exporta o CSV com exatamente a mesma query do relatório', async () => {
    const response = { ok: true } as Response;
    mocks.apiFetch.mockResolvedValueOnce(response);

    await expect(
      adminTrafficApi.exportTrafficCsv({
        period: 'month',
        area: 'salon_public',
        userRole: 'EMPLOYEE',
        month: '2026-10',
      })
    ).resolves.toBe(response);

    expect(mocks.apiFetch).toHaveBeenCalledWith(
      '/api/admin/traffic/export?period=month&area=salon_public&userRole=EMPLOYEE&month=2026-10',
      { method: 'GET' },
      'master-token'
    );
  });
});
