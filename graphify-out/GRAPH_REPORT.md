# Graph Report - agendai  (2026-09-02)

## Corpus Check
- 165 files · ~135,276 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1002 nodes · 2230 edges · 84 communities (76 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ef96f1d4`
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

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 65 edges
2. `useAuth()` - 35 edges
3. `Service` - 35 edges
4. `StaffMember` - 29 edges
5. `maskPhone()` - 26 edges
6. `apiClient()` - 25 edges
7. `ShopSettings` - 21 edges
8. `authStorage` - 18 edges
9. `normalizeDocument()` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --indirect_call--> `token()`  [INFERRED]
  src/pages/LoginPage.tsx → src/infra/subscriptionsApi.ts
- `AddCustomerFormProps` --references--> `Service`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → src/types.ts
- `AppointmentScheduler()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/AppointmentScheduler.tsx → src/infra/crmApi.ts
- `ClientProfileSheet()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/ClientProfileSheet.tsx → src/infra/crmApi.ts
- `FinancialDashboard()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/FinancialDashboard.tsx → src/infra/crmApi.ts

## Import Cycles
- None detected.

## Communities (84 total, 8 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.19
Nodes (14): ActivationChecklist(), StaffNavigation(), StaffNavigationProps, visibleTabs(), ALL_TAB_IDS, canAccessTab(), canAccessTabByMode(), getDefaultTab() (+6 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.17
Nodes (12): ServiceCard(), ServiceCardProps, ServiceForm(), ServiceFormProps, ServiceManagerProps, ConfirmDialog(), ConfirmDialogProps, DynamicIcon() (+4 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.09
Nodes (20): brl, EMPTY_EXPENSE_FORM, EMPTY_META, EXPENSE_TYPE_LABEL, FIADO_STATUS, PAYMENT_METHODS, RECURRENCE_LABEL, Tab (+12 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.14
Nodes (13): brl, emptyForm, PackageCatalogProps, packagesApi, ClientPackage, ClientPackageStatus, PackagePaymentMethod, PostMedia (+5 more)

### Community 4 - "devDependencies"
Cohesion: 0.14
Nodes (18): ClientCard(), ClientTableRow(), CrmIntelligencePanel(), Kpi(), money(), Props, segmentOptions, shortDate() (+10 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.16
Nodes (13): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton(), ShareReferralButtonProps (+5 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (22): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, EXPENSE_TYPE_LABELS, formatDateTime() (+14 more)

### Community 7 - "dependencies"
Cohesion: 0.27
Nodes (15): AddCustomerForm(), formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps, LoginPage(), isValidCnpj() (+7 more)

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
Cohesion: 0.09
Nodes (22): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, ContactPage, DashboardPage, EmailVerifiedPage, FeaturesPage (+14 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.23
Nodes (14): AccessBlockedCode, apiClient(), ApiRequestOptions, buildApiError(), calls, checkRateLimit(), HttpMethod, NO_REFRESH_PATHS (+6 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.18
Nodes (13): PricingPersuasionCharts(), PricingPersuasionChartsProps, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload() (+5 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.18
Nodes (12): Header(), HeaderProps, Logo(), LogoProps, sizeMap, PasswordInput, ThemeToggle(), useSubscription() (+4 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.19
Nodes (11): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, MODE_OPTIONS, OperationModeSection(), OperationModeSectionProps, platformWhatsAppUnavailable(), SalonWhatsAppConnection(), SettingsManager() (+3 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.16
Nodes (15): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+7 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.11
Nodes (17): formatPrice(), TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, ConsentCheckbox(), ConsentCheckboxProps, pickPlanForCheckout(), Plan, PlanBillingCycle (+9 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.20
Nodes (6): ACCESS_BLOCKED_CODES, ApiError, contactApi, ContactPayload, ContactResult, ContactTopic

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.17
Nodes (16): useAuth(), applyDocumentTheme(), getInitialTheme(), Theme, ThemeContext, ThemeContextValue, ThemeProvider(), NotFoundPage() (+8 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.25
Nodes (7): Checklist de PR, Convenções de commits, Diretrizes de arquitetura, Diretrizes universais para IAs, Fluxo de branches (GitFlow), Padrão de CSS, Qualidade e testes

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.15
Nodes (13): AddPostPayload, AddServicePayload, CreatePostPayload, GeneratePostPayload, PostConfigPayload, ShopWhatsAppStatus, StaffPayload, UpdateBarbershopPayload (+5 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.20
Nodes (13): QueueStatusCardProps, ReturnToQueueModal(), ReturnToQueueModalProps, SchedulingContext, SchedulingContextValue, SchedulingProvider(), QueueUpdatePayload, schedulingApi (+5 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.24
Nodes (7): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), AuthProvider(), token(), usersApi

### Community 27 - "AboutPage.tsx"
Cohesion: 0.09
Nodes (26): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, AccessState, deriveAccessState(), deriveHasDashboard() (+18 more)

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
Cohesion: 0.22
Nodes (13): AddCustomerFormProps, CustomerQueueFormData, CustomerQueueSchema, CustomerQueueStaffFormData, CustomerQueueStaffSchema, LoginFormData, LoginSchema, RegisterSchema (+5 more)

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.20
Nodes (5): ErrorBoundary, Props, State, getLastCorrelationId(), logger

### Community 41 - "eslint-config-prettier"
Cohesion: 0.36
Nodes (7): ProfileAvatarSection(), ProfileAvatarSectionProps, ProfileSettingsPanel(), formatApiFieldErrors(), getErrorMessage(), isNetworkError(), messageForStatus()

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.21
Nodes (13): brl, clientPhoneLabel(), ClientProfileSheet(), PAYMENT_LABEL, ProfileTab, shortDate(), APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_STYLE (+5 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 44 - "jsdom"
Cohesion: 0.21
Nodes (12): brl(), FinancialDashboard(), isOwnerLike(), brl, formatDate(), getWeatherIcon(), RISK_STYLES, WeatherForecastWidget() (+4 more)

### Community 45 - "playwright"
Cohesion: 0.18
Nodes (9): ListNotificationDeliveriesParams, normalizePreferences(), NotificationDelivery, NotificationDeliveryList, NotificationListMeta, NotificationWorkerHealth, QueuedNotification, SendWhatsAppPayload (+1 more)

### Community 46 - "postcss"
Cohesion: 0.50
Nodes (3): CookieConsent(), CookieConsentStatus, cookieConsentStorage

### Community 47 - "prettier"
Cohesion: 0.18
Nodes (10): Auditoria backend ↔ frontend, Backend sem experiência completa no frontend, Baixa prioridade ou uso interno, Correções aplicadas, Escopo e método, Evolução recomendada, Ordem sugerida, Prioridade alta (+2 more)

### Community 48 - "tailwindcss"
Cohesion: 0.27
Nodes (9): QueueItemCard(), busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), useScheduling(), PublicHome(), PublicTab (+1 more)

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.24
Nodes (8): TeamManager(), TeamManagerProps, ALL_PERMISSIONS, EmployeePermission, PERMISSION_LABELS, TeamMemberFormData, TeamMemberSchema, EmployeePermission

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.24
Nodes (8): PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel, PasswordStrengthResult

### Community 51 - "@testing-library/react"
Cohesion: 0.31
Nodes (7): formatDateTime(), HealthCardProps, NotificationHealthPanel(), statusClass(), statusLabel(), NotificationOperationsHealth, notificationsApi

### Community 53 - "@types/react"
Cohesion: 0.28
Nodes (6): CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options

### Community 55 - "typescript"
Cohesion: 0.31
Nodes (7): AuthContext, AuthContextValue, AuthResult, authApi, AuthResponse, AuthUser, RegisterPayload

### Community 56 - "typescript-eslint"
Cohesion: 0.29
Nodes (6): DemandAlertBanner(), DemandAlertBannerProps, formatDate(), RISK_STYLES, financialApi, WeatherDemandPrediction

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.20
Nodes (14): AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, Appointment, DAY_NAMES (+6 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.25
Nodes (8): errorMessage(), formatDate(), formatDateTime(), OwnerFinancialPanel(), PackageCatalog(), ServiceManager(), data(), UsersTab()

### Community 59 - "vite"
Cohesion: 0.29
Nodes (7): NotificationPreferences(), OwnerNotificationsPanel(), OwnerNotificationsPanelProps, OwnerNotificationTab, preferenceLabel(), TYPE_LABELS, NotificationPreference

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.32
Nodes (7): Avatar(), AvatarProps, AvatarSize, COLORS, getColorClass(), getInitials(), SIZE_MAP

### Community 61 - "vitest"
Cohesion: 0.25
Nodes (7): LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent, weatherTimeline

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.33
Nodes (6): clientPhoneLabel(), ClientsManager(), ClientsManagerProps, clientsApi, ListMeta, SalonClient

### Community 64 - "autoprefixer"
Cohesion: 0.13
Nodes (12): companyLinks, exploreLinks, platformLinks, socialLinks, trialCampaign, beats, beliefs, friendships (+4 more)

### Community 65 - "OwnerSubscriptionPanel.tsx"
Cohesion: 0.30
Nodes (16): AppointmentBookingModal(), fieldClass(), formatPrice(), AppointmentScheduler(), firstOpenDate(), BookPackageSessionsModal(), PickedSlot, parseLocalISO() (+8 more)

### Community 66 - "eslint-plugin-react-hooks"
Cohesion: 0.38
Nodes (6): PublicLinkPanel(), PublicLinkPanelProps, qrUrl(), TabDef, BarbershopData, OperationMode

### Community 67 - "QueueItemCard.tsx"
Cohesion: 0.20
Nodes (4): authStorage, CommissionEntry, commissionsApi, CommissionSummary

### Community 68 - "clientsApi.ts"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 69 - "postcss"
Cohesion: 0.52
Nodes (5): ForgotPasswordPage(), inputClass(), getRecaptchaToken(), loadScript(), useRecaptchaBadge()

### Community 70 - "@types/node"
Cohesion: 0.33
Nodes (4): actionClassName, SystemStateAction, SystemStatePage(), SystemStatePageProps

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.40
Nodes (5): ContactFormData, ContactPage(), ContactSchema, fieldClass(), topics

### Community 73 - "PostsManager.tsx"
Cohesion: 0.14
Nodes (14): downloadPostImage(), MODE_LABEL, MODE_OPTIONS, PostsManager(), PostTone, PostType, QUICK_PRESETS, TONE_OPTIONS (+6 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.13
Nodes (14): installSteps, PwaInstallCard(), PwaInstallCardProps, BeforeInstallPromptEvent, isStandaloneDisplay(), PwaInstallContext, PwaInstallContextValue, PwaInstallProvider() (+6 more)

### Community 76 - "scripts"
Cohesion: 0.40
Nodes (3): daySlots, flowSteps, pros

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.21
Nodes (20): Props, AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, ClientsSection, ClientsTab() (+12 more)

### Community 79 - "index.tsx"
Cohesion: 0.19
Nodes (13): App(), BarbershopContext, BarbershopProvider(), isShopStaffRole(), BarbershopFiltersContext, BarbershopFiltersProvider(), BarbershopFiltersValue, DateRange (+5 more)

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.46
Nodes (7): brl, digitsOnly(), formatBrPhone(), shopInitials(), ShopProfile(), todaySchedule(), waLink()

### Community 81 - "MarketingNav.tsx"
Cohesion: 0.21
Nodes (7): MarketingFooter(), MarketingNav(), pageLinks, scrollToSection(), sectionLinks, sections, sections

### Community 82 - "credit-card-form.tsx"
Cohesion: 0.33
Nodes (7): errorMessage(), formatDate(), PlanFormModal(), PlansSection(), RefundsSection(), RevenueSection(), SubscriptionsSection()

## Knowledge Gaps
- **313 isolated node(s):** `__filename`, `__dirname`, `server`, `router`, `middlewares` (+308 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `eslint-config-prettier` to `StaffDashboard.tsx`, `OwnerFinancialPanel.tsx`, `schedulingUtils.ts`, `devDependencies`, `CheckoutPage.tsx`, `BillingTab.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `adminApi.ts`, `MarketingFooter.tsx`, `apiClient.ts`, `SubscriptionContext.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `StaffMember`, `eslint-plugin-jsx-a11y`, `jsdom`, `tailwindcss`, `@tailwindcss/postcss`, `@testing-library/react`, `typescript`, `@typescript-eslint/parser`, `vite`, `@vitest/coverage-v8`, `OwnerSubscriptionPanel.tsx`, `vite-plugin-pwa`, `PostsManager.tsx`, `CheckoutPage.tsx`, `ShopProfile.tsx`, `credit-card-form.tsx`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `SubscriptionContext.tsx` to `StaffDashboard.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `eslint-config-prettier`, `paymentsApi.ts`, `index.tsx`, `tailwindcss`, `MarketingNav.tsx`, `@tailwindcss/postcss`, `subscriptionsApi.ts`, `PrivateRoute.tsx`, `typescript`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `maskPhone()` connect `dependencies` to `OwnerSubscriptionPanel.tsx`, `OwnerFinancialPanel.tsx`, `StaffMember`, `vite-plugin-pwa`, `MasterAdminDashboard.tsx`, `eslint-plugin-jsx-a11y`, `MarketingFooter.tsx`, `subscriptionsApi.ts`, `@typescript-eslint/parser`, `@vitest/coverage-v8`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `__filename`, `__dirname`, `server` to the rest of the system?**
  _313 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08620689655172414 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._