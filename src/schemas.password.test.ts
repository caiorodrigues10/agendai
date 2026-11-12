/// <reference types="vitest/globals" />
/**
 * Regra de senha nova no cadastro: 8+ caracteres, 1 letra e 1 número.
 * Espelha `backend/src/modules/auth/schemas/passwordPolicy.ts`.
 */
import { RegisterStep1Schema } from './schemas';
import { NEW_PASSWORD_RULE_MESSAGE } from './utils/passwordPolicy';

const base = {
  ownerName: 'Caio Rodrigues',
  email: 'caio@example.com',
  cpf: '12345678909',
  barbershopName: 'Salão do Caio',
  whatsapp: '11988887777',
  city: 'São Paulo',
  termsVersion: '1.0',
  termsAccepted: true,
  lgpdConsent: true,
  authMethod: 'password' as const,
};

function issueFor(password: string): string | null {
  const result = RegisterStep1Schema.safeParse({ ...base, password });
  if (result.success) return null;
  // `strict` desligado no front: o narrowing da união discriminada não vale,
  // então o erro vem via cast explícito.
  const { error } = result as { error: { issues: { message: string }[] } };
  return error.issues[0]?.message ?? null;
}

describe('cadastro — política de senha nova', () => {
  it('aceita senha com 8+ caracteres, letra e número', () => {
    expect(issueFor('Senha123')).toBeNull();
  });

  it('recusa senha com menos de 8 caracteres', () => {
    expect(issueFor('Senha12')).toBe(NEW_PASSWORD_RULE_MESSAGE);
  });

  it('recusa senha sem número', () => {
    expect(issueFor('SenhaSenha')).toBe(NEW_PASSWORD_RULE_MESSAGE);
  });

  it('recusa senha sem letra', () => {
    expect(issueFor('12345678')).toBe(NEW_PASSWORD_RULE_MESSAGE);
  });
});
