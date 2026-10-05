# Etapa 8 — Permissões, persistência e contratos

Status: **concluída** (gate verde). Data: 2026-10-03.

## 1. Contratos (`contract:check`)

O gate de contratos **crashava** na Etapa 8 (`URL não suportada: postPath(salonId, postId)`) por causa de `src/infra/socialApi.ts` (trabalho externo) que usa helpers de path locais. Decisão: **estender o checker** (não tocar no arquivo paralelo) com suporte fail-closed a padrões reais do código:

| Extensão | O que resolve |
|---|---|
| `helperMap`/`returnExpression`/`helperTarget` + `requestPath(..., helpers, seen)` no frontend | helpers locais `const f = (…) => expr` e `function f() { return expr }` como **argumento** de `apiClient(...)` e como **span** de template (com guarda de ciclo) |
| `backendRoutes` recursivo (`visit`, `visited`, imports por arquivo, strict só na raiz) | delegação aninhada de rotas: `api.ts → feedRoutes(app) → socialRoutes(app)` (antes só 1 nível) |
| `resolveUrl` com consts de string por arquivo | `` app.get(`${base}/posts/:postId`) `` com `const base = "/salons/:salonId"` (antes: `Rota dinâmica não suportada`) |

- `npm run test:contract`: **6/6** (4 originais + helpers frontend + delegação/consts backend).
- `npm run contract:check` e `contract:check:strict`: **OK — 477 chamadas em wrappers / 554 rotas backend**, 0 pendências (nada entrou em `api-contract-debt.json`).
- Fail-closed preservado: URL dinâmica/método dinâmico continuam lançando (testado).

## 2. Permissões × rotas

Comparação `src/app/App.tsx` vs `docs/restructure/02-map.md` §1:

| Grupo | Rotas | Guard | Resultado |
|---|---|---|---|
| Públicas (marketing, queue/produtos, review, post, auth, planos, comercial, showcase, minha-conta, 404) | 38 | nenhuma | idêntico ao mapa |
| `/checkout` | 1 | `PrivateRoute [OWNER, MASTER_ADMIN]` | idêntico |
| `/master/*` (pai + 16 filhas: index/dashboard redirects + 14 conteúdo) | 17 | `PrivateRoute [MASTER_ADMIN]` | idêntico |
| `/app/:tab` + 2 redirects | 3 | `PrivateRoute [OWNER, EMPLOYEE, MASTER_ADMIN]` | idêntico |

- **57 elementos `<Route>`** hoje vs 54 do snapshot da Etapa 0: +3 públicas (`/queue/:id/produtos/:productId`, `/avaliar`, `/saloes/:salonId/posts/:postId`) — trabalho externo, **nenhuma rota privada nova e nenhuma role alterada**.
- `PrivateRoute.tsx` (user + `hasRole`, redirect `/login` com `state.from`): **inalterado** (`git log` só mostra commits de feature; `git status` limpo).
- `src/hooks/` (5 arq., `usePermissions.ts` incluso) e `src/config/tabRegistry.ts`: **inalterados** pela reestruturação (mesma verificação git).
- `canAccessTab` segue só em `pages/StaffDashboard.tsx` + `layouts/app/StaffNavigation.tsx` (auth de tab dentro da página, não no router) — inalterado.
- `usePermissions` consumido apenas por features (`OwnerFinancialPanel`, `ProductsHub`, `TeamManager`) — camada correta.

## 3. Persistência (storage sweep)

Varredura de `localStorage`/`sessionStorage` (arquivos de teste excluídos): **92 chamadas** — `infra` 56, `utils` 11, `contexts` 9, `features` 8, `components` 4, `pages` 4.

| Chave | Onde | Achado |
|---|---|---|
| `agendai:access-block-info` (session) | `AuthContext` (2×), `CheckoutPage` (3×) **hardcoded** vs `BLOCK_INFO_STORAGE_KEY` exportada de `AccessBlockedListener.tsx` usada em `AccessBlockedPage` + `AccessBlockedListener` | const existe mas 5 chamadas repetem a string → risco de drift (**D-015**) |
| draft key `agendai:post-draft:user:shop:new` | `draftKey()` **duplicado** em `PostEditor.tsx` e `PostsManager.tsx` (assinaturas quase idênticas) | DRY (**D-016**; PostEditor é trabalho externo — não tocar) |
| `barber_customer_id` | `SchedulingContext` | legado **sem namespace** (`agendai:`) — incluído na D-015 |
| `agendai:liked-post:*` | `PostDetail` inline | ok (namespaced); ad-hoc sem wrapper |
| tema, consent, referral, auth, wallet, portal | wrappers `*Storage` em `utils/`/`infra/` | centralizado ✓ |

Decisão: **sem fix nesta etapa** (AuthContext/CheckoutPage/PostEditor são ativos de trabalho paralelo ou sensíveis; mudança de chave é behavioral) → registrar dívidas D-015/D-016.

## 4. Dívidas registradas

- **D-015:** chave `agendai:access-block-info` hardcoded em 5 chamadas (AuthContext, CheckoutPage) além da const exportada por um componente; `barber_customer_id` sem namespace. → mover const para módulo neutro (`utils/`) + helpers get/set/clear; renomear legado com migração read-once.
- **D-016:** `draftKey()` duplicado PostEditor/PostsManager. → extrair para `features/posts/draftStorage.ts` (após resolver dependência externa do PostEditor).

## 5. Gate

| Check | Resultado |
|---|---|
| `tsc --noEmit` | **0** (corrigido TS2367 do freeze de `Date` na story: `ConstructorParameters<typeof Date>` resolve para tuple de 1 → `args.length === 0` apontava '1'×'0'; agora `unknown[]` + cast no super) |
| `eslint .` | **9 err / 591 warn** (teto 11/593) |
| `vitest run` (app + storybook) | **283/283 (67 arquivos)** |
| `test:contract` | **6/6** |
| `contract:check` / `contract:check:strict` | **OK (477/554), 0 pendências** |
| `test:storybook` | **73/73 (21 arquivos)** |
| `test:visual -- --no-build` | **73/73 snapshots** (após `build-storybook` fresco) |
| `build` | **88 precache / 2654.53 KiB** (baseline 00 = 82/2579.63; vs fim da 7: 2654.50 — Δ desprezível) |
| `docs:check` | OK |

## 6. Próximo

1. Fila de dívidas D-007…D-016 e settlement §6 (D-012, sanção do usuário).
2. Etapas 9–10: budget/perf (D-002/D-005) e gate final.
3. `git push` (pendência do usuário).
