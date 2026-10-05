import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePermissions, ALL_PERMISSIONS } from './usePermissions';

let mockUser: unknown = null;
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe('usePermissions', () => {
  it('OWNER recebe todas as permissões implicitamente', () => {
    mockUser = { role: 'OWNER' };
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isOwnerOrAdmin).toBe(true);
    expect(result.current.permissions).toEqual(ALL_PERMISSIONS);
    expect(result.current.hasPermission('FINANCE_VIEW')).toBe(true);
  });

  it('MASTER_ADMIN recebe todas as permissões implicitamente', () => {
    mockUser = { role: 'MASTER_ADMIN' };
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasAny('MARKETING_MANAGE')).toBe(true);
  });

  it('EMPLOYEE usa as permissões carregadas no usuário', () => {
    mockUser = { role: 'EMPLOYEE', permissions: ['QUEUE_MANAGE', 'FINANCE_VIEW'] };
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission('QUEUE_MANAGE')).toBe(true);
    expect(result.current.hasPermission('REPORTS_VIEW')).toBe(false);
    expect(result.current.hasAny('FINANCE_VIEW', 'FINANCE_MANAGE')).toBe(true);
  });

  it('EMPLOYEE sem o campo de permissões fica fail-closed ([])', () => {
    mockUser = { role: 'EMPLOYEE' };
    const { result } = renderHook(() => usePermissions());
    expect(result.current.permissions).toEqual([]);
    expect(result.current.hasPermission('QUEUE_MANAGE')).toBe(false);
  });

  it('sem usuário logado, ninguém tem permissão', () => {
    mockUser = null;
    const { result } = renderHook(() => usePermissions());
    expect(result.current.permissions).toEqual([]);
    expect(result.current.isOwnerOrAdmin).toBe(false);
  });
});
