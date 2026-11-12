/// <reference types="vitest/globals" />
import {
  meetsNewPasswordPolicy,
  newPasswordIssue,
  NEW_PASSWORD_MIN_LENGTH,
  NEW_PASSWORD_RULE_MESSAGE,
} from './passwordPolicy';

describe('política de senha nova', () => {
  it('aceita senha com 8+ caracteres, letra e número', () => {
    expect(meetsNewPasswordPolicy('Senha123')).toBe(true);
    expect(newPasswordIssue('Senha123')).toBeNull();
  });

  it('recusa senha com menos de 8 caracteres', () => {
    expect(meetsNewPasswordPolicy(`Sen${1}`)).toBe(false);
    expect(newPasswordIssue(`Sen${1}`)).toBe(NEW_PASSWORD_RULE_MESSAGE);
  });

  it('recusa senha sem letra', () => {
    expect(meetsNewPasswordPolicy('12345678')).toBe(false);
    expect(newPasswordIssue('12345678')).toBe(NEW_PASSWORD_RULE_MESSAGE);
  });

  it('recusa senha sem número', () => {
    expect(meetsNewPasswordPolicy('SenhaSenha')).toBe(false);
    expect(newPasswordIssue('SenhaSenha')).toBe(NEW_PASSWORD_RULE_MESSAGE);
  });

  it('expõe o mínimo como constante única', () => {
    expect(NEW_PASSWORD_MIN_LENGTH).toBe(8);
    expect(meetsNewPasswordPolicy('Senha123')).toBe(true);
  });
});
