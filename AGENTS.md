# AGENTS.md — AgendAI Frontend

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

SPA **React 18 + Vite 6 + TypeScript** do SaaS AgendAI (salões/barbearias/studios). Painel staff, fila/agenda pública, checkout de assinatura, master admin.

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
| [GRAPHIFY.md](docs/agents/GRAPHIFY.md) | Procedimento Graphify / subagentes |

---

## 3. Comandos frequentes

Diretório: **`agendai/`**.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run lint
npm run docs:check
npm run build
```

Detalhes e efeitos: [SCRIPTS.md](docs/agents/SCRIPTS.md).

Env (nomes): ver [DOMAIN_MAP.md](docs/agents/DOMAIN_MAP.md) e `.env.example`.

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

## 6. Risco conhecido: Vitest `pool: 'threads'` trava após testes completarem

O `vitest.config.ts` usa `pool: 'threads'` com `fileParallelism: false`. Em combinação com o `jsdom` environment, o processo do vitest **não encerra sozinho** após todos os testes passarem — trava indefinidamente com handles abertos. Isso parece um hang, mas todos os testes já passaram.

**Workaround:** rodar com `--pool=forks` contorna o problema (todos os arquivos completam e o processo encerra normalmente). Trocar o pool default no config é uma decisão de projeto; por enquanto, documentar aqui basta.

Custo real: já causou ~15 min de debug desnecessário em 2026-09-19.

---

## 7. Checklist rápido

- [ ] Endpoint já existe no wrapper certo?
- [ ] Tokens de tema / `Field` reutilizados?
- [ ] Erros de assinatura tratados?
- [ ] Testes tocados quando há lógica?
- [ ] `docs:check` se inventário mudou?
