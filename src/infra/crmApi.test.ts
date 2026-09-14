import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './apiClient';
import { crmApi } from './crmApi';
vi.mock('./apiClient', () => ({ apiClient: vi.fn() }));
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: () => 'test-token' } }));
const request = vi.mocked(apiClient);
const run = { id: 'run', status: 'SUCCEEDED', linkedRecords: 2, createdEvents: 3, totalEvents: 5 };
describe('CRM operational contracts', () => {
  beforeEach(() => vi.clearAllMocks());
  it('accepts merge success without a data envelope', async () => {
    request.mockResolvedValue({ success: true, message: 'OK' });
    await expect(crmApi.mergeClients({ targetId: 'a', sourceIds: ['b'] })).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledWith('/api/crm/clients/merge', 'POST', { targetId: 'a', sourceIds: ['b'] }, 'test-token');
  });
  it('unwraps the actual backfill run and passes tenant scope', async () => {
    request.mockResolvedValue({ success: true, data: run });
    expect(await crmApi.backfill('shop')).toEqual(run);
    expect(request).toHaveBeenCalledWith('/api/crm/backfill', 'POST', { barbershopId: 'shop' }, 'test-token');
  });
  it('preserves failed and successful runs and global partial failures', async () => {
    const history = [run, { ...run, status: 'FAILED', error: 'Falha' }];
    request.mockResolvedValueOnce({ data: history });
    expect(await crmApi.backfillRuns()).toEqual(history);
    const results = [{ barbershopId: 'a', run }, { barbershopId: 'b', error: 'Falha' }];
    request.mockResolvedValueOnce({ data: results });
    expect(await crmApi.backfillAll()).toEqual(results);
  });
  it('propagates request failures', async () => {
    request.mockRejectedValue(new Error('Acesso negado'));
    await expect(crmApi.backfillRuns()).rejects.toThrow('Acesso negado');
  });
});
