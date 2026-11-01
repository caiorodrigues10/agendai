/// <reference types="vitest/globals" />
import { hasInternalPermission, INTERNAL_PERMISSIONS } from './internalPermissions';

describe('hasInternalPermission', () => {
  it('libera quando a lista está ausente ou vazia (acesso total)', () => {
    expect(hasInternalPermission(undefined, INTERNAL_PERMISSIONS.WHATSAPP_MANAGE)).toBe(true);
    expect(hasInternalPermission([], INTERNAL_PERMISSIONS.WHATSAPP_MANAGE)).toBe(true);
  });

  it('libera tudo com internal:all', () => {
    expect(hasInternalPermission([INTERNAL_PERMISSIONS.ALL], INTERNAL_PERMISSIONS.WHATSAPP_MANAGE)).toBe(true);
  });

  it('exige a permissão específica quando a lista existe', () => {
    expect(hasInternalPermission([INTERNAL_PERMISSIONS.WHATSAPP_READ], INTERNAL_PERMISSIONS.WHATSAPP_MANAGE)).toBe(false);
    expect(hasInternalPermission([INTERNAL_PERMISSIONS.WHATSAPP_READ], INTERNAL_PERMISSIONS.WHATSAPP_READ)).toBe(true);
    // parity com o back: a lista é checada item a item (sem herança manage → read)
    expect(hasInternalPermission([INTERNAL_PERMISSIONS.WHATSAPP_MANAGE], INTERNAL_PERMISSIONS.WHATSAPP_READ)).toBe(false);
  });
});
