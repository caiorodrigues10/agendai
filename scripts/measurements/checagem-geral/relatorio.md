# Checagem geral — Agenda Já

**Data:** 2026-10-09 · **Escopo:** backend `fix/seguranca` + frontend `fix/lcp-precache` · **Ambiente:** apenas local (nada de push, produção, e-mail ou WhatsApp real).

Este relatório cobre 100% das verificações feitas nesta sessão: o que passou, o que falhou, o que é bug do app, o que é teste quebrado, o que é ambiente e o que **não pôde ser testado** (com o motivo). Nenhum segredo é citado aqui — valores de `.env` não são reproduzidos.

---

## 1. Ambiente de execução

| Item | Estado |
|---|---|
| Stack de dev | `agendai_db_dev` (Postgres :5442, db `agendai`, 153 tabelas) e `agendai_redis_dev` (:6380) — subidos com autorização (`docker stop agendai_db` → `docker start agendai_db_dev agendai_redis_dev`) |
| Backend | `npm run dev` em `127.0.0.1:3333` (processo meu, reiniciado 1× — ver §7) |
| Frontend | `vite` em `127.0.0.1:3003` com proxy `/api` → `:3333` |
| Node | v24.17.0 · npm 11.13.0 · Playwright 1.62.1 · Prisma 6.4.0 · Vitest 4.1.11 (backend) / 4.1.10 (front) |
| Contas usadas | Conta master do seed (via `SEED_MASTER_ADMIN_*`) · OWNER fixture `perf.owner@agendai.local` (senha do fixture perf) · salão A `1ac5be50-6ce7-464e-bc38-ab18cf24aeab` (TRIALING) · salão B `f5ef3966-f8ad-49be-894b-84749d2a619d` (ACTIVE) |
| Nenhum usuário EMPLOYEE existe no banco | confirmado (só MASTER_ADMIN/OWNER) |

---

## 2. Tabela por área (nada omitido)

Legenda: ✅ ok · ❌ falhou/bug · ⚠️ parcial/problema · ⏸ não testado

