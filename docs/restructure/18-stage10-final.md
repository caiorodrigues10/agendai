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
- **Adoção story-first:** ~~**D-007 (OwnerFinancialPanel)**~~ → **sanada** (2026-10-05, §6), ~~**D-008 (stories pendentes)**~~ → **concluída** (2026-10-04, §5), ~~**D-009 (ClientProfileSheet → ModalShell)**~~ → **sanada** (2026-10-05, §7), ~~**D-010 (checkout full-screen)**~~ → **sanada** (2026-10-05, §9), ~~**D-011 (PostEditor → ui/Button)**~~ → **sanada** (2026-10-05, §8), D-014 (states trio — billing em §10, financeiro em §13, painéis owner em §14, assinatura/pacotes em §15 e waitlist em §16 concluídos em 2026-10-05; restam réplicas fora dessas áreas).
- ~~Settlement (sanção)~~ → **executado** (0 arquivos mortos; ver [15](15-section6-settlement.md)).
- ~~**Budget/D-002**~~ → **sanada** (2026-10-05, §11): `@source not` adotado — na reavaliação o delta real é −0,3 KiB CSS (6 utilities, 4 delas fantasmas de ids de fixture) e o único restyle real foi em `TokensGallery` (2 classes).
- ~~**Persistência/D-015**~~ → **passo 2 concluído** (2026-10-04): `utils/clientIdStorage.ts` com migração read-once + testes; ~~**D-016**~~ → **concluída**: `features/posts/draftStorage.ts` compartilhado.
- **D-001/D-004/D-006:** monitoramento contínuo (patches Storybook, ACL SWC, flake).

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

## 6. D-007 — OwnerFinancialPanel (2026-10-05)

Story-first do painel (1641L) antes de extrair as abas (regra da dívida) + **dois fixes de infra
da regressão visual** descobertos por ela.

### 6.1 O que foi feito

- `OwnerFinancialPanel.stories.tsx` (novo): `Default`/`Despesas`/`Fiado` com handlers MSW
  (`summary`/`cash`/`categories`/`expenses`/`expenses-summary`/fiado) + play clicando nas abas e
  congelando o `date` em 2026-10-01 (D-013). Correções de a11y no painel: `title` em
  Confirmar/Cancelar/Excluir despesa e `aria-label="Valor do pagamento"`.
- **Fix 1 — MSW no build estático:** `public/mockServiceWorker.js` (cópia de
  `node_modules/msw/lib/mockServiceWorker.js`). O Vitest resolve o worker via plugin
  `@vitest/browser`, mas o build estático do Storybook não o servia → no `test:visual` **toda story
  com `parameters.msw` capturava estado de erro**; 22 baselines foram regravados com dados reais.
- **Fix 2 — stories em branco:** em `.storybook/test-runner.ts`,
  `NO_ANIMATION_CSS` passou de `animation-duration:0s` → `0.01ms` (mesmo valor do
  reduced-motion em `src/styles/base.css`). Com `0s` o Chromium trava o keyframe `from`
  (`opacity:0`) do `fade-in … forwards` (tokens.css) e o raster fica vazio; `postVisit` também
  espera `#storybook-root` com filho + 2 frames antes do screenshot (networkidle resolvia cedo).
  Evidência: baseline com `animation-duration:0s` = 5853 B uniforme vs. corrigida = 95915 B.
  28 baselines alterados ao todo (22 dados MSW + 6 fade-in); `QueueCapacityBanner › within-limit`
  continua vazio por design (o componente não renderiza abaixo do limite).
- `eslint.config.js`: `public/` ignorado (worker de terceiros fora do `tsconfig` — era o único
  erro de lint do full-scope).

### 6.2 Evidências do gate (números novos)

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 487 warn** |
| lint full-scope | `npx eslint .` | **0 err / 489 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **337/337 (80 arquivos)** |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas, 0 pend** |
| storybook + a11y | `npm run test:storybook` | **92/92 (30 arquivos)**, `a11y.test: 'error'` (**0 violações**) |
| regressão visual | `test:visual -- --no-build` | **92/92 snapshots, 0 atualizados** (após rodada `-u` com 28 baselines corrigidos) |
| build prod (PWA) | `npm run build` | **89 precache / 2666,17 KiB** (+1 = `mockServiceWorker.js`) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |
| orfãos | `scripts/check-orphan-exports.mjs` | **0 arquivos mortos** |

## 7. D-009 — ClientProfileSheet → ModalShell (2026-10-05)

Story-first + conversão do overlay ad-hoc, com prova de paridade visual.

### 7.1 O que foi feito

- `ClientProfileSheet.stories.tsx` (novo): 5 stories (`Default`, `Pacotes`, `Histórico`,
  `Financeiro`, `SemAnalitico`) com MSW (`/api/clients/:id`, `/api/crm/clients/:id`,
  `/api/service-packages`, `/api/clients/:id/procedures`); fixtures reutilizam
  `features/appointments/storyFixtures`. O sheet usa `createPortal(document.body)`, então os
  plays consultam `within(document.body)`.
