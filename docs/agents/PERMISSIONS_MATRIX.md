# PERMISSIONS_MATRIX — papéis × permissões × telas × operações

> Fonte de verdade dos **papéis/permissões na API**: middleware
> `agendai-back-end/src/shared/infra/http/middlewares/requirePermission.ts`
> (OWNER/MASTER_ADMIN passam sempre; EMPLOYEE precisa da permissão, lida do
> banco quando o token não a carrega) + catálogo
> `agendai-back-end/src/modules/users/dtos/IUserResponseDTO.ts`.
> Na interface: `src/hooks/usePermissions.ts` + `src/config/tabRegistry.ts`
> (tab.permissions) + guarda de rota `src/components/infra/TabGuard.tsx`.

| Tela (tab) | Ver a aba (menu/URL) | Operações | Backend que protege |
|---|---|---|---|
| Hoje (overview) | todo staff logado | — | rotas staff |
| Fila (queue) | todo staff (modo HYBRID/QUEUE_ONLY) | chamar/concluir/cancelar/arquivar: `QUEUE_MANAGE` · métricas: `QUEUE_MANAGE` | `queue.routes.ts` (PATCH/DELETE/GET metrics) |
| Agenda (appointments) | todo staff (modo HYBRID/APPOINTMENTS_ONLY) | gerenciar conforme `APPOINTMENTS_*` | `appointments.routes.ts` |
| Clientes | todo staff | `CLIENTS_MANAGE` | `clients.routes.ts` |
| Produtos | `hasDashboard` + OWNER/MASTER_ADMIN ou RETAIL_SELL/PRODUCTS_VIEW/PRODUCTS_MANAGE/INVENTORY_MANAGE | vender: `RETAIL_SELL`; estoque: `INVENTORY_MANAGE`; custos/relatórios: `PRODUCT_REPORTS_VIEW` | `products` use cases (`assertProductPermission`) |
| Serviços | OWNER/MASTER_ADMIN | idem | `services.routes.ts` |
| Equipe | OWNER/MASTER_ADMIN | idem | `users.routes.ts` (ownerGuard) |
| Relatórios | + `REPORTS_VIEW` | leitura | `profit.routes.ts` (leitura) |
| Financeiro | + `FINANCE_VIEW`/`FINANCE_MANAGE` | criar: `FINANCE_CREATE`; editar: `FINANCE_EDIT`; fechar dia: `FINANCE_MANAGE` | `fiado.routes.ts`, `expenses.routes.ts`, `dailyCloseout.routes.ts`, `barbershopFinancialRoutes.ts` |
| Rentabilidade | + `REPORTS_VIEW` | leitura; config/compute: OWNER | `profit.routes.ts` |
| Estoque (equipment) | + `INVENTORY_MANAGE`/`PRODUCTS_MANAGE` | — | products `assertProductPermission` |
| Posts | + `MARKETING_MANAGE` | gerar/publicar | `posts.routes.ts` (staffGuard + regras internas) |
| Showcase / Link / Indicações / Multiunidades | OWNER/MASTER_ADMIN | idem | rotas respectivas (role-only) |
| Configurações / Ajuda / Perfil | todo staff | — | — |
| Plano (subscription) | OWNER/MASTER_ADMIN | — | `plans.routes.ts` |
| Master Admin (/master/*) | MASTER_ADMIN | — | `verifyInternalAdmin` + `requireInternalPermission` |

## Divergência histórica corrigida nesta rodada (estabilização)

- Rotas de fila (PATCH/DELETE/métricas) não exigiam permissão alguma → agora `QUEUE_MANAGE`.
- Financeiro/relatórios eram **papel-puro** (só OWNER) → agora `FINANCE_VIEW`/`FINANCE_MANAGE`/`REPORTS_VIEW`.
- `requirePermission` existia duplicado à mão em fiado/expenses (resposta `{error}` fora do padrão) → middleware único com `AppError`.
- `requirePermission` lê permissões do banco quando o JWT não as traz ⇒ revogar passa a valer na requisição seguinte.

## Riscos remanescentes / follow-ups fora do escopo

- `commissions.routes.ts`: qualquer EMPLOYEE lê comissões (guard por papel) — decisão de produto pendente.
- `crm.routes.ts`: qualquer EMPLOYEE com dashboard acessado (plano) — sem granularidade `CRM_*` no controller.
- Troca de salão (switch-shop) por EMPLOYEE herda as permissões globais do usuário; não há por-loja.
- Tabs de divulgação secundárias (showcase/link/referrals) seguem papel-only.

---
Última revisão: 2026-10-05 (rodada de estabilização).