| # | Área / verificação | Resultado | Evidência |
|---|---|---|---|
| 1 | Stack local sobe e responde | ✅ | `curl /health` 200, `/ready` 200, backend+frontend no ar |
| 2 | Backend: `typecheck` | ✅ exit 0 | `evidencias/backend-gates.txt` |
| 3 | Backend: `docs:check` | ✅ exit 0 | idem |
| 4 | Backend: `prisma validate` | ✅ exit 0 | `evidencias/backend-gates3.txt` |
| 5 | Backend: `build` (tsup) | ✅ exit 0 | idem |
| 6 | Backend: `test:unit` (2 execuções consecutivas) | ✅ 166 arquivos / 1500 testes, idêntico nas 2 rodadas (sem flaky) | `evidencias/backend-unit-2x.txt` |
| 7 | Backend: `test:security` | ✅ 2 arquivos / 7 testes | `evidencias/backend-gates.txt` |
| 8 | Frontend: `typecheck` | ✅ exit 0 | `evidencias/frontend-gates.txt` |
| 9 | Frontend: `docs:check` | ✅ exit 0 | `evidencias/frontend-gates2.txt` |
| 10 | Frontend: `test` (vitest) | ✅ 134 arquivos / 596 testes | `evidencias/frontend-test.txt` |
| 11 | Frontend: `test:contract` | ✅ 8/8 | `evidencias/frontend-gates2.txt` |
| 12 | Frontend: `lint` (gate do CI: `--max-warnings 215`) | ❌ **480 warnings / 0 errors → exit 1** | `evidencias/frontend-gates.txt` |
| 13 | Frontend: `build` | ✅ (rodou dentro do E2E/preview) | §5 |
| 14 | E2E público (desktop 1440 + mobile 375) | ✅ **56 passed, 17 skipped, 0 failed** | `evidencias/e2e-publico-resumo.md` |
| 15 | E2E `e2e/master/` (login real master/owner) | ⚠️ **17 passed / 1 failed** (1 falha = ambiente, ver B7) | `evidencias/e2e-master-resumo.md` |
| 16 | E2E WebKit/iPhone (`login-safari.spec`) | ⏸ **pulado** — exige `VITE_RECAPTCHA_SITE_KEY` no build (chave de teste do Google não disponível) | `playwright.config.ts`, `e2e/login-safari.spec.ts:18` |
| 17 | E2E `panel-queue.spec` | ⏸ **pulado** — exige `PANEL_E2E=1` + credenciais | `e2e/panel-queue.spec.ts:17` |
| 18 | E2E `post-editor.spec` | ⏸ **pulado** — exige `POST_EDITOR_QA=1` | `e2e/post-editor.spec.ts:11` |
| 19 | Matriz de autorização/IDOR da API (102 probes) | ⚠️ 88 ok / 14 desvios (detalhados em §4) | `evidencias/matrix-102-probes-resumo.md` |
| 20 | IDOR de tenant em `PUT/PATCH /api/barbershops/:id` e `/:id/schedule` | ❌→✅ **bug crítico, corrigido nesta sessão** | B1 |
| 21 | Login: brute force / lockout | ✅ 401 → **423 na 10ª tentativa** ("Conta bloqueada… 5 segundos"), volta a 401 após o reset | `evidencias/p2-authz.txt`, `p2-authz2.txt` |
| 22 | Login: enumeração de usuário | ✅ usuário inexistente e senha errada → mesmo status e mesma mensagem | `evidencias/p2-authz2.txt` |
| 23 | Refresh token: rotação | ✅ cookie rotaciona a cada `/auth/refresh` | `evidencias/p2-refresh.txt` |
| 24 | Refresh token: reuse (janela de graça 15s) | ✅ reuse <15s aceito, **>15s → 401** | `evidencias/p2-grace.txt` |
| 25 | Refresh token: rate limit | ✅ 429 na ~119ª chamada (~120/min por sessão) | `evidencias/p2-refresh.txt` |
| 26 | Cookies de sessão | ✅ `refresh_token` + `saved_refresh_{userId}` com `HttpOnly`, `SameSite=Lax`, `Path=/api/auth` | §5 |
| 27 | Rotas admin (master-only) | ✅ OWNER → 403 em `/api/admin/*`; master → 200 | matriz |
| 28 | Webhook Mercado Pago (genérico) | ⏸ **não testado de verdade** — `MERCADOPAGO_WEBHOOK_SECRET` ausente no `.env` local; em dev o controller valida e avisa, em produção recusa (regra já coberta por teste) | `ProcessWebhookController.ts:29-45` |
| 29 | Webhook Asaas / AbacatePay | ✅ recusam sem token/assinatura (401) | matriz |
| 30 | Webhook real (payload assinado por provedor) | ⏸ **não testado** — exige credencial/chave real do provedor | — |
| 31 | E-mail transacional | ⏸ **não entregue** — Resend em modo teste recusa destino fora do e-mail do dono da conta (`email:resend`, `errorKind:CONFIG`); fila, worker e erro `UnrecoverableError` funcionam | `evidencias/server-log-extract.txt` |
| 32 | WhatsApp (Evolution) | ⏸ **não testado** — mensagens=0, nenhuma sessão conectada nesta execução | painel master (screenshot) |
| 33 | Upload de imagem (GCS/Cloudinary) | ⏸ **não testado** — log: "GCS sem credenciais configuradas — Cloudinary é o provedor efetivo"; sem chave usável localmente | `evidencias/server-log-extract.txt` |
| 34 | Crons agendados no boot | ✅ 9 registrados (lista em §6) | `evidencias/server-log-extract.txt` |
| 35 | Crons executando de fato | ✅ `CronRun` com status `COMPLETED` (`deposit-expiration`, `post-publisher`, `waitlist-expiration` a cada 1 min) | §6 |
| 36 | Health detalhado | ⚠️ `/health` 200 porém `status:"degraded"` e `migrations:{status:"error"}` | B5 |
| 37 | Swagger `/docs` | ✅ 200 em dev (589 operações / 457 paths) | `/tmp/swagger.json` (fora do repo) |
| 38 | Migrações (`prisma migrate status`) | ⚠️ **drift**: tabela `_prisma_migrations` inexistente → todas as 91 migrations aparecem "não aplicadas" (banco criado por `db push`) | B5 |
| 39 | Responsividade (375 e 1440, 5 rotas) | ✅ 0 estouros horizontais, 0 alvos <44px, 0 textos <12px, todos com exatamente 1 `<h1>`, `<img>` com width/height | `summary.md` |
| 40 | Core Web Vitals (4G + CPU 4x) | ✅ CLS máx **0,0743** (limite 0,1) · LCP med 1,86–2,33s · FCP med ~1,29s | `summary.md` |
| 41 | LCP/precache PWA | ✅ **2.331.370 B ≤ 3.185.427 B** | `node scripts/precache-report.mjs --limit=3185427` |
| 42 | Screenshots desktop 1440×900 + mobile 375×812 | ✅ 13 imagens válidas | `screenshots/` |
| 43 | Limpeza de dados `[QA]` | ✅ 2 chamados + 2 tarefas meus removidos; salão B restaurado | §8 |

