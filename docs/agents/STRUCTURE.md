# Estrutura — Frontend (`agendai`)

Árvore relevante (exclui `node_modules`, `dist`, caches, backups e artefatos Graphify).

```
agendai/
├── AGENTS.md                 ← ponto de entrada para IAs
├── CLAUDE.md / GEMINI.md
├── package.json
├── vite.config.* / vitest.config.ts / playwright.config.*
├── e2e/                      ← Playwright
├── scripts/                  ← auditorias e check-docs
├── docs/
│   ├── agents/               ← inventários deste manual
│   ├── ai-rules.md           ← legado (aponta para AGENTS.md)
│   └── …
└── src/
    ├── index.tsx             ← providers
    ├── App.tsx               ← rotas
    ├── index.css             ← Tailwind v4 + tokens
    ├── schemas.ts            ← Zod (formulários)
    ├── types.ts
    ├── components/
    │   ├── ui/               ← Field, SmartSelect, Toast, ConfirmDialog, …
    │   ├── domain/           ← fluxos do painel (fila, clientes, produtos, …)
    │   ├── marketing/        ← nav/landing
    │   ├── pwa/
    │   └── infra/            ← ErrorBoundary, listeners
    ├── contexts/             ← Auth, Subscription, Barbershop, Scheduling, Theme, …
    ├── hooks/                ← usePermissions
    ├── infra/                ← apiClient + *Api.ts (única camada HTTP)
    ├── pages/                ← rotas (StaffDashboard, Login, PublicHome, MasterAdmin, marketing)
    ├── services/             ← geminiService (heurística local)
    ├── utils/ / lib/ / config/
    └── tests/                ← setup Vitest
```

## Fora do escopo deste frontend

- **`agendai-nextjs/`** (pasta irmã no workspace): projeto separado. Não misturar arquivos/imports com este Vite app.
- Pasta externa do monorepo e `agendai-back-end/` não são necessárias para ler este `AGENTS.md`, mas a API consumida vive no backend.

## Componentes UI compartilhados (reusar antes de criar)

`Avatar`, `chart`, `ConfirmDialog`, `ConsentCheckbox`, `credit-card-form`, `DataTableState`, `DynamicIcon`, `EmptyState`, `Field`, `Header`, `Loader`, `Logo`, `PaginationBar`, `PasswordInput`, `SectionError`, `SmartSelect`, `StaffNavigation`, `StatusBadge`, `ThemedCalendar`, `ThemeToggle`, `Toast`.

## Contexts

| Context | Responsabilidade |
|---|---|
| `AuthContext` | Sessão JWT, login/logout, perfil |
| `SubscriptionContext` | Assinatura/planos/bloqueio |
| `BarbershopContext` | Tenant, serviços, staff, settings |
| `SchedulingContext` | Fila/agenda + polling |
| `ThemeContext` | Claro/escuro |
| `BarbershopFiltersContext` | Filtros de listagem |
| `PwaInstallContext` | Instalação PWA |

## Wrappers HTTP (`src/infra/`)

`apiClient`, `authApi`, `authStorage`, `barbershopApi`, `schedulingApi`, `clientsApi`, `crmApi`, `packagesApi`, `productsApi`, `financialApi`, `commissionsApi`, `paymentsApi`, `plansApi`, `subscriptionsApi`, `adminApi`, `usersApi`, `notificationsApi`, `referralsApi`, `contactApi`, `realtimeWs`, `clientPortalApi`, `walletApi`, `catalogApi`, `pricingApi`, `purchasingApi`, `corporateApi`.

**Regra:** novas chamadas HTTP só via `*Api.ts` / `apiClient` — nunca `fetch` solto nas páginas.