- **ModalShell ganhou a variante `sheet`:** `variant?: 'dialog' | 'sheet'` — bottom-sheet
  `max-w-2xl`/`max-h-[92dvh]`, header fixo com `border-b`, corpo rolável `ag-scroll`, wrapper
  `p-0 sm:p-4`, fechar `p-2` + `X` 18; mais os slots `actions` (ao lado do fechar), `ariaLabel`
  (nome acessível estável via `aria-label` enquanto o título carrega) e `bodyClassName`.
  O caminho `dialog` permanece idêntico (ConfirmDialog, BookPackageSessionsModal,
  AppointmentBookingModal e demais consumidores).
- **ClientProfileSheet convertido:** backdrop/header/abas agora são props do shell (`title` =
  skeleton ou nome+chip+telefone, `children` = nav de abas, `actions` = WhatsApp + Agendar,
  `body` = painéis). FocusLock e Escape passaram a vir do shell — removidos `previousFocusRef`
  e o listener manual (o scroll-lock do body ficou no componente); `z-[100]` → `z-[110]`
  (ConfirmDialog e os modais de agendamento, renderizados depois no mesmo portal, continuam
  acima).
- **a11y descoberto pela nova story:** `role="combobox"` tem *Name From: author* (ARIA 1.2) — o
  texto do gatilho do `SmartSelect` não conta como nome acessível e o `button-name` do axe
  falhava (o componente nunca tinha story, então nunca foi testado). Fix:
  `aria-label={ariaLabel ?? label ?? valueText}` no gatilho — com `label`, o nome vira
  exatamente o rótulo (compatível com `getByRole('combobox', { name })` dos testes); sem
  `label`, vira placeholder/valor selecionado.

### 7.2 Paridade visual (a conversão não mudou pixels)

`test:visual` antes (overlay ad-hoc) → depois (ModalShell `sheet`): **97/97 snapshots,
0 atualizados** — as 5 stories do sheet passaram byte a byte.

### 7.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 487 warn** |
| lint full-scope | `npx eslint .` | **0 err / 489 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **342/342 (81 arquivos)** |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas, 0 pend** |
| storybook + a11y | `npm run test:storybook` | **97/97 (31 arquivos)**, `a11y.test: 'error'` (**0 violações**) |
| regressão visual | `test:visual` | **97/97, 0 atualizados** |
| build prod (PWA) | `npm run build` | **89 precache / 2665,87 KiB** |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

---

## 8. D-011 — PostEditor: story + ações em `ui/Button` (2026-10-05)

Story-first + conversão das ações de comando, com o escopo residual documentado.

### 8.1 O que foi feito

- **`PostEditor.stories.tsx` (novo):** 5 stories (`Objectives`, `Conteudo`, `Imagem`,
  `Formato`, `Identidade`) com MSW (`/api/posts/templates|preview|palettes`); thumbnails e
  preview via SVG data-URI; cada story usa `userId` próprio (`draftStorage` é por usuário -
  rascunho não vaza entre stories); play do gate de objetivos (`Divulgar serviço`). O campo
  `datetime-local` só aparece no modo agendado e as stories evitam esse estado (D-013).
- **Números reais vs registro:** a dívida dizia "914L / 23 crus / já usa 23 `ui/Button`";
  o arquivo tinha **1136L / 28 crus / 0 `ui/Button`**.
- **9 botões convertidos para `ui/Button`** (todas as ações de comando): `Gerar sugestões`,
  `Trocar vídeo`, `Remover`, `Enviar vídeo`, `Baixar PNG`, `Cancelar`, `Rascunho`,
  `Publicar/Agendar`, `Enviar nova foto`. A prop `loading` não é usada aqui: `PostEditor.test`
  consulta por nome/habilitação e o `loading` substitui os children.
- **19 crus restantes são intencionais:** cards de seleção (objetivos, formatos, sugestões,
  slots de mídia), chips (tom/template/filtro), swatches de paleta, tabs, radios
  (`role="radio"` com roving tabindex), toggle `aria-pressed` do modo de publicação e os
  closes `p-2` (mesmo chrome do `ModalShell`). A base do `ui/Button` (`rounded-xl font-bold`,
  sem opt-out seguro por causa da ordem de classes do Tailwind) não cabe em tabs underline
  nem em selection cards; o padrão cru `role="radio"`/`aria-pressed` é o usado em 10+ arquivos
  (PlansPage, CheckoutPage, LoyaltyPanel…). Adotar `patterns/Tabs` no editor mudaria o papel
  dos elementos e os `getByRole('button')` dos testes → escopo separado, se um dia for feito.

### 8.2 Paridade visual

Baselines das 5 stories gravadas antes da conversão; a rodada pós-conversão passou
**102/102 snapshots, 0 atualizados** - as diferenças do footer/mídia ficaram dentro do
threshold de 2% do `jest-image-snapshot` (`failureThreshold: 0.02` percentual,
`.storybook/test-runner.ts`).

