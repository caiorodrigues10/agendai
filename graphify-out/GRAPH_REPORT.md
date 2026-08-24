# Graph Report - agendai  (2026-08-22)

## Corpus Check
- 111 files · ~86,462 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 715 nodes · 1498 edges · 39 communities (33 shown, 6 thin omitted)
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
- authStorage.ts
- LandingPage.tsx
- ApiError

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 28 edges
2. `useAuth()` - 27 edges
3. `Service` - 24 edges
4. `StaffMember` - 21 edges
5. `maskPhone()` - 20 edges
6. `apiClient()` - 17 edges
7. `normalizeDocument()` - 16 edges
8. `compilerOptions` - 16 edges
9. `trialCampaign` - 14 edges
10. `CheckoutPage()` - 14 edges

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

## Communities (39 total, 6 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.10
Nodes (39): App(), MODE_LABEL, MODE_OPTIONS, PostsManager(), PostType, TYPE_OPTIONS, QueueItemCard(), ShopProfile() (+31 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.05
Nodes (59): AddCustomerForm(), AddCustomerFormProps, ServiceCard(), ServiceCardProps, FieldProps, formatPrice(), inputClass(), SubscribeAuthModal() (+51 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.08
Nodes (23): brl, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABEL, FIADO_STATUS, formatDate(), OwnerFinancialPanel(), Tab (+15 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.07
Nodes (63): AppointmentBookingModal(), AppointmentBookingModalProps, fieldClass(), formatPrice(), AgendaView, AppointmentCalendar(), AppointmentCalendarProps, getDaysInMonth() (+55 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (43): autoprefixer, jsdom, devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @tailwindcss/postcss (+35 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.08
Nodes (28): SubscribeAuthModalProps, Header(), HeaderProps, Logo(), LogoProps, sizeMap, ThemeToggle(), useSubscription() (+20 more)

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
Cohesion: 0.16
Nodes (12): AccessBlockedListener(), EXEMPT_PATHS, CookieConsent(), PrivateRoute(), PrivateRouteProps, jumpToTop(), ScrollToTop(), AboutPage() (+4 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.16
Nodes (13): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton(), ShareReferralButtonProps (+5 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.19
Nodes (11): MarketingFooter(), MarketingNav(), pageLinks, scrollToSection(), sectionLinks, EmailVerifiedPage(), LandingPage(), PrivacyPolicyPage() (+3 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.25
Nodes (5): PaymentProvider, paymentsApi, PaymentStatus, PixQrCode, Refund

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.12
Nodes (16): companyLinks, exploreLinks, platformLinks, socialLinks, trialCampaign, beats, beliefs, friendships (+8 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.21
Nodes (12): AccessBlockedCode, apiClient(), buildApiError(), calls, checkRateLimit(), HttpMethod, NO_REFRESH_PATHS, notifyIfAccessBlocked() (+4 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.13
Nodes (16): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, Payment, CancellationContext, Invoice (+8 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.13
Nodes (18): react, react, PricingPersuasionCharts(), PricingPersuasionChartsProps, Button, ButtonProps, buttonVariants, ChartConfig (+10 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.25
Nodes (7): Checklist de PR, Convenções de commits, Diretrizes de arquitetura, Diretrizes universais para IAs, Fluxo de branches (GitFlow), Padrão de CSS, Qualidade e testes

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.27
Nodes (9): AuthProvider(), adminApi, ReferralPlatformStats, ManageBarbershopModal(), ReferralsTab(), formatApiFieldErrors(), getErrorMessage(), isNetworkError() (+1 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.22
Nodes (8): ensureMercadoPago(), SubscribePayload, formatPrice(), MercadoPagoCardFields, PayMethod, REJECTION_MESSAGES, rejectionMessage(), SecureFieldStyle

### Community 27 - "AboutPage.tsx"
Cohesion: 0.36
Nodes (6): AuthContext, AuthContextValue, AuthResult, authApi, AuthResponse, RegisterPayload

### Community 35 - "authStorage.ts"
Cohesion: 0.33
Nodes (3): authStorage, ListAppointmentsParams, schedulingApi

### Community 36 - "LandingPage.tsx"
Cohesion: 0.33
Nodes (5): marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent

## Knowledge Gaps
- **229 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+224 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `SubscriptionContext.tsx`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **Why does `react` connect `SubscriptionContext.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `schedulingUtils.ts`, `dependencies`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _229 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaffDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09574468085106383 - nodes in this community are weakly interconnected._
- **Should `LoginPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05228105228105228 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08387096774193549 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06635802469135803 - nodes in this community are weakly interconnected._