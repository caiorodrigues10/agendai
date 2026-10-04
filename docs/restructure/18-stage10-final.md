# Etapa 10 — Entrega final (evidências)

Status: **concluída** (gate final verde). Data: 2026-10-03. HEAD: `383c29c` (nada commitado por esta entrega — ver pendência de push).
Settlement §6: **EXECUTADO** em seguida (sanção do usuário "resolva tudo") — 37 arquivos removidos; gate re-executado, números abaixo são **pós-settlement** (ver [15-section6-settlement](15-section6-settlement.md)).

## 1. Evidências do gate final

Orquestrador próprio: `npm run verify:delivery` → **OK** (docs:check → typecheck → test:contract → contract:check → vitest).

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint | `npx eslint .` (full-scope) | **9 err / 490 warn** (teto 11/593; D-003; warnings −101 pós-settlement). `npm run lint` (só `src/`) = 5 err |
| testes app+storybook | `npm test` | **314/314 (70 arquivos)** |
| contratos (unit) | `npm run test:contract` | **6/6** |
| contratos (app×backend) | `npm run contract:check` + `:strict` | **OK — 404 chamadas / 555 rotas, 0 pendências** (−69 chamadas: wrappers removidos no settlement) |
| storybook tests | `npm run test:storybook` | **73/73 (21 arquivos)** |
| regressão visual | `npm run test:visual -- --no-build` (após `build-storybook`) | **73/73 snapshots, 0 atualizados** |
| build prod (PWA) | `npm run build` | **88 precache / 2656,83 KiB** (baseline 00 = 82/2579,63) |
| docs | `npm run docs:check` | **OK** |
| estrutura | `npm run audit:frontend-structure` | **exit 0** (informativo: 56 arq. > limiar estrutural; era 67) |
| orfãos | `node --max-old-space-size=4096 scripts/check-orphan-exports.mjs` | **0 arquivos mortos** / 157 exports órfãos (eram 25+11 mortos / 181) |
| entrega | `npm run verify:delivery` | **OK** |
| knowledge graph | `graphify update .` | ✓ (regenerado pós-settlement) |

Não fazem parte do gate: `test:e2e` (Playwright exige servidor local), prettier `format:check`.
> a11y deixou de ser informativo em 2026-10-04 (D-005 sanada): `a11y.test: 'error'` — ver §5.

## 2. Escopo cumprido (Etapas 0 → 10)

| Etapa | Doc | Resultado |
|---|---|---|
| 0 baseline | `00-baseline.md` | gates de partida capturados |
| 1 tokens/styles | `04` | tema/fontes verdes preservados em `src/styles/` |
| 2 scaffolding | `05` | `app/`, `layouts/`, 28 barris `features/*`, vitest+MSW+lint |
| 3 componentes | `06` | `components/ui` + `patterns` com stories/a11y |
| 4 pilotos | `07` | queue + finance com comparação visual |
| 5a–6d migração | `08`–`13` | operação → clientes/CRM → catálogo → settings → crescimento |
| 7 master admin | `14` | `pages/master-admin/` + extração `features/billing` |
| 8 permissões/contratos | `16` | rotas×roles sem drift; checker estendido (helpers/delegação); storage audit |
| 9 limpeza | `17` | orfãos: 3 arquivos+8 exports removidos; teste de contrato de rotas; D-002 medido; D-015 passo 1 |
| 10 entrega | este doc | gate final verde com evidências acima |
| settlement §6 | `15` | **EXECUTADO** (2026-10-03): 25 adiados + 12 conssequências = 37 arquivos removidos (16 painéis, credit-card-form, MasterAdminDashboard, 7 skeletons, PromptModal, 11 APIs órfãs); dívidas D-012 removida, D-010/D-014 atualizadas |

## 3. Débitos abertos ao fechar (detalhes em `debts.md`)

- ~~**Gate/D-003**~~ → **sanada** (2026-10-04, §5): lint 0 erros (também em `server/`/`e2e/`).
- ~~**Cobertura/D-005**~~ → **sanada** (2026-10-04, §5): a11y em `test: 'error'`, 73/73 sem violações.
- **Adoção story-first:** D-007 (OwnerFinancialPanel), ~~D-008 (stories pendentes)~~ → **concluída** (2026-10-04, §5), D-009 (ClientProfileSheet), D-010 (checkout full-screen — `credit-card-form` já removido), D-011 (PostEditor), D-014 (states trio — skeletons órfãos já removidos).
- ~~Settlement (sanção)~~ → **executado** (0 arquivos mortos; ver [15](15-section6-settlement.md)).
- **Budget/D-002:** −50 KiB disponíveis no CSS via `@source not` após restyle de39 stories.
- ~~**Persistência/D-015**~~ → **passo 2 concluído** (2026-10-04): `utils/clientIdStorage.ts` com migração read-once + testes; ~~**D-016**~~ → **concluída**: `features/posts/draftStorage.ts` compartilhado.
- **D-001/D-004/D-006/D-013:** monitoramento contínuo (patches Storybook, ACL SWC, flake, data relativa — caso `ClosedSalonJoinModal` corrigido em 2026-10-04).