### 8.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 487 warn** |
| lint full-scope | `npx eslint .` | **0 err / 489 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **347/347 (82 arquivos)** = 245 app + 102 storybook |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas, 0 pend** |
| storybook + a11y | `npm run test:storybook` | **102/102 (32 arquivos)**, `a11y.test: 'error'` (**0 violações**) |
| regressão visual | `test:visual` | **102/102, 0 atualizados** |
| build prod (PWA) | `npm run build` | **89 precache / 2664,69 KiB** |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

---

## 9. D-010 — checkout embutido → ModalShell sheet (2026-10-05)

Story-first do `OwnerSubscriptionPanel` + conversão do 2º overlay (`payOpen`) em `ModalShell variant="sheet"`, com a variante `embedded` do checkout finalmente consumida.

### 9.1 O que foi feito

- **`OwnerSubscriptionPanel.stories.tsx` (novo):** 3 stories (`Default`, `Cancelamento`,
  `CheckoutAberto`) com MSW (`/api/auth/me`, `/api/subscriptions/me`, `/api/plans[/:id]`,
  `/api/subscriptions/cancellation-context`); seed de token/usuário no decorator + cleanup
  no desmontar (`StoryFrame`) — o test-runner usa um só contexto Playwright e o storage
  vaza entre stories sem isso; plays clicam em `Cancelar` e `Pagar / renovar Essencial`.
- **Conversão:** o overlay `fixed inset-0 z-[80]` virou `<ModalShell variant="sheet">`
  (`title="Finalizar assinatura"`, `titleId="checkout-sheet-title"`) com `body` =
  `SubscriptionCheckout variant="embedded"` e o `closeCheckout` centralizando o reset de
  `payOpen/payPlanId/paySetupTrial` (usado por `onClose` do shell e `onBack` do checkout).
  FocusLock, Escape, backdrop e fechar agora vêm do shell — antes o overlay não tinha
  focus trap, nem Escape, nem bloqueio do conteúdo de fundo para o AT.
- **`CheckoutPage` consumiu `variant="embedded"`:** antes a prop era declarada e nunca
  usada (o overlay renderizava o full-page com header próprio). Agora: sem `min-h-screen`,
  sem header (o sheet fornece `Fechar` → `onBack`) e `main` sem padding (o corpo do shell
  fornece `px-4 py-4 sm:px-5`); `variant="page"` (rota `/checkout`) permanece idêntica.
- **Duas descobertas da story, corrigidas:**
  - **a11y/contraste:** o hint "QR Code na hora" (`text-[11px] text-text-muted`, 4.3:1 sobre
    `bg-selection`) violava 4.5:1 → `text-text-secondary` (~7:1) em `CheckoutPage`.
  - **Corrida de refresh (`SubscriptionContext`):** `refresh` dependia do objeto `user`
    (identidade nova a cada `normalizeUser` do boot do AuthProvider) e o throttle de foco
    começava em `0` — o 1º foco pós-boot disparava um 2º fetch que ligava `loading` e o
    painel trocava para spinner **no meio do play**, desmontando o botão antes do click
    (silencioso: o React ignora eventos em nós destacados; o handler nem era chamado).
    Fix: deps por primitivas (`userId`/`shopId`) + semente do throttle no mount — elimina
    também o duplo fetch redundante do app real no boot.

### 9.2 Prova visual (mudança de propósito, escopo contido)

Baseline pré-conversão gravada primeiro (3 snapshots novos → 105/105); pós-conversão a
rodada falhou **exatamente 1** (`CheckoutAberto` — sheet centrada vs overlay full-screen)
e `--updateSnapshot` atualizou só aquela — as outras **104 passaram byte-idênticas**.
Verificação final: `test:visual -- --no-build` → **105/105, 0 atualizados**.

### 9.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 486 warn** (−1: warning `variant` unused resolvido pela conversão) |
| lint full-scope | `npx eslint .` | **0 err / 488 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **350/350 (83 arquivos)** = 245 app + 105 storybook |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas, 0 pend** |
| storybook + a11y | `npm run test:storybook` | **105/105 (33 arquivos)**, `a11y.test: 'error'` (**0 violações**) |
| regressão visual | `test:visual -- --no-build` | **105/105, 0 atualizados** (1 atualizado na rodada `-u` pós-conversão, só `CheckoutAberto`) |
| build prod (PWA) | `npm run build` | **89 precache / 2664,86 KiB** |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

---

## 10. D-014 — adoção do trio states no billing (2026-10-05)

Story-first do `SubscriptionsSection` + adoção de `SectionError`/`DataTableState` (E2) nas
seções de billing, encerrando as receitas locais duplicadas de `billingShared`.

### 10.1 O que foi feito

- **`SubscriptionsSection.stories.tsx` (novo):** 3 stories (`Default`, `Erro`, `Vazio`) com
  MSW de `/api/admin/subscriptions[?query]` e `/api/admin/subscriptions/economics`; seed de
  access token no decorator (`adminApi.getAuthHeader()` lança sem token) + cleanup no
  desmontar, como nas stories da D-010. Story `Carregando` omitida de propósito: a captura
  aguarda `networkidle` e um fetch pendente a derruba — o estado de loading fica coberto
  pelos baselines dos componentes (`states-datatablestate-*`, `skeletons/*`).
