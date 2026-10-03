# Estrutura — Frontend (`agendai`)

Árvore relevante (exclui `node_modules`, `dist`, caches, backups e artefatos Graphify).

```
agendai/
├── AGENTS.md                 ← ponto de entrada para IAs
├── CLAUDE.md / GEMINI.md
├── package.json
├── vite.config.* / vitest.config.ts / playwright.config.*
├── .storybook/               ← config Storybook + test-runner visual
├── visual-regression/        ← snapshots de regressão visual (jest-image-snapshot)
├── e2e/                      ← Playwright
├── scripts/                  ← auditorias, check-docs, test:visual, patch storybook
├── docs/
│   ├── agents/               ← inventários deste manual
│   ├── restructure/          ← plano e status da reestruturação por etapas
│   ├── ai-rules.md           ← legado (aponta para AGENTS.md)
│   └── …
└── src/
    ├── app/                  ← index.tsx (providers) + App.tsx (rotas)
    ├── index.css             ← orquestrador (importa styles/*)
    ├── styles/               ← tokens, base, vendors, features/weather
    ├── mocks/                ← handlers MSW (Storybook/testes)
    ├── schemas.ts            ← Zod (formulários)
    ├── types.ts
    ├── layouts/
    │   ├── admin/             ← AdminLayout (rota /master)
    │   ├── app/               ← AppLayout, Header, StaffNavigation (painel)
    │   └── marketing/         ← MarketingLayout (SeoHead + fundo + Nav + Footer; 12 páginas)
    ├── features/
    │   ├── queue/             ← piloto de feature (barrel index.ts; padrão p/ demais áreas)
    │   ├── clients/           ← AddCustomerForm, ServiceCard, ClientsTab, ClientsManager, ClientProfileSheet
    │   ├── appointments/      ← Scheduler, Calendar, BookingModal, BookPackageSessionsModal
    │   ├── onboarding/        ← OnboardingChecklist, ActivationChecklist
    │   ├── crm/               ← CrmIntelligencePanel, CrmMergePanel(+test), CrmBackfillPanel(+test)
    │   ├── shop/              ← ShopProfile, ShopFloorControls
    │   ├── catalog/           ← CatalogManager, ServiceManager, ServiceForm, PackageCatalog, CategoryManager(+test)
    │   ├── products/          ← ProductsHub + 7 painéis/modais + productMoney/productStock (Etapa 6b)
    │   ├── finance/           ← CashPanel, FinancialDashboard, OwnerFinancialPanel, ProfitEngine, Weather, DemandAlert + barrel (Etapa 5b)
    │   ├── goals/ loyalty/ waitlist/ recurring/ recommendations/ equipment/ deposits/
    │   │                      ← painéis do StaffDashboard com barrel próprio (Etapa 5b)
    │   ├── settings/          ← SettingsManager (+ ShopCityField, WeatherForecastCard, AppointmentPolicy,
    │   │                          SalonWhatsAppConnection, BusinessSegmentSection, OperationModeSection extraídos),
    │   │                          AccountPrivacy, EmailHistory/Preferences, ProfileSettings, ProfileAvatar,
    │   │                          QueueAlertSettings + barrel (Etapa 6c)
    │   ├── team/ support/ organizations/ referrals/
    │   │                      ← TeamManager; SupportPanel + support/* (+test); OrganizationsPanel,
    │   │                          MultiUnitDashboard (+test); OwnerReferralsPanel, ReferralTierBadge,
    │   │                          ShareReferralButton — barrels próprios (Etapa 6c)
    │   ├── posts/             ← PostsManager, PostEditor, PostPreviewBox + objectives.ts unificado (Etapa 6d)
    │   ├── showcase/          ← ShowcasePanel, ShowcasePublicPage, PublicLinkPanel (Etapa 6d)
    │   ├── notifications/     ← OwnerNotificationsPanel, NotificationDeliveriesPanel, NotificationHealthPanel (Etapa 6d)
    │   ├── subscription/      ← OwnerSubscriptionPanel (cancel → ModalShell), TrialExpiredPaywallModal (Etapa 6d)
    │   ├── client-portal/     ← ClientPortalDashboard, ClientPortalLogin (Etapa 6d)
    │   ├── billing/           ← BillingTab (orquestrador) + 7 seções/badges extraídos de pages/ (Etapa 7)
    │   └── marketing/         ← PricingPersuasionCharts (preços unificados em src/marketing/planPrices.ts) (Etapa 6d)
    ├── components/
    │   ├── ui/               ← Field, SmartSelect, Toast, ConfirmDialog, …
    │   ├── patterns/         ← Card, Tabs, Tooltip, StatCard, ModalShell, states/, skeletons/
    │   ├── domain/           ← fluxos do painel (fila, clientes, produtos, …)
    │   ├── marketing/        ← nav/landing
    │   └── infra/            ← ErrorBoundary, listeners, ThemeToggle, PWA
    ├── contexts/             ← Auth, Subscription, Barbershop, Scheduling, Theme, …
    ├── hooks/                ← usePermissions
    ├── infra/                ← apiClient + *Api.ts (única camada HTTP)
    ├── pages/                ← rotas (StaffDashboard, Login, PublicHome, master-admin, marketing)
    ├── services/             ← geminiService (heurística local)
    ├── utils/ / lib/ / config/
    └── tests/                ← setup Vitest
```

## Fora do escopo deste frontend

- **`agendai-nextjs/`** (pasta irmã no workspace): projeto separado. Não misturar arquivos/imports com este Vite app.
- Pasta externa do monorepo e `agendai-back-end/` não são necessárias para ler este `AGENTS.md`, mas a API consumida vive no backend.

## Componentes UI compartilhados (reusar antes de criar)

**`components/ui`:** `Avatar`, `chart`, `ConfirmDialog`, `ConsentCheckbox`, `credit-card-form`, `DynamicIcon`, `EmptyState`, `Field`, `Loader`, `Logo`, `PaginationBar`, `PasswordInput`, `SmartSelect`, `StatusBadge`, `ThemedCalendar`, `Toast`.

**`components/patterns`:** `Card` (+Header/Title/Body), `ModalShell` (shell único dos modais), `Tabs`, `Tooltip`, `StatCard`, `DataTableState`/`SectionError` (trio estados), `skeletons/` (base + variantes + composições de domínio).

**`components/infra`:** `ThemeToggle`, `PwaInstallCard`, `PwaUpdatePrompt` além dos listeners/boundaries. **`layouts/app`:** `AppLayout`, `Header`, `StaffNavigation`. **`layouts/admin`:** `AdminLayout`. **`layouts/marketing`:** `MarketingLayout` (forwardRef; props `title/description/path/jsonLd`, `wrapperClassName`, slots `background`/`afterFooter`).

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

`apiClient`, `authApi`, `authStorage`, `barbershopApi`, `schedulingApi`, `clientsApi`, `crmApi`, `packagesApi`, `productsApi`, `financialApi`, `commissionsApi`, `paymentsApi`, `plansApi`, `subscriptionsApi`, `adminApi`, `usersApi`, `notificationsApi`, `referralsApi`, `contactApi`, `realtimeWs`, `clientPortalApi`, `catalogApi`, `pricingApi`, `purchasingApi`, `corporateApi`, `publicProductsApi`.

**Regra:** novas chamadas HTTP só via `*Api.ts` / `apiClient` — nunca `fetch` solto nas páginas.
