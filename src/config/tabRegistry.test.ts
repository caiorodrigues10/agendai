import { describe, expect, it } from 'vitest';
import { ALL_TAB_IDS, canAccessTab, getDefaultTab } from './tabRegistry';

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

describe('canAccessTab — products (permissão × paywall)', () => {
  it('OWNER/MASTER_ADMIN acessam products pelo papel, sem permissão nem hasDashboard', () => {
    expect(canAccessTab('products', 'OWNER')).toBe(true);
    expect(canAccessTab('products', 'OWNER', { permissions: [] })).toBe(true);
    expect(canAccessTab('products', 'MASTER_ADMIN', { permissions: [] })).toBe(true);
    expect(canAccessTab('products', 'OWNER', { permissions: undefined })).toBe(true);
  });

  it('paywall de plano sem Pro não é decisão de canAccessTab (fica no guard)', () => {
    expect(canAccessTab('products', 'OWNER', { hasDashboard: false })).toBe(true);
    expect(canAccessTab('products', 'MASTER_ADMIN', { hasDashboard: false })).toBe(true);
    expect(canAccessTab('products', 'EMPLOYEE', { hasDashboard: false, permissions: ['PRODUCTS_MANAGE'] })).toBe(true);
  });

  it('EMPLOYEE precisa de uma das permissões de produtos', () => {
    expect(canAccessTab('products', 'EMPLOYEE', { permissions: ['PRODUCTS_MANAGE'] })).toBe(true);
    expect(canAccessTab('products', 'EMPLOYEE', { permissions: ['PRODUCTS_VIEW'] })).toBe(true);
    expect(canAccessTab('products', 'EMPLOYEE', { permissions: ['RETAIL_SELL'] })).toBe(true);
    expect(canAccessTab('products', 'EMPLOYEE', { permissions: ['INVENTORY_MANAGE'] })).toBe(true);
    expect(canAccessTab('products', 'EMPLOYEE', { permissions: ['QUEUE_MANAGE'] })).toBe(false);
    expect(canAccessTab('products', 'EMPLOYEE', { permissions: [] })).toBe(false);
    expect(canAccessTab('products', 'EMPLOYEE')).toBe(false);
  });

  it('nenhuma aba depende de extras.hasDashboard (regressão do bug do TabGuard)', () => {
    const roles = ['OWNER', 'EMPLOYEE', 'MASTER_ADMIN'];
    const permissionSets = [undefined, [], ['PRODUCTS_MANAGE'], ['REPORTS_VIEW', 'FINANCE_VIEW', 'MARKETING_MANAGE']];
    for (const tab of ALL_TAB_IDS) {
      for (const role of roles) {
        for (const permissions of permissionSets) {
          const base = { permissions };
          const reference = canAccessTab(tab, role, base);
          expect(canAccessTab(tab, role, { ...base, hasDashboard: true }), `${tab}/${role}`).toBe(reference);
          expect(canAccessTab(tab, role, { ...base, hasDashboard: false }), `${tab}/${role}`).toBe(reference);
        }
      }
    }
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
