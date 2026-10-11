# Checagem geral — 2ª rodada

Data: 09/10/2026 · Escopo: só ambiente local · Nenhum push · Nenhum e-mail/WhatsApp/cobrança real

**Servidor**: `backend` `:3333` (`tsx watch`, `NODE_ENV=development`, `LOGIN_RATE_LIMIT_MAX=60`) · `frontend` `:3003` (`vite dev`) · PG `:5442` · Redis `:6380` · node `v24.17.0`
**Ramos**: `backend/fix/seguranca` · `frontend/fix/lcp-precache` (repositórios separados; a raiz não é repo git)

---

## O que **não** rodou nesta rodada

Deixado explícito antes de qualquer resultado, para não virar "100%":

| Fase | Situação |
|---|---|
| E2E Fase 3 (A–K) em **WebKit / iOS** | **Não testado.** `webkit-iphone` falha na abertura de página: `Protocol error (Page.overrideSetting): Unknown setting: PushAPIEnabled` (limitação conhecida, documentada em `playwright.config.ts`). |
| `login-safari` em WebKit | **Não testado** (mesmo motivo). Em **chromium** rodou: 6/6 ✅. |
| Financeiro — `PAST_DUE`, `UNPAID`, conclusão de assinatura, estorno/chargeback | **Não testado.** Exigiria gateway real ou seed de fatura; fora das regras desta rodada. |
| RLS no Postgres | **Proposto, não aplicado** (decisão do usuário). |
| `.env` real / produção | Fora de escopo por regra. Onde precisei provar comportamento de produção, subi uma instância local com `NODE_ENV=production` e encerrei em seguida. |

---

## Tabela de áreas

| # | Área | Status | Resultado |
|---|---|---|---|
| 1 | Varredura de tenant/IDOR — varredura e probes | ✅ | 581 rotas mapeadas; 206 com `{barbershopId}`, 245 com `{id}`; probes alvo×controle, cross-read e cross-write executados |
| 1b | Varredura — correções (S12/S13/S14) | ✅ | 3 achados corrigidos, cada um com teste que falha antes e passa depois |
| 1c | RLS | ⚠️ | Proposta enviada; **não aplicado** (usuário ainda vai decidir) |
| 2 | Login — 423 escala com tentativas | ❌ | Só relatório (decisão do usuário). Ver bug M2 |
| 2b | Login — 10/min por IP em produção | ✅ | Confirmado (5×429 no limite, saldo 0) |
| 2c | Login — recaptcha fail-closed em produção | ✅ | Sem token → 403 |
| 2d | Login — brute force | ❌ | 3× `Redis error in checkLock, allowing login` → fail-open. Ver bug A1 |
| 3 | Fase 3 E2E — desktop 1440 (`PW_SCREENSHOTS=on`) | ⚠️ | 45 ✅ / 5 ❌ / 3 ⏸ (53) — 2 das falhas eram `panel-queue`, corrigidas depois |
| 3b | Fase 3 E2E — mobile 375 | ⚠️ | 26 ✅ / 5 ❌ / 3 ⏸ / 1 não executou — 2 das falhas eram `panel-queue`, corrigidas depois |
| 3c | Fase 3 — console/rede sem erro | ⚠️ | Não varrido automaticamente em toda rota; `pwa-offline` estoura timeout de 240 s. Ver bug B4 |
| 4 | Financeiro — webhooks (assinatura/HMAC) | ✅ | 16 probes locais + 3 fail-closed de produção; idempotência 2× → 200 único |
| 4b | Financeiro — ledger vs fila | ⚠️ | Conferência à mão bate (2×R$999 = R$1.998), mas **R$1.998 sem lançamento no ledger**. Ver bug M5 |
| 4c | Financeiro — assinaturas | ⚠️ | `GET /me` ✅, `GET /cancellation-context` ✅, `DELETE /me` → CANCELED ✅ e restaurada; `PAST_DUE`/`UNPAID`/estorno **não testados** |
| 4d | Crons — execução e sem duplicidade | ✅ | 11 jobs rodando ao vivo, **zero** duplicidade em `(jobName, scheduledKey)` |
| 4e | Crons — `clean-old-logs` | ✅ | Estava 42703 (4 falhas) → **corrigido** (`7feb804` + `2adfcf2`) |
| 4f | Crons — gatilho manual + `PROCESS_ROLE` | ✅ | `POST /notifications/appointment-reminders/run` → 200 `{sent:0,…}`; `PROCESS_ROLE` default `all` |
| 5 | Segurança — audit ×2 (backend/frontend) | ❌ | backend 46 (7 high), frontend 2 moderate. Ver bug A3 |
| 5b | Segurança — headers de produção | ✅ | 9/9 presentes |
| 5c | Segurança — `/docs` | ✅ | 404 |
| 5d | Segurança — `/internal/health` em produção | ❌ | 200 com papel/uptime/deps. Ver bug A2 |
| 5e | Segurança — dado sensível público | ✅ | `cnpj` era público → **corrigido** (`8319305`) |
| 5f | Segurança — `GET /barbershops` sem `limit` | ❌ | Paginação ignorada. Ver bug B5 |
| 6 | Performance — `measure-responsive` 8 rotas × off/real × 375/1440 | ✅ | 32/32 células, mediana de 5/5, todas dentro do orçamento |
| 7 | E2E que antes pulavam — `login-safari` (chromium) | ✅ | 6/6 |
| 7b | E2E que antes pulavam — `PANEL_E2E` (`panel-queue`) | ✅ | **4/4** (desktop + mobile) após rework do spec |
| 7c | E2E que antes pulavam — `POST_EDITOR_QA` (`post-editor`) | ⚠️ | 2/2 desktop; no mobile 1 ❌ + 1 não executou (0 ms) |
| 7d | E2E que antes pulavam — WebKit (`PANEL`/`POST_EDITOR`) | ⏸ | **Não testado** (ver topo) |
| 8 | Limpeza — só o que esta rodada criou | ✅ | 1 chamado + 1 tarefa + 1 salão + fixture `[QA]` apagados; **14 chamados e 14 tarefas antigos preservados** |

