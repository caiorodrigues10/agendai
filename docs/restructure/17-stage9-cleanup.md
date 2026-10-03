# Etapa 9 — Limpeza (imports órfãos, rotas/fluxo, budget)

Status: **concluída** (gate verde). Data: 2026-10-03.

## 1. Ferramenta: `scripts/check-orphan-exports.mjs`

Detector de exports órfãos via TypeScript program + checker (não grep):

- Para cada export (seguindo aliases/barris com `getAliasedSymbol`), procura consumidores em **todos** os arquivos do programa — incluindo `.storybook/` (fora de `src`, era um falso positivo: `mocks/browser` só é importado por `preview.tsx`).
- Cobertura de consumo: imports estáticos (default/named/namespace/side-effect), `import('literal')`, `require`, e testes/stories contam como consumidores (excluídos só como *definidores*).
- **Arquivo morto** = tem exports, **zero** deles consumidos **e** zero importadores diretos (barril que re-exporta conta como consumo, não como importador).
- Validação: probe sintético detectado; falsos positivos corrigidos no caminho (TS usa `/` nos `fileName`; `declarations[0]` é node, não `SourceFile`).
- Uso: `node --max-old-space-size=4096 scripts/check-orphan-exports.mjs` (informativo — não entra no gate enquanto houver a fila de settlement).

Resultado final: **181 exports órfãos / 25 arquivos mortos**.

## 2. Limpeza executada (arquivos mortos sem relação com settlement)

| Ação | Item | Evidência |
|---|---|---|
| deletado | `components/infra/lazyPanel.tsx` (89L) | 0 importadores, `lazyPanel` só auto-referência (nunca adotado) |
| deletado | `infra/walletApi.ts` | 0 importadores; duplicava a lógica de token `agendai_client_portal_access` do `clientPortalApi`; saiu da lista de wrappers do `STRUCTURE.md` e −4 chamadas no `contract:check` (477→473) |
| deletado | `mocks/server.ts` | 0 importadores (testes usam `vi.mock`/`http` local; só `browser.ts` é usado via preview); comentário do `handlers.ts` atualizado |
| removido | `utils/statusLabels.ts`:5 consts (`PAYMENT/SUBSCRIPTION/APPOINTMENT/NOTIFICATION/REFUND_STATUS_LABELS`) | órfãs; `FIADO_STATUS_LABELS` e `getStatusLabel` seguem em uso |
| removido | `utils/dateRanges.ts`: bloco `DefaultPeriod`/`getDefaultPeriod`/`getPeriodRange` | órfãs; `todayISO`/`addDaysISO`/`dateAtNoon` seguem em uso (9 importadores) |

## 3. Mortos adiados para settlement (25 — não tocar sem sanção)

| Qtd | Arquivos | Vinculado a |
|---|---|---|
| 16 | `components/domain/*Panel` (Copilot, Corporate, DepositIndicators, EnhancedForecast, Fiscal, Forms, Integrations, OnboardingMissions, Purchasing, Quality, Reputation, ServiceBookingSelector, SmartPricing, StaffManagement, Vouchers, WhatsAppAI) | §6 / D-012 |
| 1 | `components/ui/credit-card-form.tsx` (461L) | D-010 (atualizada) |
| 1 | `pages/master-admin/MasterAdminDashboard.tsx` (1852L) | D-012 |
| 7 | `components/patterns/skeletons/*` (Calendar/Clients/Dashboard/Financial/Queue/Today/Weather) | D-014 (atualizada) |

**Classes de órfão mantidas por decisão** (não são dívida):
- **~140 tipos de `infra/*Api.ts`** — contrato documental das chamadas; exportados por convenção, não adotar-remover.
- **`*Props` de `ui/`/`patterns/`** — API pública de componentes (consumidor futuro), mantidos.
- **`analytics.ts`: `trackEvent`/`trackPurchase`/`trackSignUp`/`trackBeginCheckout`** — funções de GA prontas mas não ligadas; adotar ou remover em entrega de analytics.
- Misc (`TabRole`, `AuthResult`, `AccessState`, `SocialResource`, etc.) — tipos locais exportados; sem ação agora.

## 4. Teste por rota/fluxo

`src/app/App.routes.test.ts` (3 testes, contrato estático do `App.tsx`, sem provider/router):

1. snapshot das **56** `path="…"` declaradas;
2. snapshot dos **3** `PrivateRoute` com roles (`/checkout` OWNER+MASTER, `/master` MASTER, `/app/:tab` OWNER+EMPLOYEE+MASTER);
3. invariante: todo `<PrivateRoute` tem roles conhecidas (nenhuma rota privada "pela porta dos fundos").

Fluxos públicos seguem cobertos pelos e2e Playwright (`mvp-public`, `post-editor`, `post-social`).

## 5. Barrels e pendências da Etapa 2

- **28/28** `features/*/index.ts` presentes; `components/patterns/index.ts` em uso; `components/ui` sem barrel (imports profundos, funciona por design — `tsc` cobre).
- `src/marketing/` e `src/services/` **não estão mais vazios** (6 + 1 arquivos, todos com consumidores) → débito de diretório vazio da Etapa 2 está **obsoleto**.

## 6. Budget (D-002)

- Experimento `@source not "./**/*.stories.tsx"`: CSS 214,2 → **162,7 KiB** (−51,4) e precache 2654,53 → **2604,27 KiB** (−50,26) — **mas 39/73 snapshots visuais quebram** (decorators com utilities exclusivas). **Revertido**; números registrados na D-002 como oportunidade condicionada a restyle das stories.
- `build` final: **88 precache / 2654,41 KiB** (baseline 00 = 82/2579,63; fim da 7 = 2654,50 → −0,12 pela limpeza desta etapa).

## 7. D-015 passo 1

`src/utils/accessBlockedStorage.ts` unifica `BLOCK_INFO_STORAGE_KEY`; `AuthContext` (2), `CheckoutPage` (3), `AccessBlockedListener`, `AccessBlockedPage` agora importam a mesma const (antes: literal duplicado ×5 + const exportada por componente). Renomear `barber_customer_id` permanece pendente (migração behavioral — D-015).

## 8. Gate

| Check | Resultado |
|---|---|
| `tsc --noEmit` | **0** |
| `eslint .` | **9 err / 591 warn** (teto 11/593) |
| `vitest run` (app + storybook) | **286/286 (68 arquivos)** (+3 do teste de rotas) |
| `test:contract` | **6/6** |
| `contract:check:strict` | **OK (473/554), 0 pendências** (−4 chamadas: walletApi removido) |
| `test:storybook` | **73/73 (21 arquivos)** |
| `test:visual -- --no-build` | **73/73 snapshots** (storybook reconstruído após revert do D-002) |
| `build` | **88 precache / 2654,41 KiB** |
| `docs:check` | OK |

## 9. Próximo

1. **Settlement §6** com a lista fechada da §3 (25 mortos) — sanção do usuário.
2. **Etapa 10:** gate final de entrega (typecheck/lint/testes/build/Storybook/visual/audit/docs verdes + evidências).
3. `git push` (pendência do usuário).
