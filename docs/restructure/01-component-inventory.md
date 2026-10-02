# Etapa 0 — Inventário de componentes, consumidores e duplicações

Data: 2026-09-28 · Fonte: varredura completa de `src/` (contagens por grep full-text + scan de imports dinâmicos).

Legenda: ⚠️ = import de negócio (`contexts/`, `infra/`, `hooks/`, `config/`, `features/`) dentro de componente supostamente genérico. **0c** = zero consumidores em `src/`.

## 1. UI genérico — `src/components/ui/` (37 arquivos de código)

| arquivo | exports | ~LOC | propósito | flags |
|---|---|---|---|---|
| Avatar.tsx | Avatar | 59 | avatar iniciais/foto | — |
| Button.tsx | Button, ButtonProps | 47 | único botão genérico (variant primary\|secondary\|ghost\|danger; size sm\|md\|icon; loading) | — |
| Field.tsx | Field + FIELD_CONTROL(_ERROR), FORM_SECTION_* | 25 | wrapper de label + classes compartilhadas de input | — |
| ConfirmDialog.tsx | ConfirmDialog | 93 | modal de confirmação (portal + FocusLock; variant danger\|default) | — |
| PromptModal.tsx | PromptModal | 112 | modal de prompt textarea (mesmo shell do ConfirmDialog) | — |
| SmartSelect.tsx | SmartSelect, Select, MultiSelect, SelectOption | 295 | combobox Floating-UI (busca, single/multi, sm\|md\|lg) | — |
| PasswordInput.tsx | PasswordInput | 153 | campo de senha + medidor de força | — |
| CurrencyInput.tsx | CurrencyInput | 86 | input BRL em centavos | — |
| ConsentCheckbox.tsx | ConsentCheckbox | 92 | checkbox estilizado (default\|compact) | — |
| StatusBadge.tsx | StatusBadge | 32 | pill de status (tone ×5) | — |
| EmptyState.tsx | EmptyState | 18 | caixa vazia tracejada | — |
| SectionError.tsx | SectionError | 30 | erro inline + retry | — |
| DataTableState.tsx | DataTableState | 45 | loading/error/empty para tabelas | **0c** |
| PaginationBar.tsx | PaginationBar | 37 | pager prev/next | **0c** |
| Loader.tsx | Loader | 10 | spinner fullscreen | — |
| Skeleton.tsx (+Skeleton.css) | Skeleton, SkeletonRegion | 60/20 | base skeleton (rect\|circle\|rounded) | — |
| TableSkeleton.tsx | TableSkeleton | 65 | skeleton de tabela | — |
| CardSkeleton.tsx | CardSkeleton | 74 | skeleton de card (default\|stat\|avatar\|compact) | — |
| ListSkeleton.tsx | ListSkeleton | 45 | skeleton de lista | — |
| FormSkeleton.tsx | FormSkeleton | 42 | skeleton de form | — |
| skeletons.ts | re-export barrel ×11 | 10 | barrel de skeletons | — |
| Logo.tsx | Logo | 57 | logo da marca (sm\|md\|lg, dark/light) | — |
| Header.tsx | Header | 89 | header sticky, chip de trial, chip de usuário | ⚠️ SubscriptionContext |
| StaffNavigation.tsx | StaffNavigation | 312 | nav lateral/"Mais", gating por role/modo | ⚠️ config/tabRegistry |
| ThemeToggle.tsx | ThemeToggle | 17 | toggle dark/light | ⚠️ ThemeContext |
| Toast.tsx | Toast | 43 | toast superior (success\|error\|bot; manual, sem provider) | — |
| DynamicIcon.tsx | DynamicIcon, ICON_OPTIONS | 136 | nome → ícone lucide | — |
| ThemedCalendar.tsx (+css) | ThemedCalendar, toLocalISO | 55/81 | wrapper react-day-picker | — |
| chart.tsx | ChartContainer/Tooltip/…, ChartConfig | 219 | wrapper Recharts (shadcn) | cn |
| floating-paths.tsx | FloatingPathsBackground | 64 | SVG decorativo | cn, framer-motion |
| credit-card-form.tsx | CreditCardForm, CardState/Validity | 439 | entrada + validação de cartão | **0c** |

