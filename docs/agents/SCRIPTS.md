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
| `test:e2e` | `playwright test` | testes | browsers Playwright instalados | E2E (`e2e/`) |
| `lint` | `eslint src --ext .ts,.tsx` | leitura | `npm install` | Lint |
| `lint:fix` | `eslint … --fix` | geração | `npm install` | Corrige lint autofixável |
| `audit:frontend-structure` | `node scripts/audit-frontend-structure.mjs` | leitura | Node | Auditoria estrutural |
| `format` | `prettier --write …` | geração | `npm install` | Formata fontes |
| `format:check` | `prettier --check …` | leitura | `npm install` | Verifica formatação |
| `docs:check` | `node scripts/check-docs.mjs` | leitura | Node | Valida inventários documentais |

## Observações

- Há testes frontend (Vitest + Testing Library + Playwright). Não afirmar “sem testes”.
- Cobertura: `@vitest/coverage-v8` está declarado; os scripts acima **não** habilitam `--coverage` por padrão.
- CSS do projeto: **Tailwind v4 + tokens semânticos** em `src/index.css`. Não usar BEM/CSS Modules como padrão obrigatório.
