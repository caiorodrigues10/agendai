import { describe, expect, it } from 'vitest';
import { canAccessTab, getDefaultTab } from './tabRegistry';

describe('canAccessTab', () => {
  it('tabs sem roles são públicas para qualquer papel logado', () => {
    expect(canAccessTab('overview', 'EMPLOYEE')).toBe(true);
    expect(canAccessTab('appointments', 'EMPLOYEE')).toBe(true);
  });

  it('tabs com permissions exigem a permissão para EMPLOYEE', () => {
    expect(canAccessTab('finance', 'EMPLOYEE', { permissions: ['FINANCE_VIEW'] })).toBe(true);
    expect(canAccessTab('finance', 'EMPLOYEE', { permissions: [] })).toBe(false);
    expect(canAccessTab('finance', 'EMPLOYEE')).toBe(false);
    expect(canAccessTab('reports', 'EMPLOYEE', { permissions: ['REPORTS_VIEW'] })).toBe(true);
    expect(canAccessTab('reports', 'EMPLOYEE', { permissions: ['QUEUE_MANAGE'] })).toBe(false);
    expect(canAccessTab('profit', 'EMPLOYEE', { permissions: ['REPORTS_VIEW'] })).toBe(true);
    expect(canAccessTab('posts', 'EMPLOYEE', { permissions: ['MARKETING_MANAGE'] })).toBe(true);
  });

  it('OWNER/MASTER_ADMIN passam pelo papel mesmo sem permissões explícitas', () => {
    expect(canAccessTab('finance', 'OWNER')).toBe(true);
    expect(canAccessTab('reports', 'MASTER_ADMIN')).toBe(true);
    expect(canAccessTab('profit', 'OWNER')).toBe(true);
  });

  it('tabs só de dono continuam inacessíveis para EMPLOYEE com permissões outros', () => {
    expect(canAccessTab('team', 'EMPLOYEE', { permissions: ['FINANCE_VIEW'] })).toBe(false);
    expect(canAccessTab('settings-owner-only-example', 'EMPLOYEE')).toBe(false);
  });

  it('tab inexistente é negada', () => {
    expect(canAccessTab('does-not-exist', 'OWNER')).toBe(false);
  });
});

describe('getDefaultTab', () => {
  it('OWNER cai no overview', () => {
    expect(getDefaultTab('OWNER')).toBe('overview');
  });

  it('EMPLOYEE sem permissões também cai no overview (abas de operação não exigem)', () => {
    expect(getDefaultTab('EMPLOYEE', 'HYBRID', { permissions: [] })).toBe('overview');
  });
});
