# Graph Report - agendai  (2026-09-09)

## Corpus Check
- 253 files · ~178,222 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1447 nodes · 3403 edges · 106 communities (95 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d61931a`
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
- enhancedForecastApi.ts
- README.md

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 118 edges
2. `useAuth()` - 43 edges
3. `apiClient()` - 37 edges
4. `Service` - 36 edges
5. `useBarbershopFilters()` - 35 edges
6. `authStorage` - 31 edges
7. `maskPhone()` - 30 edges
8. `StaffMember` - 29 edges
9. `normalizePhoneBR()` - 23 edges
10. `useBarbershop()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --indirect_call--> `token()`  [INFERRED]
  src/pages/LoginPage.tsx → src/infra/subscriptionsApi.ts
- `AddCustomerFormProps` --references--> `Service`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → src/types.ts
- `AppointmentScheduler()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/AppointmentScheduler.tsx → src/infra/crmApi.ts
- `ClientProfileSheet()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/ClientProfileSheet.tsx → src/infra/crmApi.ts
- `DepositIndicators()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/DepositIndicators.tsx → src/infra/crmApi.ts

## Import Cycles
- None detected.

## Communities (106 total, 11 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.14
Nodes (18): PublicLinkPanel(), PublicLinkPanelProps, qrUrl(), ReturnToQueueModal(), StaffNavigation(), StaffNavigationProps, visibleTabs(), ALL_TAB_IDS (+10 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.47
Nodes (3): PRIORITY_CONFIG, Recommendation, recommendationsApi

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.17
Nodes (10): ShopWeatherDay, CreateExpenseBody, CreateFiadoBody, ExpenseCategory, ExpenseItem, FiadoItem, FiadoPayment, FinancialSummary (+2 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.22
Nodes (4): authStorage, CommissionEntry, goalsApi, ProfessionalGoal

### Community 4 - "devDependencies"
Cohesion: 0.07
Nodes (36): ClientCard(), ClientTableRow(), CrmIntelligencePanel(), Kpi(), money(), Props, segmentOptions, shortDate() (+28 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.16
Nodes (14): brl, PAYMENT_LABEL, ProfileTab, shortDate(), ClientEditFormData, ClientEditSchema, APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_STYLE (+6 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (22): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, EXPENSE_TYPE_LABELS, formatDateTime() (+14 more)

### Community 7 - "dependencies"
Cohesion: 0.10
Nodes (25): AddCustomerForm(), AddCustomerFormProps, ProfileSettingsPanel(), ClientCreateFormData, ClientCreateSchema, CustomerQueueFormData, CustomerQueueSchema, CustomerQueueStaffFormData (+17 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.09
Nodes (14): BillingTab(), AuditLogDrawerProps, COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal(), ManageBarbershopModalProps, METRIC_CHART_CONFIG (+6 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.10
Nodes (19): adminApi, AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs (+11 more)

### Community 11 - "App.tsx"
Cohesion: 0.07
Nodes (28): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, ClientPortalPage, CommercialIntentPage, ContactPage, DashboardPage (+20 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.23
Nodes (14): AccessBlockedCode, apiClient(), ApiRequestOptions, buildApiError(), calls, checkRateLimit(), HttpMethod, NO_REFRESH_PATHS (+6 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.18
Nodes (10): ClientPortalDashboard(), PortalTab, TABS, ClientPortalLogin(), ClientPortalLoginProps, ClientAppointment, ClientBenefit, ClientIdentity (+2 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.20
Nodes (10): CatalogManager(), CatalogTab, ProductCatalogPanel(), OperationModeSection(), ShowcasePanel(), useBarbershop(), catalogApi, ServiceAddon (+2 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.11
Nodes (31): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), clientPhoneLabel(), ClientProfileSheet(), clientPhoneLabel(), ClientsManager() (+23 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.33
Nodes (5): destinations, OnboardingMissions(), Props, Step, titles

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.15
Nodes (13): actionClassName, SystemStateAction, SystemStatePage(), SystemStatePageProps, pageLinks, sectionLinks, Logo(), LogoProps (+5 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 23 - "AiPredictivePage.tsx"
Cohesion: 0.22
Nodes (8): CashPanel(), INITIAL_FORM, MOVEMENT_TYPE_LABELS, MovementFormData, MovementType, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS, PaymentMethod

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.09
Nodes (29): Props, QueueCapacityBanner(), BarbershopContext, BarbershopProvider(), isShopStaffRole(), AddPostPayload, AddServicePayload, barbershopApi (+21 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.21
Nodes (6): ShowcasePublicPage(), showcaseApi, ShowcaseEntry, formatApiFieldErrors(), isNetworkError(), messageForStatus()

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.18
Nodes (10): ProfileAvatarSection(), ProfileAvatarSectionProps, AuthContext, AuthContextValue, AuthResult, authApi, AuthResponse, AuthUser (+2 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.17
Nodes (11): Payment, CancelResponse, Invoice, PayerIdentification, PlanBillingCycle, SetupTrialCardPayload, SubscribePayload, Subscription (+3 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.23
Nodes (8): ClientsManagerProps, METHODS, Props, RetailCartItem, clientsApi, ListMeta, RetailPaymentMethod, SalonClient

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
Cohesion: 0.20
Nodes (10): StatusBadge(), StatusBadgeProps, Tone, TONES, APPOINTMENT_STATUS_LABELS, getStatusLabel(), NOTIFICATION_STATUS_LABELS, PAYMENT_STATUS_LABELS (+2 more)

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.07
Nodes (27): busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps, ErrorBoundary, Props, State (+19 more)

### Community 41 - "eslint-config-prettier"
Cohesion: 0.05
Nodes (53): CatalogTemplateModal(), Props, Props, SEGMENTS, ProductFormModal(), Props, MOVEMENT_LABEL, PAYMENT_LABEL (+45 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.18
Nodes (11): EMPTY_META, errorMessage(), OwnerFinancialPanel(), Tab, TABS, todayIso(), ExpenseSummary, ExpenseFormData (+3 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 44 - "jsdom"
Cohesion: 0.25
Nodes (7): CYCLE_LABELS, INITIAL_PLAN_FORM, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_STYLES, MembershipsPanel(), PlanFormData, Tab

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
Cohesion: 0.36
Nodes (6): Toast(), ToastProps, useScheduling(), PublicHome(), PublicTab, visiblePublicTabs()

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.19
Nodes (10): TeamManager(), TeamManagerProps, Field(), FieldProps, ALL_PERMISSIONS, EmployeePermission, PERMISSION_LABELS, TeamMemberFormData (+2 more)

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.29
Nodes (9): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+1 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.33
Nodes (3): waitlistApi, WaitlistEntry, WaitlistOffer

### Community 53 - "@types/react"
Cohesion: 0.13
Nodes (16): BookPackageSessionsModalProps, PickedSlot, brl, PackageCatalogProps, packagesApi, PackageCatalogFormData, PackageCatalogSchema, ClientPackage (+8 more)

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.15
Nodes (7): Claude, Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade, Inventário de scripts — Frontend (`agendai`), Observações, Gemini

### Community 55 - "typescript"
Cohesion: 0.10
Nodes (24): FinancialDashboardProps, PackageCatalog(), QueueItemCard(), QueueItemCardProps, item, service, ReturnToQueueModalProps, Addon (+16 more)

### Community 56 - "typescript-eslint"
Cohesion: 0.21
Nodes (11): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, getWeatherIcon(), RISK_STYLES, WeatherForecastWidget(), WeatherForecastWidgetProps, financialApi (+3 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.15
Nodes (31): AppointmentBookingModal(), fieldClass(), AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS (+23 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.22
Nodes (12): DepositIndicators(), DepositIndicatorsProps, STATUS_LABELS, STATUS_STYLES, brlFormatter, compactBrlFormatter, formatCurrencyBRL(), formatDateBR() (+4 more)

### Community 59 - "vite"
Cohesion: 0.20
Nodes (14): useAuth(), AccessState, deriveAccessState(), deriveHasDashboard(), SubscriptionContext, SubscriptionContextValue, SubscriptionProvider(), useSubscription() (+6 more)

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.24
Nodes (9): Avatar(), AvatarProps, AvatarSize, COLORS, getColorClass(), getInitials(), SIZE_MAP, Header() (+1 more)

### Community 61 - "vitest"
Cohesion: 0.22
Nodes (9): MarketingNav(), scrollToSection(), LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent (+1 more)

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.28
Nodes (5): DataTableStateProps, EmptyState(), EmptyStateProps, SectionError(), SectionErrorProps

### Community 64 - "autoprefixer"
Cohesion: 0.14
Nodes (6): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, AiPredictivePage()

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
Cohesion: 0.21
Nodes (10): PricingPersuasionCharts(), PricingPersuasionChartsProps, trialCampaign, daySlots, flowSteps, pros, matrix, objections (+2 more)

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.14
Nodes (13): downloadPostImage(), MODE_LABEL, MODE_OPTIONS, PostsManager(), PostTone, PostType, QUICK_PRESETS, TEMPLATE_COLORS (+5 more)

### Community 74 - "@testing-library/user-event"
Cohesion: 0.40
Nodes (3): JoinQueuePayload, ListAppointmentsParams, QueueUpdatePayload

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.05
Nodes (37): App(), installSteps, PwaInstallCard(), PwaInstallCardProps, PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER (+29 more)

### Community 76 - "scripts"
Cohesion: 0.11
Nodes (20): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL (+12 more)

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.28
Nodes (15): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, ClientProfileSheetProps, ClientsSection, ClientsTab(), ClientsTabProps, initialPeriod() (+7 more)

### Community 79 - "index.tsx"
Cohesion: 0.16
Nodes (14): DEPOSIT_REQUIRED_OPTIONS, DepositPolicyPanel(), NO_SHOW_RULE_OPTIONS, REFUND_RULE_OPTIONS, INITIAL_CONFIG, LoyaltyConfig, LoyaltyPanel(), ShopFloorControls() (+6 more)

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.27
Nodes (10): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, brl, digitsOnly(), formatBrPhone(), shopInitials(), ShopProfile(), todaySchedule() (+2 more)

### Community 81 - "MarketingNav.tsx"
Cohesion: 0.22
Nodes (8): JsonLd, SeoHead(), SeoHeadProps, upsertJsonLd(), upsertLink(), upsertMeta(), sections, sections

### Community 82 - "credit-card-form.tsx"
Cohesion: 0.40
Nodes (4): Arquitetura frontend e princípios, Formulários, Organização atual (não impor classes de backend ao React), SOLID / Clean Code (exemplos locais)

### Community 84 - "Arquitetura do frontend"
Cohesion: 0.40
Nodes (4): Arquitetura do frontend, Auditoria, Estrutura, Regras

### Community 85 - "AboutPage.tsx"
Cohesion: 0.29
Nodes (9): formatMetricValue(), GoalFormData, GoalMetric, GoalsPanel(), INITIAL_FORM, METRIC_LABELS, progressColor(), progressWidth() (+1 more)

### Community 86 - "Inventário de pacotes — Frontend (agendai)"
Cohesion: 0.50
Nodes (3): dependencies, devDependencies, Inventário de pacotes — Frontend (agendai)

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.20
Nodes (16): pickPlanForCheckout(), PlanBillingCycle, plansApi, formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps (+8 more)

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.17
Nodes (10): TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, ConsentCheckbox(), ConsentCheckboxProps, Plan, FieldProps, LoginPageProps, QUEUE_MOCK (+2 more)

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.29
Nodes (4): LoyaltyAccount, loyaltyApi, LoyaltyLedgerEntry, LoyaltyProgram

### Community 95 - "errorMessage"
Cohesion: 0.33
Nodes (7): errorMessage(), formatDate(), PlanFormModal(), PlansSection(), RefundsSection(), RevenueSection(), SubscriptionsSection()

### Community 96 - "FeaturesPage.tsx"
Cohesion: 0.18
Nodes (7): softwareApplicationLd(), AboutPage(), beats, beliefs, friendships, FeaturesPage(), SchedulingPage()

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.24
Nodes (10): ActivationChecklist(), confidenceBadge, EnhancedForecastPanel(), maturityLabel(), shortDate(), RecommendationsPanel(), ServiceManager(), data() (+2 more)

### Community 98 - "ApiError"
Cohesion: 0.13
Nodes (10): cashApi, CashMovement, CashSummary, ClientMembership, MembershipBenefit, MembershipCycle, MembershipPlan, membershipsApi (+2 more)

### Community 99 - "PublicAppointmentManagePage.tsx"
Cohesion: 0.25
Nodes (7): INITIAL_FORM, STATUS_LABELS, STATUS_STYLES, WaitlistFormData, WaitlistPanel(), ConfirmDialog(), ConfirmDialogProps

### Community 100 - "goalsApi.ts"
Cohesion: 0.40
Nodes (5): classes, FiadoStatusBadge(), FiadoStatusBadgeProps, FiadoStatus, FIADO_STATUS_LABELS

### Community 101 - "OperationMode"
Cohesion: 0.33
Nodes (3): AppointmentDeposit, DepositPolicy, depositsApi

### Community 102 - "AnalyticsListener.tsx"
Cohesion: 0.33
Nodes (5): comparison, DashboardPage(), hourHeat, staffRows, weekBars

### Community 105 - "enhancedForecastApi.ts"
Cohesion: 0.33
Nodes (3): EnhancedForecast, enhancedForecastApi, ForecastFactor

## Knowledge Gaps
- **451 isolated node(s):** `root`, `findings`, `root`, `errors`, `entryFiles` (+446 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `MarketingFooter.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `devDependencies`, `CheckoutPage.tsx`, `BillingTab.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `adminApi.ts`, `MarketingNav.tsx`, `paymentsApi.ts`, `apiClient.ts`, `subscriptionsApi.ts`, `ContactPage.tsx`, `AiPredictivePage.tsx`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `Run and deploy your AI Studio app`, `ErrorBoundary.tsx`, `eslint-config-prettier`, `eslint-plugin-jsx-a11y`, `jsdom`, `@tailwindcss/postcss`, `@types/react`, `typescript`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `AboutPage.tsx`, `PostsManager.tsx`, `PwaInstallContext.tsx`, `scripts`, `index.tsx`, `ShopProfile.tsx`, `AboutPage.tsx`, `CheckoutPage.tsx`, `errorMessage`, `Mapa de domínio — Frontend ↔ API`, `PublicAppointmentManagePage.tsx`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `vite` to `StaffDashboard.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `App.tsx`, `paymentsApi.ts`, `MarketingFooter.tsx`, `SubscriptionContext.tsx`, `AiPredictivePage.tsx`, `DashboardPage.tsx`, `CookieConsent.tsx`, `ErrorBoundary.tsx`, `eslint-config-prettier`, `tailwindcss`, `@tailwindcss/postcss`, `vitest`, `AboutPage.tsx`, `PwaInstallContext.tsx`, `AboutPage.tsx`, `CheckoutPage.tsx`, `AccessBlockedPage.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `authStorage` connect `schedulingUtils.ts` to `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `devDependencies`, `adminApi.ts`, `OwnerReferralsPanel.tsx`, `MarketingNav.tsx`, `paymentsApi.ts`, `MarketingFooter.tsx`, `apiClient.ts`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `AppointmentBookingModal.tsx`, `ErrorBoundary.tsx`, `eslint-config-prettier`, `@testing-library/react`, `@types/react`, `@testing-library/user-event`, `scripts`, `AccessBlockedPage.tsx`, `ForgotPasswordPage.tsx`, `ApiError`, `OperationMode`, `enhancedForecastApi.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `root` to the rest of the system?**
  _451 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaffDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14245014245014245 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07149758454106281 - nodes in this community are weakly interconnected._
- **Should `BillingTab.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07459677419354839 - nodes in this community are weakly interconnected._