- **`SectionError` → re-export do trio** em `billingShared`
  (`export { SectionError } from '../../components/patterns'`): os 7 sites de billing usam
  o componente do padrão (`role="alert"`, retry link, contraste neutro); a receita local
  (card `bg-danger/5` com retry botão) saiu. `TableSkeleton`/`EmptyRow` locais removidos —
  sem consumidores após a conversão.
- **`DataTableState` em 6 seções:** Subscriptions (7 col), Refunds (6), Payments (7),
  Notifications (4) e Blocked (5) — os branches `loading`/`vazio` do `tbody` viraram
  short-circuit antes do card (`skeletonProps={{ cols }}`); Plans — pulse-grid passou a
  `skeleton` custom + `emptyTitle`. `RevenueSection` mantido: formato KPI/card não é
  data-table (o `SectionError` dele herdou o trio via re-export).
- **D-014 segue aberta com escopo menor:** réplicas de estado **fora** de billing (divs
  inline de erro em outros painéis) — próxima área, mesma receita story-first.

### 10.2 Prova visual

Baseline pré-adoção gravada primeiro (3 snapshots novos → 108/108); pós-adoção a rodada
falhou **exatamente 2** — `Erro` **9,16%** (card local → card do trio) e `Vazio` **27,16%**
(`EmptyRow` em linha → `EmptyState` tracejado) — enquanto `Default` e os 105 baselines
antigos passaram; `-u` atualizou só os 2. Verificação final: `test:visual -- --no-build` →
**108/108, 0 atualizados**.

**Corrida latente do `PostEditor` (achado na rodada):** o preview (`/api/posts/preview`,
com debounce) disputava o `networkidle` da captura — `Conteudo` flipou 9,08% sem mudança de
código nenhum. Fix: os 4 plays de editor agora esperam `<img alt="Prévia do post">` (estado
final determinístico) → 4 baselines atualizadas e estáveis; `Objectives` (gate, sem editor)
intocada.

### 10.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 486 warn** |
| lint full-scope | `npx eslint .` | **0 err / 488 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **353/353 (84 arquivos)** = 245 app + 108 storybook |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas, 0 pend** |
| storybook + a11y | `npm run test:storybook` | **108/108 (34 arquivos)**, `a11y.test: 'error'` (**0 violações**) |
| regressão visual | `test:visual -- --no-build` | **108/108, 0 atualizados** (3 novos pós-`-u` + 4 baselines do PostEditor estabilizadas) |
| build prod (PWA) | `npm run build` | **90 precache / 2666,41 KiB** (antes 89 / 2664,86 — +1 entry / +1,55 KiB) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

## 11. D-002 — utilities de stories fora do bundle (2026-10-05)

### 11.1 Premissa reavaliada (A/B)

Reprodução do experimento da Etapa 9 no mesmo formato (Tailwind 4.1.18; dois builds
com/sem `@source not './**/*.stories.tsx'` em `src/index.css`, diff regra-a-regra):

| Build | CSS principal | precache (PWA) |
|---|---|---|
| sem directive (baseline) | **200,8 KiB** | **2666,41 KiB / 90 entries** |
| com directive | **200,5 KiB** | **2666,15 KiB / 90 entries** |
| delta | **−0,3 KiB** | **−0,26 KiB** |

Os **−51,4 KiB** do registro da Etapa 9 **não se reproduzem**. O diff acusa exatamente
**6 utilities** ausentes com o directive ligado:

- `m-1`, `m-2`, `ps-1`, `pe-1` — **fantasmas**: o extractor do Tailwind lê strings cruas
  (`id: 'm-1'`, `'ps-1'` nas fixtures do `PostEditor` e do `ProfitEnginePanel`) como
  candidates; nenhum `className` real usa essas classes;
- `text-brand`, `lg:grid-cols-5` — os **2 reais**, ambos só em
  `TokensGallery.stories.tsx`.

### 11.2 Restyle (2 classes em 1 story) + prova visual

- `TokensGallery` L106: `lg:grid-cols-5` → `lg:grid-cols-6` (nenhum componente gera a
  variante `lg:`×5; 6 é a vizinha gerada mais próxima — a cadeia
  `grid-cols-2 → sm:grid-cols-3 → lg:grid-cols-6` mantém o gallery legível em todas as larguras);
- `TokensGallery` L120: `text-brand` → `text-accent` (alias documentado no próprio gallery;
  no dark `#2cb58a` é idêntico ao brand, no light troca `#249b76` por `#1c7e61`).

Prova visual com o directive ligado: falhou **exatamente 1/108** —
`fundações-tokens--galeria`; os 107 restantes byte-idênticos (inclusive as 3 baselines de
billing e as 4 do PostEditor da D-014). Diff inspecionado (só o shift de grid, paleta
preservada) → `-u` atualizou só esse baseline; re-run `test:visual -- --no-build` →
**108/108, 0 atualizados**.

