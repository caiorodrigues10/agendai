# Graph Report - agendai  (2026-08-29)

## Corpus Check
- 139 files · ~111,045 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 924 nodes · 1921 edges · 84 communities (54 shown, 30 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5ffc4aaa`
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
- ErrorBoundary.tsx
- eslint-config-prettier
- eslint-plugin-jsx-a11y
- referralStorage.ts
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
- PrivateRoute.tsx
- typescript
- typescript-eslint
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- vite
- @vitejs/plugin-react
- vitest
- @vitest/coverage-v8
- paymentsApi.ts
- autoprefixer
- OwnerSubscriptionPanel.tsx
- eslint-plugin-react-hooks
- QueueItemCard.tsx
- clientsApi.ts
- postcss
- @types/node
- vite-plugin-pwa
- PostsManager.tsx
- @testing-library/user-event
- PwaInstallContext.tsx
- CheckoutPage.tsx
- AuthContext.tsx
- index.tsx
- ShopProfile.tsx
- MarketingNav.tsx
- credit-card-form.tsx
- QueueStatusCard.tsx
- eslint-plugin-jsx-a11y

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 49 edges
2. `useAuth()` - 31 edges
3. `Service` - 31 edges
4. `StaffMember` - 25 edges
5. `apiClient()` - 23 edges
6. `maskPhone()` - 21 edges
7. `ShopSettings` - 17 edges
8. `authStorage` - 16 edges
9. `normalizeDocument()` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `AddCustomerForm()` --references--> `react`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → package.json
- `AppointmentBookingModal()` --references--> `react`  [EXTRACTED]
  src/components/domain/AppointmentBookingModal.tsx → package.json
- `AppointmentScheduler()` --references--> `react`  [EXTRACTED]
  src/components/domain/AppointmentScheduler.tsx → package.json
- `PublicHome()` --references--> `react`  [EXTRACTED]
  src/pages/PublicHome.tsx → package.json
- `LoginPage()` --indirect_call--> `token()`  [INFERRED]
  src/pages/LoginPage.tsx → src/infra/subscriptionsApi.ts

## Import Cycles
- None detected.

## Communities (84 total, 30 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.20
Nodes (13): clientPhoneLabel(), ClientsManager(), PublicLinkPanel(), PublicLinkPanelProps, ALL_TAB_IDS, canAccessTab(), getDefaultTab(), TAB_GROUPS (+5 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.08
Nodes (33): AddCustomerFormProps, PackageCatalog(), ServiceCard(), ServiceCardProps, ServiceForm(), ServiceFormProps, ServiceManager(), ServiceManagerProps (+25 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.05
Nodes (45): react, react, brl(), FinancialDashboard(), isOwnerLike(), brl, EMPTY_EXPENSE_FORM, EMPTY_META (+37 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.07
Nodes (64): AppointmentBookingModal(), AppointmentBookingModalProps, fieldClass(), formatPrice(), AgendaView, AppointmentCalendar(), AppointmentCalendarProps, getDaysInMonth() (+56 more)

### Community 4 - "devDependencies"
Cohesion: 0.29
Nodes (7): eslint, eslint-config-prettier, devDependencies, eslint, eslint-config-prettier, @typescript-eslint/eslint-plugin, @typescript-eslint/eslint-plugin

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.24
Nodes (7): ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ReferralItem, referralsApi, ReferralTierInfo, ReferralTierName

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (29): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS (+21 more)

### Community 7 - "dependencies"
Cohesion: 0.04
Nodes (47): class-variance-authority, clsx, framer-motion, @google/genai, gsap, @hookform/resolvers, lucide-react, dependencies (+39 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.08
Nodes (15): BillingTab(), AuditLogDrawerProps, COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal(), ManageBarbershopModalProps, MasterAdminDashboard() (+7 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.10
Nodes (19): adminApi, AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs (+11 more)

### Community 11 - "App.tsx"
Cohesion: 0.08
Nodes (22): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, ContactPage, DashboardPage, EmailVerifiedPage, FeaturesPage (+14 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.28
Nodes (12): AccessBlockedCode, apiClient(), buildApiError(), calls, checkRateLimit(), HttpMethod, NO_REFRESH_PATHS, notifyIfAccessBlocked() (+4 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.20
Nodes (6): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, sections

### Community 14 - "paymentsApi.ts"
Cohesion: 0.06
Nodes (37): Avatar(), AvatarProps, AvatarSize, COLORS, getColorClass(), getInitials(), SIZE_MAP, Header() (+29 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.21
Nodes (10): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), platformWhatsAppUnavailable(), SalonWhatsAppConnection(), SettingsManager(), SettingsManagerProps (+2 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.33
Nodes (4): comparison, hourHeat, staffRows, weekBars

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.11
Nodes (17): formatPrice(), TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, ConsentCheckbox(), ConsentCheckboxProps, Plan, PlanBillingCycle, plansApi (+9 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.33
Nodes (8): formatPrice(), matrix, objections, PlansPage(), hasPanelAccess(), isPaidSubscription(), needsPaywallAfterAuth(), staffHomePath()

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.25
Nodes (7): Checklist de PR, Convenções de commits, Diretrizes de arquitetura, Diretrizes universais para IAs, Fluxo de branches (GitFlow), Padrão de CSS, Qualidade e testes

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.14
Nodes (14): AddPostPayload, AddServicePayload, BarbershopData, CreatePostPayload, GeneratePostPayload, PostAiSuggestion, PostConfigPayload, StaffPayload (+6 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.21
Nodes (10): QueueItemCardProps, ReturnToQueueModal(), ReturnToQueueModalProps, SchedulingContext, SchedulingProvider(), getQueueInsight(), QUEUE_MESSAGES, QueueItem (+2 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.29
Nodes (4): JoinQueuePayload, ListAppointmentsParams, QueueUpdatePayload, schedulingApi

### Community 27 - "AboutPage.tsx"
Cohesion: 0.11
Nodes (20): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, Payment, CancellationContext, CancelResponse (+12 more)

### Community 36 - "LandingPage.tsx"
Cohesion: 0.18
Nodes (10): 1. Posicionamento, 2. Estrutura recomendada da landing, 3. Vídeo: onde colocar, 4. Use real screenshots, 5. Separação de login e cadastro, 6. PWA mobile-first, 7. Guardrails de marketing, 8. KPIs (+2 more)

### Community 37 - "AppointmentBookingModal.tsx"
Cohesion: 0.20
Nodes (7): ListMeta, PaymentProvider, paymentsApi, PaymentStatus, PixQrCode, Refund, RefundListResponse

### Community 38 - "ClientsManager.tsx"
Cohesion: 0.33
Nodes (5): 2026-08-28 — Redesign UX: Agenda (Salão/Profissional), 2026-08-28 — Upload de logo na tela Perfil, 2026-08-29 — Fix: Erro cru do Google vazando pro usuário no upload de logo/avatar, 2026-08-29 — Redesign UX: unificar dois blocos de WhatsApp em Configurações, Backlog Técnico — Frontend

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.25
Nodes (3): ErrorBoundary, Props, State

### Community 41 - "eslint-config-prettier"
Cohesion: 0.16
Nodes (14): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, ProfileAvatarSection(), ProfileAvatarSectionProps, QueueItemCard(), ShareReferralButton(), ShareReferralButtonProps (+6 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.25
Nodes (12): useAuth(), AccessState, deriveAccessState(), deriveHasDashboard(), SubscriptionContext, SubscriptionContextValue, SubscriptionProvider(), useSubscription() (+4 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 46 - "postcss"
Cohesion: 0.50
Nodes (3): CookieConsent(), CookieConsentStatus, cookieConsentStorage

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.39
Nodes (3): loginMock, registerMock, renderWithProviders()

### Community 64 - "autoprefixer"
Cohesion: 0.40
Nodes (3): beats, beliefs, friendships

### Community 65 - "OwnerSubscriptionPanel.tsx"
Cohesion: 0.40
Nodes (3): daySlots, flowSteps, pros

### Community 67 - "QueueItemCard.tsx"
Cohesion: 0.28
Nodes (3): authStorage, SendWhatsAppPayload, usersApi

### Community 73 - "PostsManager.tsx"
Cohesion: 0.20
Nodes (10): downloadPostImage(), MODE_LABEL, MODE_OPTIONS, PostsManager(), PostTone, PostType, TONE_OPTIONS, TYPE_OPTIONS (+2 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.16
Nodes (12): installSteps, PwaInstallCard(), PwaInstallCardProps, BeforeInstallPromptEvent, isStandaloneDisplay(), PwaInstallContext, PwaInstallContextValue, PwaInstallProvider() (+4 more)

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.26
Nodes (16): AddCustomerForm(), pickPlanForCheckout(), formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps, LoginPage() (+8 more)

### Community 79 - "index.tsx"
Cohesion: 0.15
Nodes (16): AuthContext, AuthContextValue, AuthProvider(), AuthResult, BarbershopContext, BarbershopProvider(), isShopStaffRole(), BarbershopFiltersContext (+8 more)

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.36
Nodes (10): brl, digitsOnly(), formatBrPhone(), shopInitials(), ShopProfile(), todaySchedule(), waLink(), useBarbershop() (+2 more)

### Community 81 - "MarketingNav.tsx"
Cohesion: 0.32
Nodes (5): MarketingNav(), pageLinks, scrollToSection(), sectionLinks, sections

### Community 82 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 84 - "QueueStatusCard.tsx"
Cohesion: 0.43
Nodes (6): busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps, AIInsight

## Knowledge Gaps
- **318 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+313 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `OwnerFinancialPanel.tsx`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Why does `react` connect `OwnerFinancialPanel.tsx` to `ShopProfile.tsx`, `schedulingUtils.ts`, `CheckoutPage.tsx`, `dependencies`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `dependencies`, `StaffMember`, `jsdom`, `playwright`, `prettier`, `tailwindcss`, `@tailwindcss/postcss`, `@testing-library/jest-dom`, `@testing-library/react`, `@types/react`, `typescript`, `typescript-eslint`, `@typescript-eslint/parser`, `vite`, `@vitejs/plugin-react`, `vitest`, `@vitest/coverage-v8`, `eslint-plugin-react-hooks`, `clientsApi.ts`, `postcss`, `@types/node`, `vite-plugin-pwa`, `@testing-library/user-event`, `eslint-plugin-jsx-a11y`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _318 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LoginPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07665505226480836 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05084745762711865 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0689551339957844 - nodes in this community are weakly interconnected._