Fora de `ui/` mas genéricos: `features/finance/components/FinanceSummaryCard.tsx` (34, card KPI, limpo) · `features/finance/components/FiadoStatusBadge.tsx` (27, pill de dívida, wrappa StatusBadge, ⚠️ tipo financialApi).

## 2. Infra — `src/components/infra/` (11 arquivos)

| arquivo | exports | ~LOC | propósito | flags |
|---|---|---|---|---|
| AccessBlockedListener.tsx | AccessBlockedListener, BLOCK_INFO_STORAGE_KEY | 31 | evento 402/403 → redirect `/bloqueado` | ⚠️ apiClient |
| AnalyticsListener.tsx | AnalyticsListener | 21 | page-view (consent-aware) | ⚠️ analytics, cookieConsentStorage |
| CookieConsent.tsx | CookieConsent | 77 | sheet inferior de consentimento | ⚠️ cookieConsentStorage |
| ErrorBoundary.tsx | ErrorBoundary (class) | 113 | erro → SystemStatePage (page\|section) | logger, SystemStatePage |
| PrivateRoute.tsx | PrivateRoute | 25 | rota com gate de role (`roles[]`) | ⚠️ AuthContext |
| ReferralRefCapture.tsx | ReferralRefCapture | 12 | captura `?ref=` → sessionStorage | referralStorage |
| ScrollToTop.tsx | ScrollToTop | 78 | reset de scroll com exceções `/app`+hash | gsap |
| SystemStatePage.tsx | SystemStatePage, SystemStateAction | 112 | página full 404/500/402; mapa de botões próprio | ui/Logo |

## 3. Domain — `src/components/domain/` (108 componentes + 7 testes)

