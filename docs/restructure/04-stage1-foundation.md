# Etapa 1 — Fundações, tokens, temas e Storybook

> Status: **concluída** (validações §5). Anterior: [00-baseline](00-baseline.md), [01-component-inventory](01-component-inventory.md), [02-map](02-map.md), [03-migration-matrix](03-migration-matrix.md).

## 1. CSS dividido (fontes em `src/styles/`)

`src/index.css` virou um orquestrador de 5 linhas (imports + `@custom-variant dark`):

| Arquivo | Conteúdo |
|---|---|
| `src/styles/tokens.css` | `@theme`, CSS custom properties (fonte de verdade dos tokens) |
| `src/styles/base.css` | reset, tipografia base, keyframes, utilitários globais |
| `src/styles/vendors.css` | estilos de dependências (day-picker etc.) |
| `src/styles/features/weather.css` | feature-scoped (landing/clima) |

**Prova da divisão:** no momento do split, `dist/assets/index-Dm6g_N5j.css` teve SHA256
`C1DD82A0D1CD87089D5EE51D478CA287C00FE878D54AF995871DAFDA7EE97EE0` — byte a byte idêntico ao do
build do HEAD pré-split (rebuild do HEAD reproduz o mesmo hash → pipeline de verificação validado).

**Divergência atual (esperada):** build de agora → `index-CROKOM-Q.css`, SHA256
`DCC658244BCAA984CAF021A0A2278806A773564CBC158020C8F80B8F9A9AEFA8` (211.664 B, precache
82 entries / 2580,19 KiB vs 2579,63 KiB do baseline, **+0,56 KiB**). Causa identificada: o
Tailwind v4 passou a escanear os arquivos novos (`*.stories.tsx`, `.storybook/preview.tsx`) e
gerou utilities aditivos que só existem nas stories (`text-[10px]`, `grid-cols-5`,
`sm:grid-cols-3`, `bg-success/15`…). É **apenas aditivo** — nada foi removido das regras do app.
Registrado como dívida D-002 em [debts.md](debts.md).

## 2. Separação de tema × política de auth

| Módulo | Papel |
|---|---|
| `src/contexts/theme/ThemePreferenceContext.tsx` | Provider **puro**: `Theme`, `THEME_STORAGE_KEY='agendai:theme'`, migração de `bq:theme`, persistência |
| `src/contexts/ThemeContext.tsx` | `ThemeProvider` = preferência + `ThemePolicyProvider`; `resolvedTheme = auth?.user ? theme : 'dark'`; `applyDocumentTheme` idêntico ao anterior |
| `src/contexts/AuthContext.tsx` | ganhou `useAuthOptional()` (não lança) para o policy consumir auth sem import inverso |

- API pública inalterada: `ThemeProvider`, `useTheme`, `Theme` — `src/tests/setup.ts` continua
  mockando `../contexts/ThemeContext` com a mesma superfície.
- Público segue **dark** por política; painel segue a preferência `agendai:theme` (chave preservada).

## 3. Storybook 10.6 (local, sem SDKs externos)

- `.storybook/main.ts` — stories de `src/**/*.stories.*`; addons: `@chromatic-com/storybook`,
  `@storybook/addon-vitest`, `-a11y`, `-docs`, `-mcp`; **sem** SW/analytics/reCAPTCHA/pagamentos;
  `process.env.STORYBOOK='true'` no topo → `vite.config.ts` só registra `VitePWA` quando
  `!process.env.STORYBOOK` (build do app inalterado; `vitest.config.ts` não carrega `vite.config.ts`).
- `.storybook/preview.tsx` — importa `src/index.css`, decorator `ThemeDocument` aplica
  `.dark`/`colorScheme`/bg no `<html>`, toolbar `theme` dark/light (`initialGlobals`; `globals`
  não existe no type `Preview` da SB10), `layout: 'fullscreen'`, a11y `test: 'todo'`.
- `.storybook/preview-head.html` — fontes DM Sans/Syne + bg `var(--ag-bg)`.
- `tsconfig.json` — `include` com glob explícito `./.storybook/**/*.ts(x)` + `vitest.shims.d.ts`
  (include direto `".storybook"` não funciona: dir com ponto precisa de glob; necessário p/ eslint).
- `vitest.config.ts` — `projects`: `app` (jsdom, maxWorkers 2) + `storybook`
  (`@vitest/browser-playwright`, chromium, `sequence.groupOrder: 1` — sem isso, erro de
  `maxWorkers` divergente no mesmo groupOrder).
- Stories iniciais (exemplos template do `src/stories/` removidos):
  `src/components/ui/Button.stories.tsx` (título `UI/Button`, 7 histórias, tags `autodocs`+`test`) e
  `src/styles/TokensGallery.stories.tsx` (título `Fundações/Tokens`).
- Scripts novos: `storybook`, `build-storybook`, `test:storybook`, `postinstall` (§4).

### Correção upstream embutida (dívida D-001)

O guard gerado pelo `@storybook/addon-vitest` compara
`convertToFilePath(import.meta.url).includes(testPath)` e `convertToFilePath` só decodificava
`%20` — em paths não-ASCII (`Programação`) o guard nunca casa e o Vitest reporta
`No test suite found` silenciosamente (issue upstream **storybookjs/storybook#36045**).

- Fix aplicado via `scripts/patch-storybook-vitest-paths.mjs` (idempotente, decodifica com
  `decodeURIComponent` + fallback), roda em `postinstall` e limpa `node_modules/.cache/storybook`.
- Remover quando a issue for corrigida upstream.

## 4. Correções de tooling para manter o gate

- `eslint.config.js` — ignorados `storybook-static/` (artefato, 18 erros de parsing) e `scripts/`
  (`*.mjs` fora do `tsconfig` geram erro de `parserOptions.project` pré-existente × 6; agora × 7
  incluindo o patch novo) → **lint caiu de 17 → 11 erros**, warnings inalterados (593).
- `docs/agents/PACKAGES.md` + `docs/agents/SCRIPTS.md` — 9 pacotes e 4 scripts novos catalogados
  (exigência do gate `docs:check`).

## 5. Gate da Etapa 1

| Check | Baseline (Etapa 0) | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 17 err / 593 warn | **11 err / 593 warn** | ✓ (melhorou) |
| `vitest run` | 137/137 (35 arq.) | **145/145 (37 arq.)** = 137 app + 8 stories | ✓ |
| `npm run build` | 82 precache / 2579,63 KiB | **82 / 2580,19 KiB** | ✓ (Δ §1) |
| `node scripts/check-docs.mjs` | OK | **OK** | ✓ |
| `npm run build-storybook` | — | **OK** (`storybook-static/`) | ✓ novo |
| `npx vitest run --project storybook` | — | **OK** (2 arq., 8 testes) | ✓ novo |

## 6. Próximo

Etapa 2 (tooling/fila): conferir `storybook dev` no navegador, dívidas D-001/D-002 em
[debts.md](debts.md), e seguir para scaffold dos diretórios `src/` conforme
[03-migration-matrix](03-migration-matrix.md) (fila de componentes 0 consumidores primeiro).