## 4. Pendências do usuário (fora do gate)

1. `git push` (FE + `agendai-back-end`) — **executar ao final do settlement**.
2. ~~Sanção do settlement §6~~ → **executado**.
3. **Console externo (não executável daqui — sem chave Render/gcloud):**
   - **Render (API `agendai-pcts`)** → Environment → adicionar:
     - `WEATHER_USER_AGENT` = `AgendaJa/1.4 (https://agendai-pcts.onrender.com/contato)`
       (é o fallback já embutido em `MetNoWeatherProvider.ts:100` — valor explícito só torna auditável);
     - `EMAIL_FROM` = `Agenda Já <noreply@<domínio-verificado-no-Resend>>` — **o domínio precisa estar
       verificado no Resend**; sem env, o fallback é `Agenda Já <onboarding@resend.dev>`
       (`ResendEmailProvider.ts:31`), que só serve para e-mails de teste do Resend.
   - **GCP Console → IAM**: editar o *display name* da service account (o identificador que importa,
     o e-mail da SA, já está correto — display name é cosmético).

## 5. Re-execução pós-fila de dívidas (2026-10-04)

Diretriz do usuário ("resolva tudo que precisa"): **D-003, D-015, D-016, D-005 e D-008 executadas**.

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** (inclui `e2e/` e `server/` após D-003) |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 487 warn** |
| lint full-scope | `npx eslint .` | **0 err / 489 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **334/334 (79 arquivos)** |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas, 0 pend** |
| storybook + a11y | `npm run test:storybook` | **89/89**, `a11y.test: 'error'` (**0 violações**) |
| regressão visual | `test:visual -- --no-build` | **89/89** (16 snapshots novos gravados; 1 atualizado: `QueueItemCard › Completed`) |
| build prod (PWA) | `npm run build` | **88 precache / 2656,62 KiB** |
| órfãos | `scripts/check-orphan-exports.mjs` | **0 arquivos mortos** |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

O que cada dívida exigiu:

- **D-003 (sanada):** `tsconfig.json` passou a incluir `e2e`/`server`; `--fix` nos 5 erros de código
  (`emailApi`/`goalsApi`/`staffApi` → `interface`, `LoginPage.test` → `T[]`); override de globals node
  para `server/**/*.js` no `eslint.config.js`; directive obsoleta removida de `e2e/mvp-public.spec.ts`.
- **D-015 (passo 2):** `src/utils/clientIdStorage.ts` (chave `agendai:barber_customer_id` + migração
  read-once da chave legada) + 4 testes; `SchedulingContext` e `PrivacyPolicyPage` atualizados.
- **D-016:** `src/features/posts/draftStorage.ts` (`readDraft`/`writeDraft` com versão explícita);
  `PostEditor` refatorado (v2) e `PostsManager` teve o trio local morto removido (v1 = discriminador).
- **D-005 (sanada):** gate a11y virou `test: 'error'`; correções: tokens `danger`/`danger-fg`
  (`tokens.css`), `Button` danger e `Avatar` COLORS, `QueueItemCard` (removido `opacity-70` —
  opacidade reduzida não alcança 4.5:1 em texto 12px), `WeatherForecastWidget` (textos fora do
  gradiente migraram de `text-white/*` para tokens semânticos), `ProfitEnginePanel` (`aria-label`)
  e `Tabs.stories` (tabpanels com `aria-controls`/`aria-labelledby`).
- **D-013 (caso):** `ClosedSalonJoinModal` deixou de ler `new Date()` no render (prop `todayIndex`
  fixada na story) — era a causa dos 2 snapshots que divergiam a cada virada de semana.
- **D-008 (sanada):** 16 stories novas em 8 painéis (`CashPanel`, `GoalsPanel`, `LoyaltyPanel`,
  `WaitlistPanel`, `RecurringPackagesPanel`, `RecommendationsPanel`, `EquipmentPanel`,
  `DepositPolicyPanel`) + `src/tests/storyProviders.tsx` (BarbershopFilters → Auth → Barbershop,
  com `SeedShop` semeando `barbershopId` — sem ele todo painel fica em loading infinito).
  Correções de a11y exigidas pelas novas stories: `aria-label` nos botões só-ícone de refresh
  (`CashPanel`, `GoalsPanel`) e `text-text-secondary` no rótulo "Total recebido" (muted no card
  `bg-selection` ficava em 4.3:1).