---

## 3. Bugs — gravidade, evidência e status

### B1 — 🔴 CRÍTICO — IDOR de tenant: qualquer OWNER editava a barbearia/agenda de outro salão *(CORRIGIDO)*

- **Como reproduzir (antes da correção):**
  1. Login como OWNER do salão A (`perf.owner@agendai.local`).
  2. `PUT /api/barbershops/{id-do-salão-B}` com body `{"name":"[QA] hack"}`.
  3. **Esperado:** `403` · **Obtido:** `200` e o nome do salão B passava a ser `[QA] hack`.
  4. Idem para `PATCH /api/barbershops/:id` e `PUT /api/barbershops/:id/schedule`.
- **Causa:** `UpdateBarbershopUseCase.execute(id, data)` e `UpdateScheduleUseCase.execute(...)` **não recebiam o usuário autenticado** — não havia checagem de tenant; a tabela `barbershops` também não tem RLS.
- **Arquivos:** `backend/src/modules/barbershops/useCases/updateBarbershop/UpdateBarbershopUseCase.ts:13`, `.../updateSchedule/UpdateScheduleUseCase.ts:9`, controllers correspondentes.
- **Correção:** novo guard `assertShopAccess` (MASTER_ADMIN livre; OWNER só do próprio shop) aplicado **antes** de qualquer escrita; controllers passam `request.user`.
- **Teste TDD:** `backend/src/modules/barbershops/useCases/barbershops.spec.ts` — 4 casos novos (OWNER de outro tenant → 403 sem alterar dado; OWNER próprio → ok; MASTER_ADMIN → ok; agenda de outro tenant → 403). **Falhavam antes** (2/10 failed), **passam depois** (10/10).
- **Verificação ao vivo:** 6 rotas de escrita do salão B agora retornam `403 "Acesso negado: você não pertence a este salão"`; controle positivo (salão A) continua `200`.
- **Commit:** `backend 6bc56a9`.

### B2 — 🟠 ALTO — Gate de lint do CI do frontend está quebrado *(RELATADO)*

- **Como reproduzir:** `npm run lint -- --max-warnings 215` em `frontend/`.
- **Esperado:** exit 0 (limite do CI) · **Obtido:** exit 1 — `✖ 480 problems (0 errors, 480 warnings)`.
- **Impacto:** o job `lint` do workflow de CI falha; não é regressão minha (não toquei em `src/`).
- **Arquivo:** `frontend/src/**` (distribuição em `evidencias/frontend-gates.txt`). Regras mais frequentes: `no-unused-vars` em helper de mapa, `no-explicit-any`, `no-console`, `complexity` (`src/utils/errorMessage.ts:104`, complexidade 56 vs máximo 20).
- **Status:** **relatado, não corrigido** — corrigir 480 warnings não é "bug pequeno e seguro"; depende de decisão (rebaixar o limite, `--fix` parcial ou limpeza gradual).

### B3 — 🟠 MÉDIO — `GET /api/barbershops` público devolve WhatsApp e CNPJ de todos os salões *(RELATADO — precisa de decisão)*

- **Como reproduzir:** `curl http://127.0.0.1:3333/api/barbershops` **sem token** → `200` com a lista completa (17 salões), incluindo `whatsapp`, `cnpj`, `address`, `latitude/longitude`.
- **Esperado (segurança):** exige autenticação (o front só usa em `barbershopApi.listBarbershops()` dentro do painel — `frontend/src/infra/barbershopApi.ts:167`).
- **Mesmo padrão:** `GET /api/barbershops/:id/schedule`, `/:id/staff` (devolve `{id, name}` dos funcionários) e `GET /api/services?barbershopId=...` também respondem sem token.
- **Arquivo:** `backend/src/shared/infra/http/routes/barbershops.routes.ts` (sem `preHandler` nessas rotas), `services.routes.ts`.
- **Status:** **relatado, não corrigido de propósito** — pode haver consumo público (loja/agendamento) fora deste repositório; adicionar `authenticate` pode quebrar. **Precisa da sua decisão.**

