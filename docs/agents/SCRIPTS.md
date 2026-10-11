# Inventário de scripts — Frontend (`agendai`)

> Diretório de execução: raiz do repositório **`agendai/`** (não a pasta externa do monorepo).
> Atualize este arquivo no mesmo PR que alterar `package.json#scripts`.

| Script | Comando | Tipo | Pré-requisitos | Efeito |
|---|---|---|---|---|
| `dev` | `vite` | leitura/dev | `npm install` | Sobe Vite (proxy `/api` em dev) |
| `build` | `vite build` | geração | `npm install` | Gera `dist/` |
| `preview` | `vite preview` | leitura | build prévio | Serve build local |
| `test` | `vitest run` | testes | `npm install` | Unit/componentes (`src/**/*.{test,spec}.{ts,tsx}`) |
| `test:watch` | `vitest` | testes | `npm install` | Vitest em watch |
| `typecheck` | `tsc --noEmit` | leitura | `npm install` | Checagem TypeScript |
| `test:e2e` | `playwright test` | testes | browsers Playwright instalados; specs de `e2e/master/` exigem `E2E_BASE_URL` + `E2E_MASTER_EMAIL`/`E2E_MASTER_PASSWORD` | E2E (`e2e/`). Sem `E2E_BASE_URL` o `webServer` faz `build` + `preview` em `127.0.0.1:4173`; com a env aponta para o servidor informado |
| `lint` | `eslint src --ext .ts,.tsx` | leitura | `npm install` | Lint |
| `lint:fix` | `eslint … --fix` | geração | `npm install` | Corrige lint autofixável |
| `audit:frontend-structure` | `node scripts/audit-frontend-structure.mjs` | leitura | Node | Auditoria estrutural |
| `format` | `prettier --write …` | geração | `npm install` | Formata fontes |
| `format:check` | `prettier --check …` | leitura | `npm install` | Verifica formatação |
| `docs:check` | `node scripts/check-docs.mjs` | leitura | Node | Valida inventários documentais |
| `contract:check` | `node scripts/check-api-contract.mjs` | leitura | backend irmão | Compara wrappers HTTP com rotas |
| `test:contract` | `node --test scripts/check-api-contract.test.mjs` | testes | Node | Testa o parser de contrato |
| `verify:delivery` | `node scripts/verify-delivery.mjs` | leitura | `npm install` | Encadeia docs, typecheck, contrato e Vitest (sem produção) |
| `storybook` | `storybook dev --no-open` | dev | `npm install` | Sobe Storybook local (porta 6006) |
| `build-storybook` | `storybook build` | geração | `npm install` | Gera `storybook-static/` (artefato de CI) |
| `test:storybook` | `vitest run --project storybook` | testes | `npm install` + browsers Playwright | Stories como testes (interação + a11y) |
| `test:visual` | `node scripts/run-visual-tests.mjs` | testes | `npm install` + browsers Playwright | Regressão visual (build Storybook + servidor estático + test-storybook); args extras p/ test-storybook (ex.: `--updateSnapshot`) |
| `postinstall` | `node scripts/patch-storybook-compat.mjs` | geração | `npm install` | Patches upstream do Storybook (paths não-ASCII #36045 e module.register/Jest #36116) |

## Observações

- `contract:check` — `node scripts/check-api-contract.mjs`: compara método/caminho dos wrappers com as rotas registradas no backend irmão; sem servidor, banco ou segredos. Bloqueia novas divergências e exceções obsoletas.
- `contract:check:strict` — mesma checagem com `--strict`. Com `entries: []` em `api-contract-debt.json`, equivale ao check normal.
- `test:contract` — `node --test scripts/check-api-contract.test.mjs`: testa extração, mudanças de rota/método e sintaxe não suportada com fixtures temporárias.
- Procedimento de contrato, limites e smoke de deploy: [DELIVERY_CHECKS.md](DELIVERY_CHECKS.md).

- Há testes frontend (Vitest + Testing Library + Playwright). Não afirmar “sem testes”.
- Cobertura: `@vitest/coverage-v8` está declarado; os scripts acima **não** habilitam `--coverage` por padrão.
- CSS do projeto: **Tailwind v4 + tokens semânticos** em `src/index.css`. Não usar BEM/CSS Modules como padrão obrigatório.
