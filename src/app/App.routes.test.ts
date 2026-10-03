import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve(process.cwd(), 'src/app/App.tsx'), 'utf8');

describe('App route table (contrato)', () => {
  test('todas as rotas declaradas', () => {
    const paths = [...source.matchAll(/path="([^"]+)"/g)].map(m => m[1]);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths).toMatchInlineSnapshot(`
      [
        "/",
        "/funcionalidades",
        "/ia-preditiva",
        "/agendamento",
        "/dashboard",
        "/sobre",
        "/contato",
        "/privacidade",
        "/termos",
        "/queue",
        "/queue/:id",
        "/queue/:id/produtos/:productId",
        "/agendamento/gerenciar",
        "/avaliar",
        "/saloes/:salonId/posts/:postId",
        "/login",
        "/cadastro",
        "/esqueci-senha",
        "/verificar-codigo",
        "/reset-password",
        "/email-verificado",
        "/bloqueado",
        "/planos",
        "/software-para-salao-de-beleza",
        "/sistema-para-salao-de-beleza",
        "/sistema-para-barbearia",
        "/app-para-agendamento-de-salao",
        "/sistema-para-fila-de-barbearia",
        "/sistema-para-manicure",
        "/sistema-para-lash-designer",
        "/crm-para-salao-de-beleza",
        "/controle-financeiro-para-salao",
        "/checkout",
        "/master",
        "dashboard",
        "work",
        "tickets",
        "tickets/new",
        "tickets/:id",
        "tasks",
        "tasks/new",
        "tasks/:id",
        "team",
        "accounts",
        "operations",
        "audit",
        "billing",
        "referrals",
        "crm",
        "/app/account",
        "/app/:tab",
        "/app",
        "/minha-conta",
        "/saloes/:salonId/resultados",
        "/saloes/:salonId/resultados/:resultId",
        "*",
      ]
    `);
  });

  test('guardas PrivateRoute por rota e roles', () => {
    const guards = [...source.matchAll(/path="([^"]+)"\s+element=\{\s*<PrivateRoute roles=\{\[([^\]]+)\]\}>/g)]
      .map(m => [m[1], m[2]]);
    expect(guards).toMatchInlineSnapshot(`
      [
        [
          "/checkout",
          "'OWNER', 'MASTER_ADMIN'",
        ],
        [
          "/master",
          "'MASTER_ADMIN'",
        ],
        [
          "/app/:tab",
          "'OWNER', 'EMPLOYEE', 'MASTER_ADMIN'",
        ],
      ]
    `);
  });

  test('nenhum PrivateRoute sem roles conhecidas nem rota privada extra', () => {
    const privateCount = (source.match(/<PrivateRoute/g) ?? []).length;
    const guardCount = [...source.matchAll(/path="([^"]+)"\s+element=\{\s*<PrivateRoute roles=\{/g)].length;
    expect(privateCount).toBe(guardCount);
  });
});