| arquivo | export | ~LOC | consumidores | deps de negócio |
|---|---|---|---|---|
| AccountPrivacyPanel | AccountPrivacyPanel | 246 | 2: SettingsManager, StaffDashboard | Auth, authStorage, apiClient, authApi, usersApi |
| ActivationChecklist | ActivationChecklist | 36 | 1: StaffDashboard | barbershopApi |
| AddCustomerForm | AddCustomerForm | 245 | 2: PublicHome, StaffDashboard | — (renderiza ServiceCard) |
| AppointmentBookingModal | AppointmentBookingModal | 431 | 2: AppointmentCalendar, ClientProfileSheet | clientsApi, packagesApi |
| AppointmentCalendar | AppointmentCalendar | 544 | 1: StaffDashboard | role-check |
| AppointmentScheduler | AppointmentScheduler | 406 | 1: PublicHome | — |
| BookPackageSessionsModal | BookPackageSessionsModal | 229 | 1: ClientProfileSheet | schedulingApi, packagesApi |
| CashPanel | CashPanel | 355 | 1: StaffDashboard | cashApi, Auth, BarbershopFilters |
| CatalogManager | CatalogManager | 502 | 1: StaffDashboard | catalogApi, ctx |
| CategoryManager | CategoryManager | 89 | 3: OwnerFinancialPanel, ServiceManager (+test) | categoriesApi, useCategories |
| ClientPortalDashboard | ClientPortalDashboard | 272 | 1: ClientPortalPage | clientPortalApi |
| ClientPortalLogin | ClientPortalLogin | 147 | 1: ClientPortalPage | clientPortalApi |
| ClientProfileSheet | ClientProfileSheet | 1022 | 1: ClientsTab | clientsApi, crmApi, packagesApi |
| ClientsManager | ClientsManager | 224 | 1: ClientsTab | clientsApi |
| ClientsTab | ClientsTab | 257 | 1: StaffDashboard | Auth, crmApi |
| ClosedSalonJoinModal | ClosedSalonJoinModal | 100 | 1: StaffDashboard | — |
| **CopilotPanel** | CopilotPanel | 168 | **0c** | copilotApi, ctx |
| **CorporatePanel** | CorporatePanel | 323 | **0c** | corporateApi, ctx |
| CrmBackfillPanel | CrmBackfillPanel | 73 | 4: CrmMaintenancePage, ClientsTab, MasterAdminDashboard (+test) | Auth, crmApi |
| CrmIntelligencePanel | CrmIntelligencePanel | 864 | 1: ClientsTab | crmApi, ui/chart |
| CrmMergePanel | CrmMergePanel | 79 | 2: ClientsTab (+test) | clientsApi, crmApi |
| DemandAlertBanner | DemandAlertBanner | 69 | 1: StaffDashboard | financialApi |
| **DepositIndicators** | DepositIndicators | 112 | **0c** | depositsApi |
| DepositPolicyPanel | DepositPolicyPanel | 249 | 1: StaffDashboard | depositsApi, ctx |
| EmailHistoryPanel | EmailHistoryPanel | 168 | 1: SettingsManager | emailApi |
| EmailPreferencesPanel | EmailPreferencesPanel | 205 | 1: SettingsManager | emailApi, ui/Toast |
| **EnhancedForecastPanel** | EnhancedForecastPanel | 120 | **0c** | enhancedForecastApi, barbershopApi |
| EquipmentPanel | EquipmentPanel | 791 | 1: StaffDashboard | equipmentApi, ctx |
| FinancialDashboard | FinancialDashboard | 765 | 1: StaffDashboard | financialApi, commissionsApi, apiClient |
| **FiscalPanel** | FiscalPanel | 363 | **0c** | fiscalApi, ctx |
| **FormsPanel** | FormsPanel | 492 | **0c** | formsApi, ctx |
| GoalsPanel | GoalsPanel | 312 | 1: StaffDashboard | goalsApi, ctx |
| **IntegrationsPanel** | IntegrationsPanel | 641 | **0c** | integrationsApi, ctx |
| LoyaltyPanel | LoyaltyPanel | 274 | 1: StaffDashboard | loyaltyApi, ctx |
| MultiUnitDashboard | MultiUnitDashboard | 236 | 2: OrganizationsPanel (+test) | useOrganizationDashboard, organizationsApi |
| NotificationDeliveriesPanel | NotificationDeliveriesPanel | 463 | 2: BillingTab, OwnerNotificationsPanel | notificationsApi |
| NotificationHealthPanel | NotificationHealthPanel | 152 | 1: BillingTab | notificationsApi |
| OnboardingChecklist | OnboardingChecklist | 323 | 1: StaffDashboard | barbershopApi |
| **OnboardingMissions** | OnboardingMissions | 55 | **0c** | barbershopApi |
| OrganizationsPanel | OrganizationsPanel | 273 | 2: StaffDashboard (+test) | organizationsApi |
| OwnerFinancialPanel | OwnerFinancialPanel | 1582 | 1: StaffDashboard | usePermissions, cashApi, financialApi, ctx |
| OwnerNotificationsPanel | OwnerNotificationsPanel | 234 | 1: SettingsManager | notificationsApi |
| OwnerReferralsPanel | OwnerReferralsPanel | 238 | 1: StaffDashboard | referralsApi |
| OwnerSubscriptionPanel | OwnerSubscriptionPanel | 724 | 1: StaffDashboard | SubscriptionContext, plansApi, subscriptionsApi |
| PackageCatalog | PackageCatalog | 245 | 1: ServiceManager | packagesApi |
| PostEditor | PostEditor | 865 | 1: PostsManager | postsApi, barbershopApi |
| PostPreviewBox | PostPreviewBox | 66 | 2: PostEditor, PostsManager | — |
| PostsManager | PostsManager | 540 | 1: StaffDashboard | postsApi, barbershopApi, Auth, ctx |
| ProductsHub | ProductsHub | 99 | 1: StaffDashboard | productsApi, usePermissions |
| ProfileAvatarSection | ProfileAvatarSection | 124 | 1: StaffDashboard | usersApi |
| ProfileSettingsPanel | ProfileSettingsPanel | 100 | 1: StaffDashboard | AuthContext |
| ProfitEnginePanel | ProfitEnginePanel | 350 | 1: StaffDashboard | profitApi, apiClient |
| PublicLinkPanel | PublicLinkPanel | 50 | 1: StaffDashboard | — |
| **PurchasingPanel** | PurchasingPanel | 268 | **0c** | purchasingApi, ctx |
| **QualityPanel** | QualityPanel | 314 | **0c** | qualityApi, ctx |
| QueueAlertSettings | QueueAlertSettings | 13 | 1: SettingsManager | barbershopApi (form inline-styled) |
| QueueCapacityBanner | QueueCapacityBanner | 9 | 1: StaffDashboard | barbershopApi |
| QueueItemCard | QueueItemCard | 491 | 3: StaffDashboard, PublicHome (+test) | notificationsApi, clientsApi, productsApi |
| QueueStatusCard | QueueStatusCard | 146 | 2: StaffDashboard, PublicHome | — |
| RecommendationsPanel | RecommendationsPanel | 214 | 1: StaffDashboard | recommendationsApi, ctx |
| RecurringPackagesPanel | RecurringPackagesPanel | 454 | 1: StaffDashboard | recurringPackagesApi, ctx |
| ReferralTierBadge | ReferralTierBadge | 76 | 1: OwnerReferralsPanel | referralsApi (tipo) |
| **ReputationPanel** | ReputationPanel | 193 | **0c** | reputationApi, ctx |
| RetailCheckoutBlock | RetailCheckoutBlock | 163 | 2: QueueItemCard, ProductSalesPanel | productsApi, clientsApi |
| ReturnToQueueModal | ReturnToQueueModal | 155 | 1: StaffDashboard | — |
| **ServiceBookingSelector** | ServiceBookingSelector | 185 | **0c** | — |
| ServiceCard | ServiceCard | 64 | 1: AddCustomerForm | — |
| ServiceForm | ServiceForm | 137 | 1: ServiceManager | categoriesApi |
| ServiceManager | ServiceManager | 127 | 1: StaffDashboard | useCategories, Barbershop (usa ui/Button) |
| SettingsManager | SettingsManager | 937 | 1: StaffDashboard | barbershopApi, apiClient, ctx |
| ShareReferralButton | ShareReferralButton | 63 | 1: OwnerReferralsPanel | — |
| ShopFloorControls | ShopFloorControls | 203 | 2: StaffDashboard, SettingsManager | ctx |
| ShopProfile | ShopProfile | 498 | 2: StaffDashboard, PublicHome | barbershopApi, ctx |
| ShowcasePanel | ShowcasePanel | 307 | 1: StaffDashboard | showcaseApi, ctx |
| ShowcasePublicPage | ShowcasePublicPage | 212 | 1: ShowcasePage | showcaseApi |
| **SmartPricingPanel** | SmartPricingPanel | 530 | **0c** | pricingApi, ctx |
| **StaffManagementPanel** | StaffManagementPanel | 568 | **0c** | staffApi, ctx |
| SupportPanel | SupportPanel | 87 | 3: SettingsManager, StaffDashboard (+test) | supportApi |
| TeamManager | TeamManager | 403 | 1: StaffDashboard | usersApi, usePermissions (usa ui/Button) |
| TrialExpiredPaywallModal | TrialExpiredPaywallModal | 173 | 1: LoginPage | plansApi (tipo) |
| **VouchersPanel** | VouchersPanel | 505 | **0c** | vouchersApi, ctx |
| WaitlistPanel | WaitlistPanel | 367 | 1: StaffDashboard | waitlistApi, ctx |
| WeatherForecastWidget | WeatherForecastWidget | 270 | 1: FinancialDashboard | financialApi, apiClient |
| **WhatsAppAIPanel** | WhatsAppAIPanel | 367 | **0c** | whatsappAiApi, ctx |
| admin/AdminLayout | AdminLayout | 129 | 1: App (dynamic import) | AuthContext, ui/ThemeToggle |
| products/CatalogTemplateModal | CatalogTemplateModal | 101 | 1: ProductCatalogPanel | productsApi |
| products/ProductCatalogPanel | ProductCatalogPanel | 247 | 1: ProductsHub | productsApi, ctx |
| products/ProductFormModal | ProductFormModal | 506 | 1: ProductCatalogPanel | productsApi (+primitivos ui) |
| products/ProductReportsPanel | ProductReportsPanel | 181 | 1: ProductsHub | productsApi |
| products/ProductSalesPanel | ProductSalesPanel | 138 | 1: ProductsHub | productsApi, Auth |
| products/ProductStockPanel | ProductStockPanel | 299 | 1: ProductsHub | productsApi |
| products/RefundSaleModal | RefundSaleModal | 171 | 1: ProductSalesPanel | productsApi |
| products/productMoney.ts | productMoney + 4 mapas | 32 | painéis products | — |
| products/productStock.ts | labels/formatters (5 exports) | 54 | painéis products | productsApi (tipos) |
| skeletons/ (8 arquivos + index.ts) | 11 symbols | ~360 | barrel + OwnerFinancialPanel | ui/Skeleton |
| support/supportLabels.ts | 7 exports | 55 | trio support | supportApi (tipos) |
| support/SupportReportDetail | SupportReportDetail | 249 | 1: SupportPanel | supportApi (tipos) |
| support/SupportReportForm | SupportReportForm | 194 | 1: SupportPanel | supportApi |
| support/SupportReportList | SupportReportList | 122 | 1: SupportPanel | supportApi (tipos) |

