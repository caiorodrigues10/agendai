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
- **Adoção story-first:** ~~**D-007 (OwnerFinancialPanel)**~~ → **sanada** (2026-10-05, §6), ~~**D-008 (stories pendentes)**~~ → **concluída** (2026-10-04, §5), ~~**D-009 (ClientProfileSheet → ModalShell)**~~ → **sanada** (2026-10-05, §7), ~~**D-010 (checkout full-screen)**~~ → **sanada** (2026-10-05, §9), ~~**D-011 (PostEditor → ui/Button)**~~ → **sanada** (2026-10-05, §8), D-014 (states trio — billing em §10, financeiro em §13, painéis owner em §14, assinatura/pacotes em §15, waitlist em §16, ficha do cliente em §17, notificações em §18, organizações em §19, CRM em §20, submits de Goals/Loyalty em §21, master-admin (primeiras páginas do diretório) em §22, ErrorBoundary + páginas públicas em §23 e painéis de onboarding/equipe/indicações/recorrência/equipamentos em §24 concluídos em 2026-10-05/06; restam réplicas fora dessas áreas).
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

## 17. D-014 — ficha do cliente (2026-10-05)

Sexta área da receita story-first: `ClientProfileSheet` com 1 banner de erro inline único
(`<p className="mb-3 rounded-lg bg-danger/10 p-3 ...">`) que serve **8 catches** (load do
detalhe, edição, procedimentos, pacotes etc.).

### 17.1 O que foi feito

- **1 story `Erro` nova** (MSW 500, antes da conversão): `Clientes/ClientProfileSheet.Erro`
  falha o `GET /api/clients/:id` (load do detalhe) com `Não foi possível carregar o cliente`;
  handlers explícitos **falha primeiro** + os 3 endpoints de suporte (crm/packages/
  procedures — `Promise.all` do `loadDetail` precisa que só o client rejeite para a mensagem
  ser determinística). Play: `findByText` da mensagem no portal (`document.body`).
- **1 site convertido:** `ClientProfileSheet` L500 → `<SectionError message={error}
  className="mb-3" />` **sem `onRetry`** — o mesmo banner serve erros de load *e* de
  submissão; um retry recarregaria e descartaria edições em curso (o UI antigo também não
  tinha retry).
- **Achado de processo (threshold de 0.02):** a rodada de prova **passou 119/119** com a
  conversão já aplicada — o banner isolado (o erro zera o conteúdo do sheet, então nada
  abaixo dele desloca) mudou só **1,589%** dos pixels, abaixo do threshold do
  `test-runner.ts`. Verificação alternativa: apagar o baseline, regerar (`1 written` — nova
  UI) e comparar old/new via PIL: banner **44 → 54px**, bordas `danger` novas em
  y475/y528, alteração **confinada a y343–557** (resto do frame idêntico). Para a próxima
  área: quando a mudança for só um banner pequeno, o diff de prova pode ficar sub-limiar —
  comparar baselines antes/após diretamente.

