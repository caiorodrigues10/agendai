/// <reference types="vitest/globals" />
import { apiClient, apiFetch } from './apiClient';
import { authStorage } from './authStorage';
import { adminAuditApi } from './adminAuditApi';

vi.mock('./apiClient', () => ({ apiClient: vi.fn(), apiFetch: vi.fn() }));
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: vi.fn() } }));

const query = (url: string): URLSearchParams => new URL(url, 'https://audit.example').searchParams;
const listQuery = (): URLSearchParams => query(vi.mocked(apiClient).mock.calls.at(-1)![0]);

describe('adminAuditApi — períodos no horário de Brasília', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authStorage.getAccessToken).mockReturnValue('audit-test-token');
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: [] });
    vi.mocked(apiFetch).mockResolvedValue({ ok: true } as Response);
  });

  it.each([
    ['2026-10-26', '2026-10-26T03:00:00.000Z', '2026-10-27T02:59:59.999Z'],
    ['2018-12-15', '2018-12-15T02:00:00.000Z', '2018-12-16T01:59:59.999Z'],
    ['2026-10-31', '2026-10-31T03:00:00.000Z', '2026-11-01T02:59:59.999Z'],
    ['2018-12-31', '2018-12-31T02:00:00.000Z', '2019-01-01T01:59:59.999Z'],
    ['2024-02-29', '2024-02-29T03:00:00.000Z', '2024-03-01T02:59:59.999Z'],
  ])('inclui o dia local completo de %s', async (day, from, to) => {
    await adminAuditApi.getAuditLogs({ from: day, to: day });

    expect(listQuery().get('from')).toBe(from);
    expect(listQuery().get('to')).toBe(to);
    expect(vi.mocked(apiClient).mock.calls[0].slice(1)).toEqual([
      'GET',
      undefined,
      'audit-test-token',
    ]);
  });

  it('considera o primeiro horário existente no início do horário de verão de 2018', async () => {
    await adminAuditApi.getAuditLogs({ from: '2018-11-04', to: '2018-11-04' });

    expect(listQuery().get('from')).toBe('2018-11-04T03:00:00.000Z');
    expect(listQuery().get('to')).toBe('2018-11-05T01:59:59.999Z');
  });

  it('inclui a hora repetida no fim do horário de verão de 2019', async () => {
    await adminAuditApi.getAuditLogs({ from: '2019-02-16', to: '2019-02-16' });

    expect(listQuery().get('from')).toBe('2019-02-16T02:00:00.000Z');
    expect(listQuery().get('to')).toBe('2019-02-17T02:59:59.999Z');
  });

  it('converte os dois extremos de um intervalo sem alterar os outros filtros', async () => {
    await adminAuditApi.getAuditLogs({
      page: 3,
      limit: 50,
      from: '2026-10-01',
      to: '2026-10-26',
      q: 'bloqueio',
      action: 'BLOCK_ENTITY',
      resource: 'BlockedEntity',
      userId: 'user-1',
      shopId: 'shop-1',
    });

    expect(Object.fromEntries(listQuery())).toEqual({
      page: '3',
      limit: '50',
      from: '2026-10-01T03:00:00.000Z',
      to: '2026-10-27T02:59:59.999Z',
      search: 'bloqueio',
      action: 'BLOCK_ENTITY',
      resource: 'BlockedEntity',
      userId: 'user-1',
      shopId: 'shop-1',
    });
  });

  it('não envia datas quando o período está em aberto', async () => {
    await adminAuditApi.getAuditLogs();

    expect(Object.fromEntries(listQuery())).toEqual({ limit: '25' });
  });

  it('permite filtrar só a partir de uma data', async () => {
    await adminAuditApi.getAuditLogs({ from: '2026-10-26' });

    expect(listQuery().get('from')).toBe('2026-10-26T03:00:00.000Z');
    expect(listQuery().has('to')).toBe(false);
  });

  it('permite filtrar só até uma data', async () => {
    await adminAuditApi.getAuditLogs({ to: '2026-10-26' });

    expect(listQuery().has('from')).toBe(false);
    expect(listQuery().get('to')).toBe('2026-10-27T02:59:59.999Z');
  });

  it('exporta exatamente o mesmo período da lista, sem a paginação e sem alterar o objeto original', async () => {
    const params = { page: 4, limit: 25, from: '2026-10-26', to: '2026-10-26', q: 'conta' };
    await adminAuditApi.getAuditLogs(params);
    await adminAuditApi.exportAuditLogsCsv(params);

    const url = vi.mocked(apiFetch).mock.calls[0][0];
    const exported = query(url);
    expect(url.split('?')[0]).toBe('/api/admin/audit-logs/export');
    expect(exported.get('from')).toBe(listQuery().get('from'));
    expect(exported.get('to')).toBe(listQuery().get('to'));
    expect(exported.get('search')).toBe('conta');
    expect(exported.has('page')).toBe(false);
    expect(params.page).toBe(4);
    expect(vi.mocked(apiFetch).mock.calls[0].slice(1)).toEqual([
      { method: 'GET' },
      'audit-test-token',
    ]);
  });

  it('rejeita um dia inexistente como Promise, antes de enviar a consulta', async () => {
    await expect(adminAuditApi.getAuditLogs({ from: '2026-02-31' })).rejects.toThrow(
      'Data de auditoria inválida'
    );
    expect(apiClient).not.toHaveBeenCalled();
  });

  it('rejeita data inválida na exportação como Promise e não envia HTTP', async () => {
    await expect(adminAuditApi.exportAuditLogsCsv({ to: 'invalid' })).rejects.toThrow(
      'Data de auditoria inválida'
    );
    expect(apiFetch).not.toHaveBeenCalled();
  });
});
