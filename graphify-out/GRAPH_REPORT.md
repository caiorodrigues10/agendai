# Graph Report - agendai  (2026-10-03)

## Corpus Check
- 520 files · ~414,817 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2782 nodes · 6194 edges · 179 communities (166 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `383c29c6`
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
- AiPredictivePage.tsx
- Inventário de marca — Agenda Já (frontend)
- StaffDashboard
- dateUtils.ts
- GoalsPanel.tsx
- ProductReportsPanel.tsx
- paymentsApi.ts
- Etapa 3 — Componentes: movimentos, unificação e novos padrões
- ForgotPasswordPage.tsx
- TokensGallery.stories.tsx
- Etapa 0 — Inventário de componentes, consumidores e duplicações
- Etapa 0 — Mapa: rotas, layouts, providers, estilos, code-splitting
- CopilotPanel.tsx
- preview.tsx
- RetailCheckoutBlock.tsx
- main.ts
- AiPredictivePage.tsx
- TicketsPage.tsx
- FeaturesPage.tsx
- FinanceResumoSkeleton.tsx
- README.md
- BillingPage.tsx
- QueueCapacityBanner.stories.tsx
- Mapa de domínio — Frontend ↔ API
- ShopProfile.tsx
- PrivateRoute.tsx
- ForgotPasswordPage.tsx
- FeaturesPage.tsx
- Inventário de pacotes — Frontend (agendai)
- googleCredential.ts
- SubscriptionContext.tsx
- CatalogManager.tsx
- 5. `features/<área>/components/` — domain (Etapas 5–7)
- App.routes.test.ts
- Posts e perfil social — entrega e validação
- FinanceResumoSkeleton.tsx
- buildQuery
- post-social.spec.ts
- Settlement §6 — painéis `0c` e UI órfã
- BillingTab

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 180 edges
2. `apiClient()` - 69 edges
3. `useBarbershopFilters()` - 65 edges
4. `authStorage` - 57 edges
5. `useAuth()` - 51 edges
6. `Service` - 38 edges
7. `SmartSelect()` - 37 edges
8. `maskPhone()` - 35 edges
9. `Field()` - 34 edges
10. `StaffMember` - 34 edges

## Surprising Connections (you probably didn't know these)
- `flushPendingResets()` --indirect_call--> `resolve()`  [INFERRED]
  src/components/infra/ScrollToTop.test.tsx → scripts/check-orphan-exports.mjs
- `ClientProfileSheet()` --indirect_call--> `data()`  [INFERRED]
  src/features/clients/ClientProfileSheet.tsx → src/infra/crmApi.ts
- `LoginPage()` --indirect_call--> `token()`  [INFERRED]
  src/pages/LoginPage.tsx → src/infra/subscriptionsApi.ts
- `AuthProvider()` --indirect_call--> `token()`  [INFERRED]
  src/contexts/AuthContext.tsx → src/infra/usersApi.ts
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  src/layouts/admin/AdminLayout.tsx → src/contexts/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (179 total, 13 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.17
Nodes (11): CalendarSkeleton(), CardSkeleton(), ClientsSkeleton(), DashboardSkeleton(), FinancialSkeleton(), ListSkeleton(), PublicPageSkeleton(), QueueSkeleton() (+3 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (15): intentColor(), intentLabel(), statusColor(), statusLabel(), View, WhatsAppAIPanel(), AiConversation, AiIntentLog (+7 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.17
Nodes (5): ErrorBoundary, Props, State, getLastCorrelationId(), logger

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.16
Nodes (14): OwnerReferralsPanel(), OwnerReferralsPanelProps, STATUS_LABEL, STATUS_STYLES, ReferralTierBadge(), ReferralTierBadgeProps, TIER_CONFIG, ShareReferralButton() (+6 more)

### Community 4 - "devDependencies"
Cohesion: 0.11
Nodes (31): SUPPORT_CATEGORY_LABELS, SUPPORT_FORM_CATEGORIES, SUPPORT_PRIORITY_LABELS, SUPPORT_STATUS_COLORS, SUPPORT_STATUS_LABELS, SupportFormCategory, toSupportCategory(), SupportPanel() (+23 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.11
Nodes (25): Field(), FieldProps, AccountPrivacyPanel(), token(), AppointmentPolicySection(), DEFAULT_APPOINTMENT_POLICY, EmailHistoryPanel(), EmailHistoryPanelProps (+17 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.12
Nodes (26): BillingKpiCard(), CANCEL_REASON_LABELS, EMPTY_META, formatDateTime(), PaginationBar(), PaginationBarProps, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_CONFIG (+18 more)

### Community 7 - "dependencies"
Cohesion: 0.12
Nodes (15): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, trialCampaign, AboutPage(), beats (+7 more)

### Community 8 - "MasterAdminDashboard.tsx"
Cohesion: 0.10
Nodes (19): cfg, checker, configPath, consumed, deadFiles, fileImporters, keyOf(), markAll() (+11 more)

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (26): DOM, DOM.Iterable, ES2022, node, ./src/*, ./.storybook/**/*.ts, ./.storybook/**/*.tsx, vitest.shims.d.ts (+18 more)

### Community 10 - "adminApi.ts"
Cohesion: 0.13
Nodes (19): AddCustomerForm(), AddCustomerFormProps, clientPhoneLabel(), ClientsManager(), ClientsManagerProps, ServiceCard(), ServiceCardProps, ReservationsBlock() (+11 more)

### Community 11 - "App.tsx"
Cohesion: 0.05
Nodes (41): AboutPage, AccessBlockedPage, AccountsPage, AdminLayout, AiPredictivePage, AuditPage, BillingPage, CheckoutPage (+33 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.13
Nodes (20): ACCESS_BLOCKED_CODES, AccessBlockedCode, apiClient(), apiFetch(), ApiRequestOptions, buildApiError(), calls, checkRateLimit() (+12 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.11
Nodes (22): ClientPortalDashboard(), PortalTab, TABS, ClientPortalLogin(), ClientPortalLoginProps, asRecord(), ClientAppointment, ClientBenefit (+14 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.13
Nodes (13): CatalogTemplateModal(), Props, CatalogTemplatePreview, CatalogTemplatePreviewItem, InventoryReceiptItem, ListMeta, ProductListPurpose, ProductReservationSummary (+5 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.06
Nodes (25): AuditLog, BarbershopListItem, BlockedEntityItem, DashboardChartPoint, DashboardData, DashboardKPIs, DashboardPeriod, RecentBarbershop (+17 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.05
Nodes (31): adminInternalApi, InternalProfile, Invitation, PaginatedResponse, Task, TaskComment, TaskHistory, TeamMember (+23 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.18
Nodes (11): asNumber(), CreateShowcaseEntryInput, normalizeEntry(), normalizeList(), ShowcaseAnalytics, ShowcaseEntryRaw, ShowcaseImageAuthorization, ShowcaseMode (+3 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 20 - "IntersectionObserverMock"
Cohesion: 0.15
Nodes (5): IntersectionObserverMock, liveIntervals, nativeClearInterval, nativeSetInterval, ResizeObserverMock

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.14
Nodes (14): CONDITIONS, DISCOUNT_TYPES, INITIAL_FORM, RULE_TYPE_LABELS, RULE_TYPES, RuleForm, STATUS_COLORS, PriceEvaluation (+6 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 23 - "AiPredictivePage.tsx"
Cohesion: 0.09
Nodes (28): DepositIndicators(), DepositIndicatorsProps, STATUS_LABELS, STATUS_STYLES, EmptyState(), EmptyStateProps, CashPanel(), OwnerFinancialPanel() (+20 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.10
Nodes (27): BarbershopContext, BarbershopContextValue, BarbershopProvider(), isShopStaffRole(), AddPostPayload, AddServicePayload, BarbershopData, PostConfigPayload (+19 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.13
Nodes (18): destinations, OnboardingMissions(), Props, Step, titles, BusinessSegmentSection(), SEGMENT_OPTIONS, ProfileAvatarSection() (+10 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.19
Nodes (15): CardSkeletonProps, FormSkeleton(), FormSkeletonProps, ListSkeletonProps, Skeleton(), SkeletonProps, SkeletonRegion(), Base (+7 more)

### Community 27 - "AboutPage.tsx"
Cohesion: 0.12
Nodes (18): cashApi, CashMovement, CashSummary, ClientRecurringPackage, membershipsApi, RecurringPackageBenefit, RecurringPackageCycle, RecurringPackagePlan (+10 more)

### Community 28 - "Run and deploy your AI Studio app"
Cohesion: 0.08
Nodes (22): CATEGORY_LABELS, CONDITION_LABELS, CONDITION_STYLES, EquipmentFormData, EquipmentPanel(), HubTab, INITIAL_EQUIP_FORM, INITIAL_MOVEMENT_FORM (+14 more)

### Community 31 - "PublicHome.test.tsx"
Cohesion: 0.13
Nodes (10): extraArgs, MIME, noBuild, ownArgs, PORT, root, sepIdx, server (+2 more)

### Community 33 - "vite.config.ts"
Cohesion: 0.15
Nodes (9): JsonLd, MarketingLayout, MarketingLayoutProps, sections, daySlots, flowSteps, pros, SchedulingPage() (+1 more)

### Community 36 - "LandingPage.tsx"
Cohesion: 0.18
Nodes (10): 1. Posicionamento, 2. Estrutura recomendada da landing, 3. Vídeo: onde colocar, 4. Use real screenshots, 5. Separação de login e cadastro, 6. PWA mobile-first, 7. Guardrails de marketing, 8. KPIs (+2 more)

### Community 37 - "AppointmentBookingModal.tsx"
Cohesion: 0.13
Nodes (13): CreatePostPayload, GeneratePostPayload, CreatePostPayload, PostDesignOptions, PostFormat, PostMedia, PostPaletteDef, PostPhotoMode (+5 more)

### Community 38 - "ClientsManager.tsx"
Cohesion: 0.29
Nodes (6): 2026-08-28 — Redesign UX: Agenda (Salão/Profissional), 2026-08-28 — Upload de logo na tela Perfil, 2026-08-29 — Componente reutilizável ConfirmDialog + substituição no ServiceManager, 2026-08-29 — Fix: Erro cru do Google vazando pro usuário no upload de logo/avatar, 2026-08-29 — Redesign UX: unificar dois blocos de WhatsApp em Configurações, Backlog Técnico — Frontend

### Community 39 - "StaffMember"
Cohesion: 0.23
Nodes (10): StatusBadge(), StatusBadgeProps, Tone, TONES, FiadoStatusBadge(), FiadoStatusBadgeProps, TONES, FiadoStatus (+2 more)

### Community 40 - "ErrorBoundary.tsx"
Cohesion: 0.40
Nodes (10): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, ShopProfileProps, AppointmentFormData, ShopSettings (+2 more)

### Community 41 - "eslint-config-prettier"
Cohesion: 0.07
Nodes (41): useAuth(), ClientsSection, ClientsTab(), ClientsTabProps, SECTION_META, VALID_SECTIONS, CrmBackfillPanel(), RunSummary() (+33 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.14
Nodes (16): clearLocalDraft(), downloadPostImage(), draftKey(), EditorStep, FORMAT_OPTIONS, formatDate(), MODE_OPTIONS, PostsManager() (+8 more)

### Community 43 - "referralStorage.ts"
Cohesion: 0.40
Nodes (3): ReferralRefCapture(), referralStorage, Stored

### Community 44 - "jsdom"
Cohesion: 0.17
Nodes (12): root, rootElement, installSteps, PwaInstallCard(), PwaInstallCardProps, BeforeInstallPromptEvent, isStandaloneDisplay(), PwaInstallContext (+4 more)

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
Cohesion: 0.36
Nodes (6): Toast(), ToastProps, SectionError(), PlanFormModalProps, adminApi, PlanItem

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.09
Nodes (21): BarbershopFiltersContext, BarbershopFiltersProvider(), BarbershopFiltersValue, DateRange, INITIAL_FORM, MOVEMENT_TYPE_DISPLAY_LABELS, MOVEMENT_TYPE_LABELS, MovementFormData (+13 more)

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.18
Nodes (13): SchedulingContextValue, busyCopy(), BusyLevel, busyStyles(), QueueStatusCard(), QueueStatusCardProps, Closed, insight (+5 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.12
Nodes (24): ALL_TAB_IDS, canAccessTab(), canAccessTabByMode(), getDefaultTab(), getPrimaryTabForMode(), MOBILE_PRIMARY_TAB_IDS, TAB_GROUPS, TabDef (+16 more)

### Community 53 - "@types/react"
Cohesion: 0.27
Nodes (9): formatMetricValue(), GoalFormData, GoalMetric, GoalsPanel(), INITIAL_FORM, METRIC_LABELS, progressColor(), progressWidth() (+1 more)

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.22
Nodes (4): Claude, Gemini, Agenda Já — Frontend, Rodar localmente

### Community 55 - "typescript"
Cohesion: 0.09
Nodes (25): Default, PreselectedClient, Story, WithOccupancy, availabilityHandler, Default, FROZEN_NOW, FrozenDate (+17 more)

### Community 56 - "typescript-eslint"
Cohesion: 0.33
Nodes (6): CatalogManager(), CatalogTab, catalogApi, ServiceAddon, ServiceCombo, ServiceVariation

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.19
Nodes (25): Avatar(), AvatarProps, AvatarSize, COLORS, getColorClass(), getInitials(), SIZE_MAP, parseLocalISO() (+17 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.13
Nodes (14): subscribe, forgetSavedAccountMock, loginMock, loginWithGoogleMock, loginWithSavedAccountMock, navigateMock, registerMock, registerWithGoogleMock (+6 more)

### Community 59 - "vite"
Cohesion: 0.14
Nodes (18): AccessState, deriveAccessState(), deriveHasDashboard(), SubscriptionContext, SubscriptionContextValue, SubscriptionProvider(), brl(), CANCEL_REASONS (+10 more)

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.25
Nodes (15): backend, backendRoutes(), checkContract(), frontendRequests(), helperMap(), helperTarget(), literal(), methods (+7 more)

### Community 61 - "vitest"
Cohesion: 0.22
Nodes (8): MOVEMENT_LABEL, Props, InventoryReceipt, Supplier, StockAdjustmentFormData, StockAdjustmentSchema, StockReceiptFormData, StockReceiptSchema

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.19
Nodes (12): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload(), THEMES, useChart() (+4 more)

### Community 63 - "paymentsApi.ts"
Cohesion: 0.14
Nodes (4): registerScrollTrigger(), ScrollTriggerApi, AiPredictivePage(), FeaturesPage()

### Community 64 - "autoprefixer"
Cohesion: 0.36
Nodes (7): brl(), FinancialDashboard(), isOwnerLike(), metric(), BarbershopInsights, financialApi, InsightsPeriod

### Community 65 - "OwnerSubscriptionPanel.tsx"
Cohesion: 0.11
Nodes (18): brl, MultiUnitDashboard(), attach, detach, fullShop, hook, listAvailable, operationalShop (+10 more)

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
Cohesion: 0.11
Nodes (25): DynamicIcon(), DynamicIconProps, ICON_OPTIONS, CategoryManager(), Props, category, Harness(), mocks (+17 more)

### Community 70 - "@types/node"
Cohesion: 0.33
Nodes (5): Comandos (PowerShell / bash), Delegação a subagentes, Graphify — Frontend, Procedimento obrigatório, Regras

### Community 71 - "AboutPage.tsx"
Cohesion: 0.17
Nodes (12): actionClassName, SystemStateAction, SystemStatePage(), SystemStatePageProps, MarketingNav(), pageLinks, scrollToSection(), sectionLinks (+4 more)

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.08
Nodes (24): availabilityLabel(), ProductCard(), ProductCardProps, Props, PublicProductCarousel(), { mockList }, shop, PublicProduct (+16 more)

### Community 74 - "@testing-library/user-event"
Cohesion: 0.09
Nodes (24): INITIAL_FORM, STATUS_COLORS, toDateInput(), TYPE_LABELS, VOUCHER_TYPES, VoucherForm, VouchersPanel(), voucherTypeOptions (+16 more)

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.21
Nodes (10): brl(), getCurrentPeriod(), pct(), ProfitEnginePanel(), ProfitEnginePanelProps, profitApi, ProfitEntry, ProfitPeriodData (+2 more)

### Community 76 - "scripts"
Cohesion: 0.10
Nodes (21): EMPTY_META, errorMessage(), Tab, TABS, resolveBarbershopId(), CreateExpenseBody, CreateFiadoBody, ExpenseCategory (+13 more)

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.32
Nodes (4): PurchasingPanel(), PurchaseOrder, PurchaseOrderItem, purchasingApi

### Community 79 - "index.tsx"
Cohesion: 0.15
Nodes (18): clearDraft(), downloadImage(), draftKey(), EditorTab, FORMAT_OPTIONS, GROUP_LABELS, groupLabel(), localDateTime() (+10 more)

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.22
Nodes (8): ActivationChecklist(), Props, DESCRIPTIONS, DESTINATIONS, OnboardingChecklist(), OnboardingChecklistProps, Step, TITLES

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
Cohesion: 0.29
Nodes (6): Default, Disabled, Select, Story, WithError, WithHint

### Community 86 - "errorMessage.ts"
Cohesion: 0.17
Nodes (10): 1. Migração de componentes, 2. Adoção de padrões (CatalogManager — ação da matriz), 3. Gate da Etapa 6b, 4. Pendências / próximo, Etapa 6b — Catálogo / produtos (§5.3), 1. Migração de componentes, 2. Adoções (ações sancionadas pela matriz §5.4), 3. Gate da Etapa 6c (+2 more)

### Community 88 - "PaginationBar.tsx"
Cohesion: 0.16
Nodes (12): PaginationBar(), PaginationBarProps, confirmMessageFor(), FILTERS, PendingAction, ProductReservationsPanel(), Props, STATUS_FILTER_LABEL (+4 more)

### Community 91 - "CheckoutPage.tsx"
Cohesion: 0.16
Nodes (16): AuthContext, AuthContextValue, AuthProvider(), AuthResult, isTemporaryAuthError(), normalizeRole(), withAuthBootTimeout(), AccountPrivacyPanelProps (+8 more)

### Community 92 - "AccessBlockedPage.tsx"
Cohesion: 0.10
Nodes (30): ConsentCheckbox(), ConsentCheckboxProps, formatPrice(), rejectionMessage(), SubscriptionCheckout(), FieldProps, getPanelPathForRole(), inputClass() (+22 more)

### Community 93 - "credit-card-form.tsx"
Cohesion: 0.29
Nodes (5): Contrato API e smoke de entrega, Smoke manual mínimo após deploy, Verificação offline, Inventário de scripts — Frontend (`agendai`), Observações

### Community 94 - "ForgotPasswordPage.tsx"
Cohesion: 0.25
Nodes (6): baseInsights, Compacto, Critico, prediction, RiscoMedio, Story

### Community 95 - "FinancialDashboard.tsx"
Cohesion: 0.24
Nodes (8): PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT, getPasswordStrength(), LABELS, PasswordStrengthLevel, PasswordStrengthResult

### Community 96 - "FeaturesPage.tsx"
Cohesion: 0.12
Nodes (14): 1. Mapa de rotas (`App.tsx`, `<Routes>` plano — único layout aninhado é `/master`), 2. Layouts e providers, 3. Entry point, 4. Classificação de estilos, 5. Code-splitting, Etapa 0 — Mapa: rotas, layouts, providers, estilos, code-splitting, 1. Entry/app shell, 2. MSW (mock HTTP para stories/testes) (+6 more)

### Community 97 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.19
Nodes (10): TableSkeletonProps, DataTableState(), DataTableStateProps, Empty, EmptyWithActionlessDescription, Error, Loading, Story (+2 more)

### Community 98 - "ApiError"
Cohesion: 0.43
Nodes (6): captureStaffPage(), DESKTOP, dismissCookies(), makeContext(), MOBILE, shot()

### Community 99 - "GoalsPanel.tsx"
Cohesion: 0.09
Nodes (26): Addon, Combo, ServiceBookingSelectorProps, Variation, sameSnapshot(), SchedulingContext, SchedulingProvider(), FinancialDashboardProps (+18 more)

### Community 100 - "ProductReportsPanel.tsx"
Cohesion: 0.32
Nodes (6): FORMAT_ASPECT, FORMAT_MAX_HEIGHT, FORMAT_MAX_WIDTH, PostPreviewBox(), PostPreviewBoxProps, PostFormat

### Community 101 - "goalsApi.ts"
Cohesion: 0.17
Nodes (12): asNumber(), flattenGoal(), flattenList(), GoalMetric, GoalPeriod, GoalProgressRow, GoalRecord, goalsApi (+4 more)

### Community 102 - "softwareApplicationLd"
Cohesion: 0.24
Nodes (10): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+2 more)

### Community 103 - "commissionsApi.ts"
Cohesion: 0.14
Nodes (11): 1. Migração de componentes (§5.1), 2. Adoção de padrões, 3. Stories (inclui pendências da Etapa 4), 4. Gate da Etapa 5a, 5. Pendências / próximo, Etapa 5a — Operação: clients / appointments / onboarding, 1. Migração de componentes, 2. Adoção de padrões (+3 more)

### Community 104 - "TaskDetailPage.tsx"
Cohesion: 0.20
Nodes (8): Compacto, Default, Erro, forecast, insights, prediction, SemDados, Story

### Community 105 - "enhancedForecastApi.ts"
Cohesion: 0.11
Nodes (14): DAY_LABELS, DAYS, StaffManagementPanel(), STATUS_COLORS, STATUS_LABELS, asNumber(), normalizeService(), staffApi (+6 more)

### Community 106 - "README.md"
Cohesion: 0.26
Nodes (11): useAuthOptional(), getInitialTheme(), Theme, ThemePreferenceContext, ThemePreferenceProvider(), ThemePreferenceValue, useThemePreference(), applyDocumentTheme() (+3 more)

### Community 107 - "SubscriptionContext.tsx"
Cohesion: 0.08
Nodes (15): authStorage, SavedAccount, CommissionEntry, commissionsApi, CommissionSummary, EmailDeliveryLog, EmailLegacyRow, EmailPreference (+7 more)

### Community 108 - "reputationApi.ts"
Cohesion: 0.05
Nodes (56): ReputationPanel(), responseTextOf(), sentimentIcon(), buildPostShareUrl(), buildProfileShareUrl(), currentStaffCanModerate(), formatDate(), InlineClientLogin() (+48 more)

### Community 110 - "qualityApi.ts"
Cohesion: 0.33
Nodes (6): FinanceSummaryCard(), FinanceSummaryCardProps, EXPENSE_RECURRENCE_LABELS, EXPENSE_TYPE_LABELS, FINANCE_PAYMENT_METHODS, ExpenseType

### Community 111 - "CopilotPanel.tsx"
Cohesion: 0.24
Nodes (7): PricingPersuasionCharts(), matrix, objections, PlansPage(), Tier, tierAmounts(), isPaidSubscription()

### Community 112 - "SeoHead.tsx"
Cohesion: 0.11
Nodes (19): RetailCartItem, CurrencyInput(), CurrencyInputProps, formatDisplay(), parseRawDigits(), ProductFormModal(), Props, mocks (+11 more)

### Community 113 - "PlansPage.tsx"
Cohesion: 0.33
Nodes (5): 1. Evidências do gate final, 2. Escopo cumprido (Etapas 0 → 10), 3. Débitos abertos ao fechar (detalhes em `debts.md`), 4. Pendências do usuário (fora do gate), Etapa 10 — Entrega final (evidências)

### Community 114 - "crmApi.ts"
Cohesion: 0.13
Nodes (15): 1. `components/ui/` — genérico puro (Etapa 3), 2. `components/patterns/` — padrões novos a criar (Etapa 3, fecham as duplicações §5), 3. `components/infra/` — já existe; ajustes de camada (Etapa 3), 4. `layouts/` (Etapa 4 — resolve repetição de chrome), 5.1 Operação (piloto = queue, Etapa 4), 5.2 Clientes / CRM (Etapa 6), 5.3 Catálogo / produtos, 5.4 Conta / settings / time (Etapa 6) (+7 more)

### Community 116 - "data"
Cohesion: 0.25
Nodes (7): 1. Contratos (`contract:check`), 2. Permissões × rotas, 3. Persistência (storage sweep), 4. Dívidas registradas, 5. Gate, 6. Próximo, Etapa 8 — Permissões, persistência e contratos

### Community 117 - "ForgotPasswordPage.tsx"
Cohesion: 0.21
Nodes (9): SmartPricingPanel(), useBarbershop(), MODE_OPTIONS, OperationModeSection(), OperationModeSectionProps, ShopFloorControls(), ShopFloorControlsProps, statusCopy() (+1 more)

### Community 118 - "BarbershopFiltersContext.tsx"
Cohesion: 0.25
Nodes (8): 1. CSS dividido (fontes em `src/styles/`), 2. Separação de tema × política de auth, 3. Storybook 10.6 (local, sem SDKs externos), 4. Correções de tooling para manter o gate, 5. Gate da Etapa 1, 6. Próximo, Correção upstream embutida (dívida D-001), Etapa 1 — Fundações, tokens, temas e Storybook

### Community 119 - "productsApi.ts"
Cohesion: 0.20
Nodes (14): METHODS, Props, RetailCheckoutBlock(), PAYMENT_LABEL, productMoney, SALE_STATUS_LABEL, Props, Props (+6 more)

### Community 120 - "CrmMergePanel.tsx"
Cohesion: 0.20
Nodes (17): initialPeriod(), PRODUCT_PURPOSE_SHORT, AttentionKey, BANDS, initialPeriod(), ProductReportsPanel(), Props, purposeLabel() (+9 more)

### Community 121 - "NotificationHealthPanel.tsx"
Cohesion: 0.21
Nodes (9): Default, items, Story, WithDisabled, WithIcons, TabItem, Tabs(), TabsProps (+1 more)

### Community 122 - "WaitlistPanel.tsx"
Cohesion: 0.50
Nodes (4): ObjectiveId, OBJECTIVES, PostType, LocalDraft

### Community 123 - "LandingPage.tsx"
Cohesion: 0.50
Nodes (3): Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade

### Community 125 - "credit-card-form.tsx"
Cohesion: 0.38
Nodes (6): CardState, CardValidity, clampDigits(), CreditCardForm(), formatNumberSpaces(), Props

### Community 127 - "TicketDetailPage.tsx"
Cohesion: 0.09
Nodes (20): FIELD_TYPE_LABELS, FIELD_TYPES, FormsPanel(), INITIAL_FORM, IntegrationsPanel(), STATUS_LABELS, STATUS_STYLES, SyncFormData (+12 more)

### Community 128 - "SubscriptionContext.tsx"
Cohesion: 0.25
Nodes (7): LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent, weatherTimeline

### Community 129 - "RetailCheckoutBlock.tsx"
Cohesion: 0.22
Nodes (8): StatCard(), StatCardProps, Default, NeutralDelta, Story, WithDeltaDown, WithDeltaUp, WithIcon

### Community 130 - "TasksPage.tsx"
Cohesion: 0.20
Nodes (10): Default, entry, Erro, json(), mswHandler(), periodData, SemMovimentos, settings (+2 more)

### Community 131 - "emailApi.ts"
Cohesion: 0.29
Nodes (9): Card, CardBody(), CardHeader(), CardProps, CardTitle(), Default, InGrid, Story (+1 more)

### Community 132 - "CatalogManager.tsx"
Cohesion: 0.09
Nodes (22): Button, ButtonProps, ButtonSize, ButtonVariant, sizes, Danger, Disabled, Ghost (+14 more)

### Community 133 - "OwnerNotificationsPanel.tsx"
Cohesion: 0.20
Nodes (8): 1. Checks de validação (pré-existentes × novos), 2. Registro das alterações locais (trabalho de marca), 3. Estrutura por diretório (baseline de arquivos/LOC), 4. Referência visual, Decomposição dos 17 erros de lint (todos pré-existentes), Etapa 0 — Baseline de qualidade e registro de alterações locais, Política de gate para a reestruturação, Dívidas técnicas da reestruturação

### Community 135 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.50
Nodes (3): config, customSnapshotsDir, NO_ANIMATION_CSS

### Community 136 - "TicketsPage.tsx"
Cohesion: 0.12
Nodes (16): ThemeToggle(), Logo(), LogoProps, sizeMap, PasswordInput, useSubscription(), useTheme(), AdminLayout() (+8 more)

### Community 138 - "AiPredictivePage.tsx"
Cohesion: 0.43
Nodes (6): JsonLd, SeoHead(), SeoHeadProps, upsertJsonLd(), upsertLink(), upsertMeta()

### Community 139 - "Inventário de marca — Agenda Já (frontend)"
Cohesion: 0.33
Nodes (5): 1. Alterada, 2. Exceção técnica (preservadas, deliberadas), 3. Histórico preservado, 4. Pendências / notas, Inventário de marca — Agenda Já (frontend)

### Community 140 - "StaffDashboard"
Cohesion: 0.29
Nodes (10): AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, formatDateISO(), getServiceDuration() (+2 more)

### Community 141 - "dateUtils.ts"
Cohesion: 0.12
Nodes (21): ProfileSettingsPanel(), CategoryFormData, CategorySchema, ClientEditFormData, ClientEditSchema, CrmBackfillSchema, OrganizationFormData, OrganizationSchema (+13 more)

### Community 142 - "GoalsPanel.tsx"
Cohesion: 0.24
Nodes (9): mockedBarbershopApi, mockedPostsApi, openEditor(), renderEditor(), TEMPLATES, Status, TemplateThumbnail(), TemplateThumbnailProps (+1 more)

### Community 143 - "ProductReportsPanel.tsx"
Cohesion: 0.21
Nodes (14): dateLabel(), EnhancedForecastPanel(), ShopWeatherDay, EnhancedForecast, enhancedForecastApi, EnhancedForecastReport, ForecastFactor, getForecastReport() (+6 more)

### Community 144 - "paymentsApi.ts"
Cohesion: 0.33
Nodes (5): FiscalPanel(), fiscalApi, FiscalConfig, FiscalStats, NfeRecord

### Community 145 - "Etapa 3 — Componentes: movimentos, unificação e novos padrões"
Cohesion: 0.22
Nodes (9): 1. Movimentos (infra/layout, conforme [03-matrix](03-migration-matrix.md) §3), 2. Skeletons unificados — `components/patterns/skeletons/`, 3. Modal shell único, 4. Novos padrões (+ stories + testes), 5. Alinhamento Button × accent (token), 6. Gate da Etapa 3, 7. Pendências conhecidas (não bloqueiam), 8. Próximo (+1 more)

### Community 146 - "ForgotPasswordPage.tsx"
Cohesion: 0.28
Nodes (6): Bottom, OnIcon, Story, Top, Tooltip(), TooltipProps

### Community 147 - "TokensGallery.stories.tsx"
Cohesion: 0.29
Nodes (4): colorGroups, Galeria, Story, TokenGroup

### Community 148 - "Etapa 0 — Inventário de componentes, consumidores e duplicações"
Cohesion: 0.17
Nodes (11): 1. UI genérico — `src/components/ui/` (37 arquivos de código), 2. Infra — `src/components/infra/` (11 arquivos), 3. Domain — `src/components/domain/` (108 componentes + 7 testes), 4. Marketing + PWA, 5.1 Botões, 5.2 Inputs/fields, 5.3 Cards / modais / tabs / tooltips, 5.4 Sistemas paralelos (estado vazio/loading/error) (+3 more)

### Community 149 - "Etapa 0 — Mapa: rotas, layouts, providers, estilos, code-splitting"
Cohesion: 0.18
Nodes (10): 1. Ferramenta: `scripts/check-orphan-exports.mjs`, 2. Limpeza executada (arquivos mortos sem relação com settlement), 3. Mortos adiados para settlement (25 — não tocar sem sanção), 4. Teste por rota/fluxo, 5. Barrels e pendências da Etapa 2, 6. Budget (D-002), 7. D-015 passo 1, 8. Gate (+2 more)

### Community 150 - "CopilotPanel.tsx"
Cohesion: 0.16
Nodes (16): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, getWeatherIcon(), RISK_STYLES, WeatherForecastWidget(), WeatherForecastWidgetProps, weatherDayLabel() (+8 more)

### Community 151 - "preview.tsx"
Cohesion: 0.24
Nodes (4): worker, handlers, preview, ThemeName

### Community 155 - "AiPredictivePage.tsx"
Cohesion: 0.22
Nodes (6): 1. Layouts, 2. Piloto `features/queue` (§5.1), 3. Gate da Etapa 4, 4. Pendências pós-Etapa 4, 5. Próximo, Etapa 4 — Pilotos: layouts + queue

### Community 156 - "TicketsPage.tsx"
Cohesion: 0.29
Nodes (6): resolve(), isAppTabSwitch(), jumpToTop(), ScrollToTop(), flushPendingResets(), refreshScrollTrigger()

### Community 157 - "FeaturesPage.tsx"
Cohesion: 0.18
Nodes (10): CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options, ShowcasePanel(), ShowcasePublicPage() (+2 more)

### Community 158 - "FinanceResumoSkeleton.tsx"
Cohesion: 0.27
Nodes (7): useScheduling(), PublicSaleProduct, PublicHome(), PublicTab, { mockJoinQueue, mockOperationMode, mockPublicProducts }, PRODUCT, visiblePublicTabs()

### Community 159 - "README.md"
Cohesion: 0.33
Nodes (5): QualityPanel(), qualityApi, QualityAudit, QualityOverview, QualityProtocol

### Community 160 - "BillingPage.tsx"
Cohesion: 0.17
Nodes (10): ModalShell(), ModalShellProps, ConfirmDialog(), ConfirmDialogProps, Danger, Default, Loading, Story (+2 more)

### Community 161 - "QueueCapacityBanner.stories.tsx"
Cohesion: 0.13
Nodes (14): ClosedSalonJoinModal(), ClosedSalonJoinModalProps, Default, schedule, Story, Submitting, QueueCapacityBanner(), alertData (+6 more)

### Community 162 - "Mapa de domínio — Frontend ↔ API"
Cohesion: 0.22
Nodes (8): Correções feitas no caminho, Etapa 7 — §5.6 Master admin, Extração do BillingTab → `features/billing`, Gate, Mantidos (com justificativa), MasterAdminDashboard — não extraído (decisão), Movimentos, Próximo

### Community 163 - "ShopProfile.tsx"
Cohesion: 0.31
Nodes (5): CorporatePanel(), corporateApi, CorporatePlan, CorporateSubscription, CorporateValidation

### Community 164 - "PrivateRoute.tsx"
Cohesion: 0.07
Nodes (35): brl, clientPhoneLabel(), ClientProfileSheet(), PAYMENT_LABEL, ProfileTab, shortDate(), QueueItemCard(), baseItem (+27 more)

### Community 165 - "ForgotPasswordPage.tsx"
Cohesion: 0.15
Nodes (10): brl, EmptyRow(), REFUND_STATUS_CONFIG, ListMeta, PaymentProvider, paymentsApi, PaymentStatus, PixQrCode (+2 more)

### Community 166 - "FeaturesPage.tsx"
Cohesion: 0.36
Nodes (4): CopilotPanel(), priorityLabel(), copilotApi, CopilotSuggestion

### Community 167 - "Inventário de pacotes — Frontend (agendai)"
Cohesion: 0.50
Nodes (3): dependencies, devDependencies, Inventário de pacotes — Frontend (agendai)

### Community 168 - "googleCredential.ts"
Cohesion: 0.21
Nodes (7): DEPOSIT_REQUIRED_OPTIONS, DepositPolicyPanel(), NO_SHOW_RULE_OPTIONS, REFUND_RULE_OPTIONS, AppointmentDeposit, DepositPolicy, depositsApi

### Community 169 - "SubscriptionContext.tsx"
Cohesion: 0.10
Nodes (18): Payment, pickPlanForCheckout(), PlanBillingCycle, plansApi, AsaasCreditCardPayload, CancelResponse, Invoice, PayerIdentification (+10 more)

### Community 170 - "CatalogManager.tsx"
Cohesion: 0.14
Nodes (13): CatalogPurpose, ProductCatalogPanel(), Props, PURPOSE_META, ReservationsBlockProps, ReservedBadge(), SEGMENTS, mocks (+5 more)

### Community 172 - "5. `features/<área>/components/` — domain (Etapas 5–7)"
Cohesion: 0.33
Nodes (6): 1. Migração de componentes, 2. Adoção de padrões, 3. Stories (piloto finance), 4. Gate da Etapa 5b, 5. Pendências / próximo, Etapa 5b — Operação: finance + painéis §5.1

### Community 174 - "Posts e perfil social — entrega e validação"
Cohesion: 0.33
Nodes (5): Implantação pendente, O que mudou, Posts e perfil social — entrega e validação, Repetir a QA local, Verificação feita em 02/10/2026

### Community 181 - "buildQuery"
Cohesion: 0.33
Nodes (6): 1. Migração de componentes, 2. Adoções (ações sancionadas pela matriz §5.5), 3. Gate da Etapa 6d, 4. Pendências / próximo, Etapa 6d — Crescimento / notificações / assinatura (§5.5), Mantidos com justificativa (fora do mandato)

### Community 183 - "post-social.spec.ts"
Cohesion: 0.50
Nodes (3): now, photo, posts

### Community 186 - "Settlement §6 — painéis `0c` e UI órfã"
Cohesion: 0.40
Nodes (5): 1. Painéis de domínio (16) — todos **0c confirmados** hoje, 2. UI genórica `0c`/parcial (matriz §1), 3. Evidências, 4. Pendência de decisão (usuário), Settlement §6 — painéis `0c` e UI órfã

### Community 187 - "BillingTab"
Cohesion: 0.16
Nodes (13): errorMessage(), formatDate(), BillingSection, BillingTab(), SECTION_OPTIONS, PlanFormModal(), PlansSection(), RefundsSection() (+5 more)

## Knowledge Gaps
- **988 isolated node(s):** `config`, `ThemeName`, `preview`, `customSnapshotsDir`, `NO_ANIMATION_CSS` (+983 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `FeaturesPage.tsx` to `LoginPage.tsx`, `schedulingUtils.ts`, `devDependencies`, `CheckoutPage.tsx`, `BillingTab.tsx`, `CatalogManager.tsx`, `adminApi.ts`, `MarketingNav.tsx`, `paymentsApi.ts`, `ProductReportsPanel.tsx`, `paymentsApi.ts`, `apiClient.ts`, `dateUtils.ts`, `MarketingFooter.tsx`, `SubscriptionContext.tsx`, `CopilotPanel.tsx`, `AiPredictivePage.tsx`, `Run and deploy your AI Studio app`, `FeaturesPage.tsx`, `README.md`, `ShopProfile.tsx`, `PrivateRoute.tsx`, `FeaturesPage.tsx`, `googleCredential.ts`, `eslint-config-prettier`, `eslint-plugin-jsx-a11y`, `CatalogManager.tsx`, `SubscriptionContext.tsx`, `@tailwindcss/postcss`, `@testing-library/react`, `@types/react`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `BillingTab`, `vite`, `vitest`, `OwnerSubscriptionPanel.tsx`, `postcss`, `PostsManager.tsx`, `@testing-library/user-event`, `scripts`, `CheckoutPage.tsx`, `index.tsx`, `ShopProfile.tsx`, `MarketingNav.tsx`, `PaginationBar.tsx`, `CheckoutPage.tsx`, `AccessBlockedPage.tsx`, `enhancedForecastApi.ts`, `reputationApi.ts`, `CopilotPanel.tsx`, `SeoHead.tsx`, `ForgotPasswordPage.tsx`, `productsApi.ts`, `CrmMergePanel.tsx`, `TicketDetailPage.tsx`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `Skeleton()` connect `CookieConsent.tsx` to `StaffDashboard.tsx`, `eslint-plugin-jsx-a11y`, `FinanceResumoSkeleton.tsx`, `scripts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `apiClient()` connect `OwnerReferralsPanel.tsx` to `LoginPage.tsx`, `schedulingUtils.ts`, `devDependencies`, `MarketingNav.tsx`, `paymentsApi.ts`, `MarketingFooter.tsx`, `ProductReportsPanel.tsx`, `subscriptionsApi.ts`, `paymentsApi.ts`, `apiClient.ts`, `ContactPage.tsx`, `SubscriptionContext.tsx`, `DashboardPage.tsx`, `AboutPage.tsx`, `Run and deploy your AI Studio app`, `README.md`, `ShopProfile.tsx`, `PrivateRoute.tsx`, `ForgotPasswordPage.tsx`, `FeaturesPage.tsx`, `AppointmentBookingModal.tsx`, `googleCredential.ts`, `eslint-config-prettier`, `SubscriptionContext.tsx`, `typescript-eslint`, `OwnerSubscriptionPanel.tsx`, `postcss`, `PostsManager.tsx`, `@testing-library/user-event`, `PwaInstallContext.tsx`, `scripts`, `CheckoutPage.tsx`, `MarketingNav.tsx`, `CheckoutPage.tsx`, `GoalsPanel.tsx`, `goalsApi.ts`, `enhancedForecastApi.ts`, `SubscriptionContext.tsx`, `reputationApi.ts`, `TicketDetailPage.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `config`, `ThemeName`, `preview` to the rest of the system?**
  _988 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10963455149501661 - nodes in this community are weakly interconnected._
- **Should `CheckoutPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10695187165775401 - nodes in this community are weakly interconnected._
- **Should `BillingTab.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12413793103448276 - nodes in this community are weakly interconnected._