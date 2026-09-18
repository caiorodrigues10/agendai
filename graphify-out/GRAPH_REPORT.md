# Graph Report - agendai  (2026-09-18)

## Corpus Check
- 333 files · ~251,410 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1869 nodes · 4471 edges · 127 communities (119 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4cf5c6ae`
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
- goalsApi.ts
- softwareApplicationLd
- commissionsApi.ts
- GiftCardsPanel.tsx
- enhancedForecastApi.ts
- README.md
- CrmIntelligencePanel.tsx
- reputationApi.ts
- PasswordInput.tsx
- qualityApi.ts
- CopilotPanel.tsx
- SeoHead.tsx
- purchasingApi.ts
- index.ts
- barbershopApi
- data
- ProductCatalogPanel.tsx
- PlansPage.tsx
- productsApi.ts
- CrmMergePanel.tsx
- ProductStockPanel.tsx
- ConfirmDialog.tsx
- LandingPage.tsx
- RetailCheckoutBlock.tsx
- credit-card-form.tsx

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 158 edges
2. `useBarbershopFilters()` - 65 edges
3. `apiClient()` - 62 edges
4. `authStorage` - 48 edges
5. `useAuth()` - 47 edges
6. `SmartSelect()` - 36 edges
7. `Service` - 36 edges
8. `useBarbershop()` - 31 edges
9. `StaffMember` - 29 edges
10. `maskPhone()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `AuthProvider()` --indirect_call--> `token()`  [INFERRED]
  src/contexts/AuthContext.tsx → src/infra/usersApi.ts
- `UsersTab()` --indirect_call--> `data()`  [INFERRED]
  src/pages/MasterAdmin/MasterAdminDashboard.tsx → src/infra/crmApi.ts
- `LoginPage()` --indirect_call--> `token()`  [INFERRED]
  src/pages/LoginPage.tsx → src/infra/subscriptionsApi.ts
- `ActivationChecklist()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/ActivationChecklist.tsx → src/infra/crmApi.ts
- `AddCustomerFormProps` --references--> `Service`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (127 total, 8 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.18
Nodes (15): StaffNavigation(), StaffNavigationProps, visibleTabs(), ALL_TAB_IDS, canAccessTab(), canAccessTabByMode(), getDefaultTab(), getPrimaryTabForMode() (+7 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (15): intentColor(), intentLabel(), statusColor(), statusLabel(), View, WhatsAppAIPanel(), AiConversation, AiIntentLog (+7 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.10
Nodes (22): EMPTY_META, errorMessage(), OwnerFinancialPanel(), Tab, TABS, todayIso(), ShopWeatherDay, EnhancedForecastReport (+14 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.11
Nodes (21): OwnerReferralsPanel(), OwnerReferralsPanelProps, STATUS_LABEL, STATUS_STYLES, brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS (+13 more)

### Community 4 - "devDependencies"
Cohesion: 0.13
Nodes (15): CrmBackfillPanel(), RunSummary(), statusLabel(), auth, run, CrmBackfillResult, CrmBackfillRun, CrmCampaign (+7 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.14
Nodes (18): brl, clientPhoneLabel(), ClientProfileSheet(), PAYMENT_LABEL, ProfileTab, shortDate(), ClientEditFormData, ClientEditSchema (+10 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (28): BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS, formatDate() (+20 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (21): AddCustomerFormProps, ClientCreateFormData, ClientCreateSchema, CustomerQueueFormData, CustomerQueueSchema, CustomerQueueStaffFormData, CustomerQueueStaffSchema, LoginFormData (+13 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.08
Nodes (16): BillingTab(), AuditLogDrawerProps, BarbershopsTab(), COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal(), ManageBarbershopModalProps (+8 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.09
Nodes (20): adminApi, AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs (+12 more)

### Community 11 - "App.tsx"
Cohesion: 0.07
Nodes (26): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, ClientPortalPage, CommercialIntentPage, ContactPage, DashboardPage (+18 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.15
Nodes (20): ACCESS_BLOCKED_CODES, AccessBlockedCode, apiClient(), apiFetch(), ApiRequestOptions, buildApiError(), calls, checkRateLimit() (+12 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.11
Nodes (22): ClientPortalDashboard(), PortalTab, TABS, ClientPortalLogin(), ClientPortalLoginProps, asRecord(), ClientAppointment, ClientBenefit (+14 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.12
Nodes (17): CatalogTab, catalogApi, ServiceAddon, ServiceCombo, ServiceVariation, ClientMembership, MembershipBenefit, MembershipCycle (+9 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.12
Nodes (25): AddCustomerForm(), clientPhoneLabel(), ClientsManager(), ClientsManagerProps, QueueAlertSettings(), AppointmentPolicySection(), BusinessSegmentSection(), DEFAULT_APPOINTMENT_POLICY (+17 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.25
Nodes (20): CatalogManager(), DepositPolicyPanel(), FormsPanel(), GiftCardsPanel(), IntegrationsPanel(), PackageCatalog(), PostsManager(), ProductCatalogPanel() (+12 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.16
Nodes (18): DepositIndicators(), formatMetricValue(), GoalFormData, GoalMetric, GoalsPanel(), INITIAL_FORM, METRIC_LABELS, progressColor() (+10 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 20 - "IntersectionObserverMock"
Cohesion: 0.15
Nodes (5): IntersectionObserverMock, liveIntervals, nativeClearInterval, nativeSetInterval, ResizeObserverMock

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.12
Nodes (18): Header(), HeaderProps, owner, subscription, Logo(), LogoProps, sizeMap, PasswordInput (+10 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 23 - "AiPredictivePage.tsx"
Cohesion: 0.16
Nodes (13): CashPanel(), INITIAL_FORM, MOVEMENT_TYPE_LABELS, MovementFormData, MovementType, movementTypeOptions, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS (+5 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.11
Nodes (27): BarbershopContext, BarbershopContextValue, BarbershopProvider(), isShopStaffRole(), AddPostPayload, AddServicePayload, AppointmentPolicy, BarbershopData (+19 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.12
Nodes (16): ShowcasePublicPage(), asNumber(), CreateShowcaseEntryInput, normalizeEntry(), normalizeList(), ShowcaseAnalytics, showcaseApi, ShowcaseEntry (+8 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.14
Nodes (15): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), ProfileAvatarSection(), ProfileAvatarSectionProps, AuthContext, AuthContextValue (+7 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.12
Nodes (19): AccessState, deriveAccessState(), deriveHasDashboard(), SubscriptionContext, SubscriptionContextValue, SubscriptionProvider(), Payment, CancelResponse (+11 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.12
Nodes (9): DepositIndicatorsProps, STATUS_LABELS, STATUS_STYLES, authStorage, SavedAccount, AppointmentDeposit, depositsApi, LoyaltyAccount (+1 more)

### Community 31 - "PublicHome.test.tsx"
Cohesion: 0.16
Nodes (12): cashApi, CashMovement, CashSummary, EnhancedForecast, enhancedForecastApi, ForecastFactor, getForecastReport(), normalizePredictions() (+4 more)

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
Cohesion: 0.16
Nodes (16): ReturnToQueueModal(), ReturnToQueueModalProps, sameSnapshot(), SchedulingContext, SchedulingContextValue, SchedulingProvider(), realtimeWsUrl(), JoinQueuePayload (+8 more)

### Community 41 - "eslint-config-prettier"
Cohesion: 0.21
Nodes (13): AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, DAY_NAMES, DEFAULT_SCHEDULE (+5 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.24
Nodes (9): brl(), FinancialDashboard(), isOwnerLike(), metric(), CommissionEntry, commissionsApi, CommissionSummary, BarbershopInsights (+1 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 44 - "jsdom"
Cohesion: 0.12
Nodes (16): CYCLE_LABELS, INITIAL_PLAN_FORM, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_STYLES, PlanFormData, Tab, INITIAL_FORM, STATUS_LABELS (+8 more)

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
Cohesion: 0.28
Nodes (6): CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.14
Nodes (14): ActivationChecklist(), Props, DESCRIPTIONS, DESTINATIONS, OnboardingChecklist(), OnboardingChecklistProps, Step, TITLES (+6 more)

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.33
Nodes (6): FinanceSummaryCard(), FinanceSummaryCardProps, EXPENSE_RECURRENCE_LABELS, EXPENSE_TYPE_LABELS, FINANCE_PAYMENT_METHODS, ExpenseType

### Community 51 - "@testing-library/react"
Cohesion: 0.17
Nodes (19): pickPlanForCheckout(), formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps, subscribe, LoginPage() (+11 more)

### Community 53 - "@types/react"
Cohesion: 0.17
Nodes (11): brl, PackageCatalogProps, packagesApi, ClientPackage, PackagePaymentMethod, PostMedia, PostTemplate, SalonClientAppointment (+3 more)

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.15
Nodes (7): Claude, dependencies, devDependencies, Inventário de pacotes — Frontend (agendai), Gemini, AgendAI — Frontend, Rodar localmente

### Community 55 - "typescript"
Cohesion: 0.33
Nodes (4): Addon, Combo, ServiceBookingSelectorProps, Variation

### Community 56 - "typescript-eslint"
Cohesion: 0.16
Nodes (18): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, dateLabel(), EnhancedForecastPanel(), getWeatherIcon(), RISK_STYLES, WeatherForecastWidget() (+10 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.20
Nodes (23): AppointmentBookingModal(), fieldClass(), AppointmentScheduler(), firstOpenDate(), BookPackageSessionsModal(), PickedSlot, Avatar(), AvatarProps (+15 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.52
Nodes (6): addDaysISO(), DefaultPeriod, getDefaultPeriod(), getPeriodRange(), todayISO(), toLocalIsoDate()

### Community 59 - "vite"
Cohesion: 0.21
Nodes (8): INITIAL_FORM, STATUS_LABELS, STATUS_STYLES, SyncFormData, TYPE_META, Integration, integrationsApi, IntegrationSyncLog

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.29
Nodes (12): backend, backendRoutes(), checkContract(), frontendRequests(), literal(), methods, normalize(), parse() (+4 more)

### Community 61 - "vitest"
Cohesion: 0.14
Nodes (20): CategoryManager(), Props, category, Harness(), mocks, ServiceForm(), ServiceFormProps, ServiceManager() (+12 more)

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.36
Nodes (5): ShopFloorControls(), ShopFloorControlsProps, statusCopy(), supportsAppointments(), supportsQueue()

### Community 64 - "autoprefixer"
Cohesion: 0.22
Nodes (8): JsonLd, SeoHead(), SeoHeadProps, upsertJsonLd(), upsertLink(), upsertMeta(), sections, sections

### Community 65 - "OwnerSubscriptionPanel.tsx"
Cohesion: 0.20
Nodes (11): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload(), THEMES, useChart() (+3 more)

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
Cohesion: 0.13
Nodes (13): PricingPersuasionCharts(), PricingPersuasionChartsProps, softwareApplicationLd(), trialCampaign, AboutPage(), beats, beliefs, friendships (+5 more)

### Community 70 - "@types/node"
Cohesion: 0.33
Nodes (5): Comandos (PowerShell / bash), Delegação a subagentes, Graphify — Frontend, Procedimento obrigatório, Regras

### Community 71 - "AboutPage.tsx"
Cohesion: 0.21
Nodes (10): brl(), getCurrentPeriod(), pct(), ProfitEnginePanel(), ProfitEnginePanelProps, profitApi, ProfitEntry, ProfitPeriodData (+2 more)

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.12
Nodes (14): downloadPostImage(), MODE_LABEL, MODE_OPTIONS, PostTone, PostType, QUICK_PRESETS, TEMPLATE_COLORS, TEMPLATE_OPTIONS (+6 more)

### Community 74 - "@testing-library/user-event"
Cohesion: 0.14
Nodes (14): CONDITIONS, DISCOUNT_TYPES, INITIAL_FORM, RULE_TYPE_LABELS, RULE_TYPES, RuleForm, STATUS_COLORS, PriceEvaluation (+6 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.05
Nodes (30): App(), ErrorBoundary, Props, State, actionClassName, SystemStateAction, SystemStatePage(), SystemStatePageProps (+22 more)

### Community 76 - "scripts"
Cohesion: 0.47
Nodes (5): busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.32
Nodes (15): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, ClientsSection, ClientsTabProps, FinancialDashboardProps (+7 more)

### Community 79 - "index.tsx"
Cohesion: 0.40
Nodes (4): ServiceCard(), ServiceCardProps, DynamicIcon(), DynamicIconProps

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.21
Nodes (12): brl, digitsOnly(), formatBrPhone(), shopInitials(), ShopProfile(), todaySchedule(), waLink(), useScheduling() (+4 more)

### Community 81 - "MarketingNav.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 82 - "credit-card-form.tsx"
Cohesion: 0.40
Nodes (4): Arquitetura frontend e princípios, Formulários, Organização atual (não impor classes de backend ao React), SOLID / Clean Code (exemplos locais)

### Community 84 - "Arquitetura do frontend"
Cohesion: 0.40
Nodes (4): Arquitetura do frontend, Auditoria, Estrutura, Regras

### Community 85 - "AboutPage.tsx"
Cohesion: 0.33
Nodes (5): FiscalPanel(), fiscalApi, FiscalConfig, FiscalStats, NfeRecord

### Community 86 - "Inventário de pacotes — Frontend (agendai)"
Cohesion: 0.33
Nodes (3): walletApi, WalletBalance, WalletEntry

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.31
Nodes (5): OrganizationsPanel(), Organization, organizationsApi, OrganizationFormData, OrganizationSchema

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.13
Nodes (14): TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, ConsentCheckbox(), ConsentCheckboxProps, Plan, PlanBillingCycle, plansApi, BlockInfo (+6 more)

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.29
Nodes (5): Contrato API e smoke de entrega, Smoke manual mínimo após deploy, Verificação offline, Inventário de scripts — Frontend (`agendai`), Observações

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.13
Nodes (12): DEPOSIT_REQUIRED_OPTIONS, NO_SHOW_RULE_OPTIONS, REFUND_RULE_OPTIONS, INITIAL_CONFIG, LoyaltyConfig, LoyaltyPanel(), BarbershopFiltersContext, BarbershopFiltersValue (+4 more)

### Community 95 - "errorMessage"
Cohesion: 0.14
Nodes (15): BookingFormData, dateTimeLocalToIso(), endOfDayIso(), INITIAL_BOOKING_FORM, INITIAL_FORM, ResourceFormData, ResourcesPanel(), startOfDayIso() (+7 more)

### Community 96 - "FeaturesPage.tsx"
Cohesion: 0.05
Nodes (62): CatalogTemplateModal(), Props, CatalogPurpose, Props, PURPOSE_META, SEGMENTS, ProductFormModal(), Props (+54 more)

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.12
Nodes (24): CalendarSkeleton(), ClientsSkeleton(), TeamSkeleton(), DashboardSkeleton(), FinancialSkeleton(), ReportsSkeleton(), PublicPageSkeleton(), QueueSkeleton() (+16 more)

### Community 98 - "ApiError"
Cohesion: 0.33
Nodes (5): comparison, DashboardPage(), hourHeat, staffRows, weekBars

### Community 99 - "PublicAppointmentManagePage.tsx"
Cohesion: 0.80
Nodes (4): AnalyticsListener(), PRIVATE_PREFIXES, initAnalytics(), trackPageView()

### Community 100 - "goalsApi.ts"
Cohesion: 0.22
Nodes (9): ClientsTab(), initialPeriod(), ProductsHub(), ProfileSettingsPanel(), PrivateRoute(), PrivateRouteProps, useAuth(), usePermissions() (+1 more)

### Community 101 - "goalsApi.ts"
Cohesion: 0.17
Nodes (12): asNumber(), flattenGoal(), flattenList(), GoalMetric, GoalPeriod, GoalProgressRow, GoalRecord, goalsApi (+4 more)

### Community 102 - "softwareApplicationLd"
Cohesion: 0.29
Nodes (9): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+1 more)

### Community 103 - "commissionsApi.ts"
Cohesion: 0.19
Nodes (9): INITIAL_FORM, STATUS_COLORS, TYPE_LABELS, VOUCHER_TYPES, VoucherForm, voucherTypeOptions, Voucher, vouchersApi (+1 more)

### Community 104 - "GiftCardsPanel.tsx"
Cohesion: 0.24
Nodes (7): INITIAL_FORM, PurchaseForm, STATUS_COLORS, STATUS_LABELS, GiftCard, giftCardsApi, GiftCardUsage

### Community 105 - "enhancedForecastApi.ts"
Cohesion: 0.12
Nodes (13): DAY_LABELS, DAYS, STATUS_COLORS, STATUS_LABELS, asNumber(), normalizeService(), staffApi, StaffScheduleEntry (+5 more)

### Community 106 - "README.md"
Cohesion: 0.29
Nodes (6): FIELD_TYPE_LABELS, FIELD_TYPES, Form, FormField, FormResponse, formsApi

### Community 107 - "CrmIntelligencePanel.tsx"
Cohesion: 0.20
Nodes (13): ClientCard(), ClientTableRow(), CrmIntelligencePanel(), FACTOR_LABELS, formatFactor(), Kpi(), money(), Props (+5 more)

### Community 108 - "reputationApi.ts"
Cohesion: 0.27
Nodes (7): ReputationPanel(), responseTextOf(), sentimentIcon(), reputationApi, ReputationStats, Review, ReviewResponse

### Community 109 - "PasswordInput.tsx"
Cohesion: 0.24
Nodes (8): PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel, PasswordStrengthResult

### Community 110 - "qualityApi.ts"
Cohesion: 0.33
Nodes (5): QualityPanel(), qualityApi, QualityAudit, QualityOverview, QualityProtocol

### Community 111 - "CopilotPanel.tsx"
Cohesion: 0.31
Nodes (5): CorporatePanel(), corporateApi, CorporatePlan, CorporateSubscription, CorporateValidation

### Community 112 - "SeoHead.tsx"
Cohesion: 0.14
Nodes (6): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, AiPredictivePage()

### Community 113 - "purchasingApi.ts"
Cohesion: 0.32
Nodes (4): PurchasingPanel(), PurchaseOrder, PurchaseOrderItem, purchasingApi

### Community 114 - "index.ts"
Cohesion: 0.14
Nodes (14): TeamManager(), TeamManagerProps, Button, ButtonProps, ButtonSize, ButtonVariant, sizes, variants (+6 more)

### Community 115 - "barbershopApi"
Cohesion: 0.15
Nodes (10): destinations, OnboardingMissions(), Props, Step, titles, ApiError, formatApiFieldErrors(), friendlyTechnicalMessage() (+2 more)

### Community 116 - "data"
Cohesion: 0.36
Nodes (4): CopilotPanel(), priorityLabel(), copilotApi, CopilotSuggestion

### Community 117 - "ProductCatalogPanel.tsx"
Cohesion: 0.50
Nodes (4): schedulingApi, Appointment, isoDate(), PublicAppointmentManagePage()

### Community 118 - "PlansPage.tsx"
Cohesion: 0.26
Nodes (9): pageLinks, sectionLinks, matrix, objections, PlansPage(), hasPanelAccess(), isPaidSubscription(), needsPaywallAfterAuth() (+1 more)

### Community 119 - "productsApi.ts"
Cohesion: 0.50
Nodes (3): Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade

### Community 120 - "CrmMergePanel.tsx"
Cohesion: 0.16
Nodes (13): CrmMergePanel(), QueueItemCard(), item, service, METHODS, Props, RetailCheckoutBlock(), clientsApi (+5 more)

### Community 121 - "ProductStockPanel.tsx"
Cohesion: 0.67
Nodes (3): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, DaySchedule

### Community 122 - "ConfirmDialog.tsx"
Cohesion: 0.28
Nodes (6): PRIORITY_CONFIG, TYPE_CONFIG, ConfirmDialog(), ConfirmDialogProps, Recommendation, recommendationsApi

### Community 123 - "LandingPage.tsx"
Cohesion: 0.22
Nodes (9): MarketingNav(), scrollToSection(), LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent (+1 more)

### Community 125 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

## Knowledge Gaps
- **557 isolated node(s):** `root`, `findings`, `root`, `backend`, `methods` (+552 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `subscriptionsApi.ts` to `StaffDashboard.tsx`, `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `schedulingUtils.ts`, `devDependencies`, `CheckoutPage.tsx`, `BillingTab.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `adminApi.ts`, `MarketingNav.tsx`, `paymentsApi.ts`, `MarketingFooter.tsx`, `apiClient.ts`, `ContactPage.tsx`, `AiPredictivePage.tsx`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `jsdom`, `@tailwindcss/postcss`, `@testing-library/react`, `@types/react`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `vite`, `vitest`, `@vitest/coverage-v8`, `PostsManager.tsx`, `@testing-library/user-event`, `ShopProfile.tsx`, `MarketingNav.tsx`, `AboutPage.tsx`, `CheckoutPage.tsx`, `ForgotPasswordPage.tsx`, `errorMessage`, `FeaturesPage.tsx`, `goalsApi.ts`, `commissionsApi.ts`, `GiftCardsPanel.tsx`, `enhancedForecastApi.ts`, `README.md`, `CrmIntelligencePanel.tsx`, `reputationApi.ts`, `qualityApi.ts`, `CopilotPanel.tsx`, `purchasingApi.ts`, `index.ts`, `barbershopApi`, `data`, `ProductCatalogPanel.tsx`, `PlansPage.tsx`, `CrmMergePanel.tsx`, `ConfirmDialog.tsx`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `goalsApi.ts` to `StaffDashboard.tsx`, `devDependencies`, `MasterAdminDashboard.tsx`, `subscriptionsApi.ts`, `SubscriptionContext.tsx`, `AiPredictivePage.tsx`, `DashboardPage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `ErrorBoundary.tsx`, `jsdom`, `@tailwindcss/postcss`, `@testing-library/react`, `vitest`, `PwaInstallContext.tsx`, `CheckoutPage.tsx`, `ShopProfile.tsx`, `AccessBlockedPage.tsx`, `FeaturesPage.tsx`, `index.ts`, `PlansPage.tsx`, `LandingPage.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `root` to the rest of the system?**
  _557 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09971509971509972 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10826210826210826 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Should `CheckoutPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._