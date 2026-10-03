# Etapa 0 — Mapa: rotas, layouts, providers, estilos, code-splitting

Data: 2026-09-28 · Fonte: `src/App.tsx` (54 `<Route>`), `src/index.tsx`, `src/index.css`, `src/config/tabRegistry.ts`.

> **Atualização (Etapa 2):** entry e router moveram para `src/app/index.tsx` e `src/app/App.tsx`
> (o `index.html` referencia `/src/app/index.tsx`); os caminhos citados abaixo são os da Etapa 0.
> Conteúdo (rotas/providers/lazy) permanece idêntico.

## 1. Mapa de rotas (`App.tsx`, `<Routes>` plano — único layout aninhado é `/master`)

| rota | página (arquivo) | layout | lazy | guard | notas |
|---|---|---|---|---|---|
| `/` | LandingPage (`pages/LandingPage.tsx`, 2233L) | autossuficiente: MarketingNav+Footer+SeoHead | sim | — | gsap/ScrollTrigger |
| `/funcionalidades` `/ia-preditiva` `/agendamento` `/dashboard` `/sobre` `/contato` `/privacidade` `/termos` | `pages/marketing/*Page.tsx` (9) | autossuficiente | sim | — | sem wrapper comum |
| `/software-para-salao-de-beleza` +8 aliases SEO | CommercialIntentPage | autossuficiente | sim | — | 9 paths → 1 componente |
| `/queue`, `/queue/:id` | PublicHome | nenhum (header próprio) | sim | — | fila pública |
| `/agendamento/gerenciar` | PublicAppointmentManagePage | nenhum | sim | — | — |
| `/login`, `/cadastro` | LoginPage (1538L, `mode`) | nenhum | sim | — | 1 componente, 2 modos |
| `/esqueci-senha`, `/reset-password`, `/email-verificado`, `/bloqueado`, `/planos` | páginas auth/auxiliares | nenhum | sim | — | — |
| `/verificar-codigo` | `<Navigate to="/esqueci-senha">` | — | — | — | redirect |
| `/checkout` | CheckoutPage | nenhum | sim | `PrivateRoute [OWNER, MASTER_ADMIN]` | — |
| `/master` (pai) | **AdminLayout** (`domain/admin/AdminLayout.tsx`) | sidebar + `<Outlet/>` | sim | `PrivateRoute [MASTER_ADMIN]` | único layout aninhado |
| `/master` index, `/master/dashboard` | `<Navigate to="/master/work">` | — | — | — | redirect |
| `/master/{work,tickets,tickets/new,tickets/:id,tasks,tasks/new,tasks/:id,team,accounts,operations,audit,billing,referrals,crm}` | `pages/master-admin/*Page.tsx` (13) | AdminLayout | sim | MASTER_ADMIN (herdado) | Billing/Referrals/Crm são wrappers finos de `BillingTab` (80KB) / ReferralsTab / CrmBackfillPanel |
| `/app` | `<Navigate to="/app/overview">` | — | — | — | redirect |
| `/app/account` | `<Navigate to="/app/settings">` | — | — | — | redirect |
| `/app/:tab` | StaffDashboard (714L) | Header (topo) + StaffNavigation (base) — compostos **dentro** da página, não como Route layout | sim | `PrivateRoute [OWNER, EMPLOYEE, MASTER_ADMIN]` | **1 rota para as 23 tabs**; resolução via `config/tabRegistry.ts` |
| `/minha-conta` | ClientPortalPage (23L) | nenhum | sim | **nenhum (público)** | login autogerido |
| `/saloes/:id/resultados[/:resultId]` | ShowcasePage (12L → ShowcasePublicPage) | nenhum | sim | nenhum | — |
| `*` | NotFoundPage | nenhum | sim | — | — |

**tabRegistry** (`src/config/tabRegistry.ts`): 4 grupos / 23 tabs — `operacao` (overview, onboarding, queue, appointments, clients, products), `gestao` (services, team, reports, finance, profit, equipment), `crescimento` (posts, showcase, link, referrals, organizations), `conta` (settings, support, subscription, profile). Exporta `TAB_GROUPS`, `ALL_TAB_IDS`, `MOBILE_PRIMARY_TAB_IDS`, `canAccessTab(roles+permissions)`, `canAccessTabByMode(HYBRID|QUEUE_ONLY|APPOINTMENTS_ONLY)`, `getDefaultTab`, `getPrimaryTabForMode`. Consumido só por `StaffDashboard.tsx` e `StaffNavigation.tsx` → **auth de tab fica dentro da página, não no router**.

## 2. Layouts e providers

**Layouts (4 + 2 chrome):**
- `domain/admin/AdminLayout.tsx` (139L) — sidebar/topbar master-admin, lazy, aninhado na rota.
- `ui/Header.tsx` (92L) — top bar do app (logo, avatar, trial, logout); só importado por StaffDashboard.
- `ui/StaffNavigation.tsx` (333L) — nav inferior do app via tabRegistry; só StaffDashboard.
- `marketing/MarketingNav.tsx` (188L) + `MarketingFooter.tsx` (155L) — repetidos manualmente em **12 páginas** — sem wrapper/layout de rota.
- `marketing/SeoHead.tsx` — meta por página (11 páginas; não usada em EmailVerified).
- Sem layout para públicas (queue, minha-conta, showcase) nem para auth (login/plans/checkout).

**Árvore de providers** — ordem (externo→interno) em `src/index.tsx`:

