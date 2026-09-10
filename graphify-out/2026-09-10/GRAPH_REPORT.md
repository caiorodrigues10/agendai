# Graph Report - agendai  (2026-09-10)

## Corpus Check
- 285 files · ~202,474 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1628 nodes · 3827 edges · 118 communities (109 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1171bae9`
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
- GiftCardsPanel.tsx
- enhancedForecastApi.ts
- README.md
- ProductsHub.tsx
- reputationApi.ts
- PasswordInput.tsx
- qualityApi.ts
- CopilotPanel.tsx
- corporateApi.ts
- purchasingApi.ts
- AiPredictivePage.tsx
- data
- ServiceBookingSelector.tsx
- Mapa de domínio — Frontend ↔ API

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 146 edges
2. `useBarbershopFilters()` - 63 edges
3. `apiClient()` - 53 edges
4. `authStorage` - 47 edges
5. `useAuth()` - 43 edges
6. `Service` - 36 edges
7. `maskPhone()` - 30 edges
8. `StaffMember` - 29 edges
9. `useBarbershop()` - 28 edges
10. `data()` - 26 edges

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

## Communities (118 total, 9 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.17
Nodes (15): ProductsHub(), StaffNavigation(), StaffNavigationProps, visibleTabs(), ALL_TAB_IDS, canAccessTab(), canAccessTabByMode(), getDefaultTab() (+7 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.15
Nodes (15): intentColor(), intentLabel(), statusColor(), statusLabel(), View, WhatsAppAIPanel(), AiConversation, AiIntentLog (+7 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.09
Nodes (28): EMPTY_META, Tab, TABS, classes, FiadoStatusBadge(), FiadoStatusBadgeProps, FinanceSummaryCard(), FinanceSummaryCardProps (+20 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.28
Nodes (8): brl(), FinancialDashboard(), isOwnerLike(), ChartConfig, commissionsApi, CommissionSummary, BarbershopInsights, InsightsPeriod

### Community 4 - "devDependencies"
Cohesion: 0.14
Nodes (18): ClientCard(), ClientTableRow(), CrmIntelligencePanel(), Kpi(), money(), Props, segmentOptions, shortDate() (+10 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.16
Nodes (16): brl, clientPhoneLabel(), ClientProfileSheet(), PAYMENT_LABEL, ProfileTab, shortDate(), ClientEditFormData, ClientEditSchema (+8 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (29): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS (+21 more)

### Community 7 - "dependencies"
Cohesion: 0.16
Nodes (17): AddCustomerFormProps, CustomerQueueFormData, CustomerQueueSchema, CustomerQueueStaffFormData, CustomerQueueStaffSchema, LoginSchema, ProductFormData, ProductSchema (+9 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.08
Nodes (15): BillingTab(), AuditLogDrawerProps, BarbershopsTab(), COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal(), ManageBarbershopModalProps (+7 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.10
Nodes (19): adminApi, AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs (+11 more)

### Community 11 - "App.tsx"
Cohesion: 0.07
Nodes (26): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, ClientPortalPage, CommercialIntentPage, ContactPage, DashboardPage (+18 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.17
Nodes (16): ACCESS_BLOCKED_CODES, AccessBlockedCode, apiClient(), ApiError, ApiRequestOptions, buildApiError(), calls, checkRateLimit() (+8 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.18
Nodes (10): ClientPortalDashboard(), PortalTab, TABS, ClientPortalLogin(), ClientPortalLoginProps, ClientAppointment, ClientBenefit, ClientIdentity (+2 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.33
Nodes (5): CatalogTab, catalogApi, ServiceAddon, ServiceCombo, ServiceVariation

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.16
Nodes (14): AppointmentPolicySection(), BusinessSegmentSection(), DEFAULT_APPOINTMENT_POLICY, MODE_OPTIONS, OperationModeSectionProps, platformWhatsAppUnavailable(), SalonWhatsAppConnection(), SEGMENT_OPTIONS (+6 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.14
Nodes (20): destinations, OnboardingMissions(), Props, Step, titles, ProductCatalogPanel(), initialPeriod(), ProductReportsPanel() (+12 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.16
Nodes (12): actionClassName, SystemStateAction, SystemStatePageProps, Header(), HeaderProps, Logo(), LogoProps, sizeMap (+4 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 23 - "AiPredictivePage.tsx"
Cohesion: 0.16
Nodes (11): CashPanel(), INITIAL_FORM, MOVEMENT_TYPE_LABELS, MovementFormData, MovementType, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS, PaymentMethod (+3 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.10
Nodes (20): ActivationChecklist(), Props, QueueCapacityBanner(), AddPostPayload, AddServicePayload, AppointmentPolicy, barbershopApi, CreatePostPayload (+12 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.27
Nodes (4): ShowcasePanel(), ShowcasePublicPage(), showcaseApi, ShowcaseEntry

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.19
Nodes (9): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), ProfileAvatarSection(), ProfileAvatarSectionProps, AuthProvider(), token() (+1 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.07
Nodes (33): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL (+25 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.23
Nodes (10): brl(), getCurrentPeriod(), pct(), ProfitEnginePanel(), ProfitEnginePanelProps, profitApi, ProfitEntry, ProfitPeriodData (+2 more)

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
Cohesion: 0.18
Nodes (11): StatusBadge(), StatusBadgeProps, Tone, TONES, APPOINTMENT_STATUS_LABELS, FIADO_STATUS_LABELS, getStatusLabel(), NOTIFICATION_STATUS_LABELS (+3 more)

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.15
Nodes (17): ReturnToQueueModal(), ReturnToQueueModalProps, sameSnapshot(), SchedulingContext, SchedulingContextValue, SchedulingProvider(), realtimeWsUrl(), JoinQueuePayload (+9 more)

### Community 41 - "eslint-config-prettier"
Cohesion: 0.13
Nodes (19): CatalogTemplateModal(), Props, Props, SEGMENTS, ProductFormModal(), Props, RetailCartItem, CatalogTemplatePreview (+11 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.18
Nodes (15): PAYMENT_LABEL, productMoney, SALE_STATUS_LABEL, Props, Props, RefundLineState, RefundSaleModal(), METHODS (+7 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 44 - "jsdom"
Cohesion: 0.15
Nodes (12): CYCLE_LABELS, INITIAL_PLAN_FORM, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_STYLES, MembershipsPanel(), PlanFormData, Tab, ClientMembership (+4 more)

### Community 45 - "playwright"
Cohesion: 0.23
Nodes (15): adsPurchaseLabel(), adsSignupLabel(), googleAdsId(), initGtag(), initMetaPixel(), loadScript(), measurementId(), MetaPixelFunction (+7 more)

### Community 46 - "postcss"
Cohesion: 0.29
Nodes (7): AnalyticsListener(), PRIVATE_PREFIXES, CookieConsent(), initAnalytics(), trackPageView(), CookieConsentStatus, cookieConsentStorage

### Community 47 - "prettier"
Cohesion: 0.18
Nodes (10): Auditoria backend ↔ frontend, Backend sem experiência completa no frontend, Baixa prioridade ou uso interno, Correções aplicadas, Escopo e método, Evolução recomendada, Ordem sugerida, Prioridade alta (+2 more)

### Community 48 - "tailwindcss"
Cohesion: 0.28
Nodes (7): ProfileSettingsPanel(), PrivateRoute(), PrivateRouteProps, useAuth(), MasterAdminDashboard(), ProfileSettingsFormData, ProfileSettingsSchema

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.24
Nodes (8): TeamManager(), TeamManagerProps, ALL_PERMISSIONS, EmployeePermission, PERMISSION_LABELS, TeamMemberFormData, TeamMemberSchema, EmployeePermission

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.29
Nodes (9): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+1 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.13
Nodes (14): MOVEMENT_LABEL, Props, CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options (+6 more)

### Community 53 - "@types/react"
Cohesion: 0.10
Nodes (18): brl, PackageCatalog(), PackageCatalogProps, ListMeta, PackageCatalogFormData, PackageCatalogSchema, ClientPackage, ClientPackageStatus (+10 more)

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.17
Nodes (6): Claude, Inventário de scripts — Frontend (`agendai`), Observações, Gemini, AgendAI — Frontend, Rodar localmente

### Community 55 - "typescript"
Cohesion: 0.11
Nodes (21): QueueItemCard(), item, service, busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps (+13 more)

### Community 56 - "typescript-eslint"
Cohesion: 0.21
Nodes (11): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, getWeatherIcon(), RISK_STYLES, WeatherForecastWidget(), WeatherForecastWidgetProps, financialApi (+3 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.19
Nodes (25): AppointmentBookingModal(), fieldClass(), AppointmentScheduler(), firstOpenDate(), BookPackageSessionsModal(), PickedSlot, ScheduleExceptionsSection(), Avatar() (+17 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.06
Nodes (40): DepositIndicators(), DepositIndicatorsProps, STATUS_LABELS, STATUS_STYLES, confidenceBadge, EnhancedForecastPanel(), maturityLabel(), shortDate() (+32 more)

### Community 59 - "vite"
Cohesion: 0.60
Nodes (4): useSubscription(), AccessBlockedPage(), BlockInfo, formatDate()

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.19
Nodes (14): AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, DAY_NAMES, DEFAULT_SCHEDULE (+6 more)

### Community 61 - "vitest"
Cohesion: 0.15
Nodes (13): MarketingFooter(), MarketingNav(), pageLinks, scrollToSection(), sectionLinks, LandingPage(), marqueeItems, planFeatures (+5 more)

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.22
Nodes (10): ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload(), THEMES, useChart(), FloatingPathsBackground() (+2 more)

### Community 64 - "autoprefixer"
Cohesion: 0.14
Nodes (13): companyLinks, exploreLinks, platformLinks, socialLinks, PricingPersuasionChartsProps, trialCampaign, AboutPage(), beats (+5 more)

### Community 65 - "OwnerSubscriptionPanel.tsx"
Cohesion: 0.21
Nodes (10): App(), BarbershopFiltersProvider(), AccessState, deriveAccessState(), deriveHasDashboard(), SubscriptionContext, SubscriptionProvider(), root (+2 more)

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
Cohesion: 0.27
Nodes (9): PricingPersuasionCharts(), NotFoundPage(), matrix, objections, PlansPage(), hasPanelAccess(), isPaidSubscription(), needsPaywallAfterAuth() (+1 more)

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.12
Nodes (15): downloadPostImage(), MODE_LABEL, MODE_OPTIONS, PostsManager(), PostTone, PostType, QUICK_PRESETS, TEMPLATE_COLORS (+7 more)

### Community 74 - "@testing-library/user-event"
Cohesion: 0.18
Nodes (11): CONDITIONS, DISCOUNT_TYPES, INITIAL_FORM, RULE_TYPE_LABELS, RULE_TYPES, RuleForm, STATUS_COLORS, PriceEvaluation (+3 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.13
Nodes (14): installSteps, PwaInstallCard(), PwaInstallCardProps, BeforeInstallPromptEvent, isStandaloneDisplay(), PwaInstallContext, PwaInstallContextValue, PwaInstallProvider() (+6 more)

### Community 76 - "scripts"
Cohesion: 0.32
Nodes (11): BarbershopContext, BarbershopProvider(), isShopStaffRole(), BarbershopData, ShopStatusPayload, ManualShopStatus, OpeningMode, ScheduleException (+3 more)

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.24
Nodes (19): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, ClientsSection, ClientsTab(), ClientsTabProps (+11 more)

### Community 79 - "index.tsx"
Cohesion: 0.36
Nodes (4): WalletPanel(), walletApi, WalletBalance, WalletEntry

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.27
Nodes (10): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, brl, digitsOnly(), formatBrPhone(), shopInitials(), ShopProfile(), todaySchedule() (+2 more)

### Community 81 - "MarketingNav.tsx"
Cohesion: 0.29
Nodes (7): JsonLd, SeoHead(), SeoHeadProps, upsertJsonLd(), upsertLink(), upsertMeta(), sections

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
Cohesion: 0.50
Nodes (3): dependencies, devDependencies, Inventário de pacotes — Frontend (agendai)

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.22
Nodes (15): pickPlanForCheckout(), PlanBillingCycle, plansApi, formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps (+7 more)

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.14
Nodes (13): ConsentCheckbox(), ConsentCheckboxProps, FieldProps, inputClass(), LoginPageProps, QUEUE_MOCK, RegisterStep, Tab (+5 more)

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.14
Nodes (12): DEPOSIT_REQUIRED_OPTIONS, NO_SHOW_RULE_OPTIONS, REFUND_RULE_OPTIONS, INITIAL_CONFIG, LoyaltyConfig, LoyaltyPanel(), Field(), FieldProps (+4 more)

### Community 95 - "errorMessage"
Cohesion: 0.11
Nodes (16): BookingFormData, INITIAL_BOOKING_FORM, INITIAL_FORM, ResourceFormData, STATUS_LABELS, STATUS_STYLES, TYPE_LABELS, DataTableStateProps (+8 more)

### Community 96 - "FeaturesPage.tsx"
Cohesion: 0.31
Nodes (7): AuthContext, AuthContextValue, AuthResult, authApi, AuthResponse, AuthUser, RegisterPayload

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.32
Nodes (7): CatalogManager(), OperationModeSection(), ShopFloorControls(), ShopFloorControlsProps, statusCopy(), VouchersPanel(), useBarbershop()

### Community 98 - "ApiError"
Cohesion: 0.18
Nodes (6): ErrorBoundary, Props, State, SystemStatePage(), getLastCorrelationId(), logger

### Community 99 - "PublicAppointmentManagePage.tsx"
Cohesion: 0.13
Nodes (12): PRIORITY_CONFIG, INITIAL_FORM, STATUS_LABELS, STATUS_STYLES, WaitlistFormData, ConfirmDialog(), ConfirmDialogProps, Recommendation (+4 more)

### Community 100 - "goalsApi.ts"
Cohesion: 0.38
Nodes (6): applyDocumentTheme(), getInitialTheme(), Theme, ThemeContext, ThemeContextValue, ThemeProvider()

### Community 101 - "OperationMode"
Cohesion: 0.24
Nodes (13): AddCustomerForm(), clientPhoneLabel(), ClientsManager(), ClientsManagerProps, QueueAlertSettings(), SettingsManager(), clientsApi, ClientCreateFormData (+5 more)

### Community 102 - "AnalyticsListener.tsx"
Cohesion: 0.33
Nodes (5): comparison, DashboardPage(), hourHeat, staffRows, weekBars

### Community 103 - "commissionsApi.ts"
Cohesion: 0.21
Nodes (8): INITIAL_FORM, STATUS_COLORS, TYPE_LABELS, VOUCHER_TYPES, VoucherForm, Voucher, vouchersApi, VoucherUsage

### Community 104 - "GiftCardsPanel.tsx"
Cohesion: 0.24
Nodes (7): INITIAL_FORM, PurchaseForm, STATUS_COLORS, STATUS_LABELS, GiftCard, giftCardsApi, GiftCardUsage

### Community 105 - "enhancedForecastApi.ts"
Cohesion: 0.23
Nodes (8): DAY_LABELS, DAYS, STATUS_COLORS, STATUS_LABELS, staffApi, StaffScheduleEntry, StaffService, TimeOffRequest

### Community 106 - "README.md"
Cohesion: 0.29
Nodes (6): FIELD_TYPE_LABELS, FIELD_TYPES, Form, FormField, FormResponse, formsApi

### Community 107 - "ProductsHub.tsx"
Cohesion: 0.47
Nodes (5): PublicLinkPanel(), PublicLinkPanelProps, qrUrl(), TabDef, OperationMode

### Community 108 - "reputationApi.ts"
Cohesion: 0.29
Nodes (6): ReputationPanel(), sentimentIcon(), reputationApi, ReputationStats, Review, ReviewResponse

### Community 109 - "PasswordInput.tsx"
Cohesion: 0.18
Nodes (9): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel (+1 more)

### Community 110 - "qualityApi.ts"
Cohesion: 0.33
Nodes (5): QualityPanel(), qualityApi, QualityAudit, QualityOverview, QualityProtocol

### Community 111 - "CopilotPanel.tsx"
Cohesion: 0.13
Nodes (9): CopilotPanel(), priorityLabel(), OrganizationsPanel(), authStorage, CommissionEntry, copilotApi, CopilotSuggestion, Organization (+1 more)

### Community 112 - "corporateApi.ts"
Cohesion: 0.21
Nodes (7): CorporatePanel(), BarbershopFiltersContext, BarbershopFiltersValue, DateRange, corporateApi, CorporatePlan, CorporateSubscription

### Community 113 - "purchasingApi.ts"
Cohesion: 0.36
Nodes (4): PurchasingPanel(), PurchaseOrder, PurchaseOrderItem, purchasingApi

### Community 115 - "AiPredictivePage.tsx"
Cohesion: 0.15
Nodes (4): softwareApplicationLd(), AiPredictivePage(), FeaturesPage(), SchedulingPage()

### Community 116 - "data"
Cohesion: 0.27
Nodes (12): DepositPolicyPanel(), FormsPanel(), GiftCardsPanel(), RecommendationsPanel(), ResourcesPanel(), ServiceManager(), SmartPricingPanel(), StaffManagementPanel() (+4 more)

### Community 118 - "ServiceBookingSelector.tsx"
Cohesion: 0.33
Nodes (4): Addon, Combo, ServiceBookingSelectorProps, Variation

### Community 120 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.50
Nodes (3): Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade

## Knowledge Gaps
- **488 isolated node(s):** `root`, `findings`, `root`, `errors`, `entryFiles` (+483 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `subscriptionsApi.ts` to `StaffDashboard.tsx`, `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `devDependencies`, `CheckoutPage.tsx`, `BillingTab.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `adminApi.ts`, `MarketingNav.tsx`, `paymentsApi.ts`, `MarketingFooter.tsx`, `apiClient.ts`, `ContactPage.tsx`, `AiPredictivePage.tsx`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `eslint-config-prettier`, `eslint-plugin-jsx-a11y`, `jsdom`, `tailwindcss`, `@tailwindcss/postcss`, `@testing-library/react`, `@types/react`, `typescript`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `AboutPage.tsx`, `PostsManager.tsx`, `@testing-library/user-event`, `index.tsx`, `ShopProfile.tsx`, `AboutPage.tsx`, `CheckoutPage.tsx`, `ForgotPasswordPage.tsx`, `errorMessage`, `FeaturesPage.tsx`, `Mapa de domínio — Frontend ↔ API`, `PublicAppointmentManagePage.tsx`, `OperationMode`, `commissionsApi.ts`, `GiftCardsPanel.tsx`, `enhancedForecastApi.ts`, `README.md`, `reputationApi.ts`, `qualityApi.ts`, `CopilotPanel.tsx`, `corporateApi.ts`, `purchasingApi.ts`, `data`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `tailwindcss` to `StaffDashboard.tsx`, `MasterAdminDashboard.tsx`, `subscriptionsApi.ts`, `AiPredictivePage.tsx`, `CookieConsent.tsx`, `ErrorBoundary.tsx`, `eslint-config-prettier`, `eslint-plugin-jsx-a11y`, `@tailwindcss/postcss`, `typescript`, `@typescript-eslint/parser`, `vite`, `vitest`, `OwnerSubscriptionPanel.tsx`, `AboutPage.tsx`, `scripts`, `CheckoutPage.tsx`, `AccessBlockedPage.tsx`, `FeaturesPage.tsx`, `goalsApi.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `authStorage` connect `CopilotPanel.tsx` to `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `devDependencies`, `adminApi.ts`, `OwnerReferralsPanel.tsx`, `MarketingNav.tsx`, `paymentsApi.ts`, `apiClient.ts`, `AiPredictivePage.tsx`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `AppointmentBookingModal.tsx`, `ErrorBoundary.tsx`, `eslint-config-prettier`, `jsdom`, `@types/react`, `@typescript-eslint/parser`, `@testing-library/user-event`, `index.tsx`, `AboutPage.tsx`, `AccessBlockedPage.tsx`, `ForgotPasswordPage.tsx`, `errorMessage`, `FeaturesPage.tsx`, `PublicAppointmentManagePage.tsx`, `commissionsApi.ts`, `GiftCardsPanel.tsx`, `enhancedForecastApi.ts`, `README.md`, `reputationApi.ts`, `qualityApi.ts`, `corporateApi.ts`, `purchasingApi.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `root` to the rest of the system?**
  _488 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08858858858858859 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._
- **Should `BillingTab.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07152496626180836 - nodes in this community are weakly interconnected._