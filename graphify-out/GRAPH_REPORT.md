# Graph Report - agendai  (2026-09-08)

## Corpus Check
- 225 files · ~162,224 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1299 nodes · 3003 edges · 91 communities (80 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `62d6d39f`
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

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 92 edges
2. `useAuth()` - 39 edges
3. `Service` - 34 edges
4. `maskPhone()` - 30 edges
5. `StaffMember` - 29 edges
6. `apiClient()` - 26 edges
7. `normalizePhoneBR()` - 23 edges
8. `authStorage` - 20 edges
9. `ShopSettings` - 19 edges
10. `useBarbershop()` - 18 edges

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

## Communities (91 total, 11 thin omitted)

### Community 0 - "StaffDashboard.tsx"
Cohesion: 0.16
Nodes (13): PublicLinkPanel(), PublicLinkPanelProps, qrUrl(), StaffNavigation(), StaffNavigationProps, visibleTabs(), canAccessTab(), MOBILE_PRIMARY_TAB_IDS (+5 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.16
Nodes (14): PackageCatalog(), ServiceCard(), ServiceCardProps, ServiceForm(), ServiceFormProps, ServiceManager(), ServiceManagerProps, DynamicIcon() (+6 more)

### Community 2 - "OwnerFinancialPanel.tsx"
Cohesion: 0.15
Nodes (11): ShopWeatherDay, CreateExpenseBody, CreateFiadoBody, ExpenseCategory, ExpenseItem, ExpenseSummary, FiadoItem, FiadoPayment (+3 more)

### Community 3 - "schedulingUtils.ts"
Cohesion: 0.11
Nodes (18): fieldClass(), brl, PackageCatalogProps, clientsApi, ListMeta, packagesApi, AppointmentSchema, PackageCatalogFormData (+10 more)

### Community 4 - "devDependencies"
Cohesion: 0.14
Nodes (18): ClientCard(), ClientTableRow(), CrmIntelligencePanel(), Kpi(), money(), Props, segmentOptions, shortDate() (+10 more)

### Community 5 - "CheckoutPage.tsx"
Cohesion: 0.14
Nodes (17): CatalogTemplateModal(), Props, Props, SEGMENTS, ProductFormModal(), Props, CatalogTemplatePreview, CatalogTemplatePreviewItem (+9 more)

### Community 6 - "BillingTab.tsx"
Cohesion: 0.07
Nodes (29): PaymentListItem, BillingSection, BlockedSection(), brl, CANCEL_REASON_LABELS, EMPTY_META, errorMessage(), EXPENSE_TYPE_LABELS (+21 more)

### Community 7 - "dependencies"
Cohesion: 0.05
Nodes (65): AddCustomerForm(), AddCustomerFormProps, clientPhoneLabel(), ClientsManager(), ClientsManagerProps, QueueAlertSettings(), SettingsManager(), ConsentCheckbox() (+57 more)

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
Cohesion: 0.08
Nodes (24): AboutPage, AccessBlockedPage, AiPredictivePage, CheckoutPage, CommercialIntentPage, ContactPage, DashboardPage, EmailVerifiedPage (+16 more)

### Community 12 - "OwnerReferralsPanel.tsx"
Cohesion: 0.17
Nodes (16): ACCESS_BLOCKED_CODES, AccessBlockedCode, apiClient(), ApiError, ApiRequestOptions, buildApiError(), calls, checkRateLimit() (+8 more)

### Community 13 - "MarketingNav.tsx"
Cohesion: 0.18
Nodes (13): PricingPersuasionCharts(), PricingPersuasionChartsProps, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload() (+5 more)

### Community 14 - "paymentsApi.ts"
Cohesion: 0.07
Nodes (28): actionClassName, SystemStateAction, SystemStatePageProps, Logo(), LogoProps, sizeMap, PasswordInput, PasswordInputProps (+20 more)

### Community 15 - "MarketingFooter.tsx"
Cohesion: 0.14
Nodes (16): AppointmentPolicySection(), BusinessSegmentSection(), DEFAULT_APPOINTMENT_POLICY, MODE_OPTIONS, OperationModeSectionProps, platformWhatsAppUnavailable(), SalonWhatsAppConnection(), SEGMENT_OPTIONS (+8 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.07
Nodes (38): deliveryDestination(), EMPTY_FILTERS, EMPTY_META, ERROR_LABELS, Filters, formatDateTime(), friendlyError(), NotificationDeliveriesPanel() (+30 more)

### Community 17 - "subscriptionsApi.ts"
Cohesion: 0.18
Nodes (13): ActivationChecklist(), Props, ClosedSalonJoinModal(), ClosedSalonJoinModalProps, QueueCapacityBanner(), ALL_TAB_IDS, canAccessTabByMode(), getDefaultTab() (+5 more)

### Community 18 - "ContactPage.tsx"
Cohesion: 0.21
Nodes (9): contactApi, ContactPayload, ContactResult, ContactTopic, ContactFormData, ContactPage(), ContactSchema, fieldClass() (+1 more)

### Community 19 - "server.js"
Cohesion: 0.22
Nodes (9): buildUserPayload(), createTokens(), __dirname, __filename, middlewares, router, sanitizeBody(), sanitizeValue() (+1 more)

### Community 21 - "SubscriptionContext.tsx"
Cohesion: 0.18
Nodes (15): PrivateRoute(), PrivateRouteProps, pageLinks, sectionLinks, AuthContext, AuthContextValue, AuthResult, useAuth() (+7 more)

### Community 22 - "Diretrizes universais para IAs"
Cohesion: 0.33
Nodes (5): Arquitetura, Checklist de PR (orientação), Convenções de commits, Diretrizes para IAs — Frontend, Qualidade

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.14
Nodes (13): AddPostPayload, AddServicePayload, CreatePostPayload, GeneratePostPayload, PostConfigPayload, ShopWeatherForecast, StaffPayload, UpdateBarbershopPayload (+5 more)

### Community 25 - "FeaturesPage.tsx"
Cohesion: 0.18
Nodes (15): QueueStatusCardProps, ReturnToQueueModal(), ReturnToQueueModalProps, sameSnapshot(), SchedulingContext, SchedulingContextValue, SchedulingProvider(), realtimeWsUrl() (+7 more)

### Community 26 - "CookieConsent.tsx"
Cohesion: 0.22
Nodes (8): AccountPrivacyPanel(), AccountPrivacyPanelProps, ROLE_LABEL, token(), AuthProvider(), authStorage, token(), usersApi

### Community 27 - "AboutPage.tsx"
Cohesion: 0.06
Nodes (47): OwnerReferralsPanel(), STATUS_LABEL, STATUS_STYLES, brl(), CANCEL_REASONS, OwnerSubscriptionPanel(), RETENTION_BENEFITS, STATUS_LABEL (+39 more)

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
Cohesion: 0.18
Nodes (6): ErrorBoundary, Props, State, SystemStatePage(), getLastCorrelationId(), logger

### Community 41 - "eslint-config-prettier"
Cohesion: 0.16
Nodes (18): destinations, OnboardingMissions(), Props, Step, titles, ProductCatalogPanel(), initialPeriod(), ProductReportsPanel() (+10 more)

### Community 42 - "eslint-plugin-jsx-a11y"
Cohesion: 0.15
Nodes (17): brl, clientPhoneLabel(), ClientProfileSheet(), PAYMENT_LABEL, ProfileTab, shortDate(), ClientEditFormData, ClientEditSchema (+9 more)

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
Cohesion: 0.60
Nodes (4): busyCopy(), BusyLevel, busyStyles(), QueueStatusCard()

### Community 49 - "@tailwindcss/postcss"
Cohesion: 0.15
Nodes (13): ProfileSettingsPanel(), TeamManager(), TeamManagerProps, Field(), FieldProps, ALL_PERMISSIONS, EmployeePermission, PERMISSION_LABELS (+5 more)

### Community 50 - "@testing-library/jest-dom"
Cohesion: 0.29
Nodes (10): COMMERCIAL_PAGES, CommercialFaq, commercialPageByPath(), CommercialPageContent, canonicalUrl(), getPublicSiteUrl(), breadcrumbLd(), faqPageLd() (+2 more)

### Community 51 - "@testing-library/react"
Cohesion: 0.23
Nodes (11): PAYMENT_LABEL, productMoney, SALE_STATUS_LABEL, Props, Props, RefundLineState, RefundSaleModal(), RetailSale (+3 more)

### Community 53 - "@types/react"
Cohesion: 0.28
Nodes (6): CommonProps, normalize(), SelectOption, SmartSelect(), SmartSelectProps, options

### Community 54 - "PrivateRoute.tsx"
Cohesion: 0.15
Nodes (7): Claude, Domínios, Mapa de domínio — Frontend ↔ API, Variáveis de ambiente (frontend) — nomes e finalidade, Inventário de scripts — Frontend (`agendai`), Observações, Gemini

### Community 55 - "typescript"
Cohesion: 0.18
Nodes (10): MOVEMENT_LABEL, Props, ConfirmDialog(), ConfirmDialogProps, InventoryReceipt, Supplier, StockAdjustmentFormData, StockAdjustmentSchema (+2 more)

### Community 56 - "typescript-eslint"
Cohesion: 0.21
Nodes (11): DemandAlertBanner(), DemandAlertBannerProps, RISK_STYLES, getWeatherIcon(), RISK_STYLES, WeatherForecastWidget(), WeatherForecastWidgetProps, financialApi (+3 more)

### Community 57 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.16
Nodes (29): AppointmentBookingModal(), AgendaView, AppointmentCalendar(), getDaysInMonth(), getFirstDayOfMonth(), MONTH_NAMES, WEEKDAYS, AppointmentScheduler() (+21 more)

### Community 58 - "@typescript-eslint/parser"
Cohesion: 0.13
Nodes (17): EMPTY_META, errorMessage(), OwnerFinancialPanel(), Tab, TABS, todayIso(), ExpenseFormData, ExpenseSchema (+9 more)

### Community 59 - "vite"
Cohesion: 0.21
Nodes (9): QueueItemCard(), item, service, METHODS, Props, RetailCartItem, RetailCheckoutBlock(), RetailPaymentMethod (+1 more)

### Community 60 - "@vitejs/plugin-react"
Cohesion: 0.24
Nodes (9): ProfileAvatarSection(), ProfileAvatarSectionProps, Avatar(), AvatarProps, AvatarSize, COLORS, getColorClass(), getInitials() (+1 more)

### Community 61 - "vitest"
Cohesion: 0.22
Nodes (9): MarketingNav(), scrollToSection(), LandingPage(), marqueeItems, planFeatures, processSteps, queueCustomers, stepAccent (+1 more)

### Community 62 - "@vitest/coverage-v8"
Cohesion: 0.28
Nodes (5): DataTableStateProps, EmptyState(), EmptyStateProps, SectionError(), SectionErrorProps

### Community 64 - "autoprefixer"
Cohesion: 0.20
Nodes (6): companyLinks, exploreLinks, MarketingFooter(), platformLinks, socialLinks, sections

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
Cohesion: 0.18
Nodes (6): trialCampaign, FeaturesPage(), daySlots, flowSteps, pros, SchedulingPage()

### Community 72 - "vite-plugin-pwa"
Cohesion: 0.33
Nodes (5): Componentes UI compartilhados (reusar antes de criar), Contexts, Estrutura — Frontend (`agendai`), Fora do escopo deste frontend, Wrappers HTTP (`src/infra/`)

### Community 73 - "PostsManager.tsx"
Cohesion: 0.12
Nodes (15): downloadPostImage(), MODE_LABEL, MODE_OPTIONS, PostsManager(), PostTone, PostType, QUICK_PRESETS, TEMPLATE_COLORS (+7 more)

### Community 74 - "@testing-library/user-event"
Cohesion: 0.21
Nodes (8): JoinQueuePayload, ListAppointmentsParams, schedulingApi, Appointment, isoDate(), PublicAppointmentManagePage(), buildQuery(), QueryValue

### Community 75 - "PwaInstallContext.tsx"
Cohesion: 0.13
Nodes (14): installSteps, PwaInstallCard(), PwaInstallCardProps, BeforeInstallPromptEvent, isStandaloneDisplay(), PwaInstallContext, PwaInstallContextValue, PwaInstallProvider() (+6 more)

### Community 76 - "scripts"
Cohesion: 0.33
Nodes (5): comparison, DashboardPage(), hourHeat, staffRows, weekBars

### Community 77 - "CheckoutPage.tsx"
Cohesion: 0.20
Nodes (21): AppointmentBookingModalProps, AppointmentCalendarProps, AppointmentSchedulerProps, BookPackageSessionsModalProps, ClientProfileSheetProps, ClientsSection, ClientsTab(), ClientsTabProps (+13 more)

### Community 79 - "index.tsx"
Cohesion: 0.16
Nodes (18): App(), BarbershopContext, BarbershopProvider(), isShopStaffRole(), BarbershopFiltersContext, BarbershopFiltersProvider(), BarbershopFiltersValue, DateRange (+10 more)

### Community 80 - "ShopProfile.tsx"
Cohesion: 0.20
Nodes (17): OperationModeSection(), ShopFloorControls(), ShopFloorControlsProps, statusCopy(), brl, digitsOnly(), formatBrPhone(), shopInitials() (+9 more)

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
Cohesion: 0.40
Nodes (4): AboutPage(), beats, beliefs, friendships

### Community 86 - "Inventário de pacotes — Frontend (agendai)"
Cohesion: 0.50
Nodes (3): dependencies, devDependencies, Inventário de pacotes — Frontend (agendai)

## Knowledge Gaps
- **405 isolated node(s):** `root`, `findings`, `root`, `errors`, `entryFiles` (+400 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getErrorMessage()` connect `eslint-config-prettier` to `LoginPage.tsx`, `schedulingUtils.ts`, `devDependencies`, `CheckoutPage.tsx`, `BillingTab.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `adminApi.ts`, `MarketingFooter.tsx`, `apiClient.ts`, `subscriptionsApi.ts`, `ContactPage.tsx`, `SubscriptionContext.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `eslint-plugin-jsx-a11y`, `@tailwindcss/postcss`, `@testing-library/react`, `typescript`, `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `vite`, `@vitejs/plugin-react`, `PostsManager.tsx`, `@testing-library/user-event`, `ShopProfile.tsx`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `SubscriptionContext.tsx` to `CheckoutPage.tsx`, `dependencies`, `MasterAdminDashboard.tsx`, `eslint-config-prettier`, `paymentsApi.ts`, `index.tsx`, `ShopProfile.tsx`, `@tailwindcss/postcss`, `subscriptionsApi.ts`, `@testing-library/react`, `FeaturesPage.tsx`, `CookieConsent.tsx`, `AboutPage.tsx`, `vitest`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `authStorage` connect `CookieConsent.tsx` to `OwnerFinancialPanel.tsx`, `schedulingUtils.ts`, `devDependencies`, `AppointmentBookingModal.tsx`, `CheckoutPage.tsx`, `dependencies`, `adminApi.ts`, `@testing-library/user-event`, `OwnerReferralsPanel.tsx`, `jsdom`, `apiClient.ts`, `SubscriptionContext.tsx`, `DashboardPage.tsx`, `FeaturesPage.tsx`, `AboutPage.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `root`, `findings`, `root` to the rest of the system?**
  _405 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schedulingUtils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._
- **Should `CheckoutPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14333333333333334 - nodes in this community are weakly interconnected._