### B4 — 🟡 MÉDIO — Origem de CORS recusada responde `500` em vez de `403` *(RELATADO)*

- **Como reproduzir:** `POST /api/auth/login` com header `Origin: https://evil.example` → **500 "Erro interno do servidor"**.
- **Esperado:** recusa (403) sem virar erro interno.
- **Causa:** `backend/src/shared/infra/http/app.ts` (~linha 139) usa `cb(new Error("Origin not allowed"), false)` — a segurança está intacta (a origem é negada), só o código/status é errado.
- **Status:** **relatado, não alterado** — mexer em CORS exige sua confirmação.

### B5 — 🟡 MÉDIO — `/health` nasce `degraded` + drift de migrações no banco de dev *(RELATADO)*

- **Como reproduzir:** `curl http://127.0.0.1:3333/health` → `200` com `status:"degraded"`, `migrations:{status:"error",pending:-1}`; `npx prisma migrate status` → "91 migrations found / none applied".
- **Causa:** não existe a tabela `_prisma_migrations` no banco de dev (criado via `db push`). Já é risco conhecido e documentado no `backend/AGENTS.md`.
- **Status:** **relatado** — não apliquei `migrate` (proibido `reset`/`db push --force-reset`) e não toquei no estado do banco.

### B6 — 🟡 BAIXO — Teste E2E com locator ambíguo (strict mode) *(CORRIGIDO)*

- **Como reproduzir:** `npx playwright test e2e/master/contas-acoes.spec.ts`.
- **Esperado:** assert no banner "Visão temporária somente-leitura" · **Obtido:** `strict mode violation: getByRole('status') resolved to 2 elements` (banner + overlay `aria-label="Carregando"`, ambos com `role="status"`).
- **Causa:** o app usa `role="status"` também no carregamento full-screen — o **app está correto**, o locator é ambíguo.
- **Arquivo:** `frontend/e2e/master/contas-acoes.spec.ts:69,75,99,107`.
- **Correção:** filtro por texto no banner + asserção explícita de que o overlay de loading também some (cobertura mantida/melhorada). **Falhava antes → 2 testes passam depois.**
- **Commit:** `frontend a75b703`.

### B7 — ⚪ AMBIENTE — `e2e/master/acesso-negado.spec.ts` falha (17/18) *(NÃO CORRIGIDO — depende de você)*

- **Como reproduzir:** rodar a suíte master com `E2E_OWNER_*` apontando para o OWNER fixture.
- **Esperado:** `waitForURL(/\/app\//)` após login · **Obtido:** timeout de 30s, usuário fica em `/login`.
- **Causa raiz (confirmada):** a assinatura do salão A está `TRIALING` com `endDate`/`trialEndsAt` = **2026-10-08** (expirou ontem). O front abre o paywall ("Período de teste encerrado — Escolha um plano…") e não navega; `frontend/src/utils/subscriptionPaywall.ts:30-43` retorna `true` quando o trial expirou.
- **Classificação:** **ambiente/dado de teste**, não bug do app. A regra de bloqueio de `/master` para não-master está correta (`LoginPage.tsx:569`).
- **Status:** **não testado até o fim** — corrigir exigiria alterar a assinatura do salão (dado), o que **não fiz sem autorização**.

### B8 — ⚪ AMBIENTE — Rate limit derruba a suíte E2E master *(DOCUMENTADO)*

- A suíte master faz ~40 chamadas de auth por minuto; o `LOGIN_RATE_LIMIT_MAX` local fez `POST /api/admin/accounts/:id/impersonate` devolver **429** numa das rodadas.
- **Tratamento usado:** `POST /api/dev/reset-rate-limit` (rota dev) antes de cada execução completa; depois disso os 17 testes passam.
- **Observação:** já está documentado no `frontend/AGENTS.md` (§ E2E do painel master).

### B9 — ⚪ TESTE QUEBRADO (meu) — "404s do swagger" *(DESCARTADO)*

- Meus probes apontavam `GET /products/:id`, `POST .../upload-url` etc. como 404. Conferindo o swagger e as rotas: **esses paths não existem mesmo no OpenAPI** e os endpoints existem com **outros métodos** (`GET /products/:id/image/upload-url`, `PATCH /products/:id`).
- **Conclusão:** erro do probe, **não bug do app**. Corrigi o script e reexecutei.

