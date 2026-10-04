import { describe, it, expect, beforeEach } from 'vitest';
import {
  CLIENT_ID_STORAGE_KEY,
  LEGACY_CLIENT_ID_STORAGE_KEY,
  readClientId,
} from './clientIdStorage';

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