### 11.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 486 warn** |
| lint full-scope | `npx eslint .` | **0 err / 488 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **353/353 (84 arquivos)**, exit 0 |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **108/108 (34 arquivos)**, `a11y.test: 'error'`, exit 0 |
| regressão visual | `test:visual -- --no-build` | **108/108, 0 atualizados** (1 baseline atualizado: `fundações-tokens--galeria`) |
| build prod (PWA) | `npm run build` | **90 precache / 2666,15 KiB** (−0,26 vs D-014), CSS principal **200,5 KiB** |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

## 12. D-013 — auditoria de datas relativas (2026-10-05)

### 12.1 Auditoria

Varredura: `new Date()` sem argumento em 14 arquivos de `src`; `toLocale*`/`Date.now()`
em todas as stories. Stories que renderizam relógio/data derivados de "agora":

| Story | O que depende de "agora" | Situação pré-auditoria |
|---|---|---|
| `QueueItemCard` (4 baselines) | "Chegou às HH:MM" ← fixture `Date.now() − 12min` | dependia do limiar de 2% (texto difere <2% dos pixels) |
| `ReturnToQueueModal` (3) | fixtures `Date.now() − X` | idem |
| `AppointmentBookingModal` (3) | `defaultDate ?? toLocalISO(new Date())` no Default | relógio real embutido no input |
| `ProfitEnginePanel` (3) | `getCurrentPeriod()` → `YYYY-MM` | viraria a cada mês |
| `FinancialDashboard` (2) | `startOfDay/Week/Month` de `filteredData` (fixture `completedAt` 28/09) | baseline de 05/10 07:08 vazia (0 registros) |
| `ClosedSalonJoinModal` | `new Date().getDay()` | **já corrigido** na Etapa 7 (prop `todayIndex` = 4) |
| `BookPackageSessionsModal` | data/semana/slots | **já congelado** na Etapa 7 |

**Achado-chave:** o congelamento (`globalThis.Date = FrozenDate`, `2026-10-01T12:00`)
vivia **no módulo do `BookPackageSessionsModal.stories.tsx`** — efeito colateral escondido
num arquivo de story. Com carregamento por story, só aquela story era congelada; as demais
rodavam com a data real e passavam por acaso (limiar de 2% ou baseline gerada no mesmo dia).

### 12.2 Correção

- **Relógio centralizado em `.storybook/preview.tsx`** (módulo de entrada do iframe → vale
  para todas as stories e para o test-runner), com comentário documentando a data congelada
  e o custo de movê-la (regenerar todos os baselines com `test:visual -- -u`);
  `BookPackageSessionsModal.stories.tsx` ficou sem o side-effect.
- **`FinancialDashboard`: `aria-label` nos 3 botões de ícone da coluna Ações** (lixo,
  check, X) — com o relógio congelado as linhas do histórico entram na captura e o axe
  passou a enxergar o botão: `button-name` era uma violação real **latente** (a baseline
  anterior nunca renderizou linhas).
- **Baseline `financeiro-financialdashboard--plano-upgrade` regenerado** (as 3 linhas
  aparecem): `filteredData` L170 **muta** `now` via `setDate(...)` e o `startOfMonth` da
  L171 passa a ser setembro → fixture 28/09 incluída; com a data real de 05/10 a janela
  era outubro → vazia. Sob relógio congelado isso é determinístico.

