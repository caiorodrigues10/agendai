# Graph Report - agendai  (2026-09-22)

## Corpus Check
- 355 files · ~268,511 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2044 nodes · 4775 edges · 139 communities (128 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `64a69663`
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
- productsApi.ts
- CrmMergePanel.tsx
- AiPredictivePage.tsx
- ConfirmDialog.tsx
- LandingPage.tsx
- RetailCheckoutBlock.tsx
- credit-card-form.tsx
- RetailCheckoutBlock.tsx
- emailApi.ts
- walletApi.ts
- CurrencyInput.tsx
- ReferralsTab.tsx
- DashboardPage.tsx
- BillingPage.tsx
- CorporatePanel.tsx
- ShopFloorControls.tsx
- dateRanges.ts
- StaffDashboard
- walletApi.ts
- Inventário de pacotes — Frontend (agendai)

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 160 edges
2. `useBarbershopFilters()` - 67 edges
3. `apiClient()` - 67 edges
4. `useAuth()` - 53 edges
5. `authStorage` - 53 edges
6. `SmartSelect()` - 36 edges
7. `Service` - 35 edges
8. `StaffMember` - 30 edges
9. `useBarbershop()` - 29 edges
10. `data()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `UsersTab()` --indirect_call--> `data()`  [INFERRED]
  src/pages/MasterAdmin/MasterAdminDashboard.tsx → src/infra/crmApi.ts
- `TaskDetailPage()` --indirect_call--> `data()`  [INFERRED]
  src/pages/MasterAdmin/TaskDetailPage.tsx → src/infra/crmApi.ts
- `ActivationChecklist()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/ActivationChecklist.tsx → src/infra/crmApi.ts
- `AddCustomerFormProps` --references--> `Service`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → src/types.ts
- `AppointmentScheduler()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/AppointmentScheduler.tsx → src/infra/crmApi.ts

## Import Cycles
- None detected.

## Communities (139 total, 11 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.12
Nodes (20): CashPanel(), CrmBackfillPanel(), ProductCatalogPanel(), ProductSalesPanel(), formatStockQty(), ProductStockPanel(), HubTab, ProductsHub() (+12 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (15): intentColor(), intentLabel(), statusColor(), statusLabel(), View, WhatsAppAIPanel(), AiConversation, AiIntentLog (+7 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.11
Nodes (22): EMPTY_META, Tab, TABS, FinanceSummaryCard(), FinanceSummaryCardProps, EXPENSE_RECURRENCE_LABELS, EXPENSE_TYPE_LABELS, FINANCE_PAYMENT_METHODS (+14 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.16
Nodes (13): OwnerReferralsPanelProps, STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton(), ShareReferralButtonProps (+5 more)

### Community 4 - "devDependencies"
Cohesion: 0.13
Nodes (12): RunSummary(), statusLabel(), auth, run, CrmBackfillResult, CrmBackfillRun, CrmCampaign, CrmClientMetric (+4 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.12
Nodes (23): brl, clientPhoneLabel(), ClientProfileSheet(), PAYMENT_LABEL, ProfileTab, shortDate(), clientPhoneLabel(), ClientsManager() (+15 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (28): BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS, formatDate() (+20 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (22): AddCustomerFormProps, ServiceCard(), ClientEditFormData, ClientEditSchema, CustomerQueueFormData, CustomerQueueSchema, CustomerQueueStaffFormData, CustomerQueueStaffSchema (+14 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.11
Nodes (17): AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs, DashboardPeriod (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.15
Nodes (13): CYCLE_LABELS, INITIAL_PLAN_FORM, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_STYLES, PlanFormData, Tab, ClientRecurringPackage, membershipsApi (+5 more)

### Community 11 - "App.tsx"
Cohesion: 0.05
Nodes (38): AboutPage, AccessBlockedPage, AccountsPage, AdminLayout, AiPredictivePage, AuditPage, BillingPage, CheckoutPage (+30 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.17
Nodes (19): AccessBlockedCode, apiClient(), apiFetch(), ApiRequestOptions, buildApiError(), calls, checkRateLimit(), doRefreshAccessToken() (+11 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.11
Nodes (22): ClientPortalDashboard(), PortalTab, TABS, ClientPortalLogin(), ClientPortalLoginProps, asRecord(), ClientAppointment, ClientBenefit (+14 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.25
Nodes (7): INITIAL_FORM, STATUS_LABELS, STATUS_STYLES, WaitlistFormData, EmptyState(), EmptyStateProps, WaitlistEntry

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.08
Nodes (15): AuditLogDrawerProps, BarbershopsTab(), COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal(), ManageBarbershopModalProps, METRIC_CHART_CONFIG (+7 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.06
Nodes (29): adminInternalApi, Invitation, PaginatedResponse, Task, TaskComment, TaskHistory, TeamMember, Ticket (+21 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.05
Nodes (45): DepositIndicators(), DepositIndicatorsProps, STATUS_LABELS, STATUS_STYLES, formatMetricValue(), GoalFormData, GoalMetric, GoalsPanel() (+37 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 20 - "IntersectionObserverMock"
Cohesion: 0.15
Nodes (5): IntersectionObserverMock, liveIntervals, nativeClearInterval, nativeSetInterval, ResizeObserverMock

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.52
Nodes (5): ForgotPasswordPage(), inputClass(), getRecaptchaToken(), loadScript(), useRecaptchaBadge()

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 23 - "AiPredictivePage.tsx"
Cohesion: 0.13
Nodes (14): INITIAL_FORM, MOVEMENT_TYPE_LABELS, MovementFormData, MovementType, movementTypeOptions, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS, PaymentMethod (+6 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.11
Nodes (19): QueueCapacityBanner(), AddPostPayload, AddServicePayload, AppointmentPolicy, BarbershopData, PostAiSuggestion, PostConfigPayload, QueueAlertSettings (+11 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.20
Nodes (12): ShopWeatherDay, categoryApi(), enhancedForecastApi, EnhancedForecastReport, ForecastFactor, getForecastReport(), normalizePredictions(), token() (+4 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.06
Nodes (34): AdminLayout(), NAV_ITEMS, installSteps, PwaInstallCard(), PwaInstallCardProps, ThemeToggle(), BarbershopFiltersProvider(), BeforeInstallPromptEvent (+26 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.18
Nodes (10): INITIAL_FORM, STATUS_COLORS, TYPE_LABELS, VOUCHER_TYPES, VoucherForm, VouchersPanel(), voucherTypeOptions, Voucher (+2 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.09
Nodes (21): CATEGORY_LABELS, CONDITION_LABELS, CONDITION_STYLES, EquipmentFormData, HubTab, INITIAL_EQUIP_FORM, INITIAL_MOVEMENT_FORM, INITIAL_NEED_FORM (+13 more)

### Community 31 - "PublicHome.test.tsx"
Cohesion: 0.39
Nodes (5): unwrap(), waitlistApi, WaitlistOffer, unwrapData(), unwrapList()

### Community 36 - "LandingPage.tsx"
Cohesion: 0.18
Nodes (10): 1. Posicionamento, 2. Estrutura recomendada da landing, 3. Vídeo: onde colocar, 4. Use real screenshots, 5. Separação de login e cadastro, 6. PWA mobile-first, 7. Guardrails de marketing, 8. KPIs (+2 more)

### Community 37 - "AppointmentBookingModal.tsx"
Cohesion: 0.11
Nodes (17): ClientsManagerProps, CrmMergePanel(), QueueItemCard(), item, service, ServiceCardProps, DynamicIcon(), DynamicIconProps (+9 more)

### Community 38 - "ClientsManager.tsx"
Cohesion: 0.29
Nodes (6): 2026-08-28 — Redesign UX: Agenda (Salão/Profissional), 2026-08-28 — Upload de logo na tela Perfil, 2026-08-29 — Componente reutilizável ConfirmDialog + substituição no ServiceManager, 2026-08-29 — Fix: Erro cru do Google vazando pro usuário no upload de logo/avatar, 2026-08-29 — Redesign UX: unificar dois blocos de WhatsApp em Configurações, Backlog Técnico — Frontend

### Community 39 - "StaffMember"
Cohesion: 0.14
Nodes (15): StatusBadge(), StatusBadgeProps, Tone, TONES, classes, FiadoStatusBadge(), FiadoStatusBadgeProps, FiadoStatus (+7 more)

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.07
Nodes (30): EmailHistoryPanel(), EmailHistoryPanelProps, LogEntry, STATUS_META, CATEGORIES, CategoryDef, EmailPreferencesPanel(), EmailPreferencesPanelProps (+22 more)

### Community 41 - "eslint-config-prettier"
Cohesion: 0.19
Nodes (16): AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, calendarDateKey(), DAY_NAMES (+8 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.14
Nodes (19): clearDraft(), downloadImage(), draftKey(), EditorTab, FORMAT_OPTIONS, LocalDraftPayload, MODE_OPTIONS, ObjectiveId (+11 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 44 - "jsdom"
Cohesion: 0.32
Nodes (5): PRIORITY_CONFIG, RecommendationsPanel(), TYPE_CONFIG, Recommendation, recommendationsApi

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
Cohesion: 0.16
Nodes (10): CatalogTemplateModal(), Props, CatalogTemplatePreview, CatalogTemplatePreviewItem, InventoryReceiptItem, ListMeta, StockAlertItem, StockMovement (+2 more)

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.22
Nodes (8): ServiceForm(), ServiceManagerProps, Button, ButtonProps, ButtonSize, ButtonVariant, sizes, variants

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.21
Nodes (10): brl(), getCurrentPeriod(), pct(), ProfitEnginePanel(), ProfitEnginePanelProps, profitApi, ProfitEntry, ProfitPeriodData (+2 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.15
Nodes (18): PublicLinkPanel(), PublicLinkPanelProps, qrUrl(), StaffNavigation(), StaffNavigationProps, visibleTabs(), ALL_TAB_IDS, canAccessTab() (+10 more)

### Community 53 - "@types/react"
Cohesion: 0.15
Nodes (13): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, brl, packagesApi, ClientPackageStatus, DaySchedule, PackagePaymentMethod, PostMedia (+5 more)

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.22
Nodes (4): Claude, Gemini, AgendAI — Frontend, Rodar localmente

### Community 55 - "typescript"
Cohesion: 0.14
Nodes (18): busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps, sameSnapshot(), SchedulingContext, SchedulingContextValue (+10 more)

### Community 56 - "typescript-eslint"
Cohesion: 0.15
Nodes (19): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, dateLabel(), EnhancedForecastPanel(), getWeatherIcon(), RISK_STYLES, WeatherForecastWidget() (+11 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.29
Nodes (17): AppointmentBookingModal(), fieldClass(), AppointmentScheduler(), firstOpenDate(), BookPackageSessionsModal(), BookPackageSessionsModalProps, PickedSlot, parseLocalISO() (+9 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.22
Nodes (17): pickPlanForCheckout(), token(), formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps, getPanelPathForRole() (+9 more)

### Community 59 - "vite"
Cohesion: 0.21
Nodes (8): INITIAL_FORM, STATUS_LABELS, STATUS_STYLES, SyncFormData, TYPE_META, Integration, integrationsApi, IntegrationSyncLog

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.29
Nodes (12): backend, backendRoutes(), checkContract(), frontendRequests(), literal(), methods, normalize(), parse() (+4 more)

### Community 61 - "vitest"
Cohesion: 0.21
Nodes (11): CategoryManager(), Props, category, Harness(), mocks, useCategories(), CategoryInput, expenseCategoriesApi (+3 more)

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.19
Nodes (14): ClientCard(), ClientTableRow(), CrmIntelligencePanel(), FACTOR_LABELS, formatFactor(), IntelTab, Kpi(), money() (+6 more)

### Community 64 - "autoprefixer"
Cohesion: 0.18
Nodes (11): JsonLd, SeoHead(), SeoHeadProps, upsertJsonLd(), upsertLink(), upsertMeta(), AboutPage(), beats (+3 more)

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
Cohesion: 0.22
Nodes (9): PricingPersuasionCharts(), PricingPersuasionChartsProps, trialCampaign, daySlots, flowSteps, pros, SchedulingPage(), matrix (+1 more)

### Community 70 - "@types/node"
Cohesion: 0.33
Nodes (5): Comandos (PowerShell / bash), Delegação a subagentes, Graphify — Frontend, Procedimento obrigatório, Regras

### Community 71 - "AboutPage.tsx"
Cohesion: 0.18
Nodes (12): CatalogPurpose, Props, PURPOSE_META, SEGMENTS, formatDateOnlyBR(), isLowStock(), STOCK_UNIT_LABELS, STOCK_UNIT_OPTIONS (+4 more)

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.12
Nodes (18): clearLocalDraft(), downloadPostImage(), draftKey(), EditorStep, FORMAT_OPTIONS, formatDate(), MODE_OPTIONS, ObjectiveId (+10 more)

### Community 74 - "@testing-library/user-event"
Cohesion: 0.14
Nodes (14): CONDITIONS, DISCOUNT_TYPES, INITIAL_FORM, RULE_TYPE_LABELS, RULE_TYPES, RuleForm, STATUS_COLORS, PriceEvaluation (+6 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.17
Nodes (5): ErrorBoundary, Props, State, getLastCorrelationId(), logger

### Community 76 - "scripts"
Cohesion: 0.10
Nodes (11): authStorage, SavedAccount, LoyaltyAccount, loyaltyApi, LoyaltyLedgerEntry, LoyaltyProgram, PurchaseOrder, PurchaseOrderItem (+3 more)

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.14
Nodes (20): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, ClientProfileSheetProps, FinancialDashboardProps, PackageCatalogProps, QueueItemCardProps, ReturnToQueueModal() (+12 more)

### Community 79 - "index.tsx"
Cohesion: 0.32
Nodes (7): Avatar(), AvatarProps, AvatarSize, COLORS, getColorClass(), getInitials(), SIZE_MAP

### Community 81 - "MarketingNav.tsx"
Cohesion: 0.18
Nodes (6): ACCESS_BLOCKED_CODES, ApiError, contactApi, ContactPayload, ContactResult, ContactTopic

### Community 82 - "credit-card-form.tsx"
Cohesion: 0.40
Nodes (4): Arquitetura frontend e princípios, Formulários, Organização atual (não impor classes de backend ao React), SOLID / Clean Code (exemplos locais)

### Community 84 - "Arquitetura do frontend"
Cohesion: 0.40
Nodes (4): Arquitetura do frontend, Auditoria, Estrutura, Regras

### Community 85 - "AboutPage.tsx"
Cohesion: 0.39
Nodes (4): fiscalApi, FiscalConfig, FiscalStats, NfeRecord

### Community 86 - "errorMessage.ts"
Cohesion: 0.14
Nodes (12): destinations, OnboardingMissions(), Props, Step, titles, Appointment, isoDate(), PublicAppointmentManagePage() (+4 more)

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.33
Nodes (4): Organization, organizationsApi, OrganizationFormData, OrganizationSchema

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.11
Nodes (17): TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, ConsentCheckbox(), ConsentCheckboxProps, Plan, PlanBillingCycle, plansApi, BlockInfo (+9 more)

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.29
Nodes (5): Contrato API e smoke de entrega, Smoke manual mínimo após deploy, Verificação offline, Inventário de scripts — Frontend (`agendai`), Observações

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.53
Nodes (4): QueueAlertSettings(), normalizePhoneBR(), formatBrPhone(), maskedOrFallbackPhone()

### Community 95 - "FinancialDashboard.tsx"
Cohesion: 0.24
Nodes (9): brl(), FinancialDashboard(), isOwnerLike(), metric(), CommissionEntry, commissionsApi, CommissionSummary, BarbershopInsights (+1 more)

### Community 96 - "FeaturesPage.tsx"
Cohesion: 0.15
Nodes (11): PostDesignOptions, PostFormat, PostListResponse, PostMedia, PostPaletteDef, postsApi, PostStatus, PostTemplateDef (+3 more)

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.10
Nodes (25): CalendarSkeleton(), ClientsSkeleton(), TeamSkeleton(), DashboardSkeleton(), FinanceResumoSkeleton(), FinancialSkeleton(), ReportsSkeleton(), PublicPageSkeleton() (+17 more)

### Community 98 - "ApiError"
Cohesion: 0.10
Nodes (24): brl(), CANCEL_REASONS, RETENTION_BENEFITS, STATUS_LABEL, AccessState, deriveAccessState(), deriveHasDashboard(), SubscriptionContext (+16 more)

### Community 99 - "GoalsPanel.tsx"
Cohesion: 0.20
Nodes (7): ListMeta, PaymentProvider, paymentsApi, PaymentStatus, PixQrCode, Refund, RefundListResponse

### Community 100 - "ProductReportsPanel.tsx"
Cohesion: 0.20
Nodes (10): FORMAT_ASPECT, FORMAT_MAX_HEIGHT, PostPreviewBox(), PostPreviewBoxProps, LocalDraft, CreatePostPayload, GeneratePostPayload, CreatePostPayload (+2 more)

### Community 101 - "goalsApi.ts"
Cohesion: 0.17
Nodes (12): asNumber(), flattenGoal(), flattenList(), GoalMetric, GoalPeriod, GoalProgressRow, GoalRecord, goalsApi (+4 more)

### Community 102 - "softwareApplicationLd"
Cohesion: 0.29
Nodes (10): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+2 more)

### Community 103 - "commissionsApi.ts"
Cohesion: 0.53
Nodes (5): BarbershopContext, BarbershopProvider(), isShopStaffRole(), mapScheduleFromApi(), mapStaffFromApi()

### Community 104 - "GiftCardsPanel.tsx"
Cohesion: 0.24
Nodes (7): INITIAL_FORM, PurchaseForm, STATUS_COLORS, STATUS_LABELS, GiftCard, giftCardsApi, GiftCardUsage

### Community 105 - "enhancedForecastApi.ts"
Cohesion: 0.12
Nodes (13): DAY_LABELS, DAYS, STATUS_COLORS, STATUS_LABELS, asNumber(), normalizeService(), staffApi, StaffScheduleEntry (+5 more)

### Community 106 - "README.md"
Cohesion: 0.29
Nodes (6): FIELD_TYPE_LABELS, FIELD_TYPES, Form, FormField, FormResponse, formsApi

### Community 107 - "SubscriptionContext.tsx"
Cohesion: 0.28
Nodes (6): CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options

### Community 108 - "reputationApi.ts"
Cohesion: 0.27
Nodes (7): ReputationPanel(), responseTextOf(), sentimentIcon(), reputationApi, ReputationStats, Review, ReviewResponse

### Community 109 - "PasswordInput.tsx"
Cohesion: 0.18
Nodes (9): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel (+1 more)

### Community 110 - "qualityApi.ts"
Cohesion: 0.39
Nodes (4): qualityApi, QualityAudit, QualityOverview, QualityProtocol

### Community 111 - "CopilotPanel.tsx"
Cohesion: 0.12
Nodes (31): CatalogManager(), CorporatePanel(), DEPOSIT_REQUIRED_OPTIONS, DepositPolicyPanel(), NO_SHOW_RULE_OPTIONS, REFUND_RULE_OPTIONS, EquipmentPanel(), FiscalPanel() (+23 more)

### Community 113 - "purchasingApi.ts"
Cohesion: 0.40
Nodes (5): ContactFormData, ContactPage(), ContactSchema, fieldClass(), topics

### Community 114 - "index.ts"
Cohesion: 0.12
Nodes (7): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, AiPredictivePage(), sections

### Community 115 - "barbershopApi"
Cohesion: 0.14
Nodes (17): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), ProfileAvatarSectionProps, AuthContext, AuthContextValue, AuthProvider() (+9 more)

### Community 116 - "data"
Cohesion: 0.36
Nodes (4): CopilotPanel(), priorityLabel(), copilotApi, CopilotSuggestion

### Community 117 - "ForgotPasswordPage.tsx"
Cohesion: 0.28
Nodes (7): ServiceFormProps, ICON_OPTIONS, Field(), FieldProps, Category, ServiceFormData, ServiceSchema

### Community 119 - "productsApi.ts"
Cohesion: 0.14
Nodes (14): actionClassName, SystemStateAction, SystemStatePage(), SystemStatePageProps, pageLinks, sectionLinks, Logo(), LogoProps (+6 more)

### Community 120 - "CrmMergePanel.tsx"
Cohesion: 0.14
Nodes (18): MOVEMENT_LABEL, PAYMENT_LABEL, PRODUCT_PURPOSE_LABEL, PRODUCT_PURPOSE_SHORT, productMoney, SALE_STATUS_LABEL, Props, Props (+10 more)

### Community 121 - "AiPredictivePage.tsx"
Cohesion: 0.27
Nodes (9): AttentionKey, BANDS, initialPeriod(), ProductReportsPanel(), Props, purposeLabel(), ProductAttentionItem, ProductReports (+1 more)

### Community 122 - "ConfirmDialog.tsx"
Cohesion: 0.20
Nodes (9): Props, ConfirmDialog(), ConfirmDialogProps, InventoryReceipt, Supplier, StockAdjustmentFormData, StockAdjustmentSchema, StockReceiptFormData (+1 more)

### Community 123 - "LandingPage.tsx"
Cohesion: 0.22
Nodes (9): MarketingNav(), scrollToSection(), LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent (+1 more)

### Community 125 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 129 - "RetailCheckoutBlock.tsx"
Cohesion: 0.50
Nodes (3): Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade

### Community 131 - "emailApi.ts"
Cohesion: 0.39
Nodes (5): CatalogTab, catalogApi, ServiceAddon, ServiceCombo, ServiceVariation

### Community 132 - "walletApi.ts"
Cohesion: 0.33
Nodes (4): Addon, Combo, ServiceBookingSelectorProps, Variation

### Community 133 - "CurrencyInput.tsx"
Cohesion: 0.22
Nodes (12): ProductFormModal(), Props, TITLE_CASE_EXCEPTIONS, toTitleCase(), CurrencyInput(), CurrencyInputProps, formatDisplay(), parseRawDigits() (+4 more)

### Community 134 - "ReferralsTab.tsx"
Cohesion: 0.40
Nodes (3): adminApi, ReferralPlatformStats, ReferralsTab()

### Community 135 - "DashboardPage.tsx"
Cohesion: 0.33
Nodes (5): comparison, DashboardPage(), hourHeat, staffRows, weekBars

### Community 137 - "CorporatePanel.tsx"
Cohesion: 0.36
Nodes (4): corporateApi, CorporatePlan, CorporateSubscription, CorporateValidation

### Community 138 - "ShopFloorControls.tsx"
Cohesion: 0.10
Nodes (22): ActivationChecklist(), Props, DESCRIPTIONS, DESTINATIONS, OnboardingChecklist(), OnboardingChecklistProps, Step, TITLES (+14 more)

### Community 139 - "dateRanges.ts"
Cohesion: 0.52
Nodes (6): addDaysISO(), DefaultPeriod, getDefaultPeriod(), getPeriodRange(), todayISO(), toLocalIsoDate()

### Community 140 - "StaffDashboard"
Cohesion: 0.19
Nodes (13): AddCustomerForm(), brl, digitsOnly(), formatBrPhone(), shopInitials(), ShopProfile(), todaySchedule(), waLink() (+5 more)

### Community 141 - "walletApi.ts"
Cohesion: 0.33
Nodes (3): walletApi, WalletBalance, WalletEntry

### Community 145 - "Inventário de pacotes — Frontend (agendai)"
Cohesion: 0.50
Nodes (3): dependencies, devDependencies, Inventário de pacotes — Frontend (agendai)

## Knowledge Gaps
- **642 isolated node(s):** `root`, `findings`, `root`, `backend`, `methods` (+637 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `CopilotPanel.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `emailApi.ts`, `devDependencies`, `CheckoutPage.tsx`, `schedulingUtils.ts`, `dependencies`, `CurrencyInput.tsx`, `CorporatePanel.tsx`, `ShopFloorControls.tsx`, `adminApi.ts`, `StaffDashboard`, `MarketingNav.tsx`, `paymentsApi.ts`, `BillingTab.tsx`, `apiClient.ts`, `MarketingFooter.tsx`, `ContactPage.tsx`, `AiPredictivePage.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `ReferralsTab.tsx`, `AppointmentBookingModal.tsx`, `ErrorBoundary.tsx`, `eslint-plugin-jsx-a11y`, `jsdom`, `tailwindcss`, `@testing-library/react`, `@types/react`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `vite`, `vitest`, `@vitest/coverage-v8`, `postcss`, `AboutPage.tsx`, `PostsManager.tsx`, `@testing-library/user-event`, `MarketingNav.tsx`, `AboutPage.tsx`, `errorMessage.ts`, `CheckoutPage.tsx`, `ForgotPasswordPage.tsx`, `ApiError`, `GiftCardsPanel.tsx`, `enhancedForecastApi.ts`, `README.md`, `reputationApi.ts`, `qualityApi.ts`, `purchasingApi.ts`, `barbershopApi`, `data`, `CrmMergePanel.tsx`, `AiPredictivePage.tsx`, `ConfirmDialog.tsx`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `authStorage` connect `scripts` to `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `emailApi.ts`, `devDependencies`, `schedulingUtils.ts`, `MasterAdminDashboard.tsx`, `CorporatePanel.tsx`, `adminApi.ts`, `OwnerReferralsPanel.tsx`, `apiClient.ts`, `subscriptionsApi.ts`, `ContactPage.tsx`, `AiPredictivePage.tsx`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `PublicHome.test.tsx`, `AppointmentBookingModal.tsx`, `ErrorBoundary.tsx`, `jsdom`, `tailwindcss`, `@testing-library/jest-dom`, `@types/react`, `typescript`, `vite`, `vitest`, `@testing-library/user-event`, `AboutPage.tsx`, `CheckoutPage.tsx`, `AccessBlockedPage.tsx`, `FinancialDashboard.tsx`, `FeaturesPage.tsx`, `ApiError`, `GoalsPanel.tsx`, `goalsApi.ts`, `GiftCardsPanel.tsx`, `enhancedForecastApi.ts`, `README.md`, `reputationApi.ts`, `qualityApi.ts`, `barbershopApi`, `data`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `StaffDashboard.tsx` to `devDependencies`, `CheckoutPage.tsx`, `ShopFloorControls.tsx`, `StaffDashboard`, `MarketingFooter.tsx`, `subscriptionsApi.ts`, `ContactPage.tsx`, `AiPredictivePage.tsx`, `CookieConsent.tsx`, `@testing-library/react`, `typescript`, `@typescript-eslint/parser`, `vitest`, `postcss`, `AboutPage.tsx`, `PostsManager.tsx`, `ShopProfile.tsx`, `AccessBlockedPage.tsx`, `ApiError`, `commissionsApi.ts`, `barbershopApi`, `productsApi.ts`, `CrmMergePanel.tsx`, `LandingPage.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `root` to the rest of the system?**
  _642 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaffDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11594202898550725 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10574712643678161 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13450292397660818 - nodes in this community are weakly interconnected._