/// <reference types="vitest/globals" />
import {
  auditActorLabel,
  auditDetailSummary,
  auditResourceLabel,
  describeAuditAction,
  maskSensitiveJson,
} from './auditPresentation';

describe('audit presentation and privacy', () => {
  it('does not describe arbitrary POST operations as record creation', () => {
    expect(describeAuditAction('POST /api/retail-sales/sale-1/refunds', 'retail-sales').label).toBe(
      'Ação registrada'
    );
    expect(describeAuditAction('POST /api/auth/sessions/revoke-others', 'auth').label).toBe(
      'Ação registrada'
    );
    expect(describeAuditAction('POST /api/products', 'products').label).toBe('Registro criado');
  });
  it('redacts nested secrets and their common compound keys without removing safe context', () => {
    const value = maskSensitiveJson(
      JSON.stringify({
        users: [
          {
            name: 'Ana',
            cpf: '111.222.333-44',
            credentials: { accessToken: 'bearer-private', api_key: 'api-private' },
          },
        ],
        reason: 'Cadastro duplicado',
      })
    );
    expect(value).not.toContain('111.222.333-44');
    expect(value).not.toContain('bearer-private');
    expect(value).not.toContain('api-private');
    expect(value).toContain('Ana');
    expect(value).toContain('Cadastro duplicado');
  });

  it.each(['CPF', 'CNPJ', 'EMAIL', 'WHATSAPP'])(
    'redacts a generic value with sensitive type %s',
    type => {
      const safe = JSON.parse(
        maskSensitiveJson(
          JSON.stringify({ type, value: 'private-context-value', reason: 'Motivo preservado' })
        )
      );
      expect(safe).toEqual({ type, value: '•••••', reason: 'Motivo preservado' });
    }
  );

  it('does not leak numeric document values, arrays or embedded JSON', () => {
    const text = JSON.stringify({
      changes: [{ tipo: 'CPF', valor: 12345678900 }],
      payload: '{"refresh_token":"embedded-secret","name":"Ana"}',
      reason: 'CPF 123.456.789-00 bloqueado',
    });
    const safe = maskSensitiveJson(text);
    expect(safe).not.toContain('12345678900');
    expect(safe).not.toContain('123.456.789-00');
    expect(safe).not.toContain('embedded-secret');
    expect(safe).toContain('Ana');
  });

  it('redacts secrets and contextual values in malformed JSON', () => {
    const safe = maskSensitiveJson(
      'payload quebrado {"type":"CPF","value":"documento-privado","accessToken":"secret-value"'
    );
    expect(safe).not.toContain('documento-privado');
    expect(safe).not.toContain('secret-value');
  });

  it('provides readable summaries instead of raw JSON and keeps documents redacted', () => {
    expect(auditDetailSummary('{"type":"CPF","value":"08136109826"}')).toBe('CPF: •••••');
    expect(auditDetailSummary('{"fields":["active","customerName"]}')).toBe(
      'Campos alterados: Ativo, Cliente'
    );
    expect(auditDetailSummary('{"reason":"Assinatura expirada"}')).toBe('Assinatura expirada');
    expect(auditDetailSummary('{"nested":{"value":true}}')).toBe(
      'Informações adicionais disponíveis nos detalhes.'
    );
  });

  it('uses a real actor name, clearly labels system events and does not invent an identity', () => {
    expect(auditActorLabel('00000000-0000-0000-0000-000000000000')).toBe('Sistema');
    expect(auditActorLabel('u1', [{ id: 'u1', name: 'Ana', email: 'ana@example.test' }])).toBe(
      'Ana'
    );
    expect(auditActorLabel('unknown')).toBe('Usuário não identificado');
    expect(auditResourceLabel('BlockedEntity')).toBe('Bloqueios');
    expect(describeAuditAction('BLOCK_ENTITY', 'BlockedEntity')).toEqual({
      label: 'Bloqueio registrado',
      tone: 'warning',
    });
  });
});