### 12.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint (gate) | `npm run lint` | **0 err / 486 warn** |
| lint full-scope | `npx eslint .` | **0 err / 488 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **353/353 (84 arquivos)** |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **108/108 (34 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual -- --no-build` | **108/108, 0 atualizados** (1 baseline regenerado: `financialdashboard--plano-upgrade`) |
| build prod (PWA) | `npm run build` | **90 precache / 2666,56 KiB** |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

**Política para stories novas:** qualquer story que renderize "agora" já nasce
determinística (freeze global no preview). Ao mexer em `FROZEN_NOW`, rodar
`test:visual -- -u` completo e regerar todos os baselines.

## 13. D-014 — adoção do trio states no financeiro (2026-10-05)

Segunda área da receita story-first: as réplicas de erro inline dos painéis financeiros
viraram `SectionError` (E2), com retry/acão no componente padrão.

### 13.1 O que foi feito

- **`SectionError` ganhou `action?: ReactNode`:** retry e ação (ex.: "Fazer upgrade")
  passaram a renderizar num container `flex flex-wrap gap-x-4 gap-y-2` — o botão de
  upgrade do `FinancialDashboard` não precisa mais de `ml-auto` improvisado no wrapper.
- **6 sites convertidos (4 componentes), todos story-first:**
  | Componente | Site | Conversão |
  |---|---|---|
  | `CashPanel` | load (L191) + submit (L350) | `SectionError` com `onRetry={load}` / sem retry no submit |
  | `ProfitEnginePanel` | load (L228) | `onRetry={loadData}`, `className="mx-5"` preservado |
  | `OwnerFinancialPanel` | refresh (L463) | `onRetry={handleRefresh}` |
  | `FinancialDashboard` | comissões (L337) + insights (L393) | `action={<button>Fazer upgrade</button>}` → `navigate('/planos')` |

  `AlertCircle` deixou de ser importado em `CashPanel`/`ProfitEnginePanel` (órfão após a
  conversão); nos demais continua em uso próprio. `WeatherForecastWidget` ficou **fora de
  escopo**: o erro dele é texto muted, não réplica do card danger.
- **2 stories novas:** `FinancialDashboard.ComissaoErro` (MSW 403 `DASHBOARD_REQUIRED`
  via `mswHandler({ commissionFail })`) e `OwnerFinancialPanel.Erro` (play: aba Despesas →
  excluir → confirmar → 500 `Não foi possível excluir a despesa`, com
  `getAllByTitle('Excluir despesa')` — a tabela tem 3 linhas).
- **Play do `OwnerFinancialPanel.Erro` rola a página ao topo** (`window.scrollTo(0,0)`)
  após o `findByText`: o clique em "Excluir" deixava o iframe scrolado no meio do
  formulário e o card de erro (no topo do painel) ficava **fora da captura** — a baseline
  não provava nada sobre a mudança.

### 13.2 Prova visual

Receita aplicada na ordem: baselines da UI antiga primeiro (2 novas stories gravadas →
110 snapshots), conversão, rodada de prova. O resultado foi **exatamente as 5 stories
esperadas** falhando (110 no total):

`cashpanel--erro` · `profitenginepanel--erro` · `financialdashboard--plano-upgrade` ·
`financialdashboard--comissao-erro` · `ownerfinancialpanel--erro`

Diffs inspecionados um a um: só o card de erro (paleta `danger` preservada, mensagem +
retry/upgrade visíveis) e o shift de layout decorrente da altura nova do card — nas 4
primeiras o card novo fica no topo do frame; na do `OwnerFinancialPanel` a diferença
visual era só o deslocamento (ver 13.1). `-u` atualizou as **5**; re-run
`test:visual -- --no-build` → **110/110, 0 atualizados**.

### 13.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 486 warn** |
| lint full-scope | `npx eslint .` | **0 err / 488 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **355/355 (84 arquivos)** = 245 app + 110 storybook (+2 stories novas) |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **110/110 (34 arquivos)**, `a11y.test: 'error'` (play das 2 stories novas com `findByText`) |
| regressão visual | `test:visual -- --no-build` | **110/110, 0 atualizados** (5 atualizados na rodada de prova) |
| build prod (PWA) | `npm run build` | **90 precache / 2665,61 KiB** (−0,95 KiB vs D-013) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

## 14. D-014 — adoção do trio states em painéis owner (2026-10-05)

Terceira área da receita story-first: os 4 painéis owner que já tinham stories e usavam a
mesma div inline de erro (`flex items-center gap-3 rounded-xl border border-danger/30
bg-danger/10 px-4 py-3`) passaram ao `SectionError`.

### 14.1 O que foi feito

- **4 stories `Erro` novas** (MSW 500 com mensagem própria, antes da conversão, para
  gravar o baseline da UI antiga):
  | Story | Endpoint que falha | Mensagem |
  |---|---|---|
  | `Metas/GoalsPanel.Erro` | `/goals/ranking` | `Erro ao carregar metas` |
  | `Fidelidade/LoyaltyPanel.Erro` | `/loyalty/program` | `Erro ao carregar programa` |
  | `Recomendações/RecommendationsPanel.Erro` | `/analytics/recommendations` | `Erro ao carregar recomendações` |
  | `Equipamentos/EquipmentPanel.Erro` | `/equipment` (dashboard segue ok) | `Erro ao carregar equipamentos` |
- **4 sites convertidos:** `GoalsPanel` (L157), `LoyaltyPanel` (L103),
  `RecommendationsPanel` (L127) e `EquipmentPanel` (L456) — todos com
  `onRetry` = o `load` correspondente (`load`/`loadEquipment`). `AlertCircle` ficou órfão
  **só** em `RecommendationsPanel` (removido do import); nos demais há outro uso (modal/form).
- **Achado de processo (armadilha `--no-build`):** a primeira rodada de prova com
  `test:visual -- --no-build` passou **114/114** — o flag reusa o bundle anterior, que
  ainda continha a UI antiga. A prova real exige rebuild (`npm run test:visual` sem o
  flag); documentado aqui para as próximas áreas.

### 14.2 Prova visual

Com rebuild, a rodada falhou **exatamente as 4 stories novas** (110 restantes passaram).
Como o leitor de imagens da sessão devolveu mídia errada, a inspeção dos 4 diffs foi
**programática** (PIL, painéis `old | diff | new` de 1440px cada) e confirmou, nas 4:

- topo do card **idêntico** em old/new (posição vertical preservada);
- card antigo **45px** com **1 faixa de texto** (mensagem) → card novo **81px** com
  **2 faixas** (mensagem em `p-4` + link "Tentar novamente") — exatamente o formato do
  `SectionError`;
- conteúdo abaixo deslocado **+36px** (a diferença de altura) com resíduo médio 0,8–2,3
  (0–16,7 sem o shift) → nada além do card mudou.

`-u` atualizou as **4**; re-run `test:visual -- --no-build` → **114/114, 0 atualizados**.

### 14.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 486 warn** |
| lint full-scope | `npx eslint .` | **0 err / 488 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **359/359 (84 arquivos)** = 245 app + 114 storybook (+4 stories novas) |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **114/114 (34 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual -- --no-build` | **114/114, 0 atualizados** (4 atualizados na rodada de prova, pós-rebuild) |
| build prod (PWA) | `npm run build` | **90 precache / 2665,07 KiB** (−0,54 KiB vs §13) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

**Próximas áreas da D-014 (fora de billing/financeiro/painéis owner):** waitlist,
clients, notifications, organizations, CRM, master-admin, modais de agendamento
(`AppointmentBookingModal`/`BookPackageSessionsModal`), `ErrorBoundary` e páginas
públicas — nenhuma tem story de erro hoje; receita story-first permanece a mesma.

## 15. D-014 — assinatura e agendamento de pacotes (2026-10-05)

Quarta área da receita story-first: os 2 modais com banner inline de erro (`bg-danger/10
border border-danger/30`, sem `role="alert"`) e nenhuma story de erro — cancelamento de
assinatura e agendamento de sessões de pacote.

### 15.1 O que foi feito

- **2 stories `Erro` novas** (MSW 500, antes da conversão, para gravar o baseline da UI antiga):

  | Story | Endpoint que falha | Play |
  |---|---|---|
  | `Assinatura/OwnerSubscriptionPanel.Erro` | `DELETE /api/subscriptions/me` → `Não foi possível cancelar a assinatura` | `Cancelar` → `Cancelar mesmo assim` → motivo → `Cancelar assinatura` → `findAllByText` (a mensagem aparece 2×: modal + banner atrás do overlay) |
  | `Agenda/BookPackageSessionsModal.Erro` | `POST /api/client-packages/:id/book` → `Não foi possível agendar as sessões` | 1º slot (`HH:MM`) → `Confirmar 1 horário` → `findByText` |

- **3 sites convertidos:** `OwnerSubscriptionPanel` L261 (banner top-level) e L580 (dentro
  do modal de cancelamento, `className="mb-4"`) e `BookPackageSessionsModal` L126
  (`className="mb-4"`) — `SectionError` **sem `onRetry`**: o retry natural é re-executar a
  própria ação, cujo botão continua visível ao lado. `AlertCircle` ficou órfão **só** no
  `BookPackageSessionsModal` (removido do import); no `OwnerSubscriptionPanel` há outro uso
  (aviso de ciclo, L661).
- **Achado de contraste (D-005):** o play expôs que o botão `Cancelar assinatura` usava
  `text-white` literal sobre `bg-danger` → **2.76:1** no tema dark (`#ffffff` em `#f87171`),
  abaixo do AA 4.5:1 (fora do alcance do axe — fica atrás do overlay —, mas violação real).
  Corrigido para `text-danger-fg` (L715). **6 ocorrências irmãs** `bg-danger … text-white`
  fora do escopo deste batch, registradas na D-014: `TeamManager` L323, `PaymentsSection`
  L105, `FinancialDashboard` L345/L400, `ProductFormModal` L309, `RefundSaleModal` L170.

### 15.2 Prova visual

Baselines da UI antiga primeiro (2 novas stories → 116 snapshots), conversão, rodada de
prova **com rebuild** falhou **exatamente as 2 stories esperadas** (114 restantes
passaram). Inspeção PIL dos 2 diffs (painéis `old | diff | new`):

- `BookPackageSessionsModal`: card **37 → 53px** (`px-3 py-2` → `p-4`, 1 faixa de texto
  cada — sem retry), conteúdo abaixo com shift **+16px** e resíduo **0.000**;
- `OwnerSubscriptionPanel`: card **45 → 53px**; o modal é centralizado verticalmente, então
  o topo sobe 4px e a base desce 4px (recentragem ±4), conteúdo abaixo com shift **+4px** e
  resíduo **0.000** — nada além do card mudou.

`-u` atualizou as **2**; re-run `test:visual -- --no-build` → **116/116, 0 atualizados**.

### 15.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npx tsc -p tsconfig.json --noEmit` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 489 warn** |
| lint full-scope | `npx eslint .` | **0 err / 491 warn** (teto 11/593); os 4 arquivos deste batch isolados: **0 err / 5 warn** (preexistentes) |
| testes app+storybook | `npm test` | **367/367 (85 arquivos)** = 116 storybook + app (1ª execução: 1 flake D-006 em `Skeleton.stories > Base` → reexec verde) |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **116/116 (34 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (prova, rebuild) + `-- --no-build` (re-run) | **116/116, 0 atualizados** (2 atualizados na prova) |
| build prod (PWA) | `npm run build` | **91 precache / 2669,31 KiB** (41,87s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

**Nota de sessão paralela:** outro trabalho está editando 6 arquivos no mesmo worktree
(`SchedulingContext.tsx`/`SchedulingContext.test.tsx`, `QueueItemCard.tsx`, `apiClient.ts`,
`schedulingApi.ts`, `StaffDashboard.tsx`) — **não tocados nem commitados aqui**; por isso
o total de warnings de lint, o nº de arquivos de teste (84→85) e o precache do build
(90→91) variam somando o trabalho alheio. As leituras de regressão visual deste batch
usaram o bundle do Storybook gerado durante a prova (do próprio batch).

**Próximas áreas da D-014:** waitlist, clients, notifications, organizations, CRM,
master-admin, `ErrorBoundary` e páginas públicas (`AppointmentBookingModal` segue fora de
escopo — o único erro exibido é mensagem de domínio, "Fechado neste dia"); receita
story-first permanece a mesma.

## 16. D-014 — lista de espera (2026-10-05)

Quinta área da receita story-first: `WaitlistPanel` com 2 sites de erro inline (carregamento
do painel e submissão do form) e nenhuma story de erro.

### 16.1 O que foi feito

- **2 stories `Erro` novas** (MSW 500, antes da conversão, para gravar o baseline da UI antiga):

  | Story | Endpoint que falha | Play |
  |---|---|---|
  | `Lista de espera/WaitlistPanel.Erro` | `GET /api/barbershops/:id/waitlist` → `Não foi possível carregar a lista de espera` | sem interação — `findByText` da mensagem (evita capturar o loader) |
  | `Lista de espera/WaitlistPanel.ErroForm` | `PATCH /api/barbershops/:id/waitlist/:entryId` → `Não foi possível salvar a entrada` | `Editar` (1ª entrada) → modal pré-preenchido → `Salvar` → `findByText` |

- **2 sites convertidos:** `WaitlistPanel` L175 (erro do `load` — o card cinza antigo
  `bg-surface border-border` com linha inline de `AlertTriangle` + "Tentar novamente"
  virou `SectionError` standalone **com `onRetry={load}`**, ganhando `role="alert"` e a
  paleta `danger`) e L249 (erro de submissão do modal → `SectionError` sem retry — o
  botão `Salvar` fica ao lado). `AlertTriangle` ficou órfão e foi removido do import.
- **Achado de processo (MSW custom do `preview.tsx`):** o `mswLoader` roda
  `worker.resetHandlers()` a cada story e aplica **só** os handlers daquela story —
  `parameters.msw.handlers` do story **substitui** os do meta (não mescla); endpoints não
  listados caem em `onUnhandledRequest: 'bypass'` (fetch sem resposta → painel sem dados).
  Por isso `ErroForm` precisa de `[...mswHandlers(entries), http.patch(...)]` (padrão já
  usado em `OwnerSubscriptionPanel.Erro`); `Erro` cobre com o único endpoint do meta.
  Sem o spread, o play falhava com `Unable to find role="button" /Editar/` — documentado
  para as próximas áreas.
- **Réplicas encontradas fora do escopo deste batch** (registradas na D-014): os divs de
  erro de submissão que o §14 não cobriu — `GoalsPanel` L303 e `LoyaltyPanel` L174 — e
  `TeamManager` L161/L174, `RecurringPackagesPanel` L384 (áreas fora da fila atual).

### 16.2 Prova visual

Baselines da UI antiga primeiro (2 novas stories → 118 snapshots, `2 written`), conversão,
rodada de prova **com rebuild** falhou **exatamente as 2 stories esperadas** (116
restantes passaram). Inspeção PIL dos 2 diffs:

- `WaitlistPanel.Erro`: card novo com **bordas `danger` em y0→81px** e **2 faixas**
  (mensagem + "Tentar novamente" — antes 1 faixa só, sem borda vermelha), conteúdo abaixo
  com shift **+28px** e resíduo **0.185**;
- `WaitlistPanel.ErroForm`: div inline **32 → 53px** (bordas `danger` y219→272, 1 faixa),
  modal centralizado recentra ±9–10px, conteúdo abaixo com shift **+9px** e resíduo
  **0.334** — nada além do erro mudou.

`-u` atualizou as **2**; re-run `test:visual -- --no-build` → **118/118, 0 atualizados**.

### 16.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npx tsc -p tsconfig.json --noEmit` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 489 warn** |
| lint full-scope | `npx eslint .` | **0 err / 491 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **369/369 (85 arquivos)** = 118 storybook (+2 stories novas) + app |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **118/118 (34 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (prova, rebuild) + `-- --no-build` (re-run) | **118/118, 0 atualizados** (2 atualizados na prova) |
| build prod (PWA) | `npm run build` | **91 precache / 2668,97 KiB** (46,03s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

**Nota de sessão paralela:** os 6 arquivos de outra sessão seguem intocados neste commit;
warnings de lint, nº de arquivos de teste e precache do build seguem somando o trabalho
alheio (ver §15).

**Próximas áreas da D-014:** clients (`ClientProfileSheet` L501), notifications (3
sites), organizations, CRM (3 sites), master-admin, `ErrorBoundary` e páginas públicas;
mais os 2 submits de painéis owner apontados em 16.1 (`GoalsPanel`/`LoyaltyPanel`).
