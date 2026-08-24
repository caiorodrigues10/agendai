# Graph Report - agendai  (2026-08-19)

## Corpus Check
- 105 files · ~81,442 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 683 nodes · 1416 edges · 35 communities (30 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1263b324`
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
- AiPredictivePage.tsx
- DashboardPage.tsx
- FeaturesPage.tsx
- CookieConsent.tsx
- AboutPage.tsx
- Run and deploy your AI Studio app
- vite-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 28 edges
2. `useAuth()` - 27 edges
3. `Service` - 24 edges
4. `StaffMember` - 21 edges
5. `maskPhone()` - 18 edges
6. `compilerOptions` - 16 edges
7. `apiClient()` - 15 edges
8. `ShopSettings` - 14 edges
9. `normalizeDocument()` - 14 edges
10. `CheckoutPage()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `AddCustomerForm()` --references--> `react`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → package.json
- `AppointmentScheduler()` --references--> `react`  [EXTRACTED]
  src/components/domain/AppointmentScheduler.tsx → package.json
- `LoginPage()` --references--> `react`  [EXTRACTED]
  src/pages/LoginPage.tsx → package.json
- `PublicHome()` --references--> `react`  [EXTRACTED]
  src/pages/PublicHome.tsx → package.json
- `ChartContainer()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json

## Import Cycles
- None detected.

## Communities (35 total, 5 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.06
Nodes (58): App(), OwnerReferralsPanel(), brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, MODE_LABEL (+50 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.06
Nodes (53): AddCustomerForm(), AddCustomerFormProps, ServiceCard(), FieldProps, formatPrice(), inputClass(), SubscribeAuthModal(), Tab (+45 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.05
Nodes (44): react, react, brl(), FinancialDashboard(), isOwnerLike(), brl, EMPTY_META, errorMessage() (+36 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.11
Nodes (40): AppointmentBookingModal(), AppointmentBookingModalProps, AgendaView, AppointmentCalendar(), AppointmentCalendarProps, AppointmentScheduler(), AppointmentSchedulerProps, FinancialDashboardProps (+32 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (43): autoprefixer, jsdom, devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @tailwindcss/postcss (+35 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.08
Nodes (30): SubscribeAuthModalProps, Header(), HeaderProps, Logo(), LogoProps, sizeMap, ThemeToggle(), applyDocumentTheme() (+22 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (29): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS (+21 more)

### Community 7 - "dependencies"
Cohesion: 0.06
Nodes (35): @aliimam/logos, class-variance-authority, clsx, framer-motion, @google/genai, gsap, @hookform/resolvers, lucide-react (+27 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.08
Nodes (15): DashboardPeriod, BillingTab(), AuditLogDrawerProps, COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal(), ManageBarbershopModalProps (+7 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.10
Nodes (18): adminApi, AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs (+10 more)

### Community 11 - "App.tsx"
Cohesion: 0.20
Nodes (12): AccessBlockedListener(), EXEMPT_PATHS, PrivateRoute(), PrivateRouteProps, jumpToTop(), ScrollToTop(), useAuth(), MasterAdminDashboard() (+4 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.17
Nodes (12): STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton(), ShareReferralButtonProps, ReferralDashboard (+4 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.17
Nodes (12): MarketingNav(), pageLinks, scrollToSection(), sectionLinks, LandingPage(), marqueeItems, planFeatures, processSteps (+4 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.15
Nodes (8): authStorage, PaymentProvider, paymentsApi, PaymentStatus, PixQrCode, Refund, ListAppointmentsParams, schedulingApi

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.16
Nodes (10): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, EmailVerifiedPage(), daySlots, flowSteps (+2 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.21
Nodes (11): ACCESS_BLOCKED_CODES, AccessBlockedCode, apiClient(), ApiError, buildApiError(), calls, checkRateLimit(), HttpMethod (+3 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.17
Nodes (10): Payment, CancellationContext, Invoice, PayerIdentification, PlanBillingCycle, PlanEconomics, SubscribePayload, Subscription (+2 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.31
Nodes (8): AccessState, deriveAccessState(), deriveHasDashboard(), SubscriptionContext, SubscriptionContextValue, SubscriptionProvider(), MySubscription, subscriptionsApi

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.25
Nodes (7): Checklist de PR, Convenções de commits, Diretrizes de arquitetura, Diretrizes universais para IAs, Fluxo de branches (GitFlow), Padrão de CSS, Qualidade e testes

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.33
Nodes (5): comparison, DashboardPage(), hourHeat, staffRows, weekBars

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.50
Nodes (3): CookieConsent(), CookieConsentStatus, cookieConsentStorage

### Community 27 - "AboutPage.tsx"
Cohesion: 0.40
Nodes (4): AboutPage(), beats, beliefs, friendships

## Knowledge Gaps
- **218 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+213 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `OwnerFinancialPanel.tsx`, `devDependencies`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Why does `react` connect `OwnerFinancialPanel.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `schedulingUtils.ts`, `dependencies`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _218 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaffDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06342342342342343 - nodes in this community are weakly interconnected._
- **Should `LoginPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05754527162977867 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05143191116306254 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10775510204081633 - nodes in this community are weakly interconnected._