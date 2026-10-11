# RELEASE PLAN — agendai (frontend)

> Branch de entrega: **`release/frontend`**
> Regras de push: somente branches `release/*`. `main` **nunca** é alterada por push/force.
> Este documento não contém segredos, tokens ou credenciais.

---

## 1. Composição da branch

| Item | Valor |
|---|---|
| Base | `fix/ci-lint-480` (`9bb0fcd` = `origin/main` + 1 commit de CI) |
| `origin/main` | **já é ancestral** — nenhum merge de `main` foi necessário |
| Merge 1 | `fix/seguranca` → `5322677` (4 conflitos) |
| Merge 2 | `fix/qa-painel-admin` | já integrado (ancestral) |
| Merge 3 | `fix/lcp-precache` → `29e0710` (5 conflitos) |
| Fix de merge | `649d6ab` — estado de erro do reCAPTCHA preservado com `SectionError` |
| Commits fora de `main` | 62 |

Conflitos resolvidos:

| Arquivo | Resolução |
|---|---|
| `src/infra/adminApi.ts` | lado `fix/seguranca` (`buildQuery` em `exportBillingStatementCsv`) |
| `src/pages/master-admin/TaskDetailPage.tsx` | combinado: `type="button"` + `aria-label="Voltar para a lista"` (segurança) e `text-accent-fg` (main) |
| `src/pages/master-admin/TeamPage.tsx` | lado `fix/seguranca` (`<Button type="submit">`) |
| `src/pages/master-admin/TicketDetailPage.tsx` | combinado + `text-accent-fg` (main) |
| `src/pages/PlansPage.tsx` | tokens de main + tamanhos LCP (`text-2xs`); `PricingPersuasionCharts` passou a `lazy()` — import estático removido |
| `src/components/marketing/MarketingFooter.tsx` | tokens de main + `text-2xs` |
| `src/pages/marketing/ContactPage.tsx` | tokens de main + `text-2xs` |
| `src/pages/marketing/FeaturesPage.tsx` | tokens de main + `text-2xs` |
| `src/pages/PublicAppointmentManagePage.tsx` | `min-h-screen` → `min-h-dvh` |

Zero marcadores de conflito remanescentes (`grep -rn '<<<<<<<'` vazio).

---

## 2. Ordem de merge

| # | De | Para | Ação | Status |
|---|---|---|---|---|
| 1 | `origin/main` | `release/frontend` | Já resolvido: `main` é ancestral da base | ✅ |
| 2 | `release/frontend` | `main` | Abrir PR de merge-commit (sem squash apagando histórico, sem rebase) | ⬜ Pendente |
| 3 | — | — | `git push origin release/frontend` (apenas `release/*`) | ⬜ Pendente |

Se `main` avançar antes do merge: `git merge origin/main` em `release/frontend` (nada de force-push) e revalidar §7.

---

## 3. Variáveis de ambiente

**Nenhuma nova nesta release.** `git diff origin/main -- .env.example` é vazio.

| Env já existente | Papel na smoke test |
|---|---|
| `VITE_API_URL` / proxy `/api` | aponta para o backend em `:3333` |
| `VITE_RECAPTCHA_SITE_KEY` | sem ela, `webkit-iphone` skippa e o CI falha por design |
| `API_CONTRACT_BACKEND` | só local; em CI o backend irmão não existe |

Script novo (não é env): `npm run measure:responsive` (`scripts/measure-responsive.mjs`).

---

## 4. Migrations / banco

Nenhuma migration e nenhum schema no frontend. O contrato é verificado contra o backend irmão:

| Verificação | Resultado |
|---|---|
| `npm run contract:check` | ✅ 435 chamadas em wrappers; 589 rotas backend (método/caminho) |
| `npm run contract:check:strict` | ✅ |
| `npm run test:contract` | ✅ 8/8 (parser de rotas) |

---

## 5. Riscos conhecidos

