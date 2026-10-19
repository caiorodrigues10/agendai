# AGENTS.md — Agenda Já Frontend

> **Ponto de entrada obrigatório** para qualquer IA neste repositório (`agendai/`).
> Este manual é autossuficiente: não depende da pasta externa do monorepo para entender o frontend.
> Codex e OpenCode usam este arquivo como entrada.

**Última revisão documental:** 2026-09-08 (baseada no código atual).

---

## 0. Regras essenciais (leia antes de editar)

1. **Não reinventar:** confirme `src/infra/*Api.ts`, contexts e componentes em `components/ui` / `domain` antes de criar módulos.
2. **HTTP só via `apiClient` / `*Api.ts`.** Tratar `ApiError` e códigos `SUBSCRIPTION_REQUIRED` / `CPF_BLOCKED` / `DASHBOARD_REQUIRED`.
3. **Formulários do painel:** `react-hook-form` + Zod (`schemas.ts`) + `Field` / `SmartSelect` (`Controller`).
4. **Tema:** tokens semânticos (`bg-bg`, `text-text-primary`, …) em código novo do painel. Landing pode usar cores hardcoded de marketing.
5. **Testes existem:** Vitest + Testing Library + Playwright. Não afirmar ausência de testes.
6. **`agendai-nextjs` é outro projeto** — não misturar.
7. **Escopo mínimo;** não commit automático; não editar `.env` com segredos.
8. Antes de explorar código: seguir [docs/agents/GRAPHIFY.md](docs/agents/GRAPHIFY.md).

---

## 1. O que é este app

SPA **React 18 + Vite 6 + TypeScript** do SaaS Agenda Já (salões/barbearias/studios). Painel staff, fila/agenda pública, checkout de assinatura, master admin.

Stack resumida: React Router 6, Tailwind CSS v4, Framer Motion, Zod, react-hook-form, Vitest, Playwright. Estado global = Context API (sem Redux/React Query).

---

## 2. Como trabalhar

```
1. Ler este AGENTS.md + inventários em docs/agents/
2. graphify query/explain/path no domínio
3. Confirmar consumidores no código
4. Alteração focada
5. npm run typecheck && npm test (e lint/e2e conforme risco)
6. npm run docs:check se mudou package.json/scripts/estrutura documentada
7. graphify update quando aplicável (agente principal)
```

Inventários:

| Doc | Conteúdo |
|---|---|
| [STRUCTURE.md](docs/agents/STRUCTURE.md) | Árvore e responsabilidades |
| [DOMAIN_MAP.md](docs/agents/DOMAIN_MAP.md) | UI → API → backend |
| [PACKAGES.md](docs/agents/PACKAGES.md) | Dependências diretas |
| [SCRIPTS.md](docs/agents/SCRIPTS.md) | Scripts npm |
| [BUSINESS_RULES.md](docs/agents/BUSINESS_RULES.md) | Invariantes na UI |
| [ARCHITECTURE.md](docs/agents/ARCHITECTURE.md) | Organização + SOLID |
| [PERMISSIONS_MATRIX.md](docs/agents/PERMISSIONS_MATRIX.md) | Papéis × permissões × telas × operações (front × API) |
| [GRAPHIFY.md](docs/agents/GRAPHIFY.md) | Procedimento Graphify / subagentes |

---

## 3. Comandos frequentes

Diretório: **`agendai/`**.

```bash
npm install
npm run dev
npm run typecheck
npm test            # suíte do projeto 'app' (sem Storybook), limitada a 2 workers
npm run lint        # com cache (--cache); lint de alterados: npm run lint:changed
npm run docs:check
npm run build
```

**Testes durante o desenvolvimento (não pesar a máquina):**

```bash
npm run test:changed   # só arquivos alterados vs. HEAD (vitest --changed)
npm run test:related   # testes relacionados aos arquivos informados (vitest related)
```

Suíte completa (`npm test`) **só no CI**. Storybook/Playwright/visual ficam fora do
padrão: `npm run test:storybook`, `npm run test:e2e`, `npm run test:visual`.

Detalhes e efeitos: [SCRIPTS.md](docs/agents/SCRIPTS.md).

Env (nomes): ver [DOMAIN_MAP.md](docs/agents/DOMAIN_MAP.md) e `.env.example`.

### E2E do painel master (`e2e/master/`)

Specs com **login real** no master (sem token forjado), contra o dev server com proxy `/api` → backend `:3333`:

```bash
E2E_BASE_URL=http://127.0.0.1:3003 \
E2E_MASTER_EMAIL=... E2E_MASTER_PASSWORD=... \
npx playwright test e2e/master --project=desktop-chromium
```

- `E2E_BASE_URL` **obrigatório** (o `preview` `:4173` não tem proxy de `/api`).
- `E2E_MASTER_*` = usuário criado pelo seed (`SEED_MASTER_ADMIN_EMAIL`/`SEED_MASTER_ADMIN_PASSWORD`).
- `E2E_OWNER_*` (opcional) = OWNER de teste para `acesso-negado.spec.ts`; sem ele, o spec é pulado.
- Sem essas envs, `playwright.config.ts` ignora `e2e/master/` (CI e `npm run test:e2e` seguem verdes); specs rodam só no projeto `desktop-chromium`.
- Backend local: `LOGIN_RATE_LIMIT_MAX` (ex.: `60`) no `.env` do backend. O access token vive só em memória, então **cada load renova a sessão** e a suíte inteira faz ~40 chamadas de auth por minuto (o limite padrão é 10; em produção a env é ignorada).
- Sessão reaproveitada entre specs: `e2e/master/helpers.ts` grava cookie HTTP-only + `localStorage` em cache temporário **ao fim de cada teste** (fixture automática) e valida o cache contra o backend antes de reusá-lo; cache inválido cai para login normal.

---

## 4. Arquitetura (resumo)

- Páginas → domain components → contexts/hooks → `infra/*Api` → backend `/api`.
- UI compartilhada em `components/ui` (incluindo `Field`, `SmartSelect`).
- Detalhes: [ARCHITECTURE.md](docs/agents/ARCHITECTURE.md).

---

## 5. Documentos legados

- `docs/ai-rules.md` — parcialmente genérico; **este AGENTS.md prevalece** (CSS = Tailwind tokens, não BEM obrigatório; cobertura 80% não é meta universal).
- Outros docs em `docs/` são históricos/planos; validar contra o código.

---

## 6. Ambiente de testes (vitest) — CPU/memória sob controle

O `vitest.config.ts` usa `pool: 'forks'` (`maxForks: 2`, `fileParallelism: false`,
`maxWorkers: 2`, `reporters: ['dot']`, `clearMocks`/`restoreMocks`, `css: false`,
coverage desligado por padrão). `npm test` roda **só o projeto `app`** — o projeto
`storybook` (browser + Playwright) só sobe via `npm run test:storybook`. Scripts de
teste usam `NODE_OPTIONS=--max-old-space-size=2048` para não estourar heap.

- **Durante o desenvolvimento:** `npm run test:changed` / `npm run test:related`.
- **Suíte completa (`npm test`):** só no CI / antes de subir PR.
- O pool antigo `threads` travava após os testes (handles abertos; ~15 min de
  debug em 2026-09-19) — `forks` já é o default e o workaround `--pool=forks`
  não é mais necessário.

---

## 7. Checklist rápido

- [ ] Endpoint já existe no wrapper certo?
- [ ] Tokens de tema / `Field` reutilizados?
- [ ] Erros de assinatura tratados?
- [ ] Testes tocados quando há lógica?
- [ ] `docs:check` se inventário mudou?
