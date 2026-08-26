# Graph Report - agendai  (2026-08-25)

## Corpus Check
- 117 files · ~90,045 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 786 nodes · 1593 edges · 37 communities (34 shown, 3 thin omitted)
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
- DashboardPage.tsx
- CookieConsent.tsx
- AboutPage.tsx
- Run and deploy your AI Studio app
- vite-env.d.ts
- LandingPage.tsx

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 34 edges
2. `Service` - 28 edges
3. `useAuth()` - 27 edges
4. `StaffMember` - 25 edges
5. `apiClient()` - 20 edges
6. `maskPhone()` - 20 edges
7. `ShopSettings` - 18 edges
8. `compilerOptions` - 16 edges
9. `authStorage` - 14 edges
10. `normalizeDocument()` - 14 edges

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

## Communities (37 total, 3 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.06
Nodes (57): MODE_LABEL, MODE_OPTIONS, PostsManager(), PostType, TYPE_OPTIONS, QueueItemCard(), QueueItemCardProps, ShopProfile() (+49 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.07
Nodes (48): AddCustomerForm(), AddCustomerFormProps, ServiceCard(), SettingsManager(), SettingsManagerProps, TeamManager(), TeamManagerProps, ConsentCheckbox() (+40 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.06
Nodes (39): react, react, brl(), FinancialDashboard(), isOwnerLike(), brl, EMPTY_META, errorMessage() (+31 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.06
Nodes (68): AppointmentBookingModal(), AppointmentBookingModalProps, fieldClass(), formatPrice(), AgendaView, AppointmentCalendar(), AppointmentCalendarProps, getDaysInMonth() (+60 more)

### Community 4 - "devDependencies"
Cohesion: 0.04
Nodes (49): autoprefixer, eslint, eslint-config-prettier, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks, jsdom, devDependencies, autoprefixer (+41 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.24
Nodes (6): PricingPersuasionCharts(), PricingPersuasionChartsProps, trialCampaign, beats, beliefs, friendships

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (29): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS (+21 more)

### Community 7 - "dependencies"
Cohesion: 0.04
Nodes (47): class-variance-authority, clsx, framer-motion, @google/genai, gsap, @hookform/resolvers, lucide-react, dependencies (+39 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.08
Nodes (15): DashboardPeriod, BillingTab(), AuditLogDrawerProps, COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModalProps, MasterAdminDashboard() (+7 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.12
Nodes (15): AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs, FinancialOverview (+7 more)

### Community 11 - "App.tsx"
Cohesion: 0.06
Nodes (29): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, ContactPage, DashboardPage, EmailVerifiedPage, FeaturesPage (+21 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.05
Nodes (38): ACCESS_BLOCKED_CODES, AccessBlockedCode, apiClient(), ApiError, buildApiError(), calls, checkRateLimit(), HttpMethod (+30 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.21
Nodes (7): MarketingFooter(), MarketingNav(), pageLinks, scrollToSection(), sectionLinks, sections, sections

### Community 14 - "paymentsApi.ts"
Cohesion: 0.22
Nodes (9): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel (+1 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.22
Nodes (7): companyLinks, exploreLinks, platformLinks, socialLinks, Logo(), LogoProps, sizeMap

### Community 16 - "apiClient.ts"
Cohesion: 0.33
Nodes (4): comparison, hourHeat, staffRows, weekBars

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.06
Nodes (40): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, AccessState, deriveAccessState(), deriveHasDashboard() (+32 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.16
Nodes (13): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton(), ShareReferralButtonProps (+5 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.25
Nodes (7): Checklist de PR, Convenções de commits, Diretrizes de arquitetura, Diretrizes universais para IAs, Fluxo de branches (GitFlow), Padrão de CSS, Qualidade e testes

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.27
Nodes (9): ClientsManager(), adminApi, ReferralPlatformStats, ManageBarbershopModal(), ReferralsTab(), formatApiFieldErrors(), getErrorMessage(), isNetworkError() (+1 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.47
Nodes (4): Header(), HeaderProps, ThemeToggle(), useTheme()

### Community 27 - "AboutPage.tsx"
Cohesion: 0.40
Nodes (3): daySlots, flowSteps, pros

### Community 36 - "LandingPage.tsx"
Cohesion: 0.29
Nodes (6): LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent

## Knowledge Gaps
- **272 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+267 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `OwnerFinancialPanel.tsx`?**
  _High betweenness centrality (0.203) - this node is a cross-community bridge._
- **Why does `react` connect `OwnerFinancialPanel.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `schedulingUtils.ts`, `dependencies`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _272 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaffDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.061828952239911146 - nodes in this community are weakly interconnected._
- **Should `LoginPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06949152542372881 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.058069381598793365 - nodes in this community are weakly interconnected._