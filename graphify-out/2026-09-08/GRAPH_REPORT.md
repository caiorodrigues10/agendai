# Graph Report - agendai  (2026-09-08)

## Corpus Check
- 235 files · ~167,024 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1357 nodes · 3175 edges · 101 communities (89 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2c5d2126`
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

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 102 edges
2. `useAuth()` - 43 edges
3. `Service` - 34 edges
4. `apiClient()` - 31 edges
5. `maskPhone()` - 30 edges
6. `StaffMember` - 29 edges
7. `useBarbershopFilters()` - 25 edges
8. `authStorage` - 25 edges
9. `normalizePhoneBR()` - 23 edges
10. `ShopSettings` - 19 edges

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

## Communities (101 total, 12 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.16
Nodes (14): StaffNavigation(), StaffNavigationProps, visibleTabs(), ALL_TAB_IDS, canAccessTab(), canAccessTabByMode(), getDefaultTab(), MOBILE_PRIMARY_TAB_IDS (+6 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.17
Nodes (12): PackageCatalog(), PRIORITY_CONFIG, RecommendationsPanel(), ServiceForm(), ServiceManager(), ServiceManagerProps, ConfirmDialog(), ConfirmDialogProps (+4 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.10
Nodes (21): EMPTY_META, errorMessage(), OwnerFinancialPanel(), Tab, TABS, todayIso(), ShopWeatherDay, CreateExpenseBody (+13 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.12
Nodes (5): ForecastFactor, LoyaltyAccount, LoyaltyLedgerEntry, buildQuery(), QueryValue

### Community 4 - "devDependencies"
Cohesion: 0.08
Nodes (33): brl, PAYMENT_LABEL, ProfileTab, shortDate(), ClientCard(), ClientTableRow(), CrmIntelligencePanel(), Kpi() (+25 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.18
Nodes (12): CatalogTemplateModal(), Props, Props, SEGMENTS, ProductFormModal(), Props, CatalogTemplatePreview, ProductCategory (+4 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (22): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, EXPENSE_TYPE_LABELS, formatDateTime() (+14 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (14): ConsentCheckbox(), ConsentCheckboxProps, FieldProps, inputClass(), LoginPageProps, QUEUE_MOCK, RegisterStep, Tab (+6 more)

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
Cohesion: 0.08
Nodes (24): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, CommercialIntentPage, ContactPage, DashboardPage, EmailVerifiedPage (+16 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.18
Nodes (15): AccessBlockedCode, apiClient(), ApiRequestOptions, buildApiError(), calls, checkRateLimit(), HttpMethod, NO_REFRESH_PATHS (+7 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.20
Nodes (11): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload(), THEMES, useChart() (+3 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.15
Nodes (11): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, ThemeToggle(), useTheme(), getPasswordStrength() (+3 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.10
Nodes (30): AccountPrivacyPanel(), token(), ProductCatalogPanel(), ProfileAvatarSection(), ProfileAvatarSectionProps, AppointmentPolicySection(), BusinessSegmentSection(), DEFAULT_APPOINTMENT_POLICY (+22 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.13
Nodes (16): ActivationChecklist(), Props, destinations, OnboardingMissions(), Props, Step, titles, ProductsHub() (+8 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.13
Nodes (16): actionClassName, SystemStateAction, SystemStatePage(), SystemStatePageProps, pageLinks, sectionLinks, PricingPersuasionCharts(), Logo() (+8 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 23 - "AiPredictivePage.tsx"
Cohesion: 0.18
Nodes (15): AddCustomerFormProps, ServiceCard(), ClientEditSchema, CustomerQueueFormData, CustomerQueueSchema, CustomerQueueStaffFormData, CustomerQueueStaffSchema, whatsappOptional (+7 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.10
Nodes (34): BarbershopContext, BarbershopContextValue, BarbershopProvider(), isShopStaffRole(), AddPostPayload, AddServicePayload, AppointmentPolicy, BarbershopData (+26 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.21
Nodes (13): ReturnToQueueModalProps, sameSnapshot(), SchedulingContext, SchedulingContextValue, SchedulingProvider(), realtimeWsUrl(), QueueUpdatePayload, getQueueInsight() (+5 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.15
Nodes (13): AccountPrivacyPanelProps, ROLE_LABEL, AuthContext, AuthContextValue, AuthProvider(), AuthResult, authApi, AuthResponse (+5 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.09
Nodes (27): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, AccessState, deriveAccessState(), deriveHasDashboard() (+19 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.18
Nodes (15): AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, DAY_NAMES, DEFAULT_SCHEDULE (+7 more)

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
Cohesion: 0.20
Nodes (5): ErrorBoundary, Props, State, getLastCorrelationId(), logger

### Community 41 - "eslint-config-prettier"
Cohesion: 0.10
Nodes (21): MOVEMENT_LABEL, initialPeriod(), ProductReportsPanel(), Props, ProductSalesPanel(), ProductStockPanel(), Props, HubTab (+13 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.32
Nodes (11): AddCustomerForm(), clientPhoneLabel(), ClientProfileSheet(), clientPhoneLabel(), ClientsManager(), QueueAlertSettings(), SettingsManager(), maskPhone() (+3 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 44 - "jsdom"
Cohesion: 0.25
Nodes (8): brl(), FinancialDashboard(), isOwnerLike(), CommissionEntry, commissionsApi, CommissionSummary, BarbershopInsights, InsightsPeriod

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
Cohesion: 0.14
Nodes (15): QueueItemCard(), item, service, busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps (+7 more)

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.24
Nodes (8): TeamManager(), TeamManagerProps, ALL_PERMISSIONS, EmployeePermission, PERMISSION_LABELS, TeamMemberFormData, TeamMemberSchema, EmployeePermission

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.29
Nodes (9): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+1 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.21
Nodes (12): PAYMENT_LABEL, productMoney, SALE_STATUS_LABEL, Props, Props, RefundLineState, RefundSaleModal(), RetailSale (+4 more)

### Community 53 - "@types/react"
Cohesion: 0.16
Nodes (11): brl, PackageCatalogProps, CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options (+3 more)

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.17
Nodes (6): Claude, Inventário de scripts — Frontend (`agendai`), Observações, Gemini, AgendAI — Frontend, Rodar localmente

### Community 55 - "typescript"
Cohesion: 0.13
Nodes (14): ClientsManagerProps, ProfileSettingsPanel(), ServiceFormProps, ICON_OPTIONS, Field(), FieldProps, clientsApi, ListMeta (+6 more)

### Community 56 - "typescript-eslint"
Cohesion: 0.21
Nodes (11): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, getWeatherIcon(), RISK_STYLES, WeatherForecastWidget(), WeatherForecastWidgetProps, financialApi (+3 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.29
Nodes (18): AppointmentBookingModal(), fieldClass(), AppointmentScheduler(), firstOpenDate(), BookPackageSessionsModal(), PickedSlot, parseLocalISO(), ThemedCalendar() (+10 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.13
Nodes (18): CashPanel(), INITIAL_FORM, MOVEMENT_TYPE_LABELS, MovementFormData, MovementType, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS, PaymentMethod (+10 more)

### Community 59 - "vite"
Cohesion: 0.38
Nodes (6): METHODS, Props, RetailCartItem, RetailCheckoutBlock(), Product, RetailPaymentMethod

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
Cohesion: 0.14
Nodes (16): PricingPersuasionChartsProps, softwareApplicationLd(), trialCampaign, AboutPage(), beats, beliefs, friendships, comparison (+8 more)

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.12
Nodes (15): downloadPostImage(), MODE_LABEL, MODE_OPTIONS, PostsManager(), PostTone, PostType, QUICK_PRESETS, TEMPLATE_COLORS (+7 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.08
Nodes (23): App(), installSteps, PwaInstallCard(), PwaInstallCardProps, BeforeInstallPromptEvent, isStandaloneDisplay(), PwaInstallContext, PwaInstallContextValue (+15 more)

### Community 76 - "scripts"
Cohesion: 0.16
Nodes (13): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton(), ShareReferralButtonProps (+5 more)

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.27
Nodes (17): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, ClientsSection, ClientsTab(), ClientsTabProps (+9 more)

### Community 79 - "index.tsx"
Cohesion: 0.14
Nodes (17): confidenceBadge, EnhancedForecastPanel(), maturityLabel(), shortDate(), INITIAL_CONFIG, LoyaltyConfig, LoyaltyPanel(), BarbershopFiltersContext (+9 more)

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
Cohesion: 0.17
Nodes (14): GoalFormData, GoalMetric, GoalsPanel(), INITIAL_FORM, METRIC_LABELS, progressColor(), progressWidth(), PrivateRoute() (+6 more)

### Community 86 - "Inventário de pacotes — Frontend (agendai)"
Cohesion: 0.50
Nodes (3): dependencies, devDependencies, Inventário de pacotes — Frontend (agendai)

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.29
Nodes (13): pickPlanForCheckout(), formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps, LoginPage(), isValidCnpj() (+5 more)

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.31
Nodes (9): formatMetricValue(), TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, useSubscription(), Plan, AccessBlockedPage(), BlockInfo, formatDate() (+1 more)

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.52
Nodes (5): ForgotPasswordPage(), inputClass(), getRecaptchaToken(), loadScript(), useRecaptchaBadge()

### Community 95 - "errorMessage"
Cohesion: 0.33
Nodes (7): errorMessage(), formatDate(), PlanFormModal(), PlansSection(), RefundsSection(), RevenueSection(), SubscriptionsSection()

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.50
Nodes (3): Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade

### Community 99 - "PublicAppointmentManagePage.tsx"
Cohesion: 0.67
Nodes (3): Appointment, isoDate(), PublicAppointmentManagePage()

## Knowledge Gaps
- **423 isolated node(s):** `root`, `findings`, `root`, `errors`, `entryFiles` (+418 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `MarketingFooter.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `devDependencies`, `CheckoutPage.tsx`, `BillingTab.tsx`, `MasterAdminDashboard.tsx`, `adminApi.ts`, `apiClient.ts`, `subscriptionsApi.ts`, `ContactPage.tsx`, `SubscriptionContext.tsx`, `AiPredictivePage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `eslint-config-prettier`, `eslint-plugin-jsx-a11y`, `tailwindcss`, `@tailwindcss/postcss`, `@testing-library/react`, `@types/react`, `typescript`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `vite`, `PostsManager.tsx`, `scripts`, `index.tsx`, `ShopProfile.tsx`, `AboutPage.tsx`, `CheckoutPage.tsx`, `errorMessage`, `PublicAppointmentManagePage.tsx`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `AboutPage.tsx` to `StaffDashboard.tsx`, `CheckoutPage.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `MarketingFooter.tsx`, `subscriptionsApi.ts`, `SubscriptionContext.tsx`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `eslint-config-prettier`, `tailwindcss`, `@tailwindcss/postcss`, `@testing-library/react`, `typescript`, `@typescript-eslint/parser`, `vitest`, `PwaInstallContext.tsx`, `CheckoutPage.tsx`, `AccessBlockedPage.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `authStorage` connect `CookieConsent.tsx` to `OwnerFinancialPanel.tsx`, `schedulingUtils.ts`, `devDependencies`, `goalsApi.ts`, `AppointmentBookingModal.tsx`, `dependencies`, `eslint-config-prettier`, `adminApi.ts`, `@testing-library/user-event`, `OwnerReferralsPanel.tsx`, `jsdom`, `scripts`, `apiClient.ts`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `AboutPage.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `root` to the rest of the system?**
  _423 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10461538461538461 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08013937282229965 - nodes in this community are weakly interconnected._