## 4. Marketing + PWA

| arquivo | export | ~LOC | consumidores | flags |
|---|---|---|---|---|
| marketing/MarketingNav.tsx | MarketingNav | 177 | 12 páginas marketing | ⚠️ AuthContext, ui/Logo |
| marketing/MarketingFooter.tsx | MarketingFooter | 143 | 12 páginas marketing | ⚠️ config/brand, ui/Logo |
| marketing/SeoHead.tsx | SeoHead | 79 | 11 páginas marketing | marketing/siteUrl |
| marketing/PricingPersuasionCharts.tsx | PricingPersuasionCharts | 290 | 1: PlansPage | ui/chart, trialCampaign |
| pwa/PwaInstallCard.tsx | PwaInstallCard | 169 | 1: StaffDashboard | ⚠️ PwaInstallContext |
| pwa/PwaUpdatePrompt.tsx | PwaUpdatePrompt | 76 | 1: App | `virtual:pwa-register/react` |

`pages/marketing/` não tem diretório compartilhado de componentes; componentes locais não exportados: `PhoneMockup` (definido em AiPredictivePage **e** FeaturesPage), Prediction/WaitTime/Revenue/EngagementPhone, PainSolution, QueueSimulation, DashboardMini, ContactSchema.

## 5. Análise de duplicação