---

## 4. Matriz de autorização — os 14 desvios dos 102 probes

| Probe | Obtido | Leitura |
|---|---|---|
| `PUT/PATCH /barbershops/:B` com token A | ~~200~~ → **403** após B1 | era o bug B1 |
| `PUT /barbershops/:B/schedule` | ~~400~~ → **403** | era o bug B1 |
| `GET /barbershops/:B/schedule` e `/:B/staff` com token A | 200 | público (B3) |
| `GET /services?barbershopId=A` **sem token** | 200 | público (B3) |
| `GET /services/:id` (tenant B) | 400 "barbershopId é obrigatório" | sem vazamento |
| `GET /appointments/availability` shop B com token A | 200 `[]` | sem vazamento (parâmetro ignorado) |
| `GET /:B/waitlist`, `/:B/loyalty/program`, `/:B/goals` com token A | 200 com dados do **próprio** salão | parâmetro ignorado, sem vazamento cross-tenant |
| `GET /feed?barbershopId=B` sem token | 200 `[]` | público (B3) |
| `POST /reviews/:id/.../respond` tenant B | 400 (validação de body antes da authz) | sem vazamento |
| `GET /posts` token A | 400 | exige `barbershopId` — comportamento correto |
| `GET /barbershops/:B/profit/period/month` token A | 400 | validação antes da authz; **não** vazou |
| `POST /payments/webhook` genérico sem token | 200 `{"received":true}` | esperado em dev sem secret (§2.28) |
| `GET /users/:id/avatar/upload-url` id inexistente | 400 | validação de UUID antes da authz |

**Sem vazamento cross-tenant confirmado** fora do B1. Todos os `401/403/400` esperados das demais 88 rotas se comportaram.

---

## 5. E2E, screenshots e medições

- **Suíte pública:** `npx playwright test` → 73 testes, **56 pass, 17 pulados** (17 = 9 `login-safari` × 3 projetos + 4 `panel-queue` + 4 `post-editor`, todos por gates de ambiente, §2.16–18), **0 falha**.
- **Suíte master:** 18 testes → **17 pass, 1 falha** (B7).
- **Screenshots** (`screenshots/`, gerados no navegador real, não mock): 8 em 1440×900 (landing, login, cadastro, planos, fila pública, master overview/accounts/usuarios) e 5 em 375×812 (landing, login, cadastro, planos, fila pública). Estão apenas no disco: o `.gitignore` do repo ignora `scripts/measurements/**/*.png` e `*.log`, por isso as evidências foram exportadas como `.txt`/`.md` (nada de `-f` para contornar o ignore).
- **Medições** (`summary.md`): 10 combinações rota×largura; nenhum critério de acessibilidade/layout reprovado; CLS ≤ 0,0743.
- **Precache:** `node scripts/precache-report.mjs --limit=3185427` → **OK: 2.331.370 B** (69 itens; maior `index-*.js` com 491.751 B).

---

## 6. Crons (FASE de rotinas)

Registrados no boot (extraído do log, `evidencias/server-log-extract.txt`):

`deposit expiration (1/min)` · `waitlist expiration (5 min)` · `post publisher` · `appointment reminders (0 8 * * * America/Sao_Paulo)` · `email reminders (18:00)` · `cobrança pós-trial` · `daily weather log` · `sessions cleanup` · `clean old logs (LGPD)` · `cleanup expired pix (15 min)`.

Execução real confirmada na tabela `CronRun` (status `COMPLETED`):

```
2026-10-09T05:25:00Z  waitlist-expiration  COMPLETED
2026-10-09T05:25:00Z  deposit-expiration   COMPLETED
2026-10-09T05:25:00Z  post-publisher       COMPLETED
2026-10-09T05:24:00Z  deposit-expiration   COMPLETED
...
```

Locks Redis + `CronRun` funcionando (sem execução duplicada concorrente observada). Crons de horário fixo (lembretes 08:00, e-mails 18:00, cobrança pós-trial) **não chegaram a disparar** neste intervalo de execução → comportamento **não exercitado em runtime** (cobertos por testes unitários que passam).

---

## 7. Transparência sobre ações no ambiente