### 17.2 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npx tsc -p tsconfig.json --noEmit` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 489 warn** |
| lint full-scope | `npx eslint .` | **0 err / 491 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **370/370 (85 arquivos)** = 119 storybook (+1 story nova) + app |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **119/119 (34 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (prova) + regeneração pós-delete | **119/119** (`1 written` — prova sub-limiar, ver 17.1) |
| build prod (PWA) | `npm run build` | **91 precache / 2668,92 KiB** (24,10s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

**Nota de sessão paralela:** os 6 arquivos de outra sessão seguem intocados neste commit
(ver §15).

**Próximas áreas da D-014:** notifications (3 sites), organizations, CRM (3 sites),
master-admin, `ErrorBoundary`, páginas públicas e os submits `GoalsPanel`/`LoyaltyPanel`.

## 18. D-014 — painéis de notificações (2026-10-05)

Sétima área da receita story-first: os 3 painéis de notificações **não tinham nenhum
arquivo de stories** — 7 stories criadas do zero (3 `Default` + 4 `Erro`) e **4 sites**
convertidos.

### 18.1 O que foi feito

- **7 stories novas** (MSW 500 nas `Erro`, antes da conversão):
  | Story | Endpoint que falha | Play |
  |---|---|---|
  | `Notificações/OwnerNotificationsPanel.Erro` | `GET /api/notifications/preferences` → `Não foi possível carregar as preferências.` | `findByText` (load, prefs vazias → card de retry) |
  | `Notificações/OwnerNotificationsPanel.ErroSalvar` | `PATCH /api/notifications/preferences` → `Não foi possível salvar as preferências.` | switch "Confirmação de agendamento por WhatsApp" → `Salvar preferências` → `findByText` (banner inline) |
  | `Notificações/NotificationHealthPanel.Erro` | `GET /api/admin/operations/notifications` → `Não foi possível consultar a saúde das notificações.` | `findByText` |
  | `Notificações/NotificationDeliveriesPanel.Erro` | `GET /api/notifications/deliveries` → `Não foi possível carregar o histórico de notificações.` | `findByText` |
- **4 sites convertidos:** `OwnerNotificationsPanel` L115 (load vazio →
  `SectionError onRetry={loadPreferences}`) e L137 (erro de save → `SectionError`);
  `NotificationHealthPanel` L84 (`SectionError onRetry={load}`, mensagem de fallback
  preservada: `error || 'A API não retornou o estado da operação.'`);
  `NotificationDeliveriesPanel` L361 (`SectionError onRetry={loadDeliveries}`).
  **Órfãos removidos:** `RefreshCcw` (OwnerNotifications) e `AlertCircle` (Deliveries);
  mantidos onde há outros usos (Health: ícone do card "Falhas na fila" + botão
  "Atualizar"; Deliveries: `RefreshCcw`/`RotateCcw` dos botões).
- **Fora de escopo documentado:** o erro por linha de entrega
  (`NotificationDeliveriesPanel` L433, `friendlyError`) é estado do **domínio** exibido
  junto ao registro (código do provedor, ex.: `RATE_LIMITED`) — mensagem de dados, não
  erro de operação com retry; o feedback da nova tentativa é `sr-only` (aria-live), sem
  div visível.

### 18.2 Prova visual

7 novas baselines gravadas da UI antiga (`7 written` → 126 snapshots); conversão; rodada
de prova **com rebuild** falhou **exatamente as 4 stories `Erro`** (122 restantes, incl.
os 3 `Default`, passaram). PIL dos 4 diffs:

- `HealthPanel.Erro`: card **101 → 81px** (botão retry `min-h-10` → link compacto),
  alteração 2,598%, nada abaixo (o card é o retorno do componente);
- `DeliveriesPanel.Erro`: card **101 → 81px**, alteração 2,594%;
- `OwnerNotificationsPanel.Erro`: card de retry **101 → 81px**, alteração 4,898%;
- `OwnerNotificationsPanel.ErroSalvar`: banner **~32 → 53px** (bordas `danger`
  y253/y306), conteúdo abaixo com shift **+10px** (3,21 → 2,39), alteração 5,105%.

`-u` atualizou as **4**; re-run `test:visual -- --no-build` → **126/126, 0 atualizados**.

### 18.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npx tsc -p tsconfig.json --noEmit` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 488 warn** |
| lint full-scope | `npx eslint .` | **0 err / 490 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **389/389 (90 arquivos)** = 126 storybook (+7 stories novas) + app |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **126/126 (37 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (prova, rebuild) + `-- --no-build` (re-run) | **126/126, 0 atualizados** (4 atualizados na prova) |
| build prod (PWA) | `npm run build` | **91 precache / 2669,91 KiB** (22,46s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

**Nota de sessão paralela:** no meio do lote a outra sessão criou
`src/components/infra/TabGuard.tsx` com imports quebrados — o `tsc` do gate falhou 1×
(`TS2307` ×3) e voltou a **0 erros** quando eles corrigiram; arquivos de teste/stories de
eles inflam `npm test` (85→90 arquivos) e a11y (34→37 arquivos) — nenhum deles commitado
aqui (ver §15).

**Próximas áreas da D-014:** organizations, CRM (3 sites), master-admin, `ErrorBoundary`,
páginas públicas e os submits `GoalsPanel`/`LoyaltyPanel`.

## 19. D-014 — organizações (2026-10-05)

Oitava área da receita story-first: `OrganizationsPanel` e `MultiUnitDashboard` também
**não tinham arquivo de stories** — 6 stories criadas do zero (2 `Default` + 4 `Erro`) e
**4 sites** convertidos.

### 19.1 O que foi feito

- **6 stories novas** (MSW 500 nas `Erro`, antes da conversão):
  | Story | Endpoint que falha | Play |
  |---|---|---|
  | `Organizações/OrganizationsPanel.Erro` | `GET /api/organizations` → `Não foi possível carregar as organizações.` | `findByText` (load falho → card de retry) |
  | `Organizações/OrganizationsPanel.ErroExcluir` | `DELETE /api/organizations/:id` → `Não foi possível excluir a organização.` | expandir card "Grupo Aurora" → `Excluir organização` → `Excluir` no `alertdialog` → banner no topo |
  | `Organizações/MultiUnitDashboard.Erro` | `GET /api/organizations/:id/dashboard` → `Não foi possível carregar os salões desta organização.` (mensagem crua do `ApiError`, exibida pelo hook) | `findByText` |
  | `Organizações/MultiUnitDashboard.ErroDesanexar` | `DELETE /api/organizations/:id/barbershops/:barbershopId` → `Não foi possível desanexar o salão.` | `Desanexar Estúdio Norte` → `Desanexar` no `alertdialog` → banner entre cabeçalho e grade |
- Ambas as stories de componente montam `MemoryRouter` + `StoryProviders withAuth`
  (o dashboard usa `useNavigate`/`useAuth`; sem token semeador o `AuthProvider` não chama
  `/auth/me` e o `useOrganizationDashboard` não abre WS — ele só conecta com token).
- **4 sites convertidos:** `OrganizationsPanel` L108 (banner de erro de criar/excluir →
  `SectionError`) e L196 (load → `SectionError onRetry={loadOrgs}`); `MultiUnitDashboard`
  L236 (load do hook → `SectionError onRetry={refetch}`) e L264 (erro de desanexo →
  `SectionError`). Sem órfãos: `secondary` continua no "Cancelar"/"Adicionar salão" e
  todos os ícones seguem em uso.
- **Fora de escopo documentado:** dois micro-erros `text-xs` **sem caixa** dentro de
  subcomponentes compactos — `ShopCard.accessError` (falha de "Acessar", L80) e o erro do
  painel `AddShopControl` (L154): texto inline do próprio controle, sem divisória de
  ação; um card `SectionError` (`p-4` com borda e ícone) inflaria card/popover minúsculos.
- **Achado de play:** `findByText('...')` casa a string **inteira** — a asserção final
  das duas stories com diálogo falhava por causa do ponto final da mensagem; corrigido
  para matcher regex (`findByText(/Não foi possível .../)`).

### 19.2 Prova visual

6 novas baselines gravadas da UI antiga (`6 written` → 132 snapshots); conversão; rodada
de prova **com rebuild** falhou **3** das 4 stories convertidas — `OrganizationsPanel.
ErroExcluir` passou **sub-limiar (0,16%)** (o banner antigo já media 53px; a nova versão
mantém 53px e só ganha o ícone). Verificação alternativa (mesmo procedimento do §17):
baseline movida para fora, `test:visual -- --no-build` a regravou (`1 written` = UI nova)
e o PIL comparou old/new. PIL dos 4:

- `MultiUnitDashboard.Erro`: card **101 → 81px**, alteração 2,864%, nada abaixo (o card é
  o retorno do componente);
- `MultiUnitDashboard.ErroDesanexar`: banner **93 → 101px** (borda inferior y93 → y101),
  conteúdo abaixo com shift **+8px** (resíduo 0,173 = shift puro), alteração 4,445%;
- `OrganizationsPanel.Erro`: card **117 → 81px** (p-5 + botão `min-h-11` → p-4 + link de
  retry), alteração 4,489%;
- `OrganizationsPanel.ErroExcluir` (sub-limiar, via delete+rewrite): delta confinado em
  **y97-111** (linha do ícone novo), banner 53px → 53px, shift abaixo **0px** (resíduo
  0,178), alteração total **0,160%**.

`-u` atualizou as **3** restantes; re-run `test:visual -- --no-build` → **132/132, 0
atualizados**.

### 19.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npx tsc -p tsconfig.json --noEmit` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 488 warn** |
| lint full-scope | `npx eslint .` | **0 err / 490 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **395/395 (92 arquivos)** = 132 storybook (+6 stories novas) + app |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **132/132 (39 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (prova, rebuild) + `-- --no-build` (re-run) | **132/132, 0 atualizados** (3 atualizados + 1 regravado na prova) |
| build prod (PWA) | `npm run build` | **91 precache / 2669,29 KiB** (18,77s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

**Nota de sessão paralela:** a outra sessão segue commitando por conta própria
(`0eadf7a`/`aaf20b4`/`9de7691` entre §17 e §19); os contadores globais variam entre
execuções (92 arquivos de teste / 39 de stories incluem os deles) — nenhum arquivo alheio
commitado aqui (ver §15).

**Correção de ordenação:** a §18 (notificações) havia sido inserida no meio da §3 na
etapa anterior (linha 51, antes da §4) — movida para o fim do doc junto com esta §19.

**Próximas áreas da D-014:** CRM (3 sites), master-admin, `ErrorBoundary`, páginas
públicas, `OnboardingChecklist` e os submits `GoalsPanel`/`LoyaltyPanel`.

## 20. D-014 — CRM (2026-10-05)

Nona área da receita story-first: `CrmIntelligencePanel` (o "Super CRM") **não tinha
arquivo de stories** — 4 stories criadas do zero (1 `Default` + 3 `Erro`) e **3 sites**
convertidos.

### 20.1 O que foi feito

- **4 stories novas** (MSW 500 nas `Erro`, antes da conversão; `MemoryRouter` porque o
  painel controla as abas via `useSearchParams ?tab=`):
  | Story | Endpoint que falha | Play |
  |---|---|---|
  | `CRM/CrmIntelligencePanel.ErroResumo` | `GET /api/crm/overview` → `Não foi possível carregar o resumo do CRM.` | `findByText` (aba Resumo) |
  | `CRM/CrmIntelligencePanel.ErroClientes` | `GET /api/crm/clients` → `Não foi possível carregar os clientes.` | esperar resumo → botão `Segmentos` → `findByText` |
  | `CRM/CrmIntelligencePanel.ErroPrevisao` | `GET /api/crm/forecast` → `Não foi possível carregar a previsão.` | esperar resumo → botão `Previsões` → `findByText` |
- Fixture `CrmOverview` completo (kpis, byDay, byService/Category/Professional,
  topClients, segments) — os caminhos de render são null-safe (`overview?.`, `values?.length`),
  então as stories de erro não estouram com `overview = null`.
- **3 sites convertidos:** os banners `p rounded-lg bg-danger/10 p-3 text-sm text-danger`
  das três abas — `overviewError` (resumo), `clientsError` (segmentos) e `forecastError`
  (previsões) → `<SectionError message={...} />` **sem `onRetry`** (não havia botão de
  retry antes; o resumo se recarrega pelo `Atualizar` do cabeçalho e as outras abas se
  recarregam por mudança de filtro/aba).
- **Fora de escopo documentado:** os micro-erros `text-danger` **sem caixa** de
  `CrmBackfillPanel` (L61/L70) e `CrmMergePanel` (L77) — texto inline de painéis
  utilitários, mesma classe dos micro-erros do §19; e os erros de `loadCampaigns`/
  `calculateAudience`/`confirmCampaign`, que saem por **toast** (`onNotify`, L323/L346/L360)
  — sem div visível no painel.

### 20.2 Prova visual

4 novas baselines gravadas da UI antiga (`4 written` → 136 snapshots); conversão; rodada
de prova **com rebuild** falhou **exatamente as 3 stories `Erro`** (133 restantes, incl.
o `Default`, passou). PIL dos 3 diffs:

- `ErroResumo`: banner **~40 → 53px**, todo o conteúdo abaixo (KPIs, gráficos) com shift
  consistente **+10px** (resíduo 0,340), alteração 11,239%;
- `ErroClientes`: banner **~40 → 53px** (bordas y215/y268), abaixo com shift **+10px**
  (resíduo 0,328), alteração 3,069%;
- `ErroPrevisao`: banner **~40 → 53px** (bordas y211/y264), abaixo com shift **+10px**
  (resíduo 0,323), alteração 2,594%.

`-u` atualizou as **3**; re-run `test:visual -- --no-build` → **136/136, 0 atualizados**.

### 20.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npx tsc -p tsconfig.json --noEmit` | **0 erros** |
| lint (gate) | `npm run lint` (`eslint src`) | **0 err / 488 warn** |
| lint full-scope | `npx eslint .` | **0 err / 490 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **399/399 (93 arquivos)** = 136 storybook (+4 stories novas) + app |
| contratos | `test:contract` + `contract:check:strict` | **6/6** · **OK 404 chamadas / 555 rotas** |
| storybook + a11y | `npm run test:storybook` | **136/136 (40 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (prova, rebuild) + `-- --no-build` (re-run) | **136/136, 0 atualizados** (3 atualizados na prova) |
| build prod (PWA) | `npm run build` | **91 precache / 2669,15 KiB** (21,47s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** (0 arquivos mortos) |
| docs / entrega | `docs:check` + `verify:delivery` | **OK** |

**Próximas áreas da D-014:** master-admin, `ErrorBoundary`, páginas públicas,
`OnboardingChecklist`, os submits `GoalsPanel`/`LoyaltyPanel`, `TeamManager` e
`RecurringPackagesPanel`.
## 21. D-014 — submits de Goals e Loyalty (2026-10-05)

Décima área da receita story-first: os dois painéis já tinham stories (painéis do §14),
mas **sem cobertura do submit que falha** — 2 stories `ErroSalvar` criadas e **2 sites**
de banner convertidos.

### 21.1 O que foi feito

- **2 stories novas** (MSW 500 no POST do submit, antes da conversão):
  | Story | Endpoint que falha | Play |
  |---|---|---|
  | `Metas/GoalsPanel.ErroSalvar` | `POST /api/barbershops/:id/goals` → `Não foi possível criar a meta.` | abrir modal → selecionar `Ana Souza` (SmartSelect) → target `5000` → datas `05/10`–`31/10` → esperar submit habilitado → clicar → `findByText` |
  | `Fidelidade/LoyaltyPanel.ErroSalvar` | `POST /api/barbershops/:id/loyalty/program` → `Não foi possível salvar a configuração de fidelidade.` | `Configuração` → `Salvar` → `findByText` |
- **2 sites convertidos:** `GoalsPanel` (banner `px-3 py-2 text-xs` dentro do modal,
  L302) → `<SectionError message={submitError} />` (pai `space-y-4` dispensa margem);
  `LoyaltyPanel` (L173) → `<SectionError message={saveError} className="mt-4" />`.
  `AlertCircle` órfão removido dos imports de ambos (`Check`/`X`/`Loader2` seguem em uso).
- **Fix de a11y exposto pela nova story:** botão `X` de fechar do modal de `GoalsPanel`
  era `button` só com ícone → axe `button-name`; ganhou `aria-label="Fechar"` (a story
  `ErroSalvar` falhava no a11y até o fix).
- **Fix de gate de contrato absorvido do merge paralelo:** `adminApi.ts` usava
  `` `/api/admin/billing/statement.csv${suffix}` `` — o extractor de rotas
  (`check-api-contract.mjs`) só aceita sufixo de query com nomes `qs|query|…` e quebrava
  com `Interpolação ambígua`; renomeado `suffix` → `qs` (convenção já usada no resto de
  `src/infra`).
- **Achado de play (importante):** clicar na opção do `SmartSelect` com `userEvent.click`
  é **race** — o popup (`FloatingUI`) pode reposicionar entre `pointerdown`/`pointerup` e o
  click coordenado cai no ancestral, perdendo a seleção **silenciosamente** (submit fica
  `disabled` → guarda `!form.professionalId` retorna sem banner → screenshot sem erro).
  Alternativa determinística: `fireEvent.click(option)` direto no elemento + `waitFor`
  do texto do trigger (`Ana Souza`); o submit só é clicado após
  `waitFor(expect(...).not.toBeDisabled())`. Datas via `fireEvent.change` em
  `input[type=date]` seguem confiáveis (precedente `OwnerFinancialPanel`).

### 21.2 Prova visual

2 baselines gravadas da UI antiga (`2 written` → 138 snapshots); conversão; rodada de
prova **com rebuild** falhou **exatamente as 2 stories novas** (136 restantes passou).
PIL dos 2 diffs:

- `GoalsPanel.ErroSalvar` (4,114%): banner vermelho y604–638 (34px) → `SectionError`
  y594–648 (54px) — o modal é centralizado e cresceu +20px (topo −10, base +10);
  conteúdo abaixo com shift **+10px** (resíduo 2,502 vs 3,091 sem shift); **margens 0**
  (nada fora do modal alterado);
- `LoyaltyPanel.ErroSalvar` (18,315%): banner y452–486 (34px) → y452–506 (54px), topo
  idêntico; conteúdo abaixo com shift puro **+20px** (resíduo 4,893 vs 8,061), flagged
  acima do banner **0,000**.

`-u` atualizou as **2**; re-run `test:visual -- --no-build` → **138/138, 0 atualizados**.

### 21.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npx tsc -p tsconfig.json --noEmit` | **0 erros** |
| lint | `npm run lint` (`eslint src`) | **0 err / 484 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **503/503 (114 arquivos)** |
| contratos (testes) | `npm run test:contract` | **6/6** |
| contrato frontend↔backend | `npm run contract:check` | **VERMELHO — 24 chamadas sem rota backend** (preexistente, ver nota) |
| storybook + a11y | `npm run test:storybook` | **138/138 (40 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (prova, rebuild) + `-- --no-build` (re-run) | **138/138, 0 atualizados** (2 atualizados na prova) |
| build prod (PWA) | `npm run build` | **106 precache / 2804,48 KiB** (20,53s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** |
| docs | `docs:check` | **OK (frontend)** |

**Nota sobre `contract:check` vermelho (fora do escopo deste batch):** as 24 chamadas
(`/auth/sessions`, `/nps/*`, `/admin/billing/*`, `/admin/engagement/summary`,
`/admin/accounts`, `/admin/overview`, `adminSessionsApi`, `adminAccountActionsApi`,
`adminAuditApi` facets/alerts/export …) vêm **inteiramente dos commits da sessão
paralela de 03–05/10 (`f08b563`, `ff50637`, `1656ade`, `aaf20b4`)** — não existiam na
árvore quando os gates do §19/§20 rodaram (pré-rebase) e estão vermelhos em `origin/main`
independentemente deste batch. `scripts/api-contract-debt.json` está vazio com a regra
"não adicionar exceções para fazer a checagem passar", então **não** foram adicionadas
dívidas; decisão registrada com o usuário: **commitar o batch documentando o vermelho
preexistente** e deixar o alinhamento wrapper↔rota para os lotes seguintes da sessão
paralela (frontend/backend authz+billing). O crash do checker
(`statement.csv${suffix}`) já foi corrigido aqui (`qs`).

**Próximas áreas da D-014:** master-admin (6 sites boxados em `src/pages/master-admin/`),
`ErrorBoundary`, páginas públicas, `OnboardingChecklist`, `TeamManager`,
`RecurringPackagesPanel`, `CategoryManager`, `PostDetail`/`PostTagEditor` e
`SupportReport*`.

## 22. D-014 — master-admin (6 sites boxados) (2026-10-06)

Décima primeira área da receita story-first e **primeira cobertura de stories das páginas
de `src/pages/master-admin/`** (até aqui 0 stories nesse diretório): 6 sites de banner
boxados, **12 stories criadas do zero** e 4 correções de a11y expostas pelas novas
stories. Pesquisa e escrita dos stories delegadas a subagentes (`explore`/`general`),
conforme diretriz do usuário ("use subagentes").

### 22.1 O que foi feito

- **12 stories novas** (6 arquivos, MSW por story — handlers de sucesso nos `Default`,
  500 nos `Erro*`; envelope conferido arquivo a arquivo nos wrappers de `src/infra`):
  | Arquivo (title `MasterAdmin/…`) | Stories | Play |
  |---|---|---|
  | `ShopWizardSteps` | `Default`, `ErroSalvar` | fluxo completo do wizard (controles nativos, sem SmartSelect — 4 campos digitados, plano pré-selecionado do `GET /api/plans`) → `POST /api/admin/barbershops` 500 → `Não foi possível criar o salão.` |
  | `UserFormDialog` | `Default`, `ErroSalvar` | Nome/E-mail/Senha → `Criar usuário` com `POST /api/admin/users` 500 → `Não foi possível criar o usuário.` |
  | `AuditPage` | `Default`, `ErroExportar` | página carrega (facets/logs/alerts/sessions) → `Exportar CSV` com `GET /api/admin/audit-logs/export` 500 → banner (mensagem fixa do componente, L366) |
  | `ReferralsTab` | `Default`, `Erro` | mount com `GET /api/admin/referrals` 500 → `Não foi possível carregar indicações.` (branch inteiro + botão de retry) |
  | `TaskDetailPage` | `Default`, `ErroAcao` | fixture do task → `Iniciar` com `PATCH /api/admin/tasks/:id` 500 → `Erro ao atualizar status.` |
  | `TicketDetailPage` | `Default`, `ErroAcao` | fixture do ticket (`assignedTo` preenchido esconde `Assumir chamado`) → `Iniciar atendimento` com `PATCH /api/admin/tickets/:id` 500 → `Erro ao atualizar status.` |
  Harness: `MemoryRouter` + `Routes/:id` nas páginas de detalhe; `TicketDetailPage`
  também com `StoryProviders withAuth` + seed de `authStorage` + `GET /api/auth/me`
  (usa `useAuth`); `ShopCreateWizard` com `MemoryRouter` (`useNavigate`).
- **6 sites convertidos:**
  | Site | Antes | Depois |
  |---|---|---|
  | `ShopWizardSteps.tsx` L226 | `<p role="alert" bg-danger/10 px-3 py-2>` | `<SectionError message={submitError} />` (form `space-y-4`) |
  | `UserFormDialog.tsx` L137 | idem | `<SectionError message={submitError} />` (form `space-y-4`) |
  | `AuditPage.tsx` L214 | `div border-danger/40` + `LuTriangleAlert` | `<SectionError message={exportError} />` **sem retry** (não havia botão antes; `LuTriangleAlert` segue em uso em loading/vazio) |
  | `ReferralsTab.tsx` L48 | div inteira + `AlertCircle` + `Tentar de novo` | `return <SectionError message={error} onRetry={fetchStats} />` (`AlertCircle` órfão removido; label vira `Tentar novamente`) |
  | `TaskDetailPage.tsx` L145 | `<p bg-danger/10 px-3 py-2>` | `<SectionError message={actionError} />` (container `space-y-6`) |
  | `TicketDetailPage.tsx` L197 | idem | `<SectionError message={actionError} />` (container `space-y-6`) |
- **4 correções de a11y expostas pelas novas stories** (gate `a11y.test: 'error'` — o
  axe nunca tinha visto essas páginas por não terem stories):
  1. `AuditAdvancedPanels.tsx` `PanelShell`: `<h3>` logo após o `<h1>` da página → axe
     `heading-order`; virou `<h2>` (nenhum teste asserta nível de heading).
  2. `TaskDetailPage`/`TicketDetailPage`: botão de voltar (só `LuArrowLeft`) →
     `aria-label="Voltar"` (`button-name` ×2).
  3. Mesmos arquivos: botão de enviar comentário (só `LuSend`, inclusive `disabled`) →
     `aria-label="Enviar comentário"` (`button-name` ×2).
  4. **Contraste** (`color-contrast` 2,59 < 4,5): botões crus `bg-accent text-white`
     (`Iniciar`, `Assumir chamado`, enviar) — no tema escuro `--ag-accent: #2cb58a`
     exige `text-accent-fg` (`#0f1110`, o mesmo do `Button` primary); corrigidos nos 2
     detalhes. **Restam 12 ocorrências `bg-accent text-white` fora do escopo**
     (`AiPredictivePage` ×2, `FeaturesPage` ×4, `AccountsPage`, `OverviewPage`,
     `TasksPage`, `TeamPage`, `TicketsPage`, `PublicNpsPage`) — registradas na D-014.
- **Achados de processo:**
  - `test:visual -- --no-build` usa o **build anterior** — mudança em play/story exige
    rebuild (o play antigo de `ReferralsTab` procurava `Tentar de novo` pós-conversão e
    só falhou no re-run sem rebuild);
  - o filtro do `vitest --project storybook` é por **caminho** (`master-admin`), não pelo
    title (`MasterAdmin`);
  - flake 1×: na rodada de baseline o `GoalsPanel.ErroSalvar` (§21) falhou 10,569% sem
    alteração de código; passou em todas as rodadas seguintes (monitorar).

### 22.2 Prova visual

Baseline **com build**: **12 written** → 150 snapshots. Conversão; rodada de prova **com
rebuild** falhou **exatamente as 6 stories `Erro*`** (144 restantes passou):

- `TaskDetailPage.ErroAcao` 17,469% · `TicketDetailPage.ErroAcao` 14,683% ·
  `AuditPage.ErroExportar` 14,303% · `UserFormDialog.ErroSalvar` 5,191% ·
  `ShopWizardSteps.ErroSalvar` 3,241% · `ReferralsTab.Erro` 2,832% — todas acima do
  threshold 0,02.

PIL (composite old|diff|new 1440×900): bandas confinadas ao banner + shift do conteúdo
abaixo; resíduo abaixo da última banda ≈ 0 em todas:

- `AuditPage` (banner no header): shift **+16px** (resíduo 0,357 vs 6,389 sem shift),
  nada muda abaixo de y763;
- `ReferralsTab` (branch inteiro): mudança só em y21–81, abaixo **0,000**;
- `TaskDetail`/`TicketDetail`: shift **+18px** (resíduo 0,224 vs 6,872/5,738), coluna
  x0–895, abaixo **0,000**;
- `ShopWizard`/`UserFormDialog` (modal): bandas confinadas a x496–943, shift **+9px**,
  resíduo abaixo 0,011/0,019.

`-u` atualizou as **6** (junto com o fix do play de `ReferralsTab` → `Tentar
novamente`); rebuild + re-run → **150/150**; `-- --no-build` → **150/150**.

### 22.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint | `npm run lint` (`eslint src`) | **0 err / 484 warn** (teto 11/593) |
| testes app+storybook | `npm test` | **515/515 (120 arquivos)** |
| contratos (testes) | `npm run test:contract` | **6/6** |
| contrato frontend↔backend | `npm run contract:check` | **VERMELHO — 24 chamadas sem rota backend** (preexistente, mesma nota do §21; `verify:delivery` falha **só** nesse check) |
| storybook + a11y | `npm run test:storybook` | **150/150 (46 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (baseline + prova rebuild + `-u` + re-run) + `-- --no-build` | **150/150, 0 atualizados** (12 written na baseline, 6 atualizados na prova) |
| build prod (PWA) | `npm run build` | **106 precache / 2804,57 KiB** (19,00s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** |
| docs | `docs:check` | **OK (frontend)** |

**Nota sobre `contract:check` vermelho (fora do escopo deste batch):** mesma situação do
§21 — as 24 chamadas vêm dos commits da sessão paralela (`adminSessionsApi` list/revoke,
`authApi` sessions/accept-invite, `npsApi`, `adminAuditApi` facets/alerts/export,
`adminAccountActionsApi`, `adminApi` billing/resend-invite, `adminInternalApi`
overview/accounts/operations/health …); `api-contract-debt.json` segue vazio com a regra
"não adicionar exceções"; decisão do usuário: **commitar documentando o vermelho**.

**Próximas áreas da D-014:** `ErrorBoundary`, páginas públicas, `OnboardingChecklist`,
`TeamManager`, `RecurringPackagesPanel`, `CategoryManager`, `PostDetail`/`PostTagEditor`,
`SupportReport*`; nas páginas master-admin restantes, as 12 ocorrências
`bg-accent text-white` (contraste no tema escuro) listadas na §22.1.

## 23. D-014 — ErrorBoundary + páginas públicas (2026-10-06)

Décima segunda área da receita story-first: **10 arquivos de stories / 20 stories criados
do zero** (4 subagentes `general`, conforme diretriz "use subagentes"), **11 sites
convertidos** para `SectionError` (1 deles sem story — código morto removido), 3 fixes de
contraste e 2 achados de processo que afetam a estabilidade do gate visual/a11y.

### 23.1 O que foi feito

- **10 arquivos de stories (20 stories)** — MSW 500 por story `Erro*` (sucesso nos
  `Default`):
  | Arquivo (title) | Stories | Harness / observação |
  |---|---|---|
  | `infra/ErrorBoundary.stories.tsx` (`Infra/ErrorBoundary`) | `Default`, `SecaoErro` | variação `section` do próprio ErrorBoundary |
  | `ResetPasswordPage` (`Públicas/…`) | `Default`, `Erro` | token inválido via MSW |
  | `PublicOwnerInvitePage` (`Públicas/…`) | `Default`, `Erro` | idem |
  | `PublicNpsPage` (`Públicas/…`) | `Default`, `ErroEnvio` | submit → 500 |
  | `PublicReviewPage` (`Públicas/…`) | `Default`, `ErroEnvio` | hash token via meta `loaders` (`history.replaceState(…'#token=token-avalide')`) |
  | `PublicProductPage` (`Públicas/…`) | `Default`, `ErroReserva` | reserva → 500 |
  | `PublicAppointmentManagePage` (`Públicas/…`) | `Default`, `Erro` | `Erro` sem hash (branch de token ausente); `Default` com loader `#token=manage-token-demo` + session/slots |
  | `PlansPage` (`Públicas/…`) | `Default`, `Erro` | carregamento de planos → 500 |
  | `marketing/ContactPage` (`Marketing/…`) | `Default`, `Erro` | `POST /api/contact` 500 |
  | `CheckoutPage` (`Assinatura/…`) | `Default`, `Erro` | auth seeding obrigatório; `Erro` por validação client-side (`CPF inválido. Confira o número.`), sem chamada |
- **11 conversões → `SectionError`:**
  | Site | Antes | Depois |
  |---|---|---|
  | `ErrorBoundary.tsx` (variante section) | box próprio | `<SectionError message="Não foi possível carregar esta seção" onRetry={reset}>` (testes da seção verdes) |
  | `ForgotPasswordPage.tsx` | banner + state `error` nunca renderizado | **código morto removido** (banner, `setError(null)`, import `AlertCircle`) — sem story por não existir estado visível |
  | `ResetPasswordPage.tsx:147` | `<p role="alert" bg-danger/10 …>` | `<SectionError message={error} className="w-full mb-4" />` (AlertCircle segue — L70) |
  | `PublicOwnerInvitePage.tsx:58` | idem | `<SectionError message={error} className="w-full mb-4" />` (AlertCircle órfão removido) |
  | `PublicNpsPage.tsx:206` | idem | `<SectionError message={error} />` |
  | `PublicReviewPage.tsx:164` | idem | `<SectionError message={error} />` (AlertCircle segue — L74) |
  | `PublicProductPage.tsx:225` | idem | `<SectionError message={submitError} />` |
  | `PublicAppointmentManagePage.tsx` | idem | `<SectionError message={error} className="mb-4" />` |
  | `PlansPage.tsx:276` | paleta vermelha crua | `<SectionError message={error} className="mx-auto mt-8 max-w-md" />` |
  | `ContactPage.tsx:267` | idem | `<SectionError message={serverError} className="mb-8" />` (AlertCircle segue — 4 usos) |
  | `CheckoutPage.tsx:511` | idem | `<SectionError message={error} className="mb-6" />` (import órfão removido) |
- **3 fixes de contraste** (axe `color-contrast` das novas stories):
  - `PlansPage.tsx`: `text-neutral-500`→`text-text-muted` ×9, `text-accent-light`→`text-accent` ×4;
  - `ContactPage.tsx`: `text-neutral-500`→muted ×13, `text-neutral-600`→muted ×2,
    `text-accent-light`→`text-accent` ×10, hint L298 `opacity-70`→`text-text-muted` (4,21 < 4,5);
  - `MarketingFooter.tsx`: `text-neutral-500/600`→`text-text-muted` ×4 (h3, breadcrumb, `.max-w-sm`, linha inferior).
- **Achados de processo:**
  1. **Race axe × framer-motion:** o axe do `addon-a11y` roda no `afterEach` **sem**
     `waitForAnimations()` (só o painel manual espera) e amostra contrastes com o
     `initial opacity 0→1` ainda correndo (blends falsos, ex. 1,06). Corrigido com o
     helper `settleMotion()` (1500 ms) no fim dos plays de `PlansPage`/`ContactPage` —
     únicas páginas com motion entre as 10 (as demais 8 verificadas sem `motion.*`;
     `MotionGlobalConfig` do framer 12.38.0 não expõe `skipAnimations`; o
     `waitForAnimations` de `storybook/preview-api` só cobre WAAPI/CSS).
  2. **Classes fantasma `text-accent-light`/`bg-accent-light`:** não existem no `@theme`
     (Tailwind v4, tokens em `tokens.css`) → sem-op/inherit; substituídas por
     `text-accent` onde flagradas (`hover:bg-accent-light` permanece, fora de escopo).
  3. **Flake do play do Checkout:** `role="button" name /Pagar/` falhou 1× no run completo
     e passa isolado (instrumentação temporária de `console.log` adicionada, verificada,
     removida); não recorreu nos runs seguintes.
  4. **Race de scroll na captura visual:** o screenshot do `postVisit` é **viewport-only**
     (1440×900) e plays que digitam/clicam disparam o auto-scroll do Playwright
     (`focus`/`scrollIntoViewIfNeeded`, sensível ao timing de carregamento das fontes) —
     `marketing-contactpage--erro` saiu com 48,8% de diff num run (scrollTop ≠ 0) e 4,4%
     noutro. Fix determinístico no `.storybook/test-runner.ts`: `blur` +
     `window.scrollTo(0,0)` imediatamente antes do screenshot; o `-u` seguinte reancorou
     `marketing-contactpage--erro` **e** `assinatura-checkoutpage--erro` (baselines com
     scrollTop ≠ 0 — mesma classe de flake conhecida do `GoalsPanel.ErroSalvar`).
  5. **Prova com 6 conversões sub-threshold:** Nps/Review/Product/Manage/Plans/Checkout
     mudaram **abaixo do threshold 0,02** na prova (banner in-place, mesmo footprint da
     página) — mudanças atestadas pela prova PIL + 170/170 dos testes de story + revisão
     do diff de código; só as 4 restantes falharam acima do threshold (23.2).

### 23.2 Prova visual

Baseline **com build**: **20 written** → 170 snapshots (1 flake na baseline:
`GoalsPanel.ErroSalvar` 10,569%, §21 — não recorreu). Conversão; rodada de prova **com
rebuild** falhou **exatamente as 4** stories `Erro*` de conversão visível:

- `PublicResetPasswordPage.Erro` 6,700% · `PublicOwnerInvitePage.Erro` 6,655% ·
  `ErrorBoundary.SecaoErro` 5,942% · `ContactPage.Erro` 4,405% — todas acima de 0,02
  (as outras 6 conversões < 2%, ver 23.1/5).

PIL (composite old|diff|new 1440×900), diffs lidos visualmente:

- `ErrorBoundary`: troca confinada a y0–131, resíduo abaixo **0,000** (box antigo →
  SectionError compacto, resto idêntico);
- `ContactPage`: bandas x516–1384 y69–786 (banner + micro-reflow ~1px), d=0 fora;
- `ResetPassword`/`PublicOwnerInvite`: shift **+16px** (banner `p-3 text-xs` →
  SectionError `p-4 text-sm`, mensagens de 2 linhas), resíduo 0,096/0,006 — conteúdo
  preservado, card/rodapé idênticos.

`-u` atualizou as **4**; o re-run expôs o race de scroll (23.1/4) → fix do `postVisit` +
`-u` reancorou `marketing-contactpage--erro` e `assinatura-checkoutpage--erro` →
re-run `--no-build` → **170/170, 0 atualizados, EXIT=0** (estável).

### 23.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint | `npm run lint` (`eslint src`) | **0 err / 484 warn** (teto 11/593) |
| testes app | `npx vitest run --project app` | **365/365 (74 arquivos)** |
| contratos (testes) | `npm run test:contract` | **6/6** |
| contrato frontend↔backend | `npm run contract:check` | **VERMELHO — 24 chamadas sem rota backend** (preexistente, mesma nota do §21/§22; `verify:delivery` falha **só** nesse check) |
| storybook + a11y | `npm run test:storybook` | **170/170 (56 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (baseline + prova rebuild + `-u` ×2 + re-run `-- --no-build`) | **170/170, 0 atualizados, EXIT=0** |
| build prod (PWA) | `npm run build` | **105 precache / 2801,64 KiB** (25,87s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** |
| docs | `docs:check` | **OK (frontend)** |
| gate delivery | `npm run verify:delivery` | **falha em `contract:check`** (docs/typecheck/test:contract verdes antes) |

**Nota sobre `contract:check` vermelho (fora do escopo deste batch):** mesma situação do
§21/§22 — as 24 chamadas vêm dos commits da sessão paralela (`adminSessionsApi`,
`authApi`, `npsApi`, `adminAuditApi`, `adminAccountActionsApi`, `adminApi` billing,
`adminInternalApi` …); `api-contract-debt.json` segue vazio com a regra "não adicionar
exceções"; decisão do usuário: **commitar documentando o vermelho**. Sessão paralela
também ativa no worktree — `git add` seletivo (somente os 10 arquivos de stories novos e
os componentes editados por este batch).

**Próximas áreas da D-014:** `OnboardingChecklist` L257, `TeamManager` L161/L174
(+ L323 `bg-danger text-white`→`text-danger-fg`), `RecurringPackagesPanel` L384,
`OwnerReferralsPanel` L76, `EquipmentPanel` L707/772/807; `CategoryManager` L68/L80,
`PostDetail` L502, `PostTagEditor` L80, `SupportReportDetail` L237,
`SupportReportForm` L193; e os 13× `bg-accent text-white` + 6× `bg-danger text-white`
listados na §22.1/restantes (batch 14, sem stories que os cubram).

## 24. D-014 — painéis de features (onboarding/equipe/indicações/recorrência/equipamentos) (2026-10-06)

Décima terceira área da receita story-first: **5 painéis de `src/features/`**, **12 stories
novas** (7 em arquivos novos + 5 estendendo 2 arquivos existentes), **9 edições de conversão**
(8 sites → `SectionError` + 1 fix de contraste) e 4 fixes de a11y. Pesquisa e escrita dos
stories delegadas a 2 subagentes `general` (receita do usuário).

### 24.1 O que foi feito

- **12 stories novas** (MSW 500 por story `Erro*`):
  | Arquivo (title) | Stories novas | Play / MSW |
  |---|---|---|
  | `onboarding/OnboardingChecklist` (arquivo novo) | `Default`, `Erro`, `ErroConfirmacao` | `Erro`: `GET /api/barbershops/:id/onboarding` 500 → mount falha → banner L257 (`/Não foi possível carregar sua configuração inicial/`); `ErroConfirmacao`: `POST …/onboarding/steps` 500 → clica "Já configurei" → `/Conclua a configuração indicada/` (espera 1500 ms — framer-motion) |
  | `team/TeamManager` (arquivo novo) | `Default`, `ErroForm`, `ErroLista` | harness `render` + `StoryProviders withBarbershop` + seed `authStorage` (wiring real do `StaffDashboard`); `ErroForm`: form "Novo Membro" → `POST /api/users` 500 → `/Não foi possível cadastrar/` (banner L174); `ErroLista`: "Excluir membro" → `DELETE /api/users/:id` 500 → modal fecha → banner L160 `/Não foi possível remover/` |
  | `referrals/OwnerReferralsPanel` (arquivo novo) | `Default`, `Erro` | `GET /api/referrals/me` 500 → early-return + botão retry |
  | `equipment/EquipmentPanel` (existente) | `ErroEquip`, `ErroMov`, `ErroNeed` | modal aberto + POST 500 (`/equipment`, `/equipment-movements`, `/equipment-needs`) → banner L707/L772/L807 visível; `Erro` de load já existia (§14) |
  | `recurring/RecurringPackagesPanel` (existente) | `ErroPlano` | modal "Criar modelo" + `POST …/recurring-package-plans` 500 → banner L384 |
  Handlers do meta espalhados nos stories novos (`...mswHandlers()` — achado §16).
- **9 edições de conversão:**
  | Site | Antes | Depois |
  |---|---|---|
  | `OnboardingChecklist.tsx:257` | `<div role="alert" bg-danger/10 p-3 text-danger>` | `{error && <SectionError message={error} />}` (guard mantém narrowing `string \| null`) |
  | `TeamManager.tsx:161` | banner `text-xs` com `RiAlertLine` (lista, `!isAdding`) | `<SectionError message={formError} className="mb-3" />` |
  | `TeamManager.tsx:174` | idem (dentro do form "Novo Membro") | idem |
  | `TeamManager.tsx:323` | botão confirmar exclusão `bg-danger text-white` (2,59:1) | `text-danger-fg` (fix de contraste do §22/§15 — fora das telas das stories: o modal fecha no erro; atestado por código/tsc) |
  | `RecurringPackagesPanel.tsx:384` | `<div bg-danger/10 text-danger>` inline no modal | `<SectionError message={planSubmitError} />` |
  | `OwnerReferralsPanel.tsx:74-90` | early-return com `AlertCircle` + botão "Tentar de novo" | `return <SectionError message={error} onRetry={() => void load()} />` (`AlertCircle` segue em uso em L253; **play atualizado** para `Tentar novamente` — achado §22) |
  | `EquipmentPanel.tsx:707/772/807` | 3× `<div bg-danger/10 p-2 text-danger>` | 3× `<SectionError message={…} />` (import já existia) |
  `RiAlertLine` ficou órfão no TeamManager → removido do import.
- **4 fixes de a11y** expostos pelas novas stories (axe `test: 'error'`), todos sem impacto
  visual: `TeamManager` L258 `role="button"`→`role="group"` (axe `nested-interactive`
  serious — linha do dono continha botão de avatar focável) + `aria-label` em L322
  "Confirmar exclusão", L329 "Cancelar exclusão", L339 "Excluir membro" (`button-name` ×3).
- **Achados de processo:**
  1. **Não rodar `vitest --project app` e `test:storybook` em paralelo** — 2 timeouts
     falsos de 15 s (ContactPage com `settleMotion` e GoalsPanel "Missing
     Context/Providers") sob contenção de CPU; re-run isolado → 182/182.
  2. Só 1 das 2 stories de erro do `OnboardingChecklist` falhou na prova: o `Erro`
     (mount) ficou **sub-threshold** (<2%) — mesmo JSX convertido, footprint menor na
     página esvaziada; asserções do play (mensagem) + PIL do irmão cobrem a mudança.
  3. Sem testes unitários assertando o markup antigo (grep `*.test.*` negativo para os 5
     componentes).

### 24.2 Prova visual

Baseline **com build**: **12 written** → 182 snapshots (**0 flakes**). Conversão; prova
**com rebuild** falhou **exatamente as 8** stories correspondentes aos 8 sites convertidos:

- `TeamManager.ErroForm` 27,315% · `EquipmentPanel.ErroEquip` 10,445% ·
  `TeamManager.ErroLista` 9,114% · `EquipmentPanel.ErroNeed` 4,286% ·
  `RecurringPackagesPanel.ErroPlano` 3,876% · `EquipmentPanel.ErroMov` 2,883% ·
  `OwnerReferralsPanel.Erro` 2,832% · `OnboardingChecklist.ErroConfirmacao` 2,558%
  — todas acima do threshold 0,02.

PIL (composite old|diff|new 1440×900): bandas confinadas ao banner/modal + reflow do
conteúdo seguinte; **resíduo abaixo da última banda 0,000 em 7 diffs** (0,022 no maior) e
melhor shift vertical +8..+20 px (err 0,14–1,96 vs 0,83–9,42 sem shift) — ex.: `ErroForm`
+20 px (resíduo 0,000), `ErroEquip` +18 px, `Recurring`/`Equipment` modais +9 px.

`-u` atualizou as **8**; re-run `-- --no-build` → **182/182, 0 atualizados, EXIT=0**.

### 24.3 Evidências do gate

| Check | Comando | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | **0 erros** |
| lint | `npm run lint` (`eslint src`) | **0 err / 484 warn** (teto 11/593; 2 `unused eslint-disable` preexistentes em arquivos não tocados) |
| testes app | `npx vitest run --project app` | **365/365 (74 arquivos)** |
| contratos (testes) | `npm run test:contract` | **6/6** |
| contrato frontend↔backend | `npm run contract:check` | **VERMELHO — 24 chamadas sem rota backend** (preexistente, mesma nota do §21/§22/§23; nenhuma chamada nova neste batch) |
| storybook + a11y | `npm run test:storybook` | **182/182 (59 arquivos)**, `a11y.test: 'error'` |
| regressão visual | `test:visual` (baseline + prova rebuild + `-u` + re-run `-- --no-build`) | **182/182, 0 atualizados, EXIT=0** |
| build prod (PWA) | `npm run build` | **105 precache / 2800,37 KiB** (47,86s) |
| órfãos | `scripts/check-orphan-exports.mjs` | **exit 0** |
| docs | `docs:check` | **OK (frontend)** |
| gate delivery | `npm run verify:delivery` | **falha em `contract:check`** (docs/typecheck/test:contract verdes antes) |

**Nota sobre `contract:check` vermelho (fora do escopo deste batch):** idêntica ao §21–§23
— 24 chamadas da sessão paralela; `api-contract-debt.json` segue vazio; decisão do
usuário: commitar documentando o vermelho. `git add` seletivo (nenhum arquivo da sessão
paralela no worktree neste batch).

**Próximas áreas da D-014:** `CategoryManager` L68/L80, `PostDetail` L502, `PostTagEditor`
L80, `SupportReportDetail` L237, `SupportReportForm` L193 (batch 13); e os 13×
`bg-accent text-white` + 6× `bg-danger text-white` sem stories que os cubram (batch 14).