### 5.1 Botões
- **783 tags `<button>` em 137 arquivos**; apenas **4 importam `ui/Button`** (CashPanel, ServiceManager, TeamManager, StaffDashboard) → **134 arquivos fazem botão manual**.
- Token divergente: `Button` usa `bg-action-primary` (2 ocorrências no repo, ambas dentro do Button); o de-facto é `bg-accent text-accent-fg` (22×/14 files) + `hover:bg-accent-hover` (70× total).
- Piores (`<button>`): MasterAdminDashboard **28**, OwnerFinancialPanel **27**, BillingTab **25**, PostEditor **23**, ClientProfileSheet **19**, RecurringPackagesPanel/AppointmentCalendar **18**, LoginPage **17**, FormsPanel/StaffManagementPanel/EquipmentPanel **15**.
- Receitas repetidas: secondary `border border-border px-N` **78×/35 files**; botão-ícone `rounded-lg|xl p-1|2` **36×/26**; `disabled:opacity-50` **109×/54**; `animate-spin` inline **172×/83**.
- Mapas de classes re-declarados fora de ui/: `SystemStatePage.actionClassName`, `CookieConsent` (2), `PaginationBar`, `SectionError`, rodapés de `ConfirmDialog`/`PromptModal`.

### 5.2 Inputs/fields
- **350 tags `<input|textarea|select>`**; `ui/Field` importado por **30 files**; **45 files com inputs nunca importam Field**; `FIELD_CONTROL` referenciado **250×/20**; receita crua `rounded-lg border border-border bg-bg` **46×/20**.
- Piores sem Field: LoginPage 14, CheckoutPage 11, SettingsManager 11, CatalogManager 10, FiscalPanel 10, MasterAdminDashboard 9, BillingTab 8, PostEditor 6, PurchasingPanel 6, CrmIntelligencePanel 5, QualityPanel 5, CorporatePanel 5, credit-card-form 5, RetailCheckoutBlock 4, AppointmentBookingModal 4, ContactPage 4.
- `QueueAlertSettings.tsx` inventa receita própria de input (3×).
- Adotantes pesados e consistentes: OwnerFinancialPanel 26/27, EquipmentPanel 17/17, IntegrationsPanel 15/16, DepositPolicyPanel 12/10, VouchersPanel 10/11, ProductFormModal 9/15.
- Inputs genéricos existentes: `Field`, `PasswordInput`, `CurrencyInput`, `ConsentCheckbox`, `SmartSelect` (`credit-card-form` é 0c).

