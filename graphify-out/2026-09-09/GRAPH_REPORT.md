# Graph Report - agendai  (2026-09-08)

## Corpus Check
- 242 files · ~172,001 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1401 nodes · 3297 edges · 107 communities (93 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6330ac9d`
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
- PublicHome.test.tsx
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
- AboutPage.tsx
- vite-plugin-pwa
- PostsManager.tsx
- @testing-library/user-event
- PwaInstallContext.tsx
- scripts
- CheckoutPage.tsx
- index.tsx
- ShopProfile.tsx
- MarketingNav.tsx
- credit-card-form.tsx
- Arquitetura do frontend
- AboutPage.tsx
- Inventário de pacotes — Frontend (agendai)
- audit-frontend-structure.mjs
- PaginationBar.tsx
- copilot-instructions.md
- formatWhatsapp
- CheckoutPage.tsx
- AccessBlockedPage.tsx
- credit-card-form.tsx
- ForgotPasswordPage.tsx
- errorMessage
- FeaturesPage.tsx
- Mapa de domínio — Frontend ↔ API
- ApiError
- PublicAppointmentManagePage.tsx
- goalsApi.ts
- OperationMode
- AnalyticsListener.tsx
- commissionsApi.ts
- AboutPage.tsx
- enhancedForecastApi.ts
- README.md

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 108 edges
2. `useAuth()` - 43 edges
3. `apiClient()` - 34 edges
4. `Service` - 34 edges
5. `useBarbershopFilters()` - 31 edges
6. `maskPhone()` - 30 edges
7. `StaffMember` - 29 edges
8. `authStorage` - 28 edges
9. `normalizePhoneBR()` - 23 edges
10. `formatCurrencyBRL()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --indirect_call--> `token()`  [INFERRED]
  src/pages/LoginPage.tsx → src/infra/subscriptionsApi.ts
- `ActivationChecklist()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/ActivationChecklist.tsx → src/infra/crmApi.ts
- `AddCustomerFormProps` --references--> `Service`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → src/types.ts
- `AppointmentScheduler()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/AppointmentScheduler.tsx → src/infra/crmApi.ts
- `ClientProfileSheet()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/ClientProfileSheet.tsx → src/infra/crmApi.ts

## Import Cycles
- None detected.

## Communities (107 total, 14 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.22
Nodes (9): StaffNavigation(), StaffNavigationProps, visibleTabs(), canAccessTab(), MOBILE_PRIMARY_TAB_IDS, TAB_GROUPS, TabDef, TabGroup (+1 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.31
Nodes (5): PRIORITY_CONFIG, ConfirmDialog(), ConfirmDialogProps, Recommendation, recommendationsApi

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.11
Nodes (18): EMPTY_META, Tab, TABS, ShopWeatherDay, CreateExpenseBody, CreateFiadoBody, ExpenseCategory, ExpenseItem (+10 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.13
Nodes (5): authStorage, LoyaltyAccount, LoyaltyLedgerEntry, buildQuery(), QueryValue

### Community 4 - "devDependencies"
Cohesion: 0.08
Nodes (35): brl, clientPhoneLabel(), ClientProfileSheet(), PAYMENT_LABEL, ProfileTab, shortDate(), ClientCard(), ClientTableRow() (+27 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.32
Nodes (11): BarbershopContext, BarbershopProvider(), isShopStaffRole(), BarbershopData, ShopStatusPayload, ManualShopStatus, OpeningMode, ScheduleException (+3 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (22): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, EXPENSE_TYPE_LABELS, formatDateTime() (+14 more)

### Community 7 - "dependencies"
Cohesion: 0.05
Nodes (64): AddCustomerForm(), AddCustomerFormProps, clientPhoneLabel(), ClientsManager(), ClientsManagerProps, MOVEMENT_LABEL, Props, ProfileSettingsPanel() (+56 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.08
Nodes (16): BillingTab(), AuditLogDrawerProps, BarbershopsTab(), COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal(), ManageBarbershopModalProps (+8 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.10
Nodes (19): adminApi, AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs (+11 more)

### Community 11 - "App.tsx"
Cohesion: 0.07
Nodes (26): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, CommercialIntentPage, ContactPage, DashboardPage, EmailVerifiedPage (+18 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.23
Nodes (14): AccessBlockedCode, apiClient(), ApiRequestOptions, buildApiError(), calls, checkRateLimit(), HttpMethod, NO_REFRESH_PATHS (+6 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.18
Nodes (13): PricingPersuasionCharts(), PricingPersuasionChartsProps, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload() (+5 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.22
Nodes (9): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel (+1 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.12
Nodes (21): AppointmentPolicySection(), BusinessSegmentSection(), DEFAULT_APPOINTMENT_POLICY, MODE_OPTIONS, OperationModeSection(), OperationModeSectionProps, platformWhatsAppUnavailable(), SalonWhatsAppConnection() (+13 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.15
Nodes (15): ActivationChecklist(), Props, destinations, OnboardingMissions(), Props, Step, titles, QueueCapacityBanner() (+7 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.20
Nodes (6): ACCESS_BLOCKED_CODES, ApiError, contactApi, ContactPayload, ContactResult, ContactTopic

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.24
Nodes (11): MarketingNav(), pageLinks, scrollToSection(), sectionLinks, useAuth(), NotFoundPage(), matrix, objections (+3 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 23 - "AiPredictivePage.tsx"
Cohesion: 0.18
Nodes (10): INITIAL_FORM, MOVEMENT_TYPE_LABELS, MovementFormData, MovementType, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS, PaymentMethod, cashApi (+2 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.14
Nodes (13): AddPostPayload, AddServicePayload, CreatePostPayload, GeneratePostPayload, PostConfigPayload, ShopWeatherForecast, StaffPayload, UpdateBarbershopPayload (+5 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.17
Nodes (16): QueueStatusCardProps, ReturnToQueueModal(), ReturnToQueueModalProps, sameSnapshot(), SchedulingContext, SchedulingContextValue, SchedulingProvider(), realtimeWsUrl() (+8 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.19
Nodes (11): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), AuthContext, AuthContextValue, AuthProvider(), AuthResult (+3 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.18
Nodes (10): Payment, CancelResponse, Invoice, PayerIdentification, PlanBillingCycle, SetupTrialCardPayload, Subscription, SubscriptionStatus (+2 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.19
Nodes (14): AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, DAY_NAMES, DEFAULT_SCHEDULE (+6 more)

### Community 36 - "LandingPage.tsx"
Cohesion: 0.18
Nodes (10): 1. Posicionamento, 2. Estrutura recomendada da landing, 3. Vídeo: onde colocar, 4. Use real screenshots, 5. Separação de login e cadastro, 6. PWA mobile-first, 7. Guardrails de marketing, 8. KPIs (+2 more)

### Community 37 - "AppointmentBookingModal.tsx"
Cohesion: 0.20
Nodes (7): ListMeta, PaymentProvider, paymentsApi, PaymentStatus, PixQrCode, Refund, RefundListResponse

### Community 38 - "ClientsManager.tsx"
Cohesion: 0.29
Nodes (6): 2026-08-28 — Redesign UX: Agenda (Salão/Profissional), 2026-08-28 — Upload de logo na tela Perfil, 2026-08-29 — Componente reutilizável ConfirmDialog + substituição no ServiceManager, 2026-08-29 — Fix: Erro cru do Google vazando pro usuário no upload de logo/avatar, 2026-08-29 — Redesign UX: unificar dois blocos de WhatsApp em Configurações, Backlog Técnico — Frontend

### Community 39 - "StaffMember"
Cohesion: 0.14
Nodes (15): StatusBadge(), StatusBadgeProps, Tone, TONES, classes, FiadoStatusBadge(), FiadoStatusBadgeProps, FiadoStatus (+7 more)

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.13
Nodes (9): ErrorBoundary, Props, State, actionClassName, SystemStateAction, SystemStatePage(), SystemStatePageProps, getLastCorrelationId() (+1 more)

### Community 41 - "eslint-config-prettier"
Cohesion: 0.05
Nodes (60): CatalogTemplateModal(), Props, ProductCatalogPanel(), Props, SEGMENTS, ProductFormModal(), Props, PAYMENT_LABEL (+52 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.22
Nodes (9): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, ShareReferralButton(), ShareReferralButtonProps, CancellationContext (+1 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 44 - "jsdom"
Cohesion: 0.47
Nodes (5): brl(), FinancialDashboard(), isOwnerLike(), BarbershopInsights, InsightsPeriod

### Community 45 - "playwright"
Cohesion: 0.23
Nodes (15): adsPurchaseLabel(), adsSignupLabel(), googleAdsId(), initGtag(), initMetaPixel(), loadScript(), measurementId(), MetaPixelFunction (+7 more)

### Community 46 - "postcss"
Cohesion: 0.40
Nodes (3): CookieConsent(), CookieConsentStatus, cookieConsentStorage

### Community 47 - "prettier"
Cohesion: 0.18
Nodes (10): Auditoria backend ↔ frontend, Backend sem experiência completa no frontend, Baixa prioridade ou uso interno, Correções aplicadas, Escopo e método, Evolução recomendada, Ordem sugerida, Prioridade alta (+2 more)

### Community 48 - "tailwindcss"
Cohesion: 0.18
Nodes (12): QueueItemCard(), item, service, busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), useScheduling() (+4 more)

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.24
Nodes (8): TeamManager(), TeamManagerProps, ALL_PERMISSIONS, EmployeePermission, PERMISSION_LABELS, TeamMemberFormData, TeamMemberSchema, EmployeePermission

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.29
Nodes (10): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+2 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.22
Nodes (7): INITIAL_FORM, STATUS_LABELS, STATUS_STYLES, WaitlistFormData, waitlistApi, WaitlistEntry, WaitlistOffer

### Community 53 - "@types/react"
Cohesion: 0.14
Nodes (14): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, brl, PackageCatalogProps, PackageCatalogFormData, PackageCatalogSchema, ClientPackageStatus, DaySchedule (+6 more)

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.15
Nodes (7): Claude, Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade, Inventário de scripts — Frontend (`agendai`), Observações, Gemini

### Community 55 - "typescript"
Cohesion: 0.21
Nodes (10): ServiceCard(), ServiceCardProps, ServiceForm(), ServiceFormProps, ServiceManagerProps, DynamicIcon(), DynamicIconProps, ICON_OPTIONS (+2 more)

### Community 56 - "typescript-eslint"
Cohesion: 0.21
Nodes (11): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, getWeatherIcon(), RISK_STYLES, WeatherForecastWidget(), WeatherForecastWidgetProps, financialApi (+3 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.27
Nodes (19): AppointmentBookingModal(), fieldClass(), AppointmentScheduler(), firstOpenDate(), BookPackageSessionsModal(), PickedSlot, ScheduleExceptionsSection(), parseLocalISO() (+11 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.15
Nodes (19): CashPanel(), DepositIndicators(), DepositIndicatorsProps, STATUS_LABELS, STATUS_STYLES, MembershipsPanel(), errorMessage(), OwnerFinancialPanel() (+11 more)

### Community 59 - "vite"
Cohesion: 0.31
Nodes (8): AccessState, deriveAccessState(), deriveHasDashboard(), SubscriptionContext, SubscriptionContextValue, SubscriptionProvider(), MySubscription, subscriptionsApi

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.32
Nodes (7): Avatar(), AvatarProps, AvatarSize, COLORS, getColorClass(), getInitials(), SIZE_MAP

### Community 61 - "vitest"
Cohesion: 0.25
Nodes (7): LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent, weatherTimeline

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.15
Nodes (11): CYCLE_LABELS, INITIAL_PLAN_FORM, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_STYLES, PlanFormData, Tab, DataTableStateProps, EmptyState() (+3 more)

### Community 65 - "OwnerSubscriptionPanel.tsx"
Cohesion: 0.33
Nodes (6): FinanceSummaryCard(), FinanceSummaryCardProps, EXPENSE_RECURRENCE_LABELS, EXPENSE_TYPE_LABELS, FINANCE_PAYMENT_METHODS, ExpenseType

### Community 66 - "eslint-plugin-react-hooks"
Cohesion: 0.25
Nodes (8): 0. Regras essenciais (leia antes de editar), 1. O que é este app, 2. Como trabalhar, 3. Comandos frequentes, 4. Arquitetura (resumo), 5. Documentos legados, 6. Checklist rápido, AGENTS.md — AgendAI Frontend

### Community 67 - "QueueItemCard.tsx"
Cohesion: 0.25
Nodes (5): entryFiles, errors, inventoryFiles, pkg, root

### Community 68 - "clientsApi.ts"
Cohesion: 0.29
Nodes (7): Assinatura e acesso, Fila / agenda / híbrido, Notificações, Pacotes / fiado / produtos, Papéis, Pendências documentais, Regras de negócio (visão frontend)

### Community 69 - "postcss"
Cohesion: 0.52
Nodes (6): addDaysISO(), DefaultPeriod, getDefaultPeriod(), getPeriodRange(), todayISO(), toLocalIsoDate()

### Community 70 - "@types/node"
Cohesion: 0.33
Nodes (5): Comandos (PowerShell / bash), Delegação a subagentes, Graphify — Frontend, Procedimento obrigatório, Regras

### Community 71 - "AboutPage.tsx"
Cohesion: 0.13
Nodes (14): companyLinks, exploreLinks, platformLinks, socialLinks, trialCampaign, comparison, DashboardPage(), hourHeat (+6 more)

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.12
Nodes (15): downloadPostImage(), MODE_LABEL, MODE_OPTIONS, PostsManager(), PostTone, PostType, QUICK_PRESETS, TEMPLATE_COLORS (+7 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.08
Nodes (24): App(), installSteps, PwaInstallCard(), PwaInstallCardProps, BarbershopFiltersProvider(), BeforeInstallPromptEvent, isStandaloneDisplay(), PwaInstallContext (+16 more)

### Community 76 - "scripts"
Cohesion: 0.19
Nodes (11): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ReferralDashboard, ReferralItem (+3 more)

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.24
Nodes (19): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, ClientsSection, ClientsTab(), ClientsTabProps (+11 more)

### Community 79 - "index.tsx"
Cohesion: 0.14
Nodes (16): DEPOSIT_REQUIRED_OPTIONS, DepositPolicyPanel(), NO_SHOW_RULE_OPTIONS, REFUND_RULE_OPTIONS, INITIAL_CONFIG, LoyaltyConfig, LoyaltyPanel(), Field() (+8 more)

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.46
Nodes (7): brl, digitsOnly(), formatBrPhone(), shopInitials(), ShopProfile(), todaySchedule(), waLink()

### Community 81 - "MarketingNav.tsx"
Cohesion: 0.21
Nodes (9): MarketingFooter(), JsonLd, SeoHead(), SeoHeadProps, upsertJsonLd(), upsertLink(), upsertMeta(), sections (+1 more)

### Community 82 - "credit-card-form.tsx"
Cohesion: 0.40
Nodes (4): Arquitetura frontend e princípios, Formulários, Organização atual (não impor classes de backend ao React), SOLID / Clean Code (exemplos locais)

### Community 84 - "Arquitetura do frontend"
Cohesion: 0.40
Nodes (4): Arquitetura do frontend, Auditoria, Estrutura, Regras

### Community 85 - "AboutPage.tsx"
Cohesion: 0.23
Nodes (11): formatMetricValue(), GoalFormData, GoalMetric, GoalsPanel(), INITIAL_FORM, METRIC_LABELS, progressColor(), progressWidth() (+3 more)

### Community 86 - "Inventário de pacotes — Frontend (agendai)"
Cohesion: 0.50
Nodes (3): dependencies, devDependencies, Inventário de pacotes — Frontend (agendai)

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.20
Nodes (8): pickPlanForCheckout(), PlanBillingCycle, plansApi, SubscribePayload, formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckoutProps

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.33
Nodes (7): TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, useSubscription(), Plan, AccessBlockedPage(), BlockInfo, formatDate()

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.18
Nodes (11): HeaderProps, Logo(), LogoProps, sizeMap, ThemeToggle(), useTheme(), authApi, AuthResponse (+3 more)

### Community 95 - "errorMessage"
Cohesion: 0.33
Nodes (7): errorMessage(), formatDate(), PlanFormModal(), PlansSection(), RefundsSection(), RevenueSection(), SubscriptionsSection()

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.36
Nodes (7): confidenceBadge, EnhancedForecastPanel(), maturityLabel(), shortDate(), EnhancedForecast, enhancedForecastApi, formatNumberBR()

### Community 98 - "ApiError"
Cohesion: 0.25
Nodes (5): ClientMembership, MembershipBenefit, MembershipCycle, MembershipPlan, membershipsApi

### Community 99 - "PublicAppointmentManagePage.tsx"
Cohesion: 0.33
Nodes (6): PackageCatalog(), RecommendationsPanel(), ServiceManager(), WaitlistPanel(), data(), UsersTab()

### Community 100 - "goalsApi.ts"
Cohesion: 0.40
Nodes (5): ContactFormData, ContactPage(), ContactSchema, fieldClass(), topics

### Community 101 - "OperationMode"
Cohesion: 0.60
Nodes (4): PublicLinkPanel(), PublicLinkPanelProps, qrUrl(), OperationMode

### Community 102 - "AnalyticsListener.tsx"
Cohesion: 0.80
Nodes (4): AnalyticsListener(), PRIVATE_PREFIXES, initAnalytics(), trackPageView()

### Community 103 - "commissionsApi.ts"
Cohesion: 0.40
Nodes (3): CommissionEntry, commissionsApi, CommissionSummary

### Community 104 - "AboutPage.tsx"
Cohesion: 0.40
Nodes (4): AboutPage(), beats, beliefs, friendships

## Knowledge Gaps
- **442 isolated node(s):** `root`, `findings`, `root`, `errors`, `entryFiles` (+437 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `eslint-config-prettier` to `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `devDependencies`, `BillingTab.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `adminApi.ts`, `MarketingFooter.tsx`, `apiClient.ts`, `subscriptionsApi.ts`, `SubscriptionContext.tsx`, `AiPredictivePage.tsx`, `CookieConsent.tsx`, `eslint-plugin-jsx-a11y`, `tailwindcss`, `@tailwindcss/postcss`, `@testing-library/react`, `@types/react`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@vitest/coverage-v8`, `PostsManager.tsx`, `scripts`, `index.tsx`, `ShopProfile.tsx`, `AboutPage.tsx`, `CheckoutPage.tsx`, `errorMessage`, `Mapa de domínio — Frontend ↔ API`, `PublicAppointmentManagePage.tsx`, `goalsApi.ts`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `SubscriptionContext.tsx` to `@typescript-eslint/parser`, `CheckoutPage.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `eslint-config-prettier`, `CheckoutPage.tsx`, `App.tsx`, `PwaInstallContext.tsx`, `tailwindcss`, `@tailwindcss/postcss`, `subscriptionsApi.ts`, `AboutPage.tsx`, `AiPredictivePage.tsx`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `vite`, `AccessBlockedPage.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `authStorage` connect `schedulingUtils.ts` to `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `devDependencies`, `dependencies`, `adminApi.ts`, `OwnerReferralsPanel.tsx`, `apiClient.ts`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `AppointmentBookingModal.tsx`, `eslint-config-prettier`, `@testing-library/react`, `@testing-library/user-event`, `scripts`, `ApiError`, `commissionsApi.ts`, `enhancedForecastApi.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `root` to the rest of the system?**
  _442 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11462450592885376 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12535612535612536 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07822410147991543 - nodes in this community are weakly interconnected._