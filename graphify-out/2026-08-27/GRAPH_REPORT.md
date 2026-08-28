# Graph Report - agendai  (2026-08-27)

## Corpus Check
- 128 files · ~99,378 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 847 nodes · 1765 edges · 66 communities (41 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `abfb3a7b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- StaffDashboard.tsx
- LoginPage.tsx
- OwnerFinancialPanel.tsx
- schedulingUtils.ts
- devDependencies
- CheckoutPage.tsx
- BillingTab.tsx
- dependencies
- MasterAdminDashboard.tsx
- compilerOptions
- adminApi.ts
- App.tsx
- OwnerReferralsPanel.tsx
- MarketingNav.tsx
- paymentsApi.ts
- MarketingFooter.tsx
- apiClient.ts
- subscriptionsApi.ts
- ContactPage.tsx
- server.js
- IntersectionObserverMock
- SubscriptionContext.tsx
- Diretrizes universais para IAs
- DashboardPage.tsx
- FeaturesPage.tsx
- CookieConsent.tsx
- AboutPage.tsx
- Run and deploy your AI Studio app
- vite-env.d.ts
- LandingPage.tsx
- AppointmentBookingModal.tsx
- ClientsManager.tsx
- StaffMember
- AboutPage.tsx
- eslint-config-prettier
- eslint-plugin-jsx-a11y
- eslint-plugin-react-hooks
- jsdom
- playwright
- postcss
- prettier
- tailwindcss
- @tailwindcss/postcss
- @testing-library/jest-dom
- @testing-library/react
- @testing-library/user-event
- @types/react
- @types/react-dom
- typescript
- typescript-eslint
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- vite
- @vitejs/plugin-react
- vitest
- @vitest/coverage-v8
- paymentsApi.ts
- MarketingNav.tsx
- ContactPage.tsx

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 43 edges
2. `Service` - 30 edges
3. `useAuth()` - 29 edges
4. `StaffMember` - 25 edges
5. `apiClient()` - 22 edges
6. `maskPhone()` - 20 edges
7. `ShopSettings` - 17 edges
8. `compilerOptions` - 16 edges
9. `MarketingNav()` - 15 edges
10. `authStorage` - 15 edges

## Surprising Connections (you probably didn't know these)
- `AddCustomerForm()` --references--> `react`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → package.json
- `AppointmentBookingModal()` --references--> `react`  [EXTRACTED]
  src/components/domain/AppointmentBookingModal.tsx → package.json
- `AppointmentScheduler()` --references--> `react`  [EXTRACTED]
  src/components/domain/AppointmentScheduler.tsx → package.json
- `LoginPage()` --references--> `react`  [EXTRACTED]
  src/pages/LoginPage.tsx → package.json
- `PublicHome()` --references--> `react`  [EXTRACTED]
  src/pages/PublicHome.tsx → package.json

## Import Cycles
- None detected.

## Communities (66 total, 25 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.26
Nodes (12): PostsManager(), PublicLinkPanel(), PublicLinkPanelProps, QueueItemCard(), ShopProfile(), Toast(), ToastProps, useBarbershop() (+4 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.06
Nodes (58): AddCustomerForm(), AddCustomerFormProps, ServiceCard(), TeamManager(), TeamManagerProps, formatPrice(), TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps (+50 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.06
Nodes (41): react, react, brl(), FinancialDashboard(), isOwnerLike(), brl, EMPTY_META, errorMessage() (+33 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.10
Nodes (46): AppointmentBookingModal(), AppointmentBookingModalProps, fieldClass(), formatPrice(), AgendaView, AppointmentCalendar(), AppointmentCalendarProps, getDaysInMonth() (+38 more)

### Community 4 - "devDependencies"
Cohesion: 0.29
Nodes (7): eslint, eslint-plugin-react-hooks, devDependencies, eslint, eslint-plugin-react-hooks, @types/node, @types/node

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.09
Nodes (28): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, ShareReferralButton(), ShareReferralButtonProps, AccessState (+20 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (22): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, EXPENSE_TYPE_LABELS, formatDateTime() (+14 more)

### Community 7 - "dependencies"
Cohesion: 0.04
Nodes (47): class-variance-authority, clsx, framer-motion, @google/genai, gsap, @hookform/resolvers, lucide-react, dependencies (+39 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.08
Nodes (14): BillingTab(), AuditLogDrawerProps, COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal(), ManageBarbershopModalProps, METRIC_CHART_CONFIG (+6 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.10
Nodes (19): adminApi, AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs (+11 more)

### Community 11 - "App.tsx"
Cohesion: 0.05
Nodes (34): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, ContactPage, DashboardPage, EmailVerifiedPage, FeaturesPage (+26 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.28
Nodes (12): AccessBlockedCode, apiClient(), buildApiError(), calls, checkRateLimit(), HttpMethod, NO_REFRESH_PATHS, notifyIfAccessBlocked() (+4 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.16
Nodes (7): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, sections, sections

### Community 14 - "paymentsApi.ts"
Cohesion: 0.06
Nodes (34): Header(), HeaderProps, Logo(), LogoProps, sizeMap, PasswordInput, PasswordInputProps, STRENGTH_BAR (+26 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.12
Nodes (25): FinancialDashboardProps, brl, emptyForm, PackageCatalog(), PackageCatalogProps, QueueItemCardProps, ReturnToQueueModal(), ReturnToQueueModalProps (+17 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.33
Nodes (4): comparison, hourHeat, staffRows, weekBars

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.19
Nodes (11): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ReferralDashboard, ReferralItem (+3 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.21
Nodes (12): PrivateRoute(), PrivateRouteProps, PricingPersuasionCharts(), useAuth(), MasterAdminDashboard(), formatPrice(), matrix, objections (+4 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.25
Nodes (7): Checklist de PR, Convenções de commits, Diretrizes de arquitetura, Diretrizes universais para IAs, Fluxo de branches (GitFlow), Padrão de CSS, Qualidade e testes

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.10
Nodes (23): downloadPostImage(), MODE_LABEL, MODE_OPTIONS, PostTone, PostType, TONE_OPTIONS, TYPE_OPTIONS, ShopProfileProps (+15 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.13
Nodes (7): trialCampaign, beats, beliefs, friendships, daySlots, flowSteps, pros

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.20
Nodes (4): authStorage, ListMeta, notificationsApi, SendWhatsAppPayload

### Community 27 - "AboutPage.tsx"
Cohesion: 0.19
Nodes (15): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), ClientsManager(), platformWhatsAppUnavailable(), SalonWhatsAppConnection(), SettingsManager() (+7 more)

### Community 36 - "LandingPage.tsx"
Cohesion: 0.21
Nodes (10): MarketingNav(), pageLinks, scrollToSection(), sectionLinks, LandingPage(), marqueeItems, planFeatures, processSteps (+2 more)

### Community 37 - "AppointmentBookingModal.tsx"
Cohesion: 0.21
Nodes (11): BarbershopContext, BarbershopProvider(), isShopStaffRole(), BarbershopFiltersContext, BarbershopFiltersProvider(), BarbershopFiltersValue, DateRange, root (+3 more)

### Community 38 - "ClientsManager.tsx"
Cohesion: 0.26
Nodes (9): QueueStatusCardProps, SchedulingContext, SchedulingContextValue, SchedulingProvider(), getQueueInsight(), QUEUE_MESSAGES, AIInsight, logger (+1 more)

### Community 39 - "StaffMember"
Cohesion: 0.22
Nodes (7): AuthContext, AuthContextValue, AuthProvider(), AuthResult, ACCESS_BLOCKED_CODES, ApiError, RegisterPayload

### Community 40 - "AboutPage.tsx"
Cohesion: 0.33
Nodes (7): errorMessage(), formatDate(), PlanFormModal(), PlansSection(), RefundsSection(), RevenueSection(), SubscriptionsSection()

### Community 43 - "eslint-plugin-react-hooks"
Cohesion: 0.33
Nodes (3): JoinQueuePayload, ListAppointmentsParams, schedulingApi

### Community 63 - "paymentsApi.ts"
Cohesion: 0.20
Nodes (7): ListMeta, PaymentProvider, paymentsApi, PaymentStatus, PixQrCode, Refund, RefundListResponse

### Community 64 - "MarketingNav.tsx"
Cohesion: 0.60
Nodes (4): busyCopy(), BusyLevel, busyStyles(), QueueStatusCard()

## Knowledge Gaps
- **287 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+282 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `OwnerFinancialPanel.tsx`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `react` connect `OwnerFinancialPanel.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `schedulingUtils.ts`, `dependencies`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `dependencies`, `eslint-config-prettier`, `eslint-plugin-jsx-a11y`, `jsdom`, `playwright`, `postcss`, `prettier`, `tailwindcss`, `@tailwindcss/postcss`, `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`, `@types/react`, `@types/react-dom`, `typescript`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `vite`, `@vitejs/plugin-react`, `vitest`, `@vitest/coverage-v8`, `ContactPage.tsx`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _287 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LoginPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05707762557077625 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05589225589225589 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0955837870538415 - nodes in this community are weakly interconnected._