### 5.3 Cards / modais / tabs / tooltips
- **Cards:** não existe `Card` genérico; shell `rounded-xl border border-border bg-surface` = **99×/49 files**.
- **Modais:** genéricos = `ConfirmDialog` + `PromptModal` (shell portal+FocusLock+`z-[110]` idêntico); `fixed inset-0` **58×**, mas só **14 `createPortal`** e **16 `aria-modal`** → maioria dos overlays sem portal/a11y inconsistente; **22 files** constroem overlay ad-hoc (lista completa no inventário bruto); 9 domain `*Modal.tsx` reimplementam o shell.
- **Tabs:** sem componente Tabs; `role="tab"` **4× (2 files)**; `activeTab` **110×** (hand-rolled em CatalogManager 10, ClientPortalDashboard 12, ProductsHub 5…); hosts: StaffDashboard 38, StaffNavigation (registry-driven).
- **Tooltips:** sem Tooltip genérico; só Recharts (chart.tsx, FinancialDashboard 12, PricingPersuasionCharts 10, CrmIntelligence 8, MasterAdminDashboard 6, ProfitEngine 4); demais usa `title=` nativo.
- **Toast:** `ui/Toast` (manual, sem provider) vs toasts ad-hoc `fixed top-4` em painéis → não existe ToastContext.
- **Nomes duplicados:** nenhum export homônimo; não-componentes: `PhoneMockup` (2 páginas), `OBJECTIVES`+`DRAFT_VERSION` (PostEditor ∥ PostsManager), planos `ESSENTIAL_MONTHLY`… (PricingPersuasionCharts ∥ PlansPage), `CONTACT_EMAIL` (3 páginas).

### 5.4 Sistemas paralelos (estado vazio/loading/error)
- 3 padrões concorrentes: `EmptyState` (18 LOC; consumidores reais: EquipmentPanel, RecurringPackagesPanel, WaitlistPanel), `SectionError` (30 LOC; **efeitivamente 0c** — único import é `DataTableState`), `DataTableState` (**0c**) e receitas inline espalhadas pelas páginas.
- Skeletons em sistema duplo: base em `ui/` (Skeleton/Table/Card/List/Form + barrel `skeletons.ts`) e composições em `domain/skeletons/` (8 arquivos + `index.ts`), ambas usando `--ag-*`.
- Stat cards inline: **99×/49 files** (sem componente único).

## 6. Barrils e testes

- **Barrels existentes (3):** `src/components/ui/skeletons.ts`, `src/components/domain/skeletons/index.ts`, `src/features/finance/index.ts`.
- **35 arquivos de teste (137 testes):** domain 7 (CategoryManager, CrmBackfillPanel, CrmMergePanel, MultiUnitDashboard, OrganizationsPanel, QueueItemCard, SupportPanel) · infra 3 (ErrorBoundary×2, ScrollToTop) · ui 4 (ConfirmDialog, Header, SmartSelect, StaffNavigation) · infra/api 6 (clientPortal, crm, goals, showcase, staff) · pages 7 (AccessBlocked, Checkout, Landing, Login, NotFound, Plans, PublicHome) · utils 7 · hooks 1 (useOrganizationDashboard) · marketing 1 (commercialPages).
- Ruído: diretórios `graphify-out/` gerados dentro de `src/components/ui/`, `src/pages/`, `src/pages/marketing/` — excluir do lint/tsconfig ou remover.
