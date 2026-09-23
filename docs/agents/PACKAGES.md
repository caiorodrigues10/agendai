# Inventário de pacotes — Frontend (agendai)

> Fonte: `package.json`. Transitivas ficam no lockfile.
> Atualize no mesmo PR que alterar dependências.

**Versão do app:** `0.0.0`

## dependencies

| Pacote | Versão | Categoria | Finalidade | Evidência de uso |
|---|---|---|---|---|
| `@floating-ui/react` | `^0.27.20` | UI | Posicionamento de dropdowns/popovers (useFloating, FloatingPortal) | src/components/ui/SmartSelect.tsx |
| `@hookform/resolvers` | `^3.3.4` | Formulários | Bridge Zod ↔ react-hook-form | zodResolver nos formulários do painel |
| `class-variance-authority` | `^0.7.1` | UI | Variantes de classe CSS | componentes UI / utilitários |
| `clsx` | `^2.1.1` | UI | Concatenação condicional de classes | com tailwind-merge |
| `framer-motion` | `^12.38.0` | UI | Animações React | landing e painel |
| `gsap` | `^3.15.0` | UI | Animações avançadas marketing | páginas marketing |
| `react` | `18.3.1` | Core | Biblioteca UI | toda a aplicação |
| `react-day-picker` | `^10.0.1` | UI | Seletor de datas | ThemedCalendar / agenda |
| `react-dom` | `18.3.1` | Core | Renderização DOM | index.tsx |
| `react-focus-lock` | `^2.13.7` | A11y | Foco em modais | diálogos/modais |
| `react-hook-form` | `^7.55.0` | Formulários | Estado e validação de formulários | ServiceForm, TeamManager, produtos, financeiro, etc. |
| `react-icons` | `^5.7.0` | UI | Biblioteca de ícones | componentes domain/ui e páginas (react-icons/lu e demais conjuntos) |
| `react-router-dom` | `^6.28.0` | Roteamento | Rotas SPA | App.tsx |
| `recharts` | `^3.10.0` | UI | Gráficos | dashboard financeiro / master admin |
| `tailwind-merge` | `^3.6.0` | UI | Merge de classes Tailwind | utilitário cn / UI |
| `zod` | `3.22.4` | Validação | Schemas de formulário | src/schemas.ts |

## devDependencies

| Pacote | Versão | Categoria | Finalidade | Evidência de uso |
|---|---|---|---|---|
| `@playwright/test` | `^1.62.1` | Testes | Runner E2E | npm run test:e2e / e2e/ |
| `@tailwindcss/postcss` | `^4.1.18` | CSS | Plugin PostCSS Tailwind v4 | postcss config |
| `@testing-library/jest-dom` | `^7.0.1` | Testes | Matchers DOM | src/tests/setup.ts |
| `@testing-library/react` | `^16.3.2` | Testes | Render de componentes | *.test.tsx |
| `@testing-library/user-event` | `^14.6.3` | Testes | Interação em testes | *.test.tsx |
| `@types/node` | `^22.14.0` | Tipos | Tipagens Node | tsc |
| `@types/react` | `^19.2.17` | Tipos | Tipagens React | tsc |
| `@types/react-dom` | `^19.2.4` | Tipos | Tipagens React DOM | tsc |
| `@typescript-eslint/eslint-plugin` | `^8.68.0` | Lint | Regras ESLint TS | eslint |
| `@typescript-eslint/parser` | `^8.68.0` | Lint | Parser ESLint TS | eslint |
| `@vitejs/plugin-react` | `^5.0.0` | Build | Plugin React do Vite | vite.config |
| `@vitest/coverage-v8` | `^4.1.10` | Testes | Cobertura Vitest | declarado; scripts padrão não passam --coverage |
| `autoprefixer` | `^10.4.24` | CSS | Prefixos CSS | postcss |
| `eslint` | `^9.39.5` | Lint | Linter | npm run lint |
| `eslint-config-prettier` | `^10.1.8` | Lint | Compat Prettier | eslint config |
| `eslint-plugin-jsx-a11y` | `^6.10.2` | Lint | A11y JSX | eslint |
| `eslint-plugin-react-hooks` | `^7.1.1` | Lint | Regras de Hooks | eslint |
| `jsdom` | `^26.1.0` | Testes | Ambiente DOM Vitest | vitest.config.ts |
| `playwright` | `^1.62.1` | Testes | Browser automation | test:e2e |
| `postcss` | `^8.5.6` | CSS | Pipeline CSS | Tailwind |
| `prettier` | `^3.9.6` | Formatação | Formatador | npm run format |
| `tailwindcss` | `^4.1.18` | CSS | Utility CSS v4 | index.css / tokens |
| `typescript` | `~5.8.2` | Core | Compilador TS | npm run typecheck |
| `typescript-eslint` | `^8.68.0` | Lint | Flat-config ESLint TS | eslint |
| `vite` | `^6.2.0` | Build | Bundler/dev server | npm run dev/build |
| `vite-plugin-pwa` | `^1.3.0` | PWA | Service worker / manifest | vite.config |
| `vitest` | `^4.1.10` | Testes | Testes unitários | npm test |