Legenda: ✅ completo · ⚠️ parcial/explicado · ❌ falhou ou achado aberto · ⏸ não testado

---

## Achados por gravidade

### Alta

**A1 — Brute force fail-open quando o Redis falha** (não corrigido; corrigir enfraquece/altera comportamento de auth — requer decisão)
3 ocorrências no log: `Redis error in checkLock, allowing login`. Com o lock indisponível o backend **deixa logar sem contar tentativas**. Reprodução: parar Redis e tentar senha errada.
*Evidência*: `qa-logs/login-423-dev.txt`.

**A2 — `/internal/health` responde 200 em produção** (não corrigido)
Instância local com `NODE_ENV=production` expôs papel (`worker`), uptime e dependências. `/docs` já está 404 ✅.
*Evidência*: `qa-logs/prod-headers.txt`.

**A3 — Dependências vulneráveis** (não corrigido nesta rodada)
backend `npm audit`: **46** vulnerabilidades (7 high). frontend: **2** moderate. Correção exige upgrade de dependência + `npm audit fix` com regressão — fora do escopo "só relatório" desta rodada.

**A4 — IDOR de tenant** (corrigido)
- `S12` criar/atualizar/desativar serviço cruzando tenant → `de92fca` + `services.spec.ts` 15/15.
- `S13` `GET /barbershops/:id/reputation` devolvia dados de outro salão → `a368434` + `reputation.spec.ts` 8 testes.
- `S14` `cnpj` aparecia na resposta pública → `8319305`.
Evidência da varredura: 54 rotas respondem 200 nos dois cenários, **51 corpos idênticos** (parâmetro ignorado, sem vazamento) e **3 diferentes**, dos quais só `reputation` era vazamento real; `cross-read` n=75 → **1** corpos diferentes.

**A5 — Cron de limpeza de logs (LGPD) quebrado** (corrigido)
`clean-old-logs` falhava `42703` (coluna `createdAt` não citada — o Postgres dobra identificador não citado e a coluna real é `"createdAt"`). Corrigido em `7feb804` + `2adfcf2`, com `cleanOldLogs.cron.spec.ts` provando o fail-before: **2 testes antes → 6 depois**; SQL validada contra o banco real.

### Média

**M1 — Serviço inativo oferecido na fila** (corrigido)
`GET /api/services?barbershopId=` devolve serviços inativos (o painel do dono precisa reativá-los) e o modal de adição manual repassava a lista inteira → `JoinQueueUseCase:56` `400 "Serviço inválido para este estabelecimento"`. Filtro `active !== false` em `AddCustomerForm.tsx` + `active?: boolean` em `types.ts`; teste `AddCustomerForm.test.tsx` (2) **falha sem o filtro e passa com ele**. Corrigido em `8da86cb`.

