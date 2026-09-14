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

- `contract:check` — `node scripts/check-api-contract.mjs`: compara método/caminho dos wrappers com as rotas registradas no backend irmão; sem servidor, banco ou segredos. Bloqueia novas divergências e exceções obsoletas.
- `contract:check:strict` — mesma checagem com `--strict`: reprova também as 77 divergências legadas inventariadas inicialmente. Não está verde enquanto essa dívida existir.
- `test:contract` — `node --test scripts/check-api-contract.test.mjs`: testa extração, mudanças de rota/método e sintaxe não suportada com fixtures temporárias.
- Procedimento de contrato, limites e smoke de deploy: [DELIVERY_CHECKS.md](DELIVERY_CHECKS.md).

- Há testes frontend (Vitest + Testing Library + Playwright). Não afirmar “sem testes”.
- Cobertura: `@vitest/coverage-v8` está declarado; os scripts acima **não** habilitam `--coverage` por padrão.
- CSS do projeto: **Tailwind v4 + tokens semânticos** em `src/index.css`. Não usar BEM/CSS Modules como padrão obrigatório.
