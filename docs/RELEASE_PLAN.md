# RELEASE PLAN — agendai (frontend)

> Branch: **`main`** (publicada em 2026-10-12).
> Este documento não contém segredos, tokens ou credenciais.

> **Atenção — este plano documenta a `main`, não a `release/frontend`.** As duas
> branches divergem: a main recebeu o merge da `fix/seguranca` + correções de CI;
> a `release/frontend` recebeu isso **e** o trabalho de LCP/precache
> (`fix/lcp-precache`). Ver §9.

---

## 1. Composição da `main`

| Item | Valor |
|---|---|
| `origin/main` anterior | `ae676a9` (D-014, tokens de tema) |
| Merge | `origin/fix/seguranca` (`18e96d5`) → `main` (`a7cf2f4`) |
| Commits à frente do antigo `origin/main` | 25 (até `20a5aaa`) |
| Empurrada em | 2026-10-12 (`ae676a9..3e54510`, depois ajustes de CI) |

### Conflitos resolvidos no merge (`a7cf2f4`) — 6 blocos, 4 arquivos

| Arquivo | Bloco | Resolução |
|---|---|---|
| `src/infra/adminApi.ts` | `exportBillingStatementCsv` | lado `fix/seguranca` (`buildQuery`). Helper compartilhado; `apiFetch` + `getAuthHeader()` iguais nos dois lados — nenhuma checagem de segurança perdida |
| `src/pages/master-admin/TeamPage.tsx` | botão de enviar convite | lado `fix/seguranca` (`<Button type="submit" loading={isSubmitting}>`). A main já trazia `react-hook-form`; o lado HEAD referenciava `inviteEmail`/`inviting`, que **não existem**, e fechava `</button>` contra `</form>` |
| `src/pages/master-admin/TaskDetailPage.tsx` | botão voltar | combinado: `type="button"` (main) + `aria-label="Voltar para a lista"` (segurança) |
| `src/pages/master-admin/TaskDetailPage.tsx` | enviar comentário | main: `text-accent-fg` (D-014). O `aria-label` já era comum aos dois lados — não duplicado |
| `src/pages/master-admin/TicketDetailPage.tsx` | botão voltar | combinado: `type="button"` + `aria-label="Voltar para a lista"` |
| `src/pages/master-admin/TicketDetailPage.tsx` | enviar comentário | main: `text-accent-fg`; o lado segurança duplicaria o `aria-label` que já existe na linha acima |

`grep -rn -E '^(<<<<<<<|=======|>>>>>>>)' src/` → vazio.

> `text-white` não voltou em nenhum bloco: o token D-014 já vive em
> `Button.tsx` (`bg-accent text-accent-fg`), que não foi conflitado.

---

## 2. Commits posteriores ao merge

| Commit | Assunto |
|---|---|
| `3e84585` | **F1** — CI checa o contrato contra o backend irmão |
| `3e54510` | **F2** — 5 testes unitários do `ForgotPasswordPage` |
| `17fc397` | `API_CONTRACT_BACKEND` sobe para o env do job |
| `090101a` | layout de monorepo no Actions (resolve o TS2307 pré-existente) |
| `20a5aaa` | `playwright install` antes do `npm test` |

---

## 3. CI — o que estava vermelho e o que mudou

| Run | Branch | Step que falhava | Causa |
|---|---|---|---|
| `37506054627` | `main` | `typecheck` | `e2e/post-editor.spec.ts` importa `../../backend/...` — backend inexistente no runner |
| `37568643259` | `fix/seguranca` | `test:contract` | backend-irmão ausente |
| `38182230575` | `release/frontend` | `test:contract` | idem |
| `38198815193` | `main` (F1) | `test:contract` | `API_CONTRACT_BACKEND` só estava no step de `contract:check`; o módulo lança no **import** |
| `38198967786` | `main` | `typecheck` | layout: frontend em `$GITHUB_WORKSPACE` fazia `../../backend` apontar fora do runner |
| `38199422156` | `main` | `npm test` | projeto `storybook` abre Chromium; `playwright install` vinha depois |

### Correção aplicada (F1)

O workflow monta o layout de monorepo — e **não** é estética, o código depende
dela:

```
$GITHUB_WORKSPACE/agendai   <- este repo
$GITHUB_WORKSPACE/backend   <- caiorodrigues10/agendai-back-end (checkout público)
```

Com isso resolvem, sem symlink e sem mudar código:

- `e2e/post-editor.spec.ts:6` → `../../backend/src/...` (relativo a `e2e/`)
- `e2e/post-editor.spec.ts:13` → `path.resolve('../backend')` (relativo ao cwd)
- `scripts/check-api-contract.mjs` → valida o backend **no import**, default `../backend`

`API_CONTRACT_BACKEND` foi para o **env do job** porque `test:contract` importa o
mesmo módulo. E o gate subiu para `contract:check:strict`: toda chamada de wrapper
precisa casar com rota registrada e nenhuma pendência de
`scripts/api-contract-debt.json` pode sobrar.

O `--max-warnings` do lint foi de **215 para 482** — o valor real da main. O 215
reprovava a própria main (484 warnings no baseline). Travar no número exato
reprova qualquer warning novo.

### 3.1 Run verde

**Run `38200171102` (`main` @ `20a5aaa`) — 14/14 steps verdes**, incluindo
`test:contract`, `contract:check:strict`, `typecheck`, `lint`, `npm test`
(projetos `app` **e** `storybook` com Chromium) e `test:e2e`. É o primeiro CI
completamente verde da main neste histórico.

---

## 4. Variáveis de ambiente

**Nenhuma nova.** `git diff ae676a9 -- .env.example` é vazio.