1. Stack de dev iniciada com sua autorização (`agendai_db_dev` + `agendai_redis_dev`).
2. **Reiniciei o processo de backend que eu mesmo tinha subido** (o `tsx watch` não recarregou sozinho após a correção B1 — verificado por `touch` + contagem de "Server started"). Nenhum outro processo foi morto; Docker/Postgres/Redis não foram reiniciados.
3. Salão B teve o nome alterado durante a prova do B1 e foi **restaurado** para `salao do garganta` (verificado após a correção).
4. Rate limit de login foi zerado várias vezes via rota dev `/api/dev/reset-rate-limit`.
5. Nenhum `prisma migrate`, `db push`, `reset` ou exclusão de dados de terceiros.

---

## 8. Dados de teste `[QA]` — criados e removidos

| Dado | Quando | Ação |
|---|---|---|
| 2 chamados `[QA] Chamado criado no e2e …` (`4104a3b5…`, `b103dcaf…`) | 2026-10-09 04:59/05:05 (esta sessão) | **removidos** ✅ |
| 2 tarefas `[QA] Tarefa criada no e2e …` (`30a57240…`, `88d5dbe0…`) | 2026-10-09 04:59/05:05 (esta sessão) | **removidos** ✅ |
| Nome do salão B (alterado na prova do B1) | 2026-10-09 | **restaurado** ✅ |
| 14 chamados + 14 tarefas `[QA]` de **sessões anteriores** (2026-10-07 e 10-08) | anteriores a esta sessão | **não tocados** (não são meus) |
| Sessões de login/refresh geradas pelos testes | 2026-10-09 | mantidas (tokens expiram sozinhos; não havia como associar com segurança a "meus") |

Verificação final: `tickets [QA] hoje = 0`, `tasks [QA] hoje = 0`, salão B com o nome original.

---

## 9. Commits feitos nesta sessão

| Repo | Commit | Mensagem |
|---|---|---|
| `backend` (`fix/seguranca`) | `6bc56a9` | `fix(seguranca): bloqueia IDOR de tenant no update de barbearia e agenda (S11)` |
| `frontend` (`fix/lcp-precache`) | `a75b703` | `test(e2e): restringe o locator do banner de visao temporaria ao role=status certo` |
| `frontend` (`fix/lcp-precache`) | *(este relatório)* | documentação da checagem geral |

Nada foi enviado para remoto.

---

## 10. O que depende de você

1. **B3 — rotas públicas** (`GET /barbershops`, `/:id/schedule`, `/:id/staff`, `/services`, `/feed`): quer que eu adicione `authenticate`/cheque tenant, ou é leitura pública intencional?
2. **B2 — lint do frontend** (480 vs 215): limpar os warnings, rebaixar o limite do CI ou tratar como dívida com prazo?
3. **B4 — CORS** devolvendo 500: posso trocar para 403 (mexer em CORS precisa da sua confirmação)?
4. **B7 — teste `acesso-negado`**: posso renovar o trial do salão fixture (dado local) para rodá-lo, ou deixo como "não testado — ambiente"?
5. **E2E que ficaram pulados**: quer que eu suba os gates (`PANEL_E2E=1`, `POST_EDITOR_QA=1`, `VITE_RECAPTCHA_SITE_KEY` de teste) e rode `panel-queue`, `post-editor` e `login-safari`?
6. **Pagamentos/e-mail/WhatsApp/upload**: para sair de "não testado" é preciso chave/chave de teste real de provedor — sem isso permanece ⏸.

---

## 11. Não testado (resumo com motivo)

| Item | Motivo |
|---|---|
| Webhook de pagamento com payload assinado (MP/Asaas/Abacate) | exige segredo/chave real do provedor |
| Entrega real de e-mail | Resend em modo teste só envia para o dono da conta (sem domínio verificado) |
| WhatsApp Evolution | nenhuma sessão conectada no ambiente |
| Upload de imagem real | sem credencial GCS/Cloudinary usável localmente |
| E2E WebKit/iPhone | exige `VITE_RECAPTCHA_SITE_KEY` no build |
| E2E `panel-queue` e `post-editor` | gates `PANEL_E2E`/`POST_EDITOR_QA` desligados |
| E2E `acesso-negado` (OWNER fora do painel) | trial do salão fixture expirou em 2026-10-08 (paywall) |
| `prisma migrate deploy` | proibido sem confirmação; banco de dev em drift (B5) |
| Crons de horário fixo (08:00/18:00/cobrança pós-trial) | não dispararam na janela de execução (unitários passam) |
| Produção/deploy/staging | fora do escopo (somente local) |
