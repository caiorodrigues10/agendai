# Graph Report - agendai  (2026-09-23)

## Corpus Check
- 365 files · ~258,957 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2094 nodes · 4901 edges · 146 communities (135 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `89d09969`
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
- walletApi.ts
- CurrencyInput.tsx
- ReferralsTab.tsx
- DashboardPage.tsx
- CorporatePanel.tsx
- ShopFloorControls.tsx
- dateRanges.ts
- StaffDashboard
- walletApi.ts
- TaskDetailPage.tsx
- googleCredential.ts
- Inventário de pacotes — Frontend (agendai)
- Header.test.tsx
- adminInternalApi

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 164 edges
2. `apiClient()` - 67 edges
3. `useBarbershopFilters()` - 65 edges
4. `useAuth()` - 53 edges
5. `authStorage` - 53 edges
6. `SmartSelect()` - 36 edges
7. `Service` - 35 edges
8. `StaffMember` - 30 edges
9. `useBarbershop()` - 29 edges
10. `ConfirmDialog()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `AddCustomerFormProps` --references--> `Service`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → src/types.ts
- `ClientProfileSheet()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/ClientProfileSheet.tsx → src/infra/crmApi.ts
- `GoalsPanel()` --indirect_call--> `metric()`  [INFERRED]
  src/components/domain/GoalsPanel.tsx → src/components/domain/FinancialDashboard.tsx
- `PublicLinkPanelProps` --references--> `OperationMode`  [EXTRACTED]
  src/components/domain/PublicLinkPanel.tsx → src/types.ts
- `AppointmentPolicySection()` --calls--> `getErrorMessage()`  [EXTRACTED]
  src/components/domain/SettingsManager.tsx → src/utils/errorMessage.ts

## Import Cycles
- None detected.

## Communities (146 total, 11 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.14
Nodes (14): TeamManager(), TeamManagerProps, Button, ButtonProps, ButtonSize, ButtonVariant, sizes, variants (+6 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (15): intentColor(), intentLabel(), statusColor(), statusLabel(), View, WhatsAppAIPanel(), AiConversation, AiIntentLog (+7 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.12
Nodes (19): EMPTY_META, errorMessage(), OwnerFinancialPanel(), Tab, TABS, todayIso(), FinanceSummaryCard(), FinanceSummaryCardProps (+11 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.15
Nodes (14): OwnerReferralsPanel(), OwnerReferralsPanelProps, STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton() (+6 more)

### Community 4 - "devDependencies"
Cohesion: 0.10
Nodes (31): SUPPORT_CATEGORY_LABELS, SUPPORT_FORM_CATEGORIES, SUPPORT_PRIORITY_LABELS, SUPPORT_STATUS_COLORS, SUPPORT_STATUS_LABELS, SupportFormCategory, toSupportCategory(), SupportReportDetail() (+23 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.10
Nodes (24): brl, PAYMENT_LABEL, ProfileTab, ClientsSection, ClientsTab(), ClientsTabProps, initialPeriod(), SECTION_META (+16 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (29): BillingSection, BillingTab(), BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS (+21 more)

### Community 7 - "dependencies"
Cohesion: 0.13
Nodes (20): AddCustomerFormProps, ServiceCard(), ClientCreateFormData, ClientCreateSchema, ClientEditFormData, ClientEditSchema, CustomerQueueFormData, CustomerQueueSchema (+12 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.09
Nodes (20): adminApi, AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs (+12 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.11
Nodes (19): cashApi, CashMovement, CashSummary, categoryApi(), ClientRecurringPackage, membershipsApi, RecurringPackageBenefit, RecurringPackageCycle (+11 more)

### Community 11 - "App.tsx"
Cohesion: 0.05
Nodes (38): AboutPage, AccessBlockedPage, AccountsPage, AdminLayout, AiPredictivePage, AuditPage, BillingPage, CheckoutPage (+30 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.12
Nodes (24): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), AccessBlockedCode, apiClient(), apiFetch(), ApiRequestOptions (+16 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.11
Nodes (22): ClientPortalDashboard(), PortalTab, TABS, ClientPortalLogin(), ClientPortalLoginProps, asRecord(), ClientAppointment, ClientBenefit (+14 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.22
Nodes (8): CYCLE_LABELS, INITIAL_PLAN_FORM, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_STYLES, PlanFormData, Tab, EmptyState(), EmptyStateProps

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.08
Nodes (15): PromptModal(), PromptModalProps, AuditLogDrawerProps, COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal(), ManageBarbershopModalProps (+7 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.08
Nodes (32): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+24 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.22
Nodes (7): Invitation, TaskComment, TaskHistory, TeamMember, TicketComment, TicketHistory, TicketTask

### Community 18 - "ContactPage.tsx"
Cohesion: 0.13
Nodes (16): ShowcasePanel(), asNumber(), CreateShowcaseEntryInput, normalizeEntry(), normalizeList(), ShowcaseAnalytics, showcaseApi, ShowcaseEntry (+8 more)

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
Cohesion: 0.17
Nodes (12): CashPanel(), INITIAL_FORM, MOVEMENT_TYPE_LABELS, MovementFormData, MovementType, movementTypeOptions, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS (+4 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.12
Nodes (24): BarbershopContext, BarbershopContextValue, BarbershopProvider(), isShopStaffRole(), AddPostPayload, AddServicePayload, AppointmentPolicy, BarbershopData (+16 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.25
Nodes (10): ShopWeatherDay, EnhancedForecast, enhancedForecastApi, EnhancedForecastReport, ForecastFactor, getForecastReport(), normalizePredictions(), token() (+2 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.15
Nodes (11): scrollToSection(), LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent, weatherTimeline (+3 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.16
Nodes (11): INITIAL_FORM, STATUS_COLORS, TYPE_LABELS, VOUCHER_TYPES, VoucherForm, VouchersPanel(), voucherTypeOptions, Field() (+3 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.09
Nodes (21): CATEGORY_LABELS, CONDITION_LABELS, CONDITION_STYLES, EquipmentFormData, HubTab, INITIAL_EQUIP_FORM, INITIAL_MOVEMENT_FORM, INITIAL_NEED_FORM (+13 more)

### Community 31 - "PublicHome.test.tsx"
Cohesion: 0.14
Nodes (19): formatMetricValue(), GoalFormData, GoalMetric, GoalsPanel(), INITIAL_FORM, METRIC_LABELS, progressColor(), progressWidth() (+11 more)

### Community 36 - "LandingPage.tsx"
Cohesion: 0.18
Nodes (10): 1. Posicionamento, 2. Estrutura recomendada da landing, 3. Vídeo: onde colocar, 4. Use real screenshots, 5. Separação de login e cadastro, 6. PWA mobile-first, 7. Guardrails de marketing, 8. KPIs (+2 more)

### Community 37 - "AppointmentBookingModal.tsx"
Cohesion: 0.16
Nodes (11): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, ClientPackageStatus, DaySchedule, PackagePaymentMethod, PostMedia, PostTemplate, SalonClientAppointment (+3 more)

### Community 38 - "ClientsManager.tsx"
Cohesion: 0.29
Nodes (6): 2026-08-28 — Redesign UX: Agenda (Salão/Profissional), 2026-08-28 — Upload de logo na tela Perfil, 2026-08-29 — Componente reutilizável ConfirmDialog + substituição no ServiceManager, 2026-08-29 — Fix: Erro cru do Google vazando pro usuário no upload de logo/avatar, 2026-08-29 — Redesign UX: unificar dois blocos de WhatsApp em Configurações, Backlog Técnico — Frontend

### Community 39 - "StaffMember"
Cohesion: 0.14
Nodes (15): StatusBadge(), StatusBadgeProps, Tone, TONES, classes, FiadoStatusBadge(), FiadoStatusBadgeProps, FiadoStatus (+7 more)

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.11
Nodes (19): EmailHistoryPanel(), EmailHistoryPanelProps, LogEntry, STATUS_META, AppointmentPolicySection(), BusinessSegmentSection(), DEFAULT_APPOINTMENT_POLICY, MODE_OPTIONS (+11 more)

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
Cohesion: 0.24
Nodes (9): installSteps, PwaInstallCard(), PwaInstallCardProps, BeforeInstallPromptEvent, isStandaloneDisplay(), PwaInstallContext, PwaInstallContextValue, PwaInstallProvider() (+1 more)

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
Nodes (12): CatalogTemplateModal(), Props, CatalogTemplatePreview, CatalogTemplatePreviewItem, InventoryReceiptItem, ListMeta, RetailSaleLine, RetailSalePayload (+4 more)

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.33
Nodes (4): EmailDeliveryLog, EmailLegacyRow, EmailPreference, SalonaEmailSettings

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.19
Nodes (11): brl(), getCurrentPeriod(), pct(), ProfitEnginePanel(), ProfitEnginePanelProps, ChartConfig, profitApi, ProfitEntry (+3 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.23
Nodes (10): StaffNavigation(), StaffNavigationProps, visibleTabs(), canAccessTabByMode(), MOBILE_PRIMARY_TAB_IDS, TAB_GROUPS, TabDef, TabGroup (+2 more)

### Community 53 - "@types/react"
Cohesion: 0.43
Nodes (4): ShopFloorControls(), ShopFloorControlsProps, statusCopy(), supportsQueue()

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.22
Nodes (4): Claude, Gemini, AgendAI — Frontend, Rodar localmente

### Community 55 - "typescript"
Cohesion: 0.15
Nodes (10): ActivationChecklist(), Props, DESCRIPTIONS, DESTINATIONS, OnboardingChecklist(), OnboardingChecklistProps, Step, TITLES (+2 more)

### Community 56 - "typescript-eslint"
Cohesion: 0.17
Nodes (17): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, dateLabel(), EnhancedForecastPanel(), getWeatherIcon(), RISK_STYLES, WeatherForecastWidget() (+9 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.19
Nodes (25): AppointmentBookingModal(), fieldClass(), AppointmentScheduler(), firstOpenDate(), BookPackageSessionsModal(), PickedSlot, Avatar(), AvatarProps (+17 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.19
Nodes (18): pickPlanForCheckout(), token(), formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps, subscribe (+10 more)

### Community 59 - "vite"
Cohesion: 0.09
Nodes (26): EquipmentPanel(), INITIAL_FORM, IntegrationsPanel(), STATUS_LABELS, STATUS_STYLES, SyncFormData, TYPE_META, INITIAL_CONFIG (+18 more)

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.29
Nodes (12): backend, backendRoutes(), checkContract(), frontendRequests(), literal(), methods, normalize(), parse() (+4 more)

### Community 61 - "vitest"
Cohesion: 0.22
Nodes (12): CategoryManager(), Props, category, Harness(), mocks, useCategories(), Category, CategoryInput (+4 more)

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.09
Nodes (27): CrmBackfillPanel(), RunSummary(), statusLabel(), auth, run, ClientCard(), ClientTableRow(), CrmIntelligencePanel() (+19 more)

### Community 64 - "autoprefixer"
Cohesion: 0.29
Nodes (7): JsonLd, SeoHead(), SeoHeadProps, upsertJsonLd(), upsertLink(), upsertMeta(), sections

### Community 65 - "OwnerSubscriptionPanel.tsx"
Cohesion: 0.22
Nodes (10): ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload(), THEMES, useChart(), FloatingPathsBackground() (+2 more)

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
Cohesion: 0.50
Nodes (3): Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade

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
Cohesion: 0.17
Nodes (5): ErrorBoundary, Props, State, getLastCorrelationId(), logger

### Community 76 - "scripts"
Cohesion: 0.08
Nodes (20): sameSnapshot(), SchedulingContext, SchedulingProvider(), authStorage, SavedAccount, CommissionEntry, commissionsApi, CommissionSummary (+12 more)

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.32
Nodes (12): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, ShopProfileProps, SchedulingContextValue, AppointmentFormData (+4 more)

### Community 79 - "index.tsx"
Cohesion: 0.33
Nodes (6): CatalogManager(), CatalogTab, catalogApi, ServiceAddon, ServiceCombo, ServiceVariation

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.22
Nodes (8): forgetSavedAccountMock, loginMock, loginWithGoogleMock, loginWithSavedAccountMock, navigateMock, registerMock, registerWithGoogleMock, savedAccountsMock

### Community 81 - "MarketingNav.tsx"
Cohesion: 0.24
Nodes (7): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactSchema, topics

### Community 82 - "credit-card-form.tsx"
Cohesion: 0.40
Nodes (4): Arquitetura frontend e princípios, Formulários, Organização atual (não impor classes de backend ao React), SOLID / Clean Code (exemplos locais)

### Community 84 - "Arquitetura do frontend"
Cohesion: 0.40
Nodes (4): Arquitetura do frontend, Auditoria, Estrutura, Regras

### Community 85 - "AboutPage.tsx"
Cohesion: 0.33
Nodes (5): FiscalPanel(), fiscalApi, FiscalConfig, FiscalStats, NfeRecord

### Community 86 - "errorMessage.ts"
Cohesion: 0.12
Nodes (18): destinations, OnboardingMissions(), Props, Step, titles, ProfileAvatarSection(), ProfileAvatarSectionProps, ACCESS_BLOCKED_CODES (+10 more)

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.31
Nodes (5): OrganizationsPanel(), Organization, organizationsApi, OrganizationFormData, OrganizationSchema

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.10
Nodes (19): TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, ConsentCheckbox(), ConsentCheckboxProps, Plan, PlanBillingCycle, plansApi, BlockInfo (+11 more)

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.29
Nodes (5): Contrato API e smoke de entrega, Smoke manual mínimo após deploy, Verificação offline, Inventário de scripts — Frontend (`agendai`), Observações

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.18
Nodes (17): AddCustomerForm(), clientPhoneLabel(), ClientProfileSheet(), shortDate(), clientPhoneLabel(), ClientsManager(), ClientsManagerProps, QueueAlertSettings() (+9 more)

### Community 95 - "FinancialDashboard.tsx"
Cohesion: 0.36
Nodes (6): formatDateTime(), HealthCardProps, NotificationHealthPanel(), statusClass(), statusLabel(), NotificationOperationsHealth

### Community 96 - "FeaturesPage.tsx"
Cohesion: 0.12
Nodes (14): CreatePostPayload, GeneratePostPayload, CreatePostPayload, PostDesignOptions, PostFormat, PostListResponse, PostMedia, PostPaletteDef (+6 more)

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.10
Nodes (25): CalendarSkeleton(), ClientsSkeleton(), TeamSkeleton(), DashboardSkeleton(), FinanceResumoSkeleton(), FinancialSkeleton(), ReportsSkeleton(), PublicPageSkeleton() (+17 more)

### Community 98 - "ApiError"
Cohesion: 0.10
Nodes (25): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, AccessState, deriveAccessState(), deriveHasDashboard() (+17 more)

### Community 99 - "GoalsPanel.tsx"
Cohesion: 0.20
Nodes (7): ListMeta, PaymentProvider, paymentsApi, PaymentStatus, PixQrCode, Refund, RefundListResponse

### Community 100 - "ProductReportsPanel.tsx"
Cohesion: 0.33
Nodes (6): FORMAT_ASPECT, FORMAT_MAX_HEIGHT, PostPreviewBox(), PostPreviewBoxProps, LocalDraft, PostFormat

### Community 101 - "goalsApi.ts"
Cohesion: 0.17
Nodes (12): asNumber(), flattenGoal(), flattenList(), GoalMetric, GoalPeriod, GoalProgressRow, GoalRecord, goalsApi (+4 more)

### Community 102 - "softwareApplicationLd"
Cohesion: 0.29
Nodes (10): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+2 more)

### Community 103 - "commissionsApi.ts"
Cohesion: 0.29
Nodes (4): LoyaltyAccount, loyaltyApi, LoyaltyLedgerEntry, LoyaltyProgram

### Community 104 - "GiftCardsPanel.tsx"
Cohesion: 0.32
Nodes (6): CATEGORIES, CategoryDef, EmailPreferencesPanel(), EmailPreferencesPanelProps, Toast(), ToastProps

### Community 105 - "enhancedForecastApi.ts"
Cohesion: 0.11
Nodes (14): DAY_LABELS, DAYS, StaffManagementPanel(), STATUS_COLORS, STATUS_LABELS, asNumber(), normalizeService(), staffApi (+6 more)

### Community 106 - "README.md"
Cohesion: 0.25
Nodes (7): FIELD_TYPE_LABELS, FIELD_TYPES, FormsPanel(), Form, FormField, FormResponse, formsApi

### Community 107 - "SubscriptionContext.tsx"
Cohesion: 0.32
Nodes (4): PurchasingPanel(), PurchaseOrder, PurchaseOrderItem, purchasingApi

### Community 108 - "reputationApi.ts"
Cohesion: 0.27
Nodes (7): ReputationPanel(), responseTextOf(), sentimentIcon(), reputationApi, ReputationStats, Review, ReviewResponse

### Community 109 - "PasswordInput.tsx"
Cohesion: 0.18
Nodes (9): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel (+1 more)

### Community 110 - "qualityApi.ts"
Cohesion: 0.33
Nodes (5): QualityPanel(), qualityApi, QualityAudit, QualityOverview, QualityProtocol

### Community 111 - "CopilotPanel.tsx"
Cohesion: 0.16
Nodes (11): DepositIndicators(), DepositIndicatorsProps, STATUS_LABELS, STATUS_STYLES, DEPOSIT_REQUIRED_OPTIONS, DepositPolicyPanel(), NO_SHOW_RULE_OPTIONS, REFUND_RULE_OPTIONS (+3 more)

### Community 113 - "purchasingApi.ts"
Cohesion: 0.25
Nodes (4): PaginatedResponse, PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS

### Community 114 - "index.ts"
Cohesion: 0.14
Nodes (11): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, MarketingNav(), AboutPage(), beats (+3 more)

### Community 115 - "barbershopApi"
Cohesion: 0.15
Nodes (15): AuthContext, AuthContextValue, AuthProvider(), AuthResult, isTemporaryAuthError(), normalizeRole(), root, rootElement (+7 more)

### Community 116 - "data"
Cohesion: 0.36
Nodes (4): CopilotPanel(), priorityLabel(), copilotApi, CopilotSuggestion

### Community 117 - "ForgotPasswordPage.tsx"
Cohesion: 0.22
Nodes (7): Ticket, CATEGORY_LABELS, CHANNEL_LABELS, PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS, TicketDetailPage()

### Community 118 - "BarbershopFiltersContext.tsx"
Cohesion: 0.14
Nodes (16): brl(), FinancialDashboard(), isOwnerLike(), metric(), BarbershopInsights, CreateExpenseBody, CreateFiadoBody, ExpenseItem (+8 more)

### Community 119 - "productsApi.ts"
Cohesion: 0.15
Nodes (13): actionClassName, SystemStateAction, SystemStatePage(), SystemStatePageProps, pageLinks, sectionLinks, Logo(), LogoProps (+5 more)

### Community 120 - "CrmMergePanel.tsx"
Cohesion: 0.15
Nodes (18): MOVEMENT_LABEL, PAYMENT_LABEL, PRODUCT_PURPOSE_LABEL, PRODUCT_PURPOSE_SHORT, productMoney, SALE_STATUS_LABEL, Props, Props (+10 more)

### Community 121 - "AiPredictivePage.tsx"
Cohesion: 0.20
Nodes (12): AttentionKey, BANDS, initialPeriod(), ProductReportsPanel(), Props, purposeLabel(), ProductSalesPanel(), HubTab (+4 more)

### Community 122 - "ConfirmDialog.tsx"
Cohesion: 0.22
Nodes (9): formatStockQty(), ProductStockPanel(), Props, InventoryReceipt, Supplier, StockAdjustmentFormData, StockAdjustmentSchema, StockReceiptFormData (+1 more)

### Community 123 - "LandingPage.tsx"
Cohesion: 0.17
Nodes (13): AdminLayout(), NAV_ITEMS, ProfileSettingsPanel(), PrivateRoute(), PrivateRouteProps, useAuth(), applyDocumentTheme(), getInitialTheme() (+5 more)

### Community 125 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 128 - "SubscriptionContext.tsx"
Cohesion: 0.33
Nodes (3): Voucher, vouchersApi, VoucherUsage

### Community 129 - "RetailCheckoutBlock.tsx"
Cohesion: 0.60
Nodes (4): CurrencyInput(), CurrencyInputProps, formatDisplay(), parseRawDigits()

### Community 130 - "TasksPage.tsx"
Cohesion: 0.33
Nodes (4): Task, PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS

### Community 131 - "emailApi.ts"
Cohesion: 0.33
Nodes (3): WorkSummary, PRIORITY_COLORS, STATUS_COLORS

### Community 132 - "walletApi.ts"
Cohesion: 0.09
Nodes (27): FinancialDashboardProps, brl, PackageCatalog(), PackageCatalogProps, QueueItemCard(), QueueItemCardProps, item, service (+19 more)

### Community 133 - "CurrencyInput.tsx"
Cohesion: 0.14
Nodes (21): CatalogPurpose, ProductCatalogPanel(), Props, PURPOSE_META, SEGMENTS, ProductFormModal(), Props, TITLE_CASE_EXCEPTIONS (+13 more)

### Community 134 - "ReferralsTab.tsx"
Cohesion: 0.50
Nodes (3): dependencies, devDependencies, Inventário de pacotes — Frontend (agendai)

### Community 135 - "DashboardPage.tsx"
Cohesion: 0.33
Nodes (5): comparison, DashboardPage(), hourHeat, staffRows, weekBars

### Community 137 - "CorporatePanel.tsx"
Cohesion: 0.15
Nodes (11): CorporatePanel(), CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options, corporateApi (+3 more)

### Community 138 - "ShopFloorControls.tsx"
Cohesion: 0.23
Nodes (11): QueueCapacityBanner(), ReturnToQueueModal(), ALL_TAB_IDS, canAccessTab(), getDefaultTab(), getPrimaryTabForMode(), useScheduling(), useOnboardingStatus() (+3 more)

### Community 139 - "dateRanges.ts"
Cohesion: 0.52
Nodes (6): addDaysISO(), DefaultPeriod, getDefaultPeriod(), getPeriodRange(), todayISO(), toLocalIsoDate()

### Community 140 - "StaffDashboard"
Cohesion: 0.14
Nodes (19): busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps, OperationModeSection(), brl, digitsOnly() (+11 more)

### Community 141 - "walletApi.ts"
Cohesion: 0.33
Nodes (3): walletApi, WalletBalance, WalletEntry

### Community 143 - "TaskDetailPage.tsx"
Cohesion: 0.33
Nodes (3): PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS

### Community 144 - "googleCredential.ts"
Cohesion: 0.47
Nodes (3): base64UrlDecode(), decodeGoogleCredential(), GoogleCredentialClaims

### Community 145 - "Inventário de pacotes — Frontend (agendai)"
Cohesion: 0.67
Nodes (3): PublicLinkPanel(), PublicLinkPanelProps, qrUrl()

### Community 146 - "Header.test.tsx"
Cohesion: 0.22
Nodes (9): Header(), HeaderProps, owner, subscription, ThemeToggle(), useSubscription(), useTheme(), AccessBlockedPage() (+1 more)

## Knowledge Gaps
- **650 isolated node(s):** `root`, `findings`, `root`, `backend`, `methods` (+645 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `errorMessage.ts` to `StaffDashboard.tsx`, `LoginPage.tsx`, `OwnerFinancialPanel.tsx`, `schedulingUtils.ts`, `walletApi.ts`, `CheckoutPage.tsx`, `CurrencyInput.tsx`, `dependencies`, `devDependencies`, `CorporatePanel.tsx`, `BillingTab.tsx`, `MasterAdminDashboard.tsx`, `OwnerReferralsPanel.tsx`, `MarketingNav.tsx`, `paymentsApi.ts`, `StaffDashboard`, `apiClient.ts`, `MarketingFooter.tsx`, `ContactPage.tsx`, `ShopFloorControls.tsx`, `AiPredictivePage.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `PublicHome.test.tsx`, `ErrorBoundary.tsx`, `eslint-plugin-jsx-a11y`, `tailwindcss`, `@types/react`, `typescript`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `vite`, `vitest`, `@vitest/coverage-v8`, `postcss`, `PostsManager.tsx`, `@testing-library/user-event`, `index.tsx`, `MarketingNav.tsx`, `AboutPage.tsx`, `CheckoutPage.tsx`, `ForgotPasswordPage.tsx`, `FinancialDashboard.tsx`, `ApiError`, `enhancedForecastApi.ts`, `README.md`, `SubscriptionContext.tsx`, `reputationApi.ts`, `qualityApi.ts`, `CopilotPanel.tsx`, `barbershopApi`, `data`, `productsApi.ts`, `CrmMergePanel.tsx`, `AiPredictivePage.tsx`, `ConfirmDialog.tsx`, `LandingPage.tsx`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `LandingPage.tsx` to `StaffDashboard.tsx`, `CheckoutPage.tsx`, `CurrencyInput.tsx`, `ShopFloorControls.tsx`, `OwnerReferralsPanel.tsx`, `StaffDashboard`, `MarketingFooter.tsx`, `Header.test.tsx`, `AiPredictivePage.tsx`, `DashboardPage.tsx`, `AboutPage.tsx`, `@typescript-eslint/parser`, `vitest`, `@vitest/coverage-v8`, `postcss`, `PostsManager.tsx`, `scripts`, `AccessBlockedPage.tsx`, `ApiError`, `index.ts`, `barbershopApi`, `ForgotPasswordPage.tsx`, `productsApi.ts`, `CrmMergePanel.tsx`, `AiPredictivePage.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `apiClient()` connect `OwnerReferralsPanel.tsx` to `SubscriptionContext.tsx`, `LoginPage.tsx`, `schedulingUtils.ts`, `devDependencies`, `CheckoutPage.tsx`, `MasterAdminDashboard.tsx`, `CorporatePanel.tsx`, `adminApi.ts`, `MarketingNav.tsx`, `walletApi.ts`, `apiClient.ts`, `subscriptionsApi.ts`, `ContactPage.tsx`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `Run and deploy your AI Studio app`, `AppointmentBookingModal.tsx`, `tailwindcss`, `@tailwindcss/postcss`, `@testing-library/jest-dom`, `vitest`, `@vitest/coverage-v8`, `@testing-library/user-event`, `scripts`, `index.tsx`, `MarketingNav.tsx`, `AboutPage.tsx`, `CheckoutPage.tsx`, `AccessBlockedPage.tsx`, `FeaturesPage.tsx`, `ApiError`, `GoalsPanel.tsx`, `goalsApi.ts`, `commissionsApi.ts`, `enhancedForecastApi.ts`, `README.md`, `SubscriptionContext.tsx`, `reputationApi.ts`, `qualityApi.ts`, `CopilotPanel.tsx`, `barbershopApi`, `data`, `BarbershopFiltersContext.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `root` to the rest of the system?**
  _650 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaffDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._