**M2 — O 423 não escala com o número de tentativas** (não corrigido; só relatório, decido pelo usuário)
O contador zera junto com o lock, então a proteção de conta é mais fraca que o design.

**M3 — Webhook do Mercado Pago sem secret em dev ignora a assinatura** (não corrigido; é comportamento de desenvolvimento)
Com `MERCADOPAGO_WEBHOOK_SECRET` ausente em dev, um payload sem `x-signature` é aceito (200). Em produção é fail-closed (401) ✅.

**M4 — `prisma` força SSL quando `NODE_ENV=production`** (não corrigido)
`ssl: isProduction || hasSslMode` faz `/ready` ficar 503 localmente em produção. Provei os comportamentos de produção numa instância local só com as flags, sem mexer em `DATABASE_URL`.

**M5 — R$ 1.998 de fila sem lançamento no ledger** (não corrigido)
`npm run ledger:backfill --dry-run` → `queueItems: 2, queueLedgerAmount: 1998`; conferência manual: 2 `queue COMPLETED` × R$999 = **1998 ✓**; mas `profit_entries` está zerado e `crm_financial_events` só tem 3 `FIADO_PAYMENT` somando R$90. O `--apply` **não foi executado** de propósito (mudaria saldo de verdade).

**M6 — RLS ignorado** (proposto, não aplicado)
O usuário PG é `rolsuper`/`rolbypassrls=true` e 102/153 tabelas estão sem RLS: o isolamento de tenant depende **só da aplicação**.

**M7 — `GET /api/barbershops` ignora `limit`** (não corrigido)
Paginação não aplicada na listagem pública.

### Baixa

**B1 — `panel-queue` era um spec inexecutável** (corrigido)
Primeira execução da história dele; seletores ambiguos (`getByLabel(/senha/i)` casava com `aria-label="Mostrar senha"`, `/entrar/i` casava "Entrar com Google"), sem descarte de consentimento/onboarding, sem a etapa de cobrança. Rework em `5f22a41` + `4334163` → **4/4**.

**B2 — `login-safari` só roda em chromium** (não corrigido)
Vite sem `VITE_RECAPTCHA_SITE_KEY` era a causa original; subi uma instância `:3004` com a chave de teste pública e obtive 6/6. WebKit continua bloqueado pelo `PushAPIEnabled`.

**B3 — `master/usuarios.spec.ts` falha na busca paginada** (não corrigido)
Limpa a busca e espera `admin@admin.com` visível sem paginar (27 users); o próprio spec comenta sobre paginação.

**B4 — `pwa-offline` ×2 com timeout de 240 s** (não corrigido)
`page.evaluate` estoura o timeout nos dois viewports.

**B5 — `post-editor` não executou no mobile** (não corrigido)
1 teste 0 ms / não executado em 375.

**B6 — Ledger vs fila (ver M5)** — R$1.998 pendente de decisão.

---

## Evidências

| Arquivo | Conteúdo |
|---|---|
| `checagem-geral/relatorio.md` | 1ª rodada |
| `checagem-geral/performance-2.md` | 32 células da tarefa 6 |
| `qa-logs/measure-checagem-2.log` | execução da medição (32/32) |
| `qa-logs/e2e-desktop.log`, `e2e-mobile.log` | suítes completas |
| `qa-logs/e2e-panel-final5.log` | `panel-queue` 4/4 |
| `qa-logs/e2e-loginsafari2.log` | `login-safari` chromium 6/6 |
| `qa-logs/probe-shopid.json`, `probe-cross-read.json`, `probe-cross-write.json`, `probe-id.json` | varredura de tenant |
| `qa-logs/prod-headers.txt` | headers + `/docs` + `/internal/health` em produção |
| `qa-logs/login-423-dev.txt` | fail-open do brute force |
| `qa-logs/backend-3335.log`, `backend-prod-3336.log` | instâncias de teste de webhook/produção (encerradas) |

Cortes: 8 rotas × 2 larguras × 2 cenários × 5 execuções.
Pior LCP **2352 ms** (`/login` off@375) → margem **148 ms** dentro dos 2500.
Pior CLS **0.0785** (`/sobre`) → margem **0.0215** dentro de 0,1.
O precache (`fix/lcp-precache`) **não piorou** CLS nem LCP em nenhuma célula.