1. `React.StrictMode`
2. `BrowserRouter`
3. `PwaInstallProvider` (`contexts/PwaInstallContext.tsx`, 80L) — estado de install prompt
4. `BarbershopFiltersProvider` (42L) — filtros de lista
5. `AuthProvider` (284L) — sessão/roles, boot timeout guard
6. `ThemeProvider` (55L) — classe `.dark` + localStorage (`agendai:theme`)
7. `SubscriptionProvider` (111L) — plano/trial/paywall
8. `BarbershopProvider` (362L) — dados da barbearia
9. `SchedulingProvider` (463L) — fila/agendamentos + WS com fallback de polling
10. `<App/>`

Os 7 contexts envolvem **todas** as rotas globalmente (inclusive marketing/landing), embora a maioria só seja consumida por `/app/*` e `/master/*`.

**Toaster: nenhum na raiz** — `ui/Toast` é estado local por página (StaffDashboard:291, LoginPage, PublicHome + 7 painéis/páginas).

**Componentes de efeito colateral na raiz** (dentro de `App.tsx`, fora de Routes): `ScrollToTop`, `ReferralRefCapture`, `AccessBlockedListener`, `CookieConsent`, `AnalyticsListener`, `PwaUpdatePrompt`; depois `ErrorBoundary` → `Suspense` único (fallback `<Loader/>`) → `Routes`.

## 3. Entry point

- **Não existe `main.tsx`** — entry é `src/index.tsx` (40L), montado pelo `index.html`.
- Ordem: react → react-dom/client → BrowserRouter → `./index.css` → `./App` → 7 providers → `createRoot().render(<StrictMode>)`.
- StrictMode: sim. PWA: `registerSW` não está no entry — registro via `useRegisterSW` em `components/pwa/PwaUpdatePrompt.tsx` (vite-plugin-pwa `injectRegister:'null'`, `registerType:'prompt'`).
- Analytics: não importa no entry; `components/infra/AnalyticsListener.tsx` + `infra/analytics.ts` (gtag/Google Ads lazy, `send_page_view:false`) via listener do App.
- `index.html`: Google Fonts (DM Sans + Syne), IIFE anti-flash de tema (lê `agendai:theme`/`bq:theme`), `__RECAPTCHA_SITE_KEY__`, meta/ícones PWA.

## 4. Classificação de estilos

**Só 3 arquivos CSS no app:**

| arquivo | linhas | conteúdo |
|---|---|---|
| `src/index.css` | 356 | global: import Tailwind v4, dark variant, tokens, `@theme`, keyframes, base html/body, scrollbars, overrides de terceiros |
| `src/components/ui/Skeleton.css` | 20 | `.skeleton*`, keyframe `skeleton-pulse`, reduced-motion (importado por `Skeleton.tsx`) |
| `src/components/ui/ThemedCalendar.css` | 81 | theming react-day-picker (`.rdp-*`; importa `react-day-picker/style.css`) |

**Config Tailwind v4 vive no CSS:** `@import 'tailwindcss'` (L1), `@custom-variant dark` (L8), `@theme inline` (L95, 27 `--color-*` mapeando `--ag-*`), `@theme` (L127, `--font-sans` DM Sans, `--font-display` Syne, `--animate-fade-in`). `tailwind.config.js` é stub vestigial do v3 (vazio) + `postcss.config.js` usa `@tailwindcss/postcss`.

**Custom properties:**
- `--ag-*` bloco light (`:root`, L15-53) e override dark (`.dark`, L58-88): `bg, surface, surface-2, border, border-strong, text-primary/secondary/muted, brand, brand-hover, action-primary(+hover/-fg), accent(+hover/-fg aliases), tertiary, support, action-secondary, selection, focus, danger, success, warning` + `--chart-1…5`.
- Bridges `--color-*` do Tailwind (27) espelhando os `--ag-*`.
- `--font-sans`, `--font-display`, `--animate-fade-in`.
- Component-scoped: `--rdp-*` (ThemedCalendar.css, ~13).

**Keyframes: 10** — 9 em `index.css` (`fade-in` + 8 `weather-*`) e 1 em `Skeleton.css`; 0 em tsx.

**Estilos globais/base em index.css:** `html`/`body`/`textarea`/`[role=button]`, bloco `prefers-reduced-motion`, `input[type=date]`+autofill, 4 regras `::-webkit-scrollbar`, `.ag-scroll`, `.no-scrollbar`, overrides de terceiros (Mercado Pago `.mp-secure-field`, reCAPTCHA `.grecaptcha-badge`, `body.recaptcha-visible`) e estilos de componente `.weather-image/.weather-effect` (L284-323) vivendo no sheet global.

**`<style>` inline em TSX:** só `ui/chart.tsx` (shadcn/recharts) e `ui/credit-card-form.tsx` (MP).

**Sem duplicação de sheets de token** (Skeleton/ThemedCalendar reusam `--ag-*`); riscos: tokens definidos 2× (light+dark), CSS de componente (weather) dentro do arquivo global, e diretórios `graphify-out/` dentro de `src/`.

## 5. Code-splitting

- **`React.lazy`: 36** — todos em `App.tsx` L13-48 (35 páginas incl. 9 marketing + 13 MasterAdmin + auth/públicas + `AdminLayout` + `StaffDashboard`). Zero lazy fora do App.
- **Imports estáticos em App (sempre no bundle principal): 9** — `PrivateRoute`, `AccessBlockedListener`, `CookieConsent`, `AnalyticsListener`, `ScrollToTop`, `ReferralRefCapture`, `Loader`, `ErrorBoundary`, `PwaUpdatePrompt`.
- **Suspense: 1** (App.tsx:60) — sem Suspense aninhado/paralelo.
- **Lacuna-chave:** `StaffDashboard.tsx` importa estaticamente **~55 painéis domain** → payload inteiro do app-shell carrega no primeiro acesso a `/app/*`; não existe split por tab. Mesmo padrão em MasterAdmin (`MasterAdminDashboard` 75KB, `BillingTab` 80KB) e `LandingPage` (100KB).