| # | Risco | Severidade | Evidência | Mitigação | Status |
|---|---|---|---|---|---|
| R1 | CI do frontend falha em `npm run test:contract` (step 14, **incondicional**) porque o backend-irmão não existe no checkout do Actions | Alta | run `37568643259` (`fix/seguranca`) falha nesse step; `scripts/check-api-contract.mjs` lança `Backend não encontrado em ".../backend"` | Ver §6 — duas opções, **nenhuma aplicada** | ❌ Não resolvido (reportado) |
| R2 | CI também falharia em `npm run test:e2e`: `e2e/post-social.spec.ts` faz `readFileSync('../backend/...')` no load do módulo | Alta | Reproduzido no baseline: `ENOENT .../agendai-back-end/src/modules/posts/assets/salon-editorial.png` | mesma correção de R1 | ❌ Não resolvido (reportado) |
| R3 | Limite de lint em **484** warnings com **480** reais — margem de 4 | Média | `npx eslint src --ext .ts,.tsx` → 480 warnings, 0 errors | Baixar o débito antes de apertar o limite | ⚠️ Aceito (limite veio de `9bb0fcd`) |
| R4 | `e2e/master/**` **não roda** em CI (sem `E2E_MASTER_*`) | Média | `playwright.config.ts` ignora a pasta sem as envs | Rodar local com seed do master antes do merge | ⬜ Ação recomendada |
| R5 | 16 specs skippam no chromium desktop+mobile | Baixa | `16 skipped` em `54 passed` | Conferir se os skips são esperados | ✅ Aceito |
| R6 | `webkit-iphone` não roda em macOS 14 arm64 local (Playwright ≥1.62) | Baixa | Nota em `playwright.config.ts`; em CI/Ubuntu roda | Validar no CI | ✅ Conhecido |
| R7 | Histórico do frontend tem 12 findings de gitleaks (S10) | Baixa | Varredura 8.30.1 documentada | Não há job de secret scan no CI de frontend hoje | ✅ Conhecido |

### R1/R2 — por que o CI do frontend está vermelho

| Run | Branch | Step que falha |
|---|---|---|
| `37506054627` | `main` | `Run npm run typecheck` (import `../../agendai-back-end/...` em `e2e/post-editor.spec.ts`) |
| `37568643259` | `fix/seguranca` | `Run npm run test:contract` (backend-irmão ausente) |

`release/frontend` corrige o primeiro (`1fd06a3` trocou os caminhos por `../backend`). O segundo é **ambiental**: no Actions só o repositório do frontend é baixado, então `../backend` não existe.

### Correções possíveis (não aplicadas nesta entrega)

**Opção A — mínima (enfraquece a checagem):** condicionar os steps ao diretório irmão, como já é feito no step de `contract:check`:

```yaml
- name: Route contract unit tests
  run: |
    if [ -d "$GITHUB_WORKSPACE/../backend" ]; then
      npm run test:contract
    else
      echo "backend irmão ausente; parser coberto apenas localmente"
    fi
```

**Opção B — recomendada (fortalece a checagem, sem secrets novas):** os dois repositórios são **públicos**, então o `GITHUB_TOKEN` padrão basta para baixar o backend como vizinho:

```yaml
- uses: actions/checkout@v4
  with:
    repository: caiorodrigues10/agendai-back-end
    path: backend
- run: ln -s "$GITHUB_WORKSPACE/backend" "$GITHUB_WORKSPACE/../backend"
```

Com isso `test:contract`, `contract:check` e `test:e2e` passam a validar o contrato real e não apenas o parser.

---

## 6. Rollback

```bash
# 1) Desfazer o merge já aplicado em main (mantendo o histórico)
git fetch origin
git checkout main
git log --oneline -3                       # identifica o sha do merge
git revert -m 1 <merge-sha>

# 2) Apagar a branch de entrega (só em release/*)
git push origin --delete release/frontend
```

