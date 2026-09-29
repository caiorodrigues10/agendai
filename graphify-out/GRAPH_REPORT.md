# Graph Report - agendai  (2026-09-28)

## Corpus Check
- 374 files · ~286,992 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2162 nodes · 5059 edges · 145 communities (134 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `efd8bcf6`
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
- vite.config.ts
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
- TaskDetailPage.tsx
- enhancedForecastApi.ts
- README.md
- SubscriptionContext.tsx
- reputationApi.ts
- PasswordInput.tsx
- qualityApi.ts
- CopilotPanel.tsx
- SeoHead.tsx
- PlansPage.tsx
- crmApi.ts
- barbershopApi
- data
- ForgotPasswordPage.tsx
- BarbershopFiltersContext.tsx
- productsApi.ts
- CrmMergePanel.tsx
- NotificationHealthPanel.tsx
- WaitlistPanel.tsx
- LandingPage.tsx
- RetailCheckoutBlock.tsx
- credit-card-form.tsx
- TicketDetailPage.tsx
- SubscriptionContext.tsx
- RetailCheckoutBlock.tsx
- TasksPage.tsx
- emailApi.ts
- CatalogManager.tsx
- OwnerNotificationsPanel.tsx
- purchasingApi.ts
- Mapa de domínio — Frontend ↔ API
- TicketsPage.tsx
- CorporatePanel.tsx
- AiPredictivePage.tsx
- Inventário de marca — Agenda Já (frontend)
- StaffDashboard
- dateUtils.ts
- ReferralsTab.tsx
- walletApi.ts
- BillingPage.tsx

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 165 edges
2. `apiClient()` - 67 edges
3. `useBarbershopFilters()` - 65 edges
4. `authStorage` - 54 edges
5. `useAuth()` - 53 edges
6. `SmartSelect()` - 36 edges
7. `Service` - 35 edges
8. `maskPhone()` - 32 edges
9. `StaffMember` - 30 edges
10. `ConfirmDialog()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `AuthProvider()` --indirect_call--> `token()`  [INFERRED]
  src/contexts/AuthContext.tsx → src/infra/usersApi.ts
- `LoginPage()` --indirect_call--> `token()`  [INFERRED]
  src/pages/LoginPage.tsx → src/infra/subscriptionsApi.ts
- `AddCustomerFormProps` --references--> `Service`  [EXTRACTED]
  src/components/domain/AddCustomerForm.tsx → src/types.ts
- `ClientProfileSheet()` --indirect_call--> `data()`  [INFERRED]
  src/components/domain/ClientProfileSheet.tsx → src/infra/crmApi.ts
- `GoalsPanel()` --indirect_call--> `metric()`  [INFERRED]
  src/components/domain/GoalsPanel.tsx → src/components/domain/FinancialDashboard.tsx

## Import Cycles
- None detected.

## Communities (145 total, 11 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.14
Nodes (14): TeamManager(), TeamManagerProps, Button, ButtonProps, ButtonSize, ButtonVariant, sizes, variants (+6 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (15): intentColor(), intentLabel(), statusColor(), statusLabel(), View, WhatsAppAIPanel(), AiConversation, AiIntentLog (+7 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.13
Nodes (17): EMPTY_META, Tab, TABS, FinanceSummaryCard(), FinanceSummaryCardProps, EXPENSE_RECURRENCE_LABELS, EXPENSE_TYPE_LABELS, FINANCE_PAYMENT_METHODS (+9 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.15
Nodes (14): OwnerReferralsPanel(), OwnerReferralsPanelProps, STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton() (+6 more)

### Community 4 - "devDependencies"
Cohesion: 0.10
Nodes (31): SUPPORT_CATEGORY_LABELS, SUPPORT_FORM_CATEGORIES, SUPPORT_PRIORITY_LABELS, SUPPORT_STATUS_COLORS, SUPPORT_STATUS_LABELS, SupportFormCategory, toSupportCategory(), SupportReportDetail() (+23 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.11
Nodes (18): EmailHistoryPanel(), EmailHistoryPanelProps, LogEntry, STATUS_META, AppointmentPolicySection(), BusinessSegmentSection(), DEFAULT_APPOINTMENT_POLICY, MODE_OPTIONS (+10 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (28): BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS, formatDate() (+20 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (19): brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL, Header(), HeaderProps, owner (+11 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.11
Nodes (17): AdminNotificationItem, AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs, DashboardPeriod (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, node, ./src/*, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.22
Nodes (7): AdminLayout(), NAV_ITEMS, ThemeToggle(), useTheme(), ForgotPasswordPage(), inputClass(), MasterAdminDashboard()

### Community 11 - "App.tsx"
Cohesion: 0.05
Nodes (38): AboutPage, AccessBlockedPage, AccountsPage, AdminLayout, AiPredictivePage, AuditPage, BillingPage, CheckoutPage (+30 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.17
Nodes (18): AccessBlockedCode, apiClient(), apiFetch(), ApiRequestOptions, buildApiError(), calls, checkRateLimit(), doRefreshAccessToken() (+10 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.13
Nodes (19): PortalTab, TABS, asRecord(), ClientAppointment, ClientBenefit, clientFetch(), ClientIdentity, clientPortalApi (+11 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.07
Nodes (30): CatalogTab, CYCLE_LABELS, INITIAL_PLAN_FORM, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_STYLES, PlanFormData, Tab, INITIAL_FORM (+22 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.08
Nodes (16): PromptModal(), PromptModalProps, AuditLogDrawerProps, BarbershopsTab(), COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModal() (+8 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.19
Nodes (8): adminInternalApi, Invitation, TaskComment, TaskHistory, TeamMember, TicketComment, TicketHistory, TicketTask

### Community 18 - "ContactPage.tsx"
Cohesion: 0.14
Nodes (15): asNumber(), CreateShowcaseEntryInput, normalizeEntry(), normalizeList(), ShowcaseAnalytics, showcaseApi, ShowcaseEntry, ShowcaseEntryRaw (+7 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 20 - "IntersectionObserverMock"
Cohesion: 0.15
Nodes (5): IntersectionObserverMock, liveIntervals, nativeClearInterval, nativeSetInterval, ResizeObserverMock

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.15
Nodes (12): Payment, AsaasCreditCardPayload, CancelResponse, Invoice, PayerIdentification, PlanBillingCycle, PlanEconomics, SetupTrialCardPayload (+4 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 23 - "AiPredictivePage.tsx"
Cohesion: 0.14
Nodes (14): INITIAL_FORM, MOVEMENT_TYPE_DISPLAY_LABELS, MOVEMENT_TYPE_LABELS, MovementFormData, MovementType, movementTypeOptions, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS (+6 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.09
Nodes (22): ActivationChecklist(), Props, LocalDraft, QueueCapacityBanner(), OnboardingStatus, AddPostPayload, AddServicePayload, AppointmentPolicy (+14 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.18
Nodes (10): categoryApi(), ListMeta, ProcedureRecord, ForecastFactor, getForecastReport(), normalizePredictions(), token(), unwrap() (+2 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.22
Nodes (8): JsonLd, SeoHead(), SeoHeadProps, upsertJsonLd(), upsertLink(), upsertMeta(), sections, sections

### Community 27 - "AboutPage.tsx"
Cohesion: 0.09
Nodes (24): INITIAL_FORM, STATUS_COLORS, toDateInput(), TYPE_LABELS, VOUCHER_TYPES, VoucherForm, VouchersPanel(), voucherTypeOptions (+16 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.09
Nodes (21): CATEGORY_LABELS, CONDITION_LABELS, CONDITION_STYLES, EquipmentFormData, HubTab, INITIAL_EQUIP_FORM, INITIAL_MOVEMENT_FORM, INITIAL_NEED_FORM (+13 more)

### Community 31 - "PublicHome.test.tsx"
Cohesion: 0.10
Nodes (27): CashPanel(), DepositIndicators(), DepositIndicatorsProps, STATUS_LABELS, STATUS_STYLES, formatMetricValue(), GoalFormData, GoalMetric (+19 more)

### Community 33 - "vite.config.ts"
Cohesion: 0.20
Nodes (15): AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, calendarDateKey(), DAY_NAMES (+7 more)

### Community 36 - "LandingPage.tsx"
Cohesion: 0.18
Nodes (10): 1. Posicionamento, 2. Estrutura recomendada da landing, 3. Vídeo: onde colocar, 4. Use real screenshots, 5. Separação de login e cadastro, 6. PWA mobile-first, 7. Guardrails de marketing, 8. KPIs (+2 more)

### Community 37 - "AppointmentBookingModal.tsx"
Cohesion: 0.26
Nodes (13): BarbershopContext, BarbershopContextValue, BarbershopProvider(), isShopStaffRole(), BarbershopData, ShopStatusPayload, PostListResponse, FeedPost (+5 more)

### Community 38 - "ClientsManager.tsx"
Cohesion: 0.29
Nodes (6): 2026-08-28 — Redesign UX: Agenda (Salão/Profissional), 2026-08-28 — Upload de logo na tela Perfil, 2026-08-29 — Componente reutilizável ConfirmDialog + substituição no ServiceManager, 2026-08-29 — Fix: Erro cru do Google vazando pro usuário no upload de logo/avatar, 2026-08-29 — Redesign UX: unificar dois blocos de WhatsApp em Configurações, Backlog Técnico — Frontend

### Community 39 - "StaffMember"
Cohesion: 0.15
Nodes (15): StatusBadge(), StatusBadgeProps, Tone, TONES, FiadoStatusBadge(), FiadoStatusBadgeProps, TONES, FiadoStatus (+7 more)

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.33
Nodes (10): AddCustomerForm(), clientPhoneLabel(), ClientsManager(), ClientsManagerProps, QueueAlertSettings(), SettingsManager(), maskPhone(), normalizePhoneBR() (+2 more)

### Community 41 - "eslint-config-prettier"
Cohesion: 0.23
Nodes (8): TrialExpiredPaywallModal(), TrialExpiredPaywallModalProps, Plan, PlanBillingCycle, plansApi, AccessBlockedPage(), BlockInfo, formatDate()

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
Cohesion: 0.15
Nodes (19): PAYMENT_LABEL, productMoney, SALE_STATUS_LABEL, Props, Props, RefundLineState, RefundSaleModal(), METHODS (+11 more)

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.17
Nodes (5): ErrorBoundary, Props, State, getLastCorrelationId(), logger

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.21
Nodes (10): brl(), getCurrentPeriod(), pct(), ProfitEnginePanel(), ProfitEnginePanelProps, profitApi, ProfitEntry, ProfitPeriodData (+2 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.20
Nodes (8): brl, PackageCatalog(), PackageCatalogProps, packagesApi, PackageCatalogFormData, PackageCatalogSchema, PackagePaymentMethod, ServicePackage

### Community 53 - "@types/react"
Cohesion: 0.32
Nodes (6): CATEGORIES, CategoryDef, EmailPreferencesPanel(), EmailPreferencesPanelProps, Toast(), ToastProps

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.22
Nodes (4): Claude, Gemini, Agenda Já — Frontend, Rodar localmente

### Community 55 - "typescript"
Cohesion: 0.29
Nodes (5): emailApi, EmailDeliveryLog, EmailLegacyRow, EmailPreference, SalonaEmailSettings

### Community 56 - "typescript-eslint"
Cohesion: 0.18
Nodes (15): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, getWeatherIcon(), RISK_STYLES, WeatherForecastWidget(), WeatherForecastWidgetProps, financialApi (+7 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.19
Nodes (24): AppointmentBookingModal(), fieldClass(), AppointmentScheduler(), firstOpenDate(), BookPackageSessionsModal(), PickedSlot, Avatar(), AvatarProps (+16 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.40
Nodes (10): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, ShopProfileProps, AppointmentFormData, ShopSettings (+2 more)

### Community 59 - "vite"
Cohesion: 0.19
Nodes (9): INITIAL_FORM, IntegrationsPanel(), STATUS_LABELS, STATUS_STYLES, SyncFormData, TYPE_META, Integration, integrationsApi (+1 more)

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.29
Nodes (12): backend, backendRoutes(), checkContract(), frontendRequests(), literal(), methods, normalize(), parse() (+4 more)

### Community 61 - "vitest"
Cohesion: 0.15
Nodes (18): CategoryManager(), Props, category, Harness(), mocks, ServiceForm(), ServiceFormProps, ServiceManager() (+10 more)

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.29
Nodes (6): CrmMergePanel(), clientsApi, crmApi, request, run, CrmMergeSchema

### Community 63 - "paymentsApi.ts"
Cohesion: 0.36
Nodes (3): isAppTabSwitch(), jumpToTop(), ScrollToTop()

### Community 64 - "autoprefixer"
Cohesion: 0.14
Nodes (6): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, AiPredictivePage()

### Community 65 - "OwnerSubscriptionPanel.tsx"
Cohesion: 0.18
Nodes (13): PricingPersuasionCharts(), PricingPersuasionChartsProps, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload() (+5 more)

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
Cohesion: 0.12
Nodes (16): softwareApplicationLd(), trialCampaign, AboutPage(), beats, beliefs, friendships, comparison, DashboardPage() (+8 more)

### Community 70 - "@types/node"
Cohesion: 0.33
Nodes (5): Comandos (PowerShell / bash), Delegação a subagentes, Graphify — Frontend, Procedimento obrigatório, Regras

### Community 71 - "AboutPage.tsx"
Cohesion: 0.12
Nodes (19): FinancialDashboardProps, QueueItemCard(), QueueItemCardProps, item, service, ReturnToQueueModal(), ReturnToQueueModalProps, Addon (+11 more)

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.08
Nodes (27): clearLocalDraft(), downloadPostImage(), draftKey(), EditorStep, FORMAT_OPTIONS, formatDate(), MODE_OPTIONS, ObjectiveId (+19 more)

### Community 74 - "@testing-library/user-event"
Cohesion: 0.13
Nodes (15): CONDITIONS, DISCOUNT_TYPES, INITIAL_FORM, RULE_TYPE_LABELS, RULE_TYPES, RuleForm, SmartPricingPanel(), STATUS_COLORS (+7 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.10
Nodes (21): brl, MultiUnitDashboard(), attach, detach, fullShop, hook, listAvailable, operationalShop (+13 more)

### Community 76 - "scripts"
Cohesion: 0.20
Nodes (7): ListMeta, PaymentProvider, paymentsApi, PaymentStatus, PixQrCode, Refund, RefundListResponse

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.13
Nodes (19): brl, clientPhoneLabel(), ClientProfileSheet(), PAYMENT_LABEL, ProfileTab, shortDate(), data(), ClientEditFormData (+11 more)

### Community 79 - "index.tsx"
Cohesion: 0.24
Nodes (9): brl(), FinancialDashboard(), isOwnerLike(), metric(), CommissionEntry, commissionsApi, CommissionSummary, BarbershopInsights (+1 more)

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.11
Nodes (15): subscribe, forgetSavedAccountMock, loginMock, loginWithGoogleMock, loginWithSavedAccountMock, navigateMock, registerMock, registerWithGoogleMock (+7 more)

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
Cohesion: 0.20
Nodes (13): ClientCard(), ClientTableRow(), CrmIntelligencePanel(), FACTOR_LABELS, formatFactor(), IntelTab, Kpi(), money() (+5 more)

### Community 86 - "errorMessage.ts"
Cohesion: 0.24
Nodes (7): pickPlanForCheckout(), SubscribePayload, formatPrice(), REJECTION_MESSAGES, rejectionMessage(), SubscriptionCheckout(), SubscriptionCheckoutProps

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.21
Nodes (8): CrmBackfillPanel(), RunSummary(), statusLabel(), auth, run, CrmBackfillResult, CrmBackfillRun, CrmBackfillSchema

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.14
Nodes (22): ConsentCheckbox(), ConsentCheckboxProps, FieldProps, getPanelPathForRole(), inputClass(), LoginPage(), LoginPageProps, QUEUE_MOCK (+14 more)

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.29
Nodes (5): Contrato API e smoke de entrega, Smoke manual mínimo após deploy, Verificação offline, Inventário de scripts — Frontend (`agendai`), Observações

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.15
Nodes (11): CorporatePanel(), CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options, corporateApi (+3 more)

### Community 95 - "FinancialDashboard.tsx"
Cohesion: 0.46
Nodes (7): brl, digitsOnly(), formatBrPhone(), shopInitials(), ShopProfile(), todaySchedule(), waLink()

### Community 96 - "FeaturesPage.tsx"
Cohesion: 0.28
Nodes (6): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), token(), usersApi

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.10
Nodes (25): CalendarSkeleton(), ClientsSkeleton(), TeamSkeleton(), DashboardSkeleton(), FinanceResumoSkeleton(), FinancialSkeleton(), ReportsSkeleton(), PublicPageSkeleton() (+17 more)

### Community 98 - "ApiError"
Cohesion: 0.43
Nodes (6): captureStaffPage(), DESKTOP, dismissCookies(), makeContext(), MOBILE, shot()

### Community 99 - "GoalsPanel.tsx"
Cohesion: 0.50
Nodes (3): dependencies, devDependencies, Inventário de pacotes — Frontend (agendai)

### Community 100 - "ProductReportsPanel.tsx"
Cohesion: 0.15
Nodes (14): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, FORMAT_ASPECT, FORMAT_MAX_HEIGHT, PostPreviewBox(), PostPreviewBoxProps, DaySchedule, PostConfig (+6 more)

### Community 101 - "goalsApi.ts"
Cohesion: 0.17
Nodes (12): asNumber(), flattenGoal(), flattenList(), GoalMetric, GoalPeriod, GoalProgressRow, GoalRecord, goalsApi (+4 more)

### Community 102 - "softwareApplicationLd"
Cohesion: 0.24
Nodes (9): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+1 more)

### Community 103 - "commissionsApi.ts"
Cohesion: 0.22
Nodes (9): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel (+1 more)

### Community 104 - "TaskDetailPage.tsx"
Cohesion: 0.33
Nodes (4): Task, PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS

### Community 105 - "enhancedForecastApi.ts"
Cohesion: 0.15
Nodes (7): asNumber(), normalizeService(), staffApi, StaffServiceRaw, request, TimeOffRaw, TimeOffRequest

### Community 106 - "README.md"
Cohesion: 0.09
Nodes (24): EquipmentPanel(), FIELD_TYPE_LABELS, FIELD_TYPES, FormsPanel(), INITIAL_CONFIG, LoyaltyConfig, LoyaltyPanel(), ProfileSettingsPanel() (+16 more)

### Community 107 - "SubscriptionContext.tsx"
Cohesion: 0.14
Nodes (6): SavedAccount, LoyaltyAccount, loyaltyApi, LoyaltyLedgerEntry, LoyaltyProgram, Barbershop

### Community 108 - "reputationApi.ts"
Cohesion: 0.27
Nodes (7): ReputationPanel(), responseTextOf(), sentimentIcon(), reputationApi, ReputationStats, Review, ReviewResponse

### Community 109 - "PasswordInput.tsx"
Cohesion: 0.22
Nodes (7): actionClassName, SystemStateAction, SystemStatePage(), SystemStatePageProps, Logo(), LogoProps, sizeMap

### Community 110 - "qualityApi.ts"
Cohesion: 0.17
Nodes (10): QualityPanel(), BarbershopFiltersContext, BarbershopFiltersProvider(), BarbershopFiltersValue, DateRange, qualityApi, QualityAudit, QualityOverview (+2 more)

### Community 111 - "CopilotPanel.tsx"
Cohesion: 0.22
Nodes (7): DEPOSIT_REQUIRED_OPTIONS, DepositPolicyPanel(), NO_SHOW_RULE_OPTIONS, REFUND_RULE_OPTIONS, AppointmentDeposit, DepositPolicy, depositsApi

### Community 112 - "SeoHead.tsx"
Cohesion: 0.18
Nodes (14): ProductFormModal(), Props, TITLE_CASE_EXCEPTIONS, toTitleCase(), PRODUCT_PURPOSE_LABEL, STOCK_UNIT_OPTIONS, CurrencyInput(), CurrencyInputProps (+6 more)

### Community 113 - "PlansPage.tsx"
Cohesion: 0.30
Nodes (9): MarketingNav(), pageLinks, scrollToSection(), sectionLinks, matrix, objections, PlansPage(), isPaidSubscription() (+1 more)

### Community 114 - "crmApi.ts"
Cohesion: 0.22
Nodes (7): CrmCampaign, CrmClientMetric, CrmClientProfile, CrmForecast, CrmOverview, CrmRevenueGroup, CrmSegment

### Community 115 - "barbershopApi"
Cohesion: 0.23
Nodes (12): AuthContext, AuthContextValue, AuthProvider(), AuthResult, isTemporaryAuthError(), normalizeRole(), withAuthBootTimeout(), authApi (+4 more)

### Community 116 - "data"
Cohesion: 0.36
Nodes (4): CopilotPanel(), priorityLabel(), copilotApi, CopilotSuggestion

### Community 117 - "ForgotPasswordPage.tsx"
Cohesion: 0.11
Nodes (28): CatalogManager(), PublicLinkPanel(), PublicLinkPanelProps, qrUrl(), OperationModeSection(), ShopFloorControls(), ShopFloorControlsProps, statusCopy() (+20 more)

### Community 118 - "BarbershopFiltersContext.tsx"
Cohesion: 0.16
Nodes (12): ShopWeatherDay, resolveBarbershopId(), EnhancedForecastReport, CreateExpenseBody, CreateFiadoBody, ExpenseSummary, FiadoPayment, FinancialSummary (+4 more)

### Community 119 - "productsApi.ts"
Cohesion: 0.08
Nodes (30): CatalogTemplateModal(), Props, CatalogPurpose, ProductCatalogPanel(), Props, PURPOSE_META, SEGMENTS, MOVEMENT_LABEL (+22 more)

### Community 120 - "CrmMergePanel.tsx"
Cohesion: 0.13
Nodes (26): ClientsSection, ClientsTab(), ClientsTabProps, initialPeriod(), SECTION_META, VALID_SECTIONS, PRODUCT_PURPOSE_SHORT, AttentionKey (+18 more)

### Community 121 - "NotificationHealthPanel.tsx"
Cohesion: 0.38
Nodes (6): applyDocumentTheme(), getInitialTheme(), Theme, ThemeContext, ThemeContextValue, ThemeProvider()

### Community 122 - "WaitlistPanel.tsx"
Cohesion: 0.47
Nodes (5): dateLabel(), EnhancedForecastPanel(), EnhancedForecast, enhancedForecastApi, formatNumberBR()

### Community 125 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 127 - "TicketDetailPage.tsx"
Cohesion: 0.22
Nodes (7): Ticket, CATEGORY_LABELS, CHANNEL_LABELS, PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS, TicketDetailPage()

### Community 128 - "SubscriptionContext.tsx"
Cohesion: 0.25
Nodes (7): LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent, weatherTimeline

### Community 129 - "RetailCheckoutBlock.tsx"
Cohesion: 0.11
Nodes (21): ClientPortalDashboard(), ClientPortalLogin(), ClientPortalLoginProps, DESCRIPTIONS, DESTINATIONS, OnboardingChecklist(), OnboardingChecklistProps, Step (+13 more)

### Community 130 - "TasksPage.tsx"
Cohesion: 0.14
Nodes (12): FiscalPanel(), PRIORITY_CONFIG, RecommendationsPanel(), TYPE_CONFIG, ConfirmDialog(), ConfirmDialogProps, fiscalApi, FiscalConfig (+4 more)

### Community 131 - "emailApi.ts"
Cohesion: 0.33
Nodes (3): WorkSummary, PRIORITY_COLORS, STATUS_COLORS

### Community 132 - "CatalogManager.tsx"
Cohesion: 0.33
Nodes (3): PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS

### Community 133 - "OwnerNotificationsPanel.tsx"
Cohesion: 0.47
Nodes (3): base64UrlDecode(), decodeGoogleCredential(), GoogleCredentialClaims

### Community 134 - "purchasingApi.ts"
Cohesion: 0.32
Nodes (4): PurchasingPanel(), PurchaseOrder, PurchaseOrderItem, purchasingApi

### Community 135 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.50
Nodes (3): Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade

### Community 136 - "TicketsPage.tsx"
Cohesion: 0.25
Nodes (4): PaginatedResponse, PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS

### Community 139 - "Inventário de marca — Agenda Já (frontend)"
Cohesion: 0.33
Nodes (5): 1. Alterada, 2. Exceção técnica (preservadas, deliberadas), 3. Histórico preservado, 4. Pendências / notas, Inventário de marca — Agenda Já (frontend)

### Community 140 - "StaffDashboard"
Cohesion: 0.10
Nodes (25): busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps, sameSnapshot(), SchedulingContext, SchedulingContextValue (+17 more)

### Community 141 - "dateUtils.ts"
Cohesion: 0.14
Nodes (19): AddCustomerFormProps, ClientCreateFormData, ClientCreateSchema, CustomerQueueFormData, CustomerQueueSchema, CustomerQueueStaffFormData, CustomerQueueStaffSchema, LoginFormData (+11 more)

### Community 142 - "ReferralsTab.tsx"
Cohesion: 0.40
Nodes (3): adminApi, ReferralPlatformStats, ReferralsTab()

### Community 143 - "walletApi.ts"
Cohesion: 0.33
Nodes (3): walletApi, WalletBalance, WalletEntry

## Knowledge Gaps
- **678 isolated node(s):** `root`, `findings`, `DESKTOP`, `MOBILE`, `root` (+673 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `RetailCheckoutBlock.tsx` to `StaffDashboard.tsx`, `LoginPage.tsx`, `TasksPage.tsx`, `OwnerFinancialPanel.tsx`, `schedulingUtils.ts`, `CheckoutPage.tsx`, `purchasingApi.ts`, `dependencies`, `devDependencies`, `BillingTab.tsx`, `StaffDashboard`, `dateUtils.ts`, `paymentsApi.ts`, `MarketingNav.tsx`, `apiClient.ts`, `MarketingFooter.tsx`, `ContactPage.tsx`, `ReferralsTab.tsx`, `AiPredictivePage.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `PublicHome.test.tsx`, `ErrorBoundary.tsx`, `eslint-plugin-jsx-a11y`, `tailwindcss`, `@testing-library/react`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `vite`, `vitest`, `@vitest/coverage-v8`, `AboutPage.tsx`, `PostsManager.tsx`, `@testing-library/user-event`, `PwaInstallContext.tsx`, `CheckoutPage.tsx`, `MarketingNav.tsx`, `FiscalPanel.tsx`, `errorMessage.ts`, `CheckoutPage.tsx`, `ForgotPasswordPage.tsx`, `FinancialDashboard.tsx`, `FeaturesPage.tsx`, `README.md`, `reputationApi.ts`, `qualityApi.ts`, `CopilotPanel.tsx`, `SeoHead.tsx`, `PlansPage.tsx`, `barbershopApi`, `data`, `ForgotPasswordPage.tsx`, `productsApi.ts`, `CrmMergePanel.tsx`, `WaitlistPanel.tsx`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `CrmMergePanel.tsx` to `StaffDashboard.tsx`, `dependencies`, `adminApi.ts`, `StaffDashboard`, `MarketingFooter.tsx`, `AiPredictivePage.tsx`, `PublicHome.test.tsx`, `AppointmentBookingModal.tsx`, `eslint-config-prettier`, `tailwindcss`, `vitest`, `PostsManager.tsx`, `ShopProfile.tsx`, `errorMessage.ts`, `CheckoutPage.tsx`, `AccessBlockedPage.tsx`, `FeaturesPage.tsx`, `README.md`, `PlansPage.tsx`, `barbershopApi`, `ForgotPasswordPage.tsx`, `productsApi.ts`, `NotificationHealthPanel.tsx`, `LandingPage.tsx`, `TicketDetailPage.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `authStorage` connect `PwaInstallContext.tsx` to `LoginPage.tsx`, `TasksPage.tsx`, `schedulingUtils.ts`, `devDependencies`, `purchasingApi.ts`, `MasterAdminDashboard.tsx`, `StaffDashboard`, `OwnerReferralsPanel.tsx`, `paymentsApi.ts`, `apiClient.ts`, `subscriptionsApi.ts`, `ContactPage.tsx`, `SubscriptionContext.tsx`, `AiPredictivePage.tsx`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `@testing-library/jest-dom`, `@testing-library/react`, `typescript`, `vite`, `vitest`, `PostsManager.tsx`, `@testing-library/user-event`, `scripts`, `index.tsx`, `AccessBlockedPage.tsx`, `ForgotPasswordPage.tsx`, `FeaturesPage.tsx`, `goalsApi.ts`, `enhancedForecastApi.ts`, `README.md`, `SubscriptionContext.tsx`, `reputationApi.ts`, `qualityApi.ts`, `CopilotPanel.tsx`, `crmApi.ts`, `barbershopApi`, `data`, `BarbershopFiltersContext.tsx`, `productsApi.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `DESKTOP` to the rest of the system?**
  _678 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StaffDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._
- **Should `OwnerFinancialPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12987012987012986 - nodes in this community are weakly interconnected._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._