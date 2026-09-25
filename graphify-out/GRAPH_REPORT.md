# Graph Report - agendai  (2026-09-25)

## Corpus Check
- 366 files · ~261,945 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2114 nodes · 4967 edges · 141 communities (129 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9dad83c3`
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
- FiscalPanel.tsx
- errorMessage.ts
- audit-frontend-structure.mjs
- PaginationBar.tsx
- copilot-instructions.md
- formatWhatsapp
- CheckoutPage.tsx
- AccessBlockedPage.tsx
- credit-card-form.tsx
- ForgotPasswordPage.tsx
- FinancialDashboard.tsx
- FeaturesPage.tsx
- Mapa de domínio — Frontend ↔ API
- ApiError
- GoalsPanel.tsx
- ProductReportsPanel.tsx
- goalsApi.ts
- softwareApplicationLd
- commissionsApi.ts
- GiftCardsPanel.tsx
- enhancedForecastApi.ts
- README.md
- SubscriptionContext.tsx
- reputationApi.ts
- PasswordInput.tsx
- qualityApi.ts
- CopilotPanel.tsx
- SeoHead.tsx
- purchasingApi.ts
- index.ts
- barbershopApi
- data
- ForgotPasswordPage.tsx
- BarbershopFiltersContext.tsx
- productsApi.ts
- CrmMergePanel.tsx
- AiPredictivePage.tsx
- ConfirmDialog.tsx
- LandingPage.tsx
- RetailCheckoutBlock.tsx
- credit-card-form.tsx
- PublicHome
- SubscriptionContext.tsx
- RetailCheckoutBlock.tsx
- TasksPage.tsx
- emailApi.ts
- Inventário de pacotes — Frontend (agendai)
- BarbershopFiltersContext.tsx
- walletApi.ts
- Mapa de domínio — Frontend ↔ API
- CorporatePanel.tsx
- AiPredictivePage.tsx
- StaffDashboard
- dateUtils.ts
- BillingPage.tsx

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 164 edges
2. `apiClient()` - 67 edges
3. `useBarbershopFilters()` - 65 edges
4. `useAuth()` - 53 edges
5. `authStorage` - 53 edges
6. `SmartSelect()` - 36 edges
7. `Service` - 35 edges
8. `maskPhone()` - 32 edges
9. `StaffMember` - 30 edges
10. `useBarbershop()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --indirect_call--> `token()`  [INFERRED]
  src/pages/LoginPage.tsx → src/infra/subscriptionsApi.ts
- `AddCustomerFormProps` --references--> `Service`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → src/types.ts
- `ClientProfileSheet()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/ClientProfileSheet.tsx → src/infra/crmApi.ts
- `GoalsPanel()` --indirect_call--> `metric()`  [INFERRED]
  src/components/domain/GoalsPanel.tsx → src/components/domain/FinancialDashboard.tsx
- `PackageCatalogProps` --references--> `Service`  [EXTRACTED]
  src/components/domain/PackageCatalog.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (141 total, 12 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.14
Nodes (14): TeamManager(), TeamManagerProps, Button, ButtonProps, ButtonSize, ButtonVariant, sizes, variants (+6 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (15): intentColor(), intentLabel(), statusColor(), statusLabel(), View, WhatsAppAIPanel(), AiConversation, AiIntentLog (+7 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.13
Nodes (17): EMPTY_META, errorMessage(), Tab, TABS, FinanceSummaryCard(), FinanceSummaryCardProps, EXPENSE_RECURRENCE_LABELS, EXPENSE_TYPE_LABELS (+9 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.15
Nodes (14): OwnerReferralsPanel(), OwnerReferralsPanelProps, STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton() (+6 more)

### Community 4 - "devDependencies"
Cohesion: 0.10
Nodes (31): SUPPORT_CATEGORY_LABELS, SUPPORT_FORM_CATEGORIES, SUPPORT_PRIORITY_LABELS, SUPPORT_STATUS_COLORS, SUPPORT_STATUS_LABELS, SupportFormCategory, toSupportCategory(), SupportReportDetail() (+23 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.17
Nodes (18): AddCustomerForm(), clientPhoneLabel(), ClientProfileSheet(), shortDate(), clientPhoneLabel(), ClientsManager(), ClientsManagerProps, QueueAlertSettings() (+10 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (28): BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS, formatDate() (+20 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (21): AdminLayout(), NAV_ITEMS, ProfileSettingsPanel(), ThemeToggle(), useAuth(), applyDocumentTheme(), getInitialTheme(), Theme (+13 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.11
Nodes (17): AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs, DashboardPeriod (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.23
Nodes (12): ClientCard(), ClientTableRow(), CrmIntelligencePanel(), FACTOR_LABELS, formatFactor(), IntelTab, Kpi(), money() (+4 more)

### Community 11 - "App.tsx"
Cohesion: 0.05
Nodes (38): AboutPage, AccessBlockedPage, AccountsPage, AdminLayout, AiPredictivePage, AuditPage, BillingPage, CheckoutPage (+30 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.13
Nodes (20): ACCESS_BLOCKED_CODES, AccessBlockedCode, apiClient(), apiFetch(), ApiRequestOptions, buildApiError(), calls, checkRateLimit() (+12 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.13
Nodes (19): PortalTab, TABS, asRecord(), ClientAppointment, ClientBenefit, clientFetch(), ClientIdentity, clientPortalApi (+11 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.14
Nodes (14): CYCLE_LABELS, INITIAL_PLAN_FORM, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_STYLES, PlanFormData, Tab, EmptyState(), EmptyStateProps (+6 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.08
Nodes (16): PromptModal(), PromptModalProps, AuditLogDrawerProps, BarbershopsTab(), COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal() (+8 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.06
Nodes (25): Toast(), ToastProps, adminInternalApi, Invitation, PaginatedResponse, Task, TaskComment, TaskHistory (+17 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.12
Nodes (16): ShowcasePublicPage(), asNumber(), CreateShowcaseEntryInput, normalizeEntry(), normalizeList(), ShowcaseAnalytics, showcaseApi, ShowcaseEntry (+8 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 20 - "IntersectionObserverMock"
Cohesion: 0.15
Nodes (5): IntersectionObserverMock, liveIntervals, nativeClearInterval, nativeSetInterval, ResizeObserverMock

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.14
Nodes (13): Payment, AsaasCreditCardPayload, CancelResponse, Invoice, PayerIdentification, PlanBillingCycle, PlanEconomics, SetupTrialCardPayload (+5 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 23 - "AiPredictivePage.tsx"
Cohesion: 0.13
Nodes (15): CashPanel(), INITIAL_FORM, MOVEMENT_TYPE_DISPLAY_LABELS, MOVEMENT_TYPE_LABELS, MovementFormData, MovementType, movementTypeOptions, PAYMENT_METHOD_ICONS (+7 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.12
Nodes (22): BarbershopContext, BarbershopProvider(), isShopStaffRole(), AddPostPayload, AddServicePayload, AppointmentPolicy, BarbershopData, PostConfigPayload (+14 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.25
Nodes (10): ShopWeatherDay, EnhancedForecast, enhancedForecastApi, EnhancedForecastReport, ForecastFactor, getForecastReport(), normalizePredictions(), token() (+2 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.27
Nodes (9): PricingPersuasionCharts(), NotFoundPage(), matrix, objections, PlansPage(), hasPanelAccess(), isPaidSubscription(), needsPaywallAfterAuth() (+1 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.09
Nodes (24): INITIAL_FORM, STATUS_COLORS, toDateInput(), TYPE_LABELS, VOUCHER_TYPES, VoucherForm, VouchersPanel(), voucherTypeOptions (+16 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.08
Nodes (22): CATEGORY_LABELS, CONDITION_LABELS, CONDITION_STYLES, EquipmentFormData, EquipmentPanel(), HubTab, INITIAL_EQUIP_FORM, INITIAL_MOVEMENT_FORM (+14 more)

### Community 31 - "PublicHome.test.tsx"
Cohesion: 0.21
Nodes (13): DepositIndicators(), DepositIndicatorsProps, STATUS_LABELS, STATUS_STYLES, RecurringPackagesPanel(), brlFormatter, compactBrlFormatter, formatCurrencyBRL() (+5 more)

### Community 36 - "LandingPage.tsx"
Cohesion: 0.18
Nodes (10): 1. Posicionamento, 2. Estrutura recomendada da landing, 3. Vídeo: onde colocar, 4. Use real screenshots, 5. Separação de login e cadastro, 6. PWA mobile-first, 7. Guardrails de marketing, 8. KPIs (+2 more)

### Community 37 - "AppointmentBookingModal.tsx"
Cohesion: 0.15
Nodes (12): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, ClientPackage, ClientPackageStatus, DaySchedule, PackagePaymentMethod, PostMedia, PostTemplate (+4 more)

### Community 38 - "ClientsManager.tsx"
Cohesion: 0.29
Nodes (6): 2026-08-28 — Redesign UX: Agenda (Salão/Profissional), 2026-08-28 — Upload de logo na tela Perfil, 2026-08-29 — Componente reutilizável ConfirmDialog + substituição no ServiceManager, 2026-08-29 — Fix: Erro cru do Google vazando pro usuário no upload de logo/avatar, 2026-08-29 — Redesign UX: unificar dois blocos de WhatsApp em Configurações, Backlog Técnico — Frontend

### Community 39 - "StaffMember"
Cohesion: 0.14
Nodes (15): StatusBadge(), StatusBadgeProps, Tone, TONES, classes, FiadoStatusBadge(), FiadoStatusBadgeProps, FiadoStatus (+7 more)

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.15
Nodes (14): AppointmentPolicySection(), BusinessSegmentSection(), DEFAULT_APPOINTMENT_POLICY, MODE_OPTIONS, OperationModeSectionProps, platformWhatsAppUnavailable(), SalonWhatsAppConnection(), SEGMENT_OPTIONS (+6 more)

### Community 41 - "eslint-config-prettier"
Cohesion: 0.20
Nodes (15): AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, calendarDateKey(), DAY_NAMES (+7 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.13
Nodes (20): clearDraft(), downloadImage(), draftKey(), EditorTab, FORMAT_OPTIONS, LocalDraftPayload, MODE_OPTIONS, ObjectiveId (+12 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 44 - "jsdom"
Cohesion: 0.19
Nodes (11): installSteps, PwaInstallCard(), PwaInstallCardProps, BeforeInstallPromptEvent, isStandaloneDisplay(), PwaInstallContext, PwaInstallContextValue, PwaInstallProvider() (+3 more)

### Community 45 - "playwright"
Cohesion: 0.20
Nodes (19): AnalyticsListener(), PRIVATE_PREFIXES, adsPurchaseLabel(), adsSignupLabel(), googleAdsId(), initAnalytics(), initGtag(), initMetaPixel() (+11 more)

### Community 46 - "postcss"
Cohesion: 0.40
Nodes (3): CookieConsent(), CookieConsentStatus, cookieConsentStorage

### Community 47 - "prettier"
Cohesion: 0.18
Nodes (10): Auditoria backend ↔ frontend, Backend sem experiência completa no frontend, Baixa prioridade ou uso interno, Correções aplicadas, Escopo e método, Evolução recomendada, Ordem sugerida, Prioridade alta (+2 more)

### Community 48 - "tailwindcss"
Cohesion: 0.08
Nodes (30): MOVEMENT_LABEL, PAYMENT_LABEL, PRODUCT_PURPOSE_LABEL, PRODUCT_PURPOSE_SHORT, productMoney, SALE_STATUS_LABEL, ProductSalesPanel(), Props (+22 more)

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.14
Nodes (21): CatalogPurpose, ProductCatalogPanel(), Props, PURPOSE_META, SEGMENTS, ProductFormModal(), Props, TITLE_CASE_EXCEPTIONS (+13 more)

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.21
Nodes (10): brl(), getCurrentPeriod(), pct(), ProfitEnginePanel(), ProfitEnginePanelProps, profitApi, ProfitEntry, ProfitPeriodData (+2 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.17
Nodes (14): PublicLinkPanel(), PublicLinkPanelProps, qrUrl(), StaffNavigation(), StaffNavigationProps, visibleTabs(), canAccessTab(), canAccessTabByMode() (+6 more)

### Community 53 - "@types/react"
Cohesion: 0.25
Nodes (7): CrmBackfillPanel(), RunSummary(), statusLabel(), auth, run, crmApi, CrmBackfillSchema

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.15
Nodes (7): Claude, dependencies, devDependencies, Inventário de pacotes — Frontend (agendai), Gemini, AgendAI — Frontend, Rodar localmente

### Community 55 - "typescript"
Cohesion: 0.14
Nodes (13): EmailHistoryPanel(), EmailHistoryPanelProps, LogEntry, STATUS_META, CATEGORIES, CategoryDef, EmailPreferencesPanel(), EmailPreferencesPanelProps (+5 more)

### Community 56 - "typescript-eslint"
Cohesion: 0.16
Nodes (18): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, dateLabel(), EnhancedForecastPanel(), getWeatherIcon(), RISK_STYLES, WeatherForecastWidget() (+10 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.19
Nodes (24): AppointmentBookingModal(), fieldClass(), AppointmentScheduler(), firstOpenDate(), BookPackageSessionsModal(), PickedSlot, Avatar(), AvatarProps (+16 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.25
Nodes (13): formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps, LoginPage(), isValidCnpj(), isValidCpf() (+5 more)

### Community 59 - "vite"
Cohesion: 0.19
Nodes (9): INITIAL_FORM, IntegrationsPanel(), STATUS_LABELS, STATUS_STYLES, SyncFormData, TYPE_META, Integration, integrationsApi (+1 more)

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.29
Nodes (12): backend, backendRoutes(), checkContract(), frontendRequests(), literal(), methods, normalize(), parse() (+4 more)

### Community 61 - "vitest"
Cohesion: 0.14
Nodes (20): CategoryManager(), Props, category, Harness(), mocks, PackageCatalog(), ServiceForm(), ServiceFormProps (+12 more)

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.14
Nodes (16): brl, PAYMENT_LABEL, ProfileTab, QueueItemCard(), item, service, clientsApi, ProcedureRecord (+8 more)

### Community 64 - "autoprefixer"
Cohesion: 0.22
Nodes (8): JsonLd, SeoHead(), SeoHeadProps, upsertJsonLd(), upsertLink(), upsertMeta(), sections, sections

### Community 65 - "OwnerSubscriptionPanel.tsx"
Cohesion: 0.20
Nodes (11): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload(), THEMES, useChart() (+3 more)

### Community 66 - "eslint-plugin-react-hooks"
Cohesion: 0.22
Nodes (9): 0. Regras essenciais (leia antes de editar), 1. O que é este app, 2. Como trabalhar, 3. Comandos frequentes, 4. Arquitetura (resumo), 5. Documentos legados, 6. Risco conhecido: Vitest `pool: 'threads'` trava após testes completarem, 7. Checklist rápido (+1 more)

### Community 67 - "QueueItemCard.tsx"
Cohesion: 0.25
Nodes (5): entryFiles, errors, inventoryFiles, pkg, root

### Community 68 - "clientsApi.ts"
Cohesion: 0.29
Nodes (7): Assinatura e acesso, Fila / agenda / híbrido, Notificações, Pacotes / fiado / produtos, Papéis, Pendências documentais, Regras de negócio (visão frontend)

### Community 69 - "postcss"
Cohesion: 0.10
Nodes (20): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, PricingPersuasionChartsProps, trialCampaign, AboutPage() (+12 more)

### Community 70 - "@types/node"
Cohesion: 0.33
Nodes (5): Comandos (PowerShell / bash), Delegação a subagentes, Graphify — Frontend, Procedimento obrigatório, Regras

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.12
Nodes (18): clearLocalDraft(), downloadPostImage(), draftKey(), EditorStep, FORMAT_OPTIONS, formatDate(), MODE_OPTIONS, ObjectiveId (+10 more)

### Community 74 - "@testing-library/user-event"
Cohesion: 0.13
Nodes (15): CONDITIONS, DISCOUNT_TYPES, INITIAL_FORM, RULE_TYPE_LABELS, RULE_TYPES, RuleForm, SmartPricingPanel(), STATUS_COLORS (+7 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.16
Nodes (6): ErrorBoundary, Props, State, SystemStatePage(), getLastCorrelationId(), logger

### Community 76 - "scripts"
Cohesion: 0.22
Nodes (7): INITIAL_CONFIG, LoyaltyConfig, LoyaltyPanel(), LoyaltyAccount, loyaltyApi, LoyaltyLedgerEntry, LoyaltyProgram

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.18
Nodes (19): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, FinancialDashboardProps, QueueItemCardProps, Addon (+11 more)

### Community 79 - "index.tsx"
Cohesion: 0.24
Nodes (9): brl(), FinancialDashboard(), isOwnerLike(), metric(), CommissionEntry, commissionsApi, CommissionSummary, BarbershopInsights (+1 more)

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.13
Nodes (13): subscribe, forgetSavedAccountMock, loginMock, loginWithGoogleMock, loginWithSavedAccountMock, navigateMock, registerMock, registerWithGoogleMock (+5 more)

### Community 81 - "MarketingNav.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 82 - "credit-card-form.tsx"
Cohesion: 0.40
Nodes (4): Arquitetura frontend e princípios, Formulários, Organização atual (não impor classes de backend ao React), SOLID / Clean Code (exemplos locais)

### Community 84 - "Arquitetura do frontend"
Cohesion: 0.40
Nodes (4): Arquitetura do frontend, Auditoria, Estrutura, Regras

### Community 85 - "FiscalPanel.tsx"
Cohesion: 0.14
Nodes (11): CrmBackfillResult, CrmBackfillRun, CrmCampaign, CrmClientMetric, CrmClientProfile, CrmForecast, CrmOverview, CrmRevenueGroup (+3 more)

### Community 86 - "errorMessage.ts"
Cohesion: 0.12
Nodes (19): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, Header(), HeaderProps, owner (+11 more)

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.22
Nodes (7): OrganizationsPanel(), ConfirmDialog(), ConfirmDialogProps, Organization, organizationsApi, OrganizationFormData, OrganizationSchema

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.08
Nodes (23): TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, ConsentCheckbox(), ConsentCheckboxProps, pickPlanForCheckout(), Plan, PlanBillingCycle, plansApi (+15 more)

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.29
Nodes (5): Contrato API e smoke de entrega, Smoke manual mínimo após deploy, Verificação offline, Inventário de scripts — Frontend (`agendai`), Observações

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.31
Nodes (5): CorporatePanel(), corporateApi, CorporatePlan, CorporateSubscription, CorporateValidation

### Community 95 - "FinancialDashboard.tsx"
Cohesion: 0.46
Nodes (7): brl, digitsOnly(), formatBrPhone(), shopInitials(), ShopProfile(), todaySchedule(), waLink()

### Community 96 - "FeaturesPage.tsx"
Cohesion: 0.12
Nodes (14): CreatePostPayload, GeneratePostPayload, CreatePostPayload, PostDesignOptions, PostFormat, PostListResponse, PostMedia, PostPaletteDef (+6 more)

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.10
Nodes (25): CalendarSkeleton(), ClientsSkeleton(), TeamSkeleton(), DashboardSkeleton(), FinanceResumoSkeleton(), FinancialSkeleton(), ReportsSkeleton(), PublicPageSkeleton() (+17 more)

### Community 98 - "ApiError"
Cohesion: 0.39
Nodes (5): CatalogTab, catalogApi, ServiceAddon, ServiceCombo, ServiceVariation

### Community 99 - "GoalsPanel.tsx"
Cohesion: 0.29
Nodes (6): DESCRIPTIONS, DESTINATIONS, OnboardingChecklist(), OnboardingChecklistProps, Step, TITLES

### Community 100 - "ProductReportsPanel.tsx"
Cohesion: 0.33
Nodes (6): FORMAT_ASPECT, FORMAT_MAX_HEIGHT, PostPreviewBox(), PostPreviewBoxProps, LocalDraft, PostFormat

### Community 101 - "goalsApi.ts"
Cohesion: 0.19
Nodes (11): asNumber(), flattenGoal(), flattenList(), GoalMetric, GoalPeriod, GoalProgressRow, GoalRecord, goalsApi (+3 more)

### Community 102 - "softwareApplicationLd"
Cohesion: 0.29
Nodes (10): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+2 more)

### Community 103 - "commissionsApi.ts"
Cohesion: 0.18
Nodes (9): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel (+1 more)

### Community 104 - "GiftCardsPanel.tsx"
Cohesion: 0.18
Nodes (12): INITIAL_FORM, STATUS_LABELS, STATUS_STYLES, WaitlistFormData, WaitlistPanel(), unwrap(), unwrap(), waitlistApi (+4 more)

### Community 105 - "enhancedForecastApi.ts"
Cohesion: 0.11
Nodes (14): DAY_LABELS, DAYS, StaffManagementPanel(), STATUS_COLORS, STATUS_LABELS, asNumber(), normalizeService(), staffApi (+6 more)

### Community 106 - "README.md"
Cohesion: 0.25
Nodes (7): FIELD_TYPE_LABELS, FIELD_TYPES, FormsPanel(), Form, FormField, FormResponse, formsApi

### Community 107 - "SubscriptionContext.tsx"
Cohesion: 0.16
Nodes (10): PurchasingPanel(), PRIORITY_CONFIG, RecommendationsPanel(), TYPE_CONFIG, useBarbershopFilters(), PurchaseOrder, PurchaseOrderItem, purchasingApi (+2 more)

### Community 108 - "reputationApi.ts"
Cohesion: 0.27
Nodes (7): ReputationPanel(), responseTextOf(), sentimentIcon(), reputationApi, ReputationStats, Review, ReviewResponse

### Community 109 - "PasswordInput.tsx"
Cohesion: 0.18
Nodes (11): actionClassName, SystemStateAction, SystemStatePageProps, Logo(), LogoProps, sizeMap, ForgotPasswordPage(), inputClass() (+3 more)

### Community 110 - "qualityApi.ts"
Cohesion: 0.33
Nodes (5): QualityPanel(), qualityApi, QualityAudit, QualityOverview, QualityProtocol

### Community 111 - "CopilotPanel.tsx"
Cohesion: 0.17
Nodes (9): DEPOSIT_REQUIRED_OPTIONS, DepositPolicyPanel(), NO_SHOW_RULE_OPTIONS, REFUND_RULE_OPTIONS, AppointmentDeposit, DepositPolicy, depositsApi, buildQuery() (+1 more)

### Community 112 - "SeoHead.tsx"
Cohesion: 0.22
Nodes (8): CrmMergePanel(), CurrencyInput(), CurrencyInputProps, formatDisplay(), parseRawDigits(), Field(), FieldProps, CrmMergeSchema

### Community 113 - "purchasingApi.ts"
Cohesion: 0.25
Nodes (10): formatMetricValue(), GoalFormData, GoalMetric, GoalsPanel(), INITIAL_FORM, METRIC_LABELS, progressColor(), progressWidth() (+2 more)

### Community 114 - "index.ts"
Cohesion: 0.20
Nodes (7): ListMeta, PaymentProvider, paymentsApi, PaymentStatus, PixQrCode, Refund, RefundListResponse

### Community 115 - "barbershopApi"
Cohesion: 0.13
Nodes (20): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), ProfileAvatarSection(), ProfileAvatarSectionProps, AuthContext, AuthContextValue (+12 more)

### Community 116 - "data"
Cohesion: 0.21
Nodes (5): CopilotPanel(), priorityLabel(), SavedAccount, copilotApi, CopilotSuggestion

### Community 117 - "ForgotPasswordPage.tsx"
Cohesion: 0.31
Nodes (8): CatalogManager(), OperationModeSection(), ShopFloorControls(), ShopFloorControlsProps, statusCopy(), ShowcasePanel(), useBarbershop(), supportsQueue()

### Community 118 - "BarbershopFiltersContext.tsx"
Cohesion: 0.18
Nodes (10): resolveBarbershopId(), CreateExpenseBody, CreateFiadoBody, ExpenseItem, FiadoItem, FiadoPayment, ListMeta, resolveBarbershopId() (+2 more)

### Community 119 - "productsApi.ts"
Cohesion: 0.47
Nodes (4): CatalogTemplateModal(), Props, CatalogTemplatePreview, BusinessSegment

### Community 120 - "CrmMergePanel.tsx"
Cohesion: 0.21
Nodes (17): OwnerFinancialPanel(), AttentionKey, BANDS, initialPeriod(), ProductReportsPanel(), Props, purposeLabel(), HubTab (+9 more)

### Community 121 - "AiPredictivePage.tsx"
Cohesion: 0.16
Nodes (13): ActivationChecklist(), Props, QueueCapacityBanner(), ReturnToQueueModal(), ALL_TAB_IDS, getDefaultTab(), getPrimaryTabForMode(), OnboardingStatus (+5 more)

### Community 122 - "ConfirmDialog.tsx"
Cohesion: 0.40
Nodes (3): adminApi, ReferralPlatformStats, ReferralsTab()

### Community 125 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 127 - "PublicHome"
Cohesion: 0.31
Nodes (7): ClientsSection, ClientsTab(), ClientsTabProps, initialPeriod(), SECTION_META, VALID_SECTIONS, METRIC_LABEL

### Community 128 - "SubscriptionContext.tsx"
Cohesion: 0.19
Nodes (11): MarketingNav(), pageLinks, scrollToSection(), sectionLinks, LandingPage(), marqueeItems, planFeatures, processSteps (+3 more)

### Community 129 - "RetailCheckoutBlock.tsx"
Cohesion: 0.15
Nodes (14): ClientPortalDashboard(), ClientPortalLogin(), ClientPortalLoginProps, destinations, OnboardingMissions(), Props, Step, titles (+6 more)

### Community 130 - "TasksPage.tsx"
Cohesion: 0.33
Nodes (5): FiscalPanel(), fiscalApi, FiscalConfig, FiscalStats, NfeRecord

### Community 131 - "emailApi.ts"
Cohesion: 0.15
Nodes (13): busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps, ServiceCardProps, DynamicIcon(), DynamicIconProps (+5 more)

### Community 132 - "Inventário de pacotes — Frontend (agendai)"
Cohesion: 0.29
Nodes (6): AddCustomerFormProps, ServiceCard(), CustomerQueueFormData, CustomerQueueSchema, CustomerQueueStaffFormData, CustomerQueueStaffSchema

### Community 133 - "BarbershopFiltersContext.tsx"
Cohesion: 0.38
Nodes (5): BarbershopFiltersContext, BarbershopFiltersProvider(), BarbershopFiltersValue, DateRange, setSelectedBarbershopId()

### Community 134 - "walletApi.ts"
Cohesion: 0.33
Nodes (3): walletApi, WalletBalance, WalletEntry

### Community 135 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.50
Nodes (3): Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade

### Community 137 - "CorporatePanel.tsx"
Cohesion: 0.18
Nodes (10): brl, PackageCatalogProps, CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options (+2 more)

### Community 140 - "StaffDashboard"
Cohesion: 0.14
Nodes (19): ReturnToQueueModalProps, sameSnapshot(), SchedulingContext, SchedulingContextValue, SchedulingProvider(), authStorage, realtimeWsUrl(), JoinQueuePayload (+11 more)

### Community 141 - "dateUtils.ts"
Cohesion: 0.12
Nodes (21): Props, InventoryReceipt, Supplier, CategorySchema, ClientEditFormData, ClientEditSchema, ProcedureRecordFormData, ProcedureRecordSchema (+13 more)

## Knowledge Gaps
- **661 isolated node(s):** `root`, `findings`, `root`, `backend`, `methods` (+656 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `RetailCheckoutBlock.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `TasksPage.tsx`, `OwnerFinancialPanel.tsx`, `Inventário de pacotes — Frontend (agendai)`, `CheckoutPage.tsx`, `schedulingUtils.ts`, `dependencies`, `devDependencies`, `CorporatePanel.tsx`, `adminApi.ts`, `BillingTab.tsx`, `StaffDashboard`, `MarketingNav.tsx`, `dateUtils.ts`, `paymentsApi.ts`, `apiClient.ts`, `MarketingFooter.tsx`, `ContactPage.tsx`, `AiPredictivePage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `PublicHome.test.tsx`, `ErrorBoundary.tsx`, `eslint-plugin-jsx-a11y`, `tailwindcss`, `@tailwindcss/postcss`, `@types/react`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `vite`, `vitest`, `@vitest/coverage-v8`, `PostsManager.tsx`, `@testing-library/user-event`, `scripts`, `MarketingNav.tsx`, `errorMessage.ts`, `CheckoutPage.tsx`, `ForgotPasswordPage.tsx`, `FinancialDashboard.tsx`, `ApiError`, `GoalsPanel.tsx`, `GiftCardsPanel.tsx`, `enhancedForecastApi.ts`, `README.md`, `SubscriptionContext.tsx`, `reputationApi.ts`, `qualityApi.ts`, `CopilotPanel.tsx`, `SeoHead.tsx`, `purchasingApi.ts`, `barbershopApi`, `data`, `ForgotPasswordPage.tsx`, `productsApi.ts`, `CrmMergePanel.tsx`, `AiPredictivePage.tsx`, `ConfirmDialog.tsx`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `dependencies` to `SubscriptionContext.tsx`, `StaffDashboard.tsx`, `emailApi.ts`, `StaffDashboard`, `dateUtils.ts`, `MarketingFooter.tsx`, `AiPredictivePage.tsx`, `DashboardPage.tsx`, `CookieConsent.tsx`, `tailwindcss`, `@tailwindcss/postcss`, `@types/react`, `@typescript-eslint/parser`, `vitest`, `PostsManager.tsx`, `errorMessage.ts`, `AccessBlockedPage.tsx`, `barbershopApi`, `CrmMergePanel.tsx`, `AiPredictivePage.tsx`, `LandingPage.tsx`, `PublicHome`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `authStorage` connect `StaffDashboard` to `LoginPage.tsx`, `TasksPage.tsx`, `schedulingUtils.ts`, `devDependencies`, `MasterAdminDashboard.tsx`, `OwnerReferralsPanel.tsx`, `paymentsApi.ts`, `apiClient.ts`, `subscriptionsApi.ts`, `ContactPage.tsx`, `SubscriptionContext.tsx`, `AiPredictivePage.tsx`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `AppointmentBookingModal.tsx`, `tailwindcss`, `@testing-library/jest-dom`, `typescript`, `vite`, `vitest`, `@vitest/coverage-v8`, `@testing-library/user-event`, `scripts`, `index.tsx`, `FiscalPanel.tsx`, `CheckoutPage.tsx`, `AccessBlockedPage.tsx`, `ForgotPasswordPage.tsx`, `FeaturesPage.tsx`, `ApiError`, `goalsApi.ts`, `GiftCardsPanel.tsx`, `enhancedForecastApi.ts`, `README.md`, `SubscriptionContext.tsx`, `reputationApi.ts`, `qualityApi.ts`, `CopilotPanel.tsx`, `index.ts`, `barbershopApi`, `data`, `BarbershopFiltersContext.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `root` to the rest of the system?**
  _661 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaffDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12987012987012986 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._