# Etapa 7 — §5.6 Master admin

Status: **concluída** (gate verde). Data: 2026-10-03.

## Movimentos

| Origem | Destino | Detalhe |
|---|---|---|
| `src/pages/MasterAdmin/` (15 arquivos) | `src/pages/master-admin/` | rename de diretório; depth idêntico → imports `../../` intactos; `src/app/App.tsx` (12 lazy imports) reescritos para `../pages/master-admin/…` |
| `pages/master-admin/BillingTab.tsx` (1947L) | `src/features/billing/` (10 arquivos) | ver extração abaixo; barrel `index.ts` (`BillingTab`) |
| consumidores de BillingTab | — | `BillingPage` e `MasterAdminDashboard` agora importam `../../features/billing` |

## Extração do BillingTab → `features/billing`

Orquestrador + 7 seções + widgets compartilhados (corte por linhas, mesmo comportamento):

| Arquivo | Conteúdo | Linhas |
|---|---|---|
| `billingShared.tsx` | helpers (brl, formatDate/Time, errorMessage, EMPTY_META), SectionError, TableSkeleton, EmptyRow, PaginationBar, BillingKpiCard, badges (pagamento/assinatura) e labels/método/pagamento | 240 |
| `RevenueSection.tsx` | KPIs de receita/despesas/fiados + EXPENSE_TYPE_LABELS | 180 |
| `PaymentsSection.tsx` | tabela de pagamentos + RefundModal (modal interno) | 268 |
| `SubscriptionsSection.tsx` | KPIs de economia + tabela de assinaturas + SUBSCRIPTION_FILTERS | 284 |
| `PlansSection.tsx` | cards de planos + PlanFormModal (interno) | 443 |
| `BlockedSection.tsx` | bloqueios (inadimplência) | 201 |
| `NotificationsSection.tsx` | notificações administrativas + labels | 195 |
| `RefundsSection.tsx` | estornos + RefundStatusBadge | 138 |
| `BillingTab.tsx` | raiz: SECTION_OPTIONS + switch de seções + NotificationHealth/Deliveries | 101 |

- `NotificationDeliveriesPanel`/`NotificationHealthPanel` já saíram na Etapa 6d (import via `../notifications`).
- Wrappers finos (`BillingPage`/`ReferralsPage`/`CrmMaintenancePage`, 12–14L) **permanecem como rotas** com header de página — a matriz "rotas sobre feature" é atendida porque o conteúdo (BillingTab) agora vive em `features/billing`; trocar o elemento de rota pelo componente de feature eliminaria os headers (mudança visual) sem ganho.
- `ReferralsTab` (173L) ficou em `pages/master-admin` (sem painéis internos; sem ganho em extrair).

## MasterAdminDashboard — não extraído (decisão)

`MasterAdminDashboard` (1852L) tem **0 consumidores** (nenhum import em `src/`; AdminLayout renderiza `<Outlet/>` e as 13 rotas apontam para as páginas individuais). Pela regra de "0-consumidores não migram silenciosamente", a extração de sub-blocos foi **adiada**: registrar como candidato a settlement/remoção (D-012) antes de investir em refatoração. Os 28 botões/9 inputs crus não foram convertidos pelo mesmo motivo.

## Correções feitas no caminho

1. **`vi.mock` com depth errado (regressão da migração):** `ProductCatalogPanel.test.tsx` e `ProductFormModal.test.tsx` mockavam `'../../../infra|contexts/…'` — em `src/features/<ária>/` (depth 3) isso aponta para a raiz do projeto; os mocks nunca valiam e 10 testes de produtos falharam ("useAuth must be used within AuthProvider" / `createProduct` sem mock). Corrigido para `'../../…'` (**10 testes → verdes**, 283/283).
2. **`TeamPage.tsx`:** `Array<{…}>` → `{…}[]` (erro `array-type` externo que eu corrixi para manter folga do gate; 10 → 9 erros).
3. **Story `BookPackageSessionsModal` com data relativa:** o modal deriva data/semana/slots de `new Date()` — o snapshot visual vencia a cada virada de dia (falhou em 03/10 vs snapshot de 01/10: dia selecionado 1→3, slots de outro dia da semana). Congelado o relógio na story em `2026-10-01T12:00` (monkey-patch de `Date` no topo do arquivo, mesmo padrão de determinismo do `defaultDate` fixo do AppointmentBookingModal). Snapshot **não** precisou ser atualizado; 73/73 verdes. Monitorar se outras stories renderizam "hoje" (D-013).
4. **Limpeza de warnings** (compensação do teto 593, estourado pelo trabalho paralelo alheio): −5 unused vars em `OwnerSubscriptionPanel` (3) e `ClientPortalDashboard` (2).

## Mantidos (com justificativa)

| Item | Por quê |
|---|---|
| Wrappers de rota Billing/Referrals/Crm | headers de página; ver decisão acima |
| `ReferralsTab` em pages/ | 173L, sem sub-painéis |
| `MasterAdminDashboard` sem extração | 0 consumidores → D-012 |
| 25 botões crus do BillingTab | sem story de referência; extração já reduziu o arquivo; conversão cesta arriscada (mesma classe da D-007/D-009/D-011) — se adotar, story primeiro |
| Histórico `pages/MasterAdmin` em docs de etapas anteriores | registros históricos (02-map atualizado) |

## Gate

| Check | Resultado |
|---|---|
| `tsc --noEmit` | 0 |
| `eslint .` | **9 err / 591 warn** (teto 11/593) |
| `vitest run` (app + storybook) | **283/283 (67 arquivos)** |
| `test:storybook` | 73/73 (21 arquivos) |
| `test:visual -- --no-build` | **73/73 snapshots** (após `build-storybook`; story com relógio congelado, 0 snapshots atualizados) |
| `build` | **88 precache / 2654.50 KiB** (baseline 00 = 82/2579.63; Δ+6/+74.87 — majoritariamente páginas novas do commit externo `6be685b`, não da extração) |
| `docs:check` | OK |

## Próximo

1. **Dívidas da fila:** D-007 (`OwnerFinancialPanel`, story-first), D-008 (stories pendentes), D-009 (sheet do ClientProfileSheet), D-010 (checkout full-screen), D-011 (botões do PostEditor), D-012 (settlement do MasterAdminDashboard), D-013 (stories com data relativa).
2. **§6 painéis 0c** (settlement: remover/mover) e `RetailCheckoutBlock` destino.
3. **Etapas 8–10:** permissions/storage/contracts, budget/perf (fechar D-002/D-005), gate final.
4. `git push` (pendência do usuário).
