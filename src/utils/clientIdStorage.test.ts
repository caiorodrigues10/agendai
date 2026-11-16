import { describe, it, expect, beforeEach } from 'vitest';
import {
  CLIENT_ID_STORAGE_KEY,
  LEGACY_CLIENT_ID_STORAGE_KEY,
  readClientId,
} from './clientIdStorage';
import { withoutRandomUuid } from '../tests/stubs/secureContext';

describe('clientIdStorage (D-015 migração read-once)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('gera um id novo e grava na chave namespaced', () => {
    const cid = readClientId();
    expect(cid).toMatch(/^[0-9a-f-]{36}$/);
    expect(localStorage.getItem(CLIENT_ID_STORAGE_KEY)).toBe(cid);
    expect(localStorage.getItem(LEGACY_CLIENT_ID_STORAGE_KEY)).toBeNull();
  });

  it('migra o valor legado: adota, regrava namespaced e apaga a chave antiga', () => {
    localStorage.setItem(LEGACY_CLIENT_ID_STORAGE_KEY, 'legacy-id-123');

    const cid = readClientId();

    expect(cid).toBe('legacy-id-123');
    expect(localStorage.getItem(CLIENT_ID_STORAGE_KEY)).toBe('legacy-id-123');
    expect(localStorage.getItem(LEGACY_CLIENT_ID_STORAGE_KEY)).toBeNull();
  });

  it('não sobrescreve um id já existente na chave nova (legado é ignorado)', () => {
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, 'atual-456');
    localStorage.setItem(LEGACY_CLIENT_ID_STORAGE_KEY, 'legado-789');

    const cid = readClientId();

    expect(cid).toBe('atual-456');
    expect(localStorage.getItem(LEGACY_CLIENT_ID_STORAGE_KEY)).toBe('legado-789');
  });

  it('é estável entre chamadas (read-once: segunda leitura não muda o valor)', () => {
    const first = readClientId();
    const second = readClientId();
    expect(second).toBe(first);
  });
});

/**
 * Regressão: `crypto.randomUUID()` só existe em contexto seguro (HTTPS ou
 * loopback). Em `http://` não-loopback a chamada lançava TypeError e — como
 * `readClientId` roda no `useState` do SchedulingContext — a SPA inteira
 * ficava em branco no boot.
 */
describe('clientIdStorage em origem sem contexto seguro (http:// não-loopback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('não quebra e gera um UUID v4 quando crypto.randomUUID não existe', async () => {
    const cid = await withoutRandomUuid(() => readClientId());

    expect(cid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(localStorage.getItem(CLIENT_ID_STORAGE_KEY)).toBe(cid);
  });

  it('gera ids diferentes a cada geração (fallback aleatório)', async () => {
    const first = await withoutRandomUuid(() => readClientId());
    localStorage.clear();
    const second = await withoutRandomUuid(() => readClientId());

    expect(second).not.toBe(first);
  });

  it('usa crypto.randomUUID quando ele existe (caminho normal)', () => {
    const uuid = '11111111-2222-4333-8444-555555555555';
    const spy = vi.spyOn(crypto, 'randomUUID').mockReturnValue(uuid);

    const cid = readClientId();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(cid).toBe(uuid);
    expect(localStorage.getItem(CLIENT_ID_STORAGE_KEY)).toBe(uuid);
  });
});