| Env | Papel |
|---|---|
| `VITE_API_URL` / proxy `/api` | aponta para o backend em `:3333` |
| `VITE_RECAPTCHA_SITE_KEY` | sem ela, `webkit-iphone` skippa e o CI falha por design |
| `API_CONTRACT_BACKEND` | agora também no CI (§3); local default `../backend` |

---

## 5. Riscos conhecidos

| # | Risco | Severidade | Evidência | Status |
|---|---|---|---|---|
| R1 | CI falhava em `test:contract` sem o backend-irmão | Alta | runs `37568643259`, `38182230575` | ✅ Resolvido (F1) |
| R2 | CI falhava em `typecheck` (TS2307) | Alta | run `37506054627` | ✅ Resolvido (layout, `090101a`) |
| R3 | `e2e/master/**` **não roda** em CI (sem `E2E_MASTER_*`) | Média | `playwright.config.ts` ignora a pasta sem as envs | ⬜ Ação recomendada |
| R4 | 16 specs pulam no chromium desktop+mobile | Baixa | todos gateados por ambiente (F3) | ✅ Aceito |
| R5 | `webkit-iphone` não roda em macOS 14 arm64 local | Baixa | nota em `playwright.config.ts`; em CI/Ubuntu roda | ✅ Conhecido |
| R6 | 3 stories do projeto `storybook` estouram 15 s sob carga | Baixa | 3 falhas no run completo; **as mesmas 3 passam 11/11 isoladas** | ✅ Flake de carga, não regressão |
| R7 | Histórico do frontend tem 12 findings de gitleaks | Baixa | varredura 8.30.1 documentada | ✅ Conhecido |
| R8 | **main e `release/frontend` divergem** — a release tem LCP/precache que a main não tem | Média | `scripts/precache-report.mjs` só existe na release | ⚠️ Ver §9 |

---

## 6. Rollback

```bash
git fetch origin
git checkout main
git log --oneline -5
git revert -m 1 <merge-sha>
```

O frontend não tem estado: rollback = revert de código + novo build/deploy.

---

## 7. Checklist de executado — `main`

Ambiente: macOS local, Node 24. Nenhum ambiente de produção foi tocado.

| # | Item | Resultado | Prova | Status |
|---|---|---|---|---|
| 1 | `npm run typecheck` | exit 0 | `tsc --noEmit` (cobre `src`, `.storybook`, `e2e`, `server`) | ✅ |
| 2 | `npm run lint -- --max-warnings 482` | 482 warnings, **0 errors** | ESLint | ✅ |
| 3 | `npx vitest run --project app` | **84 arquivos / 403 testes**, 0 falhas | Vitest | ✅ |
| 4 | `npm test` (app + storybook) | 588/591 | 3 falhas = R6 (timeout de carga) | ⚠️ R6 |
| 5 | `npm run build` | exit 0 | Vite + PWA, precache **106 entries / 2807.46 KiB** | ✅ |
| 6 | `npm run test:contract` | 8/8 | node:test | ✅ |
| 7 | `npm run contract:check` | 435 chamadas / 589 rotas | backend irmão | ✅ |
| 8 | `npm run contract:check:strict` | exit 0 | zero dívida em `api-contract-debt.json` | ✅ |
| 9 | `npm run docs:check` | exit 0 | `scripts/check-docs.mjs` | ✅ |
| 10 | Testes novos (F2) | 5/5 | `ForgotPasswordPage.test.tsx`, inclui a prova anti-enumeração | ✅ |
| 11 | CI `main` (run `38200171102`) | **14/14 steps verdes** | `gh run view 38200171102` | ✅ |

### 7.1 Testes pulados (F3) — todos gateados por ambiente

| Grupo | Specs | Gate |
|---|---|---|
| `e2e/master/**` | 15 | `E2E_MASTER_EMAIL` + `E2E_MASTER_PASSWORD` (seed do master) |
| `e2e/panel-queue.spec.ts` | 1 | `PANEL_E2E=1` + credenciais + stack completo |
| `e2e/post-editor.spec.ts` | 1 | `POST_EDITOR_QA=1` + `E2E_BASE_URL` no Vite dev |

Zero `.skip` / `.todo` arbitrário em `src/`.

---

## 8. Smoke test manual (pré-deploy)

| # | Item | Status |
|---|---|---|
| 12 | Landing carrega e LCP ok em rede 4G | ⬜ |
| 13 | Login staff + sessão sobrevive a reload ("Manter conectado") | ⬜ |
| 14 | Fila: adicionar cliente manual e concluir | ⬜ |
| 15 | Agendamento público do celular | ⬜ |
| 16 | Checkout de assinatura (Asaas) | ⬜ |
| 17 | iPhone Safari real: login, reload, ITP | ⬜ |
| 18 | iOS: reCAPTCHA de "Esqueci a senha" mostra erro claro | ⬜ |
| 19 | `e2e/master/**` com envs do master | ⬜ |

---

## 9. Divergência com `release/frontend`

A `release/frontend` **não** foi mergeada na main. Ela contém trabalho que a main
não tem:

| Item | `main` | `release/frontend` |
|---|---|---|
| Merge da `fix/seguranca` | ✅ | ✅ |
| Correções de CI (§3) | ✅ | ❌ |
| Testes do `ForgotPasswordPage` | ✅ | ❌ |
| `fix/lcp-precache` (LCP, `text-2xs`, `lazy()`) | ❌ | ✅ |
| `scripts/precache-report.mjs` (gate de precache) | ❌ | ✅ |
| Chunk mais pesado | `StaffDashboard-*.js` **573 kB** | `index-*.js` 491 kB |
| `--max-warnings` | 482 (valor exato) | 484 |

Antes de promover qualquer uma das duas, decidir qual é a linha de base — senão
o LCP work se perde ou as correções de CI se perdem.
