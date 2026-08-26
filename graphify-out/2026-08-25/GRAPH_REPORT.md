# Graph Report - agendai  (2026-08-25)

## Corpus Check
- 117 files · ~90,011 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 751 nodes · 1607 edges · 37 communities (32 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `48935992`
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
- AboutPage.tsx
- Run and deploy your AI Studio app
- vite-env.d.ts
- LandingPage.tsx

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 34 edges
2. `Service` - 28 edges
3. `useAuth()` - 27 edges
4. `StaffMember` - 25 edges
5. `maskPhone()` - 22 edges
6. `apiClient()` - 19 edges
7. `ShopSettings` - 18 edges
8. `normalizeDocument()` - 16 edges
9. `compilerOptions` - 16 edges
10. `trialCampaign` - 14 edges

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

## Communities (37 total, 5 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.07
Nodes (45): App(), MODE_LABEL, MODE_OPTIONS, PostsManager(), PostType, TYPE_OPTIONS, QueueItemCard(), SettingsManager() (+37 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.06
Nodes (55): AddCustomerForm(), AddCustomerFormProps, FieldProps, formatPrice(), inputClass(), SubscribeAuthModal(), Tab, TeamManager() (+47 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.05
Nodes (42): react, react, brl(), FinancialDashboard(), isOwnerLike(), brl, EMPTY_META, errorMessage() (+34 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.05
Nodes (80): AppointmentBookingModal(), AppointmentBookingModalProps, fieldClass(), formatPrice(), AgendaView, AppointmentCalendar(), AppointmentCalendarProps, getDaysInMonth() (+72 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (43): autoprefixer, jsdom, devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @tailwindcss/postcss (+35 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.31
Nodes (7): PricingPersuasionCharts(), PricingPersuasionChartsProps, trialCampaign, formatPrice(), matrix, objections, PlansPage()

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (29): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS (+21 more)

### Community 7 - "dependencies"
Cohesion: 0.05
Nodes (37): @aliimam/logos, class-variance-authority, clsx, framer-motion, @google/genai, gsap, @hookform/resolvers, lucide-react (+29 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.08
Nodes (14): DashboardPeriod, BillingTab(), AuditLogDrawerProps, COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModalProps, METRIC_CHART_CONFIG (+6 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.12
Nodes (15): AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs, FinancialOverview (+7 more)

### Community 11 - "App.tsx"
Cohesion: 0.18
Nodes (10): AccessBlockedListener(), EXEMPT_PATHS, CookieConsent(), PrivateRoute(), PrivateRouteProps, jumpToTop(), ScrollToTop(), MasterAdminDashboard() (+2 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.06
Nodes (40): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton(), ShareReferralButtonProps (+32 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.18
Nodes (11): MarketingNav(), pageLinks, scrollToSection(), sectionLinks, LandingPage(), AboutPage(), beats, beliefs (+3 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.21
Nodes (10): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), isPasswordStrongEnough(), LABELS (+2 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.20
Nodes (8): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, EmailVerifiedPage(), PrivacyPolicyPage(), sections

### Community 16 - "apiClient.ts"
Cohesion: 0.33
Nodes (5): comparison, DashboardPage(), hourHeat, staffRows, weekBars

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.06
Nodes (36): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, SubscribeAuthModalProps, AccessState, deriveAccessState() (+28 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.40
Nodes (3): UseGoogleSignInOptions, UseGoogleSignInResult, Window

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.25
Nodes (7): Checklist de PR, Convenções de commits, Diretrizes de arquitetura, Diretrizes universais para IAs, Fluxo de branches (GitFlow), Padrão de CSS, Qualidade e testes

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.27
Nodes (9): ClientsManager(), adminApi, ReferralPlatformStats, ManageBarbershopModal(), ReferralsTab(), formatApiFieldErrors(), getErrorMessage(), isNetworkError() (+1 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.40
Nodes (4): daySlots, flowSteps, pros, SchedulingPage()

### Community 36 - "LandingPage.tsx"
Cohesion: 0.33
Nodes (5): marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent

## Knowledge Gaps
- **238 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+233 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `OwnerFinancialPanel.tsx`, `devDependencies`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `react` connect `OwnerFinancialPanel.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `schedulingUtils.ts`, `dependencies`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _238 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaffDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06957047791893527 - nodes in this community are weakly interconnected._
- **Should `LoginPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06012176560121765 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.053246753246753244 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05131370128725093 - nodes in this community are weakly interconnected._