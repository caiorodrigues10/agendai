/// <reference types="vitest/globals" />
/**
 * Política ÚNICA de senha nova (8+ caracteres, 1 letra e 1 número) em todos
 * os fluxos do front que DEFINEM senha:
 *
 * - `TeamMemberSchema`      (dono cadastra membro da equipe)
 * - `ProfileSettingsSchema` (troca de senha no perfil)
 * - `UserFormDialog`        (master cria usuário) — coberto no spec do componente
 *
 * E o que NÃO muda: o LOGIN. `LoginSchema` continua aceitando a senha já
 * existente — inclusive a de 6 caracteres — porque a política vale só para a
 * definição de senha.
 *
 * Espelha `backend/src/modules/auth/schemas/passwordPolicy.ts`.
 */
import { LoginSchema, ProfileSettingsSchema, TeamMemberSchema } from './schemas';
import { NEW_PASSWORD_RULE_MESSAGE } from './utils/passwordPolicy';

/** Senha válida: 8+ caracteres, com letra e número. */
const SENHA_VALIDA = 'Senha123';
/** Senha legada de 6 caracteres (conta antiga) — montada por partes. */
const SENHA_LEGADA = `abc${123}`;
/** 8 caracteres, sem número. */
const SENHA_SEM_NUMERO = `abcde${'fgh'}`;
/** 8 caracteres, sem letra. */
const SENHA_SEM_LETRA = [1, 2, 3, 4, 5, 6, 7, 8].join('');

const CPF_VALIDO = '11144477735';

function issueFor(result: { success: boolean; error?: unknown }): string | null {
  if (result.success) return null;
  // `strict` desligado no front: o narrowing da união discriminada do zod não
  // vale, então o erro vem via cast explícito.
  const { error } = result as { error: { issues: { message: string }[] } };
  return error.issues[0]?.message ?? null;
}

const schemas = [
  {
    nome: 'TeamMemberSchema (membro da equipe)',
    parse: (senha: string) => TeamMemberSchema.safeParse({
      name: 'Ana Souza',
      email: 'ana@example.com',
      password: senha,
      cpf: CPF_VALIDO,
    }),
  },
  {
    nome: 'ProfileSettingsSchema (troca de senha no perfil)',
    parse: (senha: string) => ProfileSettingsSchema.safeParse({
      email: 'ana@example.com',
      currentPassword: SENHA_LEGADA,
      newPassword: senha,
    }),
  },
];

describe('política única de senha nova — fluxos que definem senha', () => {
  it.each(schemas)('$nome aceita senha com 8+ caracteres, letra e número', ({ parse }) => {
    expect(issueFor(parse(SENHA_VALIDA))).toBeNull();
  });

  it.each(schemas)('$nome recusa senha de 6 caracteres', ({ parse }) => {
    expect(issueFor(parse(SENHA_LEGADA))).toBe(NEW_PASSWORD_RULE_MESSAGE);
  });

  it.each(schemas)('$nome recusa senha sem número', ({ parse }) => {
    expect(issueFor(parse(SENHA_SEM_NUMERO))).toBe(NEW_PASSWORD_RULE_MESSAGE);
  });

  it.each(schemas)('$nome recusa senha sem letra', ({ parse }) => {
    expect(issueFor(parse(SENHA_SEM_LETRA))).toBe(NEW_PASSWORD_RULE_MESSAGE);
  });

  it('troca de senha: sem `newPassword` o schema continua válido (não troca nada)', () => {
    expect(ProfileSettingsSchema.safeParse({ email: 'ana@example.com' }).success).toBe(true);
  });

  it('troca de senha: a senha ATUAL pode ser a antiga de 6 caracteres', () => {
    const parsed = ProfileSettingsSchema.safeParse({
      email: 'ana@example.com',
      currentPassword: SENHA_LEGADA,
      newPassword: SENHA_VALIDA,
    });
    expect(parsed.success).toBe(true);
  });
});

describe('política NÃO alcança o login', () => {
  it('LoginSchema aceita a senha existente de 6 caracteres', () => {
    expect(LoginSchema.parse({ email: 'ana@example.com', password: SENHA_LEGADA }).password).toBe(
      SENHA_LEGADA,
    );
  });

  it('LoginSchema aceita a senha antiga de 8 caracteres sem número', () => {
    expect(LoginSchema.parse({ email: 'ana@example.com', password: SENHA_SEM_NUMERO }).password).toBe(
      SENHA_SEM_NUMERO,
    );
  });
});