O frontend não tem estado: rollback = revert de código + novo build/deploy.

---

## 7. Checklist de smoke test

Ambiente: macOS local, Node 24. Nenhum ambiente de produção foi tocado.

### 7.1 Verificações automatizadas — `release/frontend`

| # | Item | Resultado | Prova | Status |
|---|---|---|---|---|
| 1 | `npm run docs:check` | exit 0 | `scripts/check-docs.mjs` | ✅ |
| 2 | `npm run test:contract` | 8/8 | node:test | ✅ |
| 3 | `npm run contract:check` | 435 chamadas / 589 rotas | backend irmão em `../backend` | ✅ |
| 4 | `npm run typecheck` | exit 0 | `tsc --noEmit` | ✅ |
| 5 | `npm run lint -- --max-warnings 484` | 480 warnings, 0 errors | ESLint | ✅ |
| 6 | `npm test` | 160 arquivos / 659 testes | Vitest (92s) | ✅ |
| 7 | `npm run build` | exit 0 | Vite + PWA | ✅ |
| 8 | Gate de precache | **2330221 ≤ 3185427** | `node scripts/precache-report.mjs --limit=3185427` | ✅ |
| 9 | Chunk mais pesado (regra R7) | `index-BQQI5Fs4.js` 491 kB (< 500 kB) | saída do build | ✅ |
| 10 | E2E chromium desktop + mobile | **54 passed / 16 skipped / 0 failed** | `npx playwright test --project=desktop-chromium --project=mobile-chromium` | ✅ |

### 7.2 Comparação com o baseline (`origin/main`)

| # | Verificação | `origin/main` | `release/frontend` | Δ |
|---|---|---|---|---|
| 11 | `npm run typecheck` | ❌ TS2307 `e2e/post-editor.spec.ts` | ✅ | corrigido |
| 12 | Lint | 484 warnings × limite **215** → ❌ | 480 warnings × limite **484** → ✅ | −4 warnings + limite correto |
| 13 | `npm test` | 138 arquivos / 558 testes | 160 / 659 | +22 arquivos, +101 testes |
| 14 | `npm run build` | ✅ | ✅ | — |
| 15 | Precache PWA | 105 entries / 2800.34 KiB | 69 entries / 2115.80 KiB | **−531 KiB** |
| 16 | Gate de precache | script inexistente | gate executado e OK | novo |
| 17 | E2E chromium | ❌ `ENOENT .../agendai-back-end/...` | ✅ 54 passed | corrigido |
| 18 | `npm run docs:check` | ✅ | ✅ | — |

### 7.3 Smoke test manual (pré-deploy)

| # | Item | Resultado | Prova | Status |
|---|---|---|---|---|
| 19 | Landing carrega e LCP ok em rede 4G | — | Chrome DevTools | ⬜ |
| 20 | Login staff + sessão sobrevive a reload ("Manter conectado") | — | navegador real | ⬜ |
| 21 | Fila: adicionar cliente manual e concluir | — | UI | ⬜ |
| 22 | Agendamento público do celular | — | dispositivo real | ⬜ |
| 23 | Checkout de assinatura (Asaas) | — | sandbox | ⬜ |
| 24 | iPhone Safari real: login, reload, ITP (sessão e cookies) | — | iPhone físico | ⬜ |
| 25 | iOS: reCAPTCHA de "Esqueci a senha" mostra erro claro | — | iPhone físico | ⬜ |
| 26 | `e2e/master/**` com envs do master | — | seed do master | ⬜ |

---

## 8. Ordem de deploy sugerida

1. Backend (`release/backend`, ver plano do outro repositório) primeiro — o frontend consome as rotas novas.
2. Smoke test do backend (saúde, login, fila, agendamento, webhook).
3. Deploy do frontend.
4. Smoke test §7.3, com prioridade em 20, 24 e 25 (Safari/iOS).