---

## Gates

| Gate | Resultado |
|---|---|
| backend `test:unit` | ✅ 170 arquivos / **1529 testes** |
| backend `test:security` | ✅ 2/7 |
| backend `typecheck` | ✅ 0 erros |
| backend `docs:check` | ✅ OK |
| backend `prisma validate` | ✅ schema válido |
| backend `build` | ✅ exit 0 |
| frontend `test` | ✅ 135 arquivos / **598 testes** |
| frontend `typecheck` | ✅ 0 erros |
| frontend `lint` | ⚠️ **0 erros / 480 warnings** (mesmo número da 1ª rodada — mantido o plano de redução) |

---

## Commits

**backend (`fix/seguranca`)** — cada correção com teste que falha antes e passa depois:

| Commit | Correção | Prova |
|---|---|---|
| `988a4d4` | trial do fixture perf relativo a `now()` | seed idempotente |
| `de92fca` | S12 IDOR de serviço | `services.spec.ts` 15/15 |
| `a3005fa` | seed `scripts/seed-qa-fixture.ts` + `prisma:seed:qa-fixture` | idempotente + `--purge` |
| `a368434` | S13 IDOR de reputação | `reputation.spec.ts` 8 |
| `8319305` | S14 `cnpj` público | diff de resposta |
| `7feb804` + `2adfcf2` | cron `clean-old-logs` | 2 → 6 testes |

**frontend (`fix/lcp-precache`)**:

| Commit | Mudança |
|---|---|
| `8fed7ca` | `--perf-widths` no `measure-responsive` + `performance-2.md` |
| `71d791d` | `PW_SCREENSHOTS=on` grava screenshot por passo |
| `8da86cb` | **fix**: serviço inativo na fila + teste |
| `5f22a41` + `4334163` | `panel-queue` rework → 4/4 |

Nada foi empurrado; `git status` limpo nos dois ramos.

---

## Limpeza (o que apaguei e o que deixei)

**Apagado (criado por esta rodada):**
- fixture `[QA]` inteiro: salão `a11ce000-…000b` + tenant em cascata (2× `prisma:seed:qa-fixture --purge --confirm`)
- 1 chamado `[QA] Chamado criado no e2e 1791565991459`
- 1 tarefa `[QA] Tarefa criada no e2e 1791565991459`
- salão `E2E Convite 1791565986091` + owner (cascata)
- itens de fila `E2E Cliente …` (0 restantes)
- instâncias temporárias `:3335` (webhook) e `:3004` (Vite de teste) — **encerradas**
- `/tmp/qa-token-*`, `/tmp/qa-e2e-env.sh` e artefatos temporários
- `scripts/measurements/checagem-2/` (rascunho, substituído por `performance-2.md`)

**Preservado de propósito:**
- **14 chamados `[QA]` e 14 tarefas `[QA]` antigos** (você mandou não apagar)
- 16 salões `E2E Convite` de rodadas antigas
- salão/perf fixture `Barbearia Sintetica Perf` (referenciado pelas medições)
- `audit_logs` / logs de acesso gerados automaticamente (trilha do sistema — apagar seria pior que manter)

---

## O que depende de você

1. **RLS** — aplicar ou não a proposta (hoje o isolamento é só da aplicação e o PG roda com `bypassrls`).
2. **`/internal/health`** — restringir a rede interna/loopback ou exigir token?
3. **Fail-open do brute force** — trocar por fail-closed (bloqueia logins se o Redis cair) ou manter e alertar?
4. **`npm audit`** — liberar upgrade das 46 (7 high) no backend e 2 no frontend?
5. **Ledger** — rodar `ledger:backfill --apply` para lançar os R$ 1.998, ou investigar antes por que `profit_entries` está zerado?
6. **423** — corrigir a escala do contador (é mudança de comportamento de auth, não fiz por regra).
7. **WebKit/iOS** — manter como fora de escopo (Playwright `PushAPIEnabled`) ou provisionar Safari real?
8. **Pergunta em aberto da tarefa 1** — seguir só com `GET /api/barbershops` protegido + verificação em `GET /barbershops/:id`, como combinado? Já medi o impacto; falta o "sim" para aplicar.
9. **CI frontend** — manter `--max-warnings 480` e o plano de redução?
10. **14 chamados / 14 tarefas `[QA]` antigos** — apagar agora ou viram dívida?
