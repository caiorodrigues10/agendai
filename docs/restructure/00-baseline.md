# Etapa 0 — Baseline de qualidade e registro de alterações locais

Data: 2026-09-28 · Repo: `agendai` (branch `main`, HEAD `4d74145`, árvore limpa)

## 1. Checks de validação (pré-existentes × novos)

| Check | Comando | Resultado | Status |
|---|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0, sem erros | ✅ |
| Lint | `npx eslint .` | **610 problemas: 17 erros + 593 warnings** | ⚠️ pré-existente |
| Testes | `npx vitest run --pool=forks` | **137/137 em 35 arquivos**, exit 0 | ✅ |
| Build | `npm run build` | exit 0, `generateSW`, **82 entradas de precache (2579.63 KiB)** | ✅ |
| Docs | `node scripts/check-docs.mjs` | exit 0 (última execução pós-rebrand) | ✅ |

### Política de gate para a reestruturação

Nenhuma contagem pode piorar em relação à baseline acima. Qualquer erro/lint novo introduzido pelas mudanças deve ser corrigido antes da entrega da etapa; os 17 erros e 593 warnings abaixo são **pré-existentes** e não bloqueiam (correções entram em entregas separadas, sem aumentar o limite global).

### Decomposição dos 17 erros de lint (todos pré-existentes)

**8 × `Parsing error: parserOptions.project` (arquivos fora do escopo do tsconfig — config do ESLint, não de código):**
- `e2e/mvp-public.spec.ts`
- `scripts/audit-frontend-structure.mjs`, `scripts/capture-screenshots.mjs`, `scripts/check-api-contract.mjs`, `scripts/check-api-contract.test.mjs`, `scripts/check-docs.mjs`, `scripts/verify-delivery.mjs`
- `server/server.js`

**9 × erros de código:**

| Arquivo:linha | Regra | Erro |
|---|---|---|
| `src/components/domain/AccountPrivacyPanel.tsx:126` | `react-hooks/purity` | `Date.now()` chamado durante render (cooldown) |
| `src/components/domain/PostEditor.tsx:790` | `react-hooks/purity` | `Date.now()` no `min` do input datetime-local |
| `src/components/domain/EmailHistoryPanel.tsx:16` | `consistent-type-definitions` | `type` onde se espera `interface` |
| `src/components/domain/EmailPreferencesPanel.tsx:17` | `consistent-type-definitions` | idem |
| `src/infra/emailApi.ts:35` e `:42` | `consistent-type-definitions` | idem (×2) |
| `src/infra/goalsApi.ts:31` | `consistent-type-definitions` | idem |
| `src/infra/staffApi.ts:58` | `consistent-type-definitions` | idem |
| `src/pages/LoginPage.test.tsx:18` | `array-type` | `Array<T>` em vez de `T[]` |

**Warnings (593):** categorias predominantes — `console.*` em handlers, `any` em `infra/` e tests, complexidade cicломática (`errorMessage.ts` complexidade 46), regras React/hooks menores. Não bloqueiam; são registrados para acompanhamento.

## 2. Registro das alterações locais (trabalho de marca)

Todo o trabalho local recente é o **rebrand AgendAI → Agenda Já**, já commitado:

- FE: commit `4d74145` — 54 arquivos (UI, SEO, PWA, docs, screenshots, script de captura).
- BE (repo irmão): `03bb7af` (pré-existentes separados) + `c7283d9` (rebrand + cast `FiadoStatus`).
- Detalhamento completo (alterado × exceção técnica × histórico × pendências do usuário): **`docs/BRAND_INVENTORY.md`** deste repo e `agendai-back-end/docs/BRAND_INVENTORY.md`.
- Pendências bloqueadas em ação do usuário: env `EMAIL_FROM` no Render, display name da SA GCP, `git push` dos commits.

## 3. Estrutura por diretório (baseline de arquivos/LOC)

Fonte: `snapshot-before-restructure.md` (362 arquivos em `src/`, 74.610 LOC).

| Diretório | Arquivos |
|---|---|
| `src/components` (175: domain 115, ui 43, infra 11, marketing 4, pwa 2) | 175 |
| `src/pages` (incl. marketing) | 63 |
| `src/infra` | 59 |
| `src/utils` | 31 |
| `src/contexts` | 7 |
| `src/hooks` | 5 |
| `src/features` | 4 |
| `src/marketing` | 5 |

Arquivos maiores (risco de migração): `LandingPage.tsx` 2100 · `BillingTab.tsx` 1843 · `MasterAdminDashboard.tsx` 1765 · `OwnerFinancialPanel.tsx` 1582 · `LoginPage.tsx` 1538.

## 4. Referência visual

- Telas reais capturadas e versionadas: `public/screenshots/queue-real.png`, `public/screenshots/appointments-real.png`, `public/screenshots/reports-real.png`.
- Procedimento de recaptura completa (landing desktop/mobile × dark/light, painel, login, fila pública/staff, agenda, relatórios): `scripts/capture-screenshots.mjs` — exige stack local (compose database + redis, BE dev, FE dev na porta 3003) e login `demo.owner@agendai.local` / `admin123`.
- Política de tema registrada na captura: público é dark por design (`ThemeContext` força `dark` sem usuário logado); painel respeita preferência (`agendai:theme`).
- Comparação visual estruturada (regressão) passa a ser feita via Storybook visual tests a partir da Etapa 1.
