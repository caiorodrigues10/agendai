/**
 * Política de senha para senhas NOVAS: cadastro, redefinição de senha e
 * aceite de convite de dono.
 *
 * Regra: mínimo de 8 caracteres, com pelo menos 1 letra e 1 número.
 * Espelha `backend/src/modules/auth/schemas/passwordPolicy.ts` — o front
 * valida para dar feedback imediato, o back é a autoridade.
 *
 * Senhas já existentes não são afetadas (login não muda) e não há pedido de
 * troca forçada para quem já tem conta.
 */
export const NEW_PASSWORD_MIN_LENGTH = 8;

export const NEW_PASSWORD_RULE_MESSAGE =
  'Senha deve ter no mínimo 8 caracteres, com pelo menos 1 letra e 1 número';

/** Texto curto exibido no formulário (placeholder + dica). */
export const NEW_PASSWORD_RULE_HINT = 'Mínimo 8 caracteres, com pelo menos 1 letra e 1 número';

export function meetsNewPasswordPolicy(password: string): boolean {
  return (
    password.length >= NEW_PASSWORD_MIN_LENGTH &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password)
  );
}

/** Motivo da recusa (null quando a senha atende a política). */
export function newPasswordIssue(password: string): string | null {
  if (password.length < NEW_PASSWORD_MIN_LENGTH) {
    return NEW_PASSWORD_RULE_MESSAGE;
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return NEW_PASSWORD_RULE_MESSAGE;
  }
  return null;
}
