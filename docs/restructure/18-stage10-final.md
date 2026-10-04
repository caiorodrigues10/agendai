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

Não fazem parte do gate: `test:e2e` (Playwright exige servidor local), a11y (informativo — D-005), prettier `format:check`.

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

- **Gate/D-003:** 9 erros de lint (4 parsing e2e, 5 de código).
- **Cobertura/D-005:** a11y informativo (~1 violação/story).
- **Adoção story-first:** D-007 (OwnerFinancialPanel), D-008 (stories pendentes), D-009 (ClientProfileSheet), D-010 (checkout full-screen — `credit-card-form` já removido), D-011 (PostEditor), D-014 (states trio — skeletons órfãos já removidos).
- ~~Settlement (sanção)~~ → **executado** (0 arquivos mortos; ver [15](15-section6-settlement.md)).
- **Budget/D-002:** −50 KiB disponíveis no CSS via `@source not` após restyle de39 stories.
- **Persistência/D-015:** rename de `barber_customer_id` (passo 1 feito); D-016 (`draftKey` duplicado, aguarda PostEditor externo).
- **D-001/D-004/D-006/D-013:** monitoramento contínuo (patches Storybook, ACL SWC, flake, data relativa).

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
