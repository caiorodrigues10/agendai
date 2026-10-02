# Etapa 2 — Scaffolding, MSW, gates e baseline visual

> Status: **concluída** (validações §6). Anterior: [04-stage1-foundation](04-stage1-foundation.md).

## 1. Entry/app shell

- `src/App.tsx` + `src/index.tsx` → **`src/app/`** (router + entry), conforme [02-map](02-map.md)/[03-migration-matrix](03-migration-matrix.md) §7.
- Imports relativos reescritos (`./components|./pages|./contexts` → `../…`); `index.html` aponta `/src/app/index.tsx`.
- `src/index.css` permanece em `src/` (orquestrador, Etapa 1).
- Prova: `tsc` 0, 145/145 testes, build 82 precache idêntico (2580,19 KiB) — rotas/lazy/providers byte-a-byte intactos.
- `layouts/` **não** foi criado vazio: primeiro arquivo migra na Etapa 4 (dirs vazios não são versionados). Barrels de features: só existe `features/finance/index.ts` (referência) — os demais nascem com a migração de cada área.
- Dívida: `src/marketing/` e `src/services/` são diretórios **vazios** remanescentes (sem arquivos) — remover na Etapa 9.

## 2. MSW (mock HTTP para stories/testes)

- `msw@2.15` instalado; `src/mocks/{handlers,server,browser}.ts`:
  - `handlers.ts` — lista vazia, fonte única dos handlers (exemplo documentado no próprio arquivo);
  - `browser.ts` — `setupWorker` p/ Storybook;
  - `server.ts` — `setupServer` p/ testes Node (padrão de uso documentado).
- Ativação **opt-in por story** via loader assíncrono no `.storybook/preview.tsx`:
  `parameters: { msw: true }` ou `{ msw: { handlers: [...] } }` (handlers resetados por story,
  `onUnhandledRequest: 'bypass'`). Stories sem o parâmetro não tocam o worker.
- Loader (e não decorator) porque decorators React precisam ser síncronos.
- Nenhum contrato HTTP alterado; nenhum teste existente passou a depender de rede.

## 3. Regressão visual (baseline da Etapa 2)

- `@storybook/test-runner@0.24.5` + `jest-image-snapshot@6.5.2`.
- `.storybook/test-runner.ts`: viewport fixo 1440×900, `reducedMotion`, `waitForPageReady`
  (fontes), CSS que zera animações/transições, screenshot por story id, limiar 2% (antialiasing).
- `scripts/run-visual-tests.mjs` (`npm run test:visual`): garante `storybook-static/`
  (rebuild se preciso; `--no-build` reusa), sirve estático em servidor Node próprio (porta 6060),
  roda `test-storybook` e propaga o exit code; args extras (ex.: `--updateSnapshot`) encaminhados.
- **Baseline gerada e verificada:** `visual-regression/__image_snapshots__/` — 8 PNGs;
  geração (`--updateSnapshot`) e comparação passaram 8/8. Diffs (`*-diff.png`) no `.gitignore`.
- Comportamento observado: o runner anuncia `Found 1 a11y violation` por story mas **não falha**
  (preview com `a11y.test: 'todo'` por decisão da Etapa 1) — investigar/sanar antes de virar
  `'error'` (backlog Etapa 3+).

## 4. Correções de ambiente Windows (SWC) e patches upstream

- **`@swc/core` (usado pelo test-runner) validava o DACL do cache nativo e reprovava** as ACLs
  herdadas deste ambiente (SIDs estranhos/`Authenticated Users` com Modify). `run-visual-tests.mjs`
  prepara `C:\swc-native-cache` com DACL restrito {usuário atual, Administradores, SYSTEM} e seta
  `SWC_NATIVE_BINDING_CACHE` (só Windows; respeita valor já definido). Cadeia `C:\` validada ok.
- **`scripts/patch-storybook-compat.mjs`** (renomeado de `patch-storybook-vitest-paths.mjs`,
  `postinstall`) agora aplica **2** patches idempotentes:
  1. **#36045** — `convertToFilePath` decodifica paths não-ASCII (guard do addon-vitest);
  2. **#36116** — `register()` do loader TS do storybook core envolvido em try/catch
     (jest ≥30.5 lança dentro do sandbox e derrubava todo o test-runner quando existe
     `.storybook/test-runner.*`); após o catch, o transform do próprio Jest cuida do TS.
  Ambos com `warn` se a assinatura mudar; registrar remoção quando corrigidos upstream (D-001).

## 5. Catálogos e docs

- `docs/agents/PACKAGES.md`: `@storybook/test-runner`, `msw`, `jest-image-snapshot`.
- `docs/agents/SCRIPTS.md`: `test:visual`, `postinstall` atualizado (script renomeado).
- `docs/restructure/02-map.md`: marcar entry como `src/app/index.tsx` (ver §6).
- `.gitignore`: `storybook-static`, `*storybook.log`, diffs de snapshot visual.

## 6. Gate da Etapa 2

| Check | Baseline (Etapa 0) | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 17 err / 593 warn | **11 err / 593 warn** | ✓ (teto novo desde Etapa 1) |
| `vitest run` | 137/137 | **145/145 (37 arq.)** | ✓ |
| `npm run build` | 82 precache / 2579,63 KiB | **82 / 2580,19 KiB** | ✓ (Δ stories, D-002) |
| `docs:check` | OK | **OK** | ✓ |
| `build-storybook` | — | **OK** | ✓ |
| `test:storybook` | — | **8/8** | ✓ |
| `test:visual` | — | **8/8** (baseline + comparação) | ✓ **novo** |

## 7. Próximo

Etapa 3: `components/ui` + `components/patterns` completos (Button↔accent, Card, Modal shell,
Tabs, Tooltip, StatCard, trio states, skeletons unificados) com stories de interação/a11y —
ver [03-migration-matrix](03-migration-matrix.md) §§1–3.
